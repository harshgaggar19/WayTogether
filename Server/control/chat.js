import User from '../../model/User.schema.js';
import roomUser from '../../model/room.schema.js';
import Chat from '../../model/chat.schema.js';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: 8080 });
export const allsockets = [];

wss.on("connection", (socket) => {
    console.log("Connected");

    let roomId = null;

    socket.on("message", async (message) => {
        console.log("Received message");

        const payload = JSON.parse(message);
        console.log(payload);
        if (payload.type === 'Join') {
            console.log("Joined team");
            roomId = payload.roomId;
            const index = allsockets.findIndex(client => client.socket === socket);
            if (index !== -1) {
                allsockets[index].roomId = roomId;
            } else {
                allsockets.push({ socket, roomId: roomId });
            }

            // Fetch previous messages and send them
            const messages = await Chat.find({ roomId: roomId });
            socket.send(JSON.stringify({ messages }));

        } else if (payload.type === 'Chat') {
            console.log(payload);
            let currentroom = null;
            for (let i = 0; i < allsockets.length; i++) {
                if (allsockets[i].socket === socket) {
                    currentroom = allsockets[i].roomId;
                    console.log(currentroom);
                }
            }

            console.log("Sending message to room");
            console.log(allsockets);
            for (let i = 0; i < allsockets.length; i++) {
                console.log("Hel1",allsockets[i].roomId,currentroom);
                if (allsockets[i].roomId === payload.roomId) {
                    const data1 = {
                        message: payload.message,
                        sender: payload.sender,
                    };
                    allsockets[i].socket.send(JSON.stringify(data1));

                    // Save to database
                    const sender = await User.findOne({ phone: payload.sender });
                    console.log("SEnder",sender);
                    if (!sender) {
                        console.log("Sender not found:", payload.sender);
                        return;
                    }

                    const message = new Chat({
                        roomId: payload.roomId,
                        sender: sender._id,
                        message: payload.message,
                    });

                    await message.save();
                    console.log("Message saved:", message);

                    const data = { message: payload.message, sender: sender };
                    //socket.send(JSON.stringify(data));  // Send back to the sender
                }
                console.log("Message send");
            }
        }
    });

    socket.on('close', () => {
        let index = -1;
        for (let i = 0; i < allsockets.length; i++) {
            if (allsockets[i].socket === socket) {
                index = i;
                break;
            }
        }

        if (index !== -1) {
            allsockets.splice(index, 1);  // Remove socket from allsockets array
        }
    });
});
