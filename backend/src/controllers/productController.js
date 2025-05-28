const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create a new product (manager only)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a product (manager only)
exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(productId, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a product (manager only)
exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search products with pagination and keyword
exports.searchProducts = async (req, res) => {
  const { page = 1, limit = 10, keyword = '' } = req.query;
  try {
    const query = keyword
      ? { name: { $regex: keyword, $options: 'i' } }
      : {};
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add product image upload support (expects req.file or req.files)
exports.uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Example: store file path in product (customize as needed)
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { image: req.file.path },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
