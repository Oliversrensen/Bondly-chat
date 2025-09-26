import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { adminAuthMiddleware } from '../middleware';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await adminAuthMiddleware(request);
  if (authResponse) return authResponse;

  try {
        // Get active WebSocket connections from Redis metrics
        const activeConnections = parseInt(await redis.get('metrics_active_connections') || '0');
        const activeUsers = parseInt(await redis.get('metrics_active_users') || '0');
    
    // Get messages per minute (tracked in Redis)
    const messagesThisMinute = await redis.get('messages_this_minute') || '0';
    const messagesPerMinute = parseInt(messagesThisMinute);
    
    // Get average response time (tracked in Redis)
    const avgResponseTime = await redis.get('avg_response_time') || '0';
    const averageResponseTime = parseInt(avgResponseTime);
    
    // Get error rate (tracked in Redis)
    const totalRequests = await redis.get('total_requests') || '0';
    const totalErrors = await redis.get('total_errors') || '0';
    const errorRate = totalRequests === '0' ? 0 : Math.round((parseInt(totalErrors) / parseInt(totalRequests)) * 100);
    
    // Get recent activity
    const recentActivity = await redis.lrange('recent_activity', 0, 9);
    
    return NextResponse.json({
      activeConnections,
      activeUsers,
      messagesPerMinute,
      averageResponseTime,
      errorRate,
      recentActivity: recentActivity.map(activity => JSON.parse(activity)),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch usage statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
