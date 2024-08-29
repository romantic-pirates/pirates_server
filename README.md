

# 🛒 KOSMO 142기 파이널 프로젝트: 선택고민 해결사
당신의 일상 속 작은 결정들, 저희가 도와드리겠습니다!

### 💻프로젝트 개요
💬평소에 아침에는 무엇을 입을지 고민하고, 점심에는 무엇을 먹을지 고민하며,저녁에는 무엇을 볼지 고민하다 추천해주는 사이트가 있으면 좋을것 같은 생각에 개발한 웹 사이트
- [x] 🚀[프로젝트 소개](#프로젝트-소개-)
- [x] 🌟[주요 기능](#주요-기능-)
- [x] 💻[기술 스택](#기술-스택-)
- [x] 🚧[시스템 아키텍처](#시스템-아키텍처-) 
- [x] 🛠️[설치 및 실행 방법](#%EC%84%A4%EC%B9%98-%EB%B0%8F-%EC%8B%A4%ED%96%89-%EB%B0%A9%EB%B2%95)
- [x] 🤝[기여 방법](#기여-방법-)
- [x] 👥[팀원](#팀원-)

---

## 프로젝트 소개 🚀

<div align="center">

</div>

'결정에 어려움을 겪는 사람들을 위한 이 사이트'는 일상 생활에서 자주 마주치는 '뭐 입지?', '뭐 먹지?', '뭐 볼까?' 와 같은 고민들을 해결해주는 웹 애플리케이션입니다. 
Flask와 Spring Boot를 활용하여 개발된 이 프로젝트는 사용자들에게 빠르고 재미있는 방식으로 선택을 도와줍니다.

---

## 주요 기능 🌟

<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/shirt.svg" alt="옷 추천" width="200px">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/utensils.svg" alt="음식 추천" width="200px">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/film.svg" alt="콘텐츠 추천" width="200px">
</div>

```
👨‍👨‍👧 회원 : 로그인 | 회원가입 | 이메일 인증 | 소셜 로그인(네이버/구글) | 아이디 찾기 | 비밀번호 찾기 | 임시 비밀번호 발송
🏡 마이페이지 : 회원정보수정 | 회원탈퇴
📈 관리자페이지 : 공지사항 작성,수정,삭제 관리
👚 옷 추천 : 29CM 쇼핑몰의 실시간 데이터를 기반으로 인기 상품을 추천
🍽️ 음식 추천 : 취향과 위치를 고려하여 메뉴와 주변 맛집을 추천
🎬 콘텐츠 추천 : 사용자의 선호도를 분석하여 영화, TV 쇼 등 추천
```
|<small>회원가입</small>|<small>네이버 로그인<small>|<small>구글 로그인</small>|
|:-:|:-:|:-:|
|![003](flask/flask_project/templates/git_img/회원가입.gif)|![004](flask/flask_project/templates/git_img/네이버_로그인.gif)|![005](flask/flask_project/templates/git_img/구글_로그인.gif)|

---

## 기술 스택 💻
| OS | Windows10 |
|---------------|-------------------------------------|
| Language  | ![Java](https://img.shields.io/badge/java-007396?style=for-the-badge&logo=java&logoColor=white) ![Java Spring](https://img.shields.io/badge/spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Python](https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white)|
| IDE | ![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white) ![Spring Tools 4](https://img.shields.io/badge/sts4-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
| FrameWork | ![Spring Boot](https://img.shields.io/badge/spring_boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white) ![Flask](https://img.shields.io/badge/flask-000000?style=for-the-badge&logo=flask&logoColor=white) |
| Bulid Tool | ![Gradle](https://img.shields.io/badge/gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white) |
| Database | ![MySQL](https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![MongoDB](https://img.shields.io/badge/mongodb-47A248?style=for-the-badge&logo=mongodb&logoColor=white) |
| Front-end | ![HTML5](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![jQuery](https://img.shields.io/badge/jquery-0769AD?style=for-the-badge&logo=jquery&logoColor=white) |
| Library | ![Spring Security](https://img.shields.io/badge/spring_security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white) ![Thymeleaf](https://img.shields.io/badge/thymeleaf-005F0F?style=for-the-badge&logo=thymeleaf&logoColor=white) ![Redis](https://img.shields.io/badge/redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) |
| API | ![Kakao Maps API](https://img.shields.io/badge/kakao_maps_API-FFCD00?style=for-the-badge&logo=kakao&logoColor=white) ![Daum Postcode API](https://img.shields.io/badge/daum_postcode_API-003D3F?style=for-the-badge&logo=daum&logoColor=white) ![Naver Login API](https://img.shields.io/badge/naver_login_API-03C75A?style=for-the-badge&logo=naver&logoColor=white) ![Google Login API](https://img.shields.io/badge/google_login_API-4285F4?style=for-the-badge&logo=google&logoColor=white) ![TMDB API](https://img.shields.io/badge/tmdb_API-03A9F4?style=for-the-badge&logo=tmdb&logoColor=white) |
| Server | ![Apache Tomcat](https://img.shields.io/badge/apache_tomcat-F8DC75?style=for-the-badge&logo=apachetomcat&logoColor=black) |
| Version Control | ![GitHub](https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white) |
---

## 시스템 아키텍처 🚧

---

## 설치 및 실행 방법 🛠️

1. 저장소 클론
   ```bash
   git clone https://github.com/romantic-pirates/pirates-server.git
   cd pirates-server
   ```

2. 백엔드 설정
   - Flask 서버:
     ```bash
     cd flask-server
     pip install -r requirements.txt
     flask run
     ```
   - Spring Boot 서버:
     ```bash
     cd spring-server
     ./gradlew bootRun
     ```

3. 프론트엔드 설정
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. 브라우저에서 `http://localhost:3000` 접속

---

## 기여 방법 🤝

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`).
5. Pull Request를 생성합니다.

## 형상관리 방법
![https://user-images.githubusercontent.com/59078557/211580433-6fd943c3-405e-4bb8-b95e-f522fe631278.png](https://user-images.githubusercontent.com/59078557/211580433-6fd943c3-405e-4bb8-b95e-f522fe631278.png)

### 작업방식
1. 메인 저장소를 fork 해온다.
2. fork 한 Repository를 clone 한다.
3. git remote add upstream <메인 저장소 주소>를 통해 upstream 설정을 한다.
4. git fetch를 통해 최신 코드를 받아온다
5. upstream/develop 브랜치에서 feature 브랜치를 생성한다.
6. 작업 완료된 fearure 브랜치를 origin 브랜치로 push 한다.
7. 해당 브랜치를 upstream으로 PR을 올린다.
8. 코드 리뷰 진행 후 Merge를 진행한다.
---

## 팀원 👥

<div align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/users.svg" alt="팀원 소개" width="500px">
</div>

- **박제근** (팀장): 백엔드 개발 (Spring Boot)
- **김선일**: 프론트엔드 개발 (HTML, JS, CSS)
- **한상현**: 백엔드 개발 (Flask)
- **김형진**: 백엔드 개발 (Flask)
- **김동규**: 형상 관리 & 문서화 (git)

---


  
  ⚓ Developed with ❤️ by 낭만해적단 🏴‍☠️
  
  [맨 위로 올라가기](#낭만해적단-파이널-프로젝트-선택장애-해결사-)

</div>
