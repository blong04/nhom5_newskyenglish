package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "questions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "QuestionID")
    private Long id;

    @Column(name = "QuizID")
    private Long quizId;

    @Column(name = "GroupID")
    private Long groupId;

    @Column(name = "PartNumber")
    private Integer partNumber;

    @Column(name = "LoaiCauHoi", length = 50)
    private String questionType; // mcq, fill_blank, image_word, matching, ordering

    @Column(name = "NoiDungCauHoi", columnDefinition = "TEXT")
    private String content;

    @Column(name = "HinhAnh", length = 255)
    private String imageUrl;

    @Column(name = "AudioURL", length = 255)
    private String audioUrl;

    @Column(name = "LuaChonA", length = 255)
    private String optionA;

    @Column(name = "LuaChonB", length = 255)
    private String optionB;

    @Column(name = "LuaChonC", length = 255)
    private String optionC;

    @Column(name = "LuaChonD", length = 255)
    private String optionD;

    @Column(name = "DapAnDung", length = 255)
    private String correctAnswer;

    @Column(name = "Explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "OrderNum")
    @Builder.Default
    private Integer orderNum = 1;

    @Column(name = "ScoreWeight", precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal scoreWeight = BigDecimal.ONE;
}