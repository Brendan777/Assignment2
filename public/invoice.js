// Get the URL parameters using the URLSearchParams API
let params = (new URL(document.location)).searchParams;

// On load, if there is no 'valid' key, redirect the user back to the Home page
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    let hiddenFieldsContainer = document.getElementById('hiddenFields');

    urlParams.forEach((value, key) => {
        let hiddenInput = document.createElement('input');
        hiddenInput.setAttribute('type', 'hidden');
        hiddenInput.setAttribute('name', key);
        hiddenInput.setAttribute('value', value);
        hiddenFieldsContainer.appendChild(hiddenInput);
    });
    
    if (!params.has('valid')) {
        // Display an error message and a link to return to the Home page
        document.write(`
            <head>
                <link rel="stylesheet" href="style.css">
            </head>
            <body style="text-align: center; margin-top: 10%;">
                <h2>ERROR: No form submission detected.</h2>
                <h4>Return to <a href="index.html">Home</a></h4> 
            </body>
        `)
    }
}

// Initialize a variable to store the subtotal
let subtotal = 0;

// Create an array to store quantities based on URL parameters
let qty = [];
for (let i in products) {
    qty.push(params.get(`qty${i}`));
}

// Loop through quantities and calculate extended prices
for (let i in qty) {
    if (qty[i] == 0 || qty[i] == '') continue;

    // Calculate extended price for each product
    extended_price = (params.get(`qty${i}`) * products[i].price).toFixed(2);
    subtotal += Number(extended_price);

    // Populate the invoice table with product details and extended prices
    document.querySelector('#invoice_table').innerHTML += `
        <tr style="border: none;">
            <td width="10%"><img src="${products[i].image}" alt="${products[i].alt}" style="border-radius: 5px; width: 50px; height: auto;"></td>
            <td>${products[i].name}</td>
            <td>${qty[i]}</td>
            <td>${products[i].qty_available}</td>
            <td>$${products[i].price.toFixed(2)}</td>
            <td>$${extended_price}</td>
        </tr>
    `;
}

// Calculate sales tax based on the subtotal
let tax_rate = (4.2 / 100);
let tax_amt = subtotal * tax_rate;

// Calculate shipping based on the subtotal
let shipping;
let shipping_display;
let total;

if (subtotal < 300) {
    shipping = 15;
    shipping_display = `$${shipping.toFixed(2)}`;
    total = Number(tax_amt + subtotal + shipping);
} else {
    shipping = 0;
    shipping_display = 'FREE';
    total = Number(tax_amt + subtotal + shipping);
}

// Populate the total section of the invoice
document.querySelector('#total_display').innerHTML += `
    <tr style="border-top: 2px solid black;">
        <td colspan="5" style="text-align:center;">Sub-total</td>
        <td>$${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align:center;">Tax @ ${Number(tax_rate) * 100}%</td>
        <td>$${tax_amt.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align:center;">Shipping</td>
        <td>${shipping_display}</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align:center;"><b>Total</td>
        <td><b>$${total.toFixed(2)}</td>
    </tr>
`;
