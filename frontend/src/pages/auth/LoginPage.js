import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./Auth.css";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Vui lòng nhập đầy đủ thông tin"); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success("Đăng nhập thành công!");
      if (user.roleId === 1) navigate("/admin");
      else if (user.roleId === 2) navigate("/teacher");
      else navigate("/student");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sai email hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon">🎓</span>
          <div>
            <h1>NewSky English</h1>
            <p>Nền tảng học tiếng Anh trực tuyến</p>
          </div>
        </div>
        <div className="auth-hero">
          <h2>Chào mừng trở lại!</h2>
          <p>Tiếp tục hành trình chinh phục tiếng Anh cùng đội ngũ giáo viên chuyên nghiệp.</p>
          <div className="hero-stats">
            <div className="stat-item"><strong>500+</strong><span>Học viên</span></div>
            <div className="stat-item"><strong>50+</strong><span>Giáo viên</span></div>
            <div className="stat-item"><strong>IELTS & TOEIC</strong><span>Chứng chỉ quốc tế</span></div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Đăng nhập</h2>
            <p>Nhập thông tin tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="example@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" placeholder="Nhập mật khẩu"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            <button type="submit" className="btn-primary-full" disabled={loading}>
              {loading ? <span className="spinner" /> : "Đăng nhập"}
            </button>
          </form>

          <p className="auth-footer-text">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}