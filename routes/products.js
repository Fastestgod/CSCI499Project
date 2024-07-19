const express = require('express');
const router = express.Router();
const fetchProductDetails = require('../utils/fetchProductDetails');

// Add URL to the list and fetch initial product details
router.post('/add-url', async (req, res) => {
    const url = req.body.amazonUrl;
    const products = req.app.locals.products;

    // Check if the product already exists
    if (products.some(product => product.url === url)) {
        res.send('Product already exists in the list');
        return;
    }

    try {
        const { title, price, primePrice, imageUrl, error } = await fetchProductDetails(url);
        if (error) {
            res.send(`Error fetching product details: ${error}`);
            return;
        }
        const now = new Date().toLocaleString();
        const history = [{ time: now, price, primePrice }];
        products.push({ url, title, price, primePrice, imageUrl, lastUpdated: now, history });
        res.redirect('/');
    } catch (error) {
        console.error(`Error adding URL: ${error.message}`);
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
    const product = req.app.locals.products[index];
    if (!product) {
        res.status(404).send('Product not found');
        return;
    }
    res.render('product', { product });
});

module.exports = router;
