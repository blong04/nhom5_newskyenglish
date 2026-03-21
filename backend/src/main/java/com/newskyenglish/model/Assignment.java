package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AssignID")
    private Long id;

    @Column(name = "LessonID")
    private Long lessonId;

    @Column(name = "TieuDe", length = 150)
    private String title;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "Loai")
    @Builder.Default
    private AssignType type = AssignType.writing;

    @Enumerated(EnumType.STRING)
    @Column(name = "ExamType")
    @Builder.Default
    private ExamType examType = ExamType.OTHER;

    @Column(name = "ExamPart", length = 50)
    private String examPart;

    @Column(name = "HanNop")
    private LocalDateTime deadline;

    @Column(name = "DiemToiDa", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxScore = BigDecimal.valueOf(100);

    @Column(name = "FileDinhKem", length = 255)
    private String attachmentUrl;

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

    public enum AssignType { writing, speaking }
    public enum ExamType { IELTS, TOEIC, OTHER }
    public enum Status { active, inactive, closed }
}