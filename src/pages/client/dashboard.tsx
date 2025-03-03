import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ClientStyles.css'; //  CSS file
import ClientNavbar from '../components/NavigationBars/clientnavbar';
import { WorkPermit, GroupedBusinessPermit } from "../components/Interface(Front-end)/Types";
import WorkPermitTable from "../components/Tables/WorkPermitTable-Client";
import BusinessPermitTable from "../components/Tables/BusinessPermitTable-Client";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<{ email: string; firstName: string; lastName: string; id: string} | null>(null);;
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [businessPermits, setBusinessPermits] = useState<GroupedBusinessPermit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [latestStatus, setLatestStatus] = useState<string | null>(null);

  



 

//Content Codes

const checkForPending = async () => {
  try {
    const response = await fetch('https://capstone-project-backend-nu.vercel.app/client/checkpermitlatest', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      console.error('Error fetching permit status');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to fetch permit status. Please try again later.',
      });
      return;
    }

    const data = await response.json();

    // Handle different statuses with SweetAlert2
    if (data.status === 'Pending') {
      Swal.fire({
        icon: 'info',
        title: 'Pending Approval',
        text: 'Your permit application is pending approval. Please wait for further updates.',
      });
      return;
    }

    if (data.status === 'Waiting for Payment') {
      Swal.fire({
        icon: 'warning',
        title: 'Payment Required',
        text: 'Your permit is awaiting payment. Please complete the payment.',
      });
      return;
    }

    if (data.status === 'Released') {
      Swal.fire({
        icon: 'warning',
        title: 'Ongoing Permit',
        text: 'You have an ongoing permit. Please wait for expiry.',
      });
      return;
    }


    // Default case if none of the above conditions match
    navigate('/workpermitpage');

  } catch (error) {
    console.error('Error checking permit status:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong. Please try again later.',
    });
  }
};

const fetchProfile = async () => {
  try {
    const response = await fetch('https://capstone-project-backend-nu.vercel.app/client/profile', {
      method: 'GET',
      credentials: 'include', // Ensure cookies (containing the token) are sent
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const userData = await response.json();
    setUserDetails(userData.user);
    localStorage.setItem('profile', JSON.stringify(userData.user));
    localStorage.setItem('userId', userData.id);
  } catch (error) {
    console.error('Error fetching profile:', error);
    setError('Failed to fetch profile, please try again.');
  }
};

const fetchWorkPermits = async () => {
  try {
    const response = await fetch('https://capstone-project-backend-nu.vercel.app/client/fetchuserworkpermits', {
      method: 'GET',
      credentials: 'include', // Ensure cookies (containing the token) are sent
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const workPermitData = await response.json();
    setWorkPermits(workPermitData);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    setError('Failed to fetch work permits, please try again.');
  }
};

//useEffects
useEffect(() => {
  fetchProfile();
  fetchWorkPermits();
}, []); // Remove workPermits from dependencies



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
    
      } 
    };
  
    checkAuth();
  }, [navigate]);

useEffect(() => {
  if (workPermits.length > 0) {
    // Function to extract and convert DDMMYYYY to YYYYMMDD for comparison
    const convertDateForComparison = (permitID: string) => {
      const dateString = permitID.slice(-8); // Extract the last 8 characters (DDMMYYYY)
      const day = dateString.slice(0, 2);
      const month = dateString.slice(2, 4);
      const year = dateString.slice(4, 8);
      return `${year}${month}${day}`; // Return YYYYMMDD for proper sorting
    };

    // Function to extract sequenceString for comparison
    const extractSequenceString = (permitID: string) => {
      return permitID.match(/\d+/)?.[0] || '0'; // Extract the number from the sequence, assuming it's digits
    };

    // Sort work permits based on date first, then sequenceString
    const sortedPermits = workPermits.sort((a, b) => {
      const dateA = convertDateForComparison(a.id);
      const dateB = convertDateForComparison(b.id);

      // If dates are the same, compare sequenceString
      if (dateA === dateB) {
        const seqA = parseInt(extractSequenceString(a.id), 10);
        const seqB = parseInt(extractSequenceString(b.id), 10);
        return seqB - seqA; // Sort by sequence number (higher number means more recent)
      }
      return dateB.localeCompare(dateA); // Sort by date in descending order
    });

    // The first item in the sorted array is the latest
    setLatestStatus(sortedPermits[0].workpermitstatus);
  }
}, [workPermits]); // This effect now depends only on workPermits

useEffect(() => {
  const fetchBusinessPermits = async () => {
    try {
      const response = await fetch('https://capstone-project-backend-nu.vercel.app/client/fetchuserbusinesspermits', {
        method: 'GET',
        credentials: 'include', // Ensure cookies (containing the token) are sent
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const businessPermitData = await response.json();
      setBusinessPermits(businessPermitData);
    } catch (error) {
      console.error('Error fetching business permits:', error);
    }
  };

  fetchBusinessPermits();
}, []); // Business Permit



  return (
    <section className="dashboard-container">
        {/* Navbar */}
      <ClientNavbar/>

      <div className="content">
      <div id="carouselExampleFade" className="carousel slide carousel-fade" style={{ width: '60%', margin: 'auto' }} >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="https://res.cloudinary.com/dqbobmeyb/image/upload/v1741007084/step1_lipali.png"  className="d-block w-100" alt="..."></img>
          </div>
          <div className="carousel-item">
            <img src="https://res.cloudinary.com/dqbobmeyb/image/upload/v1741007084/step2_cms6zl.png"  className="d-block w-100" alt="..."></img>
          </div>
          <div className="carousel-item">
            <img src="https://res.cloudinary.com/dqbobmeyb/image/upload/v1741007084/step3_zr6co0.png"  className="d-block w-100" alt="..."></img>
          </div>
          <div className="carousel-item">
            <img src="https://res.cloudinary.com/dqbobmeyb/image/upload/v1741007085/step4_anzkoi.png"  className="d-block w-100" alt="..."></img>
          </div>
          <div className="carousel-item">
            <img src="https://res.cloudinary.com/dqbobmeyb/image/upload/v1741007085/step5_thnx9e.png"  className="d-block w-100" alt="..."></img>
          </div>
        </div> 
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
  
        {error && <p className="error">{error}</p>}
        {userDetails ? (
          <div className="user-details">
            <h2>Welcome, {userDetails.firstName} {userDetails.lastName}!</h2>
            {/* Display other user details as needed */}
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
        
        <div className="applicationcontainer">
          <div>
            <a href="/businesspermitpage" className="businesspermitbutton">
              <img 
                src="applicationslogo.svg" 
                alt="Logo" 
                className="button-logo" 
              />
            <span>Apply for Business Permit</span>
            </a>
          </div>
          <div>
          <a 
          href={!(latestStatus === 'Pending' || latestStatus === 'Waiting for Payment' || latestStatus === 'Released') ? "/workpermitpage" : "#"} 
          className='workpermitbutton'
          onClick={checkForPending}
            >
              <img 
                src="applicationslogo.svg" 
                alt="Logo" 
                className="button-logo" 
              />
          <span>Apply for Work Permit</span>
          </a>
          </div>
        </div>



      <WorkPermitTable workPermits={workPermits}/>

      <BusinessPermitTable businessPermits={businessPermits}/>

      </div>
    </section>
  );
  
};

export default Dashboard;