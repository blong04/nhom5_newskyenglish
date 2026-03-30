import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";

export default function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", targetRole: "", targetUserId: "", type: "announcement" });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/users").then(r => setUsers(r.data.data || [])).catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!form.title || !form.content) { toast.error("Nhập đầy đủ tiêu đề và nội dung"); return; }
    setSending(true);
    try {
      await api.post("/admin/notifications/send", {
        title: form.title,
        content: form.content,
        type: form.type,
        targetRole: form.targetRole ? Number(form.targetRole) : null,
        targetUserId: form.targetUserId ? Number(form.targetUserId) : null,
      });
      toast.success("Gửi thông báo thành công!");
      setForm({ title: "", content: "", targetRole: "", targetUserId: "", type: "announcement" });
    } catch { toast.error("Gửi thất bại"); }
    finally { setSending(false); }
  };

  const targetUsers = users.filter(u =>
    !form.targetRole || u.roleId === Number(form.targetRole)
  );

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Gửi thông báo</h1>
        <p>Gửi thông báo đến học viên, giáo viên hoặc cá nhân</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="section-card">
          <h3 className="section-title">📢 Soạn thông báo</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group">
              <label>Loại thông báo</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="filter-select" style={{ width: "100%" }}>
                <option value="announcement">📣 Thông báo chung</option>
                <option value="system">⚙️ Hệ thống</option>
                <option value="course">📚 Khóa học</option>
                <option value="schedule">📅 Lịch học</option>
              </select>
            </div>

            <div className="form-group">
              <label>Gửi đến</label>
              <select value={form.targetRole} onChange={e => setForm({...form, targetRole: e.target.value, targetUserId: ""})} className="filter-select" style={{ width: "100%" }}>
                <option value="">🌐 Tất cả mọi người</option>
                <option value="2">👨‍🏫 Tất cả giáo viên</option>
                <option value="3">👨‍🎓 Tất cả học viên</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hoặc gửi cá nhân</label>
              <select value={form.targetUserId} onChange={e => setForm({...form, targetUserId: e.target.value})} className="filter-select" style={{ width: "100%" }}>
                <option value="">— Chọn người nhận cụ thể —</option>
                {targetUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tiêu đề *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="VD: Thông báo lịch nghỉ Tết Nguyên Đán" className="search-input" style={{ width: "100%" }} />
            </div>

            <div className="form-group">
              <label>Nội dung *</label>
              <textarea rows={5} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                placeholder="Nhập nội dung thông báo..."
                style={{ padding: "8px 12px", border: "1.5px solid var(--gray-200)", borderRadius: 8, fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "inherit" }} />
            </div>

            <div style={{ background: "var(--primary-light)", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem", color: "var(--primary)" }}>
              📨 Sẽ gửi đến: <strong>
                {form.targetUserId
                  ? users.find(u => u.id === Number(form.targetUserId))?.name
                  : form.targetRole === "2" ? "Tất cả giáo viên"
                  : form.targetRole === "3" ? "Tất cả học viên"
                  : "Tất cả mọi người"}
              </strong>
            </div>

            <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? <span className="spinner" /> : "📤 Gửi thông báo"}
            </button>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">📋 Lịch sử gửi gần đây</h3>
          <div className="empty-state"><p>Chưa có lịch sử thông báo</p></div>
        </div>
      </div>
    </div>
  );
}