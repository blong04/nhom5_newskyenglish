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
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Public ─────────────────────────────────────────
                .requestMatchers("/auth/**").permitAll()

                // ── Tất cả đã login đều GET được ───────────────────
                // Student cần GET /admin/classes để xem lớp
                .requestMatchers(HttpMethod.GET, "/**").authenticated()

                // ── Admin only: POST/PUT/DELETE toàn bộ ────────────
                .requestMatchers(HttpMethod.POST,
                    "/admin/**", "/users/**",
                    "/courses/**", "/classes/**",
                    "/quizzes/**"
                ).hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT,
                    "/admin/**", "/users/**",
                    "/courses/**", "/classes/**",
                    "/quizzes/**"
                ).hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE,
                    "/admin/**", "/users/**",
                    "/courses/**", "/classes/**",
                    "/quizzes/**"
                ).hasRole("ADMIN")

                // ── Teacher: tạo/sửa/xóa assignments ──────────────
                .requestMatchers(HttpMethod.POST,
                    "/assignments/**", "/teacher/**"
                ).hasAnyRole("ADMIN", "TEACHER")

                .requestMatchers(HttpMethod.PUT,
                    "/assignments/**", "/teacher/**"
                ).hasAnyRole("ADMIN", "TEACHER")

                .requestMatchers(HttpMethod.DELETE,
                    "/assignments/**"
                ).hasAnyRole("ADMIN", "TEACHER")

                // ── Student: đăng ký, nộp bài, notifications ───────
                .requestMatchers(HttpMethod.POST,
                    "/student/**", "/enrollments/**",
                    "/notifications/**"
                ).authenticated()

                .requestMatchers(HttpMethod.PUT,
                    "/student/**", "/enrollments/**",
                    "/notifications/**"
                ).authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}