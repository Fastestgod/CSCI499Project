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
        const store = await detectStore(page);

<<<<<<< Updated upstream
        // Determine which function to call based on the URL
        if (url.includes('amazon.com')) {
            return await trackAmazon(page);
        } else if (url.includes('bestbuy.com')) {
            return await trackBestBuy(page);
        } else if (url.includes('nike.com')){
            return await trackNike(page);
        }else if (url.includes('homedepot.com')){
            return await trackHomedepot(page);   
        }else if (url.includes('costco.com')){
            return await trackCostco(page);    
        } else if (url.includes('target.com')){
            return await trackTarget(page);
      }
=======
        console.log(store);
        
        //Determine which function to call based on the URL
        if (store == 'Amazon') {
            return await trackAmazon(page,store);
        } else if (store === 'BestBuy') {
            return await trackBestBuy(page,store);
        } else if (store === 'Nike'){
            return await trackNike(page,store);
        }else if (store === 'HomeDepot'){
            return await trackHomedepot(page,store);   
        }
>>>>>>> Stashed changes
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
async function trackAmazon(page,store) {
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
    console.log({title, price, primePrice, imageUrl,store})
    return { title, price, primePrice, imageUrl,store};
}

// Function to fetch product details from Best Buy
async function trackBestBuy(page,store) {
    const title = await page.$eval('meta[property="og:title"]', element => element.getAttribute('content'));
    const price = await page.$eval('.priceView-hero-price.priceView-customer-price span', el => el.innerText.trim());
    const imageUrl = await page.$eval('.primary-image.max-w-full.max-h-full', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Best Buy
    
    console.log({title, price, primePrice, imageUrl,store})
    return { title, price, primePrice, imageUrl,store };
}
<<<<<<< HEAD
=======
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


// Function to fetch product details from Costco
//price could not be fectehd due to an location needed
async function trackCostco(page) {
    // Extract product title
    const title = await page.$eval('h1[automation-id="productName"]', element => element.innerText);
  
   // Extract the value from the script
  const scriptContent = await page.evaluate(() => {
    const script = document.querySelector('script[data-adobeopt-id="565894-data"]');
    return script ? script.innerHTML : '';
  });

  // Extract the dprice value using a regular expression
  const dpriceMatch = scriptContent.match(/"dprice":\s*"(\d+\.\d+)"/);
  const price = dpriceMatch ? dpriceMatch[1] : '- -.- -';


  console.log(price);
    // Extract the URL from the og:image meta tag
    const imageUrl = await page.$eval('meta[property="og:image"]', meta => meta.getAttribute('content'));
  
    // Assuming there is no Prime equivalent on Costco
    const primePrice = price;
    
    // Store name
    const store = 'Costco';
    
    // Return the scraped data
    return { title, price, primePrice, imageUrl, store };
  }
  
  
>>>>>>> 1c4c55e3db29bf3fa2d4832e4d053da896d7f058



// Function to fetch product details from Home Depot
async function trackHomedepot(page,store) {
    const title = await page.$eval('.product-details__badge-title--wrapper h1.sui-h4-bold', element => element.innerText);
    const jsonLdContent = await page.$eval('script#thd-helmet__script--productStructureData', element => element.textContent);
    // Parse the JSON content
    const productData = JSON.parse(jsonLdContent);
    // Extract the price
    price = productData.offers.price;
    const imageUrl = await page.$eval('.mediagallery__mainimage img', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Home Depot
    console.log({title, price, primePrice, imageUrl,store})
    return { title, price, primePrice, imageUrl,store };
}
async function detectStore(page) {
    // Check for Amazon
    try {
        const label = await page.$eval('a#nav-logo-sprites', element => element.getAttribute('aria-label'));
        if (label === 'Amazon') {
            return 'Amazon';
        }
    } catch (error) {}

    // Check for BestBuy
    try {
        const label = await page.$eval('a[title="BestBuy.com"] svg', element => element.getAttribute('aria-label'));
        if (label === 'BestBuy.com') {
            return 'BestBuy';
        }
    } catch (error) {}

    // Check for Nike
    try {
        const siteName = await page.$eval('meta[property="og:site_name"]', element => element.getAttribute('content'));
        if (siteName === 'Nike.com') {
            return 'Nike';
        }
    } catch (error) {}

    // Check for Home Depot
    if (page.url().includes('homedepot.com')) {
        return 'HomeDepot';
    }
    throw new Error('Unsupported store/url');
}

// Function to fetch product details from Costco
//price could not be fectehd due to an location needed
async function trackCostco(page) {
    // Extract product title
    const title = await page.$eval('h1[automation-id="productName"]', element => element.innerText);
  
   // Extract the value from the script
  const scriptContent = await page.evaluate(() => {
    const script = document.querySelector('script[data-adobeopt-id="565894-data"]');
    return script ? script.innerHTML : '';
  });

  // Extract the dprice value using a regular expression
  const dpriceMatch = scriptContent.match(/"dprice":\s*"(\d+\.\d+)"/);
  const price = dpriceMatch ? dpriceMatch[1] : '- -.- -';


  console.log(price);
    // Extract the URL from the og:image meta tag
    const imageUrl = await page.$eval('meta[property="og:image"]', meta => meta.getAttribute('content'));
  
    // Assuming there is no Prime equivalent on Costco
    const primePrice = price;
    
    // Store name
    const store = 'Costco';
    
    // Return the scraped data
    return { title, price, primePrice, imageUrl, store };
  }
async function trackTarget(page) {
        const title = await page.$eval('h1#pdp-product-title-id', el => el.innerText.trim());
<<<<<<< HEAD
        const price = await page.$eval('.sc-32969646-0.koXXfQ span', el => el.textContent.trim());//issues    
>>>>>>> Stashed changes
=======
        const price = await page.$eval('.sc-32969646-0.koXXfQ span', el => el.textContent.trim());    
>>>>>>> 1c4c55e3db29bf3fa2d4832e4d053da896d7f058
        const imageUrl = await page.$eval('section[data-test="@web/SiteTopOfFunnel/BaseStackedImageGallery"] img', img => img.src);
        const primePrice = price; // Assuming there is no Prime equivalent on Target
        const store = 'Target';
        return { title, price, primePrice, imageUrl, store };
    }
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
//test
//fetchProductDetails('https://www.amazon.com/dp/B099MS67S3/ref=cm_sw_r_as_gl_api_gl_i_dl_KP0W0ETNVX3SSS178FYW?linkCode=ml1&tag=mamadeals3-20&th=1');
fetchProductDetails('https://www.bestbuy.com/site/sony-wh1000xm5-wireless-noise-canceling-over-the-ear-headphones-black/6505727.p?skuId=6505727');
//fetchProductDetails('https://www.nike.com/t/sportswear-premium-essentials-mens-t-shirt-dg9M0C/DO7392-101');
//fetchProductDetails('https://www.homedepot.com/p/SONY-ZX-Series-Stereo-Headphones-MDRZX110-WHI/315165333');
>>>>>>> Stashed changes

=======
//test
fetchProductDetails('https://www.costco.com/roborock-qx-revo-vacuum-and-mop-robot-with-multifunctional-dock.product.4000233271.html');
>>>>>>> 1c4c55e3db29bf3fa2d4832e4d053da896d7f058
module.exports = fetchProductDetails;
