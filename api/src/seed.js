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

  const demoPassword = await bcrypt.hash('DemoPassword123!', Number(process.env.SALT_ROUNDS) || 12);
  const demoAdminPassword = await bcrypt.hash('AdminPassword123!', Number(process.env.SALT_ROUNDS) || 12);

  let freelancer = await User.findByEmail('demo.freelancer@gmail.com');
  if (!freelancer) {
    freelancer = await User.createUser({
      name: 'Thabo Khumalo',
      email: 'demo.freelancer@gmail.com',
      password: demoPassword,
      role: 'freelancer'
    });
  }
  await User.updateOne(
    { _id: freelancer._id },
    { $set: { name: 'Thabo Khumalo', password: demoPassword, role: 'freelancer' } }
  );

  let client = await User.findByEmail('demo.client@gmail.com');
  if (!client) {
    client = await User.createUser({
      name: 'Lerato Mokoena',
      email: 'demo.client@gmail.com',
      password: demoPassword,
      role: 'client'
    });
  }
  await User.updateOne(
    { _id: client._id },
    { $set: { name: 'Lerato Mokoena', password: demoPassword, role: 'client' } }
  );

  const newmanPassword = await bcrypt.hash('Password123!', Number(process.env.SALT_ROUNDS) || 12);
  let newmanClient = await User.findByEmail('client@gmail.com');
  if (!newmanClient) {
    newmanClient = await User.createUser({
      name: 'Lwazi Cele',
      email: 'client@gmail.com',
      password: newmanPassword,
      role: 'client'
    });
  }
  await User.updateOne(
    { _id: newmanClient._id },
    { $set: { name: 'Lwazi Cele', password: newmanPassword, role: 'client' } }
  );

  let newmanFreelancer = await User.findByEmail('freelancer@gmail.com');
  if (!newmanFreelancer) {
    newmanFreelancer = await User.createUser({
      name: 'Naledi Nkosi',
      email: 'freelancer@gmail.com',
      password: newmanPassword,
      role: 'freelancer'
    });
  }
  await User.updateOne(
    { _id: newmanFreelancer._id },
    { $set: { name: 'Naledi Nkosi', password: newmanPassword, role: 'freelancer' } }
  );

  let admin = await User.findByEmail('admin@gmail.com');
  if (!admin) {
    admin = await User.createAdmin({
      name: 'Nomsa Dlamini',
      email: 'admin@gmail.com',
      password: demoAdminPassword
    });
  } else {
    await User.updateOne(
      { _id: admin._id },
      { $set: { name: 'Nomsa Dlamini', password: demoAdminPassword, role: 'admin' } }
    );
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
