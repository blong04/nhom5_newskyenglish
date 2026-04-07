package com.newskyenglish.service;

import com.newskyenglish.model.StudentDTO;

import java.util.List;
import java.util.Optional;

public interface StudentService {
    List<StudentDTO.EnrollmentResponse> getMyEnrollments(Long userId);

    StudentDTO.EnrollResponse enroll(Long userId, StudentDTO.EnrollRequest request);

    Optional<StudentDTO.QuizDetailResponse> getQuiz(Long quizId);
}
