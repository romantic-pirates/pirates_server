package com.member.service;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.member.dto.MemberDTO;
import com.member.entity.Member;
import com.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
@Transactional
public class MemberService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public void saveMember(MemberDTO memberDTO) {
        // 비밀번호 암호화
        if (memberDTO.getMadmin() == null || memberDTO.getMadmin().isEmpty()) {
            memberDTO.setMadmin("N");
        }
        Member member = memberDTO.toEntity(passwordEncoder);
        memberRepository.save(member);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberRepository.findByMid(username);
        if (member == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return User.withUsername(member.getMid())
                   .password(member.getMpw())
                   .roles("USER")
                   .build();
    }

    public Member findByUsername(String username) {
        return memberRepository.findByMid(username);
    }

    public Member findByUsernameAndPassword(String username, String password) {
        Member member = memberRepository.findByMid(username); // 사용자 아이디로 조회
        if (member != null && passwordEncoder.matches(password, member.getMpw())) {
            return member; // 비밀번호가 일치하면 사용자 반환
        }
        return null; // 일치하지 않으면 null 반환
    }

    public MemberDTO updateMember(Long mnum, MemberDTO memberDTO) {
        Member existingMember = memberRepository.findById(mnum).orElse(null);
        if (existingMember == null) {
            throw new UsernameNotFoundException("Member not found");
        }
    
        existingMember.setMname(memberDTO.getMname());
        existingMember.setMnick(memberDTO.getMnick());
        existingMember.setMbirth(memberDTO.getMbirth());
        existingMember.setMhp(memberDTO.getMhp());
        existingMember.setMgender(memberDTO.getMgender());
        existingMember.setMzonecode(memberDTO.getMzonecode());
        existingMember.setMroad(memberDTO.getMroad());
        existingMember.setMroaddetail(memberDTO.getMroaddetail());
        existingMember.setMjibun(memberDTO.getMjibun());
        
        memberRepository.save(existingMember);
        return MemberDTO.fromEntity(existingMember);
    }

    public void deleteMember(Long mnum) {
        memberRepository.deleteById(mnum);
    }

    public boolean usernameExists(String username) {
        return memberRepository.findByMid(username) != null;
    }
    
    public void changePassword(String username, String currentPassword, String newPassword) throws Exception {
        Member member = memberRepository.findByMid(username);
        if (member == null) {
            throw new UsernameNotFoundException("User not found");
        }

        if (!passwordEncoder.matches(currentPassword, member.getMpw())) {
            throw new Exception("Current password is incorrect");
        }

        member.setMpw(passwordEncoder.encode(newPassword));
        memberRepository.save(member);
    }


    public void updatePassword(String username, String newPassword) {
        Member member = memberRepository.findByMid(username);
        if (member != null) {
            member.setMpw(passwordEncoder.encode(newPassword));
            memberRepository.save(member);
        }
    }
}
