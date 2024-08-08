package com.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.member.entity.Member;
import com.member.repository.MemberRepository;
import com.member.service.OAuth2Service;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final MemberRepository memberRepository;
    private final OAuth2Service oAuth2Service;

    public SecurityConfig(MemberRepository memberRepository, OAuth2Service oAuth2Service) {
        this.memberRepository = memberRepository;
        this.oAuth2Service = oAuth2Service;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            Member member = memberRepository.findByMid(username);
            if (member == null) {
                throw new UsernameNotFoundException("User not found");
            }
            return User.withUsername(member.getMid())
                       .password(member.getMpw())
                       .roles("USER")
                       .build();
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/css/**", "/js/**", "/images/**", "/icons/**", "/static/**", "/medias/**").permitAll()
                .requestMatchers("/members/register", "/members/login", "/members/mypage", "/members/edit", "/members/find", "/api/find/password", "/auth/google", "/auth/naver", "/auth/loginSuccess").permitAll()
                .requestMatchers("/", "/home", "/api/members/**","/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(formLogin -> formLogin
                .loginPage("/members/login")
                .loginProcessingUrl("/members/login")
                .defaultSuccessUrl("/home", true)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/members/logout")
                .logoutSuccessUrl("/")
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
            .csrf().disable();
        return http.build();
    }
}
