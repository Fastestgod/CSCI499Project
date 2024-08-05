/*const puppeteer = require('puppeteer');

// Function to fetch product details based on the URL
(async () => {
    const url = 'https://www.target.com/p/avatar-frontiers-of-pandora-special-edition-xbox-series-x/-/A-89382883#lnk=sametab';
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

        

        // Extract product details
        
        //const priceText = await page.$eval('span[itemprop="price"][aria-hidden="false"]', element => element.innerText.trim());
        
        // Use a regular expression to extract the numeric value
        //const priceMatch = priceText.match(/[\d.,]+/);
        //const price = priceMatch ? priceMatch[0] : null;
        const price = await page.$eval('span[data-test="product-price"]', el => el.textContent);
        
        console.log('Price:', price);
    
        
    } catch (error) {
        console.error(`Error fetching product details: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
*/
const puppeteer = require('puppeteer');

(async () => {
  // Launch a headless browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the Target product page
  await page.goto('https://www.target.com/p/avatar-frontiers-of-pandora-special-edition-xbox-series-x/-/A-89382883#lnk=sametab');

  // Wait for the price element to load
  await page.waitForSelector('span[data-test="product-price"]');

  // Extract the price text
  const price = await page.$eval('span[data-test="product-price"]', el => el.textContent.trim());

  console.log(price); // Output: $69.99

  // Close the browser
  await browser.close();
})();
