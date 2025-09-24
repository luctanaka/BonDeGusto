const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options for optimal performance
    const options = {
      // Connection pooling configuration
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      
      // Retry configuration
      retryWrites: true,
      w: 'majority'
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔴 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Log specific error types
    if (error.name === 'MongoNetworkError') {
      console.error('🌐 Network error - Check your internet connection and MongoDB Atlas configuration');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('🔍 Server selection error - Check your connection string and database permissions');
    } else if (error.name === 'MongoParseError') {
      console.error('📝 Parse error - Check your MongoDB connection string format');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

// Connection health check
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  return {
    state: states[state],
    isConnected: state === 1,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

module.exports = {
  connectDB,
  checkConnection
};