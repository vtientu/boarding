import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
	const location = useLocation();

	return (
		<div className="sidebar">
			<nav className="sidebar-nav">
				<Link
					to="/dashboard"
					className={`nav-item ${
						location.pathname === "/dashboard" ? "active" : ""
					}`}
				>
					Trang chủ
				</Link>
				<Link
					to="/boarding-houses"
					className={`nav-item ${
						location.pathname === "/boarding-houses" ? "active" : ""
					}`}
				>
					QL Nhà trọ
				</Link>
				<Link
					to="/rooms"
					className={`nav-item ${
						location.pathname === "/rooms" ? "active" : ""
					}`}
				>
					QL Phòng trọ
				</Link>
				<Link
					to="/tenants"
					className={`nav-item ${
						location.pathname === "/tenants" ? "active" : ""
					}`}
				>
					QL người thuê
				</Link>
				<Link
					to="/bills"
					className={`nav-item ${
						location.pathname === "/bills" ? "active" : ""
					}`}
				>
					QL Thu tiền & hoá đơn
				</Link>
				<Link
					to="/reports"
					className={`nav-item ${
						location.pathname === "/reports" ? "active" : ""
					}`}
				>
					Báo cáo
				</Link>
			</nav>
		</div>
	);
};

export default Sidebar;
