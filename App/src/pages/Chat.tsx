import React, { useEffect, useState } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState<{ message: string; sender: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUserId = "67e28692007292a7c1442620"; // Your user ID
  const roomId = "f3b33884-17e6-4aa8-9357-bd03a77b4b40";
  const [socket, setSocket] = useState<WebSocket | null>(null);


  useEffect(() => {
    // Fetch previous chat messages
    const fetchChat = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/getchat?roomId=${roomId}`
        );
        setMessages(response.data.chat);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    fetchChat();

    // WebSocket setup
    const ws = new WebSocket("ws://localhost:8081");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "Join", roomId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "Chat") {
        setMessages((prev) => [...prev, { message: data.message, sender: data.sender }]);
      } else if (data.type === "PreviousMessages") {
        setMessages(data.messages);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      type: "Chat",
      roomId,
      sender: "9123456789",
      message: newMessage,
    };

    socket.send(JSON.stringify(messageData));
    setMessages((prev) => [...prev, { message: newMessage, sender:"67e28692007292a7c1442620" }]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="flex items-center p-4 border-b border-gray-300">
        <button
          className="mr-4 px-4 py-2 bg-black text-white rounded-lg"
          onClick={() => window.history.back()}
        >
          ←
        </button>
        <h2 className="text-xl font-bold">Chat</h2>
      </div>
      <a href="tel:+919561009042">Call Now</a>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.sender === currentUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-2 max-w-xs rounded-lg ${
                msg.sender === currentUserId ? "bg-gray-300 text-black" : "bg-black text-white"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-300 flex">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-400 rounded-lg"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
