const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let products = [];

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

// Display product page with details
app.get('/product/:index', (req, res) => {
    const index = req.params.index;
    const product = products[index];
    if (!product) {
        res.status(404).send('Product not found');
        return;
    }
    const historyHtml = product.history.map(entry => `
        <li>
            Time: ${entry.time}, Price: ${entry.price}, Prime Price: ${entry.primePrice}
        </li>`).join('');
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Product Details</title>
        </head>
        <body>
            <h1>Product Details</h1>
            <p>Title: ${product.title}</p>
            <p>URL: <a href="${product.url}" target="_blank">${product.url}</a></p>
            <p>Price: ${product.price}</p>
            <p>Prime Price: ${product.primePrice}</p>
            <p>Last Updated: ${product.lastUpdated}</p>
            <img src="${product.imageUrl}" alt="Product Image">
            <h2>Price History</h2>
            <ul>${historyHtml}</ul>
            <a href="/">Back to Home</a>
        </body>
        </html>
    `);
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

// Client-side JavaScript included below to be sent as part of the HTML response
const clientJs = `
document.addEventListener('DOMContentLoaded', () => {
    fetchUrls();

    async function fetchUrls() {
        const response = await fetch('/get-urls');
        const products = await response.json();
        updateProductList(products);
    }

    function updateProductList(products) {
        const urlList = document.getElementById('urlList');
        urlList.innerHTML = '';
        products.forEach((product, index) => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = \`/product/\${index}\`;
            link.innerText = product.title;
            listItem.appendChild(link);
            urlList.appendChild(listItem);
        });
    }
});
`;

// Middleware to serve the client-side JavaScript
app.get('/index.js', (req, res) => {
    res.type('application/javascript');
    res.send(clientJs);
});
