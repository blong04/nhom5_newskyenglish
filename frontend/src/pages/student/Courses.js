import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../admin/Admin.css";
import "./Student.css";

const PAGE_SIZE = 9;
const ENROLL_STATUS = {
  pending: { label: "⏳ Chờ duyệt", badge: "badge-yellow" },
  approved: { label: "✅ Đã duyệt", badge: "badge-blue" },
  enrolled: { label: "📚 Đang học", badge: "badge-green" },
  completed: { label: "🎓 Hoàn thành", badge: "badge-gray" },
  dropped: { label: "❌ Đã hủy", badge: "badge-red" },
};

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [enrollFilter, setEnrollFilter] = useState(""); // "enrolled" | "not_enrolled"
  const [page, setPage] = useState(1);

  // Modals
  const [detailModal, setDetailModal] = useState(null); // course detail
  const [enrollModal, setEnrollModal] = useState(null); // enroll flow
  const [enrollStep, setEnrollStep] = useState(1); // 1=chọn lớp, 2=thanh toán
  const [selectedClass, setSelectedClass] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  useEffect(() => {
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, eRes, clsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/student/enrollments"),
        api.get("/classes"),
      ]);
      setCourses((cRes.data.data || []).filter(c => c.status === "active"));
      setEnrollments(eRes.data.data   || []);
      setClasses(    clsRes.data.data || []);  // ← lưu vào state
    } catch (e) {
      console.error(e);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };
  fetchAll();
  }, []);

  const getEnrollment = (courseId) => enrollments.find(e => e.courseId === courseId || e.courseId === Number(courseId));

  const getAvailableClasses = (courseId) =>
    classes.filter(c =>
      Number(c.courseId) === Number(courseId) &&
      c.status === "pending" &&
      (c.currentStudents || 0) < (c.maxStudents || 999)
    );

  const getCourseClasses = (courseId) =>
    classes.filter(c => Number(c.courseId) === Number(courseId));

  // Filtered
  const filtered = courses.filter(c => {
    const enrollment = getEnrollment(c.id);
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchExam = !examFilter || c.examType === examFilter;
    const matchLevel = !levelFilter || c.level === levelFilter;
    const matchEnroll = !enrollFilter ||
      (enrollFilter === "enrolled" && enrollment) ||
      (enrollFilter === "not_enrolled" && !enrollment);
    return matchSearch && matchExam && matchLevel && matchEnroll;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEnrollClick = (course) => {
    const enrollment = getEnrollment(course.id);
    if (enrollment) {
      toast("Bạn đã đăng ký khóa học này rồi");
      return;
    }
    const available = getAvailableClasses(course.id);
    if (available.length === 0) {
      toast.error("Hiện không có lớp nào đang tuyển sinh cho khóa học này");
      return;
    }
    setEnrollModal(course);
    setEnrollStep(1);
    setSelectedClass(null);  // reset
  };

  const handleCancelEnroll = async (enrollment) => {
    if (enrollment.status !== "pending") {
      toast.error("Chỉ có thể hủy đăng ký khi chưa được phê duyệt");
      return;
    }
    if (!window.confirm("Hủy đăng ký khóa học này?")) return;
    try {
      await api.put(`/enrollments/${enrollment.id}/cancel`);
      toast.success("Đã hủy đăng ký");
      const r = await api.get("/student/enrollments");
      setEnrollments(r.data.data || []);
    } catch { toast.error("Không thể hủy"); }
  };

  const handleEnrollWithPayment = async () => {
    if (!selectedClass) { toast.error("Chọn lớp học"); return; }
    setEnrolling(true);
    try {
      await api.post("/student/enroll", {
        courseId: enrollModal.id,
        classId: selectedClass.id,
        paid: true // đã thanh toán → không cần admin duyệt
      });
      toast.success("Đăng ký thành công! Thanh toán được xác nhận.");
      setEnrollModal(null);
      const r = await api.get("/student/enrollments");
      setEnrollments(r.data.data || []);
    } catch (e) { toast.error(e.response?.data?.message || "Thất bại"); }
    finally { setEnrolling(false); }
  };

  const handleEnrollWithoutPayment = async () => {
    if (!selectedClass) { toast.error("Chọn lớp học"); return; }
    setEnrolling(true);
    try {
      await api.post("/student/enroll", {
        courseId: enrollModal.id,
        classId: selectedClass.id,
        paid: false // chưa thanh toán → cần admin duyệt
      });
      toast.success("Đã gửi yêu cầu đăng ký. Vui lòng chờ admin phê duyệt.");
      setEnrollModal(null);
      const r = await api.get("/student/enrollments");
      setEnrollments(r.data.data || []);
    } catch (e) { toast.error(e.response?.data?.message || "Thất bại"); }
    finally { setEnrolling(false); }
  };

  const EXAM_COLOR = { IELTS: "#3b82f6", TOEIC: "#16a34a", OTHER: "#6b7280" };
  const LEVEL_LABEL = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
  const STATUS_BADGE = { pending: "badge-yellow", active: "badge-green", completed: "badge-gray", cancelled: "badge-red" };
  const STATUS_LABEL = { pending: "Chờ khai giảng", active: "Đang học", completed: "Kết thúc", cancelled: "Đã hủy" };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-page fade-in">
    {/* Sticky search bar */}
    <div className="courses-sticky-bar">
      <div className="courses-sticky-inner">
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-900)" }}>
          Khóa học <span style={{ color: "var(--primary)", fontWeight: 500, fontSize: "0.875rem" }}>({filtered.length})</span>
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input className="search-input" placeholder="🔍 Tìm kiếm khóa học..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: 220 }} />
          <select className="filter-select" value={examFilter} onChange={e => { setExamFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả loại</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
            <option value="OTHER">Tiếng Anh chung</option>
          </select>
          <select className="filter-select" value={levelFilter} onChange={e => { setLevelFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả cấp độ</option>
            <option value="beginner">Cơ bản</option>
            <option value="intermediate">Trung cấp</option>
            <option value="advanced">Nâng cao</option>
          </select>
          <select className="filter-select" value={enrollFilter} onChange={e => { setEnrollFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="enrolled">Đã đăng ký</option>
            <option value="not_enrolled">Chưa đăng ký</option>
          </select>
        </div>
      </div>
    </div>

    {/* Table */}
    <div className="table-wrapper" style={{ marginTop: 16 }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Tên khóa học</th>
            <th>Ghi chú</th>
            <th>Số lớp</th>
            <th>Học phí</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0
            ? <tr><td colSpan={6} className="empty-state"><p>Không tìm thấy khóa học nào</p></td></tr>
            : paginated.map(course => {
              const enrollment = getEnrollment(course.id);
              const availableClasses = getAvailableClasses(course.id);
              const allClasses = getCourseClasses(course.id);
              return (
                <tr key={course.id}>
                  <td>
                    <p style={{ fontWeight: 600, color: "var(--gray-900)" }}>{course.title}</p>
                  </td>
                  <td style={{ color: "var(--gray-500)", fontSize: "0.82rem", maxWidth: 200 }}>
                    {course.description?.slice(0, 60)}{course.description?.length > 60 ? "..." : ""}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{allClasses.length}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginLeft: 4 }}>
                      ({availableClasses.length} đang tuyển)
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: course.price > 0 ? "var(--primary)" : "var(--success)" }}>
                    {course.price > 0 ? `${Number(course.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                  </td>
                  <td>
                    {enrollment
                      ? <span className={`badge ${ENROLL_STATUS[enrollment.status]?.badge}`}>
                          {ENROLL_STATUS[enrollment.status]?.label}
                        </span>
                      : <span className="badge badge-gray">Chưa đăng ký</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDetailModal(course)}>
                        Chi tiết
                      </button>
                      {enrollment?.status === "pending" && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelEnroll(enrollment)}>
                          Hủy
                        </button>
                      )}
                      {!enrollment && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => handleEnrollClick(course)}
                          disabled={availableClasses.length === 0}>
                          {availableClasses.length === 0 ? "Hết lớp" : "Đăng ký"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ background: "transparent", border: "none", marginTop: 16 }}>
          <span className="pagination-info">Trang {page}/{totalPages} — {filtered.length} khóa học</span>
          <div className="pagination-btns">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      )}

      {/* Modal Chi tiết khóa học */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: `linear-gradient(135deg, ${EXAM_COLOR[detailModal.examType]}, ${EXAM_COLOR[detailModal.examType]}bb)` }}>
              <div>
                <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>{detailModal.examType} · {LEVEL_LABEL[detailModal.level]}</span>
                <h3 style={{ marginTop: 2 }}>{detailModal.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7 }}>{detailModal.description}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "12px 0" }}>
                <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--gray-400)", textTransform: "uppercase" }}>Học phí</p>
                  <p style={{ fontWeight: 600, color: "var(--primary)" }}>
                    {detailModal.price > 0 ? `${Number(detailModal.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                  </p>
                </div>
                <div style={{ background: "var(--gray-50)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--gray-400)", textTransform: "uppercase" }}>Cấp độ</p>
                  <p style={{ fontWeight: 600 }}>{LEVEL_LABEL[detailModal.level]}</p>
                </div>
              </div>

              {/* Danh sách lớp học */}
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "14px 0 8px" }}>🏫 Các lớp học</h4>
              {getCourseClasses(detailModal.id).length === 0
                ? <p style={{ fontSize: "0.82rem", color: "var(--gray-400)" }}>Chưa có lớp nào</p>
                : getCourseClasses(detailModal.id).map(cls => {
                  const myEnroll = enrollments.find(e => e.classId === cls.id);
                  return (
                    <div key={cls.id} className="class-detail-item">
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{cls.name}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                          📅 {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "—"} → {cls.endDate ? new Date(cls.endDate).toLocaleDateString("vi-VN") : "—"}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                          👥 {cls.currentStudents || 0}/{cls.maxStudents} học viên
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={`badge ${STATUS_BADGE[cls.status]}`}>{STATUS_LABEL[cls.status]}</span>
                        {myEnroll && myEnroll.classId === cls.id && (
                          <p style={{ marginTop: 4 }}>
                            <span className={`badge ${ENROLL_STATUS[myEnroll.status]?.badge}`}>
                              {ENROLL_STATUS[myEnroll.status]?.label}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              }

              {/* Trạng thái thanh toán */}
              {getEnrollment(detailModal.id) && (
                <div style={{ background: "var(--primary-light)", borderRadius: 8, padding: "12px 14px", marginTop: 12 }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)" }}>💳 Trạng thái thanh toán</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--gray-600)", marginTop: 4 }}>
                    {getEnrollment(detailModal.id)?.paid
                      ? "✅ Đã thanh toán"
                      : "⏳ Chưa thanh toán — Đang chờ admin phê duyệt"}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>Đóng</button>
              {!getEnrollment(detailModal.id) && (
                <button className="btn btn-primary" onClick={() => { setDetailModal(null); handleEnrollClick(detailModal); }}>
                  Đăng ký ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Đăng ký — Step 1: Chọn lớp */}
      {enrollModal && enrollStep === 1 && (
        <div className="modal-overlay" onClick={() => setEnrollModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đăng ký khóa học — {enrollModal.title}</h3>
              <button className="modal-close" onClick={() => setEnrollModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: 12 }}>
                Chọn lớp học phù hợp với lịch của bạn:
              </p>
              {getAvailableClasses(enrollModal.id).map(cls => (
                <div key={cls.id}
                  className={`class-select-item ${selectedClass?.id === cls.id ? "selected" : ""}`}
                  onClick={() => setSelectedClass(cls)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{cls.name}</p>
                      <p style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginTop: 2 }}>
                        📅 {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "—"} → {cls.endDate ? new Date(cls.endDate).toLocaleDateString("vi-VN") : "—"}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>
                        👥 {cls.currentStudents || 0}/{cls.maxStudents} học viên · Còn {cls.maxStudents - (cls.currentStudents || 0)} chỗ
                      </p>
                    </div>
                    <div className={`radio-circle ${selectedClass?.id === cls.id ? "checked" : ""}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEnrollModal(null)}>Hủy</button>
              <button className="btn btn-primary"
                disabled={!selectedClass}
                onClick={() => {
                  if (!selectedClass) {
                    toast.error("Vui lòng chọn một lớp học");
                    return;
                  }
                  setEnrollStep(2);
                }}>
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đăng ký — Step 2: Thanh toán */}
      {enrollModal && enrollStep === 2 && (
        <div className="modal-overlay" onClick={() => setEnrollStep(1)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💳 Thanh toán học phí</h3>
              <button className="modal-close" onClick={() => setEnrollModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Summary */}
              <div style={{ background: "var(--gray-50)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>Khóa học</p>
                <p style={{ fontWeight: 600 }}>{enrollModal.title}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginTop: 6 }}>Lớp học</p>
                <p style={{ fontWeight: 600 }}>{selectedClass?.name}</p>
                <div style={{ borderTop: "1px dashed var(--gray-200)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>Tổng thanh toán:</span>
                  <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1.1rem" }}>
                    {enrollModal.price > 0 ? `${Number(enrollModal.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                  </span>
                </div>
              </div>

              {/* Payment methods */}
              {enrollModal.price > 0 && (
                <>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 10 }}>Chọn phương thức thanh toán:</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { icon: "🏦", name: "Chuyển khoản ngân hàng", desc: "VCB / TCB / MB Bank" },
                      { icon: "📱", name: "Ví điện tử", desc: "Momo / ZaloPay / VNPay" },
                      { icon: "💳", name: "Thẻ tín dụng / ghi nợ", desc: "Visa / Mastercard" },
                    ].map((m, i) => (
                      <div key={i} style={{ border: "1.5px solid var(--gray-200)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                        onClick={() => toast("Tính năng thanh toán đang được phát triển")}>
                        <span style={{ fontSize: "1.3rem" }}>{m.icon}</span>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{m.name}</p>
                          <p style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>{m.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ background: "#fff8f0", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 14px", marginTop: 12, fontSize: "0.78rem", color: "#92400e" }}>
                ℹ️ <strong>Nếu bỏ qua thanh toán:</strong> Yêu cầu đăng ký sẽ được gửi đến admin để phê duyệt thủ công.
              </div>
            </div>
            <div className="modal-footer" style={{ flexDirection: "column", gap: 8 }}>
              <button className="btn btn-primary" style={{ width: "100%" }}
                onClick={handleEnrollWithPayment} disabled={enrolling}>
                {enrolling ? <span className="spinner" /> : `✅ Xác nhận thanh toán${enrollModal.price > 0 ? ` ${Number(enrollModal.price).toLocaleString("vi-VN")}đ` : ""}`}
              </button>
              <button className="btn btn-ghost" style={{ width: "100%" }}
                onClick={handleEnrollWithoutPayment} disabled={enrolling}>
                Bỏ qua thanh toán — Đăng ký chờ duyệt
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEnrollStep(1)}>← Quay lại chọn lớp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}