import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import UserModal from "../components/UserModal";
import { Toaster } from "react-hot-toast";
import "./UsersPage.css";

const ROLE_LABEL = { ADMIN: "Admin", TEACHER: "Giáo viên", STUDENT: "Học viên" };
const STATUS_LABEL = { ACTIVE: "Hoạt động", INACTIVE: "Không HĐ", BANNED: "Bị khóa" };
const STATUS_CLASS = { ACTIVE: "badge-active", INACTIVE: "badge-inactive", BANNED: "badge-banned" };

export default function UsersPage() {
  const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setSelectedUser(null); setModalOpen(true); };
  const openEdit = (user) => { setSelectedUser(user); setModalOpen(true); };

  const handleSubmit = async (data) => {
    if (selectedUser) await updateUser(selectedUser.id, data);
    else await createUser(data);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    setConfirmDelete(null);
  };

  return (
    <div className="page">
      <Toaster position="top-right" />

      <header className="page-header">
        <div className="header-left">
          <div className="logo-circle">N</div>
          <div>
            <h1>NewSky English</h1>
            <p>Quản lý người dùng</p>
          </div>
        </div>
        <a
          href="https://nhom5-newskyenglish.onrender.com/users"
          target="_blank"
          rel="noreferrer"
          className="api-link"
        >
          🔗 Xem API
        </a>
      </header>

      <main className="main-content">
        <div className="toolbar">
          <div className="search-box">
            <span>🔍</span>
            <input
              placeholder="Tìm kiếm theo tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
            <span className="total-badge">{filtered.length} người dùng</span>
            <button className="btn-refresh" onClick={fetchUsers}>↺ Làm mới</button>
            <button className="btn-add" onClick={openCreate}>+ Thêm mới</button>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner" />
            Đang tải...
          </div>
        )}
        {error && <div className="error-box">⚠️ {error}</div>}

        {!loading && (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id}>
                      <td className="id-cell">#{user.id}</td>
                      <td className="name-cell">
                        <div className="avatar">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} />
                          ) : (
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || "—"}</td>
                      <td>
                        <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                          {ROLE_LABEL[user.role]}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_CLASS[user.status]}`}>
                          {STATUS_LABEL[user.status]}
                        </span>
                      </td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className="action-cell">
                        <button className="btn-edit" onClick={() => openEdit(user)} title="Chỉnh sửa">✏️</button>
                        <button className="btn-delete" onClick={() => setConfirmDelete(user)} title="Xóa">🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
      />

      {confirmDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa user <strong>{confirmDelete.name}</strong>?<br/>Hành động này không thể hoàn tác.</p>
            <div className="confirm-actions">
              <button onClick={() => setConfirmDelete(null)}>Hủy</button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(confirmDelete.id)}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
