import '../Styles/AdminStyles.css';
import React, { useEffect, useState } from 'react';
import AdminSideBar from '../components/NavigationBars/AdminSideBar';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import * as XLSX from 'xlsx';

const AdminReportsAndGraph: React.FC = () => {
  interface LocationData {
    labels: string[];
    data: number[];
    _id: string;
    count: number;
  }
  interface MonthlyData {
    _id: string;
    count: number;
    labels: string[];
    approved: number[];
    waitingForPayment: number[];
    rejected: number[];
    month: string;
    paid: string[];
    unpaid: string[];
  }

  interface ExcelData {
    [key: string]: string | number;

  }

  const navigate = useNavigate();
  const [locationData, setLocationData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
  const [monthlyData, setMonthlyData] = useState<{ labels: string[], approved: number[], waitingForPayment: number[], rejected: number[], businessPaid: number[] }>({ labels: [], approved: [], waitingForPayment: [], rejected: [], businessPaid: [] });
  const [businessPermitStatusData, setBusinessPermitStatusData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
  
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

    const barangays = [
      "Burol I", "Burol II", "Burol III", "Datu Esmael", "Datu Esmael II", "Fatima I", "Fatima II", "Fatima III",
      "Fatima IV", "Fatima V", "Fatima VI", "Langkaan I", "Langkaan II", "Paliparan I", "Paliparan II", "Paliparan III",
      "Salawag", "Sampaloc I", "Sampaloc II", "Sampaloc III", "Sampaloc IV", "Sampaloc V", "San Agustin I", "San Agustin II",
      "San Agustin III", "San Agustin IV", "San Andres I", "San Andres II", "San Andres III", "San Andres IV",
      "San Antonio de Padua I", "San Antonio de Padua II", "San Esteban", "San Francisco", "San Isidro Labrador I",
      "San Isidro Labrador II", "San Juan Bautista I", "San Juan Bautista II", "San Lorenzo Ruiz I", "San Lorenzo Ruiz II",
      "Rural Barangays", "Sabang", "Salitran I", "Salitran II", "Salitran III", "Salitran IV", "Salitran V", "Salitran VI",
      "San Jose", "San Miguel", "San Nicolas I", "San Nicolas II", "San Roque", "Santa Cruz I", "Santa Cruz II",
      "Santa Cruz III", "Santa Cruz IV", "Santa Fe", "Santiago", "Santo Cristo", "Santo Domingo", "Santo Niño I",
      "Santo Niño II", "Santo Niño III", "Zone I", "Zone II", "Zone III", "Zone IV", "Zone V", "Zone VI", "Zone VII",
      "Zone VIII", "Zone IX", "Zone X", "Zone XI", "Zone XII"
    ];

    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphbusinesspermitlocation')
      .then(response => response.json())
      .then(data => {
        console.log('Location Data:', data); // Add this line
        const filteredData = data.filter((item: LocationData) => barangays.includes(item._id));
        const labels = filteredData.map((item: LocationData) => item._id);
        const counts = filteredData.map((item: LocationData) => item.count);
        console.log('Filtered Location Data:', { labels, counts }); // Add this line
        setLocationData({ labels, data: counts });
      })
      .catch(error => console.error('Error fetching location data:', error));

    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphmonthlypaymentstatus') // Updated endpoint
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Monthly Payment Data:', data); // Add this line
        if (data && data.businessPermits) {
          console.log('Monthly Payment Data is an array:', data); // Add this line
          const labels = data.businessPermits.map((item: MonthlyData) => item.month);
          const approved = data.businessPermits.flatMap((item: MonthlyData) => item.paid);
          const waitingForPayment = data.businessPermits.flatMap((item: MonthlyData) => item.unpaid);
          const rejected = data.workPermits.flatMap((item: MonthlyData) => item.unpaid); // Assuming rejected is equivalent to unpaid for work permits
          const businessPaid = data.businessPermits.flatMap((item: MonthlyData) => item.paid);
          console.log('Processed Monthly Payment Data:', { labels, approved, waitingForPayment, rejected, businessPaid }); // Add this line
          setMonthlyData({ labels, approved, waitingForPayment, rejected, businessPaid });
        } else {
          console.error('Expected array but got:', data);
        }
      })
      .catch(error => console.error('Error fetching monthly payment data:', error));

      fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphbusinesspermitstatus')
      .then(response => response.json())
      .then(data => {
        const approved = data.filter((item: { businesspermitstatus: string }) => item.businesspermitstatus === 'Released').map((item: { count: number }) => item.count);
        const pending = data.filter((item: { businesspermitstatus: string }) => item.businesspermitstatus === 'Pending').map((item: { count: number }) => item.count);
        const rejected = data.filter((item: { businesspermitstatus: string }) => item.businesspermitstatus === 'Rejected').map((item: { count: number }) => item.count);

        setBusinessPermitStatusData({
          labels: ['Approved', 'Pending', 'Rejected'],
          data: [approved[0] || 0, pending[0] || 0, rejected[0] || 0],
        });
      })
      .catch(error => console.error('Error fetching business permit status data:', error));
      
  }, [navigate]);

  const downloadExcel = (data: ExcelData[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handlePieClick = () => {
    const data = locationData.labels.map((label, index) => ({
      Barangay: label,
      Count: locationData.data[index]
    }));
    downloadExcel(data, 'BusinessPermitLocations');
  };

  const handlebusinessstatusClick = () => {
    const data = businessPermitStatusData.labels.map((label, index) => ({
        businesspermitstatus: label,
        Count: businessPermitStatusData.data[index] || 0
    }));
    downloadExcel(data, 'BusinessPermitStatus');
};

  const handlePaidClick = () => {
    const data = monthlyData.labels.map((label, index) => ({
      Month: label,
      BusinessPaid: monthlyData.businessPaid[index]
    }));
    downloadExcel(data, 'PaidStatus');
  };

  const pieData = {
    labels: locationData.labels,
    datasets: [
      {
        data: locationData.data,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB',
          '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB',
          '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40'
        ]
      }
    ]
  };

  const businessPermitStatusChartData = {
    labels: businessPermitStatusData.labels,
    datasets: [
        {
            label: 'Business Permit Status',
            data: businessPermitStatusData.data,
            backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'], // Colors for Approved, Pending, Rejected
        },
    ],
};

  const paidData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Business Paid',
        data: monthlyData.businessPaid,
        backgroundColor: '#4BC0C0'
      }
    ]
  };

  return (
    <section className="Abody">
      <div className="Asidebar-container">
        <AdminSideBar />
      </div>
      <div className="Acontent">
        <header className='Aheader'>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div className="Achart-container">
         <div className="Achartreport">

          <div className="Achartgraph" onClick={handlebusinessstatusClick}>
            <h2>Business Permit Status</h2>
            {businessPermitStatusChartData.labels.length > 0 ? (
              <Bar data={businessPermitStatusChartData} />
            ) : (
              <p>There is no data</p>
            )}
          </div>
          
          <div className="Achartgraph" onClick={handlePaidClick}>
            <h2>Paid Status</h2>
            {paidData.labels.length > 0 ? (
              <Bar data={paidData} />
            ) : (
              <p>There is no data</p>
            )}
          </div>
          
          <div className="Achartlocation" onClick={handlePieClick}>
            <h3>Business Permit Locations</h3>
            {pieData.labels.length > 0 ? (
              <Bar data={pieData} />
            ) : ( 
              <p>There is no data</p>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export default AdminReportsAndGraph;