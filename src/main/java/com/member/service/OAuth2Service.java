package com.member.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.member.dto.CustomOAuth2User;
import com.member.dto.GoogleResponse;
import com.member.dto.OAuth2Response;
import com.member.entity.Member;
import com.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service  
@RequiredArgsConstructor  
public class OAuth2Service extends DefaultOAuth2UserService {  

    private final MemberRepository memberRepository;

    @Value("spring.security.oauth2.client.registration.google.client-id")
    private String GoolgeClint;

    @Override  
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {  
        OAuth2User oAuth2User = super.loadUser(userRequest);  
        Map<String, Object> attributes = oAuth2User.getAttributes();
        OAuth2Response oAuth2Response = new GoogleResponse(attributes); // GoogleResponse로 래핑
        
        return new CustomOAuth2User(oAuth2Response, "ROLE_USER");
    }

    public OAuth2User loadUserFromGoogleToken(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new JacksonFactory())
            .setAudience(Collections.singletonList(GoolgeClint)) // 여기에 실제 Google Client ID를 넣으세요
            .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            Map<String, Object> attributes = payload;
            OAuth2Response oAuth2Response = new GoogleResponse(attributes);
            return new CustomOAuth2User(oAuth2Response, "ROLE_USER");
        } else {
            throw new Exception("Invalid ID token.");
        }
    }

    public Member findOrCreateMember(String email, OAuth2User oAuth2User) {
        Member member = memberRepository.findByMid(email);

        if (member == null) {
            member = Member.builder()
                .mname(oAuth2User.getAttribute("name"))
                .mnick("GoogleUser")
                .mid(email)
                .mpw("N/A")
                .mbirth("1900-01-01")
                .mhp("000-0000-0000")
                .mgender("U")
                .madmin("N")
                .mzonecode("000000")
                .mroad("default road")
                .mroaddetail("default road detail")
                .mjibun("default jibun")
                .insertdate(LocalDate.now())
                .build();
            memberRepository.save(member);
        }

        return member;
    }
}
