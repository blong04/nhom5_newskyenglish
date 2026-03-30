package com.newskyenglish.repository;

import com.newskyenglish.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByClassId(Long classId);
    List<Schedule> findByClassIdOrderByDateAsc(Long classId);
}