package com.member.member.controller;

import com.member.member.entity.Member;
import com.member.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

    @Controller
    public class HomeController {

    @GetMapping("/home")
    public String home() {
        return "home"; 
    }
}

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/members/login";
    }
    @PostMapping("/login")
    public String loginMember(@RequestParam("username") String username, 
                          @RequestParam("password") String password, 
                          HttpSession session, 
                          Model model) {
    Member member = memberService.findByUsernameAndPassword(username, password);
    if (member != null) {
        session.setAttribute("loggedInUser", member);
        return "redirect:/home"; 
    } else {
        model.addAttribute("loginError", "Invalid username or password.");
        return "login";
    }
}
}
