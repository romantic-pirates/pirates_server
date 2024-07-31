package com.member.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.member.dto.MemberDTO;
import com.member.entity.Member;
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

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/members/login";
    }

    @Controller
    public class HomeController {

        @GetMapping("/")
        public String index() {
            return "home"; 
        }

        @GetMapping("/home")
        public String home() {
            return "home"; 
        }
    }
}
