// Wait for the window to load
window.onload = function () {
    // Check if there are any URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    const errorDoc = document.getElementById('error');
    const errorParam = urlParams.get('error');

    if (errorParam != null) {
        errorDoc.innerHTML += "Registration error " + errorParam.replace("_", " ");
    }


    // Get a reference to an HTML container element with the id 'hiddenFields'
    let hiddenFieldsContainer = document.getElementById('hiddenFields');

    // Loop through each URL parameter (query parameter)
    urlParams.forEach((value, key) => {
        // Create a new hidden input element
        let hiddenInput = document.createElement('input');

        // Set the input element's type to 'hidden'
        hiddenInput.setAttribute('type', 'hidden');

        // Set the input element's name attribute to the parameter key
        hiddenInput.setAttribute('name', key);

        // Set the input element's value attribute to the parameter value
        hiddenInput.setAttribute('value', value);

        // Append the hidden input element to the 'hiddenFields' container
        hiddenFieldsContainer.appendChild(hiddenInput);
    });
};
