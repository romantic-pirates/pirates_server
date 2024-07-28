package com.member.member.service;

import com.member.member.entity.Member;
import com.member.member.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MemberService implements UserDetailsService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void saveMember(Member member) {
        // 비밀번호 암호화
        member.setMpw(passwordEncoder.encode(member.getMpw()));
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
}
