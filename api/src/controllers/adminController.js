const User = require('../models/User');
const Gig = require('../models/Gig');
const Booking = require('../models/Booking');
const { sanitiseString, isValidRole } = require('../utils/validators');

/**
 * Get all users with aggregated activity stats
 * Role: Admin only
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (role && ['client', 'freelancer', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (search) {
      const sanitized = sanitiseString(search);
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    // Fetch associated counts for each user in parallel
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const userObj = u.toObject();
        const gigCount = await Gig.countDocuments({ owner: u._id });
        const clientBookingCount = await Booking.countDocuments({ client: u._id });
        const freelancerBookingCount = await Booking.countDocuments({ freelancer: u._id });

        return {
          ...userObj,
          gigCount,
          totalBookings: u.role === 'client' ? clientBookingCount : freelancerBookingCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 * Role: Admin only
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['client', 'freelancer', 'admin'];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Protect against self-demotion from admin
    if (targetUser._id.toString() === req.user.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote your own active administrator account',
      });
    }

    targetUser.role = role;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user account and associated gigs
 * Role: Admin only
 */
const deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting own admin account
    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrator account',
      });
    }

    // Remove user's gigs
    await Gig.deleteMany({ owner: targetUser._id });

    // Remove user
    await User.deleteOne({ _id: targetUser._id });

    return res.status(200).json({
      success: true,
      message: 'User account and associated listings removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all platform gigs (active & inactive)
 * Role: Admin only
 */
const getAllGigsAdmin = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    if (category) {
      filter.category = sanitiseString(category);
    }

    if (search) {
      const sanitized = sanitiseString(search);
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    const gigs = await Gig.find(filter)
      .populate('owner', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin update any gig
 * Role: Admin only
 */
const updateGigAdmin = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    const { title, description, category, price, status } = req.body;

    if (title !== undefined) gig.title = sanitiseString(title);
    if (description !== undefined) gig.description = sanitiseString(description);
    if (category !== undefined) gig.category = sanitiseString(category);
    if (price !== undefined) gig.price = Number(price);
    if (status !== undefined) gig.status = status;

    await gig.save();

    const updated = await Gig.findById(gig._id).populate('owner', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Gig updated by Administrator',
      gig: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin delete any gig
 * Role: Admin only
 */
const deleteGigAdmin = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    await Gig.deleteOne({ _id: gig._id });

    return res.status(200).json({
      success: true,
      message: 'Gig removed by Administrator successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive platform analytics
 * Role: Admin only
 */
const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalFreelancers,
      totalAdmins,
      totalGigs,
      activeGigs,
      totalBookings,
      bookingsList,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'admin' }),
      Gig.countDocuments(),
      Gig.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      Booking.find().select('price status'),
    ]);

    const totalVolume = bookingsList.reduce((sum, b) => sum + (b.price || 0), 0);
    const completedVolume = bookingsList
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    return res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          clients: totalClients,
          freelancers: totalFreelancers,
          admins: totalAdmins,
        },
        gigs: {
          total: totalGigs,
          active: activeGigs,
          inactive: totalGigs - activeGigs,
        },
        bookings: {
          total: totalBookings,
          totalVolume,
          completedVolume,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllGigsAdmin,
  updateGigAdmin,
  deleteGigAdmin,
  getPlatformAnalytics,
};
