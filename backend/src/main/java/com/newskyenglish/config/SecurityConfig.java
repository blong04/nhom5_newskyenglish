package com.newskyenglish.config;

import com.newskyenglish.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers("/auth/**").permitAll()

                // GET chung — ai đã login đều xem được
                .requestMatchers(HttpMethod.GET,
                    "/courses/**", "/classes/**", "/lessons/**",
                    "/modules/**", "/quizzes/**", "/assignments/**",
                    "/schedules/**", "/enrollments/**",
                    "/notifications/**"
                ).authenticated()

                // Admin only
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/users/**").hasRole("ADMIN")

                // Teacher + Admin
                .requestMatchers(HttpMethod.POST, "/assignments/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT,  "/assignments/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/assignments/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/teacher/**").hasAnyRole("ADMIN", "TEACHER")

                // Quiz — admin tạo, teacher chỉ xem
                .requestMatchers(HttpMethod.POST, "/quizzes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/quizzes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/quizzes/**").hasRole("ADMIN")

                // Course, Class — admin quản lý
                .requestMatchers(HttpMethod.POST, "/courses/**", "/classes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/courses/**", "/classes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/courses/**", "/classes/**").hasRole("ADMIN")

                // Student
                .requestMatchers("/student/**").authenticated()

                // Notification — ai cũng gửi/nhận được (có lọc trong service)
                .requestMatchers(HttpMethod.POST, "/notifications/**").authenticated()
                .requestMatchers(HttpMethod.PUT,  "/notifications/**").authenticated()

                // Enrollments — student đăng ký, admin duyệt
                .requestMatchers(HttpMethod.POST, "/enrollments/**").authenticated()
                .requestMatchers(HttpMethod.PUT,  "/enrollments/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}