// /api/order.js
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Order schema and model
const orderSchema = new mongoose.Schema({
  item: String,
  username: String,
  status: { type: String, default: '已提交' }
});
const Order = mongoose.model('Order', orderSchema);

module.exports = async (req, res) => {
  switch (req.method) {
    case 'POST':
      // Handle creating an order
      const { item, username } = req.body;
      const newOrder = new Order({ item, username });
      await newOrder.save();
      res.status(201).json(newOrder);
      break;

    case 'GET':
      // Handle fetching all orders
      const orders = await Order.find();
      res.status(200).json(orders);
      break;

    case 'PUT':
      // Handle updating an order
      const { status } = req.body;
      const { id } = req.query;
      const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
      res.status(200).json(updatedOrder);
      break;

    case 'DELETE':
      // Handle deleting an order
      const { deleteId } = req.query;
      await Order.findByIdAndDelete(deleteId);
      res.status(200).json({ message: 'Order deleted' });
      break;

    default:
      res.status(405).end(); // Method Not Allowed
  }
};
