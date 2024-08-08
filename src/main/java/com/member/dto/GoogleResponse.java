package com.member.dto;

import java.util.Map;

public class GoogleResponse implements OAuth2Response {

   private final Map<String, Object> attributes;

   public GoogleResponse(Map<String, Object> attributes) {
       this.attributes = attributes;
   }

   @Override
   public String getProvider() {
       return "google";
   }

   @Override
   public String getEmail() {
       return attributes.get("email").toString();
   }

   @Override
   public String getName() {
       return attributes.get("name").toString();
   }

   @Override
   public String getProviderId() {
       return attributes.get("sub").toString();
   }

    @Override
    public String getBirthday() {

        return "";
    }

    @Override
    public String getPhone() {

        return "";
    }
}
