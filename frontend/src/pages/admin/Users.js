import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";

const ROLE_NAMES = { 1: "Admin", 2: "Giáo viên", 3: "Học viên" };
const ROLE_BADGES = { 1: "badge-purple", 2: "badge-blue", 3: "badge-green" };
const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: 3 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([api.get("/users"), api.get("/admin/pending-teachers")]);
      setUsers(u.data.data || []);
      setPending(p.data.data || []);
    } catch { toast.error("Không thể tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = users.filter(u =>
    (!search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.roleId === Number(roleFilter)) &&
    (!statusFilter || u.status === statusFilter)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApprove = async (id) => {
    try { await api.put(`/admin/users/${id}/approve`); toast.success("Đã phê duyệt"); fetchData(); }
    catch { toast.error("Thất bại"); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Từ chối và xóa tài khoản này?")) return;
    try { await api.delete(`/admin/users/${id}/reject`); toast.success("Đã từ chối"); fetchData(); }
    catch { toast.error("Thất bại"); }
  };

  const handleToggleLock = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    const msg = newStatus === "suspended" ? "Khóa tài khoản?" : "Mở khóa tài khoản?";
    if (!window.confirm(msg)) return;
    try {
      await api.put(`/users/${user.id}`, { status: newStatus });
      toast.success(newStatus === "suspended" ? "Đã khóa tài khoản" : "Đã mở khóa");
      fetchData();
    } catch { toast.error("Thất bại"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn người dùng này?")) return;
    try { await api.delete(`/users/${id}`); toast.success("Đã xóa"); fetchData(); }
    catch { toast.error("Thất bại"); }
  };

  const handleSave = async () => {
    try {
      await api.post("/users", { ...form, roleId: Number(form.roleId) });
      toast.success("Thêm thành công"); setModal(null); fetchData();
    } catch (e) { toast.error(e.response?.data?.message || "Thất bại"); }
  };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Quản lý người dùng</h1>
        <p>Tổng {users.length} người dùng trong hệ thống</p>
      </div>

      {/* Pending teachers */}
      {pending.length > 0 && (
        <div className="section-card" style={{ borderLeft: "4px solid var(--warning)", marginBottom: 16 }}>
          <h3 className="section-title">⏳ Giáo viên chờ phê duyệt ({pending.length})</h3>
          <table className="data-table">
            <thead><tr><th>Họ tên</th><th>Email</th><th>Ngày đăng ký</th><th>Thao tác</th></tr></thead>
            <tbody>
              {pending.map(u => (
                <tr key={u.id}>
                  <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="avatar">{u.name?.charAt(0)}</div>{u.name}
                  </div></td>
                  <td style={{ color: "var(--gray-500)" }}>{u.email}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(u.id)}>✅ Duyệt</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(u.id)}>❌ Từ chối</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="🔍 Tìm tên, email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả vai trò</option>
            <option value="1">Admin</option>
            <option value="2">Giáo viên</option>
            <option value="3">Học viên</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không HĐ</option>
            <option value="suspended">Bị khóa</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ name: "", email: "", password: "", roleId: 3 }); setModal("add"); }}>
          + Thêm người dùng
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? <div className="page-loading"><div className="spinner" /></div> : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {paginated.length === 0
                  ? <tr><td colSpan={6} className="empty-state"><p>Không có dữ liệu</p></td></tr>
                  : paginated.map(u => (
                    <tr key={u.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar">{u.name?.charAt(0)?.toUpperCase()}</div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div></td>
                      <td style={{ color: "var(--gray-500)", fontSize: "0.85rem" }}>{u.email}</td>
                      <td><span className={`badge ${ROLE_BADGES[u.roleId]}`}>{ROLE_NAMES[u.roleId]}</span></td>
                      <td>
                        {u.roleId === 2 && !u.approved
                          ? <span className="badge badge-yellow">Chờ duyệt</span>
                          : <span className={`badge ${u.status === "active" ? "badge-green" : u.status === "suspended" ? "badge-red" : "badge-gray"}`}>
                              {u.status === "active" ? "Hoạt động" : u.status === "suspended" ? "Bị khóa" : "Không HĐ"}
                            </span>}
                      </td>
                      <td style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className={`btn btn-sm ${u.status === "suspended" ? "btn-success" : "btn-warning"}`}
                            onClick={() => handleToggleLock(u)}
                            title={u.status === "suspended" ? "Mở khóa" : "Khóa tài khoản"}>
                            {u.status === "suspended" ? "🔓" : "🔒"}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)} title="Xóa">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Hiển thị {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}
                </span>
                <div className="pagination-btns">
                  <button className="page-btn" disabled={page===1} onClick={() => setPage(p => p-1)}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i+1} className={`page-btn ${page===i+1?"active":""}`} onClick={() => setPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="page-btn" disabled={page===totalPages} onClick={() => setPage(p => p+1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm người dùng</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Họ tên</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label>Mật khẩu</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <div className="form-group"><label>Vai trò</label>
                <select value={form.roleId} onChange={e => setForm({...form, roleId: Number(e.target.value)})}>
                  <option value={1}>Admin</option>
                  <option value={2}>Giáo viên</option>
                  <option value={3}>Học viên</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}