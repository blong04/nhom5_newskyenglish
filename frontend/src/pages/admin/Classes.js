import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";

const PAGE_SIZE = 10;
const STATUS_BADGE = { pending:"badge-yellow", active:"badge-green", completed:"badge-gray", cancelled:"badge-red" };
const STATUS_LABEL = { pending:"Chờ khai giảng", active:"Đang học", completed:"Kết thúc", cancelled:"Đã hủy" };
const INIT = {
  courseId:"", teacherId:"", name:"", description:"",
  maxStudents:30, startDate:"", endDate:"", status:"pending"
};

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [form, setForm] = useState(INIT);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, cRes, uRes] = await Promise.all([
        api.get("/admin/classes").catch(() => ({ data: { data: [] } })),
        api.get("/courses"),
        api.get("/users"),
      ]);
      const allClasses = clsRes.data.data || [];
      const allCourses = cRes.data.data || [];
      const allUsers = uRes.data.data || [];

      setClasses(allClasses);
      setCourses(allCourses);
      setUsers(allUsers);
      setTeachers(allUsers.filter(u => u.roleId === 2 && u.approved));

      // Lấy enrollments
      const allEnrolls = [];
      for (const cls of allClasses.slice(0, 20)) { // limit để không quá chậm
        const r = await api.get(`/enrollments/class/${cls.id}`).catch(() => ({ data: { data: [] } }));
        (r.data.data || []).forEach(e => allEnrolls.push({ ...e, classId: cls.id }));
      }
      setEnrollments(allEnrolls);
    } catch { toast.error("Không thể tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const getCourse = (id) => courses.find(c => c.id === id || c.id === Number(id));
  const getTeacher = (id) => teachers.find(t => t.id === id || t.id === Number(id));
  const getUser = (id) => users.find(u => u.id === id || u.id === Number(id));
  const getClassEnrollments = (classId) => enrollments.filter(e => e.classId === classId || e.classId === Number(classId));

  const filtered = classes.filter(c => {
    const course = getCourse(c.courseId);
    const teacher = getTeacher(c.teacherId);
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      course?.title?.toLowerCase().includes(search.toLowerCase()) ||
      teacher?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const handleSave = async () => {
    if (!form.courseId || !form.name) { toast.error("Chọn khóa học và nhập tên lớp"); return; }
    try {
        const payload = {
        ...form,
        courseId:    Number(form.courseId),
        teacherId:   form.teacherId ? Number(form.teacherId) : null,
        maxStudents: Number(form.maxStudents),
        };
      if (modal === "add") await api.post("/admin/classes", payload);
      else await api.put(`/admin/classes/${selected.id}`, payload);
      toast.success("Thành công"); setModal(null); fetchData();
    } catch (e) { toast.error(e.response?.data?.message || "Thất bại"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa lớp học này?")) return;
    try { await api.delete(`/admin/classes/${id}`); toast.success("Đã xóa"); fetchData(); }
    catch { toast.error("Không thể xóa"); }
  };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Quản lý lớp học</h1>
        <p>{classes.length} lớp học trong hệ thống</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="🔍 Tìm lớp, khóa học, giáo viên..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ khai giảng</option>
            <option value="active">Đang học</option>
            <option value="completed">Kết thúc</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(INIT); setSelected(null); setModal("add"); }}>
          + Tạo lớp mới
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? <div className="page-loading"><div className="spinner" /></div> : (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Tên lớp</th><th>Khóa học</th><th>Giáo viên</th><th>Sĩ số</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {paginated.length === 0
                  ? <tr><td colSpan={7} className="empty-state"><p>Không có lớp học nào</p></td></tr>
                  : paginated.map(cls => {
                    const course = getCourse(cls.courseId);
                    const teacher = getTeacher(cls.teacherId);
                    const enrolls = getClassEnrollments(cls.id);
                    const approvedCount = enrolls.filter(e => ["approved","enrolled","completed"].includes(e.status)).length;
                    return (
                      <tr key={cls.id}>
                        <td style={{ fontWeight: 500 }}>{cls.name}</td>
                        <td>
                          {course && (
                            <div>
                              <span className={`badge ${course.examType === "IELTS" ? "badge-blue" : course.examType === "TOEIC" ? "badge-green" : "badge-gray"}`} style={{ marginRight: 4 }}>
                                {course.examType}
                              </span>
                              <span style={{ fontSize: "0.82rem" }}>{course.title}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          {teacher
                            ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div className="avatar" style={{ width: 24, height: 24, fontSize: "0.65rem" }}>{teacher.name?.charAt(0)}</div>
                                <span style={{ fontSize: "0.82rem" }}>{teacher.name}</span>
                              </div>
                            : <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>Chưa phân công</span>
                          }
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{approvedCount}</span>
                          <span style={{ color: "var(--gray-400)", fontSize: "0.78rem" }}>/{cls.maxStudents}</span>
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>
                          {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "—"}
                          {" → "}
                          {cls.endDate ? new Date(cls.endDate).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td><span className={`badge ${STATUS_BADGE[cls.status]}`}>{STATUS_LABEL[cls.status]}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-info btn-sm" title="Xem học viên" onClick={() => setDetailModal(cls)}>👥</button>
                            <button className="btn btn-warning btn-sm" title="Sửa" onClick={() => {
                              setForm({ courseId: cls.courseId || "", teacherId: cls.teacherId || "", name: cls.name || "", description: cls.description || "", maxStudents: cls.maxStudents, startDate: cls.startDate || "", endDate: cls.endDate || "", status: cls.status });
                              setSelected(cls); setModal("edit");
                            }}>✏️</button>
                            <button className="btn btn-danger btn-sm" title="Xóa" onClick={() => handleDelete(cls.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">{((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}</span>
                <div className="pagination-btns">
                  <button className="page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                  {Array.from({length: totalPages}, (_,i) => (
                    <button key={i+1} className={`page-btn ${page===i+1?"active":""}`} onClick={() => setPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal thêm/sửa */}
      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === "add" ? "Tạo lớp học mới" : "Chỉnh sửa lớp học"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Khóa học *</label>
                <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}>
                  <option value="">Chọn khóa học</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.examType} - {c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Giáo viên phụ trách *</label>
                <select value={form.teacherId}
                  onChange={e => setForm({...form, teacherId: e.target.value})}>
                  <option value="">— Chọn giáo viên —</option>
                  {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>Tên lớp *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: IELTS_ADV_A_2026" />
              </div>
              <div className="form-group"><label>Mô tả</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group"><label>Sĩ số tối đa</label>
                  <input type="number" value={form.maxStudents} onChange={e => setForm({...form, maxStudents: e.target.value})} min={1} />
                </div>
                <div className="form-group"><label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="pending">Chờ khai giảng</option>
                    <option value="active">Đang học</option>
                    <option value="completed">Kết thúc</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Ngày bắt đầu</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="form-group"><label>Ngày kết thúc</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem học viên */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👥 Học viên — {detailModal.name}</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {getClassEnrollments(detailModal.id).length === 0
                ? <div className="empty-state"><p>Chưa có học viên đăng ký</p></div>
                : getClassEnrollments(detailModal.id).map(e => {
                  const u = getUser(e.userId);
                  return (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--gray-100)" }}>
                      <div className="avatar">{u?.name?.charAt(0)?.toUpperCase() || "?"}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{u?.name || `ID: ${e.userId}`}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>{u?.email}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={`badge ${STATUS_BADGE[e.status]}`}>{STATUS_LABEL[e.status]}</span>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}