package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CourseID")
    private Long id;

    @Column(name = "TieuDe", length = 150)
    private String title;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Column(name = "GiaoVienID")
    private Integer teacherId;

    @Column(name = "Gia", precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "AnhBia", length = 255)
    private String thumbnail;

    @Enumerated(EnumType.STRING)
    @Column(name = "MucDo")
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(name = "ExamType")
    private ExamType examType;

    @Column(name = "SoLuongHocVien")
    private Integer studentCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.active;

    @CreationTimestamp
    @Column(name = "NgayTao", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    public enum Level { beginner, intermediate, advanced }
    public enum Status { active, inactive }
    public enum ExamType { IELTS, TOEIC, OTHER }
}