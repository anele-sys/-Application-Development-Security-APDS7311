const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'ZAR',
  },
  paymentMethod: {
    type: String,
    enum: ['simulated_card', 'instant_eft', 'demo_wallet'],
    default: 'simulated_card',
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'refunded'],
    default: 'completed',
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    requirements: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
    },
    transaction: {
      type: transactionSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
