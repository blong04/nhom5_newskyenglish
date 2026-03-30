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

                // ── Public ──────────────────────────────────────────
                .requestMatchers("/auth/**").permitAll()

                // ── GET — mọi role đã login đều đọc được ────────────
                .requestMatchers(HttpMethod.GET, "/courses/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/classes/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/modules/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/lessons/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/quizzes/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/assignments/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/schedules/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/enrollments/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/notifications/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/submissions/**").authenticated()

                // ── /users GET — Admin + Teacher đọc được ───────────
                // (Teacher cần đọc danh sách user để hiển thị học viên)
                .requestMatchers(HttpMethod.GET, "/users/**").hasAnyRole("ADMIN", "TEACHER")

                // ── /admin/** GET — Admin + Teacher đọc được ────────
                // (Teacher cần /admin/classes để load lớp của mình)
                .requestMatchers(HttpMethod.GET, "/admin/**").hasAnyRole("ADMIN", "TEACHER")

                // ── /admin/** POST/PUT/DELETE — chỉ Admin ────────────
                .requestMatchers(HttpMethod.POST,   "/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/admin/**").hasRole("ADMIN")

                // ── /users CRUD — chỉ Admin ──────────────────────────
                .requestMatchers(HttpMethod.POST,   "/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")

                // ── /users PUT — Admin + chính user đó ──────────────
                // (Student/Teacher tự update profile của mình)
                .requestMatchers(HttpMethod.PUT, "/users/**").authenticated()

                // ── Courses/Classes CRUD — chỉ Admin ─────────────────
                .requestMatchers(HttpMethod.POST,   "/courses/**", "/classes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/courses/**", "/classes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/courses/**", "/classes/**").hasRole("ADMIN")

                // ── Quiz — Admin tạo/sửa/xóa ─────────────────────────
                .requestMatchers(HttpMethod.POST,   "/quizzes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/quizzes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/quizzes/**").hasRole("ADMIN")

                // ── Assignment — Teacher + Admin ──────────────────────
                .requestMatchers(HttpMethod.POST,   "/assignments/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT,    "/assignments/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/assignments/**").hasAnyRole("ADMIN", "TEACHER")

                // ── Teacher routes ────────────────────────────────────
                .requestMatchers("/teacher/**").hasAnyRole("ADMIN", "TEACHER")

                // ── Student + Enrollment ──────────────────────────────
                .requestMatchers("/student/**").authenticated()
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