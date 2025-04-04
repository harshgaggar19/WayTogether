import roomUser from '../model/room.model.js'
import User from '../model/userModel.js' 

export async function groupsjoined(req, res) {
    console.log("Groups joined");

    const {phone}=req.body.phone;
    console.log("Hello",phone);
    try{
        const user=await User.findOne({phone:phone});
        const userId=user._id;
        if(!user) throw 1;

        const rooms = await Promise.all(
            user.rooms.map(async (el) => {
                const room = await roomUser.findOne({ roomId: el });
                const users=room.users;
                const receiptent=users.filter((el)=>el!=phone);
                const receiver= await User.findOne({phone:receiptent[0]});
                const name=receiver.name;
                return { name, roomId: el };
            })
        );
        console.log(rooms);
        res.json({rooms:rooms});
    }
    catch(e)
    {
        console.log("Not able to find");
    }
}