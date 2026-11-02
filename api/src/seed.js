const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({
  path: path.join(__dirname, '..', '..', '.env')
});

const connectDB = require('./config/database');
const User = require('./models/User');
const Gig = require('./models/Gig');

const gigs = [
  {
    title: 'Modern Logo Design',
    description: 'Create a professional, memorable logo package with multiple concepts and source files.',
    category: 'Design',
    price: 750
  },
  {
    title: 'Responsive Website Development',
    description: 'Build a responsive website with modern navigation, accessible layouts, and mobile support.',
    category: 'Development',
    price: 3500
  },
  {
    title: 'Social Media Content Pack',
    description: 'Produce a polished monthly content pack with captions, graphics, and posting recommendations.',
    category: 'Marketing',
    price: 1200
  }
];

const seed = async () => {
  await connectDB();

  let freelancer = await User.findByEmail('demo.freelancer@hustlehub.local');
  if (!freelancer) {
    const password = await bcrypt.hash('DemoPassword123!', Number(process.env.SALT_ROUNDS) || 12);
    freelancer = await User.createUser({
      name: 'Demo Freelancer',
      email: 'demo.freelancer@hustlehub.local',
      password,
      role: 'freelancer'
    });
  }

  for (const gig of gigs) {
    await Gig.updateOne(
      { title: gig.title, owner: freelancer._id },
      { $set: gig },
      { upsert: true }
    );
  }

  console.log(`Seeded ${gigs.length} demo gigs owned by ${freelancer.email}`);
};

seed()
  .catch((error) => {
    console.error('Dummy data seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
