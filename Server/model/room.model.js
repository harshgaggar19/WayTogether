import mongoose from "mongoose";
const room=new mongoose.Schema({
    users:{
        type:Array
    },
    name:String,
    roomId:{
        type:String,
        unique:true
    }
})
const roomUser=mongoose.model('roomUser',room);
export default roomUser;