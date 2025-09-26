import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET() {
  try {
    // Get active WebSocket connections (this would need to be tracked by your WebSocket server)
    const activeConnections = await redis.scard('active_connections') || 0;
    
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
