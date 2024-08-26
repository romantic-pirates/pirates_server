document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    
    // 버튼에서 데이터 속성 읽기
    const boardId = document.getElementById('btnDelete').getAttribute('data-board-id');

    document.getElementById('btnDelete').addEventListener('click', function(event) {
        if (!loggedInUser) {
            event.preventDefault();
            Swal.fire({
                title: '로그인 이후 사용 가능한 기능입니다.',
                icon: 'warning',
                confirmButtonText: '로그인하기'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/members/login';
                }
            });
        } else if (loggedInUser.madmin !== 'Y') {
            event.preventDefault();
            Swal.fire({
                title: '권한이 없습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        } else {
            window.location.href = `/board/delete?id=${boardId}`;
        }
    });

    document.getElementById('btnModify').addEventListener('click', function(event) {
        if (!loggedInUser) {
            event.preventDefault();
            Swal.fire({
                title: '로그인 이후 사용 가능한 기능입니다.',
                icon: 'warning',
                confirmButtonText: '로그인하기'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/members/login';
                }
            });
        } else if (loggedInUser.madmin !== 'Y') {
            event.preventDefault();
            Swal.fire({
                title: '권한이 없습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        } else {
            window.location.href = `/board/modify/${boardId}`;
        }
    });
});
