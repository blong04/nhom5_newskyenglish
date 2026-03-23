package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import com.newskyenglish.security.JwtUtil;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class TeacherController {

    private final ClassRoomRepository classRepo;
    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollRepo;
    private final AssignmentRepository assignRepo;
    private final JwtUtil jwtUtil;

    // Lấy các lớp được phân công
    @GetMapping("/classes")
    public ResponseEntity<?> getMyClasses(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long teacherId = jwtUtil.extractUserId(token);

        // Lấy courses của teacher này, rồi lấy classes của courses đó
        List<Course> myCourses = courseRepo.findByTeacherId(teacherId.intValue());
        List<Long> courseIds = myCourses.stream().map(Course::getId).toList();

        List<ClassRoom> classes = classRepo.findAll().stream()
            .filter(c -> courseIds.contains(c.getCourseId()))
            .toList();

        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    // Xem học viên trong lớp
    @GetMapping("/classes/{classId}/students")
    public ResponseEntity<?> getStudents(@PathVariable Long classId) {
        List<Enrollment> enrollments = enrollRepo.findByClassId(classId);
        return ResponseEntity.ok(ApiResponse.success(enrollments));
    }

    // Tạo assignment trong lớp của mình (teacher only)
    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(
            @RequestBody Assignment req,
            @RequestHeader("Authorization") String authHeader) {

        // Teacher chỉ được tạo assignment, không tạo quiz
        Assignment saved = assignRepo.save(req);
        return ResponseEntity.ok(ApiResponse.success(saved, "Tạo bài tập thành công"));
    }

    // Xem assignments của lớp
    @GetMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> getClassAssignments(@PathVariable Long classId) {
        // Lấy lessons của class → assignments của lessons
        return ResponseEntity.ok(ApiResponse.success(
            assignRepo.findAll() // TODO: filter by classId
        ));
    }
}