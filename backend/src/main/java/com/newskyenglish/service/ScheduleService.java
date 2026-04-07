package com.newskyenglish.service;

import com.newskyenglish.model.ScheduleDTO;

import java.util.List;
import java.util.Optional;

public interface ScheduleService {
    List<ScheduleDTO.Response> getAllSchedules();

    List<ScheduleDTO.Response> getSchedulesByClassId(Long classId);

    ScheduleDTO.Response createSchedule(ScheduleDTO.CreateRequest request);

    Optional<ScheduleDTO.Response> updateSchedule(Long id, ScheduleDTO.UpdateRequest request);
}
