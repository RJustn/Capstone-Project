import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
  
    try {
      const response = await axios.post('http://capstone-project-phi-navy.vercel.app/auth/login', {
        email, 
        password,
      }, {
        withCredentials: true, // Send cookies with the request
      });
  
      const data = response.data;  // Axios automatically parses JSON
      if (response.status === 200) {
        // Store the JWT token
        localStorage.setItem('token', data.token);
        setSuccess(data.message);
        setError(null);
        
        // Check the user's role and navigate accordingly
        switch (data.role) {
          case 'Admin':
            navigate('/Adashboard'); // Redirect to admin dashboard
            break;
          case 'Client':
            navigate('/dashboard'); // Redirect to client dashboard
            break;
          case 'Data Controller':
            navigate('/DAdashboard'); // Redirect to data controller dashboard
            break;
          default:
            navigate('/'); // Fallback dashboard
        }
      } 
      
      if (data.error === 'Email is not verified') {
        navigate('/emailverification', { state: { email } }); // Redirect to email verification page if email not verified
      } else {
        setError(data.error);
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error) {
      setError('Error logging in');
      console.error('Error logging in', error);
    }
  };
  

  const handleCancel = () => {
    navigate('/'); // Redirect to home page
  };

  const navigateForgotpassword = () => {
    navigate('/login'); // Redirect to the login page
  };

  const navigateSignup = () => {
    navigate('/signup'); // Redirect to the login page
  };

  return (
    <div className="bodylogin">
      <div className="login-container">
      <h2 className="text-center mb-4">Log In</h2>
      {error && <p className="text-danger text-center">{error}</p>}
      {success && <p className="text-success text-center">{success}</p>}
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
          <a onClick={navigateSignup} className="d-block text-decoration-none mb-2" style={{ fontSize: '12px' }}>
            Don't have an account? <strong>Sign up</strong>
          </a>
          <a onClick={navigateForgotpassword} className="text-decoration-none" style={{ fontSize: '12px' }}>
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  </div>
  );
};

export default Login;
