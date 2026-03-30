import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import "../admin/Admin.css";
import "./Student.css";

export default function StudentNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/notifications/my").catch(() => ({ data: { data: [] } }))
      .then(r => setNotifs(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) =>{
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch { }
  };

  const TYPE_ICON = {
    course: "📚", schedule: "📅", assignment: "📋",
    system: "⚙️", announcement: "📣"
  };

  const filtered = notifs.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "assignment") return n.type === "assignment";
    if (filter === "schedule") return n.type === "schedule";
    return true;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Thông báo {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}</h1>
            <p>Thông báo từ giáo viên và admin</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
              ✅ Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="teacher-tabs" style={{ marginBottom: 16 }}>
        {[
          { key: "all", label: `Tất cả (${notifs.length})` },
          { key: "unread", label: `Chưa đọc (${unreadCount})` },
          { key: "assignment", label: "📋 Bài tập" },
          { key: "schedule", label: "📅 Lịch học" },
        ].map(f => (
          <button key={f.key} className={`ttab ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="section-card">
        {loading ? <div className="page-loading"><div className="spinner" /></div> :
          filtered.length === 0
            ? <div className="empty-state"><p>Không có thông báo nào</p></div>
            : filtered.map(n => (
              <div key={n.id}
                className={`notif-item ${!n.read ? "unread" : ""}`}
                onClick={() => !n.read && markRead(n.id)}
                style={{ cursor: !n.read ? "pointer" : "default" }}>
                <div className="notif-icon">{TYPE_ICON[n.type] || "🔔"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ fontWeight: !n.read ? 700 : 500, fontSize: "0.9rem", color: "var(--gray-900)" }}>
                      {n.title}
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "var(--gray-400)", flexShrink: 0, marginLeft: 8 }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginTop: 3, lineHeight: 1.5 }}>
                    {n.content}
                  </p>
                </div>
                {!n.read && <div className="notif-dot" />}
              </div>
            ))
        }
      </div>
    </div>
  );
}