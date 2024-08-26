package com.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;

import com.member.service.OAuth2Service;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2Service oAuth2Service;

    public SecurityConfig(OAuth2Service oAuth2Service) {
        this.oAuth2Service = oAuth2Service;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http

                .authorizeHttpRequests(authorize -> authorize
                                 .requestMatchers("/files/**").permitAll()
                                .requestMatchers("/board/**").permitAll()       
                                .requestMatchers("/css/**", "/js/**", "/images/**", "/icons/**", "/static/**", "/medias/**").permitAll()
                                .requestMatchers("/members/register", "/members/login", "/members/mypage", "/members/edit", "/members/find", "/api/find/password", "/auth/google", "/auth/naver", "/auth/loginSuccess").permitAll()
                                .requestMatchers("/","/logout", "/home", "/api/members/**", "/api/auth/**", "/members/change","/api/members/me").permitAll()
                                .requestMatchers("/members/eat", "/members/watch", "/members/wear").authenticated()
                                .anyRequest().authenticated()
                )
                .logout(logout -> logout
                                .logoutUrl("/members/logout")
                                .logoutSuccessUrl("/logout")
                                .invalidateHttpSession(true) // 세션 무효화
                                .deleteCookies("JSESSIONID") // JSESSIONID 쿠키 삭제
                                .permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                                .loginPage("/members/login")
                                .defaultSuccessUrl("/auth/loginSuccess", true)
                                .failureUrl("/members/login?error=true")
                                .userInfoEndpoint(userInfoEndpoint ->
                                        userInfoEndpoint.userService(oAuth2Service)
                                )
                )
                .sessionManagement(session -> session
                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .cors(cors -> cors
                                .configurationSource(request -> {
                                    CorsConfiguration config = new CorsConfiguration();
                                    config.setAllowedOrigins(Arrays.asList("http://localhost:5000","http://127.0.0.1:5000"));
                                    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                                    config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Mnick"));
                                    config.setAllowCredentials(true);
                                    return config;
                                })
                )
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
