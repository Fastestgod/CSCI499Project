const puppeteer = require('puppeteer');

(async () => {
  // Launch a non-headless browser for debugging
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the Target product page and wait until the network is idle
    

    // Wait for the price element to load with increased timeout
    await page.goto('https://www.homedepot.com/p/SONY-ZX-Series-Stereo-Headphones-MDRZX110-WHI/315165333', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Extract the price text
    title = await page.$eval('meta[property="og:title"]', element => element.getAttribute('content'));
    

    console.log(title);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
