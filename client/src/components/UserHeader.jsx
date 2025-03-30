import React, { useState } from "react";
import "../styles/UserHeader.css";
import { Link } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const UserHeader = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const user = JSON.parse(localStorage.getItem("user"));

	return (
		<header className="header">
			<div className="header-left">
				<h1 className="header-title">Trang chủ</h1>
			</div>
			<div className="header-right">
				<div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
					<span className="user-name">{user?.name || "User"}</span>
					<FaUserCircle size={24} className="user-avatar" />
					{menuOpen && (
						<div className="dropdown-menu">
							<Link to="/profile">Hồ sơ</Link>
							<Link to="/settings">Cài đặt</Link>
							<Link to="/logout" className="logout">
								<FaSignOutAlt /> Đăng xuất
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default UserHeader;
