import '../Styles/AdminStyles.css'; 
import AdminSideBar from '../components/AdminSideBar';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const Adashboard: React.FC = () => {
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

  const handleLogout = async () => {
try {
  const response = await fetch('http://localhost:3000/client/logout', {
method: 'POST',
credentials: 'include',
  });

  if (response.ok) {
localStorage.removeItem('profile');
localStorage.removeItem('userId');
navigate('/');
  } else {
const errorData = await response.json();
console.error('Logout error:', errorData.message);
  }
} catch (error) {
  console.error('Error logging out:', error);
}
};

  return (
    <section className="Abody">
      <div className="Asidebar-container">
        <AdminSideBar handleLogout={handleLogout} />
      </div>

      <div className="Acontent">
        <header className="Aheader">
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>

        
      </div>
    </section>
  );
};

export default Adashboard;