package com.member.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.member.dto.MemberDTO;
import com.member.entity.Member;
import com.member.service.MemberService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberRestController {

    private static final Logger logger = LoggerFactory.getLogger(MemberRestController.class);

    @Autowired
    private MemberService memberService;

    @PostMapping("/register")
    public ResponseEntity<MemberDTO> registerMember(@ModelAttribute MemberDTO memberDTO) {
        memberService.saveMember(memberDTO);
        return ResponseEntity.ok(memberDTO);
    }

    @GetMapping("/{username}")
    public ResponseEntity<MemberDTO> getMemberByUsername(@PathVariable String username) {
        UserDetails userDetails = memberService.loadUserByUsername(username);
        if (userDetails == null) {
            throw new UsernameNotFoundException("User not found");
        }
        Member member = memberService.findByUsername(userDetails.getUsername());
        MemberDTO memberDTO = MemberDTO.fromEntity(member);
        return ResponseEntity.ok(memberDTO);
    }

    @PutMapping("/{mnum}")
    public ResponseEntity<MemberDTO> updateMember(@PathVariable Long mnum, @RequestBody MemberDTO memberDTO) {
        MemberDTO updatedMemberDTO = memberService.updateMember(mnum, memberDTO);
        return ResponseEntity.ok(updatedMemberDTO);
    }

    @DeleteMapping("/{mnum}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long mnum) {
        memberService.deleteMember(mnum);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<?> loginMember(@RequestBody MemberDTO loginRequest, HttpSession session) {
        logger.info("Login attempt for username: {}", loginRequest.getMid());
        Member member = memberService.findByUsernameAndPassword(loginRequest.getMid(), loginRequest.getMpw());
        if (member != null) {
            session.setAttribute("loggedInUser", member);
            session.setAttribute("mnick", member.getMnick());
            MemberDTO memberDTO = MemberDTO.fromEntity(member);
            logger.info("Login successful for username: {}", loginRequest.getMid());
            return ResponseEntity.ok(memberDTO); // 로그인 성공 시 DTO로 반환
        } else {
            logger.warn("Login failed for username: {}", loginRequest.getMid());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
        }
    }
    
}
