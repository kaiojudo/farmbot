const axios = require('axios').default;
const WebSocket = require('ws');
const redis = require('redis');

// Khởi tạo Redis Client cho các lệnh thông thường
const redisClient = redis.createClient({ url: 'redis://localhost:6379' });

// Khởi tạo Redis Client khác cho việc subscribe
const redisSubscriber = redis.createClient({ url: 'redis://localhost:6379' });

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisSubscriber.on('error', (err) => {
  console.error('Redis subscriber error:', err);
});

// Connect to Redis server và xử lý lỗi
redisClient.connect().catch(err => console.error('Redis connect error:', err));
redisSubscriber.connect().catch(err => console.error('Redis subscriber connect error:', err));

// Khởi tạo WebSocket Server trên HTTPS server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('New WebSocket connection');

  let userId;

  ws.on('message', async function incoming(message) {
    const parsedMessage = JSON.parse(message);
    const { type, userId: receivedUserId } = parsedMessage;

    userId = receivedUserId; // Lưu userId để sử dụng khi kết nối đóng

    try {
      if (type === 'login') {
        await redisClient.set(`user:${userId}`, 'online');
        console.log(`User ${userId} logged in`);
        // Phát thông báo tới các client khác nếu cần
        broadcast(JSON.stringify({ type: 'status', userId, status: 'online' }));
      } else if (type === 'logout') {
        await redisClient.del(`user:${userId}`);
        await sendLogoutRequest(userId, farm);
        console.log(`User ${userId} logged out`);
        // Phát thông báo tới các client khác nếu cần
        broadcast(JSON.stringify({ type: 'status', userId, status: 'offline' }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', async function () {
    console.log('WebSocket disconnected');
    if (userId) {
      try {
        await redisClient.del(`user:${userId}`);
        await sendLogoutRequest(userId);
        console.log(`User ${userId} logged out`);
        // Phát thông báo tới các client khác nếu cần
        broadcast(JSON.stringify({ type: 'status', userId, status: 'offline' }));
      } catch (error) {
        console.error('Error handling close event:', error);
      }
    }
  });
});

async function sendLogoutRequest(userId, farm) {
  const now = new Date().toISOString();
  try {
    const response = await axios.post(`https://pokegram.games/user/${userId}/logout`, { timeLogOut: now, farm });
    // console.log('Logout request response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending logout request:', error);
    throw error;
  }
}

function broadcast(message) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

redisSubscriber.on('message', function (channel, message) {
  console.log('Received message from Redis:', message);
  // Phát thông báo tới tất cả các client WebSocket kết nối
  broadcast(message);
});

redisSubscriber.subscribe('user_status').catch(err => console.error('Redis subscribe error:', err));

console.log('WebSocket server is running on port 8080');
