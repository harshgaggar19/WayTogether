import User from '../model/userModel.js';
import roomUser from '../model/room.model.js';
import Chat from '../model/chat.model.js';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: 8081 });
export const allsockets = [];

wss.on("connection", (socket) => {
    console.log("Client connected");
    

    let roomId = null;

    socket.on("message", async (message) => {
        console.log("Received message");
        

        const payload = JSON.parse(message);
        console.log(payload);

        if (payload.type === 'Join') {
            console.log(`User joined room ${payload.roomId}`);
            const users = await User.find(); 
            console.log(users);
            roomId = payload.roomId;

            // Remove existing socket entry if already present
            allsockets.forEach((client, index) => {
                if (client.socket === socket) {
                    allsockets.splice(index, 1);
                }
            });


            // Store socket with roomId
            allsockets.push({ socket, roomId });

            // Fetch previous messages and send them to the user
            const messages = await Chat.find({ roomId: roomId });
            socket.send(JSON.stringify({ type: "PreviousMessages", messages }));

        } else if (payload.type === 'Chat') {
            console.log(`Broadcasting message to room ${payload.roomId}`);
            console.log(payload.sender);

            const users=await User.find();
            console.log(users);

            const sender = await User.findOne({ phone: payload.sender });
            if (!sender) {
                console.log("Sender not found:", payload.sender);
                return;
            }
            

            // Save the chat message to the database
            const chatMessage = new Chat({
                roomId: payload.roomId,
                sender: sender._id,
                message: payload.message,
            });

            await chatMessage.save();
            console.log("Message saved:", chatMessage);

            // Broadcast the message to all users in the same room (excluding sender)
            allsockets.forEach(client => {
                if (client.roomId === payload.roomId && client.socket !== socket) {
                    client.socket.send(JSON.stringify({
                        type: "Chat",
                        message: payload.message,
                        sender: payload.sender,
                    }));
                }
            });

            console.log("Message sent to all in room:", payload.roomId);
        }
    });

    socket.on('close', () => {
        console.log("Client disconnected");

        // Remove socket from allsockets array when disconnected
        const index = allsockets.findIndex(client => client.socket === socket);
        if (index !== -1) {
            allsockets.splice(index, 1);
            console.log("Socket removed from room");
        }
    });
});
