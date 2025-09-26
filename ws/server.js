const { createServer } = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { Redis } = require("ioredis");

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Metrics tracking
let messageCount = 0;
let errorCount = 0;
let connectionCount = 0;
let responseTimes = [];

// Message batching for database efficiency
let messageBuffer = [];
const BATCH_SIZE = 10; // Save every 10 messages
const BATCH_TIMEOUT = 5000; // Or every 5 seconds, whichever comes first

// Track metrics every minute
setInterval(async () => {
  try {
    // Get actual active connections from Redis sets with error handling
    let actualActiveConnections = 0;
    let actualActiveUsers = 0;
    
    try {
      const connType = await redis.type('active_connections');
      if (connType === 'set') {
        actualActiveConnections = await redis.scard('active_connections') || 0;
      } else {
        console.log("⚠️ active_connections is not a set, deleting and recreating");
        await redis.del('active_connections');
      }
    } catch (err) {
      console.error("Error getting active connections:", err);
      await redis.del('active_connections');
    }
    
    try {
      const userType = await redis.type('active_users');
      if (userType === 'set') {
        actualActiveUsers = await redis.scard('active_users') || 0;
      } else {
        console.log("⚠️ active_users is not a set, deleting and recreating");
        await redis.del('active_users');
      }
    } catch (err) {
      console.error("Error getting active users:", err);
      await redis.del('active_users');
    }
    
    // Calculate average response time
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    
    // Store metrics (use different keys for metrics to avoid conflicts)
    await redis.set('messages_this_minute', messageCount);
    await redis.set('total_errors', errorCount);
    await redis.set('metrics_active_connections', actualActiveConnections);
    await redis.set('metrics_active_users', actualActiveUsers);
    await redis.set('avg_response_time', avgResponseTime);
    await redis.set('websocket_last_heartbeat', new Date().toISOString());
    
    // Track total requests for error rate calculation
    const totalRequests = await redis.get('total_requests') || '0';
    await redis.set('total_requests', parseInt(totalRequests) + messageCount);
    
    // Track recent activity
    await redis.lpush('recent_activity', JSON.stringify({
      timestamp: new Date().toISOString(),
      connections: actualActiveConnections,
      users: actualActiveUsers,
      messages: messageCount,
      errors: errorCount
    }));
    
    // Keep only last 100 activities
    await redis.ltrim('recent_activity', 0, 99);
    
    console.log(`📊 Metrics: ${actualActiveConnections} connections, ${actualActiveUsers} users, ${messageCount} msgs/min`);
    
    // Reset minute counter
    messageCount = 0;
  } catch (err) {
    console.error('Metrics tracking error:', err);
  }
}, 60000);

// Test database connection
prisma.$connect()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));

// Clean up Redis keys on startup to avoid type conflicts
async function cleanupRedisKeys() {
  try {
    console.log("🧹 Cleaning up Redis keys...");
    
    // Check and clean active tracking keys
    const userType = await redis.type('active_users');
    const connType = await redis.type('active_connections');
    
    if (userType !== 'set' && userType !== 'none') {
      console.log("🗑️ Deleting active_users (wrong type)");
      await redis.del('active_users');
    }
    if (connType !== 'set' && connType !== 'none') {
      console.log("🗑️ Deleting active_connections (wrong type)");
      await redis.del('active_connections');
    }
    
    console.log("✅ Redis cleanup completed");
  } catch (err) {
    console.error("❌ Redis cleanup failed:", err);
  }
}

// Run cleanup on startup
cleanupRedisKeys();

// Function to save messages in batches
async function saveMessageBatch() {
  if (messageBuffer.length === 0) return;
  
  try {
    console.log(`💾 Saving batch of ${messageBuffer.length} messages to database`);
    
    // Create all messages in one batch - much simpler now!
    await prisma.message.createMany({
      data: messageBuffer.map(msg => ({
        text: msg.text,
        authorId: msg.userId || "anon",
        roomId: msg.roomId
      }))
    });
    
    console.log(`✅ Successfully saved ${messageBuffer.length} messages`);
    messageBuffer = []; // Clear buffer
  } catch (error) {
    console.error("❌ Failed to save message batch:", error);
    errorCount++;
    // Keep messages in buffer for retry
  }
}

// Set up batch processing
setInterval(saveMessageBatch, BATCH_TIMEOUT);

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'websocket-server' }));
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const io = new Server(httpServer, { cors: { origin: "*" } });

// Track socket → userId
const socketUsers = new Map();

const QKEYS = ["queue:random", "queue:interest"];
const PENDING = (u) => `match:pending:${u}`;

// --- Simple bad word / link filter ---
const bannedWords = ["badword1", "badword2"]; // extend list
function sanitizeMessage(text) {
  let clean = text;

  // Censor banned words
  for (const word of bannedWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    clean = clean.replace(regex, "****");
  }

  // Block links (simple check)
  if (/\bhttps?:\/\/\S+/i.test(clean)) {
    clean = "[link removed]";
  }

  return clean;
}

