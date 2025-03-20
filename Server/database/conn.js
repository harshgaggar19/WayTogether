import mongoose from "mongoose";

async function connect() {
	const db = await mongoose.connect(process.env.MONGO_URL);
	console.log("Database Connected");
	return db;
}

export default connect;
