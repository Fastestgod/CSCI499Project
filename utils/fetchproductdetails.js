const puppeteer = require('puppeteer');

async function fetchProductDetails(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
        console.error(`Error fetching product details: ${error.message}`);
        return { error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = fetchProductDetails;
