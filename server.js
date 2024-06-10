import express from 'express';
import bodyParser from 'body-parser';
import schedule from 'node-schedule';
import { addProduct, getProducts, updatePrice } from './database.js';
import { getPrice } from './scraper.js';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Route to display products and their prices
app.get('/', async (req, res) => {
    const products = await getProducts();
    res.render('index', { products });
});

// Route to display the add product form
app.get('/add', (req, res) => {
    res.render('add_product');
});

// Route to handle form submission for adding a product
app.post('/add', async (req, res) => {
    const { name, url } = req.body;
    await addProduct(name, url);
    res.redirect('/');
});

// Function to update prices regularly
const updatePrices = async () => {
    const products = await getProducts();
    for (const product of products) {
        const newPrice = await getPrice(product.url);
        if (newPrice !== null) {
            await updatePrice(product.id, newPrice);
        }
    }
};

// Schedule the price update function to run every 5 minutes
schedule.scheduleJob('*/1 * * * *', updatePrices);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
