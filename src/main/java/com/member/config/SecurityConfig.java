package com.member.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.member.entity.Member;
import com.member.repository.MemberRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final MemberRepository memberRepository;

    public SecurityConfig(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
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
                .requestMatchers("/css/**","/js/**").permitAll()  // static 리소스 접근 허용
                .requestMatchers("/members/register", "/members/login","/members/mypage","/members/edit","/members/find", "/api/find/password").permitAll()
                .requestMatchers("/home").authenticated()
                .requestMatchers("/", "/home", "/members/register", "/members/login", "/css/**", "/js/**", "/images/**", "/icons/**", "/static/**", "/medias/**","/api/members/**").permitAll()
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
            .csrf().disable();;
        return http.build();
    }
}
