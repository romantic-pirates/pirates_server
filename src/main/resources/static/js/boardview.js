document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    
    // 버튼에서 데이터 속성 읽기
    const boardId = document.getElementById('btnDelete').getAttribute('data-board-id');

    document.getElementById('btnDelete').addEventListener('click', function(event) {
        event.preventDefault(); // 기본 이벤트 막기

        if (!loggedInUser) {
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
            Swal.fire({
                title: '권한이 없습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        } else {
            // SweetAlert2로 삭제 확인 팝업 띄우기
            Swal.fire({
                title: '정말로 삭제하시겠습니까?',
                text: "이 작업은 되돌릴 수 없습니다!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '예',
                cancelButtonText: '아니오'
            }).then((result) => {
                if (result.isConfirmed) {
                    // 확인을 누르면 삭제 요청 보내기
                    window.location.href = `/board/delete?id=${boardId}`;
                }
            });
        }
    });

    document.getElementById('btnModify').addEventListener('click', function(event) {
        event.preventDefault(); // 기본 이벤트 막기

        if (!loggedInUser) {
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
            Swal.fire({
                title: '권한이 없습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        } else {
            // 수정 요청 보내기
            window.location.href = `/board/modify/${boardId}`;
        }
    });
});
