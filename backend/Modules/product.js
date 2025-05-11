const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [false, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  brand: { 
    type: String, 
    required: [false, 'Brand is required'],
    trim: true
  },
  category: { 
    type: String, 
    required: [false, 'Category is required'],
    trim: true
  },
  oldprice: { 
    type: Number, 
    required: [false, 'Price is required'],
    min: [0, 'Price must be a positive number'],
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
  },
  newPrice: { 
    type: Number, 
    required: [false, 'New price is required'],
    min: [0, 'Price must be a positive number'],
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
  },
  stock: { 
    type: Number, 
    required: [false, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be an integer'
    }
  },
  description: { 
    type: String, 
    required: [false, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  image: { 
    type: String, 
    required: [true, 'Image is required']
  },
  color: { 
    type: String, 
    required: [false, 'Color is required'],
    trim: true,
    maxlength: [100, 'Color cannot exceed 100 characters']
  },
  shippingArea: { 
    type: String, 
    required: [false, 'Shipping area is required'],
    trim: true,
    maxlength: [100, 'Shipping area cannot exceed 100 characters']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for image URL
productSchema.virtual('imageUrl').get(function() {
  return this.image ? this.image.replace('uploads', '') : null;
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);