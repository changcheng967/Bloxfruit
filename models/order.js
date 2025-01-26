const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  item: String,
  username: String,
  status: { type: String, default: '已提交' }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;