package com.member.entity;

import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "member")
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mnum;

    @Column(nullable = false, length = 50)
    private String mname;

    @Column(nullable = false, length = 300)
    private String mnick;

    @Column(nullable = false, length = 300, unique = true)
    private String mid;

    @Column(nullable = false, length = 300)
    private String mpw;

    @Column(nullable = false, length = 30)
    private String mbirth;

    @Column(nullable = false, length = 16)
    private String mhp;

    @Column(nullable = false, length = 1)
    private String mgender;

    @Column(nullable = false, length = 1)
    private String madmin;

    @Column(nullable = false, length = 6)
    private String mzonecode;

    @Column(length = 500)
    private String mroad;

    @Column(length = 500)
    private String mroaddetail;

    @Column(length = 500)
    private String mjibun;

    private LocalDate insertdate;
    private LocalDate updatedate;

    @PrePersist
    protected void onCreate() {
        insertdate = LocalDate.now();
        updatedate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedate = LocalDate.now();
    }

}