"use client";

import { useState, useEffect, useMemo } from 'react';
import { getSystemStats } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { SystemStats } from '@/lib/types';
import { ServerCrash, Cpu, MemoryStick, HardDrive } from 'lucide-react';

type SystemMonitorProps = {
    sessionId: string;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))'];

export function SystemMonitor({ sessionId }: SystemMonitorProps) {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchStats = async () => {
            if (!isMounted) return;

            try {
                const result = await getSystemStats(sessionId);
                if (isMounted) {
                    setStats(result);
                    setError(null);
                }
            } catch (e: any) {
                if (isMounted) {
                    console.error("Failed to fetch system stats, will retry:", e.message);
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
    }, [sessionId]);

    const memoryData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Used', value: stats.memory.used },
            { name: 'Free', value: stats.memory.total - stats.memory.used },
        ];
    }, [stats]);

    const diskData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: 'Used', value: stats.disk.used },
            { name: 'Free', value: stats.disk.total - stats.disk.used },
        ];
    }, [stats]);


    if (isLoading) {
        return (
            <Card className="border-b rounded-none shadow-none bg-card/30 animate-fade-in">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                    <div className="loading-skeleton h-4 w-32 mx-auto rounded"></div>
                    <p className="mt-2">Loading system stats...</p>
                </CardContent>
            </Card>
        );
    }
    
    if (!stats) {
        return (
            <Card className="border-b rounded-none shadow-none bg-destructive/10 animate-fade-in">
                <CardContent className="p-4 flex items-center gap-4 text-destructive">
                    <ServerCrash className="h-6 w-6"/>
                    <div>
                        <p className="font-bold">Error</p>
                        <p className="text-sm">Could not fetch initial system stats. Retrying in background...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-b rounded-none shadow-none bg-card/30 glass-effect animate-fade-in">
            <CardContent className="p-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 hover-lift transition-smooth glass-effect animate-scale-in">
                        <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            <Cpu className="h-4 w-4 text-primary"/>
                            <span className="hidden sm:inline">CPU</span>
                        </h4>
                        <p className="text-2xl font-bold font-mono terminal-font">{stats.cpu.usage.toFixed(1)}%</p>
                        <Progress value={stats.cpu.usage} className="h-1.5 mt-2 w-full" />
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 hover-lift transition-smooth glass-effect animate-scale-in" style={{ animationDelay: '0.1s' }}>
                         <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            <MemoryStick className="h-4 w-4 text-primary"/>
                            <span className="hidden sm:inline">Memory</span>
                         </h4>
                         <div className="h-12 w-12">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={memoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={14} outerRadius={20} paddingAngle={2} startAngle={90} endAngle={450}>
                                        {memoryData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}/>
                                </PieChart>
                            </ResponsiveContainer>
                         </div>
                         <p className="text-xs text-muted-foreground mt-1 truncate">{stats.memory.used}MB / {stats.memory.total}MB</p>
                    </div>
                     <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-background/50 hover-lift transition-smooth glass-effect animate-scale-in" style={{ animationDelay: '0.2s' }}>
                         <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            <HardDrive className="h-4 w-4 text-primary"/>
                            <span className="hidden sm:inline">Disk</span>
                         </h4>
                          <div className="h-12 w-12">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={diskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={14} outerRadius={20} paddingAngle={2} startAngle={90} endAngle={450}>
                                        {diskData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}/>
                                </PieChart>
                            </ResponsiveContainer>
                         </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{stats.disk.used.toFixed(1)}GB / {stats.disk.total.toFixed(1)}GB</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
