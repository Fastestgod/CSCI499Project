const express = require('express');
const router = express.Router();
const fetchProductDetails = require('../utils/fetchProductDetails');

// Add URL to the list and fetch initial product details
router.post('/add-url', async (req, res) => {
    const url = req.body.storeUrl;
    const products = req.app.locals.products;

    if (products.some(product => product.url === url)) {
        res.send('Product already exists in the list');
        return;
    }

    try {
        const { title, price, primePrice, imageUrl, store, error } = await fetchProductDetails(url);
        if (error) {
            res.send(`Error fetching product details: ${error}`);
            return;
        }
        const now = new Date().toLocaleString();
        const history = [{ time: now, price, primePrice }];
        products.push({ url, title, price, primePrice, imageUrl, store, lastUpdated: now, history, stores: [] });
        res.redirect('/');
    } catch (error) {
        console.error(`Error adding URL: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

// Add a store URL to an existing product
router.post('/add-store-url/:index', async (req, res) => {
    const index = parseInt(req.params.index, 10);
    const storeUrl = req.body.storeUrl;
    const products = req.app.locals.products;
    const product = products[index];

    if (!product) {
        res.status(404).send('Product not found');
        return;
    }

    try {
        const { price, primePrice, store, error } = await fetchProductDetails(storeUrl);
        if (error) {
            res.send(`Error fetching store details: ${error}`);
            return;
        }
        const now = new Date().toLocaleString();
        product.stores.push({ url: storeUrl, price, primePrice, store, lastUpdated: now });
        res.redirect(`/products/${index}`);
    } catch (error) {
        console.error(`Error adding store URL: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

// Get the list of URLs
router.get('/get-urls', (req, res) => {
    res.json(req.app.locals.products);
});

// Handle URL deletion
router.delete('/delete-url/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    const products = req.app.locals.products;

    if (index >= 0 && index < products.length) {
        products.splice(index, 1);
        res.status(200).send();
    } else {
        res.status(404).send('Product not found');
    }
});

// Display product page with details
router.get('/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    const products = req.app.locals.products;
    const product = products[index];
    if (!product) {
        res.status(404).send('Product not found');
        return;
    }
    res.render('product', { product, productIndex: index });
});

module.exports = router;
