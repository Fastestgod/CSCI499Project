import puppeteer from 'puppeteer';

export const getPrice = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Modify the selector based on the structure of the product page
    const price = await page.evaluate(() => {
        const priceElement = document.querySelector('.price'); // Example selector
        return priceElement ? parseFloat(priceElement.innerText.replace('$', '')) : null;
    });

    await browser.close();
    return price;
};
