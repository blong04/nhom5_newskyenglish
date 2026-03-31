import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";
import "./Quizzes.css";

// Cấu trúc IELTS & TOEIC thật
const EXAM_STRUCTURE = {
  IELTS: {
    parts: [
      { key: "Reading", label: "Reading", desc: "3 passages, 40 câu, 60 phút" },
      { key: "Listening", label: "Listening", desc: "4 sections, 40 câu, 30 phút" },
      { key: "Writing_Task1", label: "Writing Task 1", desc: "Mô tả biểu đồ/sơ đồ, 150 từ" },
      { key: "Writing_Task2", label: "Writing Task 2", desc: "Bài luận, 250 từ" },
    ]
  },
  TOEIC: {
    parts: [
      { key: "Part1", label: "Part 1 – Photographs", desc: "6 câu, xem ảnh chọn mô tả đúng" },
      { key: "Part2", label: "Part 2 – Question-Response", desc: "25 câu, nghe câu hỏi chọn đáp án" },
      { key: "Part3", label: "Part 3 – Conversations", desc: "39 câu, nghe đoạn hội thoại" },
      { key: "Part4", label: "Part 4 – Short Talks", desc: "30 câu, nghe bài nói ngắn" },
      { key: "Part5", label: "Part 5 – Incomplete Sentences", desc: "30 câu, điền vào chỗ trống" },
      { key: "Part6", label: "Part 6 – Text Completion", desc: "16 câu, điền vào đoạn văn" },
      { key: "Part7", label: "Part 7 – Reading Comprehension", desc: "54 câu, đọc hiểu" },
    ]
  }
};

