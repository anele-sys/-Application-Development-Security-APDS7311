const Booking = require('../models/Booking');
const Gig = require('../models/Gig');

// Generate unique, readable transaction reference
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${timestamp}-${randomPart}`;
};

/**
 * Initiate a new booking for an active gig
 * Role: Client only
 */
const createBooking = async (req, res, next) => {
  try {
    const { gigId, requirements, paymentMethod } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'The requested gig does not exist',
      });
    }

    if (gig.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This gig is currently inactive and cannot be booked',
      });
    }

    // Prevent booking own gig
    if (gig.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own freelance service listing',
      });
    }

    // Create simulated transaction record
    const transactionRecord = {
      transactionId: generateTransactionId(),
      amount: gig.price,
      currency: 'ZAR',
      paymentMethod: paymentMethod || 'simulated_card',
      status: 'completed',
      paidAt: new Date(),
    };

    const booking = await Booking.create({
      client: req.user.id,
      freelancer: gig.owner,
      gig: gig._id,
      price: gig.price,
      requirements: requirements || '',
      status: 'in_progress',
      transaction: transactionRecord,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('gig', 'title category price')
      .populate('freelancer', 'name email')
      .populate('client', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Booking created and payment simulated successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings for the authenticated Client
 * Role: Client
 */
const getClientBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ client: req.user.id })
      .populate('gig', 'title category price status')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    const totalSpend = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const activeCount = bookings.filter((b) => ['pending', 'in_progress'].includes(b.status)).length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;

    return res.status(200).json({
      success: true,
      count: bookings.length,
      stats: {
        totalSpend,
        totalBookings: bookings.length,
        activeBookings: activeCount,
        completedBookings: completedCount,
      },
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings and income metrics for the authenticated Freelancer
 * Role: Freelancer
 */
const getFreelancerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ freelancer: req.user.id })
      .populate('gig', 'title category price status')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    const totalEarned = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const activeCount = bookings.filter((b) => ['pending', 'in_progress'].includes(b.status)).length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;

    return res.status(200).json({
      success: true,
      count: bookings.length,
      stats: {
        totalEarned,
        totalOrders: bookings.length,
        activeOrders: activeCount,
        completedOrders: completedCount,
      },
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single booking by ID with strict ownership/RBAC check
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('gig', 'title description category price')
      .populate('freelancer', 'name email')
      .populate('client', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found',
      });
    }

    // Access control: only client, assigned freelancer, or admin can view
    const isClient = booking.client._id.toString() === req.user.id;
    const isFreelancer = booking.freelancer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status (e.g., mark completed, cancel)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const isClient = booking.client.toString() === req.user.id;
    const isFreelancer = booking.freelancer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this booking',
      });
    }

    // Clients can only cancel
    if (isClient && !isFreelancer && !isAdmin && status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Clients are only permitted to cancel pending bookings',
      });
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('gig', 'title category price')
      .populate('freelancer', 'name email')
      .populate('client', 'name email');

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all platform bookings (Admin console)
 * Role: Admin
 */
const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('gig', 'title category price')
      .populate('freelancer', 'name email')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    const totalPlatformVolume = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      totalVolume: totalPlatformVolume,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getClientBookings,
  getFreelancerBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookingsAdmin,
};
