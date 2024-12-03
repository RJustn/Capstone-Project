import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/DAsidebar';
import React, {  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';// Import your CSS file


const DataControllerReleasedPermit: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await fetch('http://localhost:3000/client/check-auth-datacontroller', {
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
      }, [navigate]); // Only depend on navigate, which is necessary for the redirection

      const handleLogout = async () => {
        try {
          const response = await fetch('http://localhost:3000/client/logout', {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
          });
      
          if (response.ok) {
            // Clear any local storage data (if applicable)
            localStorage.removeItem('profile');
            localStorage.removeItem('userId');
      
            // Redirect to the login page
            navigate('/');
          } else {
            // Handle any errors from the server
            const errorData = await response.json();
            console.error('Logout error:', errorData.message);
          }
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };

return (
    <section className="DAbody">
    <div className="DAsidebar-container">
        <DASidebar handleLogout={handleLogout} /> {/* Pass handleLogout to DASidebar */}
      </div>

    <div className="DAcontent">
        <header className='DAheader'>
            <h1>Online Business and Work Permit Licensing System</h1>
        </header>

        <div className="button-container">
        <a href="/DAreleasedpermitsBP" className='DAbusinesspermitbutton'>
              Released New Business Permit
            </a>
            <a href="/DAreleasedpermitsWP" className='DAworkpermitbutton'>
              Released New Working Permit
            </a>
        </div>

        
        <div className="button-container">
        <a href="/DAreleasedpermitsBP" className='DAbusinesspermitbutton'>
              Released Renew Business Permit
            </a>
            <a href="/DAreleasedpermitsWP" className='DAworkpermitbutton'>
              Released Renew Working Permit
            </a>
        </div>

        <div className="button-container">
        <a href="/DAreleasedpermitsBP" className='DAbusinesspermitbutton'>
              View All Released  Business Permit
            </a>
            <a href="/DAreleasedpermitsWP" className='DAworkpermitbutton'>
              View All Released  Working Permit
            </a>
        </div>



    </div>
    </section>
);

};

export default DataControllerReleasedPermit;