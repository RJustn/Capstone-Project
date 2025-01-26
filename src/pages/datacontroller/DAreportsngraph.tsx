import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/DAsidebar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {  Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import * as XLSX from 'xlsx';

const DataControllerReportandGraph: React.FC = () => {
    const navigate = useNavigate();
    const [locationData, setLocationData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });
    const [monthlyData, setMonthlyData] = useState<{ labels: string[], paid: number[], unpaid: number[] }>({ labels: [], paid: [], unpaid: [] });
    const [categoryData, setCategoryData] = useState<{ labels: string[], workPermitCounts: number[], businessPermitCounts: number[] }>({ labels: [], workPermitCounts: [], businessPermitCounts: [] });

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await fetch('http://localhost:3000/client/check-auth-datacontroller', {
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
            credentials: 'include', // Include cookies in the request
          });
    
          if (response.ok) {
            // Clear any local storage data (if applicable)
            localStorage.removeItem('profile');
            localStorage.removeItem('userId');
    
            // Redirect to the login page
            navigate('/');
          } else {
            // Handle any errors from the server
            const errorData = await response.json();
            console.error('Logout error:', errorData.message);
          }
        } catch (error) {
          console.error('Error logging out:', error);
        }
      };

    useEffect(() => {
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
        // mock data for testing dounut chart
      //   const mockData = barangays.map(barangay => ({
      //     _id: barangay,
      //     count: Math.floor(Math.random() * 100) // Random count between 0 and 99
      // }));

      // const filteredData = mockData.filter((item: any) => barangays.includes(item._id));
      // const labels = filteredData.map((item: any) => item._id);
      // const counts = filteredData.map((item: any) => item.count);
      // setLocationData({ labels, data: counts });

      // mock data for testing bar chart
    //   const mockMonthlyData = {
    //     labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    //     paid: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), // Random data for 12 months
    //     unpaid: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)) // Random data for 12 months
    // };
    // setMonthlyData(mockMonthlyData);

        fetch('http://localhost:3000/datacontroller/businessPermitLocations')
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter((item: any) => barangays.includes(item._id));
                const labels = filteredData.map((item: any) => item._id);
                const counts = filteredData.map((item: any) => item.count);
                setLocationData({ labels, data: counts });
            })
            .catch(error => console.error('Error fetching location data:', error));
            
        fetch('http://localhost:3000/datacontroller/monthlyPaymentStatus')
            .then(response => response.json())
            .then(data => {
                const labels = data.map((item: any) => item.month);
                const paid = data.map((item: any) => item.paid);
                const unpaid = data.map((item: any) => item.unpaid);
                setMonthlyData({ labels, paid, unpaid });
            })
            .catch(error => console.error('Error fetching monthly payment data:', error));

        fetch('http://localhost:3000/datacontroller/permitApplicationsByCategory')
            .then(response => response.json())
            .then(data => {
                const workPermitLabels = data.workPermitCategories.map((item: any) => item._id);
                const workPermitCounts = data.workPermitCategories.map((item: any) => item.count);
                const businessPermitLabels = data.businessPermitCategories.map((item: any) => item._id);
                const businessPermitCounts = data.businessPermitCategories.map((item: any) => item.count);

                const labels = Array.from(new Set([...workPermitLabels, ...businessPermitLabels]));

                setCategoryData({ labels, workPermitCounts, businessPermitCounts });
            })
            .catch(error => console.error('Error fetching permit applications by category:', error));
    }, []);

    const downloadExcel = (data: any, filename: string) => {
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

    const handleCategoryClick = () => {
        const data = categoryData.labels.map((label, index) => ({
            Category: label,
            WorkPermitCount: categoryData.workPermitCounts[index] || 0,
            BusinessPermitCount: categoryData.businessPermitCounts[index] || 0
        }));
        downloadExcel(data, 'PermitApplicationsByCategory');
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

    const categoryDataForChart = {
        labels: categoryData.labels,
        datasets: [
            {
                label: 'Work Permits',
                data: categoryData.workPermitCounts,
                backgroundColor: '#36A2EB'
            },
            {
                label: 'Business Permits',
                data: categoryData.businessPermitCounts,
                backgroundColor: '#FF6384'
            }
        ]
    };

    return (
        <section className="DAbody">
            <div className="DAsidebar-container">
                <DASidebar handleLogout={handleLogout} /> {/* Pass handleLogout to DASidebar */}
            </div>

            <div className="DAcontent">
                <header className='DAheader'>
                    <h1>Online Business and Work Permit Licensing System</h1>
                </header>
                <div className='DApanel-Header'>
                        <h2>Business Permit Locations</h2>
                        </div>
                    <div className="DAChart-Pie">
                        <div className="DApieChartBarangay" onClick={handlePieClick}> {/* Add onClick handler */}
                            <Doughnut data={pieData} />
                        </div>
                    </div>
                    <div className="DAChart-Bar">
                    <h2>Monthly Payment Status</h2>
                    <div className="DABarChartMonthly" onClick={handleBarClick}> {/* Add onClick handler */}
                         <Bar data={barData} />
                    </div>
                </div> 
                <div className="DAChart-Bar">
                    <h2>Permit Applications by Category</h2>
                    <div className="DABarChartCategory" onClick={handleCategoryClick}>
                        <Bar data={categoryDataForChart} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DataControllerReportandGraph;