package com.member.service;

import java.io.File;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.member.entity.Board;
import com.member.repository.BoardRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class BoardService {
    
    @Autowired
    private BoardRepository boardRepository;

    // 글작성 처리
    public void write(Board board, MultipartFile file) throws Exception{
        
        String projectPath = System.getProperty("user.dir") + "\\src\\main\\resources\\static\\files";

        UUID uuid = UUID.randomUUID();

        String fileName = uuid + "_" + file.getOriginalFilename();

        File saveFile = new File(projectPath, fileName);

        file.transferTo(saveFile);

        board.setFilename(fileName);
        board.setFilepath("/files/" + fileName);

        boardRepository.save(board);
    }

    //게시글 리스트처리
    public Page<Board> boardList(Pageable pageable) {

         return boardRepository.findAll(pageable);

    }

    //검색기능
    public Page<Board> boardSearchList(String searchKeyword, Pageable pageable) {

        return boardRepository.findByTitleContaining(searchKeyword, pageable);
    }

    // 특정게시글 불러오기
    public Board boardView(Integer id) {

        return boardRepository.findById(id).get();
    }

    // 특정 게시글 삭제
    public void boardDelete(Integer id) {

        boardRepository.deleteById(id);
    }

    // 조회수 중복 증가 방지 로직 추가
    public void viewCountValidation(Board board, HttpServletRequest request, HttpServletResponse response) {
        // 쿠키에서 조회 기록 확인
        boolean isCookiePresent = false;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("postView_" + board.getId())) {
                    isCookiePresent = true;
                    break;
                }
            }
        }
        // 조회 기록이 없다면 조회수 증가 및 쿠키 생성
        if (!isCookiePresent) {
            board.addViewCount(); // 조회수 증가
            boardRepository.save(board); // 변경 사항 저장

            // 쿠키 생성 및 응답에 추가
            Cookie newCookie = new Cookie("postView_" + board.getId(), "viewed");
            newCookie.setMaxAge(60 * 60 * 24); // 쿠키 유효기간을 1일로 설정
            newCookie.setHttpOnly(true); // 보안 설정
            response.addCookie(newCookie);
        }
    }
}
