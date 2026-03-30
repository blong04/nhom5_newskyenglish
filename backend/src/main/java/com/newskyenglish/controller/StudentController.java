package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import com.newskyenglish.security.JwtUtil;
import lombok.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class StudentController {

    private final EnrollmentRepository enrollRepo;
    private final CourseRepository     courseRepo;
    private final ClassRoomRepository  classRepo;
    private final QuizRepository       quizRepo;
    private final QuestionRepository   questionRepo;
    private final QuestionGroupRepository groupRepo;
    private final JwtUtil jwtUtil;

    // Lấy enrollments của student
    @GetMapping("/enrollments")
    public ResponseEntity<?> getMyEnrollments(
            @RequestHeader("Authorization") String auth) {
        Long userId = jwtUtil.extractUserId(auth.substring(7));
        List<Enrollment> enrolls = enrollRepo.findByUserId(userId);

        // Enrich với tên course và tên class
        List<Map<String,Object>> result = enrolls.stream().map(e -> {
            Map<String,Object> map = new HashMap<>();
            map.put("id",         e.getId());
            map.put("userId",     e.getUserId());
            map.put("courseId",   e.getCourseId());
            map.put("classId",    e.getClassId());
            map.put("status",     e.getStatus());
            map.put("progress",   e.getProgress());
            map.put("enrollDate", e.getEnrollDate());
            map.put("approvedDate", e.getApprovedDate());

            // Tên khóa học
            courseRepo.findById(e.getCourseId()).ifPresent(c -> {
                map.put("courseName", c.getTitle());
                map.put("examType",   c.getExamType());
            });
            // Tên lớp học
            if (e.getClassId() != null) {
                classRepo.findById(e.getClassId()).ifPresent(c -> {
                    map.put("className",   c.getName());
                    map.put("startDate",   c.getStartDate());
                    map.put("endDate",     c.getEndDate());
                    map.put("maxStudents", c.getMaxStudents());
                });
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // Đăng ký khóa học — bắt buộc classId
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(
            @RequestBody Map<String,Object> req,
            @RequestHeader("Authorization") String auth) {

        Long userId   = jwtUtil.extractUserId(auth.substring(7));
        Long courseId = Long.valueOf(req.get("courseId").toString());
        Long classId  = req.get("classId") != null
            ? Long.valueOf(req.get("classId").toString()) : null;
        boolean paid  = Boolean.parseBoolean(req.getOrDefault("paid","false").toString());

        if (classId == null) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Vui lòng chọn lớp học"));
        }
        if (enrollRepo.existsByUserIdAndCourseId(userId, courseId)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Bạn đã đăng ký khóa học này"));
        }

        Enrollment e = Enrollment.builder()
            .userId(userId)
            .courseId(courseId)
            .classId(classId)
            .enrollDate(LocalDateTime.now())
            .status(paid ? Enrollment.Status.approved : Enrollment.Status.pending)
            .progress(BigDecimal.ZERO)
            .build();

        enrollRepo.save(e);

        // Nếu đã thanh toán, tăng sĩ số lớp
        if (paid) {
            classRepo.findById(classId).ifPresent(c -> {
                c.setCurrentStudents((c.getCurrentStudents() != null ? c.getCurrentStudents() : 0) + 1);
                classRepo.save(c);
            });
        }

        String msg = paid
            ? "Đăng ký thành công! Thanh toán được xác nhận."
            : "Gửi yêu cầu thành công! Vui lòng chờ admin phê duyệt.";
        return ResponseEntity.ok(ApiResponse.success(null, msg));
    }

    // Lấy quiz để làm bài (ẩn đáp án)
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<?> getQuiz(@PathVariable Long quizId) {
        return quizRepo.findById(quizId).map(quiz -> {
            List<QuestionGroup> groups    = groupRepo.findByQuizIdOrderByOrderNumAsc(quizId);
            List<Question>      questions = questionRepo.findByQuizIdOrderByOrderNumAsc(quizId);
            // Ẩn đáp án
            questions.forEach(q -> { q.setCorrectAnswer(null); q.setExplanation(null); });
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "quiz", quiz, "groups", groups, "questions", questions
            )));
        }).orElse(ResponseEntity.notFound().build());
    }
}