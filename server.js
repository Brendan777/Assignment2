// Importing the Express.js framework
const express = require('express');
const { readFile, writeFile, fstat } = require('fs'); // Importing file system functions

// Create an instance of the Express application called "app"
const app = express();

// Require the querystring middleware
// Used to convert JavaScript objects into a URL query string
const qs = require('querystring');

// Monitor all requests regardless of their method (GET, POST, PUT, etc) and their path (URL)
// Sends a message to the server console for troubleshooting and monitoring normal activity
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// Route all other GET requests to serve static files from a directory named "public"
app.use(express.static(__dirname + '/public'));

// Start the server, listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

const products = require(__dirname + "/products.json"); // Load product data from a JSON file

// Define a route for handling a GET request to a path that matches "./products.js"
app.get('/products.js', function(request, response, next) {
	// Send the response as JavaScript
	response.type('.js');
	
	// Create a JavaScript string (products_str) that contains data loaded from the products.json file
	// Convert the JavaScript string into a JSON string and embed it within variable products
	let products_str = `let products = ${JSON.stringify(products)};`;
	
	// Send the string in response to the GET request
	response.send(products_str);
	console.log(products_str);
});

// Add Express middleware for decoding POST data from the browser body
app.use(express.urlencoded({extended: true}));

// Add a qty_sold variable for each product
for (let i in products) {
	products.forEach((prod, i ) => {prod.qty_sold = 0});
}

// Function to parse items from POST data and remove specified items
function parse_items(POST, items_to_remove){
	let items = JSON.parse(JSON.stringify(POST));
	items_to_remove.forEach((element) => {
		if (items.hasOwnProperty(element)){
			delete items[element];
		}
	});
	return items;
}

// Function to process a purchase request
function process_purchase(POST, response) {
	let has_qty = false;

	// Create an object to store error messages for each input
	let errorObject = {};

	// Iterate through each product
	for (let i in products) {
		let qty = POST[`qty${[i]}`];
		has_qty = has_qty || (qty > 0)

		// Validate quantity using the validateQuantity function
		let errorMessages = validateQuantity(qty, products[i].qty_available);

		// Store error messages if any
		if (errorMessages.length > 0) {
			errorObject[`qty${[i]}_error`] = errorMessages.join(',');
		}
	}

	// If all input fields are empty with no errors
	if (has_qty == false && Object.keys(errorObject).length == 0) {
		// Redirect to the products page with an error parameter in the URL
		response.redirect("./products_display.html?error");
	}
	// If there are inputs and no errors
	else if (has_qty == true && Object.keys(errorObject).length == 0) {
		// Update product quantities and redirect to the invoice page with valid data in the URL
		for (let i in products) {
			let qty = POST[`qty${[i]}`];

			// Update quantity sold and available for the current product
			products[i].qty_sold += Number(qty);
			products[i].qty_available = products[i].qty_available - qty;
		}

		// Redirect to the invoice page with valid data in the URL
		response.redirect("./invoice.html?valid&" + qs.stringify(POST));
	}
	// If there are input errors (besides having no inputs)
	else if (Object.keys(errorObject).length > 0) {
		// Redirect to the products page with input error messages in the URL
		response.redirect("./products_display.html?" + qs.stringify(POST) + `&inputErr`);
	}
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    return emailRegex.test(email);
}
// Password validation
function isValidPassword(password) {
    const passwordRegex = /^[^\s]{10,16}$/;
    return passwordRegex.test(password);
}

// Confirm password validation
function doPasswordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

// Full name validation
function isValidFullName(fullName) {
    const nameRegex = /^[a-zA-Z ]{2,30}$/; 
    return nameRegex.test(fullName);
}

// Email uniqueness check (assumes 'all_users' is the object containing all user data)
function isEmailUnique(email, all_users) {
    return !all_users.hasOwnProperty(email.toLowerCase());
}

