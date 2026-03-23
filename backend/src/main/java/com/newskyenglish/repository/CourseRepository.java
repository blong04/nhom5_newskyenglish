package com.newskyenglish.repository;

import com.newskyenglish.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByStatus(Course.Status status);
    List<Course> findByExamType(Course.ExamType examType);
    List<Course> findByTeacherId(Integer teacherId);
}