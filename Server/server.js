import 'dotenv/config';
import express from 'express';
import connect from './database/conn.js';
import dotenv from "dotenv";
import usersRouter from "./routes/userRoute.js";
dotenv.config();
import cors from 'cors';
import { getChat } from './fetch/getchat.js';
import './control/chat.js';
import {makeGroup} from './control/room.js'
import { createUser } from "./controllers/userController.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;


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
app.post("/api/places", async (req, res) => {
    console.log(req.body);
    res.json({ message: "received" });
});

app.get("/api/getchat", getChat); // To get chat in room
app.post("/api/room",makeGroup);// To contact with new person

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
