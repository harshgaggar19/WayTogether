import express from "express";
import { createServer } from "http";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const server = createServer(app); // Create an HTTP server for Express
const wss = new WebSocketServer({ server }); // Attach WebSocket server to Express

let users = {}; // Store connected users

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "join":
        users[data.userId] = ws; // Store user socket
        console.log(`User joined: ${data.userId}`);
        break;

      case "call":
        if (users[data.target]) {
          users[data.target].send(JSON.stringify({ type: "incoming-call", from: data.userId }));
        }
        break;

      case "offer":
        if (users[data.target]) {
          users[data.target].send(JSON.stringify({ type: "offer", offer: data.offer, from: data.userId }));
        }
        break;

      case "answer":
        if (users[data.target]) {
          users[data.target].send(JSON.stringify({ type: "answer", answer: data.answer }));
        }
        break;

      case "ice-candidate":
        if (users[data.target]) {
          users[data.target].send(JSON.stringify({ type: "ice-candidate", candidate: data.candidate }));
        }
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  });

  ws.on("close", () => {
    Object.keys(users).forEach((key) => {
      if (users[key] === ws) {
        delete users[key];
      }
    });
  });
});

// Start server
server.listen(5000, () => console.log("Server running on port 5000"));