// Route for handling POST requests to "/register"
app.post("/register", function(request, response) {
	let query_requirements = ["full_name", "email", "password", "repeat_password"]
	let removal = ["full_name", "email", "password", "repeat_password", "error"]
	let POST = request.body;
	let items = parse_items(POST, removal);

	console.log(items);
	console.log(POST);

	// Check if required fields are present
	query_requirements.forEach((element) => {
		if (!POST.hasOwnProperty(element)){
			console.log("Missing Query(s)");
			response.redirect(`./register.html?error=missing_${element}&` + qs.stringify(items));
			return;
		}
	});

	  // Validate email
	  if (!isValidEmail(POST["email"])) {
        response.redirect('./register.html?error=invalid_email&' + qs.stringify(items));
        return;
    }

	  // Validate password
	  if (!isValidPassword(POST["password"])) {
        response.redirect('./register.html?error=invalid_password&' + qs.stringify(items));
        return;
    }

    // Check if passwords match
    if (!doPasswordsMatch(POST["password"], POST["repeat_password"])) {
        response.redirect('./register.html?error=password_mismatch&' + qs.stringify(items));
        return;
    }

    // Validate full name
    if (!isValidFullName(POST["full_name"])) {
        response.redirect('./register.html?error=invalid_fullname&' + qs.stringify(items));
        return;
    }

	// // Check if passwords match
	// if (POST["password"] != POST["repeat_password"]) {
	// 	response.redirect(`./register.html?error=password_missmatch&` + qs.stringify(items));
	// 	return;
	// }

	// Read user data from a JSON file
	readFile("./user_data.json", "utf8", (err, json) => {
		if (err == null) {
			console.log(json);
			all_users = JSON.parse(json);

			// If the user already exists
			if (all_users.hasOwnProperty(POST["email"].toLowerCase())) {
				response.redirect('./register.html?error=existing_email&' + qs.stringify(items));
				return;
			}
			// If the user doesn't exist
			else {
				all_users[POST["email"].toLowerCase()] = {
					name: POST["full_name"],
					password: POST["password"],
				};

				// Write the updated user data to the JSON file
				writeFile("./user_data.json", JSON.stringify(all_users, null, 2), (err) => {
					if (err) {
						console.log("User Save Error");
						response.redirect('./register.html?error=server_error&' + qs.stringify(items));
					}
				});

				// Add user's name to items and process the purchase
				items["name"] = all_users[POST["email"].toLowerCase()]["name"];
				process_purchase(items, response);
				return;

			}
		}
	});
});

// Route for handling POST requests to "/process_login"
app.post("/process_login", function(request, response) {
	let POST = request.body;
	let items = parse_items(POST, ["email", "password", "error"]);
	console.log(items);
	console.log(POST);

	// Read user data from a JSON file
	readFile("./user_data.json", "utf8", (err, json) => {
		if (err == null) {
			console.log(json);
			all_users = JSON.parse(json);

			if (all_users.hasOwnProperty(POST["email"].toLowerCase()) && all_users[POST["email"]]["password"] == POST["password"]) {
				// Add user's name to items and process the purchase
				items["name"] = all_users[POST["email"].toLowerCase()]["name"];
				process_purchase(items, response);
			}
			else {
				// Redirect to the login page with query parameters
				response.redirect("./login.html?error=incorrect_info&" + qs.stringify(items));
			}
		}
	});
});

// Route for forwarding to the register page
app.post("/forward_to_register_page", function(request, response) {
	let POST = request.body;
	console.log(POST)
	response.redirect("./register.html?" + qs.stringify(POST));
});

// Route for forwarding to the thanks page
app.post("/forward_to_thanks_page", function(request, response) {
	let POST = request.body;
	console.log(POST)
	response.redirect("./thankspage.html?" + qs.stringify(POST));
});

// Route for purchasing while logged in
app.post("/purchase_login", function(request, response) {
	let POST = request.body;
	console.log(POST)
	response.redirect("./login.html?" + qs.stringify(POST));
});

// Route for processing a purchase
app.post("/process_purchase", function(request, response) { 
	// Extract the content of the request body
	let POST = request.body;
	console.log(POST)
	process_purchase(POST, response);
});

// Function to validate quantity entered by the user against available quantity
function validateQuantity(quantity, availableQuantity) {
	let errors = [];  // Initialize an array to hold error messages

	quantity = Number(quantity); // Convert quantity to a number

	switch (true) {
		case isNaN(quantity)  || quantity === '':
			errors.push("Not a number. Please enter a non-negative quantity to order.");
			break;
		case quantity < 0 && !Number.isInteger(quantity):
			errors.push("Negative inventory and not an integer. Please enter a non-negative quantity.");
			break;
		case quantity < 0:
			errors.push("Negative inventory. Please enter a non-negative quantity to order.");
			break;
		case quantity != 0 && !Number.isInteger(quantity):
			errors.push("Not an integer. Please enter a non-negative quantity to order.");
			break;
		case quantity > availableQuantity:
			errors.push(`We do not have ${quantity} available.`);
			break;
	}
	return errors;
}
