// On load, if there is no 'valid' key, redirect the user back to the Home page
// window.onload = function() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const username = document.getElementById('username');

//     username.innerHTML = urlParams.get('name');
// }



window.onload = function () {
    // Check if there are any URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const errorDoc = document.getElementById('error');
    const errorParam = urlParams.get('error');

    if (errorParam != null) {
        errorDoc.innerHTML += "Login error " + errorParam.replace("_", " ");
        // if (errorParam == "incorrect_info") {
        //     errorDoc.innerHTML = "Incorrect Login Information";
        // }
        // else {
        //     errorDoc.innerHTML = "Login Error";
        // }
    }

    let hiddenFieldsContainer = document.getElementById('hiddenFields');
    let hiddenFieldsContainer2 = document.getElementById('hiddenFields2');

    urlParams.forEach((value, key) => {
        let hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', key);
        hiddenInput.setAttribute('value', value);
        hiddenFieldsContainer.appendChild(hiddenInput);
    });

    urlParams.forEach((value, key) => {
        let hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', key);
        hiddenInput.setAttribute('value', value);
        hiddenFieldsContainer2.appendChild(hiddenInput);
    });
    
    // Display login error message if it exists in the URL
    if (urlParams.has('loginError')) {
        const loginError = urlParams.get('loginError');
        displayErrorMessage(loginError);
    }

    // Check if there is a sticky email address
    const stickyEmail = sessionStorage.getItem('stickyEmail');

    // If there is a sticky email, populate the email input field
    if (stickyEmail) {
        document.getElementById('email').value = stickyEmail;
    }
};

// Function to display an error message
function displayErrorMessage(message) {
    // Create a new div element for the error message
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('alert', 'alert-danger');
    errorDiv.textContent = message;

    // Append the error message to the login container
    const loginContainer = document.querySelector('.login-container');
    loginContainer.appendChild(errorDiv);

    // Check if the error message indicates no account found
    if (message.toLowerCase().includes('No account found')) {
        // Redirect back to the login page after a brief delay
        setTimeout(function () {
            window.location.href = 'login.html';
        }, 3000); // Redirect after 3 seconds (adjust as needed)
    }
}
