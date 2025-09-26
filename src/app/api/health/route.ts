import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function GET() {
  try {
    // Check database connection
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;

    // Check Redis connection
    const redisStart = Date.now();
    await redis.ping();
    const redisTime = Date.now() - redisStart;

    // Get basic stats
    const userCount = await prisma.user.count();
    const messageCount = await prisma.message.count();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbTime}ms`
        },
        redis: {
          status: 'connected',
          responseTime: `${redisTime}ms`
        }
      },
      stats: {
        totalUsers: userCount,
        totalMessages: messageCount
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
