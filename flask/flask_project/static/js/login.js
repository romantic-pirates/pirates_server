$(document).ready(function() {
    // 전역 변수로 전달된 mnick 값을 사용
    let storedMnick = sessionStorage.getItem('mnick');
    
    // storedMnick 값이 없으면 서버에서 가져옴
    if (!storedMnick) {
        storedMnick = mnick; // Flask에서 전달된 mnick 값을 사용
        if (storedMnick) {
            $.ajax({
                url: '/update_session', // 서버에서 이 경로를 처리하도록 설정해야 합니다.
                type: 'POST',
                data: JSON.stringify({ mnick: storedMnick }),
                contentType: 'application/json',
                success: function(response) {
                    console.log('Session updated successfully');
                    sessionStorage.setItem('mnick', storedMnick);
                    updateHeader(); // 세션이 업데이트된 후 헤더 업데이트
                },
                error: function(xhr) {
                    console.log('Failed to update session:', xhr.responseText);
                }
            });
        }
    } else {
        // 헤더 업데이트
        updateHeader();
    }

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
                sessionStorage.removeItem('loggedInUser');
                sessionStorage.removeItem('mnick');
                window.location.href = 'http://localhost:8080/members/logout';
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
        console.log("toggleProfilePanel called");
        var panel = document.getElementById('profile-panel');
        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }
});
