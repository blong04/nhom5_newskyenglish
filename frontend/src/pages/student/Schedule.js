import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../admin/Admin.css";
import "./Student.css";

export default function StudentSchedule() {
  const { user }  = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [schedules,   setSchedules]   = useState([]);
  const [classes,     setClasses]     = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [filter,      setFilter]      = useState("all");
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [eRes, clsRes, courseRes] = await Promise.all([
          api.get("/student/enrollments"),
          api.get("/classes"),
          api.get("/courses"),
        ]);

        const myEnrolls  = (eRes.data.data || []).filter(e =>
          ["approved", "enrolled"].includes(e.status)
        );
        const allClasses = clsRes.data.data  || [];
        const allCourses = courseRes.data.data || [];

        setEnrollments(myEnrolls);
        setClasses(allClasses);
        setCourses(allCourses);

        // Lấy schedules của các lớp đang học
        const myClassIds = [...new Set(
          myEnrolls.map(e => e.classId).filter(Boolean)
        )];

        const allSchedules = [];
        for (const classId of myClassIds) {
          const r = await api.get(`/schedules/class/${classId}`)
            .catch(() => ({ data: { data: [] } }));
          (r.data.data || []).forEach(s =>
            allSchedules.push({ ...s, classId })
          );
        }
        setSchedules(allSchedules);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const getClass  = (id) => classes.find(c => Number(c.id) === Number(id));
  const getCourse = (id) => courses.find(c => Number(c.id) === Number(id));

  const getStatusByTime = (dateVal, startT, endT) => {
  if (!dateVal) return "scheduled";

  const now = new Date();

  // Tạo datetime đầy đủ
  const start = new Date(dateVal);
  const end   = new Date(dateVal);

  if (startT) {
    const [h, m] = startT.split(":");
    start.setHours(h, m, 0);
  }

  if (endT) {
    const [h, m] = endT.split(":");
    end.setHours(h, m, 0);
  }

  if (now < start) return "scheduled";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
};
  // Filter lịch học theo tuần/tháng
  const now          = new Date();
  const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek    = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const filteredSchedules = schedules.filter(s => {
    const d = new Date(s.date || s.NgayHoc || s.ngayHoc);
    if (filter === "week")  return d >= startOfWeek  && d <= endOfWeek;
    if (filter === "month") return d >= startOfMonth && d <= endOfMonth;
    return true;
  }).sort((a, b) =>
    new Date(a.date || a.NgayHoc) - new Date(b.date || b.NgayHoc)
  );

  const STATUS_BADGE = {
    scheduled: "badge-blue", ongoing: "badge-green",
    completed: "badge-gray", cancelled: "badge-red"
  };
  const STATUS_LABEL = {
    scheduled: "Sắp diễn ra", ongoing: "Đang diễn ra",
    completed: "Hoàn thành",  cancelled: "Đã hủy"
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Lớp & Lịch học</h1>
        <p>Thông tin các lớp và lịch học của bạn</p>
      </div>

      {/* ── Lớp đang tham gia ── */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <h3 className="section-title">
          🏫 Lớp đang tham gia ({enrollments.length})
        </h3>

        {enrollments.length === 0
          ? <div className="empty-state"><p>Bạn chưa tham gia lớp học nào</p></div>
          : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14
            }}>
              {enrollments.map(e => {
                const cls    = getClass(e.classId);
                const course = getCourse(e.courseId);
                if (!cls && !e.className) return null;

                const clsName    = cls?.name     || e.className    || `Lớp #${e.classId}`;
                const courseName = course?.title  || e.courseName   || `Khóa #${e.courseId}`;
                const examType   = course?.examType || e.examType   || "";
                const startDate  = cls?.startDate || e.startDate;
                const endDate    = cls?.endDate   || e.endDate;
                const progress   = e.progress     || 0;

                return (
                  <div key={e.id} style={{
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    background: "#fff",
                    boxShadow: "var(--shadow)",
                    transition: "all 0.2s",
                  }}>
                    {/* Header màu */}
                    <div style={{
                      background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                      padding: "14px 16px",
                      color: "#fff"
                    }}>
                      {examType && (
                        <span style={{
                          background: "rgba(255,255,255,0.25)",
                          padding: "2px 8px", borderRadius: 20,
                          fontSize: "0.7rem", fontWeight: 700
                        }}>
                          {examType}
                        </span>
                      )}
                      <p style={{ fontWeight: 700, marginTop: 6, fontSize: "1rem" }}>
                        {clsName}
                      </p>
                      <p style={{ fontSize: "0.78rem", opacity: 0.85 }}>
                        {courseName}
                      </p>
                    </div>

                    {/* Body */}
                    <div style={{ padding: "12px 16px" }}>
                      {(startDate || endDate) && (
                        <p style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginBottom: 8 }}>
                          📅 {startDate ? new Date(startDate).toLocaleDateString("vi-VN") : "—"}
                          {" → "}
                          {endDate ? new Date(endDate).toLocaleDateString("vi-VN") : "—"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>

      {/* ── Lịch học ── */}
      <div className="section-card">
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 16
        }}>
          <h3 className="section-title" style={{ margin: 0 }}>📅 Lịch học</h3>
          <div className="filter-tabs" style={{ margin: 0 }}>
            {[["week","Tuần này"],["month","Tháng này"],["all","Tất cả"]].map(([k,l]) => (
              <button key={k}
                className={`filter-tab-btn ${filter === k ? "active" : ""}`}
                onClick={() => setFilter(k)}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {filteredSchedules.length === 0
          ? <div className="empty-state"><p>Không có lịch học nào</p></div>
          : filteredSchedules.map(s => {
            const cls    = getClass(s.id || s.ID);
            const course = getCourse(cls?.courseId || cls?.CourseID);

            const title   = s.title    || s.TieuDe    || "";
            const dateVal = s.date     || s.NgayHoc   || null;
            const startT  = s.startTime|| s.GioBatDau || "";
            const endT    = s.endTime  || s.GioKetThuc|| "";
            const loc     = s.location || s.DiaDiem   || "Tại trung tâm";
            const st = getStatusByTime(dateVal, startT, endT);
            const d       = dateVal ? new Date(dateVal) : null;
            const isToday = d?.toDateString() === now.toDateString();

            return (
              <div key={s.id || s.ScheduleID} style={{
                display: "flex", gap: 14, alignItems: "flex-start",
                padding: "12px 14px", borderRadius: 10, marginBottom: 8,
                background: isToday ? "var(--primary-light)" : "var(--gray-50)",
                borderLeft: `3px solid ${isToday ? "var(--primary)" : "var(--gray-200)"}`,
              }}>
                {/* Date */}
                <div style={{ textAlign: "center", minWidth: 40, flexShrink: 0 }}>
                  <span style={{
                    display: "block", fontSize: "1.3rem", fontWeight: 700,
                    color: "var(--gray-900)", lineHeight: 1
                  }}>
                    {d ? d.getDate() : "—"}
                  </span>
                  <span style={{
                    display: "block", fontSize: "0.68rem",
                    color: "var(--gray-500)", textTransform: "uppercase"
                  }}>
                    {d ? d.toLocaleDateString("vi-VN", { month: "short" }) : ""}
                  </span>
                  {isToday && (
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--primary)", margin: "3px auto 0"
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start"
                  }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{title}</p>
                      <p style={{
                        fontSize: "0.78rem", color: "var(--gray-500)", marginTop: 2
                      }}>
                        {cls?.name || s.className || ""}
                        {course ? ` · ${course.title}` : ""}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[st] || "badge-gray"}`}>
                      {STATUS_LABEL[st] || st}
                    </span>
                  </div>

                  <div style={{
                    display: "flex", gap: 14, fontSize: "0.75rem",
                    color: "var(--gray-500)", marginTop: 6, flexWrap: "wrap"
                  }}>
                    <span>
                      ⏰ {startT?.toString().slice(0, 5)} – {endT?.toString().slice(0, 5)}
                    </span>
                    <span>📍 {loc}</span>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}