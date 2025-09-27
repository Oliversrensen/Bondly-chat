const { createServer } = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { Redis } = require("ioredis");

// Force Prisma client regeneration on startup
console.log("🔄 Initializing Prisma client...");
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Test the Prisma client with a simple query to ensure it's working
prisma.$connect().then(async () => {
  console.log("✅ Prisma client connected successfully");
  
  // Debug: Check what the Prisma client thinks the Message model looks like
  try {
    const messageFields = Object.keys(prisma.message.fields);
    console.log("📋 Message model fields:", messageFields);
    
    // Try a simple query to see what happens
    const messageCount = await prisma.message.count();
    console.log("📊 Total messages in database:", messageCount);
  } catch (err) {
    console.error("❌ Error checking Message model:", err);
  }
}).catch((err) => {
  console.error("❌ Prisma client connection failed:", err);
});

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
    // Calculate average response time
    const avgResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    
    // Use Redis pipeline to batch all operations (much cheaper!)
    const pipeline = redis.pipeline();
    
    // Get current counts from sets (with error handling)
    pipeline.scard('active_connections');
    pipeline.scard('active_users');
    pipeline.get('total_requests');
    
    // Execute pipeline to get current values
    const results = await pipeline.exec();
    const actualActiveConnections = results?.[0]?.[1] || 0;
    const actualActiveUsers = results?.[1]?.[1] || 0;
    const totalRequests = parseInt(results?.[2]?.[1] || '0');
    
    // Create new pipeline for all writes
    const writePipeline = redis.pipeline();
    
    // Batch all metric updates
    writePipeline.set('messages_this_minute', messageCount);
    writePipeline.set('total_errors', errorCount);
    writePipeline.set('metrics_active_connections', actualActiveConnections);
    writePipeline.set('metrics_active_users', actualActiveUsers);
    writePipeline.set('avg_response_time', avgResponseTime);
    writePipeline.set('websocket_last_heartbeat', new Date().toISOString());
    writePipeline.set('total_requests', totalRequests + messageCount);
    
    // Add activity log (only if we have activity)
    if (messageCount > 0 || actualActiveConnections > 0) {
      writePipeline.lpush('recent_activity', JSON.stringify({
        timestamp: new Date().toISOString(),
        connections: actualActiveConnections,
        users: actualActiveUsers,
        messages: messageCount,
        errors: errorCount
      }));
      writePipeline.ltrim('recent_activity', 0, 99);
    }
    
    // Execute all writes in one batch
    await writePipeline.exec();
    
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
    
    // Debug: Log the data structure we're trying to save
    const messageData = messageBuffer.map(msg => ({
      text: msg.text,
      authorId: msg.userId || "anon",
      roomId: msg.roomId
    }));
    
    console.log("📝 Message data structure:", JSON.stringify(messageData, null, 2));
    
    // Use raw SQL to bypass Prisma client issues
    for (const msg of messageData) {
      await prisma.$executeRaw`
        INSERT INTO "Message" ("id", "createdAt", "authorId", "text", "roomId")
        VALUES (${msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}, ${new Date()}, ${msg.authorId}, ${msg.text}, ${msg.roomId})
      `;
    }
    
    console.log(`✅ Successfully saved ${messageBuffer.length} messages`);
    messageBuffer = []; // Clear buffer
  } catch (error) {
    console.error("❌ Failed to save message batch:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error code:", error.code);
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
    
    // Track active user with minimal Redis commands
    if (userId) {
      try {
        // Use pipeline to batch operations
        const pipeline = redis.pipeline();
        pipeline.sadd('active_users', userId);
        pipeline.sadd('active_connections', socket.id);
        await pipeline.exec();
      } catch (err) {
        console.error("Error tracking active user:", err);
        // If there's an error, just skip tracking (don't spam Redis with retries)
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
          
          // Remove from active tracking with minimal Redis commands
          try {
            const pipeline = redis.pipeline();
            pipeline.srem('active_users', uid);
            pipeline.srem('active_connections', socket.id);
            await pipeline.exec();
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
