import User from '../model/userModel.js';
import roomUser from '../model/room.model.js';
import Chat from '../model/chat.model.js';
import { WebSocketServer, WebSocket } from 'ws';

import dotenv from 'dotenv';
dotenv.config();

const wss = new WebSocketServer({ port: 8081 });
export const allsockets = [];
export const usersockets=[];

wss.on("connection", (socket) => {
    console.log("Client connected");
    

    let roomId = null;
    let userId=null;
    let socketType = null; 
    socket.on("message", async (message) => {
        console.log("Received message");
        

        const payload = JSON.parse(message);
        console.log(payload);
        if(payload.type==='connect')
        {
           userId=payload.userId;
           socketType = "notification";
           usersockets.forEach((client, index) => {
                if (client.socket === socket) {
                    usersockets.splice(index, 1);
                }
            });
            socketType = "chat"; 


            usersockets.push({ socket, userId});

        }

        else if (payload.type === 'Join') {
            console.log(`User joined room ${payload.roomId}`);
            
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
            // console.log("Message saved:", chatMessage);

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
        }else if(payload.type==='Notification')
        {
            const roomId=payload.roomId;
            const sender=payload.sender;
            console.log("Chat",roomId,sender,payload);
            const room=await roomUser.findOne({roomId});
            const users=room.users;
            const receiptent = users.filter(el => el !== sender);

            console.log("receipent",receiptent);
            const receiptentdata= await User.findOne({phone:receiptent[0]});
            console.log("receipentdata",receiptentdata);
            const recipientId=receiptentdata._id;
            // console.log(usersockets);
            const recipientSocket = usersockets.find(client => client.userId === recipientId.toString());
           
            const senderdata=await User.findOne({phone:sender});
            const name=senderdata.name;
            // if (recipientSocket && recipientSocket.socket.readyState === WebSocket.OPEN)
            if (recipientSocket )
                {
            recipientSocket.socket.send(JSON.stringify({
                type: "Notification",
                message: `New message from ${sender}`,
                sender: name,
                roomId
            }));
            console.log(`Notification sent to user: ${recipientId}`);
        } else {
            console.log(`Socket not found for user: ${recipientId}`);
        }
        }
       
    });

    socket.on('close', () => {
        console.log("Client disconnected");
        if (socketType === "chat") {
            const index = allsockets.findIndex(client => client.socket === socket);
            if (index !== -1) {
                allsockets.splice(index, 1);
                console.log("Chat socket removed from room");
            }
        }

        if (socketType === "notification") {
            const index = usersockets.findIndex(client => client.socket === socket);
            if (index !== -1) {
                usersockets.splice(index, 1);
                console.log("Notification socket removed");
            }
        }

        // // Remove socket from allsockets array when disconnected
        // const index = allsockets.findIndex(client => client.socket === socket);
        // if (index !== -1) {
        //     allsockets.splice(index, 1);
        //     console.log("Socket removed from room");
        // }
    });
});
