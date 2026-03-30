package com.newskyenglish.repository;

import com.newskyenglish.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserId(Long userId);
    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
}