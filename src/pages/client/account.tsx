import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ClientStyles.css'; // Import CSS file
import ClientNavbar from '../components/NavigationBars/clientnavbar';
import { User } from "../components/Interface(Front-end)/Types";
import Swal from 'sweetalert2';

const Account: React.FC = () => {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
//For ForgetPassword @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const [otp, setOtp] = useState('');
const [otpSent, setOtpSent] = useState(false);
const [otpCountdown, setOtpCountdown] = useState<number | null>(null); // Timer countdown state

const [confirmpassword, setConfirmPassword] = useState('');
const [email, setEmail] = useState(userDetails?.email || '');
const [password, setPassword] = useState(userDetails?.password || '');  // Set initial state from location


//End Forget Password @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
useEffect(() => {
  if (!token) {
    navigate('/');
    return;
  }

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('https://capstone-project-backend-nu.vercel.app/client/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUserDetails(data.user);
        setEmail(data.user.email);
        setError(null);
      } else {
        setError(data.error || 'Error fetching user details.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details, please try again.');
    }
  };

  fetchUserDetails();
}, [token, navigate]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
  
    if (otpSent && otpCountdown !== null && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (otpCountdown === 0) {
      setOtpSent(false);
      setOtpCountdown(null);
    }
  
    return () => {
      clearInterval(timer);
    };
  }, [otpSent, otpCountdown]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-client', {
          method: 'GET',
          credentials: 'include', // This ensures cookies are sent with the request
        });
  
        if (response.status === 401) {
          // If unauthorized, redirect to login
          console.error('Access denied: No token');
          navigate('/login');
          return;
        }
  
        if (response.status === 204) {
          console.log('Access Success');
          return;
        }
  
        // Handle unexpected response
        console.error('Unexpected response status:', response.status);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard. Please try again.');
      } 
    };
  
    checkAuth();
  }, [navigate]); // Only depend on navigate, which is necessary for the redirection
  

// For Forget Password @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


const handleSendOtp = async () => {
  if (!userDetails?.email) return;

  try {
    // Show loading while sending OTP
    Swal.fire({
      title: 'Sending OTP...',
      text: 'Please wait...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/sendOTP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userDetails?.email }),
    });

    const data = await response.json();

    Swal.close(); // Close the loading after response

    if (response.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: 'An OTP has been sent to your email.',
      });
      setOtpSent(true); // Disable the button
      setOtpCountdown(30); // Set countdown to 30 seconds
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send OTP',
        text: data.error || 'Something went wrong.',
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    Swal.close(); // Close loading if error happens
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error sending OTP, please try again.',
    });
  }
};




const handleVerifyOtp = async () => {


  if (!otp) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Missing OTP',
    });
    return;
  }

  if (password.length < 8) {
    Swal.fire({
      icon: 'error',
      title: 'Weak Password',
      text: 'Password must be at least 8 characters long.',
    });
    return;
  }

  if (confirmpassword !== password) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Passwords do not match!',
    });
    return;
  }



  try {
         Swal.fire({
            title: 'Please wait...',
            text: 'Changing your password...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });
          
    const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/updatepassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userDetails?.email, otp, password }),
    });

    const data = await response.json();

    if (response.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Password changed successfully!',
      });
  
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.error || 'Failed to verify OTP.',
      });
    }
  } catch (error) {
    console.error('Error verifying OTP, please try again.', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error verifying OTP, please try again.',
    });
  }
};


// End Forget Password @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@




  const handleButtonClick = () => {
    setIsFormVisible(!isFormVisible);
    setOtp('');
    setConfirmPassword('');
    setPassword('');
  };

  return (
    <section className="dashboard-container">
  <ClientNavbar/>


  <div className="content">
    <header>
      <h1>Online Business and Work Permit Licensing System</h1>
    </header>

  <div className="account-page">
  {error && <p className="error">{error}</p>}
  {userDetails ? (
    <div className="user-details">
      <div className="profile-info">
        <div className="profile-picture">
          <img src="/profileicon.svg" alt="Profile Icon" />
        </div>
        <h2>{userDetails.firstName} {userDetails.middleName} {userDetails.lastName}</h2>
      </div>

      <div className="user-info">
        <p>User Details: <span>{userDetails?.email}</span></p>
        <p>Contact Number: <span>{userDetails?.contactNumber}</span></p>
        <p>Address: <span>{userDetails?.address}</span></p>
      </div>

      <div>
      {/* Step 3: Render a button to toggle the form */}
      <button className='viewpermitbutton' onClick={handleButtonClick}>
        {isFormVisible ? 'Close' : 'Change Password?'}
      </button>

      {/* Conditionally render the form based on isFormVisible */}
      {isFormVisible && (
        <div className="account_modal-overlay" onClick={handleButtonClick}>
          <div className="account_modal" onClick={(e) => e.stopPropagation()}>
        <h1>Change Password</h1>
        {error && <p className="account_error">{error}</p>}
        <div className="account_input-row">
            <div className="account_form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    disabled
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
        </div>
        <div className="account_input-row">
            <div className="account_form-group">
                <label htmlFor="account_otp">Enter OTP:</label>
                <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                />
            </div>
        </div>
        <div className="account_input-row">
            <div className="account_form-group">
                <label htmlFor="otp">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
        </div>
        <div className="account_input-row">
            <div className="account_form-group">
                <label htmlFor="otp">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmpassword"
                    value={confirmpassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>
        </div>
        <div className="account_button-group">
        <button type="button" className="account_cancelForgotPassword" onClick={handleButtonClick}>
            Cancel
        </button>
            <button
                type="button"
                className={`account_sendotp ${otpSent ? 'account_disabled-button' : ''}`}  // Add conditional class
                onClick={handleSendOtp}
                disabled={otpSent} // Disable button if OTP is sent
            >
            Send OTP
            </button>
                <label className="account_otp-timer-label">
                {otpSent && otpCountdown !== null ? `(${otpCountdown}s)` : ''}
                </label>
            <button type="button"
                className="account_verifyemail"
                onClick={handleVerifyOtp}
            >
                Change Password
            </button>
        </div>
    </div>
    </div>
      )}
    </div>
    </div>
  ) : (
    <p>Loading user details...</p>
  )}
</div>
 {/* Forget Password Section */}
 














    </div>
</section>
  );
};

export default Account;
