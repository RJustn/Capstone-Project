import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import Swal from 'sweetalert2';


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'All fields are required.',
      });
      return;
    }

    if (!agreeToTerms) {
      Swal.fire({
        icon: 'warning',
        title: 'Agreement Required',
        text: 'You must agree to the terms to proceed.',
      });
      return;
    }

      
      // Show loading alert
  Swal.fire({
    title: 'Logging in...',
    text: 'Please wait while we authenticate your credentials.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
  
    try {
      const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include credentials to send cookies
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Store the JWT token
        localStorage.setItem('token', data.token);
  
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // Navigate after success
          switch (data.role) {
            case 'Admin':
              navigate('/Adashboard');
              break;
            case 'Client':
              navigate('/dashboard');
              break;
            case 'Data Controller':
              navigate('/DAdashboard');
              break;
            default:
              navigate('/');
          }
        });
  
      } else if (data.error === 'Email is not verified') {
        // Redirect to email verification with SweetAlert prompt
        Swal.fire({
          icon: 'info',
          title: 'Email Not Verified',
          text: 'Please verify your email before logging in.',
          confirmButtonText: 'Verify Now'
        }).then(() => {
          navigate('/emailverification', { state: { email } });
        });
  
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.error,
        });
      }
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.',
      });
      console.error('Error logging in', error);
    }
  };

  


  const handleCancel = () => {
    navigate('/'); // Redirect to home page
  };

  const navigateForgotpassword = () => {
    navigate('/forgotpassword'); // Redirect to the login page
  };

  const navigateSignup = () => {
    navigate('/signup'); // Redirect to the login page
  };

  return (
    <div className="bodylogin">
      <div className="login-container">
      <h2 className="text-center mb-4">Log In</h2>
      <form onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            placeholder="Enter your email"
            required
          />
        </div>
        
        {/* Password Input */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="Enter your password"
            required
          />
        </div>

          <div className="form-check mb-3">
        <input
        type="checkbox"
        id="agreeToTerms"
        className="form-check-input"
        checked={agreeToTerms}
        onChange={(e) => setAgreeToTerms(e.target.checked)}
        required
        />
        <label htmlFor="agreeToTerms" className="form-check-label">
          I agree to the creation of an account and the processing of my personal information in accordance with the data privacy notice
          <a 
          href="/path-to-your-pdf/terms-and-conditions.pdf" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-decoration-none"
        >
          Terms and Conditions
        </a>.
        </label>
      </div>
          
        {/* Buttons and Links */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-success">
            Log In
          </button>
        </div>
        
        {/* Links */}
        <div className="text-center">
          <a onClick={navigateSignup} className="d-block text-decoration-none mb-2" style={{ fontSize: '12px', cursor: 'pointer' }}>
            Don't have an account? <strong>Sign up</strong>
          </a>
          <a onClick={navigateForgotpassword} className="text-decoration-none" style={{ fontSize: '12px', cursor: 'pointer' }}>
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  </div>
  );
};

export default Login;
