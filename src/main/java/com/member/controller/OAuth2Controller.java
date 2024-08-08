package com.member.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.member.entity.Member;
import com.member.service.OAuth2Service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final HttpServletRequest request;
    private final OAuth2Service oAuth2Service;

    @GetMapping("/google")
    public String redirectToGoogle() {
        return "redirect:/oauth2/authorization/google";
    }

    @GetMapping("/naver")
    public String redirectToNaver() {
        return "redirect:/oauth2/authorization/naver";
    }

    @GetMapping("/loginSuccess")
    public String oauth2LoginSuccess(Model model) {
    OAuth2User oAuth2User = (OAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    String email = oAuth2User.getAttribute("email");
    Member member = oAuth2Service.findOrCreateMember(email, oAuth2User);

    model.addAttribute("member", member);

    return "loginSuccess";
}
}
