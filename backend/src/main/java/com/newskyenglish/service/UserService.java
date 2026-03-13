package com.newskyenglish.service;

import com.newskyenglish.model.User;
import com.newskyenglish.model.UserDTO;
import com.newskyenglish.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDTO.Response> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO.Response::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO.Response getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));
        return UserDTO.Response.fromEntity(user);
    }

    public UserDTO.Response createUser(UserDTO.CreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email '" + request.getEmail() + "' đã tồn tại");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .avatarUrl(request.getAvatarUrl())
                .roleId(request.getRoleId() != null ? request.getRoleId() : 3)
                .status(User.Status.active)
                .approved(true)
                .ieltsScore(request.getIeltsScore())
                .toeicScore(request.getToeicScore())
                .satScore(request.getSatScore())
                .specialization(request.getSpecialization())
                .experience(request.getExperience())
                .education(request.getEducation())
                .build();
        return UserDTO.Response.fromEntity(userRepository.save(user));
    }

    public UserDTO.Response updateUser(Long id, UserDTO.UpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email '" + request.getEmail() + "' đã tồn tại");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getName() != null)           user.setName(request.getName());
        if (request.getPhoneNumber() != null)    user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null)        user.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null)      user.setAvatarUrl(request.getAvatarUrl());
        if (request.getRoleId() != null)         user.setRoleId(request.getRoleId());
        if (request.getStatus() != null)         user.setStatus(request.getStatus());
        if (request.getIeltsScore() != null)     user.setIeltsScore(request.getIeltsScore());
        if (request.getToeicScore() != null)     user.setToeicScore(request.getToeicScore());
        if (request.getSatScore() != null)       user.setSatScore(request.getSatScore());
        if (request.getSpecialization() != null) user.setSpecialization(request.getSpecialization());
        if (request.getExperience() != null)     user.setExperience(request.getExperience());
        if (request.getEducation() != null)      user.setEducation(request.getEducation());

        return UserDTO.Response.fromEntity(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy user với id: " + id);
        }
        userRepository.deleteById(id);
    }
}