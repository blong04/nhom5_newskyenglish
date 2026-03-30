package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import com.newskyenglish.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class NotificationController {

    private final UserNotificationRepository notifRepo;
    private final JwtUtil jwtUtil;

    // GET /notifications/my — lấy thông báo của user hiện tại
    @GetMapping("/my")
    public ResponseEntity<?> getMyNotifications(
            @RequestHeader("Authorization") String auth) {
        Long userId = jwtUtil.extractUserId(auth.substring(7));
        List<UserNotification> notifs =
            notifRepo.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(ApiResponse.success(notifs));
    }

    // PUT /notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        return notifRepo.findById(id).map(n -> {
            n.setRead(true);
            return ResponseEntity.ok(ApiResponse.success(notifRepo.save(n)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT /notifications/read-all
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(
            @RequestHeader("Authorization") String auth) {
        Long userId = jwtUtil.extractUserId(auth.substring(7));
        notifRepo.findByUserId(userId).forEach(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
        return ResponseEntity.ok(ApiResponse.success(null, "Đã đọc tất cả"));
    }

    // POST /notifications/send — admin/teacher gửi thông báo
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody UserNotification req) {
        req.setRead(false);
        return ResponseEntity.ok(
            ApiResponse.success(notifRepo.save(req), "Đã gửi thông báo"));
    }
}