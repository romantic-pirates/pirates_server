package com.member.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize

                .requestMatchers("/css/**","/js/**").permitAll()  // static 리소스 접근 허용
                .requestMatchers("/members/register", "/members/login").permitAll()
                .requestMatchers("/home").authenticated()
                .requestMatchers("/", "/home", "/members/register", "/members/login", "/css/**", "/js/**", "/images/**", "/icons/**", "/static/**", "/medias/**").permitAll()

                .anyRequest().authenticated()
            )
            .formLogin(formLogin -> formLogin
                .loginPage("/members/login")
                .loginProcessingUrl("/members/login")
                .defaultSuccessUrl("/", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/members/logout")
                .logoutSuccessUrl("/members/login")
                .permitAll()
            );
        return http.build();
    }
}