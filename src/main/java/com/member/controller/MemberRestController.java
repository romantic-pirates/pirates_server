package com.member.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.member.dto.MemberDTO;
import com.member.entity.Member;
import com.member.service.MemberService;

@RestController
@RequestMapping("/api/members")
public class MemberRestController {

    @Autowired
    private MemberService memberService;

    @PostMapping("/register")
    public ResponseEntity<MemberDTO> registerMember(@RequestBody MemberDTO memberDTO) {
        memberService.saveMember(memberDTO);
        return ResponseEntity.ok(memberDTO);
    }

    @GetMapping("/{username}")
    public ResponseEntity<MemberDTO> getMemberByUsername(@PathVariable String username) {
        Member member = (Member) memberService.loadUserByUsername(username);
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
}
