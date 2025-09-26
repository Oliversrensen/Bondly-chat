const { createServer } = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { Redis } = require("ioredis");

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Test database connection
prisma.$connect()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));

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

  socket.on("identify", ({ userId }) => {
    socketUsers.set(socket.id, userId);
    console.log("Identify", socket.id, "->", userId);
  });

  socket.on("join_room", ({ roomId }) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("message", async ({ roomId, text, userId }) => {
    if (!roomId || !text) return;

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
    }

    io.to(roomId).emit("message", {
      text: cleanText,
      authorId: userId || "anon",
      sillyName,
      at: Date.now(),
    });
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
    }
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 WebSocket server running on ${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
