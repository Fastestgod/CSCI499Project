const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// Function to fetch price from a URL using axios
async function fetchPrice(url, priceSelector) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });
        const $ = cheerio.load(response.data);
        const priceElement = $(priceSelector);
        if (priceElement.length) {
            return priceElement.text().trim();
        } else {
            console.error(`Price element not found for ${url}, trying Puppeteer`);
            return await fetchPriceWithPuppeteer(url, priceSelector);
        }
    } catch (error) {
        console.error(`Failed to fetch price from ${url}, trying Puppeteer:`, error.message);
        return await fetchPriceWithPuppeteer(url, priceSelector);
    }
}

// Function to fetch price using Puppeteer
async function fetchPriceWithPuppeteer(url, priceSelector) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector(priceSelector);
    const price = await page.$eval(priceSelector, el => el.textContent.trim());
    await browser.close();
    return price;
}

// Define routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/prices', async (req, res) => {
    const dellUrl = 'https://www.dell.com/en-us/shop/cty/pdp/spd/inspiron-15-3520-laptop/';
    const dellPriceSelector = 'h3 font-weight-bold mb-1 text-nowrap sale-price'; // Adjust this selector based on the Dell website

    const sonyUrl = 'https://www.sony.com/electronics/tv/t/televisions';
    const sonyPriceSelector = '.product-price'; // Adjust this selector based on the Sony website

    const dellPrice = await fetchPrice(dellUrl, dellPriceSelector);
    const sonyPrice = await fetchPrice(sonyUrl, sonyPriceSelector);

    res.json({ dell: dellPrice, sony: sonyPrice });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


