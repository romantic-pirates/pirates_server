package com.member.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.member.dto.MemberDTO;
import com.member.entity.Member;
import com.member.service.MemberService;

import jakarta.servlet.http.HttpServletRequest;
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

    @PostMapping("/logout")
    public String logout(HttpSession session) {
        return "redirect:/members/logout";
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
    
    @GetMapping("/change")
    public String changePage(Model model, HttpSession session) {
        Member loggedInUser = (Member) session.getAttribute("loggedInUser");
        if (loggedInUser == null) {
            return "redirect:/members/login";
        }
        MemberDTO memberDTO = MemberDTO.fromEntity(loggedInUser);
        model.addAttribute("member", memberDTO);
        return "change";
    }
    
    @GetMapping("/eat")
    public String redirectToFlask(HttpServletRequest request) {
        HttpSession session = request.getSession();
        String mnick = (String) session.getAttribute("mnick");
    
        // 만약 mnick이 null이면 로그를 남기고 디버그할 수 있음
        if (mnick == null) {
            System.out.println("mnick is null in session");
        }
    
        // Flask 서버로 리디렉션
        return "redirect:http://localhost:5000/eat?mnick=" + mnick;
    }

    @GetMapping("/watch")
    public String redirectWatch(HttpServletRequest request) {
        HttpSession session = request.getSession();
        String mnick = (String) session.getAttribute("mnick");
    
        // 만약 mnick이 null이면 로그를 남기고 디버그할 수 있음
        if (mnick == null) {
            System.out.println("mnick is null in session");
        }
    
        // Flask 서버로 리디렉션
        return "redirect:http://localhost:5000/watch?mnick=" + mnick;
    }

    @GetMapping("/wear")
    public String redirectWear(HttpServletRequest request) {
        HttpSession session = request.getSession();
        String mnick = (String) session.getAttribute("mnick");
    
        // 만약 mnick이 null이면 로그를 남기고 디버그할 수 있음
        if (mnick == null) {
            System.out.println("mnick is null in session");
        }
    
        // Flask 서버로 리디렉션
        return "redirect:http://localhost:5000/wear?mnick=" + mnick;
    }

}
