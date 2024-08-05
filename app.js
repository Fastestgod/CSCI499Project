// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');
const fetchProductDetails = require('./utils/fetchproductdetails');
const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');

// Initialize the Express application
const app = express();
const PORT = 3000;

// Set the view engine to EJS for templating
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse URL-encoded and JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define routes for the application
app.use('/', indexRoutes);          // Route for index page
app.use('/products', productRoutes); // Route for products

// Initialize an empty array to store products
let products = [];
app.locals.products = products;  // Make products accessible in routes

// Schedule the price update function to run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
    await updatePrices(products);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

/**
 * Function to update the prices of products
 * @param {Array} products - List of products to update
 */
async function updatePrices(products) {
    const updates = products.map(async (product) => {
        try {
            // Fetch product details
            const { price, primePrice, error } = await fetchProductDetails(product.url);
            if (!error) {
                // Get the current timestamp
                const now = new Date().toLocaleString();
                // Update the product's price, primePrice, and lastUpdated fields
                product.price = price;
                product.primePrice = primePrice;
                product.lastUpdated = now;

                // Add the update to the product's history
                product.history.push({ time: now, price, primePrice, store: product.store });

                // Update each additional store's price
                for (const store of product.stores) {
                    const storeDetails = await fetchProductDetails(store.url);
                    if (!storeDetails.error) {
                        // Update the store's price, primePrice, and lastUpdated fields
                        store.price = storeDetails.price;
                        store.primePrice = storeDetails.primePrice;
                        store.lastUpdated = now;

                        // Add the update to the product's history
                        product.history.push({ time: now, price: storeDetails.price, primePrice: storeDetails.primePrice, store: store.store });
                    }
                }
            }
        } catch (error) {
            // Log any errors that occur during the update
            console.error(`Error updating product: ${product.url}, ${error.message}`);
        }
    });

    // Wait for all updates to complete
    await Promise.all(updates);
}
