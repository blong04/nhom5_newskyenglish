package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignmentsubmit")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AssignmentSubmit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SubmitID")
    private Long id;

    @Column(name = "AssignID")
    private Long assignId;

    @Column(name = "UserID")
    private Long userId;

    @Column(name = "NoiDungBai", columnDefinition = "TEXT")
    private String content;

    @Column(name = "FileDinhKem", length = 255)
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "NgayNop")
    private LocalDateTime submittedAt;

    @Column(name = "Diem", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "NhanXet", columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.submitted;

    public enum Status { submitted, graded }
}