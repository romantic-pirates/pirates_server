$(document).ready(function() {
    const loginForm = $('#login_form');
    const loginError = $('#login_error');
    const rememberMeCheckbox = $('#rememberMe');

    // 페이지 로드 시 쿠키에서 아이디 불러오기
    const savedUsername = getCookie('savedUsername');
    if (savedUsername) {
        $('#username').val(savedUsername);
        rememberMeCheckbox.prop('checked', true);
    }

    loginForm.on('submit', function(event) {
        event.preventDefault(); // 기본 폼 제출 방지

        const username = $('#username').val();
        const password = $('#password').val();

        console.log('Submitting login form:', { username, password });

        $.ajax({
            url: '/api/members/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                mid: username,
                mpw: password
            }),
            success: function(data) {
                console.log('Login successful:', data);

                // 로그인 성공 시 세션 데이터를 sessionStorage에 저장
                sessionStorage.setItem('loggedInUser', JSON.stringify(data));
                sessionStorage.setItem('mnick', data.mnick); // 여기서 mnick 값을 설정

                if (rememberMeCheckbox.is(':checked')) {
                    setCookie('savedUsername', username, 30); // 30일 동안 저장
                } else {
                    deleteCookie('savedUsername');
                }
                
                Swal.fire({
                    title: '로그인에 성공했습니다!', // Alert 제목
                    icon: 'success', // Alert 타입
                }).then(() => {
                    // 알림 표시 후 홈 페이지로 리다이렉트
                    location.href = '/';
                });
            },
            error: function(xhr) {
                // 로그인 실패 시 오류 메시지 표시
                loginError.css('display', 'block');
                loginError.text('아이디 또는 비밀번호가 잘못되었습니다.');
                console.log('Login failed:', xhr.responseText);
            }
        });
    });

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
                    url: '/members/logout',
                    type: 'GET',
                    success: function() {
                        // 로그아웃 성공 시 세션 스토리지 비우기
                        sessionStorage.removeItem('loggedInUser');
                        sessionStorage.removeItem('mnick');
                        location.href = '/'; // 홈 페이지로 리다이렉트
                    },
                    error: function(xhr) {
                        console.log('Logout failed:', xhr.responseText);
                    }
                });
            }
        });
    });

    function toggleProfilePanel() {
        var panel = document.getElementById('profile-panel');
        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }

    updateHeader();

    function updateHeader() {
        const mnick = sessionStorage.getItem('mnick');
        if (mnick) {
            $('#login-link').hide();
            $('#logout-link').show();
            $('#logout_user_greeting').text(`환영합니다, ${mnick}님`);
        } else {
            $('#login-link').show();
            $('#logout-link').hide();
            $('#login_user_greeting').text('로그인/회원가입');
        }
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
    }
});
