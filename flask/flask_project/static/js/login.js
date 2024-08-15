$(document).ready(function() {
    // 전역 변수로 전달된 mnick 값을 사용
    if (mnick && mnick !== "") {
        sessionStorage.setItem('mnick', mnick);
    }

    // 헤더 업데이트
    updateHeader();

    // 로그아웃 처리
    $('#logout-link').on('click', function(event) {
        event.preventDefault(); // 기본 링크 동작 방지
        toggleProfilePanel();
    });

    $('#logout-button').on('click', function(event) {
        event.preventDefault(); // 기본 버튼 동작 방지
        Swal.fire({
            title: '로그아웃 하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/logout',  // Flask의 로그아웃 라우트로 전송
                    type: 'POST',
                    success: function() {
                        // 로그아웃 성공 시 세션 스토리지 비우기
                        sessionStorage.removeItem('loggedInUser');
                        sessionStorage.removeItem('mnick');
                        location.href = 'http://localhost:8080/'; // 홈 페이지로 리다이렉트
                    },
                    error: function(xhr) {
                        console.log('Logout failed:', xhr.responseText);
                    }
                });
            }
        });
    });

    function updateHeader() {
        const storedMnick = sessionStorage.getItem('mnick');
        if (storedMnick) {
            $('#login-link').hide();
            $('#logout-link').show();
            $('#logout_user_greeting').text(`환영합니다, ${storedMnick}님`);
        } else {
            $('#login-link').show();
            $('#logout-link').hide();
            $('#login_user_greeting').text('로그인/회원가입');
        }
    }

    function toggleProfilePanel() {
        var panel = document.getElementById('profile-panel');
        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }
});
