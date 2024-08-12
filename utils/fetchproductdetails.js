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
      
        const store = await detectStore(page);

        

        if (store === 'Amazon') {
            return await trackAmazon(page,store);
        } else if (store === 'Best Buy') {
            return await trackBestBuy(page,store);
        } else if (store === 'Nike'){
            return await trackNike(page,store);
        } else if (store === 'Home Depot'){
            return await trackHomedepot(page,store);   
        } else if (store === 'Walgreens'){
            return await trackWalgreens(page,store);
        } else if (store === 'Sams Club'){
            return await trackSamsClub(page,store);  
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
    return { title, price, primePrice, imageUrl,store };
}

// Function to fetch product details from Best Buy
async function trackBestBuy(page,store) {
    const title = await page.$eval('.sku-title', el => el.innerText.trim());
    const price = await page.$eval('.priceView-hero-price.priceView-customer-price span', el => el.innerText.trim());
    const imageUrl = await page.$eval('.primary-image.max-w-full.max-h-full', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Best Buy

    return { title, price, primePrice, imageUrl,store };
}
// Function to fetch product details from Nike
async function trackNike(page,store) {
    const title = await page.$eval('h1#pdp_product_title', el => el.innerText.trim());
    const price = await page.$eval('div#price-container span[data-testid="currentPrice-container"]', el => el.innerText.trim());
    const imageUrl = await page.$eval('ul[data-testid="mobile-image-carousel-list"] li[data-testid="mobile-image-carousel-list-item"] img[data-testid="mobile-image-carousel-image"]', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Nike
    
    return { title, price, primePrice, imageUrl,store };
}

// Function to fetch product details from Home Depot
async function trackHomedepot(page,store) {
    const title = await page.$eval('meta[property="og:title"]', element => element.getAttribute('content'));

    const dollars = await page.$eval('.price .price-format__main-price span:nth-child(2)', element => element.innerText);
    const cents = await page.$eval('.price .price-format__main-price span:nth-child(4)', element => element.innerText);
    const price = `$${dollars}.${cents}`;
    const imageUrl = await page.$eval('.mediagallery__mainimage img', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Home Depot
    console.log({ title, price, primePrice, imageUrl,store});
    return { title, price, primePrice, imageUrl,store};
}


// Function to fetch product details from Walgreens
async function trackWalgreens(page,store) {
    const companyName = await page.$eval('a.title-small.semi-bold', el => el.innerText.trim());
    const productTitle = await page.$eval('span#productTitle', el => el.innerText.trim());
    const title = `${companyName} ${productTitle}`; // Combine company name and product title
    const price = await page.$eval('span.price__contain .title-xx-large', el => el.innerText.trim());
    const imageUrl = await page.$eval('.productimage', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Walgreens
    return { title, price, primePrice, imageUrl, store };
}
// Function to fetch product details from Sam's Club
async function trackSamsClub(page,store) {
    const title = await page.$eval('.sc-pc-title-full-desktop-row h1', el => el.innerText.trim());
    const dollars = await page.$eval('.Price-characteristic', element => element.innerText);
    const cents = await page.$eval('.Price-mantissa', element => element.innerText);
    const price = `$${dollars}.${cents}`;
    const imageUrl = await page.$eval('.sc-image-viewer-img', img => img.src);
    const primePrice = price; // Assuming there is no Prime equivalent on Sam's Club
    console.log({title, price, primePrice, imageUrl, store} );
    return { title, price, primePrice, imageUrl, store };
    }

  
    async function detectStore(page) {
        // Check for Amazon
        try {
            const label = await page.$eval('a#nav-logo-sprites', element => element.getAttribute('aria-label'));
            if (label === 'Amazon') {
                return 'Amazon';
            }
        } catch (error) {}
    
        // Check for Nike/walgreen/bestbuy
        try {
            const siteName = await page.$eval('meta[property="og:site_name"]', element => element.getAttribute('content'));
            if (siteName === 'Nike.com' ){
                return 'Nike';
            }
            if(siteName === 'Walgreens' || siteName === 'Best Buy'){
                return siteName;
            }
        } catch (error) {}
        
        //Check for Sams club
        try{
            const url = await page.$eval('meta[property="og:url"]', element => element.getAttribute('content'));{
                if (url.includes('https://www.samsclub.com/')){
                    return 'Sams Club';
                }
            }
        }
        catch(error){}
        
        // Check for Home Depot
        if (page.url().includes('homedepot.com')) {
            return 'Home Depot';
        }
        
        throw new Error('Unsupported store/url');
    }

//test
//fetchProductDetails('https://www.amazon.com/dp/B099MS67S3/ref=cm_sw_r_as_gl_api_gl_i_dl_KP0W0ETNVX3SSS178FYW?linkCode=ml1&tag=mamadeals3-20&th=1');
//fetchProductDetails('https://www.bestbuy.com/site/sony-wh1000xm5-wireless-noise-canceling-over-the-ear-headphones-black/6505727.p?skuId=6505727');
//fetchProductDetails('https://www.nike.com/t/sportswear-premium-essentials-mens-t-shirt-dg9M0C/DO7392-101');
//fetchProductDetails('https://www.homedepot.com/p/SONY-ZX-Series-Stereo-Headphones-MDRZX110-WHI/315165333');
fetchProductDetails('https://www.samsclub.com/p/lg-65-class-ut7550-aub-series-led-4k-uhd-webos-23-smart-w-thinq-ai-tv-65ut7550au/P990338470?xid=hpg_carousel_rich-relevance.product_0_1');
module.exports = fetchProductDetails;
