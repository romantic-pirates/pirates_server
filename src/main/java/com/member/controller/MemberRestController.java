package com.member.controller;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.member.dto.MemberDTO;
import com.member.entity.Member;
import com.member.service.MemberService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberRestController {

    private static final Logger logger = LoggerFactory.getLogger(MemberRestController.class);

    @Autowired
    private MemberService memberService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<MemberDTO> registerMember(@ModelAttribute MemberDTO memberDTO) {
        memberService.saveMember(memberDTO);
        return ResponseEntity.ok(memberDTO);
    }

    @GetMapping("/{username}")
    public ResponseEntity<MemberDTO> getMemberByUsername(@PathVariable("username") String username) {
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
    public ResponseEntity<?> loginMember(@RequestBody MemberDTO loginRequest, HttpServletRequest request) {
        logger.info("Login attempt for username: {}", loginRequest.getMid());
    
        try {
            UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(loginRequest.getMid(), loginRequest.getMpw());
    
            Authentication authentication = authenticationManager.authenticate(authenticationToken);
    
            // 로그인한 사용자의 권한을 추가로 확인하고 설정
            logger.info("Authentication successful, authorities: {}", authentication.getAuthorities());
    
            // SecurityContext 설정
            SecurityContextHolder.getContext().setAuthentication(authentication);
    
            // 현재 세션 가져오기 및 무효화
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
    
            // 새 세션 생성
            session = request.getSession(true);
    
            // SecurityContext 다시 세션에 설정
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
    
            // 사용자 정보 세션에 저장
            Member member = memberService.findByUsername(loginRequest.getMid());
            session.setAttribute("loggedInUser", member);
            session.setAttribute("mnick", member.getMnick());
    
            logger.info("Login successful for username: {}", loginRequest.getMid());
            logger.info("Authentication after setting SecurityContext: {}", SecurityContextHolder.getContext().getAuthentication());
    
            return ResponseEntity.ok(MemberDTO.fromEntity(member));
        } catch (Exception e) {
            logger.warn("Login failed for username: {}", loginRequest.getMid());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password.");
        }
    }
    
    @GetMapping("/check_username")
    public ResponseEntity<Boolean> checkUsernameExists(@RequestParam("username") String username) {
        boolean exists = memberService.usernameExists(username);
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/change_password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordRequest) {
        String username = passwordRequest.get("username");
        String currentPassword = passwordRequest.get("currentPassword");
        String newPassword = passwordRequest.get("newPassword");

        try {
            memberService.changePassword(username, currentPassword, newPassword);
            return ResponseEntity.ok().body("Password changed successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteMember(@RequestBody Map<String, String> request, HttpSession session) {
    String username = request.get("username");
    String password = request.get("password");

    Member member = memberService.findByUsernameAndPassword(username, password);
    if (member == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password.");
    }

    memberService.deleteMember(member.getMnum());
        session.invalidate(); // 세션 무효화
        return ResponseEntity.ok().body("Member deleted successfully.");
    }

    @PutMapping("/change")
    public ResponseEntity<?> updateMember(@RequestBody MemberDTO memberDTO, HttpSession session) {
        try {
            Member loggedInUser = (Member) session.getAttribute("loggedInUser");
            if (loggedInUser == null) {
                logger.error("No logged-in user found in session");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
            }
            
            Long mnum = loggedInUser.getMnum();
            if (mnum == null) {
                logger.error("Logged-in user's mnum is null");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User ID is missing");
            }
            
            logger.info("Logged-in user: {}", loggedInUser);  // 로그 추가
            
            MemberDTO updatedMemberDTO = memberService.updateMember(mnum, memberDTO);
            
            // 세션 업데이트 전 로그
            logger.info("Updating session with user: {}", updatedMemberDTO);
            
            session.setAttribute("loggedInUser", updatedMemberDTO.toEntity(passwordEncoder)); // 세션 업데이트
            
            // 세션 업데이트 후 로그
            logger.info("Session updated with user: {}", session.getAttribute("loggedInUser"));
            
            return ResponseEntity.ok(updatedMemberDTO);
        } catch (Exception e) {
            logger.error("Error updating member: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Server Error: " + e.getMessage());
        }
    }
        
}
