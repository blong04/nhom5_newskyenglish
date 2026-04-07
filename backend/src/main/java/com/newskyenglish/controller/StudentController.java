package com.newskyenglish.controller;

import com.newskyenglish.model.ApiResponse;
import com.newskyenglish.model.StudentDTO;
import com.newskyenglish.security.JwtUtil;
import com.newskyenglish.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "https://newskyenglish.vercel.app"})
public class StudentController {

    private final StudentService studentService;
    private final JwtUtil jwtUtil;

    @GetMapping("/enrollments")
    public ResponseEntity<?> getMyEnrollments(@RequestHeader("Authorization") String auth) {
        Long userId = jwtUtil.extractUserId(auth.substring(7));
        return ResponseEntity.ok(ApiResponse.success(studentService.getMyEnrollments(userId)));
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(
            @Valid @RequestBody StudentDTO.EnrollRequest request,
            @RequestHeader("Authorization") String auth
    ) {
        Long userId = jwtUtil.extractUserId(auth.substring(7));
        StudentDTO.EnrollResponse response = studentService.enroll(userId, request);
        String message = Boolean.TRUE.equals(request.getPaid())
                ? "Đăng ký thành công! Thanh toán được xác nhận."
                : "Gửi yêu cầu thành công! Vui lòng chờ admin phê duyệt.";
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<?> getQuiz(@PathVariable Long quizId) {
        return studentService.getQuiz(quizId)
                .map(response -> ResponseEntity.ok(ApiResponse.success(response)))
                .orElse(ResponseEntity.notFound().build());
    }
}
