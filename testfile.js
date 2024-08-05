const puppeteer = require('puppeteer');

// Function to fetch product details based on the URL
(async () => {
    const url = 'https://www.walmart.com/ip/T-Mobile-Unlocked-Android-Phones-XGODY-AT-T-Cell-Phones-Smartphones-6-52-Incell-Screen-15MP-8MP-4G-LTE-Dual-SIM-4500mAh-2GB-RAM-32GB-ROM-Face-Unlocki/5208897455?athcpid=5208897455&athpgid=AthenaItempage&athcgid=null&athznid=utic&athieid=v0&athstid=CS020&athguid=NqxcRFt6UK-3SLWiimBXATZrrray2MoeY6D0&athancid=7069923990&athena=true';
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

        // Extract product details
        
        //const priceText = await page.$eval('span[itemprop="price"][aria-hidden="false"]', element => element.innerText.trim());
        
        // Use a regular expression to extract the numeric value
        //const priceMatch = priceText.match(/[\d.,]+/);
        //const price = priceMatch ? priceMatch[0] : null;
        const price = await page.$eval('span[itemprop="price"][aria-hidden="false"]', element => element.innerText.trim());

        
        console.log('Price:', price);
    
        
    } catch (error) {
        console.error(`Error fetching product details: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
