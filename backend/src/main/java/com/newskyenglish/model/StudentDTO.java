package com.newskyenglish.model;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class StudentDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollRequest {
        @NotNull(message = "courseId không được để trống")
        private Long courseId;

        @NotNull(message = "classId không được để trống")
        private Long classId;

        @Builder.Default
        private Boolean paid = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollResponse {
        private Long enrollmentId;
        private Long userId;
        private Long courseId;
        private Long classId;
        private Enrollment.Status status;
        private Boolean paid;
        private LocalDateTime enrollDate;

        public static EnrollResponse fromEntity(Enrollment enrollment) {
            return EnrollResponse.builder()
                    .enrollmentId(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .paid(enrollment.getPaid())
                    .enrollDate(enrollment.getEnrollDate())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollmentResponse {
        private Long id;
        private Long userId;
        private Long courseId;
        private Long classId;
        private Enrollment.Status status;
        private Boolean paid;
        private LocalDateTime enrollDate;
        private LocalDateTime approvedDate;
        private CourseInfo course;
        private ClassInfo classRoom;

        public static EnrollmentResponse fromEntity(
                Enrollment enrollment,
                CourseInfo course,
                ClassInfo classRoom
        ) {
            return EnrollmentResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .paid(enrollment.getPaid())
                    .enrollDate(enrollment.getEnrollDate())
                    .approvedDate(enrollment.getApprovedDate())
                    .course(course)
                    .classRoom(classRoom)
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CourseInfo {
        private Long id;
        private String title;
        private Course.ExamType examType;
        private BigDecimal price;

        public static CourseInfo fromEntity(Course course) {
            if (course == null) {
                return null;
            }
            return CourseInfo.builder()
                    .id(course.getId())
                    .title(course.getTitle())
                    .examType(course.getExamType())
                    .price(course.getPrice())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassInfo {
        private Long id;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer maxStudents;
        private Integer currentStudents;

        public static ClassInfo fromEntity(ClassRoom classRoom) {
            if (classRoom == null) {
                return null;
            }
            return ClassInfo.builder()
                    .id(classRoom.getId())
                    .name(classRoom.getName())
                    .startDate(classRoom.getStartDate())
                    .endDate(classRoom.getEndDate())
                    .maxStudents(classRoom.getMaxStudents())
                    .currentStudents(classRoom.getCurrentStudents())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizDetailResponse {
        private QuizInfo quiz;
        private List<QuestionGroupResponse> groups;
        private List<QuestionResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizInfo {
        private Long id;
        private Long lessonId;
        private String title;
        private Quiz.QuizType type;
        private Quiz.ExamType examType;
        private String examPart;
        private String passageText;
        private String audioUrl;
        private String instructions;
        private Integer timeLimit;
        private Long classId;

        public static QuizInfo fromEntity(Quiz quiz) {
            return QuizInfo.builder()
                    .id(quiz.getId())
                    .lessonId(quiz.getLessonId())
                    .title(quiz.getTitle())
                    .type(quiz.getType())
                    .examType(quiz.getExamType())
                    .examPart(quiz.getExamPart())
                    .passageText(quiz.getPassageText())
                    .audioUrl(quiz.getAudioUrl())
                    .instructions(quiz.getInstructions())
                    .timeLimit(quiz.getTimeLimit())
                    .classId(quiz.getClassId())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionGroupResponse {
        private Long id;
        private Long quizId;
        private String title;
        private String passageText;
        private String imageUrl;
        private String audioUrl;
        private String instructions;
        private Integer orderNum;

        public static QuestionGroupResponse fromEntity(QuestionGroup group) {
            return QuestionGroupResponse.builder()
                    .id(group.getId())
                    .quizId(group.getQuizId())
                    .title(group.getTitle())
                    .passageText(group.getPassageText())
                    .imageUrl(group.getImageUrl())
                    .audioUrl(group.getAudioUrl())
                    .instructions(group.getInstructions())
                    .orderNum(group.getOrderNum())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private Long id;
        private Long quizId;
        private Long groupId;
        private Integer partNumber;
        private String questionType;
        private String content;
        private String imageUrl;
        private String audioUrl;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer orderNum;
        private BigDecimal scoreWeight;

        public static QuestionResponse fromEntity(Question question) {
            return QuestionResponse.builder()
                    .id(question.getId())
                    .quizId(question.getQuizId())
                    .groupId(question.getGroupId())
                    .partNumber(question.getPartNumber())
                    .questionType(question.getQuestionType())
                    .content(question.getContent())
                    .imageUrl(question.getImageUrl())
                    .audioUrl(question.getAudioUrl())
                    .optionA(question.getOptionA())
                    .optionB(question.getOptionB())
                    .optionC(question.getOptionC())
                    .optionD(question.getOptionD())
                    .orderNum(question.getOrderNum())
                    .scoreWeight(question.getScoreWeight())
                    .build();
        }
    }
}
