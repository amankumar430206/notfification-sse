const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Store active SSE clients
let clients = [];

// ====================== SSE ENDPOINT ======================
app.get("/events", (req, res) => {
  // Set proper SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*"); // for dev

  // Keep connection alive (important for some proxies)
  const keepAlive = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  // Add client to list
  clients.push(res);

  console.log(`✅ New client connected. Total: ${clients.length}`);

  // Send welcome message
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "Connected to live updates",
    })}\n\n`,
  );

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(keepAlive);
    clients = clients.filter((client) => client !== res);
    console.log(`❌ Client disconnected. Remaining: ${clients.length}`);
  });
});

// ====================== TRIGGER EVENTS ======================
// Anyone (or your backend) can call this to broadcast
app.post("/send-event", (req, res) => {
  const { type, message, data } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const payload = {
    type: type || "notification",
    message,
    data: data || {},
    timestamp: new Date().toISOString(),
  };

  // Broadcast to ALL connected clients
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  console.log(`📢 Broadcasted: ${message}`);
  res.json({ success: true, clients: clients.length });
});

// Optional: Simulate real-world events (remove in production)
setInterval(() => {
  if (clients.length > 0) {
    const fakeEvents = [
      { type: "order", message: "New order placed #4782" },
      { type: "payment", message: "Payment received ₹4,299" },
      { type: "alert", message: "Server CPU usage high" },
      { type: "notification", message: "Flash sale started!" },
    ];

    const event = fakeEvents[Math.floor(Math.random() * fakeEvents.length)];
    clients.forEach((client) => {
      client.write(
        `data: ${JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    });
  }
}, 8000);

app.listen(3000, () => {
  console.log("🚀 SSE Server running on http://localhost:3000");
  console.log("👉 Open http://localhost:3000 in multiple tabs");
});
