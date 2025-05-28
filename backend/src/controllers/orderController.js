const Order = require('../models/Order');

// Get all orders for authenticated user
exports.getOrders = async (req, res) => {
  const userId = req.user.id || req.user._id;
  try {
    const orders = await Order.find({ userId }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create a new order for authenticated user
exports.createOrder = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { items } = req.body;
  try {
    const order = new Order({ userId, items });
    await order.save();
    await order.populate('items.product');
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single order by ID (for user)
exports.getOrderById = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({ _id: orderId, userId }).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
