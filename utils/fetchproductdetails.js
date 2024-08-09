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
        }else if (url.includes('homedepot.com')){
            return await trackHomedepot(page);   
        }else if (url.includes('samsclub.com')){
            return await trackSamsClub(page);
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

// Function to fetch product details from Home Depot
async function trackHomedepot(page) {
    const title = await page.$eval('.product-details__badge-title--wrapper h1.sui-h4-bold', element => element.innerText);
    const dollars = await page.$eval('.price .price-format__main-price span:nth-child(2)', element => element.innerText);
    const cents = await page.$eval('.price .price-format__main-price span:nth-child(4)', element => element.innerText);
    const price = `$${dollars}.${cents}`;
    const imageUrl = await page.$eval('.mediagallery__mainimage img', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Home Depot
    const store = 'Home Depot';
    return { title, price, primePrice, imageUrl, store };
}

// Function to fetch product details from Sam's Club
async function trackSamsClub(page) {
    const title = await page.$eval('.sc-pc-title-full-desktop-row h1', el => el.innerText.trim());
    const dollars = await page.$eval('.Price-characteristic', element => element.innerText);
    const cents = await page.$eval('.Price-mantissa', element => element.innerText);
    const price = `$${dollars}.${cents}`;
    const imageUrl = await page.$eval('.sc-image-viewer-img', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Sam's Club
    const store = 'Sams Club';
    return { title, price, primePrice, imageUrl, store };
    }

module.exports = fetchProductDetails;
