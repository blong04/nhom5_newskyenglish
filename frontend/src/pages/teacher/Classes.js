import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const PAGE_SIZE = 10;
const STATUS_BADGE = {
  pending: "badge-yellow", active: "badge-green",
  completed: "badge-gray", cancelled: "badge-red"
};
const STATUS_LABEL = {
  pending: "Chờ khai giảng", active: "Đang học",
  completed: "Kết thúc", cancelled: "Đã hủy"
};

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [clsRes, courseRes, userRes] = await Promise.all([
          api.get("/admin/classes"),
          api.get("/courses"),
          api.get("/users"),
        ]);

        const allClasses = clsRes.data.data || [];
        const allCourses = courseRes.data.data || [];
        const allUsers   = userRes.data.data || [];

        // ← Lọc theo teacherId trong CLASS (không phải course)
        const myId = Number(user.id);
        const myClasses = allClasses.filter(c => Number(c.teacherId) === myId);

        setCourses(allCourses);
        setClasses(myClasses);
        setAllUsers(allUsers);

        // Lấy enrollments
        const allEnrolls = [];
        for (const cls of myClasses) {
          const r = await api.get(`/enrollments/class/${cls.id}`)
            .catch(() => ({ data: { data: [] } }));
          (r.data.data || []).forEach(e =>
            allEnrolls.push({ ...e, classId: cls.id })
          );
        }
        setEnrollments(allEnrolls);
      } catch (e) {
        console.error(e);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const getCourse = id => courses.find(c => Number(c.id) === Number(id));
  const getUser   = id => allUsers.find(u => Number(u.id) === Number(id));
  const getApproved = classId =>
    enrollments.filter(e =>
      Number(e.classId) === Number(classId) &&
      ["approved","enrolled","completed"].includes(e.status)
    );

  const filtered = classes.filter(c => {
    const course = getCourse(c.courseId);
    return !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      course?.title?.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Lớp của tôi</h1>
        <p>{classes.length} lớp được phân công</p>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="🔍 Tìm lớp, khóa học..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <span style={{ fontSize:"0.82rem", color:"var(--gray-500)" }}>
          {filtered.length} lớp
        </span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: selected ? "1.2fr 0.8fr" : "1fr", gap:20 }}>
        <div className="table-wrapper">
          {loading ? <div className="page-loading"><div className="spinner"/></div> : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên lớp</th><th>Khóa học</th><th>Sĩ số</th>
                    <th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr><td colSpan={6} className="empty-state">
                        <p>Chưa có lớp nào được phân công cho bạn</p>
                      </td></tr>
                    : paginated.map(cls => {
                      const course   = getCourse(cls.courseId);
                      const approved = getApproved(cls.id);
                      return (
                        <tr key={cls.id}
                          style={{ background: selected?.id===cls.id ? "var(--primary-light)" : "" }}>
                          <td style={{ fontWeight:500 }}>{cls.name}</td>
                          <td>
                            {course
                              ? <>
                                  <span className={`badge ${course.examType==="IELTS"?"badge-blue":course.examType==="TOEIC"?"badge-green":"badge-gray"}`}
                                    style={{ marginRight:4 }}>{course.examType}</span>
                                  <span style={{ fontSize:"0.82rem" }}>{course.title}</span>
                                </>
                              : <span style={{ color:"var(--gray-400)" }}>—</span>}
                          </td>
                          <td>
                            <span style={{ fontWeight:500 }}>{approved.length}</span>
                            <span style={{ color:"var(--gray-400)", fontSize:"0.78rem" }}>/{cls.maxStudents}</span>
                          </td>
                          <td style={{ fontSize:"0.78rem", color:"var(--gray-500)" }}>
                            {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "—"}
                            {" → "}
                            {cls.endDate ? new Date(cls.endDate).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td>
                            <span className={`badge ${STATUS_BADGE[cls.status]}`}>
                              {STATUS_LABEL[cls.status]}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-primary btn-sm"
                              onClick={() => setSelected(selected?.id===cls.id ? null : cls)}>
                              {selected?.id===cls.id ? "Đóng" : "Xem HV"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination">
                  <span className="pagination-info">
                    {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length}
                  </span>
                  <div className="pagination-btns">
                    <button className="page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                    {Array.from({length:totalPages},(_,i) => (
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

        {selected && (
          <div className="section-card" style={{ height:"fit-content", position:"sticky", top:80 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <h3 className="section-title" style={{ margin:0 }}>{selected.name}</h3>
                <p style={{ fontSize:"0.75rem", color:"var(--gray-500)", marginTop:2 }}>
                  {getApproved(selected.id).length} học viên đã duyệt
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <table className="data-table">
              <thead><tr><th>Học viên</th><th>Tạng thái</th></tr></thead>
              <tbody>
                {getApproved(selected.id).length === 0
                  ? <tr><td colSpan={2} className="empty-state"><p>Chưa có học viên</p></td></tr>
                  : getApproved(selected.id).map(e => {
                    const u = getUser(e.userId);
                    return (
                      <tr key={e.id}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div className="avatar" style={{ width:28, height:28, fontSize:"0.7rem" }}>
                              {(u?.name||"?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize:"0.82rem", fontWeight:500 }}>
                                {u?.name || `ID: ${e.userId}`}
                              </p>
                              <p style={{ fontSize:"0.7rem", color:"var(--gray-400)" }}>
                                {u?.email || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${e.status==="enrolled"?"badge-green":e.status==="approved"?"badge-blue":"badge-gray"}`}
                            style={{ fontSize:"0.65rem" }}>
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}