package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_groups")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class QuestionGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GroupID")
    private Long id;

    @Column(name = "QuizID")
    private Long quizId;

    @Column(name = "GroupTitle", length = 255)
    private String title;

    @Column(name = "PassageText", columnDefinition = "LONGTEXT")
    private String passageText;

    @Column(name = "ImageURL", length = 255)
    private String imageUrl;

    @Column(name = "AudioURL", length = 255)
    private String audioUrl;

    @Column(name = "Instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "OrderNum")
    @Builder.Default
    private Integer orderNum = 1;
}