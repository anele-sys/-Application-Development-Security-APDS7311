const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

// Register a new client or freelancer account
const register = async (req, res, next) => {
  try {
    // Get registration details from the request body
    const { name, email, password, role } = req.body;

    // Check that the user's name was provided
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Check that the user's email was provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check that the user's password was provided
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Check whether an account with the email already exists
    const existingUser = User.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with the hashed password
    const user = User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Return the newly registered user's details
    // Never return the password or password hash
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Pass unexpected errors to the global error handler
    next(error);
  }
};

// Authenticate an existing user
const login = async (req, res, next) => {
  try {
    // Get login credentials from the request body
    const { email, password } = req.body;

    // Check that the email was provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check that the password was provided
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Find the user using the supplied email address
    const user = User.findByEmail(email);

    // Use the same message for an unknown email and incorrect password
    // to avoid revealing whether an account exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare the supplied password with the stored password hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    // Reject the login if the password does not match
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate a JWT containing the authenticated user's information
    const token = generateToken(user);

    // Return the JWT and authenticated user's details
    // Never return the password or password hash
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Pass unexpected errors to the global error handler
    next(error);
  }
};

// Return the authenticated user's profile
// This route is protected by authenticateToken middleware
const getProfile = async (req, res, next) => {
  try {
    // authenticateToken has already verified the JWT
    // and attached the authenticated user to req.user
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    // Pass unexpected errors to the global error handler
    next(error);
  }
};

// Export the authentication controller functions
module.exports = {
  register,
  login,
  getProfile,
};