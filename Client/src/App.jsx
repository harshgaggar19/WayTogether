import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";

function App() {
	return (
		<Router>
			<Routes>
        <Route path="/home" element={ <Home/>} />
			</Routes>
		</Router>
	);
}

export default App;
