const { PageEvent } = require('puppeteer');
const puppeteer = require('puppeteer');

// Function to fetch product details based on the URL
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

        // Determine which function to call based on the URL
        if (url.includes('amazon.com')) {
            return await trackAmazon(page);
        } else if (url.includes('bestbuy.com')) {
            return await trackBestBuy(page);
        } else if (url.includes("walmart.com")){
            return await trackWalmart(Page);
        }
        else{
            throw new Error('Unsupported store');
        }
    } catch (error) {
        console.error(`Error fetching product details: ${error.message}`);
        return { error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Function to fetch product details from Amazon
async function trackAmazon(page) {
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
    const store = 'Amazon';

    return { title, price, primePrice, imageUrl, store };
}

// Function to fetch product details from Best Buy
async function trackBestBuy(page) {
    const title = await page.$eval('.sku-title', el => el.innerText.trim());
    const price = await page.$eval('.priceView-hero-price.priceView-customer-price span', el => el.innerText.trim());
    const imageUrl = await page.$eval('.primary-image.max-w-full.max-h-full', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Best Buy
    const store = 'Best Buy';

    return { title, price, primePrice, imageUrl, store };
}
async function trackWalmart(page) {
    const title = await page.$eval('span[itemprop="name"][aria-hidden="false"]', element => element.innerText);
    const price = await page.$eval('span[itemprop="price"][aria-hidden="false"]', element => element.innerText);
    const imageUrl = await page.$eval('img[alt="'+ title + '"]', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Walmaer
    const store = 'walmart';
    return { title, price, primePrice, imageUrl, store };
}
module.exports = fetchProductDetails;
