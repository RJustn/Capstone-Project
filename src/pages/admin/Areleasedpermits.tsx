import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminReleasedPermits: React.FC = () => {
    
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

    return (
       <> <div>
            <h1>Admin Released Permits</h1>
        </div>
            <div className="Abutton-container"> {/* Centering container */}
            <a href="/AreleasedpermitBP" className="Abusinesspermitbutton">
                For Assessment Business Permit
            </a>
            <a href="/AreleasedpermitWP" className="Aworkpermitbutton">
                For Assessment Working Permit
            </a>

        </div></>
    );
}   

export default AdminReleasedPermits;