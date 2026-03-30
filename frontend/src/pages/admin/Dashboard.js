import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./Admin.css";

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card" style={{ "--card-color": color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(r => setStats(r.data.data))
      .catch(() => setStats({
        totalUsers: 0, totalStudents: 0, totalTeachers: 0,
        pendingTeachers: 0, totalCourses: 0, activeClasses: 0,
        pendingEnrollments: 0
      }))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats ? [
    { name: "Học viên", value: stats.totalStudents, fill: "#2563eb" },
    { name: "Giáo viên", value: stats.totalTeachers, fill: "#0ea5e9" },
    { name: "Khóa học", value: stats.totalCourses, fill: "#16a34a" },
    { name: "Lớp hoạt động", value: stats.activeClasses, fill: "#d97706" },
  ] : [];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống NewSky English</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="👥" label="Tổng người dùng" value={stats?.totalUsers} color="#2563eb" />
        <StatCard icon="👨‍🎓" label="Học viên" value={stats?.totalStudents} color="#16a34a" />
        <StatCard icon="👨‍🏫" label="Giáo viên" value={stats?.totalTeachers} color="#0ea5e9"
          sub={stats?.pendingTeachers > 0 ? `${stats.pendingTeachers} chờ duyệt` : null} />
        <StatCard icon="📚" label="Khóa học" value={stats?.totalCourses} color="#d97706" />
        <StatCard icon="🏫" label="Lớp đang học" value={stats?.activeClasses} color="#7c3aed" />
        <StatCard icon="⏳" label="Chờ đăng ký duyệt" value={stats?.pendingEnrollments} color="#dc2626" />
      </div>

      <div className="chart-section">
        <div className="section-card">
          <h3 className="section-title">Thống kê hệ thống</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}