require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");

const { initDb } = require("./db");
const { sendMessage, startConsumer } = require("./kafka");
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/auth");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// --- Auth routes (public) ---
app.use("/", authRoutes);

// --- Chat route (protected: requires a valid JWT) ---
app.post("/send", authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const event = {
    user: req.user.username, // taken from the JWT, never trusted from the client
    message,
    timestamp: new Date().toISOString(),
  };

  try {
    await sendMessage(event);
    res.json({ status: "sent", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to publish event" });
  }
});

// --- HTTP + WebSocket share the same port ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.on("close", () => console.log("WebSocket client disconnected"));
});

async function start() {
  await initDb();
  await startConsumer(broadcast); // every Kafka event consumed is pushed to all connected clients

  server.listen(PORT, () => {
    console.log(`Server (HTTP + WebSocket) running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
