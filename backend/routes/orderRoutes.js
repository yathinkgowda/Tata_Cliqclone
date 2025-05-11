const express = require('express');
const router = express.Router();
const Order = require('../Modules/Order');

// Create a new order
router.post('/orders', async (req, res) => {
  console.log("Incoming order:", req.body); // 🟢 Debug log
  try {
    const order = new Order(req.body);
    await order.save();
    console.log("Order saved:", order._id); // 🟢 Confirm save
    res.status(201).send(order);
  } catch (error) {
    console.error("Save error:", error); // 🔴 Log failures
    res.status(500).send({ error: error.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.send(orders);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ error: 'Order not found' });
    }
    res.send(order);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;