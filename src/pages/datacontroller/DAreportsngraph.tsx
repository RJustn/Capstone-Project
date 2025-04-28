import '../Styles/DataControllerStyles.css';
import React, { useEffect, useState } from 'react';
import DASidebar from '../components/NavigationBars/DAsidebar';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import * as XLSX from 'xlsx';

const DataControllerReportsAndGraph: React.FC = () => {
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
  const [monthlyData, setMonthlyData] = useState<{ labels: string[], approved: number[], waitingForPayment: number[], rejected: number[], businessPaid: number[], businessUnpaid: number[], workPaid: number[], workUnpaid: number[] }>({ labels: [], approved: [], waitingForPayment: [], rejected: [], businessPaid: [], businessUnpaid: [], workPaid: [], workUnpaid: [] });
  const [businessPermitStatusData, setBusinessPermitStatusData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
  const [workPermitStatusData, setWorkPermitStatusData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });

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
      console.log("API Response:", data); // Log the API response
      const filteredData = data.filter((item: LocationData) =>
        barangays.map(b => b.toLowerCase()).includes(item._id?.toLowerCase())
      );
      const labels = filteredData.map((item: LocationData) => item._id || "Unknown");
      const counts = filteredData.map((item: LocationData) => item.count || 0);
      console.log("Filtered Labels:", labels); // Log the filtered labels
      console.log("Filtered Counts:", counts); // Log the filtered counts
      setLocationData({ labels, data: counts });
    })
    .catch(error => console.error('Error fetching location data:', error));

    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphmonthlypaymentstatus')
      .then(response => response.json())
      .then(data => {
        if (data && data.businessPermits && data.workPermits) {
          const labels = data.businessPermits.map((item: MonthlyData) => item.month);
          const approved = data.businessPermits.flatMap((item: MonthlyData) => item.paid);
          const waitingForPayment = data.businessPermits.flatMap((item: MonthlyData) => item.unpaid);
          const rejected = data.workPermits.flatMap((item: MonthlyData) => item.unpaid);
          const businessPaid = data.businessPermits.flatMap((item: MonthlyData) => item.paid);
          const businessUnpaid = data.businessPermits.flatMap((item: MonthlyData) => item.unpaid);
          const workPaid = data.workPermits.flatMap((item: MonthlyData) => item.paid);
          const workUnpaid = data.workPermits.flatMap((item: MonthlyData) => item.unpaid);
          setMonthlyData({ labels, approved, waitingForPayment, rejected, businessPaid, businessUnpaid, workPaid, workUnpaid });
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

    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphworkpermitstatus')
      .then(response => response.json())
      .then(data => {
        const approved = data.filter((item: { workpermitstatus: string }) => item.workpermitstatus === 'Released').map((item: { count: number }) => item.count);
        const pending = data.filter((item: { workpermitstatus: string }) => item.workpermitstatus === 'Pending').map((item: { count: number }) => item.count);
        const rejected = data.filter((item: { workpermitstatus: string }) => item.workpermitstatus === 'Rejected').map((item: { count: number }) => item.count);

        setWorkPermitStatusData({
          labels: ['Approved', 'Pending', 'Rejected'],
          data: [approved[0] || 0, pending[0] || 0, rejected[0] || 0],
        });
      })
      .catch(error => console.error('Error fetching work permit status data:', error));
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
      BusinessPaid: monthlyData.businessPaid[index],
      WorkPaid: monthlyData.workPaid[index]
    }));
    downloadExcel(data, 'PaidStatus');
  };

  const handleUnpaidClick = () => {
    const data = monthlyData.labels.map((label, index) => ({
      Month: label,
      BusinessUnpaid: monthlyData.businessUnpaid[index],
      WorkUnpaid: monthlyData.workUnpaid[index]
    }));
    downloadExcel(data, 'UnpaidStatus');
  };

  const handleWorkPermitStatusClick = () => {
    const data = workPermitStatusData.labels.map((label, index) => ({
      workpermitstatus: label,
      Count: workPermitStatusData.data[index] || 0
    }));
    downloadExcel(data, 'WorkPermitStatus');
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

  const workPermitStatusChartData = {
    labels: workPermitStatusData.labels,
    datasets: [
      {
        label: 'Work Permit Status',
        data: workPermitStatusData.data,
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
      },
      {
        label: 'Work Paid',
        data: monthlyData.workPaid,
        backgroundColor: '#36A2EB'
      }
    ]
  };

  const unpaidData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Business Unpaid',
        data: monthlyData.businessUnpaid,
        backgroundColor: '#FF9F40'
      },
      {
        label: 'Work Unpaid',
        data: monthlyData.workUnpaid,
        backgroundColor: '#FF6384'
      }
    ]
  };

  return (
    <section className="DAbody">
      <div className="DAsidebar-container">
        <DASidebar />
      </div>
      <div className="DAcontent">
        <header className='DAheader'>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div className="DAchart-container">
          <div className="DAchartreport">

            <div className="DAchartgraph" onClick={handlebusinessstatusClick}>
              <h2>Business Permit Status</h2>
              {businessPermitStatusChartData.labels.length > 0 ? (
                <Bar data={businessPermitStatusChartData} />
              ) : (
                <p>There is no data</p>
              )}
            </div>

            <div className="DAchartlocation" onClick={handlePieClick}>
              <h3>Business Permit Locations</h3>
              {pieData.labels.length > 0 ? (
                <Bar data={pieData} />
              ) : (
                <p>There is no data</p>
              )}
            </div>

            <div className="DAchartgraph" onClick={handleWorkPermitStatusClick}>
              <h2>Work Permit Status</h2>
              {workPermitStatusChartData.labels.length > 0 ? (
                <Bar data={workPermitStatusChartData} />
              ) : (
                <p>There is no data</p>
              )}
            </div>

            <div className="DAchartgraph" onClick={handlePaidClick}>
              <h2>Paid Status</h2>
              {paidData.labels.length > 0 ? (
                <Bar data={paidData} />
              ) : (
                <p>There is no data</p>
              )}
            </div>

            <div className="DAchartgraph" onClick={handleUnpaidClick}>
              <h2>Unpaid Status</h2>
              {unpaidData.labels.length > 0 ? (
                <Bar data={unpaidData} />
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

export default DataControllerReportsAndGraph;