import Chat from '../model/chat.model.js';

export async function getChat(req, res) {
    console.log("Chat request received");
    const { roomId } = req.query;
    console.log("Room ID:", roomId);

    try {
        const chat = await Chat.find({ roomId }).sort({ createdAt: 1 });
        console.log(chat);
        const chats = chat.map((el) => ({
            message: el.message,
            sender: el.sender
        }));

        res.json({ chat: chats });
    } catch (error) {
        res.status(500).json({ error: "Couldn't find chat" });
    }
}

