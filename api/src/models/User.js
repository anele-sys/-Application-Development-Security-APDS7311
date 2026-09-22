const mongoose = require('mongoose');

const VALID_ROLES = ['client', 'freelancer', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: VALID_ROLES,
      default: 'client'
    }
  },
  {
    timestamps: true
  }
);

// Find a user using their email address
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase()
  });
};

// Find a user using their MongoDB ID
userSchema.statics.findById = function (id) {
  return this.findOne({
    _id: id
  });
};

// Create a normal user
userSchema.statics.createUser = function ({
  name,
  email,
  password,
  role
}) {
  return this.create({
    name,
    email,
    password,
    role
  });
};

// Create an administrator
userSchema.statics.createAdmin = function ({
  name,
  email,
  password
}) {
  return this.create({
    name,
    email,
    password,
    role: 'admin'
  });
};

// Get all users
userSchema.statics.getAll = function () {
  return this.find();
};

module.exports = mongoose.model('User', userSchema);