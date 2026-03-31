import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";

const PAGE_SIZE = 10;
const STATUS_BADGE = {
  pending:   "badge-yellow",
  approved:  "badge-green",
  rejected:  "badge-red",
  enrolled:  "badge-blue",
  completed: "badge-gray",
  dropped:   "badge-red",
};
const STATUS_LABEL = {
  pending:   "Chờ duyệt",
  approved:  "Đã duyệt",
  rejected:  "Từ chối",
  enrolled:  "Đang học",
  completed: "Hoàn thành",
  dropped:   "Đã hủy",
};

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [users,       setUsers]       = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [classes,     setClasses]     = useState([]);  // ← state riêng
  const [loading,     setLoading]     = useState(true);
  const [statusFilter,setStatusFilter]= useState("pending");
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Fetch tất cả 4 nguồn song song
      const [eRes, uRes, cRes, clsRes] = await Promise.all([
        api.get("/enrollments"),
        api.get("/users"),
        api.get("/courses"),
        api.get("/admin/classes"),
      ]);
      setEnrollments(eRes.data.data   || []);
      setUsers(      uRes.data.data   || []);
      setCourses(    cRes.data.data   || []);
      setClasses(    clsRes.data.data || []);  // ← lưu vào state
    } catch (err) {
      console.error("Enrollment load error:", err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const getUser   = (id) => users.find(u => Number(u.id) === Number(id));
  const getCourse = (id) => courses.find(c => Number(c.id) === Number(id));
  // ← dùng state classes (không phải biến nào khác)
  const getClass  = (id) => classes.find(c => Number(c.id) === Number(id));

  // ── Filter ───────────────────────────────────────────────────
  const filtered = enrollments.filter(e => {
    const u  = getUser(e.userId);
    const c  = getCourse(e.courseId);
    const matchStatus = !statusFilter || e.status === statusFilter;
    const matchSearch = !search ||
      (u?.name  || "").toLowerCase().includes(search.toLowerCase()) ||
      (u?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c?.title || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Actions ──────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/enrollments/${id}/approve`);
      toast.success("Đã duyệt");
      loadAll();
    } catch { toast.error("Thất bại"); }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Từ chối đăng ký này?")) return;
    try {
      await api.put(`/enrollments/${id}`, { status: "rejected" });
      toast.success("Đã từ chối");
      loadAll();
    } catch { toast.error("Thất bại"); }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Quản lý đăng ký học</h1>
        <p>Duyệt và quản lý yêu cầu đăng ký khóa học</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search-input"
            placeholder="🔍 Tìm tên, email, khóa học..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <select className="filter-select" value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả</option>
            <option value="pending">⏳ Chờ duyệt</option>
            <option value="approved">✅ Đã duyệt</option>
            <option value="enrolled">📚 Đang học</option>
            <option value="rejected">❌ Từ chối</option>
            <option value="completed">🎓 Hoàn thành</option>
            <option value="dropped">🚫 Đã hủy</option>
          </select>
        </div>
        <span style={{ fontSize: "0.82rem", color: "var(--gray-500)" }}>
          {filtered.length} đăng ký
        </span>
      </div>

      <div className="table-wrapper">
        {loading
          ? <div className="page-loading"><div className="spinner" /></div>
          : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Học viên</th>
                    <th>Khóa học</th>
                    <th>Lớp học</th>        {/* ← hiện tên lớp */}
                    <th>Ngày đăng ký</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0
                    ? <tr>
                        <td colSpan={7} className="empty-state">
                          <p>Không có dữ liệu</p>
                        </td>
                      </tr>
                    : paginated.map(e => {
                      const u   = getUser(e.userId);
                      const c   = getCourse(e.courseId);
                      const cls = getClass(e.id);   // ← lấy từ state classes
                      return (
                        <tr key={e.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="avatar">
                                {(u?.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                                  {u?.name || `ID: ${e.userId}`}
                                </p>
                                <p style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
                                  {u?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                              {c?.title || `ID: ${e.courseId}`}
                            </p>
                            {c && (
                              <span className={`badge ${c.examType === "IELTS" ? "badge-blue" : c.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}
                                style={{ marginTop: 2 }}>
                                {c.examType}
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: "0.875rem" }}>
                            {/* ← Hiện tên lớp từ state classes */}
                            {cls?.name || (e.id ? `ID: ${e.id}` : "—")}
                          </td>
                          <td style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>
                            {e.enrollDate
                              ? new Date(e.enrollDate).toLocaleDateString("vi-VN")
                              : "—"}
                          </td>
                          <td>
                            {e.paid
                              ? <span className="badge badge-green">✅ Đã TT</span>
                              : <span className="badge badge-yellow">⏳ Chưa TT</span>}
                          </td>
                          <td>
                            <span className={`badge ${STATUS_BADGE[e.status] || "badge-gray"}`}>
                              {STATUS_LABEL[e.status] || e.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 4 }}>
                              {e.status === "pending" && (
                                <>
                                  <button className="btn btn-success btn-sm"
                                    onClick={() => handleApprove(e.id)}>✅</button>
                                  <button className="btn btn-danger btn-sm"
                                    onClick={() => handleReject(e.id)}>❌</button>
                                </>
                              )}
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
                  <span className="pagination-info">
                    {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
                  </span>
                  <div className="pagination-btns">
                    <button className="page-btn" disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}>‹</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i + 1}
                        className={`page-btn ${page === i + 1 ? "active" : ""}`}
                        onClick={() => setPage(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="page-btn" disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}>›</button>
                  </div>
                </div>
              )}
            </>
          )
        }
      </div>
    </div>
  );
}