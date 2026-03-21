package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.UserRepository;
import com.newskyenglish.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Sai email hoặc mật khẩu"));
        }
        if (user.getStatus() != User.Status.active) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tài khoản đã bị khóa"));
        }
        if (user.getRoleId() == 2 && !Boolean.TRUE.equals(user.getApproved())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Tài khoản đang chờ phê duyệt"));
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoleId());

        String roleName = switch (user.getRoleId()) {
            case 1 -> "Admin";
            case 2 -> "Giáo viên";
            default -> "Học viên";
        };

        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName() != null ? user.getName() : "",
                "email", user.getEmail(),
                "roleId", user.getRoleId(),
                "roleName", roleName,
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
            )
        ), "Đăng nhập thành công"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email đã tồn tại"));
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .roleId(req.getRoleId() != null ? req.getRoleId() : 3)
                .approved(req.getRoleId() != null && req.getRoleId() == 2 ? false : true)
                .status(User.Status.active)
                .build();

        userRepository.save(user);

        String msg = (user.getRoleId() == 2)
            ? "Đăng ký thành công! Vui lòng chờ admin phê duyệt."
            : "Đăng ký thành công!";

        return ResponseEntity.ok(ApiResponse.success(null, msg));
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email private String email;
        @NotBlank private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(min=2, max=100) private String name;
        @NotBlank @Email private String email;
        @NotBlank @Size(min=6) private String password;
        private Integer roleId;
    }
}