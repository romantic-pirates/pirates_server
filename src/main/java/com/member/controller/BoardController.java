package com.member.controller;

import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.member.entity.Board;
import com.member.service.BoardService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.PostMapping;



@Controller
public class BoardController {

    @Autowired
    private BoardService boardService;

    @GetMapping("/board/write")
    public String boardwriteForm() {

        return "board/boardwrite";
    }
    
   
    @PostMapping("/board/writepro")
        public String boardWritePro(Board board, @RequestParam("file") MultipartFile file, RedirectAttributes redirectAttributes) throws Exception {

        if (board.getTitle() == null || board.getTitle().trim().isEmpty() ||
            board.getContent() == null || board.getContent().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("message", "글을 작성해주세요.");
            return "redirect:/board/write";
        }

        boardService.write(board, file);

        redirectAttributes.addFlashAttribute("message", "글작성이 완료되었습니다.");
        return "redirect:/board/list";
    }

    @GetMapping("/board/list")
    public String boardList(Model model, @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                         @RequestParam(value = "searchKeyword", required = false) 
                                         String searchKeyword) {

        Page<Board> list = null;
        
        if(searchKeyword == null) {
            list = boardService.boardList(pageable);
        }else {
            list = boardService.boardSearchList(searchKeyword, pageable);
        }

        int nowPage = list.getPageable().getPageNumber() +1;
        int startPage = Math.max(nowPage -4, 1);
        int endPage = Math.min(nowPage +5, list.getTotalPages());

        model.addAttribute("list", list);
        model.addAttribute("nowPage", nowPage);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);

        return "board/boardlist";
    }
    
    @GetMapping("/board/view")
    public String boardView(Model model, @RequestParam(name = "id") Integer id, 
                                         @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
                                         HttpServletRequest request, 
                                         HttpServletResponse response) {

        Board board = boardService.boardView(id);

         // 조회수 증가 로직 추가
        boardService.viewCountValidation(board, request, response);

        System.out.println("Search Keyword: " + searchKeyword); // 추가

        model.addAttribute("board", board);
        model.addAttribute("searchKeyword", searchKeyword); // 검색어를 모델에 추가

        return "board/boardview";
    }
    
    @GetMapping("/board/delete")
    public String boardDelete(@RequestParam(name = "id") Integer id) {
        
        boardService.boardDelete(id);

        return "redirect:/board/list";
    }

    @GetMapping("/board/modify/{id}")
    public String boardModify(@PathVariable("id") Integer id, Model model) {

        model.addAttribute("board", boardService.boardView(id));

        return "board/boardmodify";
    }
    
    @PostMapping("/board/update/{id}")
    public String boardUpdate(@PathVariable("id") Integer id, Board board, @RequestParam("file") MultipartFile file, RedirectAttributes redirectAttributes) throws Exception {

        Board boardTemp = boardService.boardView(id);
        boardTemp.setTitle(board.getTitle());
        boardTemp.setContent(board.getContent());

        boardService.write(boardTemp, file);

        redirectAttributes.addFlashAttribute("message", "수정이 완료되었습니다.");
        return "redirect:/board/list";
    }
    
}