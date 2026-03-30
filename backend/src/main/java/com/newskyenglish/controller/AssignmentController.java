package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000","https://newskyenglish.vercel.app"})
public class AssignmentController {

    private final AssignmentRepository     assignRepo;
    private final AssignmentSubmitRepository submitRepo;

    // GET all
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(assignRepo.findAll()));
    }

    // GET by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return assignRepo.findById(id)
            .map(a -> ResponseEntity.ok(ApiResponse.success(a)))
            .orElse(ResponseEntity.notFound().build());
    }

    // GET by classId
    @GetMapping("/class/{classId}")
    public ResponseEntity<?> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(
            assignRepo.findByClassId(classId)
        ));
    }

    // POST create
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Assignment req) {
        Assignment saved = assignRepo.save(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(saved, "Tạo bài tập thành công"));
    }

    // PUT update
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Assignment req) {
        return assignRepo.findById(id).map(a -> {
            if (req.getTitle()       != null) a.setTitle(req.getTitle());
            if (req.getDescription() != null) a.setDescription(req.getDescription());
            if (req.getType()        != null) a.setType(req.getType());
            if (req.getExamType()    != null) a.setExamType(req.getExamType());
            if (req.getExamPart()    != null) a.setExamPart(req.getExamPart());
            if (req.getDeadline()    != null) a.setDeadline(req.getDeadline());
            if (req.getMaxScore()    != null) a.setMaxScore(req.getMaxScore());
            if (req.getStatus()      != null) a.setStatus(req.getStatus());
            return ResponseEntity.ok(
                ApiResponse.success(assignRepo.save(a), "Cập nhật thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        assignRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa"));
    }

    // GET submissions của 1 assignment
    @GetMapping("/{id}/submissions")
    public ResponseEntity<?> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
            submitRepo.findByAssignId(id)
        ));
    }

    // GET submissions của 1 user — FIX: dùng /submit/user/{userId}
    @GetMapping("/submit/user/{userId}")
    public ResponseEntity<?> getSubmitsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
            submitRepo.findByUserId(userId)
        ));
    }

    // POST nộp bài
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req) {
        AssignmentSubmit s = new AssignmentSubmit();
        s.setAssignId(id);
        if (req.get("userId") != null)
            s.setUserId(Long.valueOf(req.get("userId").toString()));
        s.setContent((String) req.getOrDefault("content", ""));
        s.setStatus(AssignmentSubmit.Status.submitted);
        return ResponseEntity.ok(
            ApiResponse.success(submitRepo.save(s), "Nộp bài thành công"));
    }

    // PUT chấm điểm
    @PutMapping("/submissions/{submitId}/grade")
    public ResponseEntity<?> grade(
            @PathVariable Long submitId,
            @RequestBody Map<String, Object> req) {
        return submitRepo.findById(submitId).map(s -> {
            if (req.get("score") != null)
                s.setScore(new BigDecimal(req.get("score").toString()));
            if (req.get("comment") != null)
                s.setComment((String) req.get("comment"));
            s.setStatus(AssignmentSubmit.Status.graded);
            return ResponseEntity.ok(
                ApiResponse.success(submitRepo.save(s), "Chấm điểm thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }
}