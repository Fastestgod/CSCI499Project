const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const products = [];

function normalizeAmazonUrl(url) {
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    if (asinMatch) {
        const asin = asinMatch[1];
        return `https://www.amazon.com/dp/${asin}`;
    }
    return url;
}

function fetchProductDetails(url) {
    // Mock implementation of product details fetching
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                url,
                title: 'Sample Product Title',
                imageUrl: 'https://via.placeholder.com/150',
                price: '$19.99',
                primePrice: '$18.99',
                lastUpdated: new Date().toLocaleString(),
                history: [
                    { time: new Date().toLocaleString(), price: '$19.99', primePrice: '$18.99' },
                ]
            });
        }, 1000);
    });
}

router.get('/get-urls', (req, res) => {
    res.json(products);
});

router.post('/add-url', (req, res) => {
    const amazonUrl = req.body.amazonUrl;
    const normalizedUrl = normalizeAmazonUrl(amazonUrl);

    fetchProductDetails(normalizedUrl)
        .then(product => {
            const existingProduct = products.find(p => p.url === normalizedUrl);
            if (existingProduct) {
                return res.status(400).send('Product is already tracked');
            }
            products.push(product);
            res.redirect('/');
        })
        .catch(err => {
            console.error('Error fetching product details:', err);
            res.status(500).send('Error adding product');
        });
});

router.delete('/delete-url/:index', (req, res) => {
    const index = req.params.index;
    if (index >= 0 && index < products.length) {
        products.splice(index, 1);
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
