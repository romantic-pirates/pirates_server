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
            xhrFields: {
                withCredentials: true
            },
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
                if (xhr.status === 0) {
                    loginError.text('서버와의 연결에 문제가 있습니다. CORS 설정을 확인하세요.');
                } else if (xhr.status === 401) {
                    loginError.text('아이디 또는 비밀번호가 잘못되었습니다.');
                } else {
                    loginError.text('로그인에 실패했습니다.');
                }
                loginError.css('display', 'block');
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
                    type: 'POST',
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

    $('#google-login-button').on('click', function() {
        location.href = '/auth/google';
    });

    // 구글 로그인 관련 함수 추가
    window.onSignIn = function(googleUser) {
        var profile = googleUser.getBasicProfile();
        var id_token = googleUser.getAuthResponse().id_token;

        $.ajax({
            url: '/api/auth/google-login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                token: id_token
            }),
            success: function(data) {
                console.log('Google login successful:', data);

                // 로그인 성공 시 세션 데이터를 sessionStorage에 저장
                sessionStorage.setItem('loggedInUser', JSON.stringify(data));
                sessionStorage.setItem('mnick', data.mnick); // 여기서 mnick 값을 설정

                Swal.fire({
                    title: '로그인에 성공했습니다!', // Alert 제목
                    icon: 'success', // Alert 타입
                }).then(() => {
                    // 알림 표시 후 홈 페이지로 리다이렉트
                    location.href = '/';
                });
            },
            error: function(xhr) {
                console.log('Google login failed:', xhr.responseText);
            }
        });
    }

    function isLoggedIn() {
        const sessionData = sessionStorage.getItem('loggedInUser');
        return sessionData !== null;
    }

    $('.protected-feature').on('click', function(event) {
        event.preventDefault();
    
        if (!isLoggedIn()) {
            Swal.fire({
                title: '로그인 이후 사용 가능한 기능입니다.',
                icon: 'warning',
                confirmButtonText: '로그인하기'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/members/login'; // 로그인 페이지로 이동
                }
            });
        } else {
            // 로그인되어 있으면 원래의 링크로 이동
            location.href = $(this).attr('href');
        }
    });
});
