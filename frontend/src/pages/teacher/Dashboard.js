import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../admin/Admin.css";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/teacher/classes")
      .then(r => setClasses(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Xin chào, {user?.name} 👋</h1>
        <p>Đây là tổng quan công việc giảng dạy của bạn</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ "--card-color": "#0ea5e9" }}>
          <div className="stat-icon">🏫</div>
          <div className="stat-body">
            <p className="stat-label">Lớp đang dạy</p>
            <h3 className="stat-value">{classes.length}</h3>
          </div>
        </div>
        <div className="stat-card" style={{ "--card-color": "#16a34a" }}>
          <div className="stat-icon">📋</div>
          <div className="stat-body">
            <p className="stat-label">Bài tập đã tạo</p>
            <h3 className="stat-value">—</h3>
          </div>
        </div>
        <div className="stat-card" style={{ "--card-color": "#d97706" }}>
          <div className="stat-icon">📝</div>
          <div className="stat-body">
            <p className="stat-label">Bài chờ chấm</p>
            <h3 className="stat-value">—</h3>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title">Lớp học của tôi</h3>
        {loading ? <div className="page-loading"><div className="spinner" /></div> :
          classes.length === 0
            ? <div className="empty-state"><p>Bạn chưa được phân công lớp nào</p></div>
            : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {classes.map(c => (
                  <Link key={c.id} to="/teacher/classes" style={{ textDecoration: "none" }}>
                    <div style={{ border: "1.5px solid var(--gray-200)", borderRadius: 10, padding: 16, background: "#fff", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#0ea5e9"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--gray-200)"}>
                      <p style={{ fontWeight: 600, color: "var(--gray-800)" }}>{c.name}</p>
                      <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginTop: 4 }}>
                        {c.currentStudents || 0}/{c.maxStudents} học viên
                      </p>
                      <span className={`badge ${c.status === "active" ? "badge-green" : "badge-yellow"}`} style={{ marginTop: 8, display: "inline-block" }}>
                        {c.status === "active" ? "Đang học" : "Chờ khai giảng"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )
        }
      </div>
    </div>
  );
}