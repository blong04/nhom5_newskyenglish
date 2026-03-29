package com.newskyenglish.repository;

import com.newskyenglish.model.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    List<ClassRoom> findByCourseId(Long courseId);
    List<ClassRoom> findByStatus(ClassRoom.Status status);
    List<ClassRoom> findByTeacherId(int teacherId);
}