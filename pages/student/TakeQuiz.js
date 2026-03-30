import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Student.css";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [groups, setGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/student/quiz/${quizId}`)
      .then(r => {
        const { quiz: q, groups: g, questions: qs } = r.data.data;
        setQuiz(q); setGroups(g || []); setQuestions(qs || []);
        if (q.timeLimit) setTimeLeft(q.timeLimit * 60);
      })
      .catch(() => toast.error("Không thể tải bài kiểm tra"))
      .finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleAnswer = (qId, ans) => setAnswers(prev => ({ ...prev, [qId]: ans }));

  const handleSubmit = async () => {
    clearTimeout(timerRef.current);
    // Tính điểm phía client (chỉ cho MCQ)
    let correct = 0;
    questions.forEach(q => {
      if (q.questionType === "mcq" && answers[q.id] === q.correctAnswer) correct++;
    });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setResult({ correct, total: questions.length, score });
    setSubmitted(true);
    toast.success("Đã nộp bài!");
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!quiz) return <div className="empty-state"><p>Không tìm thấy bài kiểm tra</p></div>;

  if (submitted && result) return (
    <div className="quiz-result fade-in">
      <div className="result-card">
        <div className="result-icon">{result.score >= 70 ? "🎉" : result.score >= 50 ? "📝" : "💪"}</div>
        <h2>Kết quả bài kiểm tra</h2>
        <h3>{quiz.title}</h3>
        <div className="result-score">
          <span className="score-big">{result.score}</span>
          <span className="score-label">/100</span>
        </div>
        <p>{result.correct}/{result.total} câu đúng</p>
        <div className="result-band">
          {quiz.examType === "IELTS" && <p>Band ước tính: <strong>{(result.score / 100 * 9).toFixed(1)}</strong></p>}
          {quiz.examType === "TOEIC" && <p>Score ước tính: <strong>{Math.round(result.score / 100 * 990)}</strong>/990</p>}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>← Quay lại</button>
      </div>
    </div>
  );

  return (
    <div className="quiz-page fade-in">
      {/* HEADER */}
      <div className="quiz-header">
        <div className="quiz-info">
          <span className={`badge ${quiz.examType === "IELTS" ? "badge-blue" : "badge-green"}`}>{quiz.examType}</span>
          <h2>{quiz.title}</h2>
          <p>{quiz.examPart}</p>
        </div>
        <div className="quiz-timer" style={{ color: timeLeft !== null && timeLeft < 300 ? "var(--danger)" : "var(--gray-700)" }}>
          {timeLeft !== null && <><span>⏱</span><span className="timer-display">{formatTime(timeLeft)}</span></>}
        </div>
      </div>

      {/* INSTRUCTIONS */}
      {quiz.instructions && (
        <div className="quiz-instructions">
          <strong>📋 Hướng dẫn:</strong> {quiz.instructions}
        </div>
      )}

      {/* AUDIO */}
      {quiz.audioUrl && (
        <div className="quiz-audio">
          <p><strong>🔊 File nghe:</strong></p>
          <audio controls src={quiz.audioUrl} style={{ width: "100%" }} />
        </div>
      )}

      {/* PASSAGE */}
      {quiz.passageText && (
        <div className="quiz-passage">
          <h4>📄 Bài đọc</h4>
          <div className="passage-text">{quiz.passageText}</div>
        </div>
      )}

      {/* QUESTIONS */}
      <div className="questions-section">
        {/* Group questions by groupId */}
        {groups.length > 0
          ? groups.map(g => (
            <div key={g.id} className="question-group-block">
              {g.passageText && <div className="group-passage"><p>{g.passageText}</p></div>}
              {g.imageUrl && <img src={g.imageUrl} alt="Question" className="question-image" />}
              {g.audioUrl && <audio controls src={g.audioUrl} style={{ width: "100%", marginBottom: 12 }} />}
              {g.instructions && <p className="group-instructions">{g.instructions}</p>}
              {questions.filter(q => q.groupId === g.id).map((q, i) => (
                <QuestionItem key={q.id} q={q} index={i} answers={answers} onAnswer={handleAnswer} />
              ))}
            </div>
          ))
          : questions.map((q, i) => (
            <QuestionItem key={q.id} q={q} index={i} answers={answers} onAnswer={handleAnswer} />
          ))
        }
      </div>

      <div className="quiz-footer">
        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
          Đã trả lời: {Object.keys(answers).length}/{questions.length} câu
        </p>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Nộp bài ✅
        </button>
      </div>
    </div>
  );
}

function QuestionItem({ q, index, answers, onAnswer }) {
  return (
    <div className="question-item">
      <p className="question-content">
        <span className="q-num">{index + 1}.</span> {q.content}
      </p>
      {q.imageUrl && <img src={q.imageUrl} alt="Question" className="question-image" />}

      {q.questionType === "mcq" && (
        <div className="options-list">
          {["A","B","C","D"].map(opt => {
            const val = q[`option${opt}`];
            if (!val) return null;
            return (
              <label key={opt} className={`option-item ${answers[q.id] === opt ? "selected" : ""}`}>
                <input type="radio" name={`q_${q.id}`} value={opt}
                  checked={answers[q.id] === opt} onChange={() => onAnswer(q.id, opt)} />
                <span className="option-letter">{opt}</span>
                <span>{val}</span>
              </label>
            );
          })}
        </div>
      )}

      {q.questionType === "fill_blank" && (
        <input className="fill-blank-input" placeholder="Nhập câu trả lời..."
          value={answers[q.id] || ""} onChange={e => onAnswer(q.id, e.target.value)} />
      )}

      {q.questionType === "writing" && (
        <textarea className="writing-area" rows={8} placeholder="Viết bài của bạn tại đây..."
          value={answers[q.id] || ""} onChange={e => onAnswer(q.id, e.target.value)} />
      )}
    </div>
  );
}