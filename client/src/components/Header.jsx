import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import "../styles/Header.css";

const Header = () => {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="header">
			<div className="header-left">
				<h1>Hệ thống quản lý nhà trọ</h1>
			</div>

			<div className="header-right">
				<div className="admin-menu" onClick={() => setMenuOpen(!menuOpen)}>
					<FaUserCircle className="admin-icon" />
					<span className="admin-text">Admin</span>
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
				<FaBars className="menu-icon" />
			</div>
		</header>
	);
};

export default Header;
