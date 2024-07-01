const puppeteer = require('puppeteer');

const url = 'https://www.amazon.com/Sony-Noise-Cancelling-Headphones-WH1000XM3/dp/B07G4MNFS1/';

async function configureBrowser() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 0 });
    return { browser, page };
}

async function checkPrice(page) {
    await page.reload({ waitUntil: 'load', timeout: 0 });
    try {
        await page.waitForSelector('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay', { timeout: 5000 });
        const currentPrice = await page.evaluate(() => {
            const priceElement = document.querySelector('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay');
            if (priceElement) {
                const priceText = priceElement.innerText;
                return Number(priceText.replace(/[^0-9.-]+/g, ""));
            }
            return null;
        });

        if (currentPrice !== null) {
            if (currentPrice < 300) {
                console.log("BUY!!!! " + currentPrice);
            } else {
                console.log("Current price is: " + currentPrice);
            }
        } else {
            console.log("Price element not found.");
        }
    } catch (error) {
        console.log("Error finding price element:", error);
        const html = await page.content();
        console.log(html);  // Output the HTML for debugging
    }
}

async function startTracking() {
    const { browser, page } = await configureBrowser();
    await checkPrice(page);
    await browser.close();
}

startTracking();
