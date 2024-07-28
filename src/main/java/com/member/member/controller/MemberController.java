package com.member.member.controller;

import com.member.member.entity.Member;
import com.member.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("member", new Member());
        return "register";
    }

    @PostMapping("/register")
    public String registerMember(Member member) {
        memberService.saveMember(member);
        return "redirect:/members/login";
    }

    @GetMapping("/login")
    public String showLoginForm() {
        return "login";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/members/login";
    }
}
