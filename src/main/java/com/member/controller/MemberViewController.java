package com.member.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.member.dto.MemberDTO;
import com.member.service.MemberService;

import jakarta.servlet.http.HttpSession;


@Controller
@RequestMapping("/members")
public class MemberViewController {

    @Autowired
    private MemberService memberService;

    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("member", new MemberDTO());
        return "register";
    }

    @PostMapping("/register")
    public String registerMember(MemberDTO memberDTO) {
        memberService.saveMember(memberDTO);
        return "redirect:/members/login";
    }

    @GetMapping("/login")
    public String showLoginForm() {
        return "login";
    }   

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    @GetMapping("/mypage")
    public String showMyPage() {
        return "mypage";
    }

    @GetMapping("/edit")
    public String editPage(){
        return "edit";
    }

    @GetMapping("/find")
    public String findPassword(){
        return "findPassword";
    }
    

}
