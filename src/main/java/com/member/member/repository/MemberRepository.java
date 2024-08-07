package com.member.member.repository;

import com.member.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByMid(String mid); // 아이디로 사용자 조회
}
