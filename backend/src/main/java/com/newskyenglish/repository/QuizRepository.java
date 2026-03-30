package com.newskyenglish.repository;

import com.newskyenglish.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByLessonId(Long lessonId);
    List<Quiz> findByExamType(Quiz.ExamType examType);
    List<Quiz> findByClassId(Long classId);
}