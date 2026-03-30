import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../admin/Admin.css";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/enrollments")
      .then(r => setEnrollments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active    = enrollments.filter(e => ["approved","enrolled"].includes(e.status));
  const pending   = enrollments.filter(e => e.status === "pending");
  const completed = enrollments.filter(e => e.status === "completed");

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Xin chào, {user?.name} 👋</h1>
        <p>Tiếp tục hành trình học tiếng Anh của bạn</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{"--card-color":"#f97373"}}>
          <div className="stat-icon">📚</div>
          <div className="stat-body">
            <p className="stat-label">Đang học</p>
            <h3 className="stat-value">{active.length}</h3>
          </div>
        </div>
        <div className="stat-card" style={{"--card-color":"#16a34a"}}>
          <div className="stat-icon">✅</div>
          <div className="stat-body">
            <p className="stat-label">Hoàn thành</p>
            <h3 className="stat-value">{completed.length}</h3>
          </div>
        </div>
        <div className="stat-card" style={{"--card-color":"#d97706"}}>
          <div className="stat-icon">⏳</div>
          <div className="stat-body">
            <p className="stat-label">Chờ duyệt</p>
            <h3 className="stat-value">{pending.length}</h3>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 className="section-title" style={{ margin:0 }}>Khóa học đang học</h3>
          <Link to="/student/courses" className="btn btn-primary btn-sm">Xem tất cả</Link>
        </div>
        {loading
          ? <div className="page-loading"><div className="spinner"/></div>
          : active.length === 0
          ? <div className="empty-state">
              <p>Bạn chưa đăng ký khóa học nào.{" "}
                <Link to="/student/courses" style={{ color:"var(--primary)" }}>Đăng ký ngay</Link>
              </p>
            </div>
          : active.map(e => (
            <div key={e.id} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 0", borderBottom:"1px solid var(--gray-100)"
            }}>
              <div>
                {/* Hiện tên thay vì ID */}
                <p style={{ fontWeight:500 }}>
                  {e.courseName || `Khóa học #${e.courseId}`}
                </p>
                <p style={{ fontSize:"0.8rem", color:"var(--gray-500)" }}>
                  Lớp: {e.className || `#${e.classId}`}
                  {e.examType && (
                    <span className={`badge ${e.examType==="IELTS"?"badge-blue":e.examType==="TOEIC"?"badge-green":"badge-gray"}`}
                      style={{ marginLeft:6 }}>
                      {e.examType}
                    </span>
                  )}
                </p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:100, height:6, background:"var(--gray-100)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${e.progress||0}%`, background:"var(--primary)", borderRadius:3 }}/>
                </div>
                <span style={{ fontSize:"0.78rem", color:"var(--gray-500)" }}>{e.progress||0}%</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}