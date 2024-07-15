const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

// Set up EJS
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let products = [];

// Serve the homepage
app.get('/', (req, res) => {
    res.render('index');  // This will now render the index.ejs file 
});

// Add URL to the list and fetch initial product details
app.post('/add-url', async (req, res) => {
    const url = req.body.amazonUrl;
    const { title, price, primePrice, imageUrl, error } = await fetchProductDetails(url);
    if (error) {
        res.send(`Error fetching product details: ${error}`);
        return;
    }
    const now = new Date().toLocaleString();
    const history = [{ time: now, price, primePrice }];
    products.push({ url, title, price, primePrice, imageUrl, lastUpdated: now, history });
    res.redirect('/');
});

// Get the list of URLs
app.get('/get-urls', (req, res) => {
    res.json(products);
});

// Handle URL deletion
app.delete('/delete-url/:index', (req, res) => {
    const index = req.params.index;
    if (index >= 0 && index < products.length) {
        products.splice(index, 1);
        res.status(200).send();
    } else {
        res.status(404).send('Product not found');
    }
});

// Display product page with details
app.get('/product/:index', (req, res) => {
    const index = req.params.index;
    const product = products[index];
    if (!product) {
        res.status(404).send('Product not found');
        return;
    }
    res.render('product', { product });
});

async function fetchProductDetails(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const title = await page.$eval('h1 span#productTitle', el => el.innerText.trim());
        const price = await page.$eval('.a-offscreen', el => el.innerText.trim());
        const imageUrl = await page.$eval('#landingImage', img => img.src);
        const primePrice = await page.evaluate(() => {
            const primePriceElement = document.querySelector('a[data-benefit-optimization-id="PrimeExclusiveMario"] .a-size-base');
            if (primePriceElement) {
                const primePriceText = primePriceElement.innerText.trim().match(/[$]?[0-9,.]+/)[0];
                return parseFloat(primePriceText.replace(/[^0-9.-]+/g, "")).toFixed(2);
            }
            return null;
        }) || price;

        return { title, price, primePrice, imageUrl };
    } catch (error) {
        return { error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function updatePrices() {
    for (let product of products) {
        const { price, primePrice, error } = await fetchProductDetails(product.url);
        if (!error) {
            const now = new Date().toLocaleString();
            product.price = price;
            product.primePrice = primePrice;
            product.lastUpdated = now;
            product.history.push({ time: now, price, primePrice });
        }
    }
}

// Schedule the price update function to run every 15 minutes
cron.schedule('*/15 * * * *', updatePrices);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
