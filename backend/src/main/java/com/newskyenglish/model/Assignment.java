package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
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

    @Column(name = "ClassID")
    private Long classId;

    @Column(name = "TieuDe", length = 150)
    private String title;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "Loai")
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(name = "ExamType")
    private ExamType examType;

    @Column(name = "ExamPart", length = 50)
    private String examPart;

    @Column(name = "Part", length = 50)
    private String part;

    @Column(name = "HanNop")
    private LocalDateTime deadline;

    @Column(name = "DiemToiDa", precision = 5, scale = 2)
    private BigDecimal maxScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.active;

    @Column(name = "NgayTao", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    public enum Type    { writing, speaking }
    public enum ExamType { IELTS, TOEIC, OTHER }
    public enum Status  { active, inactive, closed }
}