package com.member.dto;

import java.util.Map;

public class NaverResponse implements OAuth2Response {
    private final Map<String, Object> attributes;
    private final Map<String, Object> response;

    public NaverResponse(Map<String, Object> attributes) {
        this.attributes = attributes;
        this.response = (Map<String, Object>) attributes.get("response");
    }

    @Override  
    public String getProviderId() {  
        return getValue(response.get("id"));  
    }  
  
    @Override  
    public String getEmail() {  
        return getValue(response.get("email"));  
    }  
  
    @Override  
    public String getName() {  
        return getValue(response.get("name"));  
    }

    @Override
    public String getProvider() {
        return "naver";
    }
        
    public String getBirthday() {
        return getValue(response.get("birthday"));
    }

    public String getPhone() {
        return getValue(response.get("mobile"));
    }

    private String getValue(Object value) {
        return value != null ? value.toString() : "아직 설정되지 않은 정보입니다";
    }
}
