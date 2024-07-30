document.addEventListener('DOMContentLoaded', function() {
    var loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        var user = JSON.parse(loggedInUser);
        document.getElementById('user-info').textContent = 'Welcome, ' + user.username;
    } else {
        window.location.href = '/members/login';
    }
});
