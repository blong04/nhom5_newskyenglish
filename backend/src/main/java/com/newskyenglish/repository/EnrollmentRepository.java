package com.newskyenglish.repository;

import com.newskyenglish.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByUserId(Long userId);
    List<Enrollment> findByClassId(Long classId);
    List<Enrollment> findByCourseId(Long courseId);
    List<Enrollment> findByStatus(Enrollment.Status status);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}