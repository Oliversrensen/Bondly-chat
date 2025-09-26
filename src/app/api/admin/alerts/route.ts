import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { adminAuthMiddleware } from '../middleware';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await adminAuthMiddleware(request);
  if (authResponse) return authResponse;

  try {
    const alerts = [];
    
    // Check connection count
    const activeConnections = await redis.scard('active_connections') || 0;
    if (activeConnections > 100) {
      alerts.push({
        type: 'warning',
        message: `High connection count: ${activeConnections}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check error rate
    const totalErrors = parseInt(await redis.get('total_errors') || '0');
    const totalRequests = parseInt(await redis.get('total_requests') || '1');
    const errorRate = (totalErrors / totalRequests) * 100;
    
    if (errorRate > 5) {
      alerts.push({
        type: 'error',
        message: `High error rate: ${errorRate.toFixed(1)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check Redis memory usage
    const redisInfo = await redis.info('memory');
    const memoryUsed = parseInt(redisInfo.match(/used_memory:(\d+)/)?.[1] || '0');
    const maxMemory = parseInt(redisInfo.match(/maxmemory:(\d+)/)?.[1] || '0');
    
    if (maxMemory > 0 && (memoryUsed / maxMemory) > 0.8) {
      alerts.push({
        type: 'warning',
        message: `High Redis memory usage: ${Math.round((memoryUsed / maxMemory) * 100)}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if WebSocket server is responding
    const lastHeartbeat = await redis.get('websocket_last_heartbeat');
    if (lastHeartbeat) {
      const lastHeartbeatTime = new Date(lastHeartbeat).getTime();
      const now = Date.now();
      if (now - lastHeartbeatTime > 60000) { // 1 minute
        alerts.push({
          type: 'error',
          message: 'WebSocket server not responding',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return NextResponse.json({
      alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      alerts: [{
        type: 'error',
        message: 'Failed to fetch alerts',
        timestamp: new Date().toISOString()
      }],
      count: 1,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
