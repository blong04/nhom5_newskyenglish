package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import com.newskyenglish.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class TeacherController {

    private final ClassRoomRepository  classRepo;
    private final EnrollmentRepository enrollRepo;
    private final AssignmentRepository assignRepo;
    private final JwtUtil jwtUtil;

    // Lấy lớp của teacher (dùng teacherId trong class)
    @GetMapping("/classes")
    public ResponseEntity<?> getMyClasses(
            @RequestHeader("Authorization") String auth) {
        Long teacherId = jwtUtil.extractUserId(auth.substring(7));
        List<ClassRoom> classes = classRepo.findByTeacherId(teacherId);
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    // Lấy học viên của 1 lớp
    @GetMapping("/classes/{classId}/students")
    public ResponseEntity<?> getStudents(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(
            enrollRepo.findByClassId(classId)
        ));
    }

    // Lấy assignments của lớp mình phụ trách
    @GetMapping("/assignments")
    public ResponseEntity<?> getMyAssignments(
            @RequestHeader("Authorization") String auth) {
        Long teacherId = jwtUtil.extractUserId(auth.substring(7));
        List<ClassRoom> myClasses = classRepo.findByTeacherId(teacherId);
        List<Long> classIds = myClasses.stream()
            .map(ClassRoom::getId).collect(Collectors.toList());

        List<Assignment> all = new ArrayList<>();
        for (Long cid : classIds) {
            all.addAll(assignRepo.findByClassId(cid));
        }
        // Dedup
        List<Assignment> unique = all.stream()
            .collect(Collectors.collectingAndThen(
                Collectors.toMap(Assignment::getId, a -> a, (a, b) -> a),
                m -> new ArrayList<>(m.values())
            ));
        return ResponseEntity.ok(ApiResponse.success(unique));
    }

    // Tạo assignment cho lớp của mình
    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(
            @RequestBody Assignment req,
            @RequestHeader("Authorization") String auth) {
        Long teacherId = jwtUtil.extractUserId(auth.substring(7));

        // Kiểm tra lớp có phải của teacher không
        if (req.getClassId() != null) {
            boolean owns = classRepo.findByTeacherId(teacherId)
                .stream().anyMatch(c -> c.getId().equals(req.getClassId()));
            if (!owns) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Bạn không có quyền tạo bài tập cho lớp này"));
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(assignRepo.save(req), "Tạo bài tập thành công"));
    }
}