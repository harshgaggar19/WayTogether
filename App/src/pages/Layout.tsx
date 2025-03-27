import React from "react";
import { Outlet } from "react-router-dom";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import "./css/Layout.css";
import { FloatingNav } from "./FloatingNav";
import Navbar from "@/components/Navbar";

const Layout = () => {
	return (
		<div className="layout">
			{/* <FloatingNav /> */}
			<Navbar/>
			<main className="container">
				<Outlet />
			</main>
		</div>
	);
};

export default Layout;
