
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
import NotFoundPage from "./pages/NotFoundPage"; // Import 404 Page
import { useAuth } from "@clerk/clerk-react"; // Authentication Hook
import { ReactElement } from "react";

interface ProtectedRouteProps {
	element: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
	const { isSignedIn } = useAuth(); 
	return isSignedIn ? element : <Navigate to="/signup" replace />;
};


function App() {
	return (
		<>
			<Toaster richColors />
			<Router>
				<Routes>
					{/* Public Routes */}
					<Route path="/signup" element={<SignupPage />} />

					{/* Private Routes (Requires Authentication) */}
					<Route path="/" element={<Layout />}>
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
				</Routes>
			</Router>
		</>
	);
}

export default App;
