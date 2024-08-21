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
import lombok.Data;

@Entity
@Data
@Table(name = "board")
public class Board {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 30)
    private String title;

    @Column(nullable = false, length = 3000)
    private String content;

    @Column(length = 250)
    private String filename;

    @Column(length = 250)
    private String filepath;

    @Column(nullable = false)
    private int viewCount; // 조회수 필드 추가

    public void addViewCount() {
        this.viewCount++; // 조회수 증가 메서드 추가
    }

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
