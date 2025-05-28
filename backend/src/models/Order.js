const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentMethods = {
  values: ['card', 'cash'],
  message: 'enum validator failed for payment Methods'
}
const orderSchema = new mongoose.Schema(
  {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
    }
  ],
  paymentMethod: { type: String, required: true, enum: paymentMethods },
  paymentStatus: { type: String, default: 'pending' },
  status: { type: String, default: 'pending' },
  selectedAddress: { type: Schema.Types.Mixed, required: true },
}
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
