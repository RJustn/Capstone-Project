import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/NavigationBars/DAsidebar';
import React, {  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';// Import your CSS file

const DataControllerForAssessment: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-datacontroller', {
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


      return (
        <section className="DAbody">
            <div className="DAsidebar-container">
                <DASidebar />
            </div>

            <div className="DAcontent">
                <header className="DAheader">
                    <h1>Online Business and Work Permit Licensing System</h1>
                </header>

                <div className="button-container"> {/* Centering container */}
  <a href="/DAforassessmentBP/new" className="DAbusinesspermitbutton">
    For Assessment New Business Permit
  </a>
  <a href="/DAforassessmentBP/renew" className="DAbusinesspermitbutton">
    For Assessment Renew Business Permit
  </a>
  <a href="/DAforassessmentBP/" className="DAbusinesspermitbutton">
    View All For Assessment Business Permit
  </a>
</div>

            <div className="button-container"> {/* Centering container */}       
                    <a href="/DAforassessmentWP/new" className="DAworkpermitbutton">
                        For Assessment New Working Permit
                    </a>
                    <a href="/DAforassessmentWP/renew" className="DAworkpermitbutton">
                        For Assessment Renew Working Permit
                    </a>
                    <a href="/DAforassessmentWP/" className="DAworkpermitbutton">
                        View All For Assessment Working Permit
                    </a>
            </div>
            </div>
        </section>
    );
};

export default DataControllerForAssessment;