package com.newskyenglish.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduleDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotNull(message = "classId không được để trống")
        private Long classId;

        @NotBlank(message = "title không được để trống")
        private String title;

        private String description;

        @NotNull(message = "date không được để trống")
        private LocalDate date;

        @NotNull(message = "startTime không được để trống")
        private LocalTime startTime;

        @NotNull(message = "endTime không được để trống")
        private LocalTime endTime;

        private String location;
        private String onlineLink;
        private Schedule.Type type;
        private Schedule.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private Long classId;
        private String title;
        private String description;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String location;
        private String onlineLink;
        private Schedule.Type type;
        private Schedule.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long classId;
        private String title;
        private String description;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String location;
        private String onlineLink;
        private Schedule.Type type;
        private Schedule.Status status;

        public static Response fromEntity(Schedule schedule) {
            return Response.builder()
                    .id(schedule.getId())
                    .classId(schedule.getClassId())
                    .title(schedule.getTitle())
                    .description(schedule.getDescription())
                    .date(schedule.getDate())
                    .startTime(schedule.getStartTime())
                    .endTime(schedule.getEndTime())
                    .location(schedule.getLocation())
                    .onlineLink(schedule.getOnlineLink())
                    .type(schedule.getType())
                    .status(schedule.getStatus())
                    .build();
        }
    }
}
