package com.member.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


import jakarta.servlet.http.HttpSession;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "home"; 
    }

    @GetMapping("/home")
    public String home(HttpSession session, Model model) {
        return "home";
    }

    @GetMapping("/logout")
    public String logoutPage() {
        return "logout";
    }
}
