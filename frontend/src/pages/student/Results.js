import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../admin/Admin.css";
import "./Student.css";

export default function StudentResults() {
  const { user } = useAuth();
  const [tab,          setTab]          = useState("assignments");
  const [assignSubs,   setAssignSubs]   = useState([]);
  const [quizSubs,     setQuizSubs]     = useState([]);
  const [assignments,  setAssignments]  = useState([]);
  const [quizzes,      setQuizzes]      = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [asRes, qsRes, aRes, qRes] = await Promise.all([
          api.get(`/assignments/submit/user/${user.id}`)
             .catch(() => ({ data: { data: [] } })),
          api.get(`/quizzes/submissions/user/${user.id}`)
             .catch(() => ({ data: { data: [] } })),
          api.get("/assignments").catch(() => ({ data: { data: [] } })),
          api.get("/quizzes").catch(()    => ({ data: { data: [] } })),
        ]);
        setAssignSubs(asRes.data.data || []);
        setQuizSubs(  qsRes.data.data || []);
        setAssignments(aRes.data.data  || []);
        setQuizzes(    qRes.data.data  || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const getAssignment = (id) =>
    assignments.find(a => Number(a.id) === Number(id));
  const getQuiz = (id) =>
    quizzes.find(q => Number(q.id) === Number(id));

  const scoreColor = (score, max) => {
    if (score == null) return "var(--gray-400)";
    const pct = (score / (max || 100)) * 100;
    if (pct >= 75) return "var(--success)";
    if (pct >= 50) return "var(--warning)";
    return "var(--danger)";
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Kết quả học tập</h1>
        <p>Kết quả bài tập và bài kiểm tra của bạn</p>
      </div>

      {/* Stats tổng quan */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ "--card-color": "var(--primary)" }}>
          <div className="stat-icon">📋</div>
          <div className="stat-body">
            <p className="stat-label">Bài tập đã nộp</p>
            <h3 className="stat-value">{assignSubs.length}</h3>
          </div>
        </div>
        <div className="stat-card" style={{ "--card-color": "var(--success)" }}>
          <div className="stat-icon">✅</div>
          <div className="stat-body">
            <p className="stat-label">Bài tập đã chấm</p>
            <h3 className="stat-value">
              {assignSubs.filter(s => s.status === "graded" || s.TrangThai === "graded").length}
            </h3>
          </div>
        </div>
        <div className="stat-card" style={{ "--card-color": "#7c3aed" }}>
          <div className="stat-icon">📝</div>
          <div className="stat-body">
            <p className="stat-label">Bài kiểm tra đã làm</p>
            <h3 className="stat-value">{quizSubs.length}</h3>
          </div>
        </div>
        <div className="stat-card" style={{ "--card-color": "var(--info)" }}>
          <div className="stat-icon">📊</div>
          <div className="stat-body">
            <p className="stat-label">Điểm TB bài kiểm tra</p>
            <h3 className="stat-value">
              {quizSubs.length > 0
                ? (quizSubs.reduce((s, q) => s + Number(q.score || q.Diem || 0), 0) / quizSubs.length).toFixed(1)
                : "—"}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab-btn ${tab === "assignments" ? "active" : ""}`}
          onClick={() => setTab("assignments")}>
          📋 Bài tập
        </button>
        <button
          className={`filter-tab-btn ${tab === "quizzes" ? "active" : ""}`}
          onClick={() => setTab("quizzes")}>
          📝 Bài kiểm tra
        </button>
      </div>

      {/* ── Bài tập ── */}
      {tab === "assignments" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Loại / Part</th>
                <th>Ngày nộp</th>
                <th>Điểm</th>
                <th>Nhận xét</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {assignSubs.length === 0
                ? <tr>
                    <td colSpan={6} className="empty-state">
                      <p>Chưa có bài tập nào được nộp</p>
                    </td>
                  </tr>
                : assignSubs.map(s => {
                  const assign = getAssignment(s.assignId || s.AssignID);
                  const score  = s.score ?? s.Diem ?? null;
                  const maxSc  = assign?.maxScore || assign?.DiemToiDa || 100;
                  const st     = s.status || s.TrangThai;
                  const graded = st === "graded";
                  return (
                    <tr key={s.id || s.SubmitID}>
                      <td>
                        <p style={{ fontWeight: 500 }}>
                          {assign?.title || assign?.TieuDe || `Bài tập #${s.assignId || s.AssignID}`}
                        </p>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(assign?.examType || assign?.ExamType) && (
                            <span className={`badge ${(assign?.examType||assign?.ExamType)==="IELTS"?"badge-blue":"badge-green"}`}>
                              {assign?.examType || assign?.ExamType}
                            </span>
                          )}
                          {(assign?.examPart || assign?.ExamPart || assign?.Part) && (
                            <span className="badge badge-gray">
                              {assign?.examPart || assign?.ExamPart || assign?.Part}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                        {(s.submittedAt || s.NgayNop)
                          ? new Date(s.submittedAt || s.NgayNop).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        {graded && score != null
                          ? (
                            <div>
                              <span style={{
                                fontWeight: 700, fontSize: "1.1rem",
                                color: scoreColor(score, maxSc)
                              }}>
                                {score}
                              </span>
                              <span style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>
                                /{maxSc}
                              </span>
                              {/* Band IELTS */}
                              {(assign?.examType || assign?.ExamType) === "IELTS" && maxSc <= 9 && (
                                <p style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
                                  Band {Number(score).toFixed(1)}
                                </p>
                              )}
                            </div>
                          )
                          : <span style={{ color: "var(--gray-400)", fontSize: "0.82rem" }}>—</span>
                        }
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        {(s.comment || s.NhanXet)
                          ? (
                            <p style={{
                              fontSize: "0.78rem", color: "var(--gray-600)",
                              lineHeight: 1.5,
                              overflow: "hidden", textOverflow: "ellipsis",
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical"
                            }}>
                              {s.comment || s.NhanXet}
                            </p>
                          )
                          : <span style={{ color: "var(--gray-300)", fontSize: "0.78rem" }}>—</span>
                        }
                      </td>
                      <td>
                        <span className={`badge ${graded ? "badge-green" : "badge-yellow"}`}>
                          {graded ? "✅ Đã chấm" : "⏳ Chờ chấm"}
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

      {/* ── Bài kiểm tra ── */}
      {tab === "quizzes" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài kiểm tra</th>
                <th>Loại</th>
                <th>Ngày làm</th>
                <th>Điểm</th>
                <th>Band / Score ước tính</th>
                <th>Thời gian làm</th>
              </tr>
            </thead>
            <tbody>
              {quizSubs.length === 0
                ? <tr>
                    <td colSpan={6} className="empty-state">
                      <p>Chưa có bài kiểm tra nào được hoàn thành</p>
                    </td>
                  </tr>
                : quizSubs.map(s => {
                  const quiz  = getQuiz(s.quizId || s.QuizID);
                  const score = Number(s.score || s.Diem || 0);
                  const exam  = quiz?.examType || quiz?.exam_type || "";
                  const mins  = s.timeSpent || s.ThoiGianLam
                    ? Math.floor((s.timeSpent || s.ThoiGianLam) / 60)
                    : null;
                  return (
                    <tr key={s.id || s.SubmissionID}>
                      <td>
                        <p style={{ fontWeight: 500 }}>
                          {quiz?.title || quiz?.TieuDe || `Quiz #${s.quizId || s.QuizID}`}
                        </p>
                        {(quiz?.examPart || quiz?.exam_part) && (
                          <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                            {quiz?.examPart || quiz?.exam_part}
                          </p>
                        )}
                      </td>
                      <td>
                        {exam && (
                          <span className={`badge ${exam === "IELTS" ? "badge-blue" : exam === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                            {exam}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                        {(s.submittedAt || s.NgayNop)
                          ? new Date(s.submittedAt || s.NgayNop).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: "1.1rem",
                          color: scoreColor(score, 100)
                        }}>
                          {score.toFixed(1)}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "var(--gray-400)" }}>/100</span>
                      </td>
                      <td>
                        {exam === "IELTS" && (
                          <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                            Band {(score / 100 * 9).toFixed(1)}
                          </span>
                        )}
                        {exam === "TOEIC" && (
                          <span style={{ fontWeight: 600, color: "var(--success)" }}>
                            ~{Math.round(score / 100 * 990)}/990
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "var(--gray-500)" }}>
                        {mins != null ? `${mins} phút` : "—"}
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
  );
}