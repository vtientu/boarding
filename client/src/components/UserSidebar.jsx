import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/UserSidebar.css";

const UserSidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isTenant = user.role_id.role_name === "Tenant";

  const menuItems = [
    { path: "/user-dashboard", label: "Trang chủ" },
    { path: "/profile", label: "QL thông tin cá nhân" },
    { path: "/payment", label: "QL hoá đơn" },
    { path: "/notifications", label: "Thông báo" },
    { path: "/chat", label: "Chat" },
  ];

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {(isTenant ? menuItems : []).map((item) => (
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
