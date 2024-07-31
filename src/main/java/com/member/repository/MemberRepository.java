package com.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByMid(String mid); // 아이디로 사용자 조회
}
