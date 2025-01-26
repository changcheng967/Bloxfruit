const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI || 'your_mongodb_connection_string';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Order Schema
const orderSchema = new mongoose.Schema({
  item: String,
  username: String,
  waterName: String,
  price: { type: String, default: '' },
  deliveryDate: { type: String, default: '' },
  status: { type: String, default: 'Submitted' }
});

const Order = mongoose.model('Order', orderSchema);

// Routes
app.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.post('/orders', async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  res.json({ message: 'Order added successfully!' });
});

app.put('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { price, deliveryDate, status } = req.body;
  await Order.findByIdAndUpdate(id, { price, deliveryDate, status });
  res.json({ message: 'Order updated successfully!' });
});

app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  await Order.findByIdAndDelete(id);
  res.json({ message: 'Order deleted successfully!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
