import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../admin/Admin.css";

export default function TeacherNotifications() {
  const [tab, setTab] = useState("send"); // send | inbox
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [myNotifs, setMyNotifs] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", targetClassId: "", targetUserId: "", type: "course" });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/teacher/classes").then(r => setClasses(r.data.data || [])).catch(() => {});
    api.get("/users").then(r => setUsers((r.data.data || []).filter(u => u.roleId === 3))).catch(() => {});
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const r = await api.get("/notifications/my").catch(() => ({ data: { data: [] } }));
      setMyNotifs(r.data.data || []);
    } catch { setMyNotifs([]); }
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!form.title || !form.content) { toast.error("Nhập đầy đủ tiêu đề và nội dung"); return; }
    if (!form.targetClassId && !form.targetUserId) { toast.error("Chọn lớp hoặc học viên nhận thông báo"); return; }
    setSending(true);
    try {
      await api.post("/teacher/notifications/send", form);
      toast.success("Đã gửi thông báo thành công!");
      setForm({ title: "", content: "", targetClassId: "", targetUserId: "", type: "course" });
    } catch { toast.error("Gửi thất bại"); }
    finally { setSending(false); }
  };

  // Học viên trong lớp được chọn
  const classStudents = form.targetClassId
    ? users.filter(u => u.classId === Number(form.targetClassId))
    : users;

  const TYPE_ICON = { course: "📚", schedule: "📅", assignment: "📋", system: "⚙️", announcement: "📣" };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Thông báo</h1>
        <p>Gửi thông báo cho học viên và nhận thông báo từ admin</p>
      </div>

      <div className="teacher-tabs">
        <button className={`ttab ${tab === "send" ? "active" : ""}`} onClick={() => setTab("send")}>
          📤 Gửi thông báo
        </button>
        <button className={`ttab ${tab === "inbox" ? "active" : ""}`} onClick={() => { setTab("inbox"); fetchInbox(); }}>
          📥 Hộp thư ({myNotifs.filter(n => !n.read).length} mới)
        </button>
      </div>

      {tab === "send" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="section-card">
            <h3 className="section-title">📢 Soạn thông báo</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group"><label>Loại thông báo</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="filter-select" style={{ width: "100%" }}>
                  <option value="course">📚 Về khóa học</option>
                  <option value="schedule">📅 Về lịch học</option>
                  <option value="assignment">📋 Về bài tập</option>
                  <option value="announcement">📣 Thông báo chung</option>
                </select>
              </div>

              <div className="form-group"><label>Gửi đến lớp</label>
                <select value={form.targetClassId} onChange={e => setForm({...form, targetClassId: e.target.value, targetUserId: ""})} className="filter-select" style={{ width: "100%" }}>
                  <option value="">— Chọn lớp —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ textAlign: "center", color: "var(--gray-400)", fontSize: "0.82rem" }}>— hoặc —</div>

              <div className="form-group"><label>Gửi cá nhân</label>
                <select value={form.targetUserId} onChange={e => setForm({...form, targetUserId: e.target.value, targetClassId: ""})} className="filter-select" style={{ width: "100%" }}>
                  <option value="">— Chọn học viên —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>

              <div className="form-group"><label>Tiêu đề *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="VD: Thông báo hoãn buổi học..." className="search-input" style={{ width: "100%" }} />
              </div>

              <div className="form-group"><label>Nội dung *</label>
                <textarea rows={5} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  placeholder="Nhập nội dung thông báo..."
                  style={{ padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 8, fontSize: "0.875rem", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
              </div>

              <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
                {sending ? <span className="spinner" /> : "📤 Gửi thông báo"}
              </button>
            </div>
          </div>

          <div className="section-card">
            <h3 className="section-title">💡 Hướng dẫn</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.875rem", color: "var(--gray-600)" }}>
              <div style={{ background: "var(--primary-light)", borderRadius: 8, padding: "12px 14px" }}>
                <strong style={{ color: "var(--primary)" }}>📚 Gửi theo lớp:</strong>
                <p style={{ marginTop: 4 }}>Chọn lớp học để gửi đến tất cả học viên trong lớp đó.</p>
              </div>
              <div style={{ background: "#fff7ed", borderRadius: 8, padding: "12px 14px" }}>
                <strong style={{ color: "var(--secondary)" }}>👤 Gửi cá nhân:</strong>
                <p style={{ marginTop: 4 }}>Chọn học viên cụ thể để gửi thông báo riêng tư.</p>
              </div>
              <div style={{ background: "var(--success-light)", borderRadius: 8, padding: "12px 14px" }}>
                <strong style={{ color: "var(--success)" }}>⚠️ Lưu ý:</strong>
                <p style={{ marginTop: 4 }}>Chỉ gửi được đến học viên trong lớp của bạn. Không thể gửi cho giáo viên khác.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "inbox" && (
        <div className="section-card">
          <h3 className="section-title">📥 Thông báo từ Admin</h3>
          {loading ? <div className="page-loading"><div className="spinner" /></div> :
            myNotifs.length === 0
              ? <div className="empty-state"><p>Không có thông báo nào</p></div>
              : myNotifs.map(n => (
                <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`}>
                  <div className="notif-icon">{TYPE_ICON[n.type] || "🔔"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p style={{ fontWeight: !n.read ? 700 : 500, fontSize: "0.9rem" }}>{n.title}</p>
                      <span style={{ fontSize: "0.72rem", color: "var(--gray-400)", flexShrink: 0, marginLeft: 8 }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginTop: 3 }}>{n.content}</p>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}
