import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/NavigationBars/DAsidebar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
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

    interface WorkPermitStatus {
        status: string;
        count: number;
    }
    interface BusinessPermitStatus {
        status: string;
        count: number;
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

        const fetchData = async () => {
            try {
                const [locationRes, monthlyRes, workPermitRes, businessPermitRes] = await Promise.all([
                    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphbusinesspermitlocation'),
                    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphmonthlypaymentstatus'),
                    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphworkpermitstatus'),
                    fetch('https://capstone-project-backend-nu.vercel.app/datacontroller/graphbusinesspermitstatus')
                ]);

                const locationData = await locationRes.json();
                const monthlyData = await monthlyRes.json();
                const workPermitData = await workPermitRes.json();
                const businessPermitData = await businessPermitRes.json();

                // Process location data
                const filteredLocationData = locationData.filter((item: BusinessPermitLocation) => barangays.includes(item._id));
                setLocationData({
                    labels: filteredLocationData.map((item: BusinessPermitLocation) => item._id),
                    data: filteredLocationData.map((item: BusinessPermitLocation) => item.count)
                });

                // Process monthly data
                setMonthlyData({
                    labels: monthlyData.map((item: MonthlyPaymentStatus) => item.month),
                    paid: monthlyData.map((item: MonthlyPaymentStatus) => item.paid),
                    unpaid: monthlyData.map((item: MonthlyPaymentStatus) => item.unpaid)
                });

                // Process work permit data
                setWorkPermitStatusData({
                    labels: workPermitData.map((item: WorkPermitStatus) => item.status),
                    data: workPermitData.map((item: WorkPermitStatus) => item.count)
                });

                // Process business permit data
                setBusinessPermitStatusData({
                    labels: businessPermitData.map((item: BusinessPermitStatus) => item.status),
                    data: businessPermitData.map((item: BusinessPermitStatus) => item.count)
                });

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
                label: 'Work Permit Status',
                data: workPermitStatusData.data,
                backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'], // Colors for Approved, Waiting for Payment, Rejected
            },
        ],
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