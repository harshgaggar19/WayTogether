import mongoose from "mongoose";

async function connect() {
	const db = await mongoose.connect("mongodb+srv://kalyanigade4:i7zAJea6Z1nZl1Gl@cluster0.wuwty.mongodb.net/");
	console.log("Database Connected");
	return db;
}

export default connect;
