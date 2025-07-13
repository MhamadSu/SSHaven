"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Target, 
  Play, 
  Square, 
  Shield, 
  ShieldCheck, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import type { SessionInfo } from '@/lib/types';

interface PortScannerProps {
  currentSession: SessionInfo | null;
}

interface ScanResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
  responseTime: number;
}

export function PortScanner({ currentSession }: PortScannerProps) {
  const [target, setTarget] = useState(currentSession?.credentials.host || '');
  const [portRange, setPortRange] = useState('20-1000');

  // Update target when session changes
  useEffect(() => {
    if (currentSession?.credentials.host && !target) {
      setTarget(currentSession.credentials.host);
    }
  }, [currentSession, target]);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanStats, setScanStats] = useState({
    total: 0,
    scanned: 0,
    open: 0,
    closed: 0,
    filtered: 0
  });

  const commonPorts = [
    { port: 21, service: 'FTP' },
    { port: 22, service: 'SSH' },
    { port: 23, service: 'Telnet' },
    { port: 25, service: 'SMTP' },
    { port: 53, service: 'DNS' },
    { port: 80, service: 'HTTP' },
    { port: 110, service: 'POP3' },
    { port: 143, service: 'IMAP' },
    { port: 443, service: 'HTTPS' },
    { port: 993, service: 'IMAPS' },
    { port: 995, service: 'POP3S' },
    { port: 3389, service: 'RDP' },
  ];

  const handleQuickScan = (ports: string) => {
    setPortRange(ports);
    setTarget(target || 'localhost');
  };

  const simulatePortScan = async () => {
    if (!target) return;
    
    setIsScanning(true);
    setResults([]);
    setProgress(0);

    const [startPort, endPort] = portRange.split('-').map(Number);
    const totalPorts = endPort - startPort + 1;
    
    setScanStats({
      total: totalPorts,
      scanned: 0,
      open: 0,
      closed: 0,
      filtered: 0
    });

    const newResults: ScanResult[] = [];
    
    for (let port = startPort; port <= endPort; port++) {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Simulate port scan results
      const isCommonPort = commonPorts.some(p => p.port === port);
      const random = Math.random();
      
      let status: 'open' | 'closed' | 'filtered';
      if (isCommonPort && random > 0.7) {
        status = 'open';
      } else if (random > 0.8) {
        status = 'filtered';
      } else {
        status = 'closed';
      }

      const result: ScanResult = {
        port,
        status,
        service: commonPorts.find(p => p.port === port)?.service,
        responseTime: Math.floor(Math.random() * 500) + 10
      };

      newResults.push(result);
      
      const scannedCount = port - startPort + 1;
      const openCount = newResults.filter(r => r.status === 'open').length;
      const closedCount = newResults.filter(r => r.status === 'closed').length;
      const filteredCount = newResults.filter(r => r.status === 'filtered').length;
      
      setScanStats({
        total: totalPorts,
        scanned: scannedCount,
        open: openCount,
        closed: closedCount,
        filtered: filteredCount
      });

      setResults([...newResults]);
      setProgress((scannedCount / totalPorts) * 100);
    }

    setIsScanning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'filtered':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'closed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'filtered':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
      {/* Configuration Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Port Scanner Configuration
          </CardTitle>
          <CardDescription>
            {currentSession ? 
              `Scan ports on ${currentSession.credentials.host}` : 
              'Configure target and port range for scanning'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Host</label>
            <Input
              placeholder="Enter IP or hostname"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isScanning}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Port Range</label>
            <Input
              placeholder="e.g., 20-1000"
              value={portRange}
              onChange={(e) => setPortRange(e.target.value)}
              disabled={isScanning}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Scans</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickScan('21-25')}
                disabled={isScanning}
              >
                Basic Services
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickScan('80,443,8080,8443')}
                disabled={isScanning}
              >
                Web Services
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickScan('20-1000')}
                disabled={isScanning}
              >
                Common Ports
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickScan('1-65535')}
                disabled={isScanning}
              >
                Full Scan
              </Button>
            </div>
          </div>

          <Button
            onClick={simulatePortScan}
            disabled={isScanning || !target}
            className="w-full"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Scan
              </>
            )}
          </Button>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-xs text-muted-foreground">
                Scanned {scanStats.scanned} of {scanStats.total} ports
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Scan Results
          </CardTitle>
          <CardDescription>
            Port scan results and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{scanStats.scanned}</div>
              <div className="text-sm text-muted-foreground">Scanned</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{scanStats.open}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </div>
            <div className="text-center p-3 bg-red-500/10 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{scanStats.closed}</div>
              <div className="text-sm text-muted-foreground">Closed</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{scanStats.filtered}</div>
              <div className="text-sm text-muted-foreground">Filtered</div>
            </div>
          </div>

          {/* Results List */}
          <ScrollArea className="h-96">
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
                        <div className="font-medium">Port {result.port}</div>
                        {result.service && (
                          <div className="text-sm text-muted-foreground">
                            {result.service}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        {result.responseTime}ms
                      </div>
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
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div>No scan results yet</div>
                <div className="text-sm">Configure target and start a scan</div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 