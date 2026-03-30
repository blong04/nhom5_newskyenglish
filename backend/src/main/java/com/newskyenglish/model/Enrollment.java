package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EnrollID")
    private Long id;

    @Column(name = "UserID")
    private Long userId;

    @Column(name = "CourseID")
    private Long courseId;

    @Column(name = "ClassID")
    private Long classId;

    @Column(name = "NgayGhiDanh")
    private LocalDateTime enrollDate;

    @Column(name = "NgayDuyet")
    private LocalDateTime approvedDate;

    @Column(name = "NguoiDuyet")
    private Long approvedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.pending;

    @Column(name = "TienDo")
    @Builder.Default
    private Double progress = 0.0;

    @Column(name = "NgayHoanThanh")
    private LocalDateTime completedDate;

    public enum Status { pending, approved, rejected, enrolled, completed, dropped }
}