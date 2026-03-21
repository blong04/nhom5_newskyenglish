package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "classes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ClassID")
    private Long id;

    @Column(name = "CourseID")
    private Long courseId;

    @Column(name = "TenLop", length = 255)
    private String name;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Column(name = "SoLuongToiDa")
    @Builder.Default
    private Integer maxStudents = 50;

    @Column(name = "SoLuongHienTai")
    @Builder.Default
    private Integer currentStudents = 0;

    @Column(name = "NgayBatDau")
    private LocalDate startDate;

    @Column(name = "NgayKetThuc")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.pending;

    @CreationTimestamp
    @Column(name = "NgayTao", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    public enum Status { pending, active, completed, cancelled }
}