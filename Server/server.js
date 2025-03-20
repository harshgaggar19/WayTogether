import 'dotenv/config'
import express from 'express'
const app = express();
import connect from './database/conn.js';
const port = process.env.PORT || 8080;
import fetch from "node-fetch"; 
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
app.use(cors());
// const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

app.use(express.json());

(async () => {
	await connect().catch((err) => {
		console.log("Invalid database connection...!", err.message);
	});
})();

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.post("/api/places", async (req, res) => {
	console.log(req.body);
	res.json({ message: "received" });
});



app.listen(port, () => {
    console.log("listening...")
})