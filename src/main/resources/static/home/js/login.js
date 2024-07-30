

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var form = event.target;
    var formData = new FormData(form);
    var jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    var csrfToken = document.querySelector('meta[name="_csrf"]').content;
    var csrfHeader = document.querySelector('meta[name="_csrf_header"]').content;

    fetch('/members/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // CSRF 토큰 추가
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error); });
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('loggedInUser', JSON.stringify(data));
        window.location.href = '/home';
    })
    .catch(error => {
        console.error('There was a problem with the login request:', error);
        alert('Invalid username or password');
    });
});
