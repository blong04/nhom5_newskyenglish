package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
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

    @Column(name = "DapAn", columnDefinition = "JSON")
    private String answers;

    @Column(name = "Diem", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "ThoiGianLam")
    private Integer timeSpent;

    @Column(name = "NgayNop")
    private LocalDateTime submittedAt;
}