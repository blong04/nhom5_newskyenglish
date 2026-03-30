import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileModal from "../shared/ProfileModal";
import toast from "react-hot-toast";
import "./Layout.css";

const navItems = [
  { to: "/admin", icon: "📊", label: "Dashboard", end: true },
  { to: "/admin/users", icon: "👥", label: "Người dùng" },
  { to: "/admin/courses", icon: "📚", label: "Khóa học" },
  { to: "/admin/classes", icon: "🏫", label: "Lớp học" },
  { to: "/admin/quizzes", icon: "📝", label: "Bài kiểm tra" },
  { to: "/admin/enrollments", icon: "✅", label: "Đăng ký học" },
  { to: "/admin/notifications", icon: "🔔", label: "Thông báo" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState("info");
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); toast.success("Đã đăng xuất"); navigate("/login"); };

  const openProfile = (tab = "info") => { setProfileTab(tab); setShowProfile(true); setDropdown(false); };

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
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        {/* Không có footer */}
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <h2 className="page-heading">Admin</h2>
          <div className="header-right">
            <span className="welcome-text">{user?.name}</span>
            <div className="avatar-dropdown-wrap" ref={dropRef}>
              <div className="header-avatar" onClick={() => setDropdown(d => !d)}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="" />
                  : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>}
              </div>
              {dropdown && (
                <div className="avatar-dropdown">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">
                      {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-role">Admin</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => openProfile("info")}>
                    👤 Thông tin cá nhân
                  </button>
                  <button className="dropdown-item" onClick={() => openProfile("password")}>
                    🔒 Đổi mật khẩu
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content-area"><Outlet /></main>
      </div>

      {showProfile && <ProfileModal initialTab={profileTab} onClose={() => setShowProfile(false)} />}
    </div>
  );
}