import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
	const location = useLocation();
	const user = JSON.parse(localStorage.getItem("user"));
	const isAdmin = user.role_id.role_name === "Owner";

	const menuItems = [
		{ path: "/dashboard", label: "Trang chủ" },
		{ path: "/boarding-houses", label: "QL Nhà trọ" },
		{ path: "/tenants", label: "QL người thuê" },
		{ path: "/contracts", label: "QL Hợp đồng" },
		{ path: "/bills", label: "Quản lý hoá đơn" },
		{ path: "/chat", label: "Chat" },
	];
	return (
		<div className="sidebar">
			<nav className="sidebar-nav">
				{(isAdmin ? menuItems : []).map((item) => (
					<Link
						key={item.path}
						to={item.path}
						className={`nav-item ${
							location.pathname === item.path ? "active" : ""
						}`}
					>
						<span className="nav-item-label">{item.label}</span>
					</Link>
				))}
			</nav>
		</div>
	);
};

export default Sidebar;
