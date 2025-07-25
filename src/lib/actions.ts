"use server";
import { Client, ClientChannel, SFTPWrapper } from 'ssh2';
import { analyzeErrorAndSuggestFix } from "@/ai/flows/analyze-error-and-suggest-fix";
import { suggestNextSteps } from "@/ai/flows/suggest-next-steps";
import { getSystemStats as getSystemStatsFlow } from "@/ai/flows/get-system-stats";
import { suggestOptimizationTips } from "@/ai/flows/suggest-optimization-tips";
import { translateNaturalLanguageToCommand } from "@/ai/flows/translate-natural-language-to-command";
import type { CommandResult, SshCredentials, FileEntry, AnalyzeErrorAndSuggestFixInput, AnalyzeErrorAndSuggestFixOutput, SuggestNextStepsInput, SuggestNextStepsOutput, TranslateNaturalLanguageToCommandInput, TranslateNaturalLanguageToCommandOutput, SystemStats } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';
const riskyCommandRegex = /^\s*(rm -rf|chmod 777|dd\s)/;
interface SessionState {
    client: Client;
    activeStream: ClientChannel | null;
    commandOutput: string;
    isCommandRunning: boolean;
    commandIsError: boolean;
}
const sessions = new Map<string, SessionState>();
function getSession(sessionId: string): SessionState {
    const session = sessions.get(sessionId);
    if (!session) {
        throw new Error('Session not found or has expired.');
    }
    return session;
}
async function getSftpClient(sessionId: string): Promise<SFTPWrapper> {
    const session = getSession(sessionId);
    return new Promise((resolve, reject) => {
        session.client.sftp((err, sftp) => {
            if (err) {
                reject(err);
            } else {
                resolve(sftp);
            }
        });
    });
}
export async function connectSsh(credentials: SshCredentials): Promise<{ success: boolean; sessionId?: string; error?: string, osInfo?: string }> {
  const sessionId = uuidv4();
  const conn = new Client();
  const sessionState: SessionState = {
      client: conn,
      activeStream: null,
      commandOutput: '',
      isCommandRunning: false,
      commandIsError: false,
  };
  return new Promise((resolve) => {
    const handleClose = () => {
        sessions.delete(sessionId);
    };
    conn.on('ready', () => {
      sessions.set(sessionId, sessionState);
      conn.shell((err, stream) => {
        if (err) {
          resolve({ success: false, error: err.message });
            return;
        }
        sessionState.activeStream = stream;
        stream.on('data', (data: Buffer) => {
          sessionState.commandOutput += data.toString();
        }).stderr.on('data', (data: Buffer) => {
          sessionState.commandOutput += data.toString();
          sessionState.commandIsError = true;
        }).on('close', () => {
          sessionState.activeStream = null;
          sessionState.isCommandRunning = false;
        });
        stream.write('cat /etc/os-release\n');
        let osInfo = '';
        const osInfoHandler = (data: Buffer) => {
          osInfo += data.toString();
          if (osInfo.includes('PRETTY_NAME')) {
            stream.removeListener('data', osInfoHandler);
            resolve({ success: true, sessionId, osInfo });
          }
        };
        stream.on('data', osInfoHandler);
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    }).on('close', handleClose)
    .on('end', handleClose)
    .connect(credentials);
  });
}
export async function disconnectSsh(sessionId: string) {
    const session = sessions.get(sessionId);
    if (session) {
        session.client.end();
        sessions.delete(sessionId);
    }
}
async function runCommand(sessionId: string, command: string): Promise<string> {
    const session = getSession(sessionId);
    return new Promise((resolve, reject) => {
        let output = '';
        session.client.exec(command, (err, stream) => {
            if (err) return reject(err);
            stream.on('data', (data: Buffer) => {
                output += data.toString();
            }).stderr.on('data', (data: Buffer) => {
                output += data.toString();
            }).on('close', () => {
                resolve(output);
            });
        });
    });
}
export async function executeCommand(sessionId: string, command: string, force: boolean = false): Promise<Omit<CommandResult, 'output'>> {
  if (riskyCommandRegex.test(command) && !force) {
    return { command, isError: false, isRisky: true };
  }
  const session = getSession(sessionId);
  if (session.isCommandRunning) {
     return { command, isError: true };
  }
  session.commandOutput = '';
  session.isCommandRunning = true;
  session.commandIsError = false;
  if (!session.activeStream) {
    return { command, isError: true };
          }
  session.activeStream.write(command + '\n');
  return { command, isError: false };
}
export async function readFromPty(sessionId: string): Promise<{ output: string; isRunning: boolean; isError: boolean; }> {
    const session = getSession(sessionId);
    return {
        output: session.commandOutput,
        isRunning: session.isCommandRunning,
        isError: session.commandIsError,
    };
}
export async function writeToPty(sessionId: string, input: string): Promise<{success: boolean, error?: string}> {
    const session = getSession(sessionId);
    if (!session.activeStream || !session.isCommandRunning) {
        return { success: false, error: 'No active command is running.' };
    }
    return new Promise(resolve => {
        const commandToWrite = input.endsWith('\n') ? input : input + '\n';
        session.activeStream!.write(commandToWrite, 'utf8', (err) => {
            if (err) {
                return resolve({ success: false, error: err.message });
            }
            resolve({ success: true });
        });
    });
}
export async function sendSignal(sessionId: string, signal: 'INT' | 'KILL' | 'TERM'): Promise<{success: boolean, error?: string}> {
    const session = getSession(sessionId);
    if (!session.activeStream || !session.isCommandRunning) {
        return { success: false, error: 'No active command is running.' };
    }
    return new Promise(resolve => {
        session.activeStream!.signal(signal, (err) => {
            if (err) {
                return resolve({ success: false, error: err.message });
            }
            resolve({ success: true });
        });
    });
}
export async function listDirectory(sessionId: string, path: string): Promise<FileEntry[]> {
    const sftp = await getSftpClient(sessionId);
    return new Promise((resolve, reject) => {
        sftp.readdir(path, (err, list) => {
            sftp.end();
            if (err) {
                return reject(err);
            }
            const fileEntries: FileEntry[] = list.map(item => ({
                name: item.filename,
                isDirectory: item.longname.startsWith('d'),
                size: item.attrs.size,
                modified: new Date(item.attrs.mtime * 1000),
            }));
            resolve(fileEntries);
        });
    });
}
export async function readFile(sessionId: string, path: string): Promise<string> {
    const sftp = await getSftpClient(sessionId);
    return new Promise((resolve, reject) => {
        sftp.readFile(path, 'utf8', (err, data) => {
            sftp.end();
            if (err) return reject(err);
            resolve(data.toString());
        });
    });
}
export async function downloadFile(sessionId: string, path: string): Promise<string> {
    const sftp = await getSftpClient(sessionId);
    return new Promise((resolve, reject) => {
        sftp.readFile(path, (err, data) => {
            sftp.end();
            if (err) return reject(err);
            const base64Data = data.toString('base64');
            resolve(`data:application/octet-stream;base64,${base64Data}`);
        });
    });
}
export async function writeFile(sessionId: string, path: string, content: string): Promise<void> {
    const sftp = await getSftpClient(sessionId);
    return new Promise((resolve, reject) => {
        sftp.writeFile(path, content, 'utf8', (err) => {
            sftp.end();
            if (err) return reject(err);
            resolve();
        });
    });
}
export async function uploadFile(sessionId: string, path: string, fileDataUri: string): Promise<void> {
    const sftp = await getSftpClient(sessionId);
    const [meta, data] = fileDataUri.split(',');
    if (!meta || !data) throw new Error('Invalid data URI');
    const buffer = Buffer.from(data, 'base64');
    return new Promise((resolve, reject) => {
        const stream = sftp.createWriteStream(path);
        stream.on('close', () => {
            sftp.end();
            resolve();
        });
        stream.on('error', (err) => {
            sftp.end();
            reject(err);
        });
        stream.end(buffer);
    });
}
export async function deletePath(sessionId: string, path: string): Promise<void> {
    await executeCommand(sessionId, `rm -rf "${path}"`, true);
}
export async function renamePath(sessionId: string, oldPath: string, newPath: string): Promise<void> {
    const sftp = await getSftpClient(sessionId);
    return new Promise((resolve, reject) => {
        sftp.rename(oldPath, newPath, (err) => {
            sftp.end();
            if (err) return reject(err);
            resolve();
        });
    });
}
export async function getAiErrorSuggestion(input: AnalyzeErrorAndSuggestFixInput): Promise<AnalyzeErrorAndSuggestFixOutput> {
    if (!process.env.GOOGLE_API_KEY && !input.apiKey) {
      console.warn("Gemini API key not found in environment. Relying on client-provided key.");
    }
    try {
        return await analyzeErrorAndSuggestFix(input);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred with the AI assistant.";
        return {
            explanation: `Failed to get AI suggestion: ${errorMessage}`,
            suggestedFixes: []
        };
    }
}
export async function getAiContextSuggestion(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
     if (!process.env.GOOGLE_API_KEY && !input.apiKey) {
      console.warn("Gemini API key not found in environment. Relying on client-provided key.");
    }
    try {
        return await suggestNextSteps(input);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred with the AI assistant.";
        return {
            explanation: `Failed to get AI suggestion: ${errorMessage}`,
            bestPractices: "",
            nextSteps: ""
        };
    }
}
export async function translateToCommand(input: TranslateNaturalLanguageToCommandInput): Promise<TranslateNaturalLanguageToCommandOutput> {
     if (!process.env.GOOGLE_API_KEY && !input.apiKey) {
      console.warn("Gemini API key not found in environment. Relying on client-provided key.");
    }
    try {
        return await translateNaturalLanguageToCommand(input);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred with the AI assistant.";
        return {
            command: `echo "Error: ${errorMessage}"`
        };
    }
}
function parseSystemStats(rawOutput: string): SystemStats {
    const stats: SystemStats = {
        cpu: { usage: 0 },
        memory: { total: 0, used: 0 },
        disk: { total: 0, used: 0 },
    };
    const lines = rawOutput.split('\n');
    for (const line of lines) {
        if (line.includes('%Cpu(s)')) {
            const topCpuLine = line.match(/%Cpu\(s\):\s+([\d.]+) us,\s+([\d.]+) sy,/);
            if (topCpuLine) {
                stats.cpu.usage = parseFloat(topCpuLine[1]) + parseFloat(topCpuLine[2]);
            }
        } else if (line.includes('idle') && stats.cpu.usage === 0) {
            const topIdleLine = line.match(/(\d+\.?\d*)%? idle/);
            if (topIdleLine) {
                stats.cpu.usage = 100 - parseFloat(topIdleLine[1]);
            }
        }
        if (line.startsWith('Mem:')) {
            const freeLine = line.split(/\s+/);
            if (freeLine.length > 2) {
                stats.memory.total = parseInt(freeLine[1], 10);
                stats.memory.used = parseInt(freeLine[2], 10);
            }
        }
        if (line.endsWith(' /')) {
            const dfLine = line.split(/\s+/);
            if (dfLine.length > 3) {
                stats.disk.total = parseFloat(dfLine[1]);
                stats.disk.used = parseFloat(dfLine[2]);
            }
        }
    }
    return stats;
}
export async function getSystemStats(sessionId: string): Promise<SystemStats> {
    const commands = [
        'top -b -n 1',
        'df -BG /',
        'free -m'
    ].join(' && ');
    try {
        const rawOutput = await runCommand(sessionId, commands);
        return parseSystemStats(rawOutput);
    } catch (e) {
        console.error("Failed to execute system stat commands:", e);
        return {
            cpu: { usage: 0 },
            memory: { total: 0, used: 0 },
            disk: { total: 0, used: 0 },
        };
    }
}

export async function getProcessList(sessionId: string): Promise<any[]> {
    try {
        const rawOutput = await runCommand(sessionId, 'ps -eo pid,ppid,user,pcpu,pmem,cmd --no-headers | sort -k4 -nr | head -20');
        return parseProcessList(rawOutput);
    } catch (e) {
        console.error("Failed to execute process list command:", e);
        return [];
    }
}

function parseProcessList(rawOutput: string): any[] {
    const lines = rawOutput.split('\n');
    const processes: any[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(/\s+/);
        if (parts.length >= 6) {
            const pid = parseInt(parts[0], 10);
            const user = parts[2];
            const cpu = parseFloat(parts[3]) || 0;
            const memory = parseFloat(parts[4]) || 0;
            
            const command = parts.slice(5).join(' ');
            const displayCommand = command.length > 50 ? command.substring(0, 47) + '...' : command;
            
            processes.push({
                pid,
                command: displayCommand || 'Unknown',
                cpu,
                memory,
                startTime: 'N/A',
                status: 'running',
                user
            });
        }
    }
    
    return processes;
}
