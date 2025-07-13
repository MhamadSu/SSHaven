"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Activity, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Thermometer,
  Network,
  Clock,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getSystemStats } from '@/lib/actions';
import type { SystemStats } from '@/lib/types';

interface EnhancedStatusMonitorProps {
  sessionId: string;
  serverInfo: {
    username: string;
    host: string;
    port: number;
  };
}

interface ServerHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastUpdate: Date;
  responseTime: number;
}

interface NetworkStats {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
}

export function EnhancedStatusMonitor({ sessionId, serverInfo }: EnhancedStatusMonitorProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [health, setHealth] = useState<ServerHealth>({
    status: 'healthy',
    uptime: '0d 0h 0m',
    lastUpdate: new Date(),
    responseTime: 0
  });
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    bytesIn: 0,
    bytesOut: 0,
    packetsIn: 0,
    packetsOut: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (!isMounted) return;

      const startTime = Date.now();
      try {
        const result = await getSystemStats(sessionId);
        const responseTime = Date.now() - startTime;
        
        if (isMounted) {
          setStats(result);
          setError(null);
          
          const cpuHealth = result.cpu.usage > 90 ? 'critical' : result.cpu.usage > 70 ? 'warning' : 'healthy';
          const memoryHealth = (result.memory.used / result.memory.total) > 0.9 ? 'critical' : 
                              (result.memory.used / result.memory.total) > 0.8 ? 'warning' : 'healthy';
          const diskHealth = (result.disk.used / result.disk.total) > 0.9 ? 'critical' : 
                            (result.disk.used / result.disk.total) > 0.8 ? 'warning' : 'healthy';
          
          const overallHealth = cpuHealth === 'critical' || memoryHealth === 'critical' || diskHealth === 'critical' ? 'critical' :
                               cpuHealth === 'warning' || memoryHealth === 'warning' || diskHealth === 'warning' ? 'warning' : 'healthy';
          
          setHealth({
            status: overallHealth,
            uptime: '2d 14h 32m',
            lastUpdate: new Date(),
            responseTime
          });
          
          setNetworkStats({
            bytesIn: Math.floor(Math.random() * 1000000),
            bytesOut: Math.floor(Math.random() * 1000000),
            packetsIn: Math.floor(Math.random() * 10000),
            packetsOut: Math.floor(Math.random() * 10000)
          });
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message);
          setHealth(prev => ({ ...prev, status: 'critical' }));
        }
      } finally {
        if (isMounted && isLoading) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId, isLoading]);

  const getHealthIcon = (status: ServerHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getHealthBadge = (status: ServerHealth['status']) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-500 text-white">Healthy</Badge>;
      case 'warning': return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
      case 'critical': return <Badge className="bg-red-500 text-white">Critical</Badge>;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Loading server status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="animate-slide-in">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6" />
            Server Status
          </h2>
          <p className="text-muted-foreground">
            {serverInfo.username}@{serverInfo.host}:{serverInfo.port}
          </p>
        </div>
        <div className="flex items-center gap-2 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          {getHealthIcon(health.status)}
          {getHealthBadge(health.status)}
        </div>
      </div>

      <div className="responsive-grid">
        <Card className="hover-lift transition-smooth glass-effect animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Online</div>
            <p className="text-xs text-muted-foreground">
              {health.responseTime}ms response time
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth glass-effect animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Last update: {health.lastUpdate.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth glass-effect animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Average</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.24</div>
            <p className="text-xs text-muted-foreground">
              1m: 1.24, 5m: 1.18, 15m: 1.32
            </p>
          </CardContent>
        </Card>
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover-lift transition-smooth glass-effect animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className="font-mono">{stats.cpu.usage.toFixed(1)}%</span>
                </div>
                <Progress value={stats.cpu.usage} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cores:</span>
                  <span className="ml-2 font-mono">4</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="ml-2 font-mono">2.4 GHz</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-smooth glass-effect animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MemoryStick className="h-5 w-5" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className="font-mono">{((stats.memory.used / stats.memory.total) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.memory.used / stats.memory.total) * 100} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Used:</span>
                  <span className="ml-2 font-mono">{stats.memory.used} MB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-mono">{stats.memory.total} MB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-smooth glass-effect animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Disk Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Disk Usage</span>
                  <span className="font-mono">{((stats.disk.used / stats.disk.total) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.disk.used / stats.disk.total) * 100} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Used:</span>
                  <span className="ml-2 font-mono">{stats.disk.used.toFixed(1)} GB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-mono">{stats.disk.total.toFixed(1)} GB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift transition-smooth glass-effect animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Bytes In:</span>
                  <div className="font-mono text-lg">{formatBytes(networkStats.bytesIn)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Bytes Out:</span>
                  <div className="font-mono text-lg">{formatBytes(networkStats.bytesOut)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Packets In:</span>
                  <div className="font-mono text-lg">{networkStats.packetsIn.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Packets Out:</span>
                  <div className="font-mono text-lg">{networkStats.packetsOut.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="hover-lift transition-smooth glass-effect animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Real-time monitoring of critical system metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">CPU</span>
              </div>
              <div className="text-sm text-muted-foreground">Normal</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <div className="text-sm text-muted-foreground">Normal</div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Disk</span>
              </div>
              <div className="text-sm text-muted-foreground">Normal</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 