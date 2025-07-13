"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Globe, 
  Network,
  Wifi,
  Activity,
  Shield,
  Clock,
  ChevronRight,
  Zap,
  Settings,
  BarChart3,
  Signal
} from 'lucide-react';
import { PortScanner } from '@/components/port-scanner';
import { PingTester } from '@/components/ping-tester';
import type { SessionInfo } from '@/lib/types';

interface NetworkingToolsProps {
  currentSession: SessionInfo | null;
}

export function NetworkingTools({ currentSession }: NetworkingToolsProps) {
  const [activeTab, setActiveTab] = useState("port-scanner");

  const tools = [
    {
      id: "port-scanner",
      label: "Port Scanner",
      icon: Target,
      description: "Discover open ports and services on target hosts",
      color: "text-blue-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/20",
      borderColor: "border-blue-500/20",
      needsSession: false,
      stats: "Security Analysis"
    },
    {
      id: "ping-tester", 
      label: "Ping Tester",
      icon: Globe,
      description: "Test network connectivity and measure latency",
      color: "text-green-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-green-600/20",
      borderColor: "border-green-500/20",
      needsSession: false,
      stats: "Network Diagnostics"
    }
  ];

  const getConnectionStatus = () => {
    if (!currentSession) {
      return {
        status: "Standalone Mode",
        description: "Tools available without server connection",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        icon: Activity
      };
    }
    return {
      status: "Connected",
      description: `${currentSession.credentials.username}@${currentSession.credentials.host}`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      icon: Wifi
    };
  };

  const connectionInfo = getConnectionStatus();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/50 to-muted/30">
        {/* Enhanced Header */}
        <div className="p-8 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div className="space-y-2 animate-slide-in">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl backdrop-blur-sm">
                    <Network className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Network Tools
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Professional network diagnostic and testing suite
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status Card */}
              <Card className="glass-effect border-0 shadow-lg hover-lift transition-smooth animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${connectionInfo.bgColor}`}>
                      <connectionInfo.icon className={`h-5 w-5 ${connectionInfo.color}`} />
                    </div>
                    <div>
                      <div className={`font-semibold ${connectionInfo.color}`}>
                        {connectionInfo.status}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {connectionInfo.description}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tool Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {tools.map((tool, index) => (
                <Card 
                  key={tool.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 glass-effect animate-scale-in ${
                    activeTab === tool.id 
                      ? `${tool.borderColor} shadow-lg ring-2 ring-primary/20` 
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                  onClick={() => setActiveTab(tool.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${tool.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <tool.icon className={`h-6 w-6 ${tool.color}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {tool.label}
                          </CardTitle>
                          <ChevronRight className={`h-5 w-5 transition-all duration-300 ${
                            activeTab === tool.id ? 'rotate-90 text-primary' : 'text-muted-foreground group-hover:text-primary'
                          }`} />
                        </div>
                        <CardDescription className="text-sm leading-relaxed">
                          {tool.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {tool.stats}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Signal className="h-3 w-3 mr-1" />
                            Ready
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Enhanced Tool Interface */}
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Enhanced Tabs */}
                <TabsList className="grid w-full grid-cols-2 h-14 p-1 glass-effect border-0 shadow-lg">
                  {tools.map((tool) => (
                    <TabsTrigger 
                      key={tool.id} 
                      value={tool.id}
                      className="flex items-center gap-3 text-sm font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted/50"
                    >
                      <tool.icon className="h-4 w-4" />
                      {tool.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {/* Tool Content */}
                <div className="mt-6">
                  <TabsContent value="port-scanner" className="animate-fade-in">
                    <div className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 glass-effect">
                      <PortScanner currentSession={currentSession} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ping-tester" className="animate-fade-in">
                    <div className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 glass-effect">
                      <PingTester currentSession={currentSession} />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 