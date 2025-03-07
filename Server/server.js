import 'dotenv/config'
import express from 'express'
const app = express();
import connect from './database/conn.js';
const port = process.env.PORT || 8080;
import cors from 'cors';
// const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

(async () => {
	await connect().catch((err) => {
		console.log("Invalid database connection...!", err.message);
	});
})();


app.listen(port, () => {
    console.log("listening...")
})