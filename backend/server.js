const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/productdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    category: String
});

const Product = mongoose.model('Product', productSchema);

// GET all products (sorted by price)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ price: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById((req.params.id || '').trim());
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        return res.status(404).json({ error: 'Product not found' });
    }
});

// POST new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, description, category } = req.body || {};
        if (!name || price === undefined || !description || !category) {
            return res.status(400).json({ error: 'All fields (name, price, description, category) are required' });
        }
        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice)) {
            return res.status(400).json({ error: 'Price must be a number' });
        }
        const newProduct = new Product({ name, price: numericPrice, description, category });
        await newProduct.save();
        console.log('POST /api/products created', { id: newProduct._id, name });
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Product not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
