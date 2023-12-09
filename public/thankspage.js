// On load, if there is no 'valid' key, redirect the user back to the Home page
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = document.getElementById('username');

    username.innerHTML = urlParams.get('name');
}
