require('dotenv').config({
  path: require('path').join(__dirname, '..', '..', '.env')
});

const mongoose = require('mongoose');
const Gig = require('./models/Gig');
const User = require('./models/User');

const testGigModel = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    // Find an existing freelancer
    let freelancer = await User.findByEmail(
      'gigtest@example.com'
    );

    // Create a temporary freelancer if one does not exist
    if (!freelancer) {
      freelancer = await User.createUser({
        name: 'Gig Test Freelancer',
        email: 'gigtest@example.com',
        password: 'TestPassword123',
        role: 'freelancer'
      });

      console.log('Test freelancer created');
    }

    // Create a test gig
    const gig = await Gig.create({
      title: 'Test Web Development Gig',
      description: 'A temporary gig used to test the Gig MongoDB model.',
      category: 'Web Development',
      price: 500,
      owner: freelancer._id
    });

    console.log('Gig created successfully');
    console.log(`Gig ID: ${gig._id}`);
    console.log(`Gig owner: ${gig.owner}`);

    // Find the gig
    const foundGig = await Gig.findById(gig._id);

    if (!foundGig) {
      throw new Error('Created gig could not be found');
    }

    console.log('Gig found successfully');

    // Remove the temporary gig
    await Gig.deleteOne({
      _id: gig._id
    });

    // Remove the temporary freelancer
    await User.deleteOne({
      _id: freelancer._id
    });

    console.log('Test gig deleted');
    console.log('Test freelancer deleted');

    await mongoose.disconnect();

    console.log('MongoDB disconnected');
    console.log('Gig model test passed');

    process.exit(0);
  } catch (error) {
    console.error('Gig model test failed');
    console.error(error.message);

    await mongoose.disconnect();

    process.exit(1);
  }
};

testGigModel();