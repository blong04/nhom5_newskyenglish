package com.newskyenglish.service.impl;

import com.newskyenglish.model.ClassRoom;
import com.newskyenglish.model.Course;
import com.newskyenglish.model.Enrollment;
import com.newskyenglish.model.Question;
import com.newskyenglish.model.QuestionGroup;
import com.newskyenglish.model.StudentDTO;
import com.newskyenglish.repository.ClassRoomRepository;
import com.newskyenglish.repository.CourseRepository;
import com.newskyenglish.repository.EnrollmentRepository;
import com.newskyenglish.repository.QuestionGroupRepository;
import com.newskyenglish.repository.QuestionRepository;
import com.newskyenglish.repository.QuizRepository;
import com.newskyenglish.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuestionGroupRepository questionGroupRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StudentDTO.EnrollmentResponse> getMyEnrollments(Long userId) {
        return enrollmentRepository.findByUserId(userId)
                .stream()
                .map(enrollment -> {
                    Course course = courseRepository.findById(enrollment.getCourseId()).orElse(null);
                    ClassRoom classRoom = enrollment.getClassId() != null
                            ? classRoomRepository.findById(enrollment.getClassId()).orElse(null)
                            : null;

                    return StudentDTO.EnrollmentResponse.fromEntity(
                            enrollment,
                            StudentDTO.CourseInfo.fromEntity(course),
                            StudentDTO.ClassInfo.fromEntity(classRoom)
                    );
                })
                .toList();
    }

    @Override
    public StudentDTO.EnrollResponse enroll(Long userId, StudentDTO.EnrollRequest request) {
        if (request.getClassId() == null) {
            throw new RuntimeException("Vui lòng chọn lớp học");
        }
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            throw new RuntimeException("Bạn đã đăng ký khóa học này");
        }

        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .courseId(request.getCourseId())
                .classId(request.getClassId())
                .paid(Boolean.TRUE.equals(request.getPaid()))
                .enrollDate(LocalDateTime.now())
                .status(Boolean.TRUE.equals(request.getPaid())
                        ? Enrollment.Status.approved
                        : Enrollment.Status.pending)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        if (Boolean.TRUE.equals(request.getPaid())) {
            ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));
            classRoom.setCurrentStudents(
                    (classRoom.getCurrentStudents() != null ? classRoom.getCurrentStudents() : 0) + 1
            );
            classRoomRepository.save(classRoom);
        }

        return StudentDTO.EnrollResponse.fromEntity(savedEnrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<StudentDTO.QuizDetailResponse> getQuiz(Long quizId) {
        return quizRepository.findById(quizId)
                .map(quiz -> {
                    List<QuestionGroup> groups = questionGroupRepository.findByQuizIdOrderByOrderNumAsc(quizId);
                    List<Question> questions = questionRepository.findByQuizIdOrderByOrderNumAsc(quizId);

                    return StudentDTO.QuizDetailResponse.builder()
                            .quiz(StudentDTO.QuizInfo.fromEntity(quiz))
                            .groups(groups.stream()
                                    .map(StudentDTO.QuestionGroupResponse::fromEntity)
                                    .toList())
                            .questions(questions.stream()
                                    .map(StudentDTO.QuestionResponse::fromEntity)
                                    .toList())
                            .build();
                });
    }
}
