const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart for authenticated user
exports.getCart = async (req, res) => {
  const userId = req.user.id || req.user._id;
  try {
    const cart = await Cart.findOne({ userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add product to cart for authenticated user
exports.addToCart = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });
    const existingItem = cart.items.find(i => i.product.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a cart item by productId
exports.deleteFromCart = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { productId } = req.params;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update quantity of a cart item
exports.updateCartItem = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { productId } = req.params;
  const { quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(item => item.product.equals(productId));
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
