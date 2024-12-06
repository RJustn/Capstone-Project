import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/DAsidebar';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const DAdashboard: React.FC = () => {
  const navigate = useNavigate();

  const [WorkingPermitChart, setWorkingpermitchart] = useState({
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

  const [BusinessPermitChart, setBusinessPermitChart] = useState({
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

  const [totalWorkingPermitsData, setTotalWorkingPermitsData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Total Working Permits Released',
        data: [] as number[],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true, // Filled area under the line
      },
    ],
  });

  const [totalBusinessPermitsData, settotalBusinessPermit] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Total Working Permits Released',
        data: [] as number[],
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
        const response = await fetch('http://localhost:3000/client/check-auth-datacontroller', {
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
        const [
          newPermitsResponse,
          renewalPermitsResponse,
          workingPermitsResponse,
          businessPermitsResponse,
          newBusinessPermitsResponse,
          renewalBusinessPermitsResponse
        ] = await Promise.all([
          fetch('http://localhost:3000/datacontroller/newWorkingpermits', { method: 'GET', credentials: 'include' }),
          fetch('http://localhost:3000/datacontroller/renewalWorkingpermits', { method: 'GET', credentials: 'include' }),
          fetch('http://localhost:3000/datacontroller/workingpermitsChart', { method: 'GET', credentials: 'include' }),
          fetch('http://localhost:3000/datacontroller/businesspermitsChart', { method: 'GET', credentials: 'include' }),
          fetch('http://localhost:3000/datacontroller/newBusinesspermits', { method: 'GET', credentials: 'include' }),
          fetch('http://localhost:3000/datacontroller/renewalBusinesspermits', { method: 'GET', credentials: 'include' })
        ]);

        if (!newPermitsResponse.ok) {
          console.error('Error fetching new permits data:', newPermitsResponse.statusText);
        }
        if (!renewalPermitsResponse.ok) {
          console.error('Error fetching renewal permits data:', renewalPermitsResponse.statusText);
        }
        if (!workingPermitsResponse.ok) {
          console.error('Error fetching working permits data:', workingPermitsResponse.statusText);
        }
        if (!businessPermitsResponse.ok) {
          console.error('Error fetching business permits data:', businessPermitsResponse.statusText);
        }
        if (!newBusinessPermitsResponse.ok) {
          console.error('Error fetching new business permits data:', newBusinessPermitsResponse.statusText);
        }
        if (!renewalBusinessPermitsResponse.ok) {
          console.error('Error fetching renewal business permits data:', renewalBusinessPermitsResponse.statusText);
        }

        if (newPermitsResponse.ok && renewalPermitsResponse.ok && workingPermitsResponse.ok && businessPermitsResponse.ok && newBusinessPermitsResponse.ok && renewalBusinessPermitsResponse.ok) {
          const newPermitsData = await newPermitsResponse.json();
          const renewalPermitsData = await renewalPermitsResponse.json();
          const workingPermitsData = await workingPermitsResponse.json();
          const businessPermitsData = await businessPermitsResponse.json();
          const newBusinessPermitsData = await newBusinessPermitsResponse.json();
          const renewalBusinessPermitsData = await renewalBusinessPermitsResponse.json();

          setWorkingpermitchart({
            labels: ['Permits'],
            datasets: [
              {
                label: 'New Permits',
                data: [newPermitsData.count],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true,
              },
              {
                label: 'Renewal Permits',
                data: [renewalPermitsData.count],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });

          setBusinessPermitChart({
            labels: ['Permits'],
            datasets: [
              {
                label: 'New Business Permits',
                data: [newBusinessPermitsData.count],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true,
              },
              {
                label: 'Renewal Business Permits',
                data: [renewalBusinessPermitsData.count],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });

          setTotalWorkingPermitsData({
            labels: ['Permits'],
            datasets: [
              {
                label: 'Total Permits Released',
                data: [workingPermitsData.count],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });

          settotalBusinessPermit({
            labels: ['Permits'],
            datasets: [
              {
                label: 'Total Business Permits Released',
                data: [businessPermitsData.count],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });

        
          const dashboardResponse = await fetch('/dashboard/data', { method: 'GET', credentials: 'include' });
          if (dashboardResponse.ok) {
            const WorkdashboardData = await dashboardResponse.json();
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
            <div>{`Total Permit Applications: ${dashboardData.totalPermitApplications}`}</div>
            <div>{`Total Renewal Applications : ${dashboardData.totalRenewalApplications}`}</div>
            <div>{`Total Collections: ${dashboardData.totalCollections}`}</div>
            <div>{`Total Released: ${dashboardData.totalReleased}`}</div>
          </div>
          
          <div className="DaChartcontainer">
          <div className="DAchart">
              <Line data={totalWorkingPermitsData} />
            </div>
            <div className="DAchart">
              <Line data={WorkingPermitChart} />
            </div>
          </div>
        </div>

        <div>
          <h2>Business Permit</h2>
        </div>
        <div className="DAstats-chart-container">
          <div className="DAstats">
            <div>{`Total Permit Applications: ${dashboardData.totalPermitApplications}`}</div>
            <div>{`Total Renewal Applications: ${dashboardData.totalRenewalApplications}`}</div>
            <div>{`Total Collections: ${dashboardData.totalCollections}`}</div>
            <div>{`Total Released: ${dashboardData.totalReleased}`}</div>
          </div>
          
          <div className="DaChartcontainer">
          <div className="DAchart">
              <Line data={totalBusinessPermitsData} />
            </div>
            <div className="DAchart">
              <Line data={BusinessPermitChart} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DAdashboard;