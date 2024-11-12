// import '../Styles/DataControllerStyles.css'; 
// import DASidebar from '../components/DAsidebar';
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Pie, Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// const DAdashboard: React.FC = () => {
//   const navigate = useNavigate();
//   const [pieChartData, setPieChartData] = useState({
//     labels: [] as string[],
//     datasets: [
//       {
//         label: 'Business Permits',
//         data: [] as number[],
//         backgroundColor: ['rgba(75, 192, 192, 0.2)'],
//         borderColor: ['rgba(75, 192, 192, 1)'],
//         borderWidth: 1,
//       },
//       {
//         label: 'Working Permits',
//         data: [] as number[],
//         backgroundColor: ['rgba(153, 102, 255, 0.2)'],
//         borderColor: ['rgba(153, 102, 255, 1)'],
//         borderWidth: 1,
//       },
//     ],
//   });

//   const [barChartData, setBarChartData] = useState({
//     labels: ['Working Permit', 'Business Permit'],
//     datasets: [
//       {
//         label: '# of Permits',
//         data: [0, 0],
//         backgroundColor: ['#FF6384', '#36A2EB'],
//         hoverBackgroundColor: ['#FF6384', '#36A2EB'],
//       },
//     ],
//   });

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/check-auth-datacontroller', {
//           method: 'GET',
//           credentials: 'include',
//         });

//         if (response.status === 401) {
//           console.error('Access denied: No token');
//           navigate('/login');
//           return;
//         }

//         if (response.status === 204) {
//           console.log('Access Success');
//           return;
//         }

//         console.error('Unexpected response status:', response.status);
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/permit-data', {
//           method: 'GET',
//           credentials: 'include',
//         });

//         if (response.ok) {
//           const data = await response.json();
//           const processedData = {
//             labels: data.map((item: { label: string }) => item.label),
//             datasets: [
//               {
//                 label: '# of Permits',
//                 data: data.map((item: { value: number }) => item.value),
//                 backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], 
//                 hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
//                 borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 206, 86, 1)'],
//                 borderWidth: 1,
//               },
//             ],
//           };
//           setBarChartData(processedData);
//         } else {
//           console.error('Error fetching permit data');
//         }
//       } catch (error) {
//         console.error('Error fetching permit data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/logout', {
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

//   return (
//     <section className="DAbody">
//       <div className="DAsidebar-container">
//         <DASidebar handleLogout={handleLogout} /> {/* Pass handleLogout to DASidebar */}
//       </div>

//       <div className="DAcontent">
//         <header className="DAheader">
//           <h1>Online Business and Work Permit Licensing System</h1>
//         </header>
//         <div className="DAchart">
//           <Pie data={pieChartData} />
//         </div>
//         <div className="DAchart">
//           <Bar data={barChartData} />
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DAdashboard;

import '../Styles/DataControllerStyles.css';
import DASidebar from '../components/DAsidebar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const DAdashboard = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Business Permits',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Working Permits',
        data: [],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
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
        const response = await fetch('http://localhost:3000/permit-data');
        const data = await response.json();

        const labels = data.map((item: { month: string }) => item.month);
        const businessPermits = data.map((item: { businessPermits: number }) => item.businessPermits);
        const workingPermits = data.map((item: { workingPermits: number }) => item.workingPermits);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Business Permits',
              data: businessPermits,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Working Permits',
              data: workingPermits,
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching permits data:', error);
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

        {/* Charts */}
        <div className="line-chart-section">
          <h2>Permit Applications</h2>
          <Line data={chartData} />
        </div>

        {/* Application Logs */}
        <div className="application-logs">
          <h2>Application Logs</h2>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Permit ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Application</td>
                <td>55903</td>
                <td>Creation of Work Permit</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Classification Graph */}
        <div className="classification-graph">
          <h2>Classification Graph</h2>
          <Pie data={chartData} />
        </div>
      </div>
    </section>
  );
};

export default DAdashboard;