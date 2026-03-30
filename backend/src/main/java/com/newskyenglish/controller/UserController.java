package com.newskyenglish.controller;

import com.newskyenglish.model.ApiResponse;
import com.newskyenglish.model.UserDTO;
import com.newskyenglish.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://newskyenglish.vercel.app"
})
public class UserController {

    private final UserService userService;

    // ========================
    // GET /users  → Lấy tất cả users
    // ========================
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO.Response>>> getAllUsers() {
        List<UserDTO.Response> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Lấy danh sách users thành công"));
    }

    // ========================
    // GET /users/{id}  → Lấy user theo id
    // ========================
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO.Response>> getUserById(@PathVariable Long id) {
        UserDTO.Response user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user, "Lấy thông tin user thành công"));
    }

    // ========================
    // POST /users  → Tạo user mới
    // ========================
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO.Response>> createUser(
            @Valid @RequestBody UserDTO.CreateRequest request) {
        UserDTO.Response created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Tạo user thành công"));
    }

    // ========================
    // PUT /users/{id}  → Cập nhật user
    // ========================
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO.Response>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO.UpdateRequest request) {
        UserDTO.Response updated = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật user thành công"));
    }

    // ========================
    // DELETE /users/{id}  → Xóa user
    // ========================
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa user thành công"));
    }
}
