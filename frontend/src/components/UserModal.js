import React, { useState, useEffect } from "react";
import styles from "./UserModal.module.css";

const INITIAL_FORM = {
  name: "",
  email: "",
  phoneNumber: "",
  avatarUrl: "",
  role: "STUDENT",
  status: "ACTIVE",
};

export default function UserModal({ isOpen, onClose, onSubmit, user }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const isEdit = !!user;

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        avatarUrl: user.avatarUrl || "",
        role: user.role || "STUDENT",
        status: user.status || "ACTIVE",
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [user, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Tên không được để trống";
    if (!form.email.trim()) errs.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không hợp lệ";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = { ...form };
    if (!isEdit) delete payload.status;
    await onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isEdit ? "Chỉnh sửa User" : "Thêm User mới"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Họ tên <span className={styles.required}>*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className={errors.name ? styles.inputError : ""}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label>Email <span className={styles.required}>*</span></label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={errors.email ? styles.inputError : ""}
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label>Số điện thoại</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="0901234567"
            />
          </div>

          <div className={styles.field}>
            <label>Avatar URL</label>
            <input
              name="avatarUrl"
              value={form.avatarUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Vai trò</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="STUDENT">Học viên</option>
                <option value="TEACHER">Giáo viên</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {isEdit && (
              <div className={styles.field}>
                <label>Trạng thái</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="BANNED">Bị khóa</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn}>
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
