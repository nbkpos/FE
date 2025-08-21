const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.userId = user._id;
      socket.merchantId = user.merchantId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Merchant ${socket.merchantId} connected`);
    
    // Join merchant-specific room
    socket.join(`merchant_${socket.merchantId}`);
    
    socket.on('disconnect', () => {
      console.log(`Merchant ${socket.merchantId} disconnected`);
    });

    // Handle real-time transaction updates
    socket.on('transaction_status_request', (transactionId) => {
      // Emit current transaction status
      socket.emit('transaction_status_update', {
        transactionId,
        timestamp: new Date().toISOString()
      });
    });
  });
};
