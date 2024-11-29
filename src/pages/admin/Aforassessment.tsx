import { useEffect } from "react";
// import ASidebar from '../components/Asidebar';
import { useNavigate } from "react-router";



const Aforassessment: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:3000/client/check-auth-admin', {
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

    // const handleLogout = async () => {
    //     try {
    //       const response = await fetch('http://localhost:3000/client/logout', {
    //         method: 'POST',
    //         credentials: 'include',
    //       });
    
    //       if (response.ok) {
    //         localStorage.removeItem('profile');
    //         localStorage.removeItem('userId');
    //         navigate('/');
    //       } else {
    //         const errorData = await response.json();
    //         console.error('Logout error:', errorData.message);
    //       }
    //     } catch (error) {
    //       console.error('Error logging out:', error);
    //     }
    //   };

    return (
        <>
          <div className="Asidebar-container">
                {/* <ASidebar handleLogout={handleLogout} /> */}
            </div>
        <div>
            <header>   
            <h1>Admin For Assessment</h1>
            </header>
        </div>
        <div className="Abutton-container"> {/* Centering container */}
                <a href="/AforassessmentBP" className="Abusinesspermitbutton">
                    For Assessment Business Permit
                </a>
                <a href="/AforassessmentWP" className="Aworkpermitbutton">
                    For Assessment Working Permit
                </a>

            </div></>
        
    );
}

export default Aforassessment;
