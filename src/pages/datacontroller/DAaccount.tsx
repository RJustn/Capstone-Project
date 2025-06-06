import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/DataControllerStyles.css';
import DASidebar from '../components/NavigationBars/DAsidebar';
import Swal from 'sweetalert2';
interface User {
  _id: string;
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  password: string;
}

const DataControllerAccount: React.FC = () => {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [confirmpassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState(userDetails?.email || '');
  const [password, setPassword] = useState(userDetails?.password || '');

  useEffect(() => {
    if (!token) {
      navigate('/'); // Redirect to login if no token
      return;
    } else {
      if (userDetails?.email) {
        setEmail(userDetails.email); // Update email if userDetails changes
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

          if (response.ok) {
            const data = await response.json();
            setUserDetails(data.user);
            setError(null);
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Error fetching user details.');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setError('Failed to fetch user details, please try again.');
        }
      };
      fetchUserDetails();
    }

    return () => {}; // Clear interval on component unmount or when countdown reaches 0
  }, [token, navigate, userDetails]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-datacontroller', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          console.error('Access denied: No token');
          navigate('/login');
          return;
        }

        if (response.status === 204) {
          console.log('Access Success');
          return;
        }

        console.error('Unexpected response status:', response.status);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard. Please try again.');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChangePassword = async () => {
    if (!userDetails?.email) return;
    
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
        text: 'Passwords do not match.',
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

      const response = await fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/changepassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userDetails.email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password changed successfully!',
        });
        handleButtonClick();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Failed to change password.',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error changing password, please try again.',
      });
    }
  };
  
  const handleButtonClick = () => {
    setIsFormVisible(!isFormVisible);
    setConfirmPassword('');
    setPassword('');
  
  };

  return (
    <section className="DAbody">
      <div className="DAsidebar-container">
        <DASidebar/> {/* Pass handleLogout to DASidebar */}
      </div>

      <div className="DAcontent">
        <header className="DAheader">
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
                <button className='back-button' onClick={handleButtonClick}>
                  {isFormVisible ? 'Close' : 'Change Password?'}
                </button>

                {isFormVisible && (
                  <div className="modal-overlay" style={{ display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
                    <div className="modal centered-modal" style={{ display: 'block', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', margin: '10px', maxHeight: '45%' }}>
                      <h1>Change Password</h1>
                      {error && <p className="error">{error}</p>}
                      <div className="input-row">
                        <div className="form-group">
                          <label htmlFor="email">Email:</label>
                          <input
                          disabled
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>
                      <div className="input-row">
                        <div className="form-group">
                          <label htmlFor="password">Password:</label>
                          <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                          />
                        </div>
                      </div>
                      <div className="input-row">
                        <div className="form-group">
                          <label htmlFor="confirmpassword">Confirm Password:</label>
                          <input
                            type="password"
                            id="confirmpassword"
                            value={confirmpassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                          />
                        </div>
                      </div>
                      <div className="button-group">
                        <button type="button" className="cancelForgotPassword" onClick={handleButtonClick}>
                          Cancel
                        </button>
                        <button type="button" className="back-button" onClick={handleChangePassword}>
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
      </div>
    </section>
  );
};

export default DataControllerAccount;