// Import the Express framework
const express = require('express');

// Create a new Router object, which acts as a mini application for handling routes
const router = express.Router();

// Define a route for GET requests to the root path ('/')
router.get('/', (req, res) => {
    // Render the 'index' view (template) and pass along the 'products' data to the template
    // The 'products' data is retrieved from the application's local variables (app.locals)
    res.render('index', { products: req.app.locals.products });
    // The 'index' view will be able to access and display the 'products' data
});

// Export the router so it can be used in other parts of the application
module.exports = router;
