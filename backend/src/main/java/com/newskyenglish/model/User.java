package com.newskyenglish.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid")
    private Long id;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
    @Column(name = "HoTen", nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "MatKhau", length = 255)
    private String password;

    @Size(max = 15)
    @Column(name = "SoDienThoai", length = 15)
    private String phoneNumber;

    @Column(name = "DiaChi", columnDefinition = "TEXT")
    private String address;

    @Column(name = "RoleID")
    private Integer roleId;

    @Column(name = "AnhDaiDien", length = 255)
    private String avatarUrl;

    @Column(name = "Duyet")
    @Builder.Default
    private Boolean approved = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai", nullable = false)
    @Builder.Default
    private Status status = Status.active;

    @Column(name = "IELTSScore")
    private Double ieltsScore;

    @Column(name = "TOEICScore")
    private Integer toeicScore;

    @Column(name = "SATScore")
    private Integer satScore;

    @Column(name = "ChuyenMon", columnDefinition = "TEXT")
    private String specialization;

    @Column(name = "KinhNghiem", length = 255)
    private String experience;

    @Column(name = "HocVan", length = 255)
    private String education;

    @CreationTimestamp
    @Column(name = "NgayTao", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    public enum Status {
        active, inactive, suspended
    }
}