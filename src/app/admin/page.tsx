"use client";

import { useState, useEffect } from 'react';

interface HealthData {
  status: string;
  timestamp: string;
  services: {
    database: { status: string; responseTime: string };
    redis: { status: string; responseTime: string };
  };
  stats: {
    totalUsers: number;
    totalMessages: number;
  };
}

interface UsageStats {
  activeConnections: number;
  messagesPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
}

export default function AdminPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError('Failed to fetch health data');
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setUsageStats(data);
    } catch (err) {
      setError('Failed to fetch usage stats');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchHealthData(), fetchUsageStats()]);
      setLoading(false);
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-dark-300">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              System Monitor
            </span>
          </h1>
          <p className="text-dark-300">Real-time system health and usage statistics</p>
        </div>

        {error && (
          <div className="card card-elevated mb-8 border-red-500/20 bg-red-500/5">
            <div className="text-red-400 text-center py-4">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <div className="card card-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-400">System Health</h3>
                <p className="text-sm text-dark-400">Service status and response times</p>
              </div>
            </div>

            {healthData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${healthData.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium">Overall Status</span>
                  </div>
                  <span className={`font-semibold ${healthData.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                    {healthData.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                    <span className="text-dark-300">Database</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-dark-400">{healthData.services.database.responseTime}</span>
                      <div className={`w-2 h-2 rounded-full ${healthData.services.database.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
                    <span className="text-dark-300">Redis Cache</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-dark-400">{healthData.services.redis.responseTime}</span>
                      <div className={`w-2 h-2 rounded-full ${healthData.services.redis.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-dark-500 text-center pt-2">
                  Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400">
                <div className="loading-dots mb-2">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Loading health data...
              </div>
            )}
          </div>

          {/* Usage Statistics */}
          <div className="card card-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-400">Usage Statistics</h3>
                <p className="text-sm text-dark-400">Real-time usage metrics</p>
              </div>
            </div>

            {usageStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-400">{usageStats.activeConnections}</div>
                    <div className="text-sm text-dark-400">Active Connections</div>
                  </div>
                  <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-secondary-400">{usageStats.messagesPerMinute}</div>
                    <div className="text-sm text-dark-400">Messages/Min</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-accent-400">{usageStats.averageResponseTime}ms</div>
                    <div className="text-sm text-dark-400">Avg Response</div>
                  </div>
                  <div className="text-center p-4 bg-dark-800/50 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-400">{usageStats.errorRate}%</div>
                    <div className="text-sm text-dark-400">Error Rate</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400">
                <div className="loading-dots mb-2">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Loading usage data...
              </div>
            )}
          </div>

          {/* Database Stats */}
          {healthData && (
            <div className="card card-elevated lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-400">Database Statistics</h3>
                  <p className="text-sm text-dark-400">User and message counts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-xl border border-primary-500/20">
                  <div className="text-3xl font-bold text-primary-400 mb-2">{healthData.stats.totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-dark-300">Total Users</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-secondary-500/10 to-secondary-600/10 rounded-xl border border-secondary-500/20">
                  <div className="text-3xl font-bold text-secondary-400 mb-2">{healthData.stats.totalMessages.toLocaleString()}</div>
                  <div className="text-sm text-dark-300">Total Messages</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
