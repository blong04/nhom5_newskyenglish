package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import lombok.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class QuizController {

    private final QuizRepository quizRepo;
    private final QuestionGroupRepository groupRepo;
    private final QuestionRepository questionRepo;

    // Lấy tất cả quiz
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(quizRepo.findAll()));
    }

    // Lấy quiz theo lesson
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<?> getByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ApiResponse.success(quizRepo.findByLessonId(lessonId)));
    }

    // Lấy quiz theo IELTS/TOEIC type
    @GetMapping("/type/{examType}")
    public ResponseEntity<?> getByType(@PathVariable Quiz.ExamType examType) {
        return ResponseEntity.ok(ApiResponse.success(quizRepo.findByExamType(examType)));
    }

    // Lấy quiz đầy đủ (groups + questions)
    @GetMapping("/{id}/full")
    public ResponseEntity<?> getFullQuiz(@PathVariable Long id) {
        return quizRepo.findById(id).map(quiz -> {
            List<QuestionGroup> groups = groupRepo.findByQuizIdOrderByOrderNumAsc(id);
            List<Question> questions = questionRepo.findByQuizIdOrderByOrderNumAsc(id);
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "quiz", quiz,
                "groups", groups,
                "questions", questions
            )));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Tạo quiz
    @PostMapping
    public ResponseEntity<?> create(@RequestBody QuizCreateRequest req) {
        Quiz quiz = Quiz.builder()
            .lessonId(req.getLessonId())
            .title(req.getTitle())
            .type(req.getType() != null ? req.getType() : Quiz.QuizType.mcq)
            .examType(req.getExamType() != null ? req.getExamType() : Quiz.ExamType.OTHER)
            .examPart(req.getExamPart())
            .passageText(req.getPassageText())
            .audioUrl(req.getAudioUrl())
            .instructions(req.getInstructions())
            .timeLimit(req.getTimeLimit())
            .build();
        Quiz saved = quizRepo.save(quiz);

        // Lưu groups nếu có
        if (req.getGroups() != null) {
            for (QuestionGroup g : req.getGroups()) {
                g.setQuizId(saved.getId());
                groupRepo.save(g);
            }
        }

        // Lưu questions nếu có
        if (req.getQuestions() != null) {
            for (Question q : req.getQuestions()) {
                q.setQuizId(saved.getId());
                questionRepo.save(q);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(saved, "Tạo quiz thành công"));
    }

    // Xóa quiz
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        quizRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa quiz thành công"));
    }

    @Data
    public static class QuizCreateRequest {
        private Long lessonId;
        private String title;
        private Quiz.QuizType type;
        private Quiz.ExamType examType;
        private String examPart;
        private String passageText;
        private String audioUrl;
        private String instructions;
        private Integer timeLimit;
        private List<QuestionGroup> groups;
        private List<Question> questions;
    }
}