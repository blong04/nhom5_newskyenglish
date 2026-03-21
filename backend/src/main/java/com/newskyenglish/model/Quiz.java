package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quizzes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "QuizID")
    private Long id;

    @Column(name = "LessonID")
    private Long lessonId;

    @Column(name = "TieuDe", length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "Loai")
    @Builder.Default
    private QuizType type = QuizType.mcq;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type")
    @Builder.Default
    private ExamType examType = ExamType.OTHER;

    // IELTS Part: Reading/Listening/Writing/Speaking
    // TOEIC Part: Part1~Part7
    @Column(name = "exam_part", length = 50)
    private String examPart;

    // Passage text cho IELTS Reading / TOEIC Reading
    @Column(name = "passage_text", columnDefinition = "LONGTEXT")
    private String passageText;

    // Audio URL cho IELTS Listening / TOEIC Listening
    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "ThoiGianGioiHan")
    private Integer timeLimit;

    public enum QuizType { mcq, writing, speaking }
    public enum ExamType { IELTS, TOEIC, OTHER }
}