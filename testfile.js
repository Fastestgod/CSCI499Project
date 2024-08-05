const puppeteer = require('puppeteer');

(async () => {
  // Launch a non-headless browser for debugging
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the Target product page and wait until the network is idle
    await page.goto('https://www.target.com/p/avatar-frontiers-of-pandora-special-edition-xbox-series-x/-/A-89382883#lnk=sametab', { waitUntil: 'networkidle2' });

    // Wait for the price element to load with increased timeout
    await page.waitForSelector('span[data-test="product-price"]', { timeout: 10000 });

    // Extract the price text
    const price = await page.$eval('span[data-test="product-price"]', el => el.textContent.trim());

    console.log(price);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
