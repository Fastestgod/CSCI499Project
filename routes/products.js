// Import necessary modules
const express = require('express');
const router = express.Router();
const fetchProductDetails = require('../utils/fetchproductdetails'); // Import the function to fetch product details

// Route to add a new URL to the products list and fetch initial product details
router.post('/add-url', async (req, res) => {
    const url = req.body.storeUrl; // Get the URL from the request body
    const products = req.app.locals.products; // Access the products list stored in the application

    // Check if the product already exists in the list
    const existingProductIndex = products.findIndex(product => product.url === url);
    if (existingProductIndex !== -1) {
        // If the product exists, redirect to its detail page
        res.redirect(`/products/${existingProductIndex}`);
        return;
    }

    try {
        // Fetch product details using the provided URL
        const { title, price, primePrice, imageUrl, store, error } = await fetchProductDetails(url);
        if (error) {
            // If there's an error fetching the details, redirect with an error message
            res.redirect(`/?error=${encodeURIComponent(`Error fetching product details: ${error}`)}`);
            return;
        }

        // Add the product to the list with the current timestamp and an empty stores array
        const now = new Date().toLocaleString(); // Get the current date and time
        const history = [{ time: now, price, primePrice, store }]; // Create an initial history entry
        products.push({ url, title, price, primePrice, imageUrl, store, lastUpdated: now, history, stores: [] });
        const newProductIndex = products.length - 1; // Get the index of the new product

        // Redirect to the new product's detail page
        res.redirect(`/products/${newProductIndex}`);
    } catch (error) {
        // Handle errors and redirect with a generic error message
        console.error(`Error adding URL: ${error.message}`);
        res.redirect(`/?error=${encodeURIComponent('Internal Server Error')}`);
    }
});

// Route to add a store URL to an existing product
router.post('/add-store-url/:index', async (req, res) => {
    const index = parseInt(req.params.index, 10); // Get the product index from the route parameters
    const storeUrl = req.body.storeUrl; // Get the store URL from the request body
    const products = req.app.locals.products; // Access the products list
    const product = products[index]; // Get the product by index

    // Check if the product exists
    if (!product) {
        res.status(404).send('Product not found'); // Send a 404 error if not found
        return;
    }

    // Check if the store URL already exists for the product
    const storeExists = product.stores.some(store => store.url === storeUrl);
    if (storeExists) {
        // If the store already exists, redirect to the product's detail page
        res.redirect(`/products/${index}`);
        return;
    }

    try {
        // Fetch store details using the provided store URL
        const { price, primePrice, store, error } = await fetchProductDetails(storeUrl);
        if (error) {
            // If there's an error fetching the details, redirect with an error message
            res.redirect(`/products/${index}?error=${encodeURIComponent(error)}`);
            return;
        }

        // Add the store details to the product's stores array and update the history
        const now = new Date().toLocaleString(); // Get the current date and time
        product.stores.push({ url: storeUrl, price, primePrice, store, lastUpdated: now }); // Add the new store to the product
        product.history.push({ time: now, price, primePrice, store }); // Add an entry to the product's history

        // Redirect to the product's detail page
        res.redirect(`/products/${index}`);
    } catch (error) {
        // Handle errors and redirect with a generic error message
        console.error(`Error adding store URL: ${error.message}`);
        res.redirect(`/products/${index}?error=${encodeURIComponent('Internal Server Error')}`);
    }
});

// Route to get the list of products with their URLs
router.get('/get-urls', (req, res) => {
    // Respond with the list of products in JSON format
    res.json(req.app.locals.products);
});

// Route to delete a product by index
router.delete('/delete-url/:index', (req, res) => {
    const index = parseInt(req.params.index, 10); // Get the product index from the route parameters
    const products = req.app.locals.products; // Access the products list

    // Check if the product index is valid and delete the product if found
    if (index >= 0 && index < products.length) {
        products.splice(index, 1); // Remove the product from the list
        res.status(200).send(); // Send a success status
    } else {
        res.status(404).send('Product not found'); // Send a 404 error if not found
    }
});

// Route to display the product page with details
router.get('/:index', (req, res) => {
    const index = parseInt(req.params.index, 10); // Get the product index from the route parameters
    const products = req.app.locals.products; // Access the products list
    const product = products[index]; // Get the product by index

    // Check if the product exists and render the product page
    if (!product) {
        res.status(404).send('Product not found'); // Send a 404 error if not found
        return;
    }

    // Render the product view with product details and pass the product and its index to the view
    res.render('product', { product, productIndex: index });
});

// Export the router module for use in the main application
module.exports = router;
