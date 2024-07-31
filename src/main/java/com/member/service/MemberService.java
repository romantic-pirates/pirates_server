package com.member.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.member.dto.MemberDTO;
import com.member.entity.Member;
import com.member.repository.MemberRepository;

@Service
@Transactional
public class MemberService implements UserDetailsService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        Member member = memberRepository.findByMid(username); // mid로 사용자 조회
        if (member == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(member.getMid())
                .password(member.getMpw())
                .roles("USER") // 필요한 권한 설정
                .build();
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

        Member updatedMember = memberDTO.toEntity(passwordEncoder).toBuilder()
                .mnum(existingMember.getMnum())
                .insertdate(existingMember.getInsertdate())
                .build();
        memberRepository.save(updatedMember);
        return MemberDTO.fromEntity(updatedMember); 
    }

    public void deleteMember(Long mnum) {
        memberRepository.deleteById(mnum);
    }
}
