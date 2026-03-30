package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ScheduleID")
    private Long id;

    @Column(name = "ClassID")
    private Long classId;

    @Column(name = "TieuDe", length = 255)
    private String title;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Column(name = "NgayHoc")
    private LocalDate date;

    @Column(name = "GioBatDau")
    private LocalTime startTime;

    @Column(name = "GioKetThuc")
    private LocalTime endTime;

    @Column(name = "DiaDiem", length = 255)
    private String location;

    @Column(name = "LinkOnline", length = 255)
    private String onlineLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "LoaiLichHoc")
    @Builder.Default
    private Type type = Type.online;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.scheduled;

    public enum Type   { online, offline, hybrid }
    public enum Status { scheduled, ongoing, completed, cancelled }
}