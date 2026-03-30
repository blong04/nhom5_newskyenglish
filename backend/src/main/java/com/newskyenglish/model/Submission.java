package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SubmissionID")
    private Long id;

    @Column(name = "QuizID")
    private Long quizId;

    @Column(name = "UserID")
    private Long userId;

    @Column(name = "DapAn", columnDefinition = "TEXT")
    private String answers;

    @Column(name = "Diem")
    private Float score;

    @Column(name = "ThoiGianLam")
    private Integer timeSpent;

    @Column(name = "NgayNop")
    private LocalDateTime submittedAt;
}