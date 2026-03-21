package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "modules")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ModuleID")
    private Long id;

    @Column(name = "CourseID")
    private Long courseId;

    @Column(name = "TenChuong", length = 150)
    private String title;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ThuTu")
    @Builder.Default
    private Integer orderNum = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.active;

    public enum Status { active, inactive }
}