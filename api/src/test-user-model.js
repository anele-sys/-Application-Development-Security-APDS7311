require('dotenv').config({
  path: require('path').join(__dirname, '..', '..', '.env')
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const testUserModel = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    const testEmail = `test-${Date.now()}@hustlehub.local`;

    const hashedPassword = await bcrypt.hash(
      'TestPassword123',
      10
    );

    const user = await User.createUser({
      name: 'MongoDB Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'client'
    });

    console.log('User created successfully');
    console.log(`User ID: ${user._id}`);
    console.log(`User email: ${user.email}`);
    console.log(`User role: ${user.role}`);

    const foundUser = await User.findByEmail(testEmail);

    if (!foundUser) {
      throw new Error('Created user could not be found');
    }

    console.log('User found successfully');

    await User.deleteOne({
      _id: user._id
    });

    console.log('Test user deleted');

    await mongoose.disconnect();

    console.log('MongoDB disconnected');
    console.log('User model test passed');

    process.exit(0);
  } catch (error) {
    console.error('User model test failed');
    console.error(error.message);

    await mongoose.disconnect();

    process.exit(1);
  }
};

testUserModel();