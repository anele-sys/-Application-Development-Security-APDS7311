require('dotenv').config({
  path: require('path').join(__dirname, '..', '..', '.env')
});

const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured');
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connection successful');

    await mongoose.disconnect();

    console.log('MongoDB disconnected');

    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection failed');
    console.error(error.message);

    process.exit(1);
  }
};

testConnection();