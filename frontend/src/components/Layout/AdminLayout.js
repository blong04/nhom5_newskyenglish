import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Layout.css";

const navItems = [
  { to: "/admin", icon: "⊞", label: "Dashboard", end: true },
  { to: "/admin/users", icon: "👥", label: "Người dùng" },
  { to: "/admin/courses", icon: "📚", label: "Khóa học" },
  { to: "/admin/classes", icon: "🏫", label: "Lớp học" },
  { to: "/admin/quizzes", icon: "📝", label: "Bài kiểm tra" },
  { to: "/admin/assignments", icon: "📋", label: "Bài tập" },
  { to: "/admin/enrollments", icon: "✅", label: "Đăng ký học" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/login");
  };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
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
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            {!collapsed && (
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <p className="user-role">Admin</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
            🚪
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <h2 className="page-heading">Quản trị hệ thống</h2>
          <div className="header-right">
            <span className="welcome-text">Xin chào, {user?.name}</span>
          </div>
        </header>
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}