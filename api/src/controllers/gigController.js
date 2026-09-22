const Gig = require('../models/Gig');

// Create a new gig
const createGig = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      price
    } = req.body;

    // Create the gig using the authenticated freelancer's ID
    const gig = await Gig.create({
      title,
      description,
      category,
      price,
      owner: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Gig created successfully',
      gig
    });
  } catch (error) {
    next(error);
  }
};

// Get all active gigs
const getGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({
      status: 'active'
    })
      .populate('owner', 'name email')
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      success: true,
      count: gigs.length,
      gigs
    });
  } catch (error) {
    next(error);
  }
};

// Get a single gig
const getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('owner', 'name email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    return res.status(200).json({
      success: true,
      gig
    });
  } catch (error) {
    next(error);
  }
};

// Update a gig
const updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Ownership check
    if (gig.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own gigs'
      });
    }

    const {
      title,
      description,
      category,
      price,
      status
    } = req.body;

    // Update only fields that were supplied
    if (title !== undefined) {
      gig.title = title;
    }

    if (description !== undefined) {
      gig.description = description;
    }

    if (category !== undefined) {
      gig.category = category;
    }

    if (price !== undefined) {
      gig.price = price;
    }

    if (status !== undefined) {
      gig.status = status;
    }

    await gig.save();

    return res.status(200).json({
      success: true,
      message: 'Gig updated successfully',
      gig
    });
  } catch (error) {
    next(error);
  }
};

// Delete a gig
const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Ownership check
    if (gig.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own gigs'
      });
    }

    await Gig.deleteOne({
      _id: gig._id
    });

    return res.status(200).json({
      success: true,
      message: 'Gig deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig
};