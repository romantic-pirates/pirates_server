package com.member.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomOAuth2User implements OAuth2User {
    
    private final OAuth2Response oAuth2Response;  
    private final String role;  
  
    @Override  
    public <A> A getAttribute(String name) {  
        return (A) getAttributes().get(name);  
    }  
  
    @Override  
    public Map<String, Object> getAttributes() {  
        return Map.of(
            "name", oAuth2Response.getName(),
            "email", oAuth2Response.getEmail(),
            "provider", oAuth2Response.getProvider(),
            "providerId", oAuth2Response.getProviderId(),
            "birthday", oAuth2Response.getBirthday(),
            "phone", oAuth2Response.getPhone()
        );
    }  
  
    @Override  
    public Collection<? extends GrantedAuthority> getAuthorities() {  
        Collection<GrantedAuthority> collection = new ArrayList<>();  
        collection.add(() -> role);  
        return collection;  
    }  
  
    @Override  
    public String getName() {  
        return oAuth2Response.getName();  
    }  
  
    public String username() {  
        return oAuth2Response.getProvider() + " " + oAuth2Response.getProviderId();  
    }
}
