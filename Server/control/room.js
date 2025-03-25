import roomUser from '../model/room.model.js'
import User from '../model/userModel.js' 
import { v4 as uuidv4 } from 'uuid';


export async function makeGroup(req, res) {
    try{
    // await connectDatabase();
    // Generate a unique room ID
    const {users,name}=req.body;
    console.log(users,name);
    // users.push(creator);
    console.log(users);
    let phone;
    const roomId = uuidv4();
    console.log("Hello");
    for(phone of users)
    {
        
        const userid=await User.findOne({phone:phone});
            if(!userid) continue;
            let rooms=userid.rooms;
            rooms.push(roomId);
            rooms = [...new Set(rooms)];
            await User.updateOne({phone:phone},{$set :{rooms:rooms}});
            
    }
    
    const room=new roomUser({
        name:name,
      roomId:roomId,
      users:users 
    })
    room.save();
    res.json({roomId:roomId});

    }
    catch(e)
    {
        console.log(e);
        res.json({message:"User not available"});
    }
}
