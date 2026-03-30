import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../admin/Admin.css";

const IELTS_PARTS = ["Writing Task 1","Writing Task 2","Speaking Part 1","Speaking Part 2","Speaking Part 3"];
const TOEIC_PARTS = ["Speaking","Writing"];
const INIT = { title:"", description:"", type:"writing", examType:"IELTS", examPart:"", maxScore:100, deadline:"", lessonId:"" };
const PAGE_SIZE = 8;

export default function TeacherAssignments() {
  const { user } = useAuth();
  const [tab, setTab] = useState("assignments");
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(INIT);
  const [gradeForm, setGradeForm] = useState({ score:"", comment:"" });
  const [assignPage, setAssignPage] = useState(1);
  const [quizPage, setQuizPage] = useState(1);

  useEffect(() => {
  if (!user) return;
  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, qRes, uRes] = await Promise.all([
        // Dùng endpoint teacher thay vì /assignments trực tiếp
        api.get("/teacher/assignments"),
        api.get("/quizzes").catch(() => ({ data: { data: [] } })),
        api.get("/users"),
      ]);
      setAssignments(aRes.data.data || []);
      setQuizzes(qRes.data.data    || []);
      setUsers(uRes.data.data      || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };
  fetchData();
  }, [user]);

  // Phân trang
  const totalAssignPages = Math.ceil(assignments.length / PAGE_SIZE);
  const paginatedAssigns = assignments.slice((assignPage - 1) * PAGE_SIZE, assignPage * PAGE_SIZE);
  const totalQuizPages = Math.ceil(quizzes.length / PAGE_SIZE);
  const paginatedQuizzes = quizzes.slice((quizPage - 1) * PAGE_SIZE, quizPage * PAGE_SIZE);

  const loadSubmissions = async (assignId) => {
    try {
      const r = await api.get(`/assignments/${assignId}/submissions`).catch(() => ({ data:{ data:[] } }));
      setSubmissions(r.data.data || []);
    } catch { setSubmissions([]); }
  };

  const loadQuizResults = async (quizId) => {
    try {
      const r = await api.get(`/quizzes/${quizId}/submissions`).catch(() => ({ data:{ data:[] } }));
      setQuizResults(r.data.data || []);
    } catch { setQuizResults([]); }
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Nhập tiêu đề"); return; }
    try {
      if (modal === "add") {
        await api.post("/teacher/assignments", { ...form, maxScore: Number(form.maxScore) });
      } else {
        await api.put(`/assignments/${selected.id}`, { ...form, maxScore: Number(form.maxScore) });
      }
      toast.success(modal === "add" ? "Tạo bài tập thành công" : "Cập nhật thành công");
      setModal(null);
      // Refresh
      const r = await api.get("/assignments").catch(() => ({ data:{ data:[] } }));
      setAssignments(r.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bài tập này?")) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success("Đã xóa");
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error("Không thể xóa");
    }
  };

  const handleGrade = async () => {
    if (!gradeForm.score) { toast.error("Nhập điểm"); return; }
    try {
      await api.put(`/submissions/${selected.submissionId}/grade`, {
        score: Number(gradeForm.score),
        comment: gradeForm.comment,
      });
      toast.success("Chấm điểm thành công!");
      setModal("submissions");
      await loadSubmissions(selected.assignId);
    } catch {
      toast.error("Thất bại");
    }
  };

  const getUserName  = (id) => users.find(u => u.id === id || u.id === Number(id))?.name  || `ID: ${id}`;
  const getUserEmail = (id) => users.find(u => u.id === id || u.id === Number(id))?.email || "";
  const getParts = () => form.examType === "IELTS" ? IELTS_PARTS : TOEIC_PARTS;

  const Pagination = ({ page, total, onChange }) => total <= 1 ? null : (
    <div className="pagination">
      <span className="pagination-info">{((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, page*PAGE_SIZE)} / tổng {total} trang</span>
      <div className="pagination-btns">
        <button className="page-btn" disabled={page===1} onClick={() => onChange(p=>p-1)}>‹</button>
        {Array.from({length: total}, (_,i) => (
          <button key={i+1} className={`page-btn ${page===i+1?"active":""}`} onClick={() => onChange(i+1)}>{i+1}</button>
        ))}
        <button className="page-btn" disabled={page===total} onClick={() => onChange(p=>p+1)}>›</button>
      </div>
    </div>
  );

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Bài tập & Bài kiểm tra</h1>
        <p>Quản lý bài tập và xem kết quả bài kiểm tra lớp bạn phụ trách</p>
      </div>

      {/* Tabs */}
      <div className="teacher-tabs">
        <button className={`ttab ${tab==="assignments"?"active":""}`} onClick={() => setTab("assignments")}>
          📋 Bài tập ({assignments.length})
        </button>
        <button className={`ttab ${tab==="quizzes"?"active":""}`} onClick={() => setTab("quizzes")}>
          📝 Bài kiểm tra ({quizzes.length})
        </button>
      </div>

      {/* ===== ASSIGNMENTS ===== */}
      {tab === "assignments" && (
        <>
          <div className="toolbar">
            <div className="toolbar-left" />
            <button className="btn btn-primary" onClick={() => { setForm(INIT); setModal("add"); }}>
              + Tạo bài tập
            </button>
          </div>

          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : assignments.length === 0 ? (
            <div className="empty-state"><p>Chưa có bài tập nào</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Phần</th>
                    <th>Điểm tối đa</th>
                    <th>Hạn nộp</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssigns.map(a => (
                    <tr key={a.id}>
                      <td>
                        <p style={{ fontWeight:500 }}>{a.title}</p>
                        <p style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>
                          {a.description?.slice(0,60)}{a.description?.length > 60 ? "..." : ""}
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${a.examType==="IELTS"?"badge-blue":a.examType==="TOEIC"?"badge-green":"badge-gray"}`}>
                          {a.examType}
                        </span>
                      </td>
                      <td style={{ fontSize:"0.82rem" }}>{a.examPart || a.type || "—"}</td>
                      <td style={{ fontWeight:500 }}>{a.maxScore}</td>
                      <td style={{ fontSize:"0.78rem", color:"var(--gray-500)" }}>
                        {a.deadline ? new Date(a.deadline).toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
                      </td>
                      <td>
                        <span className={`badge ${a.status==="active"?"badge-green":a.status==="closed"?"badge-gray":"badge-red"}`}>
                          {a.status==="active"?"Đang mở":a.status==="closed"?"Đã đóng":"Ẩn"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:"flex", gap:4 }}>
                          <button className="btn btn-info btn-sm" title="Xem bài nộp"
                            onClick={async () => {
                              setSelected({ ...a, assignId:a.id });
                              await loadSubmissions(a.id);
                              setModal("submissions");
                            }}>👁️</button>
                          <button className="btn btn-warning btn-sm" title="Sửa"
                            onClick={() => {
                              setForm({
                                title: a.title, description: a.description||"",
                                type: a.type, examType: a.examType,
                                examPart: a.examPart||"", maxScore: a.maxScore,
                                deadline: a.deadline ? a.deadline.slice(0,16) : "",
                                lessonId: a.lessonId||"",
                              });
                              setSelected(a); setModal("edit");
                            }}>✏️</button>
                          <button className="btn btn-danger btn-sm" title="Xóa"
                            onClick={() => handleDelete(a.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={assignPage} total={totalAssignPages} onChange={setAssignPage} />
            </div>
          )}
        </>
      )}

      {/* ===== QUIZZES ===== */}
      {tab === "quizzes" && (
        <>
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state"><p>Chưa có bài kiểm tra nào</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Phần thi</th>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedQuizzes.map(q => (
                    <tr key={q.id}>
                      <td>
                        <p style={{ fontWeight:500 }}>{q.title}</p>
                        <p style={{ fontSize:"0.72rem", color:"var(--warning)" }}>
                          ⚠️ Chỉ xem kết quả — không thể chỉnh sửa
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${q.examType==="IELTS"?"badge-blue":q.examType==="TOEIC"?"badge-green":"badge-gray"}`}>
                          {q.examType}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple">{q.examPart||"—"}</span>
                      </td>
                      <td style={{ fontSize:"0.82rem" }}>
                        {q.timeLimit ? `${q.timeLimit} phút` : "—"}
                      </td>
                      <td>
                        <button className="btn btn-info btn-sm"
                          onClick={async () => {
                            setSelected(q);
                            await loadQuizResults(q.id);
                            setModal("quiz-results");
                          }}>
                          📊 Kết quả
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={quizPage} total={totalQuizPages} onChange={setQuizPage} />
            </div>
          )}
        </>
      )}

      {/* ===== MODAL: Thêm / Sửa bài tập ===== */}
      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal==="add" ? "Tạo bài tập mới" : "Chỉnh sửa bài tập"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Loại chứng chỉ</label>
                  <select value={form.examType}
                    onChange={e => setForm({...form, examType:e.target.value, examPart:""})}>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dạng bài</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                    <option value="writing">✍️ Writing</option>
                    <option value="speaking">🎤 Speaking</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Phần thi cụ thể</label>
                <select value={form.examPart} onChange={e => setForm({...form, examPart:e.target.value})}>
                  <option value="">— Chọn phần —</option>
                  {getParts().map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})}
                  placeholder="Nhập tiêu đề bài tập..." />
              </div>
              <div className="form-group">
                <label>Đề bài / Nội dung</label>
                <textarea rows={5} value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})}
                  placeholder={
                    form.examPart==="Writing Task 2"
                      ? "Some people believe that... To what extent do you agree or disagree?"
                      : form.examPart==="Speaking Part 2"
                      ? "Talk about a place you have visited. You should say: where it is, when you went there..."
                      : "Nhập đề bài hoặc hướng dẫn làm bài..."
                  } />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Điểm tối đa</label>
                  <input type="number" value={form.maxScore}
                    onChange={e => setForm({...form, maxScore:e.target.value})}
                    min={0} max={9} step={form.examType==="IELTS"?0.5:1} />
                </div>
                <div className="form-group">
                  <label>Hạn nộp bài</label>
                  <input type="datetime-local" value={form.deadline}
                    onChange={e => setForm({...form, deadline:e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modal==="add" ? "Tạo bài tập" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Xem bài nộp ===== */}
      {modal === "submissions" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:660 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Bài nộp — {selected?.title}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {submissions.length === 0 ? (
                <div className="empty-state"><p>Chưa có học viên nào nộp bài</p></div>
              ) : (
                submissions.map(s => (
                  <div key={s.id} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                    gap:12, padding:"14px 0", borderBottom:"1px solid var(--gray-100)"
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <div className="avatar" style={{ width:28, height:28, fontSize:"0.7rem" }}>
                          {getUserName(s.userId)?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight:600, fontSize:"0.875rem" }}>{getUserName(s.userId)}</p>
                          <p style={{ fontSize:"0.72rem", color:"var(--gray-400)" }}>{getUserEmail(s.userId)}</p>
                        </div>
                      </div>
                      <p style={{ fontSize:"0.72rem", color:"var(--gray-400)" }}>
                        Nộp lúc: {s.submittedAt ? new Date(s.submittedAt).toLocaleString("vi-VN") : "—"}
                      </p>
                      {s.content && (
                        <div style={{
                          fontSize:"0.82rem", color:"var(--gray-700)", marginTop:6,
                          background:"var(--gray-50)", padding:"8px 10px", borderRadius:6,
                          maxHeight:80, overflow:"auto", lineHeight:1.6
                        }}>
                          {s.content?.slice(0,200)}{s.content?.length > 200 ? "..." : ""}
                        </div>
                      )}
                      {s.comment && (
                        <div style={{
                          fontSize:"0.78rem", color:"var(--gray-700)", marginTop:6,
                          background:"var(--success-light)", padding:"6px 10px", borderRadius:6
                        }}>
                          💬 Nhận xét: {s.comment}
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink:0, textAlign:"right" }}>
                      {s.score !== null && s.score !== undefined ? (
                        <span className="badge badge-green">
                          ✅ {s.score}/{selected?.maxScore}
                        </span>
                      ) : (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelected(prev => ({...prev, submissionId: s.id}));
                            setGradeForm({ score:"", comment:"" });
                            setModal("grade");
                          }}>
                          ✏️ Chấm điểm
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Chấm điểm ===== */}
      {modal === "grade" && (
        <div className="modal-overlay" onClick={() => setModal("submissions")}>
          <div className="modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Chấm điểm</h3>
              <button className="modal-close" onClick={() => setModal("submissions")}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Điểm số (tối đa {selected?.maxScore})</label>
                <input type="number" value={gradeForm.score}
                  onChange={e => setGradeForm({...gradeForm, score:e.target.value})}
                  min={0} max={selected?.maxScore}
                  step={selected?.examType==="IELTS"?0.5:1}
                  placeholder="Nhập điểm..." />
              </div>
              <div className="form-group">
                <label>Nhận xét chi tiết</label>
                <textarea rows={5} value={gradeForm.comment}
                  onChange={e => setGradeForm({...gradeForm, comment:e.target.value})}
                  placeholder="VD: Task Achievement: 7.0. Coherence: 6.5. Từ vựng tốt nhưng cần đa dạng hơn cấu trúc câu..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal("submissions")}>Quay lại</button>
              <button className="btn btn-primary" onClick={handleGrade}>✅ Lưu điểm</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Kết quả quiz ===== */}
      {modal === "quiz-results" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Kết quả — {selected?.title}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                background:"var(--warning-light)", borderRadius:8,
                padding:"8px 12px", fontSize:"0.78rem", color:"var(--warning)",
                marginBottom:12
              }}>
                ⚠️ Bài kiểm tra do Admin tạo — Giáo viên chỉ có thể xem kết quả, không thể chỉnh sửa.
              </div>
              {quizResults.length === 0 ? (
                <div className="empty-state"><p>Chưa có học viên nào làm bài</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Học viên</th><th>Điểm</th><th>Band / Score</th><th>Thời gian nộp</th></tr>
                  </thead>
                  <tbody>
                    {quizResults.map(r => (
                      <tr key={r.id}>
                        <td>
                          <p style={{ fontWeight:500, fontSize:"0.875rem" }}>{getUserName(r.userId)}</p>
                          <p style={{ fontSize:"0.72rem", color:"var(--gray-400)" }}>{getUserEmail(r.userId)}</p>
                        </td>
                        <td>
                          <span className={`badge ${r.score>=70?"badge-green":r.score>=50?"badge-yellow":"badge-red"}`}>
                            {r.score}/100
                          </span>
                        </td>
                        <td style={{ fontSize:"0.82rem", color:"var(--gray-600)" }}>
                          {selected?.examType==="IELTS" && `Band ${(r.score/100*9).toFixed(1)}`}
                          {selected?.examType==="TOEIC" && `~${Math.round(r.score/100*990)}/990`}
                        </td>
                        <td style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>
                          {r.submittedAt ? new Date(r.submittedAt).toLocaleString("vi-VN") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}