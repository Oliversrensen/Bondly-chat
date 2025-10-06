const { createServer } = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { Redis } = require("ioredis");

// Initialize Prisma client
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Debug Prisma client version and capabilities
console.log('🔍 Prisma Client Debug Info:');
console.log('  - Client Version:', prisma._clientVersion);
console.log('  - Environment:', process.env.NODE_ENV || 'development');
console.log('  - Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

// Test the Prisma client with a simple query to ensure it's working
prisma.$connect().then(async () => {
  // Verify connection silently
  try {
    await prisma.message.count();
    console.log('✅ Basic Prisma connection successful');
    
    // Test if new profile fields are accessible
    try {
      await prisma.user.findFirst({
        select: {
          id: true,
          profilePicture: true,
          profilePictureType: true,
          generatedAvatar: true,
          selectedAvatarId: true
        }
      });
      console.log('✅ Profile picture fields are accessible');
    } catch (profileError) {
      console.error('❌ Profile picture fields NOT accessible:', profileError.message);
      console.log('This indicates the Prisma client is outdated or schema mismatch');
      console.log('Attempting to regenerate Prisma client...');
      
      // Try to regenerate the client
      try {
        const { execSync } = require('child_process');
        execSync('npx prisma generate --force', { stdio: 'inherit' });
        console.log('✅ Prisma client regenerated, restarting...');
        process.exit(1); // Exit to trigger restart
      } catch (regenerateError) {
        console.error('❌ Failed to regenerate Prisma client:', regenerateError.message);
      }
    }
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

// Track metrics every 5 minutes (much less frequent)
setInterval(async () => {
  try {
    // Only update metrics if there's actual activity
    if (messageCount === 0 && errorCount === 0) {
      return; // Skip if no activity
    }
    
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
    
    console.log(`📊 Metrics: ${actualActiveConnections} connections, ${actualActiveUsers} users, ${messageCount} msgs/5min`);
    
    // Reset counters
    messageCount = 0;
    errorCount = 0;
    responseTimes = [];
  } catch (err) {
    console.error('Metrics tracking error:', err);
  }
}, 300000); // 5 minutes instead of 1 minute

// Test database connection
prisma.$connect()
  .then(() => {}) // Silent success
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
    // Use raw SQL to bypass Prisma client issues
    for (const msg of messageBuffer) {
      await prisma.$executeRaw`
        INSERT INTO "Message" ("id", "createdAt", "authorId", "text", "roomId")
        VALUES (${msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}, ${new Date()}, ${msg.userId || "anon"}, ${msg.text}, ${msg.roomId})
      `;
    }
    
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
// Track socket → rooms for disconnect notifications
const socketRooms = new Map();

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
  // Socket connected
  connectionCount++;
  
  // Handle auth object from connection
  if (socket.handshake.auth && socket.handshake.auth.userId) {
    const userId = socket.handshake.auth.userId;
    socketUsers.set(socket.id, userId);
  }
  
  socket.on("identify", async ({ userId }) => {
    console.log('IDENTIFY EVENT RECEIVED - User identified with ID:', userId);
    console.log('Socket ID:', socket.id);
    socketUsers.set(socket.id, userId);
    console.log('Stored userId in socketUsers map');
    // User identified
    
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
    
    // Track the room for this socket
    if (!socketRooms.has(socket.id)) {
      socketRooms.set(socket.id, new Set());
    }
    socketRooms.get(socket.id).add(roomId);
    
    // Socket joined room
  });

  socket.on("message", async ({ roomId, text, userId }) => {
    if (!roomId || !text) return;

    console.log('Message received from socket:', socket.id, 'userId from params:', userId);
    console.log('Current socketUsers map:', Array.from(socketUsers.entries()));
    const storedUserId = socketUsers.get(socket.id);
    console.log('Stored userId for this socket:', storedUserId);
    
    // Use stored userId instead of the one passed in the message for security
    const actualUserId = storedUserId || userId;
    console.log('Using actual userId:', actualUserId);
    
    const startTime = Date.now();

    // --- Moderation ---
    if (await isRateLimited(actualUserId)) {
      return; // silently drop
    }

    let cleanText = sanitizeMessage(text);

    let sillyName = "Anonymous";
    let user = null;
    try {
      if (actualUserId) {
        console.log('Looking up user with ID:', actualUserId);
        user = await prisma.user.findUnique({
          where: { id: actualUserId },
          select: { 
            sillyName: true, 
            name: true, 
            isPro: true,
            profilePicture: true,
            profilePictureType: true,
            generatedAvatar: true,
            selectedAvatarId: true
          },
        });
        console.log('Found user in database:', {
          sillyName: user?.sillyName,
          name: user?.name,
          isPro: user?.isPro,
          profilePicture: user?.profilePicture,
          profilePictureType: user?.profilePictureType,
          generatedAvatar: user?.generatedAvatar,
          selectedAvatarId: user?.selectedAvatarId
        });

        // Use sillyName if available, otherwise use name, otherwise "Anonymous"
        if (user?.sillyName && user.sillyName.trim() !== "") {
          sillyName = user.sillyName;
        } else if (user?.name && user.name.trim() !== "") {
          sillyName = user.name;
        }
        console.log('Using sillyName:', sillyName);
      } else {
        console.log('No userId provided, using Anonymous');
      }
    } catch (err) {
      console.error("❌ Failed to fetch user info:", err);
      errorCount++;
    }

    // Add message to buffer for batch processing
    messageBuffer.push({
      roomId: roomId,
      text: cleanText,
      userId: actualUserId || "anon",
      timestamp: Date.now()
    });
    
    // Trigger batch save if buffer is full
    if (messageBuffer.length >= BATCH_SIZE) {
      saveMessageBatch();
    }

    // Debug logging
    console.log('Sending message with user data:', {
      actualUserId,
      sillyName,
      user: user ? {
        sillyName: user.sillyName,
        name: user.name,
        isPro: user.isPro,
        profilePicture: user.profilePicture,
        profilePictureType: user.profilePictureType,
        generatedAvatar: user.generatedAvatar,
        selectedAvatarId: user.selectedAvatarId
      } : null
    });

    io.to(roomId).emit("message", {
      text: cleanText,
      authorId: actualUserId || "anon",
      sillyName,
      at: Date.now(),
      profilePicture: user?.profilePicture || null,
      profilePictureType: user?.profilePictureType || null,
      generatedAvatar: user?.generatedAvatar || null,
      selectedAvatarId: user?.selectedAvatarId || null,
      isPro: user?.isPro || false,
    });
        
        // Track message count
        messageCount++;
        
        // Track response time (only if it's significant)
        const responseTime = Date.now() - startTime;
        if (responseTime > 100) { // Only track slow responses
          responseTimes.push(responseTime);
          
          // Keep only last 50 response times
          if (responseTimes.length > 50) {
            responseTimes = responseTimes.slice(-50);
          }
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
    
    // Remove from room tracking
    if (socketRooms.has(socket.id)) {
      socketRooms.get(socket.id).delete(roomId);
    }
    
    socket.to(roomId).emit("ended");
    const uid = socketUsers.get(socket.id);
    await cleanupUser(uid);
    // User left room
  });

  // --- Friend messaging handlers ---
  socket.on("join_friend_chat", ({ friendId, myId }) => {
    if (!friendId || !myId) return;
    
    // Validate that friendId and myId are valid strings
    if (typeof friendId !== 'string' || typeof myId !== 'string') {
      return;
    }
    
    // Join a room specific to this friend pair
    // Sort the IDs to ensure consistent room naming regardless of who joins first
    const sortedIds = [myId, friendId].sort();
    const friendRoom = `friend_${sortedIds[0]}_${sortedIds[1]}`;
    socket.join(friendRoom);
    
    // Track the room for this socket
    if (!socketRooms.has(socket.id)) {
      socketRooms.set(socket.id, new Set());
    }
    socketRooms.get(socket.id).add(friendRoom);
  });

  socket.on("send_friend_message", async ({ friendId, message }) => {
    if (!friendId || !message) return;
    
    const myId = socketUsers.get(socket.id);
    if (!myId) return;

    // Rate limiting for friend messages
    if (await isRateLimited(myId)) {
      return;
    }

    // Sanitize the message
    const cleanText = sanitizeMessage(message.text);
    message.text = cleanText;

    // Get the friend room (same logic as join_friend_chat)
    const sortedIds = [myId, friendId].sort();
    const friendRoom = `friend_${sortedIds[0]}_${sortedIds[1]}`;
    
    // Emit to all sockets in the friend room
    io.to(friendRoom).emit("friend_message", message);
  });

  socket.on("friend_typing", ({ friendId, isTyping }) => {
    if (!friendId) return;
    
    const myId = socketUsers.get(socket.id);
    if (!myId) return;

    // Get the friend room (same logic as join_friend_chat)
    const sortedIds = [myId, friendId].sort();
    const friendRoom = `friend_${sortedIds[0]}_${sortedIds[1]}`;
    
    // Emit typing status to other users in the room
    socket.to(friendRoom).emit("friend_typing", { 
      friendId: myId, 
      isTyping 
    });
  });

      // Disconnect cleanup
      socket.on("disconnect", async (reason) => {
        const uid = socketUsers.get(socket.id);
        
        // Use tracked rooms instead of socket.rooms (which might be empty)
        const trackedRooms = socketRooms.get(socket.id) || new Set();
        
        // Notify all tracked rooms that the user left
        for (const roomId of trackedRooms) {
          socket.to(roomId).emit("ended");
        }
        
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
        
        // Clean up room tracking
        socketRooms.delete(socket.id);
        
        connectionCount--;
        // Socket disconnected
      });
});

const PORT = process.env.PORT || 3001;
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
