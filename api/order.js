// api/order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  item: String,
  username: String,
  status: { type: String, default: '已提交' }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = async (req, res) => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MongoDB URI is missing' });
  }

  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    switch (req.method) {
      case 'POST':
        // Create a new order
        const { item, username } = req.body;
        const newOrder = new Order({ item, username });
        await newOrder.save();
        return res.status(201).json(newOrder);
        
      case 'GET':
        // Get all orders
        const orders = await Order.find();
        return res.status(200).json(orders);
        
      case 'PUT':
        // Update an order status
        const { id, status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
        return res.status(200).json(updatedOrder);
        
      case 'DELETE':
        // Delete an order
        const { deleteId } = req.query;
        await Order.findByIdAndDelete(deleteId);
        return res.status(200).json({ message: 'Order deleted' });
        
      default:
        return res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
};
