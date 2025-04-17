import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function connect() {
	const db = await mongoose.connect(process.env.MONGO_URL);
	console.log("Database Connected");
	return db;
}

export default connect;
