'use server';

import type { GetSystemStatsInput, SystemStats } from '@/lib/types';

export async function getSystemStats(input: GetSystemStatsInput): Promise<SystemStats> {
  const { rawOutput } = input;
  const output: SystemStats = {
    cpu: { usage: 0 },
    memory: { total: 0, used: 0 },
    disk: { total: 0, used: 0 },
  };

  const topMatch = rawOutput.match(/%Cpu\(s\):\s*([\d.]+)\s*us,\s*([\d.]+)\s*sy,\s*[\d.]+\s*ni,\s*([\d.]+)\s*id/);
  if (topMatch) {
    const userCpu = parseFloat(topMatch[1]);
    const systemCpu = parseFloat(topMatch[2]);
    output.cpu.usage = userCpu + systemCpu;
  }

  const freeMatch = rawOutput.match(/Mem:\s*(\d+)\s*total,\s*(\d+)\s*used,\s*(\d+)\s*free/);
  if (freeMatch) {
    output.memory.total = parseInt(freeMatch[1]) / 1024;
    output.memory.used = parseInt(freeMatch[2]) / 1024;
  }

  const dfMatch = rawOutput.match(/\/dev\/.*\s+(\d+)\s+(\d+)\s+(\d+)\s+\d+%\s+\/$/);
  if (dfMatch) {
    output.disk.total = parseInt(dfMatch[1]) / (1024 * 1024);
    output.disk.used = parseInt(dfMatch[2]) / (1024 * 1024);
  }

  return output;
}
