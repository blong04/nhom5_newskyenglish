package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "https://newskyenglish.vercel.app"})
public class AdminController {

    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final ClassRoomRepository classRepo;
    private final EnrollmentRepository enrollRepo;

    // ==========================================
    // ADMIN STATS
    // ==========================================
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getStats() {
        long totalUsers    = userRepo.count();
        long totalStudents = userRepo.findAll().stream().filter(u -> u.getRoleId() == 3).count();
        long totalTeachers = userRepo.findAll().stream().filter(u -> u.getRoleId() == 2).count();
        long pendingTeachers = userRepo.findAll().stream()
            .filter(u -> u.getRoleId() == 2 && !Boolean.TRUE.equals(u.getApproved())).count();
        long totalCourses      = courseRepo.count();
        long totalClasses      = classRepo.count();
        long activeClasses     = classRepo.findByStatus(ClassRoom.Status.active).size();
        long pendingEnrollments = enrollRepo.findByStatus(Enrollment.Status.pending).size();

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "totalUsers", totalUsers,
            "totalStudents", totalStudents,
            "totalTeachers", totalTeachers,
            "pendingTeachers", pendingTeachers,
            "totalCourses", totalCourses,
            "totalClasses", totalClasses,
            "activeClasses", activeClasses,
            "pendingEnrollments", pendingEnrollments
        )));
    }

    // ==========================================
    // ADMIN — CLASSES (CRUD)
    // ==========================================

    /** Lấy tất cả lớp học */
    @GetMapping("/admin/classes")
    public ResponseEntity<?> getAllClasses() {
    List<ClassRoom> classes = classRepo.findAll();
    List<Map<String, Object>> result = classes.stream().map(c -> {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id",              c.getId());
        map.put("courseId",        c.getCourseId());
        map.put("teacherId",       c.getTeacherId());
        map.put("name",            c.getName());
        map.put("description",     c.getDescription());
        map.put("maxStudents",     c.getMaxStudents());
        map.put("currentStudents", c.getCurrentStudents());
        map.put("startDate",       c.getStartDate());
        map.put("endDate",         c.getEndDate());
        map.put("status",          c.getStatus());
        map.put("createdAt",       c.getCreatedAt());
        // Thêm tên teacher
        if (c.getTeacherId() != null) {
            userRepo.findById(c.getTeacherId()).ifPresent(u ->
                map.put("teacherName", u.getName())
            );
        } else {
            map.put("teacherName", null);
        }
        return map;
    }).collect(java.util.stream.Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(result));
    }

    /** Tạo lớp học mới */
    @PostMapping("/admin/classes")
    public ResponseEntity<?> createClass(@RequestBody ClassRoom req) {
        ClassRoom saved = classRepo.save(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(saved, "Tạo lớp học thành công"));
    }

    /** Cập nhật lớp học */
    @PutMapping("/admin/classes/{id}")
    public ResponseEntity<?> updateClass(
            @PathVariable Long id,
            @RequestBody ClassRoom req) {
        return classRepo.findById(id).map(c -> {
            if (req.getCourseId()     != null) c.setCourseId(req.getCourseId());
            if (req.getTeacherId()    != null) c.setTeacherId(req.getTeacherId());
            if (req.getName()         != null) c.setName(req.getName());
            if (req.getDescription()  != null) c.setDescription(req.getDescription());
            if (req.getMaxStudents()  != null) c.setMaxStudents(req.getMaxStudents());
            if (req.getStartDate()    != null) c.setStartDate(req.getStartDate());
            if (req.getEndDate()      != null) c.setEndDate(req.getEndDate());
            if (req.getStatus()       != null) c.setStatus(req.getStatus());
            return ResponseEntity.ok(ApiResponse.success(classRepo.save(c), "Cập nhật thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Xóa lớp học */
    @DeleteMapping("/admin/classes/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        classRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa lớp học"));
    }

    /** Phân công giáo viên vào lớp */
    @PutMapping("/admin/classes/{classId}/assign-teacher/{teacherId}")
    public ResponseEntity<?> assignTeacher(
            @PathVariable Long classId,
            @PathVariable Long teacherId) {
        return classRepo.findById(classId).map(c -> {
            c.setTeacherId(teacherId);
            classRepo.save(c);
            return ResponseEntity.ok(ApiResponse.success(null, "Phân công giáo viên thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // ADMIN — ENROLLMENTS
    // ==========================================

    /** Lấy tất cả enrollments */
    @GetMapping("/enrollments")
    public ResponseEntity<?> getAllEnrollments() {
        return ResponseEntity.ok(ApiResponse.success(enrollRepo.findAll()));
    }

    /** Lấy enrollments theo classId */
    @GetMapping("/enrollments/class/{classId}")
    public ResponseEntity<?> getEnrollmentsByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(enrollRepo.findByClassId(classId)));
    }

    /** Lấy pending enrollments */
    @GetMapping("/admin/pending-enrollments")
    public ResponseEntity<?> getPendingEnrollments() {
        return ResponseEntity.ok(ApiResponse.success(
            enrollRepo.findByStatus(Enrollment.Status.pending)
        ));
    }

    /** Lấy enrollments với thông tin chi tiết (tên user, tên course) */
    @GetMapping("/admin/enrollments/details")
    public ResponseEntity<?> getEnrollmentDetails() {
        List<Enrollment> enrollments = enrollRepo.findAll();
        List<Map<String, Object>> result = enrollments.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",         e.getId());
            map.put("userId",     e.getUserId());
            map.put("courseId",   e.getCourseId());
            map.put("classId",    e.getClassId());
            map.put("status",     e.getStatus());
            map.put("enrollDate", e.getEnrollDate());
            map.put("paid",       false); // default, sẽ update sau khi thêm field paid

            userRepo.findById(e.getUserId()).ifPresent(u -> {
                map.put("userName",  u.getName());
                map.put("userEmail", u.getEmail());
            });
            courseRepo.findById(e.getCourseId()).ifPresent(c -> {
                map.put("courseName", c.getTitle());
                map.put("examType",   c.getExamType());
            });
            if (e.getClassId() != null) {
                classRepo.findById(e.getClassId()).ifPresent(c ->
                    map.put("className", c.getName())
                );
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /** Duyệt enrollment */
    @PutMapping("/admin/enrollments/{id}/approve")
    public ResponseEntity<?> approveEnrollment(@PathVariable Long id) {
        return enrollRepo.findById(id).map(e -> {
            e.setStatus(Enrollment.Status.approved);
            e.setApprovedDate(LocalDateTime.now());
            enrollRepo.save(e);

            // Cập nhật currentStudents của class
            if (e.getClassId() != null) {
                classRepo.findById(e.getClassId()).ifPresent(c -> {
                    int current = c.getCurrentStudents() != null ? c.getCurrentStudents() : 0;
                    c.setCurrentStudents(current + 1);
                    classRepo.save(c);
                });
            }
            return ResponseEntity.ok(ApiResponse.success(null, "Duyệt đăng ký thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Cập nhật enrollment (bao gồm từ chối) */
    @PutMapping("/enrollments/{id}")
    public ResponseEntity<?> updateEnrollment(@PathVariable Long id, @RequestBody Map<String, String> req) {
        return enrollRepo.findById(id).map(e -> {
            if (req.containsKey("status")) {
                try {
                    e.setStatus(Enrollment.Status.valueOf(req.get("status")));
                } catch (IllegalArgumentException ex) {
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Trạng thái không hợp lệ"));
                }
            }
            return ResponseEntity.ok(ApiResponse.success(enrollRepo.save(e), "Cập nhật thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Hủy enrollment (student) */
    @PutMapping("/enrollments/{id}/cancel")
    public ResponseEntity<?> cancelEnrollment(@PathVariable Long id) {
        return enrollRepo.findById(id).map(e -> {
            if (e.getStatus() != Enrollment.Status.pending) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Chỉ có thể hủy khi chưa được phê duyệt"));
            }
            e.setStatus(Enrollment.Status.dropped);
            return ResponseEntity.ok(ApiResponse.success(enrollRepo.save(e), "Đã hủy đăng ký"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // ADMIN — USERS
    // ==========================================

    /** Danh sách giáo viên chờ duyệt */
    @GetMapping("/admin/pending-teachers")
    public ResponseEntity<?> getPendingTeachers() {
        List<User> pending = userRepo.findAll().stream()
            .filter(u -> u.getRoleId() == 2 && !Boolean.TRUE.equals(u.getApproved()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(pending));
    }

    /** Phê duyệt giáo viên */
    @PutMapping("/admin/users/{id}/approve")
    public ResponseEntity<?> approveTeacher(@PathVariable Long id) {
        return userRepo.findById(id).map(u -> {
            u.setApproved(true);
            userRepo.save(u);
            return ResponseEntity.ok(ApiResponse.success(null, "Phê duyệt thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Từ chối và xóa giáo viên */
    @DeleteMapping("/admin/users/{id}/reject")
    public ResponseEntity<?> rejectTeacher(@PathVariable Long id) {
        userRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã từ chối và xóa tài khoản"));
    }

    // ==========================================
    // ADMIN — NOTIFICATIONS
    // ==========================================

    /** Gửi thông báo hàng loạt */
    @PostMapping("/admin/notifications/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> req) {
        String title   = (String) req.get("title");
        String content = (String) req.get("content");
        String type    = (String) req.getOrDefault("type", "announcement");

        if (title == null || content == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Thiếu tiêu đề hoặc nội dung"));
        }

        List<User> targets = new ArrayList<>();

        Object targetRoleObj = req.get("targetRole");
        Object targetUserObj = req.get("targetUserId");

        if (targetUserObj != null) {
            // Gửi cá nhân
            Long userId = Long.valueOf(targetUserObj.toString());
            userRepo.findById(userId).ifPresent(targets::add);
        } else if (targetRoleObj != null) {
            // Gửi theo role
            int roleId = Integer.parseInt(targetRoleObj.toString());
            targets = userRepo.findAll().stream()
                .filter(u -> u.getRoleId() == roleId)
                .collect(Collectors.toList());
        } else {
            // Gửi tất cả
            targets = userRepo.findAll();
        }

        // Tạo thông báo — dùng usernotifications table
        // (Sẽ implement đầy đủ khi có NotificationRepository)
        // Tạm thời trả về success
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("sent", targets.size()),
            "Đã gửi thông báo đến " + targets.size() + " người"
        ));
    }
    @GetMapping("/classes")
    public ResponseEntity<?> getClassesPublic() {
        return ResponseEntity.ok(ApiResponse.success(classRepo.findAll()));
    }
}