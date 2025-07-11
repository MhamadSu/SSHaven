'use server';
/**
 * @fileOverview Parses raw system command output into structured system statistics.
 *
 * - getSystemStats - A function that handles parsing the system stats.
 */

import type { GetSystemStatsInput, GetSystemStatsOutput } from '@/lib/types';

// Modified to remove AI dependency and parse system stats directly without API calls
export async function getSystemStats(input: GetSystemStatsInput): Promise<GetSystemStatsOutput> {
  const { rawOutput } = input;
  const output: GetSystemStatsOutput = {
    cpu: { user: 0, system: 0, idle: 0 },
    memory: { totalMb: 0, usedMb: 0, freeMb: 0 },
    disk: { totalGb: 0, usedGb: 0, freeGb: 0 },
  };

  // Parse 'top' output for CPU
  const topMatch = rawOutput.match(/%Cpu\(s\):\s*([\d.]+)\s*us,\s*([\d.]+)\s*sy,\s*[\d.]+\s*ni,\s*([\d.]+)\s*id/);
  if (topMatch) {
    output.cpu.user = parseFloat(topMatch[1]);
    output.cpu.system = parseFloat(topMatch[2]);
    output.cpu.idle = parseFloat(topMatch[3]);
  }

  // Parse 'free' output for Memory
  const freeMatch = rawOutput.match(/Mem:\s*(\d+)\s*total,\s*(\d+)\s*used,\s*(\d+)\s*free/);
  if (freeMatch) {
    output.memory.totalMb = parseInt(freeMatch[1]) / 1024; // Convert kB to MB
    output.memory.usedMb = parseInt(freeMatch[2]) / 1024;
    output.memory.freeMb = parseInt(freeMatch[3]) / 1024;
  }

  // Parse 'df' output for Disk
  const dfMatch = rawOutput.match(/\/dev\/.*\s+(\d+)\s+(\d+)\s+(\d+)\s+\d+%\s+\/$/);
  if (dfMatch) {
    output.disk.totalGb = parseInt(dfMatch[1]) / (1024 * 1024); // Convert blocks to GB
    output.disk.usedGb = parseInt(dfMatch[2]) / (1024 * 1024);
    output.disk.freeGb = parseInt(dfMatch[3]) / (1024 * 1024);
  }

  return output;
}
