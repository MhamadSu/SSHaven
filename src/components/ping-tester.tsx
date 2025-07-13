"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, 
  Play, 
  Square, 
  Activity, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Wifi,
  Loader2
} from 'lucide-react';
import type { SessionInfo } from '@/lib/types';

interface PingTesterProps {
  currentSession: SessionInfo | null;
}

interface PingResult {
  sequence: number;
  time: number;
  status: 'success' | 'timeout' | 'error';
  timestamp: Date;
}

interface PingStats {
  sent: number;
  received: number;
  lost: number;
  minTime: number;
  maxTime: number;
  avgTime: number;
  lossPercentage: number;
}

export function PingTester({ currentSession }: PingTesterProps) {
  const [target, setTarget] = useState(currentSession?.credentials.host || '');
  const [isPinging, setIsPinging] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);
  const [stats, setStats] = useState<PingStats>({
    sent: 0,
    received: 0,
    lost: 0,
    minTime: 0,
    maxTime: 0,
    avgTime: 0,
    lossPercentage: 0
  });

  // Update target when session changes
  useEffect(() => {
    if (currentSession?.credentials.host && !target) {
      setTarget(currentSession.credentials.host);
    }
  }, [currentSession, target]);

  const commonTargets = [
    ...(currentSession ? [{ 
      name: `Connected Server (${currentSession.credentials.username}@${currentSession.credentials.host})`, 
      target: currentSession.credentials.host 
    }] : []),
    { name: 'Google DNS', target: '8.8.8.8' },
    { name: 'Cloudflare DNS', target: '1.1.1.1' },
    { name: 'Google', target: 'google.com' },
    { name: 'GitHub', target: 'github.com' },
  ];

  const simulatePing = async () => {
    if (!target) return;
    
    setIsPinging(true);
    setResults([]);
    setStats({
      sent: 0,
      received: 0,
      lost: 0,
      minTime: 0,
      maxTime: 0,
      avgTime: 0,
      lossPercentage: 0
    });

    const newResults: PingResult[] = [];
    let sequence = 1;

    const pingInterval = setInterval(() => {
      // Simulate ping with realistic results
      const random = Math.random();
      const responseTime = Math.floor(Math.random() * 200) + 10; // 10-210ms
      
      let status: 'success' | 'timeout' | 'error';
      if (random > 0.95) {
        status = 'timeout';
      } else if (random > 0.98) {
        status = 'error';
      } else {
        status = 'success';
      }

      const result: PingResult = {
        sequence,
        time: status === 'success' ? responseTime : 0,
        status,
        timestamp: new Date()
      };

      newResults.push(result);
      
      // Calculate stats
      const sent = sequence;
      const received = newResults.filter(r => r.status === 'success').length;
      const lost = sent - received;
      const successTimes = newResults.filter(r => r.status === 'success').map(r => r.time);
      
      const newStats: PingStats = {
        sent,
        received,
        lost,
        minTime: successTimes.length > 0 ? Math.min(...successTimes) : 0,
        maxTime: successTimes.length > 0 ? Math.max(...successTimes) : 0,
        avgTime: successTimes.length > 0 ? Math.round(successTimes.reduce((a, b) => a + b, 0) / successTimes.length) : 0,
        lossPercentage: Math.round((lost / sent) * 100)
      };

      setResults([...newResults]);
      setStats(newStats);
      
      sequence++;
      
      if (sequence > 10) {
        clearInterval(pingInterval);
        setIsPinging(false);
      }
    }, 1000);
  };

  const stopPing = () => {
    setIsPinging(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'timeout':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'timeout':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getLatencyColor = (time: number) => {
    if (time < 50) return 'text-green-500';
    if (time < 100) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
      {/* Configuration Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Ping Test Configuration
          </CardTitle>
          <CardDescription>
            Test network connectivity and latency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Host</label>
            <Input
              placeholder="Enter IP or hostname"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isPinging}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Targets</label>
            <div className="grid grid-cols-1 gap-2">
              {commonTargets.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setTarget(item.target)}
                  disabled={isPinging}
                  className="justify-start"
                >
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.target}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={simulatePing}
              disabled={isPinging || !target}
              className="flex-1"
            >
              {isPinging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Pinging...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Ping
                </>
              )}
            </Button>
            {isPinging && (
              <Button
                variant="outline"
                onClick={stopPing}
                size="icon"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ping Results
          </CardTitle>
          <CardDescription>
            Network latency and connectivity statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{stats.sent}</div>
              <div className="text-sm text-muted-foreground">Sent</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{stats.received}</div>
              <div className="text-sm text-muted-foreground">Received</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{stats.lossPercentage}%</div>
              <div className="text-sm text-muted-foreground">Loss</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <div className={`text-2xl font-bold ${getLatencyColor(stats.avgTime)}`}>
                {stats.avgTime}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Time</div>
            </div>
          </div>

          {/* Latency Stats */}
          {stats.received > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className={`text-lg font-bold ${getLatencyColor(stats.minTime)}`}>
                  {stats.minTime}ms
                </div>
                <div className="text-xs text-muted-foreground">Min</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className={`text-lg font-bold ${getLatencyColor(stats.avgTime)}`}>
                  {stats.avgTime}ms
                </div>
                <div className="text-xs text-muted-foreground">Avg</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className={`text-lg font-bold ${getLatencyColor(stats.maxTime)}`}>
                  {stats.maxTime}ms
                </div>
                <div className="text-xs text-muted-foreground">Max</div>
              </div>
            </div>
          )}

          {/* Results List */}
          <ScrollArea className="h-80">
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">
                          Sequence {result.sequence}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.status === 'success' && (
                        <div className={`text-sm font-medium ${getLatencyColor(result.time)}`}>
                          {result.time}ms
                        </div>
                      )}
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(result.status)} capitalize`}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div>No ping results yet</div>
                <div className="text-sm">Enter a target and start ping test</div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 