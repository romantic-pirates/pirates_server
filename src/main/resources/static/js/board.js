document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    // 글쓰기 버튼 클릭 이벤트
    document.getElementById('writeButton').addEventListener('click', function(event) {
        // 로그인 여부 확인
        if (loggedInUser == null) {
            event.preventDefault(); // 기본 동작 방지
            Swal.fire({
                title: '로그인 이후 사용 가능한 기능입니다.',
                icon: 'warning',
                confirmButtonText: '로그인하기'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/members/login'; // 로그인 페이지로 이동
                }
            });
        } else if (loggedInUser.madmin !== 'Y') {
            event.preventDefault(); // 기본 동작 방지
            Swal.fire({
                title: '권한이 없습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        } else {
            // 사용자가 로그인되어 있고 권한이 있는 경우에만 글쓰기 페이지로 이동
            location.href = '/board/write';
        }
    });
});
