package com.newskyenglish.repository;

import com.newskyenglish.model.AssignmentSubmit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssignmentSubmitRepository extends JpaRepository<AssignmentSubmit, Long> {
    List<AssignmentSubmit> findByAssignId(Long assignId);
    List<AssignmentSubmit> findByUserId(Long userId);
    List<AssignmentSubmit> findByAssignIdAndUserId(Long assignId, Long userId);
}