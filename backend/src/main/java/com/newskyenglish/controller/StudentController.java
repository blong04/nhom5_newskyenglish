package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import com.newskyenglish.security.JwtUtil;
import lombok.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class StudentController {

    private final EnrollmentRepository enrollRepo;
    private final QuizRepository quizRepo;
    private final QuestionRepository questionRepo;
    private final QuestionGroupRepository groupRepo;
    private final JwtUtil jwtUtil;

    // Lấy các khóa học đã đăng ký
    @GetMapping("/enrollments")
    public ResponseEntity<?> getMyEnrollments(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);
        return ResponseEntity.ok(ApiResponse.success(enrollRepo.findByUserId(userId)));
    }

    // Đăng ký khóa học
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestBody EnrollRequest req,
                                    @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        if (enrollRepo.existsByUserIdAndCourseId(userId, req.getCourseId())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Bạn đã đăng ký khóa học này"));
        }

        Enrollment e = Enrollment.builder()
            .userId(userId)
            .courseId(req.getCourseId())
            .classId(req.getClassId())
            .enrollDate(LocalDateTime.now())
            .status(Enrollment.Status.pending)
            .progress(0.0)
            .build();

        return ResponseEntity.ok(ApiResponse.success(
            enrollRepo.save(e), "Đăng ký thành công, chờ duyệt"));
    }

    // Lấy quiz để làm bài
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<?> getQuizForStudent(@PathVariable Long quizId) {
        return quizRepo.findById(quizId).map(quiz -> {
            List<QuestionGroup> groups = groupRepo.findByQuizIdOrderByOrderNumAsc(quizId);
            List<Question> questions = questionRepo.findByQuizIdOrderByOrderNumAsc(quizId);

            // Ẩn đáp án khi student làm bài
            questions.forEach(q -> q.setCorrectAnswer(null));
            questions.forEach(q -> q.setExplanation(null));

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "quiz", quiz,
                "groups", groups,
                "questions", questions
            )));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class EnrollRequest {
        private Long courseId;
        private Long classId;
    }
}
