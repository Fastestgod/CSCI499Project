const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const fetchProductDetails = require('./utils/fetchProductDetails');
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', indexRoutes);
app.use('/products', productRoutes);

let products = [];
app.locals.products = products;  // Make products accessible in routes

// Schedule the price update function to run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    await updatePrices(products);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

async function updatePrices(products) {
    const updates = products.map(async (product) => {
        try {
            const { price, primePrice, error } = await fetchProductDetails(product.url);
            if (!error) {
                const now = new Date().toLocaleString();
                product.price = price;
                product.primePrice = primePrice;
                product.lastUpdated = now;
                product.history.push({ time: now, price, primePrice });
            }
        } catch (error) {
            console.error(`Error updating product: ${product.url}, ${error.message}`);
        }
    });

    await Promise.all(updates);
}
