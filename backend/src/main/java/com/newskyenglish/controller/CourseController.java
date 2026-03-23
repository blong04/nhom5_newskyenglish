package com.newskyenglish.controller;

import com.newskyenglish.model.*;
import com.newskyenglish.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.newskyenglish.model.Module;
import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "https://newskyenglish.vercel.app"})
public class CourseController {

    private final CourseRepository courseRepo;
    private final ModuleRepository moduleRepo;
    private final LessonRepository lessonRepo;
    private final ClassRoomRepository classRepo; // ← thêm vào

    // ==========================================
    // COURSES CRUD
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(courseRepo.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return courseRepo.findById(id)
            .map(c -> ResponseEntity.ok(ApiResponse.success(c)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Course course) {
        Course saved = courseRepo.save(course);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(saved, "Tạo khóa học thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Course req) {
        return courseRepo.findById(id).map(c -> {
            if (req.getTitle()       != null) c.setTitle(req.getTitle());
            if (req.getDescription() != null) c.setDescription(req.getDescription());
            if (req.getTeacherId()   != null) c.setTeacherId(req.getTeacherId());
            if (req.getPrice()       != null) c.setPrice(req.getPrice());
            if (req.getLevel()       != null) c.setLevel(req.getLevel());
            if (req.getExamType()    != null) c.setExamType(req.getExamType());
            if (req.getStatus()      != null) c.setStatus(req.getStatus());
            return ResponseEntity.ok(ApiResponse.success(courseRepo.save(c), "Cập nhật thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        courseRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa thành công"));
    }

    // ==========================================
    // MODULES & LESSONS
    // ==========================================

    @GetMapping("/{id}/modules")
    public ResponseEntity<?> getModules(@PathVariable Long id) {
        List<Module> modules = moduleRepo.findByCourseIdOrderByOrderNumAsc(id);
        return ResponseEntity.ok(ApiResponse.success(modules));
    }

    @GetMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<?> getLessons(@PathVariable Long moduleId) {
        List<Lesson> lessons = lessonRepo.findByModuleIdOrderByOrderNumAsc(moduleId);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    // ==========================================
    // CLASSES của khóa học
    // ==========================================

    @GetMapping("/{id}/classes")
    public ResponseEntity<?> getCourseClasses(@PathVariable Long id) {
        List<ClassRoom> classes = classRepo.findByCourseId(id);
        return ResponseEntity.ok(ApiResponse.success(classes));
    }
}