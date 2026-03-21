package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LessonID")
    private Long id;

    @Column(name = "ModuleID")
    private Long moduleId;

    @Column(name = "TieuDe", length = 150)
    private String title;

    @Column(name = "VideoURL", length = 255)
    private String videoUrl;

    @Column(name = "TaiLieuURL", length = 255)
    private String documentUrl;

    @Column(name = "NoiDung", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "LoaiBaiHoc")
    @Builder.Default
    private LessonType lessonType = LessonType.text;

    @Enumerated(EnumType.STRING)
    @Column(name = "ExamType")
    @Builder.Default
    private ExamType examType = ExamType.OTHER;

    @Column(name = "ThoiLuong")
    @Builder.Default
    private Integer duration = 0;

    @Column(name = "ThuTu")
    @Builder.Default
    private Integer orderNum = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.active;

    public enum LessonType { video, text, quiz, assignment, file }
    public enum ExamType { IELTS, TOEIC, OTHER }
    public enum Status { active, inactive }
}