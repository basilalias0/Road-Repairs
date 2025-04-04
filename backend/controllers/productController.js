const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const productController = {
    addProduct: asyncHandler(async (req, res) => {
        const { productName, productType, image, productCount, uniqueId } = req.body;

        const product = await Product.create({
            workshop: req.user._id,
            productName,
            productType,
            image,
            productCount,
            uniqueId,
        });

        res.status(201).json(product);
    }),

    getWorkshopProducts: asyncHandler(async (req, res) => {
        const products = await Product.find({ workshop: req.user._id });
        res.json(products);
    }),

    updateProduct: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { productName, productType, image } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { productName, productType, image },
            { new: true }
        );

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.json(product);
    }),

    updateProductCount: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { productCount } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { productCount },
            { new: true }
        );

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.json(product);
    }),

    deleteProduct: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.json({ message: 'Product deleted successfully' });
    }),

    getAllProducts: asyncHandler(async (req, res) => {
        const products = await Product.find();
        res.json(products);
    }),

    purchaseProduct: asyncHandler(async (req, res) => {
        const { productId, quantity, token, amount } = req.body; // Include token and amount

        const product = await Product.findById(productId);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        if (product.productCount < quantity) {
            res.status(400);
            throw new Error('Insufficient product count');
        }

        try {
            const charge = await stripe.charges.create({
                amount: amount * 100, // Amount in cents
                currency: 'usd', // Change as needed
                source: token,
                description: `Purchase of ${quantity} ${product.productName}`,
            });

            product.productCount -= quantity;
            await product.save();

            const order = await Order.create({
                user: req.user._id,
                product: productId,
                quantity,
                amount,
                chargeId: charge.id,
            });

            res.json({ message: 'Payment successful', order });
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }),
    
    getCustomerOrders: asyncHandler(async (req, res) => {
        const orders = await Order.find({ user: req.user._id }).populate('product');
        res.json(orders);
    }),
};

module.exports = productController;