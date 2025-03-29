import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/UserSidebar.css";

const UserSidebar = () => {
	const location = useLocation();

	const menuItems = [
		{ path: "/user-dashboard", label: "Trang chủ" },
		{ path: "/profile", label: "QL thông tin cá nhân" },
		{ path: "/bills", label: "QL hoá đơn" },
		{ path: "/notifications", label: "Thông báo" },
	];

	return (
		<div className="sidebar">
			<nav className="sidebar-nav">
				{menuItems.map((item) => (
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

export default UserSidebar;
