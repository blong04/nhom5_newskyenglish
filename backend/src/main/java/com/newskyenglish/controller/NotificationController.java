package com.newskyenglish.controller;

import com.newskyenglish.model.ApiResponse;
import com.newskyenglish.repository.UserNotificationRepository;
import com.newskyenglish.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class NotificationController {

    private final UserNotificationRepository notifRepo;
    private final JwtUtil jwtUtil;

    @GetMapping("/my")
    public ResponseEntity<?> getMyNotifications(
            @RequestHeader("Authorization") String auth) {
        Long userId = jwtUtil.extractUserId(auth.substring(7));
        return ResponseEntity.ok(ApiResponse.success(
            notifRepo.findByUserIdOrderByCreatedAtDesc(userId)
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        return notifRepo.findById(id).map(n -> {
            n.setRead(true);
            return ResponseEntity.ok(ApiResponse.success(notifRepo.save(n)));
        }).orElse(ResponseEntity.notFound().build());
    }

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
}