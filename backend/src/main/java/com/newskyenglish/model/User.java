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

    @Column(name = "HoTen", length = 100)
    private String name;

    @Email(message = "Email không hợp lệ")
    @Column(name = "Email", unique = true, length = 100)
    private String email;

    @Column(name = "MatKhau", length = 255)
    private String password;

    @Column(name = "SoDienThoai", length = 15)
    private String phoneNumber;

    @Column(name = "DiaChi", columnDefinition = "TEXT")
    private String address;

    @Column(name = "RoleID")
    private Integer roleId;

    @Column(name = "AnhDaiDien", length = 255)
    private String avatarUrl;

    @Column(name = "NgayTao", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    @Column(name = "Duyet")
    @Builder.Default
    private Boolean approved = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.active;

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

    @Column(name = "IELTSScore")
    private Double ieltsScore;

    public enum Status {
        active, inactive, suspended
    }
}