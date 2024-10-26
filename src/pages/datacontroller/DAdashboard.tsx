import '../Styles/DAdashboard.css'; 
import React, {  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';// Import your CSS file

const DAdashboard: React.FC = () => {
    const navigate = useNavigate();


    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await fetch('http://localhost:3000/check-auth-datacontroller', {
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
          const response = await fetch('http://localhost:3000/logout', {
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
    <section className="DAdashboard-container">
        <div className="DAsidebar-container">
            <div className="DAsidebar">
                <div className="DAsidebar-logo">
                    <img src="/obpwlsDAlogo.svg" alt="Logo" className="DAlogo-image" />
                </div>
                    <ul className="DAsidebar-list">
                        <li>
                            <a href="/DAdashboard" className="DAsidebar-linkactive">
                            <img src="/dashboardlogo.svg" alt="Logo" className="sidebarlogoimage" />Dashboard
                            </a>
                        </li>
                        <li>
                            <a href="/DAforassessment" className="DAsidebar-link">
                            <img src="/DAforassessmentlogo.svg" alt="Logo" className="sidebarlogoimage" />For Assessment
                            </a>
                        </li>
                        <li>
                            <a href="/DAforpayment" className="DAsidebar-link">
                            <img src="paymentlogo.svg" alt="Logo" className="sidebarlogoimage" />For Payment
                            </a>
                        </li>
                        <li>
                            <a href="/DAreleasedpermits" className="DAsidebar-link">
                            <img src="releasedpermitlogo.svg" alt="Logo" className="sidebarlogoimage" />Released Permits
                            </a>
                        </li>
                        <li>
                            <a href="/DAreportsngraph" className="DAsidebar-link">
                            <img src="reportsngraphlogo.svg" alt="Logo" className="sidebarlogoimage" />Reports/Graphs
                            </a>
                        </li>
                        <li>
                            <a href="/" onClick={handleLogout} className="DAsidebar-link">
                            <img src="logoutlogo.svg" alt="Logo" className="sidebarlogoimage" />Log Out
                            </a>
                        </li>
                    </ul>
        </div>
    </div>

    <div className="DAcontent">
        <header className='DAheader'>
            <h1>Online Business and Work Permit Licensing System</h1>
        </header>
    </div>
    </section>
);

};

export default DAdashboard;