import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Mail, Lock, Eye, EyeOff, Leaf, Truck, ShieldCheck, HeadphonesIcon, User } from 'lucide-react';
import { login } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import './Login.css';

import logoImg from '../../assets/logo/freshioz_logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginId = e.target.loginId.value.trim();
    const password = e.target.password.value;

    const isMobile = /^\+?[0-9]{10,15}$/.test(loginId);
    const loginPayload = isMobile ? { mobileNumber: loginId, password } : { email: loginId, password };

    try {
      const response = await login(loginPayload);

      // Store token and user data
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('UserType', response.user.role);
      }

      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Left Side - Banner */}
      <div className="login-banner">
        <div className="banner-content">
          <div className="banner-logo" style={{ justifyContent: 'center', padding: '1rem' }}>
            <img src={logoImg} alt="Freshioz Logo" style={{ maxHeight: '60px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>

          <div className="banner-text">
            <h2>Your Trusted Partner<br />for Fresh <span style={{ color: '#f57c00' }}>Fruits &<br />Vegetables</span> in Bulk</h2>
            <div className="leaf-divider">
              <Leaf size={16} color="#2e7d32" />
              <div className="divider-line"></div>
            </div>
            <p className="sub-text">
              Supplying farm fresh fruits and vegetables<br />
              in bulk with quality, freshness and<br />
              trust at every step.
            </p>
          </div>
        </div>

        {/* Bottom Features Bar */}
        <div className="features-bar">
          <div className="feature-item">
            <Leaf size={24} />
            <div className="feature-text">
              <strong>Farm Fresh</strong>
              <span>Handpicked Quality</span>
            </div>
          </div>
          <div className="feature-item">
            <Truck size={24} />
            <div className="feature-text">
              <strong>Bulk Supply</strong>
              <span>On-Time Delivery</span>
            </div>
          </div>
          <div className="feature-item">
            <ShieldCheck size={24} />
            <div className="feature-text">
              <strong>Trusted Quality</strong>
              <span>100% Fresh Guarantee</span>
            </div>
          </div>
          <div className="feature-item">
            <HeadphonesIcon size={24} />
            <div className="feature-text">
              <strong>24/7 Support</strong>
              <span>We are here for you</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-form-side">
        <div className="login-form-container">
          <div className="form-logo" style={{ justifyContent: 'center' }}>
            <img src={logoImg} alt="Freshioz Logo" style={{ maxHeight: '70px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>

          <div className="form-header">
            <h3>Welcome Back!</h3>
            <p>Sign in to manage your Freshioz account</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form" autoComplete="off">
            <div className="form-group">
              <label>Mobile Number / Email</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  name="loginId"
                  placeholder="Enter mobile number or email"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me-checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            <Button type="submit" className="submit-btn" size="lg" disabled={loading}>
              <Leaf size={18} className="btn-icon" /> {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="signup-prompt">
              Don't have an account? <a href="#">Create Account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;