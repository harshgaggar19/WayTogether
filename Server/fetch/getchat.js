import roomUser from '../../model/room.schema.js'
import Chat from '../../model/chat.schema.js';
import User from '../../model/User.schema.js' 
export async function getChat(req,res) {
    console.log("Chat");
    const {roomId}=req.query;
    console.log(roomId);
    try{
        const chat = await Chat.find({ roomId: roomId }).sort({ createdAt: 1 });
        const chats=chat.map((el)=>{
            return {message:el.message,sender:el.sender};
        })
    res.json({chat:chats});
    }
    catch(e)
    {
        res.json("Couldn't find");
    }

}