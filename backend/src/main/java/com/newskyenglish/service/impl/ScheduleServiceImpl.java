package com.newskyenglish.service.impl;

import com.newskyenglish.model.Schedule;
import com.newskyenglish.model.ScheduleDTO;
import com.newskyenglish.repository.ScheduleRepository;
import com.newskyenglish.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO.Response> getAllSchedules() {
        return scheduleRepository.findAll()
                .stream()
                .map(ScheduleDTO.Response::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleDTO.Response> getSchedulesByClassId(Long classId) {
        return scheduleRepository.findByClassIdOrderByDateAsc(classId)
                .stream()
                .map(ScheduleDTO.Response::fromEntity)
                .toList();
    }

    @Override
    public ScheduleDTO.Response createSchedule(ScheduleDTO.CreateRequest request) {
        Schedule schedule = Schedule.builder()
                .classId(request.getClassId())
                .title(request.getTitle())
                .description(request.getDescription())
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .location(request.getLocation())
                .onlineLink(request.getOnlineLink())
                .type(request.getType() != null ? request.getType() : Schedule.Type.offline)
                .status(request.getStatus() != null ? request.getStatus() : Schedule.Status.scheduled)
                .build();

        return ScheduleDTO.Response.fromEntity(scheduleRepository.save(schedule));
    }

    @Override
    public Optional<ScheduleDTO.Response> updateSchedule(Long id, ScheduleDTO.UpdateRequest request) {
        return scheduleRepository.findById(id)
                .map(schedule -> {
                    if (request.getClassId() != null) {
                        schedule.setClassId(request.getClassId());
                    }
                    if (request.getTitle() != null) {
                        schedule.setTitle(request.getTitle());
                    }
                    if (request.getDescription() != null) {
                        schedule.setDescription(request.getDescription());
                    }
                    if (request.getDate() != null) {
                        schedule.setDate(request.getDate());
                    }
                    if (request.getStartTime() != null) {
                        schedule.setStartTime(request.getStartTime());
                    }
                    if (request.getEndTime() != null) {
                        schedule.setEndTime(request.getEndTime());
                    }
                    if (request.getLocation() != null) {
                        schedule.setLocation(request.getLocation());
                    }
                    if (request.getOnlineLink() != null) {
                        schedule.setOnlineLink(request.getOnlineLink());
                    }
                    if (request.getType() != null) {
                        schedule.setType(request.getType());
                    }
                    if (request.getStatus() != null) {
                        schedule.setStatus(request.getStatus());
                    }

                    return ScheduleDTO.Response.fromEntity(scheduleRepository.save(schedule));
                });
    }
}
