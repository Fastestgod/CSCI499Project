const { PageEvent } = require('puppeteer');
const puppeteer = require('puppeteer');

// Function to fetch product details based on the URL
async function fetchProductDetails(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-http2']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');

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
        } else if (url.includes('nike.com')){
            return await trackNike(page);
        } else if (url.includes('costco.com')){
            return await trackCostco(page);    
        } else if (url.includes('target.com')){
            return await trackTarget(page);
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
// Function to fetch product details from Nike
async function trackNike(page) {
    const title = await page.$eval('h1#pdp_product_title', el => el.innerText.trim());
    const price = await page.$eval('div#price-container span[data-testid="currentPrice-container"]', el => el.innerText.trim());
    const imageUrl = await page.$eval('ul[data-testid="mobile-image-carousel-list"] li[data-testid="mobile-image-carousel-list-item"] img[data-testid="mobile-image-carousel-image"]', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Nike
    const store = 'Nike';

    return { title, price, primePrice, imageUrl, store };
}

// Function to fetch product details from Costco
async function trackCostco(page) {
    const title = await page.$eval('h1[automation-id="productName"]', element => element.innerText);
    const price = await page.$eval('.op-value[automation-id="onlinePriceOutput"]', element => element.innerText);
    const imageUrl = await page.$eval('.zoomImg_container img', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Costco
    const store = 'Costco';
    return { title, price, primePrice, imageUrl, store };
}

async function trackTarget(page) {
        const title = await page.$eval('h1#pdp-product-title-id', el => el.innerText.trim());
        const price = await page.$eval('.sc-32969646-0.koXXfQ span', el => el.textContent.trim());    
        const imageUrl = await page.$eval('section[data-test="@web/SiteTopOfFunnel/BaseStackedImageGallery"] img', img => img.src);
        const primePrice = price; // Assuming there is no Prime equivalent on Target
        const store = 'Target';
        return { title, price, primePrice, imageUrl, store };
    }

module.exports = fetchProductDetails;
