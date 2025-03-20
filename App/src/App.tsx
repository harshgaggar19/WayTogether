import { useState } from "react";
import "./App.css";
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

function App() {
	return (
		<>
			<Toaster richColors />
			<Router>
				<Routes>
					<Route path="/signup" element={<SignupPage />} />
					<Route path="/" element={<Layout />}>
						<Route path="/harsh" element={<>hello harsh</>} />
						<Route path="/home" element={<SourceDestinationHome/>} />
					</Route>
				</Routes>
			</Router>
		</>
	);
}

export default App;
