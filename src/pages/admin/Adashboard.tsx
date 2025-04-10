import '../Styles/AdminStyles.css'; 
import AdminSideBar from '../components/NavigationBars/AdminSideBar';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { FaBriefcase, FaBuilding, FaFileAlt, FaSyncAlt, FaDollarSign, FaCheck } from 'react-icons/fa'; // Import the icons
import * as XLSX from 'xlsx';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const Adashboard: React.FC = () => {
  interface ExcelData {
    [key: string]: string | number;
  }

  const navigate = useNavigate();

  const month = new Date().toLocaleString('default', { month: 'long' });
  const months = React.useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], []);
  const currentMonthIndex = new Date().getMonth();

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
        label: 'Total Business Permits Released',
        data: [] as number[],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true, // Filled area under the line
      },
    ],
  });

  const [dashboardData, setDashboardData] = useState({
    totalWorkPermitApplications: '',
    totalWorkRenewalApplications: '',
    totalWorkCollections: '',
    totalWorkReleased: '',
    totalBusinessPermitApplications: '',
    totalBusinessRenewalApplications: '',
    totalBusinessCollections: '',
    totalBusinessReleased: '',
  });

  const [showWorkPermit, setShowWorkPermit] = useState(true);

  const handleToggle = () => {
    setShowWorkPermit(!showWorkPermit);
  };

  const downloadExcel = (data: ExcelData[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleDownloadWorkPermit = () => {
    const data = totalWorkingPermitsData.labels.map((label, index) => ({
      month: label,
      'Total Permits Released': totalWorkingPermitsData.datasets[0].data[index],
      'New Permits': WorkingPermitChart.datasets[0].data[index],
      'Renewal Permits': WorkingPermitChart.datasets[1].data[index],
    }));
    downloadExcel(data, 'WorkPermitData');
  };

  const handleDownloadBusinessPermits = () => {
    const data = totalBusinessPermitsData.labels.map((label, index) => ({
      month: label,
      'Total Business Permits Released': totalBusinessPermitsData.datasets[0].data[index],
      'New Permits': BusinessPermitChart.datasets[0].data[index],
      'Renewal Permits': BusinessPermitChart.datasets[1].data[index],
    }));
    downloadExcel(data, 'BusinessPermitData');
  };

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
          renewalBusinessPermitsResponse,
          dashboardDataResponse
        ] = await Promise.all([
          fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/newWorkingpermits', { method: 'GET', credentials: 'include' }),
          fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/renewalWorkingpermits', { method: 'GET', credentials: 'include' }),
          fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/workingpermitsChart', { method: 'GET', credentials: 'include' }),
          fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/businesspermitsChart', { method: 'GET', credentials: 'include' }),
          fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/newBusinesspermits', { method: 'GET', credentials: 'include' }),
          fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/renewalBusinesspermits', { method: 'GET', credentials: 'include' }),
          fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/dashboardData', { method: 'GET', credentials: 'include' })
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
          const renewalBusinessPermitsData = await renewalBusinessPermitsResponse.json(); // Ensure this line is present

          setWorkingpermitchart({
            labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            datasets: [
              {
                label: 'New Work Permits',
                data: newPermitsData.map((data: { count: number; }) => data.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true,
              },
              {
                label: 'Renewal Work Permits',
                data: renewalPermitsData.map((data: { count: number; }) => data.count),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });

          setBusinessPermitChart({
            labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            datasets: [
              {
                label: 'New Business Permits',
                data: newBusinessPermitsData.map((data: { count: number; }) => data.count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: true,
              },
              {
                label: 'Renewal Business Permits',
                data: renewalBusinessPermitsData.map((data: { count: number; }) => data.count), // Ensure correct mapping
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });

          setTotalWorkingPermitsData({
            labels: workingPermitsData.map((data: { month: string }) => data.month),
            datasets: [
              {
                label: 'Total Working Permits Released',
                data: workingPermitsData.map((data: { count: number }) => data.count),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });

          settotalBusinessPermit({
            labels: businessPermitsData.map((data: { month: string; }) => data.month),
            datasets: [
              {
                label: 'Total Business Permits',
                data: businessPermitsData.map((data: { count: number; }) => data.count),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          });
        } 

        if (dashboardDataResponse.ok) {
          const dashboardData = await dashboardDataResponse.json();
          setDashboardData({
            totalWorkPermitApplications: dashboardData.totalWorkPermitApplications,
            totalWorkRenewalApplications: dashboardData.totalWorkRenewalApplications,
            totalWorkCollections: dashboardData.totalWorkCollections,
            totalWorkReleased: dashboardData.totalWorkReleased,
            totalBusinessPermitApplications: dashboardData.totalBusinessPermitApplications,
            totalBusinessRenewalApplications: dashboardData.totalBusinessRenewalApplications,
            totalBusinessCollections: dashboardData.totalBusinessCollections,
            totalBusinessReleased: dashboardData.totalBusinessReleased,
          });
        } else {
          console.error('Error fetching dashboard data:', dashboardDataResponse.statusText);
        }
      } catch(error) {
        console.error("Error fetching data:", error);
      }
    }; 

    fetchData();
  }, [month, currentMonthIndex, months]);


  return (
    <section className="Abody">
      <div className="Asidebar-container">
        <AdminSideBar />
      </div>

      <div className="Acontent">
        <header className="Aheader">
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>

        <div>
          <button onClick={handleToggle}>
            {showWorkPermit ? 'Switch to Business Permit' : 'Switch to Work Permit'}
          </button>
          </div>
        {showWorkPermit ? (
          <>
            <div>
              <h2><FaBriefcase style={{ margin: '10px 20px' }}/>Work Permit</h2>
            </div>
            <div className="DAstats-chart-container">
              <div className="DAstats">
                <div className="DAcard"><FaFileAlt style={{ marginRight: '8px' }}/>Total Permit Applications: 
                <div>{dashboardData.totalWorkPermitApplications} </div>
                  </div>
                <div className="DAcard"><FaSyncAlt style={{ marginRight: '8px' }}/> Total Renewal Applications :
                <div>{dashboardData.totalWorkRenewalApplications}</div>
                </div>
                <div className="DAcard"><FaDollarSign style={{ marginRight: '8px' }}/>Total Collections:
                <div>{dashboardData.totalWorkCollections}</div>
                  </div>
                <div className="DAcard"><FaCheck style={{ marginRight: '8px' }}/>Total Released:
                <div>{dashboardData.totalWorkReleased}</div>
                </div>
              </div>
            </div>
            <div className="DaChartcontainer" onClick={handleDownloadWorkPermit}>
              <div className="DAchart">
                <Line data={totalWorkingPermitsData} />
              </div>
              <div className="DAchart">
                <Bar data={WorkingPermitChart} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2><FaBuilding style={{ margin: '10px 20px' }}/>Business Permit</h2>
            </div>
            <div className="DAstats-chart-container">
              <div className="DAstats">
                <div className="DAcard"><FaFileAlt style={{ marginRight: '8px' }}/>Total Permit Applications:
                <div>{dashboardData.totalWorkPermitApplications}</div>
                </div>
                <div className="DAcard"><FaSyncAlt style={{ marginRight: '8px' }}/>Total Renewal Applications:
                <div>{dashboardData.totalWorkRenewalApplications}</div>
                </div>
                <div className="DAcard"><FaDollarSign style={{ marginRight: '8px' }}/>Total Collections:
                <div>{dashboardData.totalWorkCollections}</div>
                </div>
                <div className="DAcard"><FaCheck style={{ marginRight: '8px' }}/>Total Released:
                <div>{dashboardData.totalWorkReleased}</div>
                </div>
              </div>
            </div>
            <div className="DaChartcontainer" onClick={handleDownloadBusinessPermits}>
                <div className="DAchart">
                  <Line data={totalBusinessPermitsData} />
                </div>
                <div className="DAchart">
                  <Bar data={BusinessPermitChart} />
                </div>
              </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Adashboard;