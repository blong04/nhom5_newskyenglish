import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./ProfileModal.css";

export default function ProfileModal({ onClose, initialTab = "info" }) {
  const { user } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleUpdateInfo = async () => {
    if (!form.name?.trim()) {
      toast.error("Họ tên không được để trống");
      return;
    }
    setLoading(true);
    try {
      // Chỉ gửi các field cần thiết, KHÔNG gửi avatarUrl nếu trống
      const payload = {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber || null,
        address: form.address || null,
      };
      // Chỉ thêm avatarUrl nếu user thực sự nhập
      if (form.avatarUrl && form.avatarUrl.trim().startsWith("http")) {
        payload.avatarUrl = form.avatarUrl.trim();
      }

      await api.put(`/users/${user.id}`, payload);

      const updated = { ...user, ...payload };
      localStorage.setItem("user", JSON.stringify(updated));
      toast.success("Cập nhật thông tin thành công!");
      onClose();
    } catch (e) {
      console.error("Update error:", e);
      toast.error(e.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword) {
      toast.error("Nhập mật khẩu hiện tại");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải từ 6 ký tự");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/${user.id}/change-password`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || "Mật khẩu hiện tại không đúng");
    } finally {
      setLoading(false);
    }
  };

  const ROLE_NAMES = { 1: "Admin", 2: "Giáo viên", 3: "Học viên" };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar-big">
            {user?.avatarUrl && !avatarError
              ? <img
                  src={user.avatarUrl}
                  alt=""
                  onError={() => setAvatarError(true)}
                />
              : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
            }
          </div>
          <div className="profile-header-info">
            <h3>{user?.name}</h3>
            <span className="profile-role-badge">{ROLE_NAMES[user?.roleId]}</span>
            <p>{user?.email}</p>
          </div>
          <button className="profile-close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`ptab ${tab === "info" ? "active" : ""}`}
            onClick={() => setTab("info")}>
            👤 Thông tin
          </button>
          <button
            className={`ptab ${tab === "password" ? "active" : ""}`}
            onClick={() => setTab("password")}>
            🔒 Đổi mật khẩu
          </button>
        </div>

        {/* Tab Thông tin */}
        {tab === "info" && (
          <div className="profile-body">
            <div className="pform-group">
              <label>Họ và tên *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="pform-group">
              <label>Email</label>
              <input
                value={user?.email || ""}
                disabled
                readOnly
                style={{ opacity: 0.55, cursor: "not-allowed", background: "var(--gray-100)" }}
              />
              <span className="field-note">Email không thể thay đổi</span>
            </div>
            <div className="pform-group">
              <label>Số điện thoại</label>
              <input
                value={form.phoneNumber}
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                placeholder="0901234567"
              />
            </div>
            <div className="pform-group">
              <label>Địa chỉ</label>
              <input
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="TP. Hồ Chí Minh"
              />
            </div>
            <div className="pform-group">
              <label>
                URL ảnh đại diện{" "}
                <span style={{ color: "var(--gray-400)", fontWeight: 400, textTransform: "none" }}>
                  (tùy chọn)
                </span>
              </label>
              <input
                value={form.avatarUrl}
                onChange={e => {
                  setAvatarError(false);
                  setForm({ ...form, avatarUrl: e.target.value });
                }}
                placeholder="https://... (để trống nếu không có)"
                autoComplete="off"
              />
            </div>
            <button
              className="btn-profile-save"
              onClick={handleUpdateInfo}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "💾 Lưu thay đổi"}
            </button>
          </div>
        )}

        {/* Tab Đổi mật khẩu */}
        {tab === "password" && (
          <div className="profile-body">
            <div className="pform-group">
              <label>Mật khẩu hiện tại *</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div className="pform-group">
              <label>Mật khẩu mới *</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <div className="pform-group">
              <label>Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button
              className="btn-profile-save"
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "🔒 Đổi mật khẩu"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}