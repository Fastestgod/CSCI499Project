const puppeteer = require('puppeteer');


const url = 'https://www.runningwarehouse.com/Nike_Mens_Running_Shoes/catpage-MRSNIKE.html';
async() =>{
    const browser = await puppeteer.launch();

    const page = await browser.launch();
    await page.goto(url);
    
    await browser.close();
}