const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');

module.exports = async (req, res) => {
  try {
    const { amount, currency, payment_method_types } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// const express = require('express');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const router = express.Router();

// router.post('/create-payment-intent', async (req, res) => {
//   try {
//     const { amount, currency = 'inr', payment_method_types = ['card'] } = req.body;
    
//     if (!amount || isNaN(amount)) {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }

//     if (currency === 'inr' && amount < 50) {
//       return res.status(400).json({ error: 'Amount must be at least ₹0.50 (50 paise)' });
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Number(amount),
//       currency: currency.toLowerCase(),
//       payment_method_types,
//       metadata: {
//         integration_check: 'accept_a_payment'
//       }
//     });

//     res.json({
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id
//     });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).json({ 
//       error: error.message || 'Failed to create payment intent',
//       code: error.code || 'payment_intent_error'
//     });
//   }
// });

// module.exports = router;