import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './Styles/signup.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import Swal from 'sweetalert2';


const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    
        if (!agreeToTerms) {
          Swal.fire({
            icon: 'warning',
            title: 'Agreement Required',
            text: 'You must agree to the terms to proceed.',
          });
          return;
        }
    
    
    // Validate form
    if (!firstName || !middleName || !lastName || !email || !password || !contactNumber || !address) {
      setError('All required fields must be filled out.');
      return;
    }

    // Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError('Please enter a valid email address.');
  return;
}

if (confirmpassword !== password) {
  setError('Password does not match.');
  return;
}
    
const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
if (!passwordRegex.test(password)) {
    setError('Password must be at least 8 or more characters long, contain at least one number, and one uppercase letter.');
    return;
}

    try {
      // Sending request using axios
      const response = await axios.post('https://capstone-project-backend-nu.vercel.app/auth/signup', {
        firstName,
        middleName,
        lastName,
        contactNumber,
        address,
        email,
        password,
        isVerified: false,  // You might want to adjust this logic later
      });
  
      if (response.status === 201) {
    await Swal.fire({
      icon: 'success',
      title: 'Registration Successful!',
      text: response.data.message || 'Your account has been created. Please verify your email.',
      timer: 2000,
      showConfirmButton: false,
    });

    navigate('/emailverification', { state: { email } });
  }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          setError('A user with this email already exists. Please try logging in.');
        } else {
          console.error('Error signing up:', error);
          setError('An unexpected error occurred. Please try again later.');
        }
      } else {
        console.error('Unknown error:', error);
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };
  

  const handleCancel = () => {
    navigate('/'); // Redirect to home page
  };

  const navigateLogin = () => {
    navigate('/login'); // Redirect to the login page
  };

    // Timer to clear the error after 3 seconds
    useEffect(() => {
      if (error) {
        const timer = setTimeout(() => {
          setError(null);
        }, 3000); // 3 seconds
  
        return () => clearTimeout(timer); // cleanup
      }
    }, [error]);
  

  return (
    <>
      <div className="body">
      <div className="signup-container" >
              <h2 className="text-center mb-4">Sign Up</h2>
              {error && <p className="text-danger text-center">{error}</p>}
              {success && <p className="text-success text-center">{success}</p>}
              <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                          <input
                          type="text"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="form-control"
                          required
                          />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="middleName" className="form-label">Middle Name</label>
                          <input
                          type="text"
                          id="middleName"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          className="form-control"
                          />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                          <input
                          type="text"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="form-control"
                          required
                          />
                      </div>
                    </div>
                  </div>
                  
                   <div className="row mb-3">
        <div className="col-md-12">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="contactNumber" className="form-label">Contact Number</label>
            <input
              type="text"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 11) { // Only numbers & max 11 digits
                  setContactNumber(value);
                }
              }}
              className="form-control"
              required
            />
          </div>
        </div>
      	<div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="row mb-3">
      <div className="col-md-12">
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
        </div>
        
         <div className="row mb-3">
        <div className="col-md-12">
          <div className="mb-3">
            <label htmlFor="confirmpassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmpassword"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>
        </div>

        <div className="form-check mb-3">
        <input
        type="checkbox"
        id="agreeToTerms"
        className="form-check-input mt-1 mr-2"
        checked={agreeToTerms}
        onChange={(e) => setAgreeToTerms(e.target.checked)}
        required
        />
        <label htmlFor="agreeToTerms" className="form-check-label text-sm ml-2">
          I agree to the creation of an account and the processing of my personal information in accordance with the
          <a 
          href="/OWBPLS-TERMS-N-CONDITION.pdf" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-decoration-none ml-1"
        >
          Terms and Conditions
        </a>.
        </label>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <a onClick={navigateLogin} className="text-primary" style={{ fontSize: '12px' }}>
          Already have an account? <br></br> Click here to Log in
        </a>
        <button type="submit" className="btn btn-success">
          Sign Up
        </button>
      </div>
    </form>
    </div>


      </div>
    </>
  );
};

export default Signup;
