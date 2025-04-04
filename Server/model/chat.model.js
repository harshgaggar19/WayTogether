import mongoose from "mongoose";
const Chat=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    roomId:{
        type:String,
    },
    message:{
        type:String,
    },
    // timestamps:{
    //     type:Date,
    //     default:Date.now
    // }
}, { timestamps: true })
const Message=mongoose.model('Message',Chat);
export default Message;