import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/SuperAdminStyles.css';

// Interface definitions for log entries and online employees
interface LogEntry {
    userId: string;
    firstName: string;
    lastName: string;
    dateTime: string;
    accountOpenedDate: string; // This is specific to admin logs
}

interface OnlineEmployee {
    userId: string;
    firstName: string;
    lastName: string;
    isOnline: boolean;
}

const Logbook: React.FC = () => {
    const [adminLogs, setAdminLogs] = useState<LogEntry[]>([]);
    const [dataControllerLogs, setDataControllerLogs] = useState<LogEntry[]>([]);
    const [onlineAdmins, setOnlineAdmins] = useState<OnlineEmployee[]>([]);
    const [onlineDataControllers, setOnlineDataControllers] = useState<OnlineEmployee[]>([]);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await fetch('http://localhost:3000/superadmin/authentication', {
              method: 'GET',
              credentials: 'include',
            });
      
            if (response.status === 401) {
              console.error('Access denied: No token');
              navigate('/superadmin/login');
              return;
            }
      
            if (response.status === 204) {
              console.log('Access Success');
              return;
            }
          } catch (error) {
            console.error('Error fetching dashboard data:', error);
          }
        };
      
        checkAuth();
      }, [navigate]);

      
      const handleLogout = async () => {
        try {
          const response = await fetch('http://localhost:3000/logout', {
            method: 'POST',
            credentials: 'include',
          });
      
          if (response.ok) {
            localStorage.removeItem('token');
            navigate('/superadmin/login');
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to logout: ${errorText}`);
          }
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unknown error occurred');
          }
        }
      };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetching data from the API
                const adminLogsResponse = await fetch('http://localhost:3000/adminusers');
                const dataControllerLogsResponse = await fetch('http://localhost:3000/datacontrollers');
                const onlineAdminsResponse = await fetch('http://localhost:3000/api/onlineAdmins');
                const onlineDataControllersResponse = await fetch('http://localhost:3000/api/onlineDataControllers');

                // Check if any of the responses were not OK
                if (!adminLogsResponse.ok || !dataControllerLogsResponse.ok || !onlineAdminsResponse.ok || !onlineDataControllersResponse.ok) {
                    throw new Error('Error fetching data');
                }

                // Parsing JSON data
                const adminLogsData = await adminLogsResponse.json();
                const dataControllerLogsData = await dataControllerLogsResponse.json();
                const onlineAdminsData = await onlineAdminsResponse.json();
                const onlineDataControllersData = await onlineDataControllersResponse.json();

                // Setting state with fetched data
                setAdminLogs(adminLogsData);
                setDataControllerLogs(dataControllerLogsData);
                setOnlineAdmins(onlineAdminsData);
                setOnlineDataControllers(onlineDataControllersData);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Optional: Set an error state to display to users
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <div>Error: {error}</div>; // Error message
    }

    return (
        <div className="SAbody">
            <div className="SAnavbar">
                <div className="logo">Logbook</div>
                <div className="user-actions">
                    <a href="/superadmin/dashboard" className="return-link">Return</a>
                    <a href="/superadmin/login"  onClick={handleLogout} className="logout">Log Out</a>
                    <span className="notification">&#128276;</span>
                </div>
            </div>

            {/* Grid Panels */}
            <div className="grid">
                {/* Admin Logbook Panel */}
                <div className="panel admin-logbook-panel">
                    <h3 className="panel-header">Admin Logbook</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>DateTime</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>User ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminLogs.map(log => (
                                <tr key={log.userId}>
                                    <td>{log.accountOpenedDate}</td>
                                    <td>{log.dateTime}</td>
                                    <td>{log.firstName}</td>
                                    <td>{log.lastName}</td>
                                    <td>{log.userId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Data Controller Logbook Panel */}
                <div className="panel data-controller-logbook-panel">
                    <h3 className="panel-header">Data Controller Logbook</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>DateTime</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>User ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataControllerLogs.map(log => (
                                <tr key={log.userId}>
                                    <td>{log.dateTime}</td>
                                    <td>{log.firstName}</td>
                                    <td>{log.lastName}</td>
                                    <td>{log.userId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Online Admins Panel */}
                <div className="panel online-admins-panel">
                    <h3 className="panel-header">Online Admins</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>User ID</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {onlineAdmins.map(admin => (
                                <tr key={admin.userId}>
                                    <td>{admin.firstName}</td>
                                    <td>{admin.lastName}</td>
                                    <td>{admin.userId}</td>
                                    <td>{admin.isOnline ? 'Online' : 'Offline'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Online Data Controllers Panel */}
                <div className="panel online-data-controllers-panel">
                    <h3 className="panel-header">Online Data Controllers</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>User ID</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {onlineDataControllers.map(controller => (
                                <tr key={controller.userId}>
                                    <td>{controller.firstName}</td>
                                    <td>{controller.lastName}</td>
                                    <td>{controller.userId}</td>
                                    <td>{controller.isOnline ? 'Online' : 'Offline'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logbook;
