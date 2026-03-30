import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Auth.css";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", roleId: 3 });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    if (form.password.length < 6) { toast.error("Mật khẩu phải từ 6 ký tự"); return; }
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password, roleId: Number(form.roleId) });
      toast.success(res.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon">🎓</span>
          <div><h1>NewSky English</h1><p>Nền tảng học tiếng Anh trực tuyến</p></div>
        </div>
        <div className="auth-hero">
          <h2>Bắt đầu hành trình</h2>
          <p>Tạo tài khoản và tham gia cộng đồng học tiếng Anh với lộ trình IELTS, TOEIC chuyên nghiệp.</p>
          <div className="feature-list">
            <div className="feature-item">✅ Lộ trình học IELTS & TOEIC chuẩn quốc tế</div>
            <div className="feature-item">✅ Giáo viên kinh nghiệm, chứng chỉ cao</div>
            <div className="feature-item">✅ Lịch học linh hoạt, online & offline</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Đăng ký tài khoản</h2>
            <p>Điền thông tin để tạo tài khoản mới</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" placeholder="Nguyễn Văn A"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="example@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" placeholder="Tối thiểu 6 ký tự"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" placeholder="Nhập lại mật khẩu"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Đăng ký với tư cách</label>
              <div className="role-selector">
                <button type="button"
                  className={`role-btn ${form.roleId === 3 ? "active" : ""}`}
                  onClick={() => setForm({ ...form, roleId: 3 })}>
                  👨‍🎓 Học viên
                </button>
                <button type="button"
                  className={`role-btn ${form.roleId === 2 ? "active" : ""}`}
                  onClick={() => setForm({ ...form, roleId: 2 })}>
                  👨‍🏫 Giáo viên
                </button>
              </div>
              {form.roleId === 2 && (
                <p className="note-text">⚠️ Tài khoản giáo viên cần được admin phê duyệt trước khi đăng nhập.</p>
              )}
            </div>

            <button type="submit" className="btn-primary-full" disabled={loading}>
              {loading ? <span className="spinner" /> : "Đăng ký"}
            </button>
          </form>

          <p className="auth-footer-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}