package com.member.dto;

import java.time.LocalDate;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.member.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberDTO {
    private Long mnum;
    private String mname;
    private String mnick;
    private String mid;
    private String mpw;
    private String mbirth;
    private String mhp;
    private String mgender;
    private String madmin;
    private String mzonecode;
    private String mroad;
    private String mroaddetail;
    private String mjibun;
    private LocalDate insertdate;
    private LocalDate updatedate;
    private String deleteyn;

    public Member toEntity(PasswordEncoder passwordEncoder) {
        return Member.builder()
            .mname(this.mname)
            .mnick(this.mnick)
            .mid(this.mid)
            .mpw(passwordEncoder.encode(this.mpw))
            .mbirth(this.mbirth)
            .mhp(this.mhp)
            .mgender(this.mgender)
            .madmin(this.madmin)
            .mzonecode(this.mzonecode)
            .mroad(this.mroad)
            .mroaddetail(this.mroaddetail)
            .mjibun(this.mjibun)
            .insertdate(this.insertdate)
            .updatedate(this.updatedate)
            .deleteyn(this.deleteyn)
            .build();
    }

    public static MemberDTO fromEntity(Member member) {
        return MemberDTO.builder()
            .mnum(member.getMnum())
            .mname(member.getMname())
            .mnick(member.getMnick())
            .mid(member.getMid())
            .mpw(member.getMpw())
            .mbirth(member.getMbirth())
            .mhp(member.getMhp())
            .mgender(member.getMgender())
            .madmin(member.getMadmin())
            .mzonecode(member.getMzonecode())
            .mroad(member.getMroad())
            .mroaddetail(member.getMroaddetail())
            .mjibun(member.getMjibun())
            .insertdate(member.getInsertdate())
            .updatedate(member.getUpdatedate())
            .deleteyn(member.getDeleteyn())
            .build();
    }
}
