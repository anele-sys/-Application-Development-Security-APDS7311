import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/common/Alert';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client', // 'client' | 'freelancer'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Real-time password criteria evaluation
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet the security criteria below';
    }

    if (!['client', 'freelancer'].includes(formData.role)) {
      newErrors.role = 'Please select a valid account type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.role
      );

      if (response.success) {
        setSuccessMessage(
          'Your HustleHub+ account was created successfully! Redirecting to sign in...'
        );
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join HustleHub+ to start freelancing or hiring</p>
        </div>

        {serverError && (
          <Alert type="danger" message={serverError} onClose={() => setServerError('')} />
        )}

        {successMessage && (
          <Alert type="success" message={successMessage} />
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">I want to:</label>
            <div className="role-selector-grid">
              <div
                className={`role-card ${formData.role === 'client' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('client')}
              >
                <div className="role-card-title">
                  <span>💼</span>
                  <span>Hire Talent</span>
                </div>
                <div className="role-card-desc">
                  Browse gigs and book skilled freelancers for projects.
                </div>
              </div>

              <div
                className={`role-card ${formData.role === 'freelancer' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('freelancer')}
              >
                <div className="role-card-title">
                  <span>⚡</span>
                  <span>Offer Services</span>
                </div>
                <div className="role-card-desc">
                  Create service listings, earn income, and track work.
                </div>
              </div>
            </div>
            {errors.role && <div className="form-error">{errors.role}</div>}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className={`form-input ${errors.name ? 'has-error' : ''}`}
              placeholder="e.g. Sarah Connor"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-input ${errors.password ? 'has-error' : ''}`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="input-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}

            {/* Live Password Criteria Indicators */}
            {formData.password.length > 0 && (
              <div className="password-criteria">
                <div className="password-criteria-title">Password Security Requirements:</div>
                <div className={`password-criteria-item ${passwordCriteria.length ? 'valid' : 'invalid'}`}>
                  <span>{passwordCriteria.length ? '✓' : '○'}</span>
                  <span>Minimum 8 characters</span>
                </div>
                <div className={`password-criteria-item ${passwordCriteria.uppercase ? 'valid' : 'invalid'}`}>
                  <span>{passwordCriteria.uppercase ? '✓' : '○'}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`password-criteria-item ${passwordCriteria.lowercase ? 'valid' : 'invalid'}`}>
                  <span>{passwordCriteria.lowercase ? '✓' : '○'}</span>
                  <span>At least one lowercase letter (a-z)</span>
                </div>
                <div className={`password-criteria-item ${passwordCriteria.number ? 'valid' : 'invalid'}`}>
                  <span>{passwordCriteria.number ? '✓' : '○'}</span>
                  <span>At least one number (0-9)</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: '1.5rem' }}
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
