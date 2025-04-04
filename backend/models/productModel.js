const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productName: { type: String, required: true },
    productType: { type: String, required: true },
    image: { type: String, required: true }, // URL to the product image
    productCount: { type: Number, required: true, min: 0 },
    uniqueId: { type: String, required: true, unique: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;