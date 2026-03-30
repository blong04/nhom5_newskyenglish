package com.newskyenglish.model;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public class UserDTO {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {

        @NotBlank(message = "Họ tên không được để trống")
        @Size(min = 2, max = 100)
        private String name;

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @Size(max = 15)
        private String phoneNumber;

        private String address;
        private String avatarUrl;
        private Integer roleId; // 1=Admin, 2=Giáo viên, 3=Học viên
        private Double ieltsScore;
        private Integer toeicScore;
        private Integer satScore;
        private String specialization;
        private String experience;
        private String education;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {

        @Size(min = 2, max = 100)
        private String name;

        @Email(message = "Email không hợp lệ")
        private String email;

        @Size(max = 15)
        private String phoneNumber;

        private String address;
        private String avatarUrl;
        private Integer roleId;
        private User.Status status;
        private Double ieltsScore;
        private Integer toeicScore;
        private Integer satScore;
        private String specialization;
        private String experience;
        private String education;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
        private String address;
        private String avatarUrl;
        private Integer roleId;
        private String roleName;
        private User.Status status;
        private Boolean approved;
        private Double ieltsScore;
        private Integer toeicScore;
        private Integer satScore;
        private String specialization;
        private String experience;
        private String education;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(User user) {
            String roleName = switch (user.getRoleId() != null ? user.getRoleId() : 3) {
                case 1 -> "Admin";
                case 2 -> "Giáo viên";
                default -> "Học viên";
            };
            return Response.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .address(user.getAddress())
                    .avatarUrl(user.getAvatarUrl())
                    .roleId(user.getRoleId())
                    .roleName(roleName)
                    .status(user.getStatus())
                    .approved(user.getApproved())
                    .ieltsScore(user.getIeltsScore())
                    .toeicScore(user.getToeicScore())
                    .satScore(user.getSatScore())
                    .specialization(user.getSpecialization())
                    .experience(user.getExperience())
                    .education(user.getEducation())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
        }
    }
}