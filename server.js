const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Map: userId → array of response objects (supports multiple tabs/devices)
const userClients = new Map(); // e.g., "user:123" → [res1, res2, ...]

// ====================== SSE ENDPOINT (User-Specific) ======================
app.get("/events", (req, res) => {
  const userId = req.query.userId; // Pass from frontend (or from JWT)

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const channel = `user:${userId}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Keep-alive ping
  const keepAlive = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  // Add this client to the user's list
  if (!userClients.has(channel)) {
    userClients.set(channel, []);
  }
  userClients.get(channel).push(res);

  console.log(`✅ User ${userId} connected. Total clients for user: ${userClients.get(channel).length}`);

  // Welcome message
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: `Welcome! You are now receiving personal updates (User ${userId})`,
      userId,
    })}\n\n`,
  );

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(keepAlive);
    const clients = userClients.get(channel) || [];
    const filtered = clients.filter((client) => client !== res);
    if (filtered.length === 0) {
      userClients.delete(channel);
    } else {
      userClients.set(channel, filtered);
    }
    console.log(`❌ User ${userId} disconnected. Remaining: ${filtered.length}`);
  });
});

// ====================== SEND TO SPECIFIC USER ======================
app.post("/send-to-user", (req, res) => {
  const { userId, type, message, data } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message are required" });
  }

  const channel = `user:${userId}`;
  const clients = userClients.get(channel) || [];

  if (clients.length === 0) {
    return res.json({ success: false, message: "User not connected" });
  }

  const payload = {
    type: type || "notification",
    message,
    data: data || {},
    userId,
    timestamp: new Date().toISOString(),
  };

  let sentCount = 0;
  clients.forEach((client) => {
    try {
      client.write(`data: ${JSON.stringify(payload)}\n\n`);
      sentCount++;
    } catch (err) {
      // Client might be dead, remove it
    }
  });

  console.log(`📤 Sent to user ${userId} (${sentCount} connections)`);
  res.json({ success: true, sentTo: sentCount, userId });
});

// ====================== BROADCAST TO ALL (optional) ======================
app.post("/broadcast", (req, res) => {
  const { type, message, data } = req.body;
  const payload = { type: type || "broadcast", message, data, timestamp: new Date().toISOString() };

  let totalSent = 0;
  userClients.forEach((clients) => {
    clients.forEach((client) => {
      try {
        client.write(`data: ${JSON.stringify(payload)}\n\n`);
        totalSent++;
      } catch {}
    });
  });

  res.json({ success: true, sentToClients: totalSent });
});

app.listen(3000, () => {
  console.log("🚀 SSE Server with user-specific messaging → http://localhost:3000");
});
