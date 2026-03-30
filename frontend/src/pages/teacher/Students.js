import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const PAGE_SIZE = 10;

export default function TeacherStudents() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

      const allClasses = clsRes.data.data  || [];
      const allCourses = courseRes.data.data || [];
      const allUsers   = userRes.data.data   || [];

      // Lọc theo teacherId trong CLASS
      const myId = Number(user.id);
      const myClasses = allClasses.filter(c => Number(c.teacherId) === myId);

      setCourses(allCourses);
      setClasses(myClasses);
      setUsers(allUsers);

      const allEnrolls = [];
      for (const cls of myClasses) {
        const r = await api.get(`/enrollments/class/${cls.id}`)
          .catch(() => ({ data:{ data:[] } }));
        (r.data.data || [])
          .filter(e => ["approved","enrolled","completed"].includes(e.status))
          .forEach(e => allEnrolls.push({
            ...e,
            classId:  cls.id,
            className: cls.name || "",
            courseId:  Number(cls.courseId),
          }));
      }
      setEnrollments(allEnrolls);
    } catch(err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };
  fetchAll();
  }, [user]);

  // Courses của teacher
  const myTeacherId = Number(user?.id);
  const myCourseIds = courses
    .filter(c => Number(c.teacherId) === myTeacherId)
    .map(c => c.id);
  const myCourses = courses.filter(c => myCourseIds.includes(c.id));

  // Classes lọc theo course đã chọn
  const filteredClasses = selectedCourse
    ? classes.filter(c => Number(c.courseId) === Number(selectedCourse))
    : classes;

  // Enrollments lọc
  const filtered = enrollments.filter(e => {
    const u = users.find(u => Number(u.id) === Number(e.userId));
    const matchSearch = !search ||
      (u?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchCourse = !selectedCourse || Number(e.courseId) === Number(selectedCourse);
    const matchClass = !selectedClass || Number(e.classId) === Number(selectedClass);
    return matchSearch && matchCourse && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getUser = (userId) => users.find(u => Number(u.id) === Number(userId));
  const getCourse = (courseId) => courses.find(c => Number(c.id) === Number(courseId));

  const STATUS_LABEL = { approved: "Đã duyệt", enrolled: "Đang học", completed: "Hoàn thành" };
  const STATUS_BADGE = { approved: "badge-blue", enrolled: "badge-green", completed: "badge-gray" };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Học viên</h1>
        <p>Danh sách học viên đã được duyệt trong các lớp của bạn</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input" placeholder="🔍 Tìm tên, email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={selectedCourse}
            onChange={e => { setSelectedCourse(e.target.value); setSelectedClass(""); setPage(1); }}>
            <option value="">Tất cả khóa học</option>
            {myCourses.map(c => (
              <option key={c.id} value={c.id}>{c.examType} - {c.title}</option>
            ))}
          </select>
          <select className="filter-select" value={selectedClass}
            onChange={e => { setSelectedClass(e.target.value); setPage(1); }}>
            <option value="">Tất cả lớp</option>
            {filteredClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: "0.82rem", color: "var(--gray-500)" }}>
          {filtered.length} học viên
        </span>
      </div>

      <div className="table-wrapper">
        {loading ? <div className="page-loading"><div className="spinner" /></div> : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Lớp học</th>
                  <th>Khóa học</th>
                  <th>Tiến độ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="empty-state">
                    <p>Không có học viên nào</p>
                  </td></tr>
                ) : paginated.map((e, i) => {
                  const u = getUser(e.userId);
                  const course = getCourse(e.courseId);
                  return (
                    <tr key={`${e.id}-${i}`}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="avatar">
                            {(u?.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 500 }}>
                              {u?.name || `ID: ${e.userId}`}
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                              {u?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{e.className || "—"}</td>
                      <td>
                        {course ? (
                          <>
                            <span className={`badge ${course.examType === "IELTS" ? "badge-blue" : course.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                              {course.examType}
                            </span>
                            <span style={{ marginLeft: 6, fontSize: "0.82rem" }}>
                              {course.title}
                            </span>
                          </>
                        ) : <span style={{ color: "var(--gray-400)" }}>—</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 80, height: 6, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${e.progress || 0}%`, background: "var(--primary)", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>
                            {e.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[e.status] || "badge-gray"}`}>
                          {STATUS_LABEL[e.status] || e.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
                </span>
                <div className="pagination-btns">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} className={`page-btn ${page === i + 1 ? "active" : ""}`}
                      onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}