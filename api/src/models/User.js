// In-memory array used to store all users.
// This acts as the temporary data store for the application.
const users = [];

// Roles allowed by the application.
// Admin is included because administrators are created through
// private admin provisioning rather than public registration.
const VALID_ROLES = ['client', 'freelancer', 'admin'];

class User {
  // Create a new User object with the supplied user information.
  constructor({ id, name, email, password, role }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;

    // Store the date and time when the user was created.
    this.createdAt = new Date();
  }

  // Find a user by email address.
  // Email comparison is case-insensitive.
  static findByEmail(email) {
    return users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  // Find a user by their unique ID.
  static findById(id) {
    return users.find((user) => user.id === id);
  }

  // Create a new user account.
  static create({ name, email, password, role }) {
    // Make sure the supplied role is one of the allowed roles.
    if (!VALID_ROLES.includes(role)) {
      throw new Error('Invalid user role');
    }

    // Create a new User object.
    const user = new User({
      // Generate a simple unique ID using the current timestamp.
      id: String(Date.now()),

      name,

      // Store the email in lowercase for consistent lookups.
      email: email.toLowerCase(),

      // The password should already be hashed before
      // it reaches the User model.
      password,

      role
    });

    // Add the new user to the in-memory data store.
    users.push(user);

    // Return the newly created user.
    return user;
  }

  // Create an administrator account.
  // This is used by the private admin provisioning process.
  // Admin accounts are not created through public registration.
  static createAdmin({ name, email, password }) {
    return User.create({
      name,
      email,
      password,
      role: 'admin'
    });
  }

  // Return all users currently stored in memory.
  static getAll() {
    return users;
  }
}

// Export the User class for use by controllers and other
// parts of the application.
module.exports = User;