const INIT_QUIZ = { lessonId: "", title: "", examType: "IELTS", examPart: "", instructions: "", timeLimit: 60, passageText: "", audioUrl: "" };
const INIT_Q = { content: "", questionType: "mcq", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "", imageUrl: "", explanation: "" };

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=chọn loại, 2=thông tin quiz, 3=tạo câu hỏi
  const [creating, setCreating] = useState(false);
  const [quizForm, setQuizForm] = useState(INIT_QUIZ);
  const [questions, setQuestions] = useState([{ ...INIT_Q }]);
  const [filterType, setFilterType] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, lRes] = await Promise.all([api.get("/quizzes"), api.get("/lessons").catch(() => ({ data: { data: [] } }))]);
      setQuizzes(qRes.data.data || []);
      setLessons(lRes.data.data || []);
    } catch { toast.error("Không thể tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = quizzes.filter(q => !filterType || q.examType === filterType);

  const selectedPart = EXAM_STRUCTURE[quizForm.examType]?.parts.find(p => p.key === quizForm.examPart);

  // Xác định loại câu hỏi phù hợp với part
  const getQuestionTypes = () => {
    const { examType, examPart } = quizForm;
    if (examType === "IELTS") {
      if (examPart === "Listening" || examPart === "Reading") return ["mcq", "fill_blank", "matching"];
      if (examPart?.startsWith("Writing")) return ["writing"];
    }
    if (examType === "TOEIC") {
      if (["Part1", "Part2", "Part3", "Part4"].includes(examPart)) return ["mcq"];
      if (["Part5", "Part6"].includes(examPart)) return ["mcq", "fill_blank"];
      if (examPart === "Part7") return ["mcq"];
    }
    return ["mcq", "fill_blank"];
  };

  const needsPassage = () => {
    const { examType, examPart } = quizForm;
    return (examType === "IELTS" && (examPart === "Reading" || examPart?.startsWith("Writing"))) ||
           (examType === "TOEIC" && ["Part6", "Part7"].includes(examPart));
  };

  const needsAudio = () => {
    const { examType, examPart } = quizForm;
    return (examType === "IELTS" && examPart === "Listening") ||
           (examType === "TOEIC" && ["Part1","Part2","Part3","Part4"].includes(examPart));
  };

  const addQuestion = () => setQuestions([...questions, { ...INIT_Q, questionType: getQuestionTypes()[0] }]);
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => setQuestions(questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const handleSubmit = async () => {
    if (!quizForm.title) { toast.error("Nhập tiêu đề quiz"); return; }
    if (!quizForm.examPart) { toast.error("Chọn phần thi"); return; }
    if (questions.some(q => !q.content)) { toast.error("Nhập nội dung tất cả câu hỏi"); return; }
    try {
      await api.post("/quizzes", {
        ...quizForm,
        lessonId: quizForm.lessonId ? Number(quizForm.lessonId) : null,
        timeLimit: Number(quizForm.timeLimit),
        questions: questions.map((q, i) => ({ ...q, orderNum: i + 1 }))
      });
      toast.success("Tạo bài kiểm tra thành công!");
      setCreating(false); setStep(1); setQuizForm(INIT_QUIZ); setQuestions([{ ...INIT_Q }]);
      fetchData();
    } catch (e) { toast.error(e.response?.data?.message || "Thất bại"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bài kiểm tra?")) return;
    try { await api.delete(`/quizzes/${id}`); toast.success("Đã xóa"); fetchData(); }
    catch { toast.error("Không thể xóa"); }
  };

  if (creating) return (
    <div className="admin-page fade-in">
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { setCreating(false); setStep(1); }}>← Quay lại</button>
        <div>
          <h1>Tạo bài kiểm tra mới</h1>
          <p>Bước {step}/3 — {step === 1 ? "Chọn loại bài thi" : step === 2 ? "Cấu hình bài thi" : "Nhập câu hỏi"}</p>
        </div>
      </div>

      {/* STEP INDICATOR */}
      <div className="step-indicator">
        {["Loại bài thi","Cấu hình","Câu hỏi"].map((s, i) => (
          <div key={i} className={`step-item ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
            <div className="step-circle">{step > i + 1 ? "✓" : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: CHỌN LOẠI */}
      {step === 1 && (
        <div className="section-card">
          <h3 className="section-title">Chọn loại bài kiểm tra</h3>
          <div className="exam-type-grid">
            {["IELTS","TOEIC"].map(type => (
              <div key={type}
                className={`exam-type-card ${quizForm.examType === type ? "selected" : ""}`}
                onClick={() => setQuizForm({ ...quizForm, examType: type, examPart: "" })}>
                <div className="exam-type-icon">{type === "IELTS" ? "🎓" : "💼"}</div>
                <h4>{type}</h4>
                <p>{type === "IELTS" ? "International English Language Testing System" : "Test of English for International Communication"}</p>
                <div className="exam-parts-preview">
                  {EXAM_STRUCTURE[type].parts.map(p => (
                    <span key={p.key} className="part-tag">{p.label}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h3 className="section-title" style={{ marginTop: 24 }}>Chọn phần thi</h3>
          <div className="parts-grid">
            {EXAM_STRUCTURE[quizForm.examType].parts.map(p => (
              <div key={p.key}
                className={`part-card ${quizForm.examPart === p.key ? "selected" : ""}`}
                onClick={() => setQuizForm({ ...quizForm, examPart: p.key })}>
                <h5>{p.label}</h5>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" disabled={!quizForm.examPart} onClick={() => setStep(2)}>
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CẤU HÌNH */}
      {step === 2 && (
        <div className="section-card">
          <div className="selected-part-banner">
            <strong>{quizForm.examType} — {selectedPart?.label}</strong>
            <span>{selectedPart?.desc}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            <div className="form-group"><label>Tiêu đề bài kiểm tra *</label>
              <input value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder={`VD: ${quizForm.examType} ${selectedPart?.label} Practice Test 1`} />
            </div>
            <div className="form-row">
              <div className="form-group"><label>Thời gian (phút)</label>
                <input type="number" value={quizForm.timeLimit} onChange={e => setQuizForm({ ...quizForm, timeLimit: e.target.value })} min={1} />
              </div>
              <div className="form-group"><label>Liên kết với bài học</label>
                <select value={quizForm.lessonId} onChange={e => setQuizForm({ ...quizForm, lessonId: e.target.value })}>
                  <option value="">Không liên kết</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Hướng dẫn làm bài</label>
              <textarea rows={3} value={quizForm.instructions} onChange={e => setQuizForm({ ...quizForm, instructions: e.target.value })}
                placeholder="Hướng dẫn cho học viên trước khi làm bài..." />
            </div>
            {needsPassage() && (
              <div className="form-group">
                <label>📄 Đoạn văn / Passage</label>
                <textarea rows={8} value={quizForm.passageText} onChange={e => setQuizForm({ ...quizForm, passageText: e.target.value })}
                  placeholder="Nhập đoạn văn đọc hiểu..." style={{ fontFamily: "Georgia, serif", lineHeight: 1.8 }} />
              </div>
            )}
            {needsAudio() && (
              <div className="form-group">
                <label>🔊 URL file audio</label>
                <input value={quizForm.audioUrl} onChange={e => setQuizForm({ ...quizForm, audioUrl: e.target.value })}
                  placeholder="https://... (mp3, wav)" />
              </div>
            )}
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Quay lại</button>
            <button className="btn btn-primary" onClick={() => { setQuestions([{ ...INIT_Q, questionType: getQuestionTypes()[0] }]); setStep(3); }}>
              Tiếp theo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CÂU HỎI */}
      {step === 3 && (
        <div>
          <div className="section-card" style={{ marginBottom: 16 }}>
            <div className="selected-part-banner">
              <strong>{quizForm.examType} — {selectedPart?.label}: {quizForm.title}</strong>
              <span>{questions.length} câu hỏi</span>
            </div>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <div className="question-header">
                <span className="question-num">Câu {i + 1}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={q.questionType} onChange={e => updateQ(i, "questionType", e.target.value)}
                    className="filter-select" style={{ fontSize: "0.82rem", padding: "4px 8px" }}>
                    {getQuestionTypes().map(t => (
                      <option key={t} value={t}>
                        {t === "mcq" ? "Trắc nghiệm" : t === "fill_blank" ? "Điền vào chỗ trống" : t === "matching" ? "Nối cột" : t === "writing" ? "Viết" : t}
                      </option>
                    ))}
                  </select>
                  {questions.length > 1 && (
                    <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(i)}>✕</button>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 10 }}>
                <label>Nội dung câu hỏi *</label>
                <textarea rows={2} value={q.content} onChange={e => updateQ(i, "content", e.target.value)}
                  placeholder={q.questionType === "fill_blank" ? "VD: The company ___ (establish) in 1990." : "Nhập câu hỏi..."} />
              </div>

              {/* Ảnh (TOEIC Part 1) */}
              {quizForm.examPart === "Part1" && (
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label>URL ảnh (TOEIC Part 1)</label>
                  <input value={q.imageUrl || ""} onChange={e => updateQ(i, "imageUrl", e.target.value)} placeholder="https://..." />
                </div>
              )}

              {/* MCQ options */}
              {q.questionType === "mcq" && (
                <div className="options-grid">
                  {["A","B","C","D"].map(opt => (
                    <div key={opt} className="form-group">
                      <label>Đáp án {opt}</label>
                      <input value={q[`option${opt}`] || ""} onChange={e => updateQ(i, `option${opt}`, e.target.value)}
                        placeholder={`Lựa chọn ${opt}`} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Đáp án đúng</label>
                    <select value={q.correctAnswer} onChange={e => updateQ(i, "correctAnswer", e.target.value)}>
                      <option value="">Chọn</option>
                      {["A","B","C","D"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Fill blank */}
              {q.questionType === "fill_blank" && (
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label>Đáp án đúng</label>
                  <input value={q.correctAnswer} onChange={e => updateQ(i, "correctAnswer", e.target.value)}
                    placeholder="Nhập đáp án chính xác" />
                </div>
              )}

              {/* Explanation */}
              <div className="form-group">
                <label>Giải thích đáp án (tùy chọn)</label>
                <input value={q.explanation || ""} onChange={e => updateQ(i, "explanation", e.target.value)}
                  placeholder="Giải thích tại sao đây là đáp án đúng..." />
              </div>
            </div>
          ))}

          <button className="btn btn-ghost" style={{ width: "100%", marginBottom: 16 }} onClick={addQuestion}>
            + Thêm câu hỏi
          </button>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Quay lại</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              ✅ Tạo bài kiểm tra ({questions.length} câu)
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <h1>Bài kiểm tra</h1>
        <p>Quản lý bài kiểm tra IELTS và TOEIC</p>
      </div>
      <div className="toolbar">
        <div className="toolbar-left">
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ Tạo bài kiểm tra</button>
      </div>
      <div className="table-wrapper">
        {loading ? <div className="page-loading"><div className="spinner" /></div> : (
          <table className="data-table">
            <thead><tr><th>Tiêu đề</th><th>Loại</th><th>Phần</th><th>Thời gian</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="empty-state"><p>Chưa có bài kiểm tra nào</p></td></tr>
                : filtered.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 500 }}>{q.title}</td>
                    <td><span className={`badge ${q.examType === "IELTS" ? "badge-blue" : "badge-green"}`}>{q.examType}</span></td>
                    <td>{q.examPart || "—"}</td>
                    <td>{q.timeLimit ? `${q.timeLimit} phút` : "—"}</td>
                    <td style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-info btn-sm"
                        title="Xem chi tiết"
                        onClick={() => setViewModal(q)}>
                        👁️
                      </button>
                      <button className="btn btn-warning btn-sm"
                        title="Sửa"
                        onClick={() => setEditModal({ ...q })}>
                        ✏️
                      </button>
                      <button className="btn btn-danger btn-sm"
                        title="Xóa"
                        onClick={() => handleDelete(q.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
      {/* Modal xem chi tiết */}
{viewModal && (
  <div className="modal-overlay" onClick={() => setViewModal(null)}>
    <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>👁️ Chi tiết — {viewModal.title}</h3>
        <button className="modal-close" onClick={() => setViewModal(null)}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-row">
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--gray-400)", textTransform: "uppercase" }}>Loại</label>
            <p style={{ marginTop: 4 }}>
              <span className={`badge ${viewModal.examType === "IELTS" ? "badge-blue" : viewModal.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                {viewModal.examType}
              </span>
            </p>
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--gray-400)", textTransform: "uppercase" }}>Phần thi</label>
            <p style={{ marginTop: 4, fontWeight: 500 }}>{viewModal.examPart || "—"}</p>
          </div>
        </div>
        <div>
          <label style={{ fontSize: "0.72rem", color: "var(--gray-400)", textTransform: "uppercase" }}>Thời gian làm bài</label>
          <p style={{ marginTop: 4 }}>{viewModal.timeLimit ? `${viewModal.timeLimit} phút` : "Không giới hạn"}</p>
        </div>
        {viewModal.instructions && (
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--gray-400)", textTransform: "uppercase" }}>Hướng dẫn</label>
            <p style={{ marginTop: 4, fontSize: "0.875rem", lineHeight: 1.6 }}>{viewModal.instructions}</p>
          </div>
        )}
        {viewModal.passageText && (
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--gray-400)", textTransform: "uppercase" }}>Đoạn văn (passage)</label>
            <div style={{ marginTop: 4, fontSize: "0.82rem", background: "var(--gray-50)", padding: "10px 12px", borderRadius: 8, maxHeight: 160, overflow: "auto", lineHeight: 1.7 }}>
              {viewModal.passageText}
            </div>
          </div>
        )}
        {viewModal.audioUrl && (
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--gray-400)", textTransform: "uppercase" }}>File audio</label>
            <audio controls src={viewModal.audioUrl} style={{ width: "100%", marginTop: 4 }} />
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Đóng</button>
        <button className="btn btn-warning"
          onClick={() => { setEditModal({ ...viewModal }); setViewModal(null); }}>
          ✏️ Sửa
        </button>
      </div>
    </div>
  </div>
)}

  {/* Modal sửa quiz */}
{editModal && (
  <div className="modal-overlay" onClick={() => setEditModal(null)}>
    <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>✏️ Sửa bài kiểm tra</h3>
        <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
      </div>
      <div className="modal-body">
        <div className="form-group">
          <label>Tiêu đề *</label>
          <input value={editModal.title || ""}
            onChange={e => setEditModal({ ...editModal, title: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Loại chứng chỉ</label>
            <select value={editModal.examType || "IELTS"}
              onChange={e => setEditModal({ ...editModal, examType: e.target.value })}>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div className="form-group">
            <label>Thời gian (phút)</label>
            <input type="number" value={editModal.timeLimit || ""}
              onChange={e => setEditModal({ ...editModal, timeLimit: Number(e.target.value) })}
              min={1} />
          </div>
        </div>
        <div className="form-group">
          <label>Hướng dẫn làm bài</label>
          <textarea rows={3} value={editModal.instructions || ""}
            onChange={e => setEditModal({ ...editModal, instructions: e.target.value })} />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Hủy</button>
        <button className="btn btn-primary" onClick={async () => {
          try {
            await api.put(`/quizzes/${editModal.id}`, editModal);
            toast.success("Cập nhật thành công");
            setEditModal(null);
            fetchData();
          } catch {
            toast.error("Cập nhật thất bại");
          }
        }}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}