// --- Cleanup helper ---
async function cleanupUser(uid) {
  if (!uid) return;
  try {
    await redis.lrem("queue:random", 0, uid);
    await redis.del(`queue:random:user:${uid}`);

    const myInterests = await prisma.interestOnUser.findMany({
      where: { userId: uid },
      include: { interest: true },
    });
    for (const i of myInterests) {
      const qKey = `queue:interest:${i.interest.name.toLowerCase()}`;
      await redis.lrem(qKey, 0, uid);
      await redis.del(`${qKey}:user:${uid}`);
    }

    await redis.del(PENDING(uid));
    console.log(`Cleaned up ${uid} from all queues/pending`);
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
}

// --- Rate limit helper ---
async function isRateLimited(uid) {
  const key = `rate:${uid}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 10); // 10s window
  }
  return count > 5; // >5 msgs in 10s → limited
}

// --- Socket.io handlers ---
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  connectionCount++;
  
  socket.on("identify", async ({ userId }) => {
    socketUsers.set(socket.id, userId);
    console.log("Identify", socket.id, "->", userId);
    
    // Track active user with proper error handling
    if (userId) {
      try {
        // Check if keys exist and are the right type, if not, delete them
        const userType = await redis.type('active_users');
        const connType = await redis.type('active_connections');
        
        if (userType !== 'set') {
          await redis.del('active_users');
        }
        if (connType !== 'set') {
          await redis.del('active_connections');
        }
        
        await redis.sadd('active_users', userId);
        await redis.sadd('active_connections', socket.id);
      } catch (err) {
        console.error("Error tracking active user:", err);
        // If there's still an error, try to clear and recreate
        try {
          await redis.del('active_users', 'active_connections');
          await redis.sadd('active_users', userId);
          await redis.sadd('active_connections', socket.id);
        } catch (retryErr) {
          console.error("Retry failed:", retryErr);
        }
      }
    }
  });

  socket.on("join_room", ({ roomId }) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("message", async ({ roomId, text, userId }) => {
    if (!roomId || !text) return;

    const startTime = Date.now();

    // --- Moderation ---
    if (await isRateLimited(userId)) {
      console.log("Rate limit hit for", userId);
      return; // silently drop
    }

    let cleanText = sanitizeMessage(text);

    let sillyName = "Anonymous";
    try {
      if (userId) {
        console.log("🔍 Fetching user info for userId:", userId);
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { sillyName: true, name: true, isPro: true },
        });

        console.log("👤 User found:", user);

        // Use sillyName if available, otherwise use name, otherwise "Anonymous"
        if (user?.sillyName && user.sillyName.trim() !== "") {
          sillyName = user.sillyName;
          console.log("✅ Using sillyName:", sillyName);
        } else if (user?.name && user.name.trim() !== "") {
          sillyName = user.name;
          console.log("✅ Using name:", sillyName);
        } else {
          console.log("⚠️ No display name found, using Anonymous");
        }
      } else {
        console.log("⚠️ No userId provided");
      }
        } catch (err) {
          console.error("❌ Failed to fetch user info:", err);
          errorCount++;
        }

        // Add message to buffer for batch processing
        messageBuffer.push({
          roomId: roomId,
          text: cleanText,
          userId: userId || "anon",
          timestamp: Date.now()
        });
        
        // Trigger batch save if buffer is full
        if (messageBuffer.length >= BATCH_SIZE) {
          saveMessageBatch();
        }

        io.to(roomId).emit("message", {
          text: cleanText,
          authorId: userId || "anon",
          sillyName,
          at: Date.now(),
        });
        
        // Track message count
        messageCount++;
        
        // Track response time
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        // Keep only last 100 response times
        if (responseTimes.length > 100) {
          responseTimes = responseTimes.slice(-100);
        }
  });

  // Typing events
  socket.on("typing", ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit("typing");
  });

  socket.on("stop_typing", ({ roomId }) => {
    if (!roomId) return;
    socket.to(roomId).emit("stop_typing");
  });

  // Handle leaving / skipping
  socket.on("leave_room", async ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    socket.to(roomId).emit("ended");
    const uid = socketUsers.get(socket.id);
    await cleanupUser(uid);
    console.log(`User left room ${roomId}`);
  });

      // Disconnect cleanup
      socket.on("disconnect", async () => {
        const uid = socketUsers.get(socket.id);
        if (uid) {
          await cleanupUser(uid);
          socketUsers.delete(socket.id);
          
          // Remove from active tracking with error handling
          try {
            await redis.srem('active_users', uid);
            await redis.srem('active_connections', socket.id);
          } catch (err) {
            console.error("Error removing from active tracking:", err);
          }
        }
        connectionCount--;
        console.log("Socket disconnected:", socket.id);
      });
});

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, saving remaining messages...');
  await saveMessageBatch();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, saving remaining messages...');
  await saveMessageBatch();
  process.exit(0);
});

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 WebSocket server running on ${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Message batching: ${BATCH_SIZE} messages or ${BATCH_TIMEOUT}ms`);
});
