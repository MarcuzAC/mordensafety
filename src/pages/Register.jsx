import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const Register = () => {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '400px',
    border: 'none',
    borderBottom: '3px solid #3b82f6',
    padding: '16px 10px',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '18px',
    outline: 'none',
    backgroundColor: 'transparent',
    transition: 'border-color 0.2s',
  };

  const inputFocusStyle = {
    borderBottom: '3px solid #1e40af',
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    fontSize: '18px',
  };

  const buttonHoverStyle = {
    backgroundColor: '#1e40af',
    transform: 'scale(1.05)',
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)', // Adjust if navbar height changes
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {error && (
          <div
            style={{
              color: '#b91c1c',
              fontSize: '14px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          required
          value={formData.full_name}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          required
          value={formData.phone}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            style={{ ...inputStyle, paddingRight: '40px' }}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {showPassword ? <EyeOff size={22} color="#3b82f6" /> : <Eye size={22} color="#3b82f6" />}
          </button>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ ...inputStyle, paddingRight: '40px' }}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {showConfirmPassword ? <EyeOff size={22} color="#3b82f6" /> : <Eye size={22} color="#3b82f6" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        >
          {loading ? (
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '4px solid #fff',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          ) : (
            <>
              <UserPlus size={20} />
              <span>Create Account</span>
            </>
          )}
        </button>

        <div style={{ marginTop: '16px', fontSize: '16px', textAlign: 'center', color: '#3b82f6' }}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600, textDecoration: 'none', color: '#1e40af' }}>
            Sign in
          </Link>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </form>
    </div>
  );
};

export default Register;
