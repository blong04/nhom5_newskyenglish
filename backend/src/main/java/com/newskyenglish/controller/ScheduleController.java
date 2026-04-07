package com.newskyenglish.controller;

import com.newskyenglish.model.ApiResponse;
import com.newskyenglish.model.ScheduleDTO;
import com.newskyenglish.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "https://newskyenglish.vercel.app"})
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getAllSchedules()));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getSchedulesByClassId(classId)));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ScheduleDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.createSchedule(request), "Tạo lịch thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ScheduleDTO.UpdateRequest request) {
        return scheduleService.updateSchedule(id, request)
                .map(response -> ResponseEntity.ok(ApiResponse.success(response, "Cập nhật thành công")))
                .orElse(ResponseEntity.notFound().build());
    }
}
