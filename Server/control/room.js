import roomUser from "../model/room.model.js";
import User from "../model/userModel.js";
import { v5 as uuidv5 } from "uuid";

const NAMESPACE = "e87a7d1e-7ebf-4e2d-9e4a-6b78bf4d7b89"; // Fixed namespace

export async function makeGroup(req, res) {
  try {
    const { users } = req.body;
    console.log(users);
    if (users.length < 2) {
      return res.status(400).json({ message: "A group must have at least 2 users" });
    }

    // Sort users to ensure same roomId for same numbers
    const sortedUsers = [...users].sort();
    const roomId = uuidv5(sortedUsers.join("-"), NAMESPACE);

    console.log("Generated Room ID:", roomId);

    // Check if the room already exists
    let existingRoom = await roomUser.findOne({ roomId });

    if (existingRoom) {
      return res.json({ roomId: existingRoom.roomId, message: "Room already exists" });
    }

    // Update each user's room list
    for (let phone of users) {
      const user = await User.findOne({ phone });
      if (!user) continue;
      
      user.rooms = [...new Set([...user.rooms, roomId])]; // Avoid duplicates
      await user.save();
    }

    // Create a new room entry
    const room = new roomUser({
     
      roomId,
      users: sortedUsers,
    });

    await room.save();
    
    res.json({ roomId });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
}
