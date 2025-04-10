import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import "../styles/Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="header">
      <div className="header-left">
        <h1>Hệ thống quản lý nhà trọ</h1>
      </div>

      <div className="header-right">
        <div className="admin-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <FaUserCircle className="admin-icon" />
          <span className="admin-text">{user?.name || "Admin"}</span>
          {menuOpen && (
            <div className="dropdown-menu">
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
