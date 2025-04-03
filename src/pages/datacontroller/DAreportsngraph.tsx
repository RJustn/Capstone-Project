import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/NavigationBars/DAsidebar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {  Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import * as XLSX from 'xlsx';

const DataControllerReportandGraph: React.FC = () => {

    interface BusinessPermitLocation {
        _id: string;
        count: number;
    }
    
    interface MonthlyPaymentStatus {
        month: string;
        paid: number;
        unpaid: number;
    }
    

    interface ExcelData {
        [key: string]: string | number; 
    }
        
    const currentYear = new Date().getFullYear(); // Add this line to get the current year

    const navigate = useNavigate();
    const [locationData, setLocationData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [monthlyData, setMonthlyData] = useState<{ labels: string[], paid: number[], unpaid: number[] }>({ labels: [], paid: [], unpaid: [] });
    const [workPermitStatusData, setWorkPermitStatusData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [businessPermitStatusData, setBusinessPermitStatusData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    
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
      }, [navigate]);



    useEffect(() => {
        const barangays = [
            "Burol 1", "Burol 2", "Burol 3", "Datu Esmael", "Datu Esmael 2", "Fatima 1", "Fatima 2", "Fatima 3", 
            "Fatima 4", "Fatima 5", "Fatima 6", "Langkaan 1", "Langkaan 2", "Paliparan 1", "Paliparan 2", "Paliparan 3", 
            "Salawag", "Sampaloc 1", "Sampaloc 2", "Sampaloc 3", "Sampaloc 4", "Sampaloc 5", "San Agustin 1", "San Agustin 2", 
            "San Agustin 3", "San Agustin 4", "San Andres 1", "San Andres 2", "San Andres 3", "San Andres 4", 
            "San Antonio de Padua 1", "San Antonio de Padua 2", "San Esteban", "San Francisco", "San Isidro Labrador 1", 
            "San Isidro Labrador 2", "San Juan Bautista 1", "San Juan Bautista 2", "San Lorenzo Ruiz 1", "San Lorenzo Ruiz 2", 
            "Rural Barangays", "Sabang", "Salitran 1", "Salitran 2", "Salitran 3", "Salitran 4", "Salitran 5", "Salitran 6", 
            "San Jose", "San Miguel", "San Nicolas 1", "San Nicolas 2", "San Roque", "Santa Cruz 1", "Santa Cruz 2", 
            "Santa Cruz 3", "Santa Cruz 4", "Santa Fe", "Santiago", "Santo Cristo", "Santo Domingo", "Santo Niño 1", 
            "Santo Niño 2", "Santo Niño 3", "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6", "Zone 7", 
            "Zone 8", "Zone 9", "Zone 10", "Zone 11", "Zone 12"
        ];

    //     mock data for testing dounut chart
    //     const mockData = barangays.map(barangay => ({
    //       _id: barangay,
    //       count: Math.floor(Math.random() * 100) // Random count between 0 and 99
    //   }));

    //   const filteredData = mockData.filter((item: BusinessPermitLocation) => barangays.includes(item._id));
    //   const labels = filteredData.map((item: BusinessPermitLocation) => item._id);
    //   const counts = filteredData.map((item: BusinessPermitLocation) => item.count);
    //   setLocationData({ labels, data: counts });

    //   mock data for testing bar chart
    //   const mockMonthlyData = {
    //     labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    //     paid: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), // Random data for 12 months
    //     unpaid: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)) // Random data for 12 months
    // };
    // setMonthlyData(mockMonthlyData);

        fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphbusinesspermitlocation')
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter((item: BusinessPermitLocation) => barangays.includes(item._id));
                const labels = filteredData.map((item: BusinessPermitLocation) => item._id);
                const counts = filteredData.map((item: BusinessPermitLocation) => item.count);
                setLocationData({ labels, data: counts });
            })
            .catch(error => console.error('Error fetching location data:', error));
            
        fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphmonthlypaymentstatus')
            .then(response => response.json())
            .then(data => {
                const labels = data.map((item: MonthlyPaymentStatus) => item.month);
                const paid = data.map((item: MonthlyPaymentStatus) => item.paid);
                const unpaid = data.map((item: MonthlyPaymentStatus) => item.unpaid);
                setMonthlyData({ labels, paid, unpaid });
            })
            .catch(error => console.error('Error fetching monthly payment data:', error));

        fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphworkpermitstatus')
            .then(response => response.json())
            .then(data => {
                const labels = data.map((item: { status: string, count: number }) => item.status);
                const counts = data.map((item: { status: string, count: number }) => item.count);
                setWorkPermitStatusData({ labels, data: counts });
            })
            .catch(error => console.error('Error fetching work permit status data:', error));

        fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphbusinesspermitstatus')
            .then(response => response.json())
            .then(data => {
                const labels = data.map((item: { status: string, count: number }) => item.status);
                const counts = data.map((item: { status: string, count: number }) => item.count);
                setBusinessPermitStatusData({ labels, data: counts });
            })
            .catch(error => console.error('Error fetching business permit status data:', error));
            
    }, []);

    const downloadExcel = (data:    ExcelData[], filename: string) => {
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

    const handleBarClick = () => {
        const data = monthlyData.labels.map((label, index) => ({
            Month: label,
            Paid: monthlyData.paid[index],
            Unpaid: monthlyData.unpaid[index]
        }));
        downloadExcel(data, 'MonthlyPaymentStatus');
    };

    const handleworkstatusClick = () => {
        const data = workPermitStatusData.labels.map((label, index) => ({
            workpermitstatus: label,
            Count: workPermitStatusData.data[index] || 0
        }));
        downloadExcel(data, 'WorkPermitStatus');
    };

    const handlebusinessstatusClick = () => {
        const data = businessPermitStatusData.labels.map((label, index) => ({
            businesspermitstatus: label,
            Count: businessPermitStatusData.data[index] || 0
        }));
        downloadExcel(data, 'BusinessPermitStatus');
    };


    const locationbarData = {
        labels: locationData.labels,
        datasets: [
            {
                data: locationData.data,
                backgroundColor: [
                    '#4BC0C0', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
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

    const barData = {
        labels: monthlyData.labels,
        datasets: [
            {
                label: 'Paid',
                data: monthlyData.paid,
                backgroundColor: '#36A2EB'
            },
            {
                label: 'Unpaid',
                data: monthlyData.unpaid,
                backgroundColor: '#FF6384'
            }
        ]
    };

    const workPermitStatusChartData = {
        labels: workPermitStatusData.labels,
        datasets: [
            {
                data: workPermitStatusData.data,
                backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };

    const businessPermitStatusChartData = {
        labels: businessPermitStatusData.labels,
        datasets: [
            {
                data: businessPermitStatusData.data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };

    return (
<section className="DAbody">
            <div className="DAsidebar-container">
                <DASidebar /> {/* Pass handleLogout to DASidebar */}
            </div>

            <div className="DAcontent">
                <header className='DAheader'>
                    <h1>Online Business and Work Permit Licensing System</h1>
                </header>

                <div className='DaChartcontainer'>
                 <div className="DAchartreport">

                    <div className="DAchartgraph" onClick={handleBarClick}>
                        <h2>Monthly Payment Status - {currentYear}</h2>
                        {barData.datasets[0].data.length > 0 ? (
                            <Bar data={barData} />
                        ) : (
                            <p>There is no data</p>
                        )}
                    </div>


                    <div className="DAchartlocation" onClick={handlePieClick}>
                        <h2>Business Permit Locations - {currentYear}</h2>
                        {locationbarData.datasets[0].data.length > 0 ? (
                            <Bar data={locationbarData} />
                        ) : (
                            <p>There is no data</p>
                        )}
                    </div>
                    <div className="DAchartgraph" onClick={handleworkstatusClick}>
                            <h2>Work Permit Status</h2>
                            {workPermitStatusChartData.datasets[0].data.length > 0 ? (
                                <Bar data={workPermitStatusChartData} />
                            ) : (
                                <p>There is no data</p>
                            )}
                        </div>

                        <div className="DAchartgraph" onClick={handlebusinessstatusClick}>
                            <h2>Business Permit Status</h2>
                            {businessPermitStatusChartData.datasets[0].data.length > 0 ? (
                                <Bar data={businessPermitStatusChartData} />
                            ) : (
                                <p>There is no data</p>
                            )}
                        </div>
                        
                    </div>                        
                    </div>
                </div>
        </section>
    );
};

export default DataControllerReportandGraph;