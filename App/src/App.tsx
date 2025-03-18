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

function App() {
	return (
		<>
			<Toaster richColors />
			<Router>
				<Routes>
					<Route path="/signup" element={<SignupPage />} />
					<Route path="/" element={<Layout />}>
						<Route path="/harsh" element={<>hello harsh</>} />
					</Route>
				</Routes>
			</Router>
		</>
	);
}

export default App;
