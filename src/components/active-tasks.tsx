"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Square, 
  Clock, 
  Cpu, 
  MemoryStick, 
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';
import { getProcessList } from '@/lib/actions';

interface ActiveTasksProps {
  sessionId: string;
}

interface Task {
  pid: number;
  command: string;
  cpu: number;
  memory: number;
  startTime: string;
  status: 'running' | 'stopped' | 'zombie';
  user: string;
}

export function ActiveTasks({ sessionId }: ActiveTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const processData = await getProcessList(sessionId);
        setTasks(processData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 15000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-500">Running</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Stopped</Badge>;
      case 'zombie':
        return <Badge variant="destructive">Zombie</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const processData = await getProcessList(sessionId);
      setTasks(processData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKillProcess = (pid: number) => {
    console.log(`Killing process ${pid}`);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="animate-slide-in">
          <h2 className="text-2xl font-bold">Active Tasks</h2>
          <p className="text-muted-foreground">
            Monitor running processes and commands
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {lastUpdate && (
            <div className="text-sm text-muted-foreground animate-fade-in">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn-touch hover-lift transition-smooth"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="responsive-grid">
        <Card className="hover-lift transition-smooth glass-effect animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active processes
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth glass-effect animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.reduce((sum, task) => sum + task.cpu, 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Combined usage
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth glass-effect animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.reduce((sum, task) => sum + task.memory, 0).toFixed(1)} MB
            </div>
            <p className="text-xs text-muted-foreground">
              Total memory
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift transition-smooth glass-effect animate-fade-in">
        <CardHeader>
          <CardTitle>Process List</CardTitle>
          <CardDescription>
            All running processes and their resource usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64 animate-fade-in">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-96 scrollbar-thin mobile-scroll-smooth">
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={task.pid}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth hover-lift glass-effect animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4 flex-1 w-full sm:w-auto mb-2 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{task.pid}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.command}</div>
                        <div className="text-sm text-muted-foreground">
                          User: {task.user} • Started: {task.startTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-sm font-medium">{task.cpu}% CPU</div>
                        <div className="text-sm text-muted-foreground">{task.memory} MB</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleKillProcess(task.pid)}
                          className="text-destructive hover:text-destructive btn-touch hover-lift transition-smooth"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 