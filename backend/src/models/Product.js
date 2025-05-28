const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  // add more fields as needed
});

module.exports = mongoose.model('Product', productSchema);