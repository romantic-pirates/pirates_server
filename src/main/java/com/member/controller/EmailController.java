package com.member.controller;

import com.member.entity.Member;
import com.member.service.EmailService;
import com.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Random;

@RequestMapping("/api/find")
@RestController
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private MemberService memberService;

    @GetMapping("password")
    @ResponseBody
    public String mailFindPwd(HttpServletRequest request, @RequestParam("mid") String mid) throws Exception {

        Member member = memberService.findByUsername(mid);
        if (member == null) {
            return "false";
        }

        Random r = new Random();
        int checkNum = r.nextInt(888888) + 111111;
        String tempPassword = Integer.toString(checkNum);

        // 임시 비밀번호를 데이터베이스에 저장
        memberService.updatePassword(mid, tempPassword);

        String title = "EasyPick 비밀번호 찾기 인증 이메일 입니다.";
        String to = mid;
        String content =
                System.getProperty("line.separator") +
                System.getProperty("line.separator") +
                "안녕하세요 EasyPick을 다시 찾아주셔서 감사합니다" +
                System.getProperty("line.separator") +
                System.getProperty("line.separator") +
                "임시 비밀번호는 " + tempPassword + " 입니다. " +
                System.getProperty("line.separator") +
                "로그인 후 반드시 비밀번호를 변경해 주세요.";

        try {
            emailService.sendEmail(to, title, content);
            return "true";
        } catch (Exception e) {
            e.printStackTrace();
            return "error";
        }
    }
}
