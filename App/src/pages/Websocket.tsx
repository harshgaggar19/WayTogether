// import { createContext, useContext, useEffect, useRef, useState } from "react";

// interface WebSocketContextType {
//     notifications: Notification[];
//     connectWebSocket: (userId: string) => void;
//     removeNotification: (roomId: string) => void;
//   }

//   // ✅ Use explicit typing instead of null
//   const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// interface Notification {
//     message: string;
//     sender: string;
//     roomId:string
// }

// export function WebSocketProvider({ children }) {
//   const wsRef = useRef<WebSocket | null>(null);
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   const connectWebSocket = (userId) => {
//     if (!userId || wsRef.current) return;

//     wsRef.current = new WebSocket("ws://localhost:8081");

//     wsRef.current.onopen = () => {
//       console.log("WebSocket connected");
//       wsRef.current?.send(JSON.stringify({ type: "connect", userId }));
//     };

//     wsRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("Received message:", data);
//       if (data.type === "Notification") {
//         setNotifications((prev) => [...prev, { message: data.message, sender: data.sender,roomId:data.roomId }]);
//       }
//     };

//     wsRef.current.onclose = () => {
//       console.log("WebSocket disconnected. Reconnecting...");
//       setTimeout(() => connectWebSocket(userId), 2000);
//     };
//   };

//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible" && wsRef.current?.readyState !== WebSocket.OPEN) {
//         connectWebSocket();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, []);
//   const removeNotification = (roomId: string) => {
//     setNotifications((prev) => prev.filter((notif) => notif?.roomId !== roomId));
// };

//   return (
//     <WebSocketContext.Provider value={{ notifications, connectWebSocket,removeNotification }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// }

// export function useWebSocket() {
//   return useContext(WebSocketContext);
// }
import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useMemo,
	useCallback,
} from "react";
import { toast } from "sonner";

interface Notification {
	message: string;
	sender: string;
	roomId: string;
}

interface WebSocketContextType {
	notifications: Notification[];
	connectWebSocket: (userId: string) => void;
	removeNotification: (roomId: string) => void;
}

// Define context with undefined default
const WebSocketContext = createContext<WebSocketContextType | undefined>(
	undefined
);

interface WebSocketProviderProps {
    children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
	const wsRef = useRef<WebSocket | null>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const userIdRef = useRef<string | null>(null); // for reconnect logic

	const connectWebSocket = (userId: string) => {
		if (!userId || wsRef.current) return;

		userIdRef.current = userId;
		wsRef.current = new WebSocket("ws://localhost:8081");

		wsRef.current.onopen = () => {
			console.log("WebSocket connected");
			wsRef.current?.send(JSON.stringify({ type: "connect", userId }));
		};

		wsRef.current.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("Received message:", data);
			if (data.type === "Notification") {
				setNotifications((prev) => [
					...prev,
					{ message: data.message, sender: data.sender, roomId: data.roomId },
				]);
				toast.success("Notification received");
			}
		};

		wsRef.current.onclose = () => {
			console.log("WebSocket disconnected. Reconnecting...");
			wsRef.current = null;
			setTimeout(() => {
				if (userIdRef.current) {
					connectWebSocket(userIdRef.current);
				}
			}, 2000);
		};
	};

	const removeNotification = useCallback((roomId: string) => {
		setNotifications((prev) =>
			prev.filter((notif) => notif?.roomId !== roomId)
		);
	}, []);

	// Reconnect on visibility change if needed
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (
				document.visibilityState === "visible" &&
				wsRef.current?.readyState !== WebSocket.OPEN &&
				userIdRef.current
			) {
				connectWebSocket(userIdRef.current);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, []);

	// 🔐 Memoize to prevent re-renders
	const contextValue = useMemo(
		() => ({
			notifications,
			connectWebSocket,
			removeNotification,
		}),
		[notifications]
	);

	return (
		<WebSocketContext.Provider value={contextValue}>
			{children}
		</WebSocketContext.Provider>
	);
}

export function useWebSocket() {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
}
