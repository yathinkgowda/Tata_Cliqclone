const express = require('express');
const router = express.Router();
const Product = require('../Modules/product');

// Add new product
router.post('/add-product', async (req, res) => {
  try {
    const { name, category, price, image ,brand,newPrice,stock,description,color,shippingArea } = req.body;

    // Validate required fields
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required fields' });
    }

    // Parse and validate the price to ensure it's a valid number
    const parsedPrice = parseFloat(price,newPrice);  // Use parseFloat() to handle decimal numbers

    if (isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }

    // Create new product
    const product = new Product({ 
      name, 
      category, 
      brand,
      stock,
      description,
      color,
      shippingArea,
      price: parsedPrice,  // Ensure price is a number
      newPrice: parsedPrice,
      image: image || '',   // Handle optional imageUrl
     

    });

    // Save product to database
    const savedProduct = await product.save();

    res.status(201).json({ 
      success: true,
      message: 'Product added successfully',
      product: savedProduct 
    });
  } catch (error) {
    console.error('Error adding product:', error);

    // More specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Failed to add product',
      details: error.message 
    });
  }
});

// Get all products
// router.get('/products', async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });
//     res.status(200).json({
//       success: true,
//       products
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: 'Failed to fetch products',
//       details: error.message
//     });
//   }
// });

module.exports = router;