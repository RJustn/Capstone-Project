import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/SuperAdminStyles.css'

interface Account {
  userId: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
}

const Accounts: React.FC = () => {
  const [admins, setAdmins] = useState<Account[]>([]);
  const [dataControllers, setDataControllers] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const adminResponse = await fetch('http://localhost:3000/superadmin/adminusers');
        const dataControllerResponse = await fetch('http://localhost:3000/superadmin/datacontrollers');

        if (!adminResponse.ok) {
          const errorText = await adminResponse.text();
          throw new Error(`Failed to fetch admins: ${errorText}`);
        }

        if (!dataControllerResponse.ok) {
          const errorText = await dataControllerResponse.text();
          throw new Error(`Failed to fetch data controllers: ${errorText}`);
        }

        const adminData = await adminResponse.json();
        const dataControllerData = await dataControllerResponse.json();

        setAdmins(adminData);
        setDataControllers(dataControllerData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/superadmin/superadmin/authentication', {
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
      const response = await fetch('http://localhost:3000/superadmin/logout', {
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

  if (error) {
    return <div>Error: {error}</div>; // Error message
  }

  const handleEdit = (account: Account) => {
    navigate(`/superadmin/edituser/${account.userId}`);
  };

  const handleRemove = async (account: Account) => {
    try {
      const response = await fetch(`http://localhost:3000/api/accounts/${account.userId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove account: ${errorText}`);
      }
  
      // Update the state to remove the deleted account
      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.userId !== account.userId));
      setDataControllers((prevDataControllers) =>
        prevDataControllers.filter((controller) => controller.userId !== account.userId)
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const renderActionsButtons = (account: Account) => (
    <div className="SAaction-buttons">
      <button className="SAedit-button" onClick={() => handleEdit(account)}>Edit</button>
      <button className="SAremove-button" onClick={() => handleRemove(account)}>Remove</button>
    </div>
  );

  return (
    <div>
      <div className="SAnavbar">
        <div className="SAmenu-toggle">
          <span>&#9776;</span>
        </div>
        <div className="logo">Accounts</div>
        <div className="user-actions">
          <a href="/superadmin/dashboard" className="return-link">Return</a>
          <a href="# " className="logout" onClick={handleLogout}>
            Log Out
          </a>
        </div>
      </div>

      <div className="top-actions">
          <div className="action-card">
            <div className="icon create-account"></div>
            <a href="/superadmin/accountadd">Create Account</a>
          </div>
          <div className="action-card">
            <div className="icon accounts"></div>
            <a href="/superadmin/dashboard">Dashboard</a>
          </div>
          <div className="action-card">
            <div className="icon logbook"></div>
            <a href="/superadmin/logbooks">Logbook</a>
          </div>
        </div>

      <div className="superadmin-accounts">
        <section className="SApanel">
          <h2 className="panel-header">Admin</h2>
          <div className="panel-searchbar">
            <span>Filter:</span>
            <input type="text" className="search-box" placeholder="Filter" />
            <span>Search:</span>
            <input type="text" className="search-box" placeholder="Search" />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee ID</th>
                <th>Mobile No.</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr key={index}>
                  <td>
                    {admin.firstName} {admin.lastName}
                  </td>
                  <td>{admin.userId}</td>
                  <td>{admin.contactNumber}</td>
                  <td>{admin.email}</td>
                  <td>{renderActionsButtons(admin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="SApanel">
          <h2 className="panel-header">Data Controller</h2>
          <div className="panel-searchbar">
            <span>Filter:</span>
            <input type="text" className="search-box" placeholder="Filter" />
            <span>Search:</span>
            <input type="text" className="search-box" placeholder="Search" />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee ID</th>
                <th>Mobile No.</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataControllers.map((controller, index) => (
                <tr key={index}>
                  <td>
                    {controller.firstName} {controller.lastName}
                  </td>
                  <td>{controller.userId}</td>
                  <td>{controller.contactNumber}</td>
                  <td>{controller.email}</td>
                  <td>{renderActionsButtons(controller)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Accounts;