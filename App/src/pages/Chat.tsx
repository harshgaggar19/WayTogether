import { useEffect, useState  } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useWebSocket } from "../pages/Websocket";

const Chat = () => {
  const { removeNotification } = useWebSocket(); 
  const {user} = useUser();
 
  // console.log("Hell",user);
  const [messages, setMessages] = useState<{ message: string; sender: string }[]>([]);
  
    const [currUserData, setCurrUserData] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState("");
  // const currentUserId = user?.id;
  const [currentUserId,setcurrentUserId]=useState();
  // Your user ID
  const {roomId} = useParams<{ roomId: string }>();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
	const backend_url = import.meta.env.VITE_BACKEND_URL;

// console.log(roomId);
  useEffect(() => {
		fetch(`${backend_url}/users/get-current-user?clerkUserId=${user?.id}`)
			.then((res) => res.json())
			.then((data) => {
				// console.log("Fetched user data:", data);
				if (data.user) {
					// console.log("CurrentID",data.user._id);
					setCurrUserData(data.user);
					setcurrentUserId(data.user._id);
				}
			})
			.catch((error) => {
				console.error("Error fetching user data:", error);
				toast.error("Error fetching current user data");
			});
	}, [user?.id]);

 

  useEffect(() => {
      if (roomId && removeNotification) {
          removeNotification(roomId); // Remove notifications for this chat room
      }
  }, [roomId, removeNotification]);


  useEffect(() => {
    // Fetch previous chat messages
    const fetchChat = async () => {
      try {
        console.log("RoomId",roomId);
        const response = await axios.get(
					`${backend_url}/api/getchat?roomId=${roomId}`
				);
        setMessages(response.data.chat);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    fetchChat();

    // WebSocket setup
    const ws = new WebSocket("ws://localhost:8081");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "Join", roomId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "Chat") {
        setMessages((prev) => [...prev, { message: data.message, sender: data.sender }]);
      } else if (data.type === "PreviousMessages") {
        setMessages(data.messages);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;
    console.log("RID : ",roomId);
    const messageData = {
      type: "Chat",
      roomId,
      sender: currUserData?.phone,
      message: newMessage,
    };
   
    const notifyData = {
      type: "Notification",
      roomId:roomId,
      sender: currUserData?.phone,
      message: newMessage,
    };

    socket.send(JSON.stringify(messageData));
    socket.send(JSON.stringify(notifyData));
    setMessages((prev) => [...prev, { message: newMessage, sender: currUserData?.phone }]);
    setNewMessage("");
  };
  //console.log("USer",currentUserId,currUserData?.phone);
  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <div className="flex items-center p-4 border-b border-gray-300">
        <button
          className="mr-4 px-4 py-2 bg-black text-white rounded-lg"
          onClick={() => window.history.back()}
        >
          ←
        </button>
        <h2 className="text-xl font-bold">Chat</h2>
      </div>
      {/* <a href="tel:+919561009042">Call Now</a> */}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.sender === currentUserId || msg.sender===currUserData?.phone ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-2 max-w-xs rounded-3xl px-4 ${
                msg.sender === currentUserId|| msg.sender===currUserData?.phone ? "bg-gray-300 text-black" : "bg-black text-white"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-300 flex">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-400 rounded-lg"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
