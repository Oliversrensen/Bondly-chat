import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET() {
  try {
    // Database metrics
    const dbStart = Date.now();
    const [
      totalUsers,
      totalMessages,
      totalMatches,
      recentUsers,
      recentMessages
    ] = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.match.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      prisma.message.count({
        where: {
          at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);
    const dbTime = Date.now() - dbStart;

    // Redis metrics
    const redisStart = Date.now();
    const redisInfo = await redis.info('memory');
    await redis.ping();
    const redisTime = Date.now() - redisStart;

    // Parse Redis memory info
    const memoryUsed = redisInfo.match(/used_memory_human:([^\r\n]+)/)?.[1] || '0B';
    const memoryPeak = redisInfo.match(/used_memory_peak_human:([^\r\n]+)/)?.[1] || '0B';

    // System uptime (approximate)
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    // Performance metrics
    const performance = {
      databaseResponseTime: dbTime,
      redisResponseTime: redisTime,
      totalUptime: `${uptimeHours}h ${uptimeMinutes}m`,
      memoryUsage: {
        used: memoryUsed,
        peak: memoryPeak
      }
    };

    // User activity metrics
    const userActivity = {
      totalUsers,
      newUsers24h: recentUsers,
      totalMessages,
      messages24h: recentMessages,
      totalMatches,
      activeUsers: await redis.scard('active_users') || 0
    };

    // Error tracking
    const errorMetrics = {
      totalErrors: parseInt(await redis.get('total_errors') || '0'),
      errors24h: parseInt(await redis.get('errors_24h') || '0'),
      errorRate: userActivity.totalUsers > 0 ? 
        Math.round((parseInt(await redis.get('total_errors') || '0') / userActivity.totalUsers) * 100) : 0
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      performance,
      userActivity,
      errorMetrics,
      status: 'healthy'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch system metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
