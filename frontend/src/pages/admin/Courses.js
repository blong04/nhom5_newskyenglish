import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";

const LEVEL_LABEL = { beginner:"Cơ bản", intermediate:"Trung cấp", advanced:"Nâng cao" };
const PAGE_SIZE = 10;
const INIT = { title:"", description:"", teacherId:"", price:0, level:"beginner", examType:"OTHER", status:"active" };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [modal, setModal] = useState(null);   // null | "add" | "edit"
  const [viewModal, setViewModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(INIT);

  // Course classes data
  const [courseClasses, setCourseClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, uRes] = await Promise.all([
        api.get("/courses"),
        api.get("/users"),
      ]);
      setCourses(cRes.data.data || []);
      setTeachers((uRes.data.data || []).filter(u => u.roleId === 2 && u.approved));
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filtered + Paginated
  const filtered = courses.filter(c =>
    (!search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
                c.description?.toLowerCase().includes(search.toLowerCase())) &&
    (!examFilter || c.examType === examFilter) &&
    (!statusFilter || c.status === statusFilter)
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  // Open view modal — load classes
  const openView = async (course) => {
    setViewModal(course);
    setClassesLoading(true);
    try {
      const r = await api.get(`/courses/${course.id}/classes`).catch(() => ({ data:{ data:[] } }));
      setCourseClasses(r.data.data || []);
    } catch {
      setCourseClasses([]);
    } finally {
      setClassesLoading(false);
    }
  };

  const openEdit = (course) => {
    setForm({
      title:       course.title       || "",
      description: course.description || "",
      teacherId:   course.teacherId   || "",
      price:       course.price       || 0,
      level:       course.level       || "beginner",
      examType:    course.examType    || "OTHER",
      status:      course.status      || "active",
    });
    setSelected(course);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Nhập tên khóa học"); return; }
    try {
      const payload = {
        ...form,
        teacherId: form.teacherId ? Number(form.teacherId) : null,
        price: Number(form.price),
      };
      if (modal === "add") {
        await api.post("/courses", payload);
        toast.success("Tạo khóa học thành công");
      } else {
        await api.put(`/courses/${selected.id}`, payload);
        toast.success("Cập nhật thành công");
      }
      setModal(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa khóa học này?")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Đã xóa");
      fetchData();
    } catch {
      toast.error("Không thể xóa — có thể còn lớp học liên kết");
    }
  };

  const getTeacherName = (id) => teachers.find(t => t.id === id || t.id === Number(id))?.name || "—";

  const CLASS_STATUS_BADGE = { pending:"badge-yellow", active:"badge-green", completed:"badge-gray", cancelled:"badge-red" };
  const CLASS_STATUS_LABEL = { pending:"Chờ khai giảng", active:"Đang học", completed:"Kết thúc", cancelled:"Đã hủy" };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Quản lý khóa học</h1>
        <p>{courses.length} khóa học trong hệ thống</p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="🔍 Tìm tên, mô tả..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={examFilter}
            onChange={e => { setExamFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả loại</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
            <option value="OTHER">Tiếng Anh chung</option>
          </select>
          <select className="filter-select" value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ẩn</option>
          </select>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setForm(INIT); setSelected(null); setModal("add"); }}>
          + Thêm khóa học
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên khóa học</th>
                  <th>Loại</th>
                  <th>Cấp độ</th>
                  <th>Học phí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} className="empty-state"><p>Không có khóa học nào</p></td></tr>
                ) : paginated.map(c => (
                  <tr key={c.id}>
                    <td>
                      <p style={{ fontWeight:500 }}>{c.title}</p>
                      <p style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>
                        {c.description?.slice(0,50)}{c.description?.length > 50 ? "..." : ""}
                      </p>
                    </td>
                    <td>
                      <span className={`badge ${c.examType==="IELTS"?"badge-blue":c.examType==="TOEIC"?"badge-green":"badge-gray"}`}>
                        {c.examType}
                      </span>
                    </td>
                    <td style={{ fontSize:"0.82rem" }}>{LEVEL_LABEL[c.level] || c.level}</td>
                    <td style={{ fontWeight:500, color: c.price > 0 ? "var(--primary)" : "var(--success)" }}>
                      {c.price > 0 ? `${Number(c.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                    </td>
                    <td>
                      <span className={`badge ${c.status==="active"?"badge-green":"badge-red"}`}>
                        {c.status==="active" ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:4 }}>
                        <button className="btn btn-info btn-sm" title="Xem chi tiết & danh sách lớp"
                          onClick={() => openView(c)}>👁️</button>
                        <button className="btn btn-warning btn-sm" title="Sửa"
                          onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" title="Xóa"
                          onClick={() => handleDelete(c.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}
                </span>
                <div className="pagination-btns">
                  <button className="page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                  {Array.from({length: totalPages}, (_,i) => (
                    <button key={i+1} className={`page-btn ${page===i+1?"active":""}`}
                      onClick={() => setPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL: Xem chi tiết khóa học + danh sách lớp ===== */}
      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal" style={{ maxWidth:640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{
              background: viewModal.examType==="IELTS"
                ? "linear-gradient(135deg,#3b82f6,#0ea5e9)"
                : viewModal.examType==="TOEIC"
                ? "linear-gradient(135deg,#16a34a,#22c55e)"
                : "linear-gradient(135deg,var(--primary),var(--secondary))"
            }}>
              <div>
                <p style={{ fontSize:"0.72rem", opacity:0.8, marginBottom:2 }}>
                  {viewModal.examType} · {LEVEL_LABEL[viewModal.level]}
                </p>
                <h3>{viewModal.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setViewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Thông tin cơ bản */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <div style={{ background:"var(--gray-50)", borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:"0.7rem", color:"var(--gray-400)", textTransform:"uppercase" }}>Học phí</p>
                  <p style={{ fontWeight:700, color:"var(--primary)", marginTop:2 }}>
                    {viewModal.price > 0 ? `${Number(viewModal.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                  </p>
                </div>
                <div style={{ background:"var(--gray-50)", borderRadius:8, padding:"10px 12px" }}>
                  <p style={{ fontSize:"0.7rem", color:"var(--gray-400)", textTransform:"uppercase" }}>Trạng thái</p>
                  <span className={`badge ${viewModal.status==="active"?"badge-green":"badge-red"}`} style={{ marginTop:2 }}>
                    {viewModal.status==="active" ? "Hoạt động" : "Ẩn"}
                  </span>
                </div>
              </div>

              {viewModal.description && (
                <p style={{ fontSize:"0.875rem", color:"var(--gray-600)", lineHeight:1.7, marginBottom:16 }}>
                  {viewModal.description}
                </p>
              )}

              {/* Danh sách lớp */}
              <h4 style={{ fontSize:"0.875rem", fontWeight:700, marginBottom:10, color:"var(--gray-800)" }}>
                🏫 Danh sách lớp học ({courseClasses.length} lớp)
              </h4>

              {classesLoading ? (
                <div style={{ textAlign:"center", padding:20 }}><div className="spinner" /></div>
              ) : courseClasses.length === 0 ? (
                <p style={{ fontSize:"0.82rem", color:"var(--gray-400)", textAlign:"center", padding:16 }}>
                  Chưa có lớp học nào cho khóa học này
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Tên lớp</th><th>Giáo viên</th><th>Sĩ số</th><th>Thời gian</th><th>Trạng thái</th></tr>
                  </thead>
                  <tbody>
                    {courseClasses.map(cls => {
                      const teacher = teachers.find(t => t.id === cls.teacherId || t.id === Number(cls.teacherId));
                      return (
                        <tr key={cls.id}>
                          <td style={{ fontWeight:500 }}>{cls.name}</td>
                          <td style={{ fontSize:"0.82rem" }}>
                            {teacher?.name || (
                              <span style={{ color:"var(--gray-400)" }}>Chưa phân công</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontWeight:500 }}>{cls.currentStudents || 0}</span>
                            <span style={{ color:"var(--gray-400)", fontSize:"0.78rem" }}>/{cls.maxStudents}</span>
                          </td>
                          <td style={{ fontSize:"0.75rem", color:"var(--gray-500)" }}>
                            {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "—"}
                            {" → "}
                            {cls.endDate ? new Date(cls.endDate).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td>
                            <span className={`badge ${CLASS_STATUS_BADGE[cls.status]}`}>
                              {CLASS_STATUS_LABEL[cls.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Đóng</button>
              <button className="btn btn-warning" onClick={() => { openEdit(viewModal); setViewModal(null); }}>
                ✏️ Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Thêm / Sửa khóa học ===== */}
      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal==="add" ? "Thêm khóa học mới" : "Chỉnh sửa khóa học"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên khóa học *</label>
                <input value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})}
                  placeholder="VD: IELTS Foundation 2026" />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})}
                  placeholder="Mô tả nội dung và mục tiêu khóa học..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại chứng chỉ</label>
                  <select value={form.examType} onChange={e => setForm({...form, examType:e.target.value})}>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="OTHER">Tiếng Anh chung</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cấp độ</label>
                  <select value={form.level} onChange={e => setForm({...form, level:e.target.value})}>
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Học phí (VNĐ)</label>
                  <input type="number" value={form.price}
                    onChange={e => setForm({...form, price:e.target.value})} min={0} step={100000} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ẩn</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modal==="add" ? "Tạo khóa học" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}