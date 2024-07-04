const puppeteer = require('puppeteer');

const url = 'https://www.amazon.com/dp/B0C8PSMPTH/ref=sspa_dk_detail_0?psc=1&pd_rd_i=B0C8PSMPTH&pd_rd_w=1rPOq&content-id=amzn1.sym.386c274b-4bfe-4421-9052-a1a56db557ab&pf_rd_p=386c274b-4bfe-4421-9052-a1a56db557ab&pf_rd_r=GNQXPM489PJR4MYFMHN8&pd_rd_wg=xTp5y&pd_rd_r=8d748c51-438b-4e28-933a-0cdbb7d3e804&s=electronics&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWxfdGhlbWF0aWM';

async function configureBrowser() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 0 });
    return { browser, page };
}

async function checkPrice(page) {
    try {
        await page.waitForSelector('.a-offscreen', { timeout: 5000 });
        const currentPrice = await page.evaluate(() => {
            const priceElement = document.querySelector('.a-offscreen');
            if (priceElement) {
                const priceText = priceElement.innerText.trim().match(/[$]?[0-9,.]+/)[0];
                return parseFloat(priceText.replace(/[^0-9.-]+/g, "")).toFixed(2);
            }
            return null;
        });

        const primePrice = await page.evaluate(() => {
            const primePriceElement = document.querySelector('a[data-benefit-optimization-id="PrimeExclusiveMario"] .a-size-base');
            if (primePriceElement) {
                const primePriceText = primePriceElement.innerText.trim().match(/[$]?[0-9,.]+/)[0];
                return parseFloat(primePriceText.replace(/[^0-9.-]+/g, "")).toFixed(2);
            }
            return null;
        });

        if (currentPrice !== null ) {
            console.log("Current nonprime price is $" + currentPrice);
            if (primePrice == null){
                console.log('Prime price is $' + currentPrice);
            }
            else{
                console.log('Prime price is $' + primePrice);
            }
            
        } else {
            console.log("Price information not found.");
        }
    } catch (error) {
        console.log("Error finding price information:", error);
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
