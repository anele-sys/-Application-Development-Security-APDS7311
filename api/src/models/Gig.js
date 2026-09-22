const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Gig', gigSchema);