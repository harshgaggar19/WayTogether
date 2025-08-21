
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import { Toaster } from "./components/ui/sonner";
import Layout from "./pages/Layout";
import SourceDestinationHome from "./pages/SourceDestinationHome";
import MatchedUsers from "./pages/MatchedUsers";
import ViewMatch from "./pages/ViewMatch";
import Chat from "./pages/Chat";

import NotFoundPage from "./pages/NotFoundPage"; // Import 404 Page
import { useAuth } from "@clerk/clerk-react"; // Authentication Hook
import { ReactElement } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import ChatRooms from "./pages/Allchats";
import { WebSocketProvider } from "./pages/Websocket";

interface ProtectedRouteProps {
	element: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
	const { isSignedIn, isLoaded } = useAuth();

	// Wait until Clerk loads before making a decision
	if (!isLoaded) return <LoadingSpinner/>; // or show a loading spinner

	return isSignedIn ? element : <Navigate to="/signup" replace />;
};


function App() {
	return (
		<>
			<Toaster richColors />
			<WebSocketProvider>
			<Router>
				<Routes>
					{/* Public Routes */}
					<Route path="/signup" element={<SignupPage />} />

					{/* Private Routes (Requires Authentication) */}
					<Route path="/" element={<Layout />}>
						
                        <Route index element={<Navigate to="/home" replace />} />
						<Route path="/harsh" element={<>Hello Harsh</>} />
						<Route
							path="/home"
							element={<ProtectedRoute element={<SourceDestinationHome />} />}
						/>
						<Route
							path="/matched-users"
							element={<ProtectedRoute element={<MatchedUsers />} />}
						/>
						<Route
							path="/view-match/:id"
							element={<ProtectedRoute element={<ViewMatch />} />}
						/>
					</Route>

					{/* 404 Not Found Page */}
					<Route path="*" element={<NotFoundPage />} />
					<Route path="/chat/:roomId" element={<Chat></Chat>}></Route>
					<Route path="/allchat/:phone" element={<ChatRooms></ChatRooms>}></Route>
			
				</Routes>
			</Router>
			</WebSocketProvider>
		</>
	);
}

export default App;
