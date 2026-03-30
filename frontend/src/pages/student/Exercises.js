import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../admin/Admin.css";
import "./Student.css";

export default function StudentExercises() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [tab, setTab]           = useState("assignments");
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitContent, setSubmitContent] = useState("");
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
  if (!user) return;
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, qRes, subRes, submitRes] = await Promise.all([
        api.get("/assignments").catch(() => ({ data: { data: [] } })),
        api.get("/quizzes").catch(()    => ({ data: { data: [] } })),
        api.get(`/quizzes/submissions/user/${user.id}`)
           .catch(() => ({ data: { data: [] } })),
        api.get(`/assignments/submit/user/${user.id}`)
           .catch(() => ({ data: { data: [] } })),
      ]);

      const allAssigns   = aRes.data.data    || [];
      const allQuizzes   = qRes.data.data    || [];
      const myQuizSubs   = subRes.data.data  || [];
      const myAssignSubs = submitRes.data.data || [];

      // Enrich quiz với trạng thái đã làm
      setQuizzes(allQuizzes.map(q => ({
        ...q,
        completed: myQuizSubs.some(s =>
          Number(s.quizId || s.QuizID) === Number(q.id)
        ),
        score: myQuizSubs.find(s =>
          Number(s.quizId || s.QuizID) === Number(q.id)
        )?.score ?? null,
      })));

      // Enrich assignment với trạng thái đã nộp
      setAssignments(allAssigns.map(a => ({
        ...a,
        submitted: myAssignSubs.some(s =>
          Number(s.assignId || s.AssignID) === Number(a.id)
        ),
        score: myAssignSubs.find(s =>
          Number(s.assignId || s.AssignID) === Number(a.id)
        )?.score ?? null,
        comment: myAssignSubs.find(s =>
          Number(s.assignId || s.AssignID) === Number(a.id)
        )?.comment ?? null,
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  fetchAll();
  }, [user]);

  const isExpired     = dl => dl && new Date(dl) < new Date();
  const isNearDeadline = dl => {
    if (!dl) return false;
    const diff = new Date(dl) - new Date();
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  };

  const handleSubmit = async () => {
    if (!submitContent.trim()) { toast.error("Nhập nội dung bài làm"); return; }
    setSubmitting(true);
    try {
      await api.post(`/assignments/${submitModal.id}/submit`,
        { content: submitContent });
      toast.success("Nộp bài thành công!");
      setSubmitModal(null);
      setSubmitContent("");
      // Refresh
      const r = await api.get(`/assignmentsubmit/user/${user.id}`)
        .catch(() => ({ data:{ data:[] } }));
      const mySubmits = r.data.data || [];
      setAssignments(prev => prev.map(a => ({
        ...a,
        submitted: mySubmits.some(s => Number(s.AssignId) === Number(a.id)),
        score:     mySubmits.find(s => Number(s.AssignId) === Number(a.id))?.score ?? null,
        comment:   mySubmits.find(s => Number(s.AssignId) === Number(a.id))?.comment ?? null,
      })));
    } catch { toast.error("Không thể nộp bài"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner"/></div>;

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Bài tập & Kiểm tra</h1>
        <p>Bài tập và bài kiểm tra từ các lớp bạn đang học</p>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab-btn ${tab==="assignments"?"active":""}`}
          onClick={() => setTab("assignments")}>📋 Bài tập</button>
        <button className={`filter-tab-btn ${tab==="quizzes"?"active":""}`}
          onClick={() => setTab("quizzes")}>📝 Bài kiểm tra</button>
      </div>

      {/* ASSIGNMENTS */}
      {tab === "assignments" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {assignments.length === 0
            ? <div className="empty-state"><p>Chưa có bài tập nào</p></div>
            : assignments.map(a => {
              const expired = isExpired(a.deadline || a.HanNop);
              const near    = isNearDeadline(a.deadline || a.HanNop);
              const dl      = a.deadline || a.HanNop;
              return (
                <div key={a.id} style={{
                  background:"#fff", borderRadius:"var(--radius)",
                  padding:"16px 18px", boxShadow:"var(--shadow)",
                  display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", gap:12,
                  borderLeft:`3px solid ${expired?"var(--danger)":near?"var(--warning)":"var(--primary-mid)"}`
                }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                      <span className={`badge ${(a.examType||a.ExamType)==="IELTS"?"badge-blue":(a.examType||a.ExamType)==="TOEIC"?"badge-green":"badge-gray"}`}>
                        {a.examType||a.ExamType}
                      </span>
                      <span className="badge badge-orange">{a.examPart||a.ExamPart||a.type||a.Loai}</span>
                      {near && !expired && <span className="badge badge-yellow">⚠️ Sắp hết hạn</span>}
                      {expired           && <span className="badge badge-red">❌ Hết hạn</span>}
                      {a.submitted       && <span className="badge badge-green">✅ Đã nộp</span>}
                    </div>
                    <h4 style={{ fontWeight:600, marginBottom:4 }}>{a.title||a.TieuDe}</h4>
                    <p style={{ fontSize:"0.82rem", color:"var(--gray-500)", lineHeight:1.5 }}>
                      {(a.description||a.MoTa||"")?.slice(0,120)}
                      {(a.description||a.MoTa||"")?.length > 120 ? "..." : ""}
                    </p>
                    <div style={{ display:"flex", gap:14, fontSize:"0.75rem", color:"var(--gray-400)", marginTop:6, flexWrap:"wrap" }}>
                      <span>🏆 Điểm tối đa: {a.maxScore||a.DiemToiDa}</span>
                      {dl && (
                        <span style={{ color:expired?"var(--danger)":near?"var(--warning)":"var(--gray-400)" }}>
                          ⏰ Hạn: {new Date(dl).toLocaleString("vi-VN")}
                        </span>
                      )}
                      {a.score != null && (
                        <span style={{ color:"var(--success)", fontWeight:600 }}>
                          Điểm: {a.score}/{a.maxScore||a.DiemToiDa}
                        </span>
                      )}
                    </div>
                    {a.comment && (
                      <div style={{
                        background:"var(--success-light)", borderRadius:6,
                        padding:"6px 10px", marginTop:6,
                        fontSize:"0.78rem", color:"var(--gray-700)"
                      }}>
                        💬 Nhận xét: {a.comment}
                      </div>
                    )}
                  </div>
                  <div>
                    {!a.submitted && !expired && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => { setSubmitModal(a); setSubmitContent(""); }}>
                        📤 Nộp bài
                      </button>
                    )}
                    {a.submitted && a.score == null && (
                      <span style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>Chờ chấm</span>
                    )}
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* QUIZZES */}
      {tab === "quizzes" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {quizzes.length === 0
            ? <div className="empty-state"><p>Chưa có bài kiểm tra nào</p></div>
            : quizzes.map(q => (
              <div key={q.id} style={{
                background:"#fff", borderRadius:"var(--radius)",
                padding:"16px 18px", boxShadow:"var(--shadow)",
                display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", gap:12,
                borderLeft:"3px solid var(--primary-mid)"
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4, flexWrap:"wrap" }}>
                    <span className={`badge ${(q.examType||q.exam_type)==="IELTS"?"badge-blue":(q.examType||q.exam_type)==="TOEIC"?"badge-green":"badge-gray"}`}>
                      {q.examType||q.exam_type}
                    </span>
                    <span className="badge badge-purple">{q.examPart||q.exam_part}</span>
                    {q.timeLimit && <span className="badge badge-yellow">⏱ {q.timeLimit} phút</span>}
                    {q.completed  && <span className="badge badge-green">✅ Đã làm</span>}
                  </div>
                  <h4 style={{ fontWeight:600, marginBottom:4 }}>{q.title||q.TieuDe}</h4>
                  {q.score != null && (
                    <p style={{ fontWeight:600, color:"var(--primary)", marginTop:4, fontSize:"0.9rem" }}>
                      Điểm: {q.score}/100
                      {(q.examType||q.exam_type)==="IELTS" && ` (Band ~${(q.score/100*9).toFixed(1)})`}
                      {(q.examType||q.exam_type)==="TOEIC" && ` (~${Math.round(q.score/100*990)}/990)`}
                    </p>
                  )}
                </div>
                <div>
                  {q.completed
                    ? <span className="badge badge-gray">Đã nộp</span>
                    : <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/student/quiz/${q.id}`)}>
                        Làm bài →
                      </button>
                  }
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Modal nộp bài */}
      {submitModal && (
        <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Nộp bài — {submitModal.title||submitModal.TieuDe}</h3>
              <button className="modal-close" onClick={() => setSubmitModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                background:"var(--gray-50)", borderRadius:8,
                padding:"10px 14px", fontSize:"0.82rem",
                color:"var(--gray-600)", marginBottom:12, lineHeight:1.6
              }}>
                {submitModal.description||submitModal.MoTa}
              </div>
              <div className="form-group">
                <label>Bài làm của bạn *</label>
                <textarea rows={8} value={submitContent}
                  onChange={e => setSubmitContent(e.target.value)}
                  placeholder={
                    (submitModal.type||submitModal.Loai)==="speaking"
                      ? "Mô tả bài nói hoặc dán link recording..."
                      : "Viết bài của bạn tại đây..."
                  }
                  style={{
                    padding:"10px 12px", border:"1.5px solid var(--gray-200)",
                    borderRadius:8, resize:"vertical", outline:"none",
                    fontFamily:"inherit", lineHeight:1.7, width:"100%"
                  }}/>
              </div>
              <p style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>
                Hạn nộp: {submitModal.deadline||submitModal.HanNop
                  ? new Date(submitModal.deadline||submitModal.HanNop).toLocaleString("vi-VN")
                  : "Không giới hạn"}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSubmitModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="spinner"/> : "📤 Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}