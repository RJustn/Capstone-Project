import '../Styles/DataControllerStyles.css'; 
import AdminSideBar from '../components/NavigationBars/AdminSideBar';
import React, {  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';// Import your CSS file


const Areleasedpermits: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-admin', {
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

      const navigateNewWorkpermit= () => {
        navigate('AreleasedpermitsWP/new'); // Redirect to the login page
      };

      const navigateRenewWorkpermit = () => {
        navigate('AreleasedpermitsWP/renew'); // Redirect to the login page
      };

      const navigateAllWorkpermit = () => {
        navigate('AreleasedpermitsWP/'); // Redirect to the login page
      };

      const navigateNewBusinesspermit= () => {
        navigate('AreleasedpermitsBP/new'); // Redirect to the login page
      };

      const navigateRenewBusinesspermit = () => {
        navigate('AreleasedpermitsBP/renew'); // Redirect to the login page
      };

      const navigateAllBusinesspermit = () => {
        navigate('AreleasedpermitsBP/'); // Redirect to the login page
      };

return (
    <section className="Abody">
    <div className="Asidebar-container">
        <AdminSideBar />{/* Pass handleLogout to DASidebar */}
      </div>

    <div className="Acontent">
        <header className='Aheader'>
            <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div className="button-container">
            <a onClick={navigateNewWorkpermit} className='DAworkpermitbutton'>
              Released New Working Permit
            </a>

            <a onClick={navigateRenewWorkpermit} className='DAworkpermitbutton'>
              Released Renew Working Permit
            </a>

            <a onClick={navigateAllWorkpermit} className='DAworkpermitbutton'>
              View All Released  Working Permit
            </a>
        </div>

        <div className="button-container">
        <a onClick={navigateNewBusinesspermit} className='DAbusinesspermitbutton'>
              Released New Business Permit
            </a>

            <a onClick={navigateRenewBusinesspermit} className='DAbusinesspermitbutton'>
              Released Renew Business Permit
            </a>

            <a onClick={navigateAllBusinesspermit} className='DAbusinesspermitbutton'>
              View All Released  Business Permit
            </a>   
        </div>
    </div>
    </section>
);

};

export default Areleasedpermits;