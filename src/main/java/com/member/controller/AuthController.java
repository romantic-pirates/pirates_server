package com.member.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.member.entity.Member;
import com.member.service.OAuth2Service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final HttpServletRequest request;
    private final OAuth2Service oAuth2Service;

    @PostMapping("/google-login")
    public ResponseEntity<Member> googleLogin(@RequestBody Map<String, String> payload) {
        try {
            String idToken = payload.get("token");
            OAuth2User oAuth2User = oAuth2Service.loadUserFromGoogleToken(idToken);
            String email = oAuth2User.getAttribute("email");
            Member member = oAuth2Service.findOrCreateMember(email, oAuth2User);

            // 세션에 사용자 정보 저장
            request.getSession().setAttribute("loggedInUser", member);
            request.getSession().setAttribute("mnick", member.getMnick());

            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/userinfo")
    public ResponseEntity<OAuth2User> getUserInfo(Authentication authentication) {
        OAuth2User user = (OAuth2User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/sessionInfo")
    public ResponseEntity<Member> getSessionInfo(Authentication authentication) {
        Member loggedInUser = (Member) request.getSession().getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        return ResponseEntity.ok(loggedInUser);
    }
}
