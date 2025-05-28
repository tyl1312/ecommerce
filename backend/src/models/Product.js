const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type : String, required: true, unique: true},
  description: String,
  price: { type: Number, min:[1, 'wrong min price']},
  images:{ type : [String], required: true},
  colors:{ type : [Schema.Types.Mixed] },
  sizes:{ type : [Schema.Types.Mixed]},
});

module.exports = mongoose.model('Product', productSchema);
