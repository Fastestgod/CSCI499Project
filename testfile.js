const puppeteer = require('puppeteer');

(async () => {
  // Launch a non-headless browser for debugging
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the Target product page and wait until the network is idle
    

    // Wait for the price element to load with increased timeout
    await page.goto('https://www.samsclub.com/p/members-mark-unsalted-sweet-cream-butter-4lbs/prod18380300?xid=hpg_carousel_rich-relevance.product_0_3', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Extract the price text
    const price = await page.$eval('meta[itemprop="price"]', el => el.getAttribute('content'));
    

    console.log(price);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the browser

    
  }
})();
