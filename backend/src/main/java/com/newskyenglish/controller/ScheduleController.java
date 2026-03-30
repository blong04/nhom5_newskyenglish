package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class ScheduleController {

    private final ScheduleRepository scheduleRepo;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(scheduleRepo.findAll()));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(
            scheduleRepo.findByClassId(classId)
        ));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Schedule req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(scheduleRepo.save(req), "Tạo lịch thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Schedule req) {
        return scheduleRepo.findById(id).map(s -> {
            if (req.getTitle()     != null) s.setTitle(req.getTitle());
            if (req.getDate()      != null) s.setDate(req.getDate());
            if (req.getStartTime() != null) s.setStartTime(req.getStartTime());
            if (req.getEndTime()   != null) s.setEndTime(req.getEndTime());
            if (req.getStatus()    != null) s.setStatus(req.getStatus());
            return ResponseEntity.ok(ApiResponse.success(scheduleRepo.save(s), "Cập nhật thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }
}