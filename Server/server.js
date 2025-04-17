import 'dotenv/config';
import express from 'express';
import connect from './database/conn.js';
import dotenv from "dotenv";
import usersRouter from "./routes/userRoute.js";
import fetch from 'node-fetch';
dotenv.config();
import cors from 'cors';
import { getChat } from './fetch/getchat.js';
import './control/chat.js';
import {makeGroup} from './control/room.js'
import { createUser } from './controllers/userController.js';
import { groupsjoined } from './fetch/getrooms.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express.json());


import twilio from "twilio";



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

app.post("/api/call", async (req, res) => {
    const { to } = req.body; // Get recipient's phone number from request

    if (!to) {
        return res.status(400).json({ error: "Recipient phone number is required" });
    }

    try {
        const call = await client.calls.create({
            to: to,
            from: twilioPhoneNumber,
            url: "http://demo.twilio.com/docs/voice.xml", // Default Twilio XML message
        });

        res.status(200).json({ message: "Call placed successfully", callSid: call.sid });
    } catch (error) {
        console.error("Error placing call:", error);
        res.status(500).json({ error: error.message });
    }
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

(async () => {
    await connect().catch((err) => {
        console.log("Invalid database connection...!", err.message);
    });
})();

app.get("/", (req, res) => {
    res.send("Hello World");
});
app.post("/signup", createUser);
app.use("/users", usersRouter);
app.post("/api/places", async (req, res) => {
    console.log(req.body);
    res.json({ message: "received" });
});

app.get("/api/getchat", getChat); // To get chat in room
app.post("/api/room",makeGroup);// To contact with new person
app.post("/api/rooms",groupsjoined);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
