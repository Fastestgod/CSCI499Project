// Import necessary modules
const express = require('express');
const router = express.Router();
const fetchProductDetails = require('../utils/fetchproductdetails');

// Route to add a new URL to the products list and fetch initial product details
router.post('/add-url', async (req, res) => {
    const url = req.body.storeUrl;
    const products = req.app.locals.products;

    // Check if the product already exists in the list
    const existingProductIndex = products.findIndex(product => product.url === url);
    if (existingProductIndex !== -1) {
        res.redirect(`/products/${existingProductIndex}`);
        return;
    }

    try {
        // Fetch product details using the URL
        const { title, price, primePrice, imageUrl, store, error } = await fetchProductDetails(url);
        if (error) {
            res.redirect(`/?error=${encodeURIComponent(`Error fetching product details: ${error}`)}`);
            return;
        }

        // Add the product to the list with the current timestamp and an empty stores array
        const now = new Date().toLocaleString();
        const history = [{ time: now, price, primePrice, store }];
        products.push({ url, title, price, primePrice, imageUrl, store, lastUpdated: now, history, stores: [] });
        const newProductIndex = products.length - 1;

        // Redirect to the new product's detail page
        res.redirect(`/products/${newProductIndex}`);
    } catch (error) {
        // Handle errors and redirect with an error message
        console.error(`Error adding URL: ${error.message}`);
        res.redirect(`/?error=${encodeURIComponent('Internal Server Error')}`);
    }
});

// Route to add a store URL to an existing product
router.post('/add-store-url/:index', async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const storeUrl = req.body.storeUrl;
    const products = req.app.locals.products;
    const product = products[index];

    // Check if the product exists
    if (!product) {
        res.status(404).send('Product not found');
        return;
    }

    // Check if the store URL already exists for the product
    const storeExists = product.stores.some(store => store.url === storeUrl);
    if (storeExists) {
        res.redirect(`/products/${index}`);
        return;
    }

    try {
        // Fetch store details using the store URL
        const { price, primePrice, store, error } = await fetchProductDetails(storeUrl);
        if (error) {
            res.redirect(`/products/${index}?error=${encodeURIComponent(error)}`);
            return;
        }

        // Add the store details to the product's stores array and update the history
        const now = new Date().toLocaleString();
        product.stores.push({ url: storeUrl, price, primePrice, store, lastUpdated: now });
        product.history.push({ time: now, price, primePrice, store }); // Add store name to history

        // Redirect to the product's detail page
        res.redirect(`/products/${index}`);
    } catch (error) {
        // Handle errors and redirect with an error message
        console.error(`Error adding store URL: ${error.message}`);
        res.redirect(`/products/${index}?error=${encodeURIComponent('Internal Server Error')}`);
    }
});

// Route to get the list of products with their URLs
router.get('/get-urls', (req, res) => {
    res.json(req.app.locals.products);
});

// Route to delete a product by index
router.delete('/delete-url/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    const products = req.app.locals.products;

    // Check if the product index is valid and delete the product if found
    if (index >= 0 && index < products.length) {
        products.splice(index, 1);
        res.status(200).send();
    } else {
        res.status(404).send('Product not found');
    }
});

// Route to display the product page with details
router.get('/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    const products = req.app.locals.products;
    const product = products[index];

    // Check if the product exists and render the product page
    if (!product) {
        res.status(404).send('Product not found');
        return;
    }

    // Render the product view with product details
    res.render('product', { product, productIndex: index });
});

// Export the router module for use in the main application
module.exports = router;
