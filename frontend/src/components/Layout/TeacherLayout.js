import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Layout.css";

const navItems = [
  { to: "/teacher", icon: "⊞", label: "Dashboard", end: true },
  { to: "/teacher/classes", icon: "🏫", label: "Lớp của tôi" },
  { to: "/teacher/assignments", icon: "📋", label: "Bài tập" },
  { to: "/teacher/students", icon: "👨‍🎓", label: "Học viên" },
];

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); toast.success("Đã đăng xuất"); navigate("/login"); };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar sidebar-teacher">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🎓</span>
            {!collapsed && <span className="logo-text">NewSky English</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            {!collapsed && <div className="user-details"><p className="user-name">{user?.name}</p><p className="user-role">Giáo viên</p></div>}
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪</button>
        </div>
      </aside>
      <div className="main-wrapper">
        <header className="top-header">
          <h2 className="page-heading">Giáo viên</h2>
          <div className="header-right"><span className="welcome-text">Xin chào, {user?.name}</span></div>
        </header>
        <main className="content-area"><Outlet /></main>
      </div>
    </div>
  );
}