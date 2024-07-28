package com.member.member.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mnum;
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
}
