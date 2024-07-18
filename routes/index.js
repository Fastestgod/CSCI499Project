const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { products: req.app.locals.products });
});

module.exports = router;
