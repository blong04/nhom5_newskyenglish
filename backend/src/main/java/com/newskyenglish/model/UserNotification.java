package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usernotifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NotifID")
    private Long id;

    @Column(name = "UserID")
    private Long userId;

    @Column(name = "TieuDe", length = 255)
    private String title;

    @Column(name = "NoiDung", columnDefinition = "TEXT")
    private String content;

    @Column(name = "LoaiThongBao")
    private String type;

    // Tên cột DB là DaDoc (tinyint), map sang boolean
    @Column(name = "DaDoc")
    @Builder.Default
    private Boolean read = false;

    @Column(name = "NgayTao")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (read == null) read = false;
    }
}