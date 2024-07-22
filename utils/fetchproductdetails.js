const puppeteer = require('puppeteer');

async function fetchProductDetails(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });
        const page = await browser.newPage();

        // Disable images and CSS to speed up page load
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet') {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        let title, price, imageUrl, primePrice, store;

        if (url.includes('amazon.com')) {
            title = await page.$eval('h1 span#productTitle', el => el.innerText.trim());
            price = await page.$eval('.a-offscreen', el => el.innerText.trim());
            imageUrl = await page.$eval('#landingImage', img => img.src);
            primePrice = await page.evaluate(() => {
                const primePriceElement = document.querySelector('a[data-benefit-optimization-id="PrimeExclusiveMario"] .a-size-base');
                if (primePriceElement) {
                    const primePriceText = primePriceElement.innerText.trim().match(/[$]?[0-9,.]+/)[0];
                    return parseFloat(primePriceText.replace(/[^0-9.-]+/g, "")).toFixed(2);
                }
                return null;
            }) || price;
            store = 'Amazon';
        } else if (url.includes('bestbuy.com')) {
            title = await page.$eval('h1.heading-5.v-fw-regular', el => el.innerText.trim());
            price = await page.$eval('.priceView-hero-price.priceView-customer-price span', el => el.innerText.trim());
            imageUrl = await page.$eval('.primary-image.max-w-full.max-h-full', img => img.src);
            primePrice = price; // Assuming there is no Prime equivalent on Best Buy
            store = 'Best Buy';
        } else {
            throw new Error('Unsupported store');
        }

        return { title, price, primePrice, imageUrl, store };
    } catch (error) {
        console.error(`Error fetching product details: ${error.message}`);
        return { error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = fetchProductDetails;
