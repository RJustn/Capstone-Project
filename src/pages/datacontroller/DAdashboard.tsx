import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/DAsidebar';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const DAdashboard: React.FC = () => {
  const navigate = useNavigate();

  const [lineChartData, setLineChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'New Permits',
        data: [] as number[],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false,
      },
      {
        label: 'Renewal Permits',
        data: [] as number[],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        fill: false,
      },
    ],
  });

  // Generate labels for years starting from 2010 to the current year
const generateYearLabels = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 2010; year <= currentYear; year++) {
    years.push(year.toString());
  }
  return years;
};

// Mock data: Replace this with actual data from your backend if available
const generateYearlyData = () => {
  return generateYearLabels().map(() => Math.floor(Math.random() * 1000)); // Random data
};

  const [totalPermitsData] = useState({
    labels: generateYearLabels(), 
    datasets: [
      {
        label: 'Total Permits Released',
        data: generateYearlyData(),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true, // Filled area under the line
      },
    ],
  });

  const [dashboardData, setDashboardData] = useState({
    totalPermitApplications: '',
    totalRenewalApplications: '',
    totalCollections: '',
    totalReleased: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/check-auth-datacontroller', {
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
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workingResponse, businessResponse] = await Promise.all([
          fetch('/chart/working-permits', { method: 'GET', credentials: 'include' }),
          fetch('/chart/business-permits', { method: 'GET', credentials: 'include' })
        ]);

        if (workingResponse.ok && businessResponse.ok) {
          const workingData = await workingResponse.json();
          const businessData = await businessResponse.json();

          const processedData = {
            labels: ['Permits'],
            datasets: [
              {
                label: 'Business Permits',
                data: [businessData.count],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
              },
              {
                label: 'Working Permits',
                data: [workingData.count],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false,
              },
            ],
          };
          setLineChartData(processedData);

          const dashboardResponse = await fetch('/dashboard/data', { method: 'GET', credentials: 'include' });
          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            setDashboardData({
              totalPermitApplications: dashboardData.totalPermitApplications,
              totalRenewalApplications: dashboardData.totalRenewalApplications,
              totalCollections: dashboardData.totalCollections,
              totalReleased: dashboardData.totalReleased,
            });
          } else {
            console.error('Error fetching dashboard data');
          }
        } else {
          console.error('Error fetching permit data');
        }
      } catch (error) {
        console.error('Error fetching permit data:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
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
    <section className="DAbody">
      <div className="DAsidebar-container">
        <DASidebar handleLogout={handleLogout} />
      </div>

      <div className="DAcontent">
        <header className="DAheader">
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>

        <div>
          <h2>Work Permit</h2>
        </div>

        <div className="DAstats-chart-container">
          <div className="DAstats">
            <div>{`Total Permit Applications for 2024: ${dashboardData.totalPermitApplications}`}</div>
            <div>{`Total Renewal Applications for 2024: ${dashboardData.totalRenewalApplications}`}</div>
            <div>{`Total Collections 2024: ${dashboardData.totalCollections}`}</div>
            <div>{`Total Released 2024: ${dashboardData.totalReleased}`}</div>
          </div>
          
          <div className="DaChartcontainer">
          <div className="DAchart">
              <Line data={totalPermitsData} />
            </div>
            <div className="DAchart">
              <Line data={lineChartData} />
            </div>
          </div>
        </div>

        <div>
          <h2>Business Permit</h2>
        </div>
        <div className="DAstats-chart-container">
          <div className="DAstats">
            <div>{`Total Permit Applications for 2024: ${dashboardData.totalPermitApplications}`}</div>
            <div>{`Total Renewal Applications for 2024: ${dashboardData.totalRenewalApplications}`}</div>
            <div>{`Total Collections 2024: ${dashboardData.totalCollections}`}</div>
            <div>{`Total Released 2024: ${dashboardData.totalReleased}`}</div>
          </div>
          
          <div className="DaChartcontainer">
          <div className="DAchart">
              <Line data={totalPermitsData} />
            </div>
            <div className="DAchart">
              <Line data={lineChartData} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DAdashboard;