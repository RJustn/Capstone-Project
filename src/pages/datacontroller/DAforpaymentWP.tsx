// import '../Styles/DataControllerStyles.css'; 
// import DASidebar from '../components/DAsidebar';
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// interface WorkPermit {
//   _id: string;
//   id: string;
//   workpermitstatus: string;
//   classification: string;
//   createdAt: string;
//   permitExpiryDate: string;
//   formData: FormData;
// }
// interface FormData {
//   personalInformation: PersonalInformation;
// }
// interface PersonalInformation {
//   firstName: string;
//   lastName: string;
// }

// const DataControllerForPaymentWP: React.FC = () => {
//   const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
//   const [filteredItems, setFilteredItems] = useState<WorkPermit[]>([]);
//   const token = localStorage.getItem('token');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/check-auth-datacontroller', {
//           method: 'GET',
//           credentials: 'include', // This ensures cookies are sent with the request
//         });

//         if (response.status === 401) {
//           // If unauthorized, redirect to login
//           console.error('Access denied: No token');
//           navigate('/login');
//           return;
//         }

//         if (response.status === 204) {
//           console.log('Access Success');
//           return;
//         }

//         // Handle unexpected response
//         console.error('Unexpected response status:', response.status);
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       } 
//     };

//     checkAuth();
//   }, [navigate]); // Only depend on navigate, which is necessary for the redirection

//   const handleLogout = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/logout', {
//         method: 'POST',
//         credentials: 'include', // Include cookies in the request
//       });

//       if (response.ok) {
//         // Clear any local storage data (if applicable)
//         localStorage.removeItem('profile');
//         localStorage.removeItem('userId');

//         // Redirect to the login page
//         navigate('/');
//       } else {
//         // Handle any errors from the server
//         const errorData = await response.json();
//         console.error('Logout error:', errorData.message);
//       }
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   // CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//   const [activePermit, setActivePermit] = useState<WorkPermit | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const itemsPerPage = 5;
//   const totalPages = Math.ceil(workPermits.length / itemsPerPage)
//   const startIndex = currentPage * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;

//   const handleNextPage = () => {
//     if (currentPage < totalPages - 1) {
//       setCurrentPage(currentPage + 1);
//     }
//   };
//   const handlePreviousPage = () => {
//     if (currentPage > 0) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const openModal = (permit: WorkPermit) => {
//     setActivePermit(permit);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setActivePermit(null);
//     setIsModalOpen(false);
//   };

//   const handleViewApplication = () => {
//     if (activePermit) {
//       console.log(`Edit permit ID: ${activePermit._id}`);
//       navigate(`/DAviewapplicationdetails/${activePermit._id}`);
//       // Implement your edit logic here
//       closeModal(); // Close the modal after action
//     }
//   };

//   // END CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//   // Search QUERY @@@@@@@@@@@@@@@@@@@@@
//   const [searchQuery, setSearchQuery] = useState<string>(''); // Track the search query
//   const [inputValue, setInputValue] = useState<string>('');
//   const [classificationFilter, setClassificationFilter] = useState<string>('');

//   // New state to track sorting
//   const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' | null }>({
//     key: '', 
//     direction: null
//   });

//   // Handle sorting when a table header is clicked
//   const handleSort = (key: keyof WorkPermit) => {
//     let direction: 'ascending' | 'descending' = 'ascending';
    
//     // Toggle sorting direction if the same column is clicked
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }

//     setSortConfig({ key, direction });

//     // Sort the filteredItems based on the key and direction
//     const sortedItems = [...filteredItems].sort((a, b) => {
//       if (a[key] < b[key]) {
//         return direction === 'ascending' ? -1 : 1;
//       }
//       if (a[key] > b[key]) {
//         return direction === 'ascending' ? 1 : -1;
//       }
//       return 0;
//     });

//     setFilteredItems(sortedItems);
//   };

//   // Get current items
//   const currentItems = filteredItems.slice(startIndex, endIndex); 

//   // Handle the search and classification filter together
//   const applyFilters = (searchValue: string, classification: string) => {
//     const results = workPermits.filter((permit) => {
//       const matchesSearchQuery = permit.id.toString().toLowerCase().includes(searchValue.toLowerCase()) ||
//         permit.workpermitstatus.toLowerCase().includes(searchValue.toLowerCase()) ||
//         permit.classification.toLowerCase().includes(searchValue.toLowerCase());

//       const matchesClassification = classification ? permit.classification === classification : true;

//       return matchesSearchQuery && matchesClassification;
//     });

//     setFilteredItems(results); // Update filtered items
//     setCurrentPage(0); // Reset to the first page of results
//     console.log('Filtered Results:', results); // Log the filtered results
//   };

//   // Handle the search when the button is clicked
//   const handleSearch = () => {
//     const searchValue = inputValue; // Use input value for search
//     setSearchQuery(searchValue); // Update search query state
//     applyFilters(searchValue, classificationFilter); // Apply both search and classification filters
//   };

//   // Handle dropdown selection change (classification filter)
//   const handleClassificationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedClassification = event.target.value;
//     setSearchQuery(inputValue); // Keep the current search query
//     setInputValue(inputValue); // Keep the current input value
//     setClassificationFilter(selectedClassification); // Set the classification filter
//     applyFilters(inputValue, selectedClassification); // Apply both search and classification filters
//     console.log('Selected Classification:', selectedClassification); // Log selected classification
//     console.log('Search Query:', searchQuery);
//     console.log('Input Value:', inputValue);
//   };

//   const fetchWorkPermits = async () => {
//     try {
//       const response = await fetch('http://localhost:3000/getworkpermitsforpayment', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       const WorkPermitData = await response.json();
//       setWorkPermits(WorkPermitData);
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     }
//   };

//   useEffect(() => {
//     const handleTokenCheck = () => {
//       if (!token) {
//           navigate('/'); // Redirect to login if no token
//       } else {
//           fetchWorkPermits(); // Fetch work permits if token is present
//       }
//     };

//     handleTokenCheck(); // Call the function to check the token
//   }, [navigate, token]);

//   useEffect(() => {
//     setFilteredItems(workPermits); // Display all work permits by default
//   }, [workPermits]);

//   // Date picker states
//   const [startDate, setStartDate] = useState<Date | undefined>(undefined);
//   const [endDate, setEndDate] = useState<Date | undefined>(undefined);

//   // Handle date search
//   const handleDateSearch = () => {
//     const filteredByDate = workPermits.filter((permit) => {
//       const permitDate = new Date(permit.createdAt);
//       const isAfterStartDate = startDate ? permitDate >= startDate : true;
//       const isBeforeEndDate = endDate ? permitDate <= endDate : true;
//       return isAfterStartDate && isBeforeEndDate;
//     });

//     setFilteredItems(filteredByDate);
//     setCurrentPage(0); // Reset to the first page of results
//   };

//   return (
//     <section className="DAbody">
//       <div className="DAsidebar-container">
//         <DASidebar handleLogout={handleLogout} /> {/* Pass handleLogout to DASidebar */}
//       </div>

//       <div className="DAcontent">
//         <header className='DAheader'>
//           <h1>Online Business and Work Permit Licensing System</h1>
//         </header>
//         <div className='workpermittable'>
//           <p>Work Permit Applications (For Payment)</p>
//           {/* Search Bar */}
//           <div className="search-bar-container">
//             <input
//               type="text"
//               placeholder="Search by ID, Status, or Classification"
//               value={inputValue} // Use inputValue for the input field
//               onChange={(e) => setInputValue(e.target.value)} // Update inputValue state
//               className="search-input" // Add a class for styling
//             />
//             <button onClick={handleSearch} className="search-button">Search</button> {/* Button to trigger search */}
//           </div>

//           {/* Dropdown for Classification Filter */}
//           <select value={classificationFilter} onChange={handleClassificationChange}>
//             <option value="">All</option>
//             <option value="New">New</option>
//             <option value="Renew">Renew</option>
//           </select>

//           {/* Date Pickers for Date Range Filter */}
//           <div className="date-picker-container">
//             <DatePicker
//               selected={startDate}
//               onChange={(date: Date | null) => setStartDate(date ?? undefined)}
//               selectsStart
//               startDate={startDate}
//               endDate={endDate}
//               placeholderText="Start Date"
//             />
//             <DatePicker
//               selected={endDate}
//               onChange={(date: Date | null) => setEndDate(date ?? undefined)}
//               selectsEnd
//               startDate={startDate}
//               endDate={endDate}
//               minDate={startDate}
//               placeholderText="End Date"
//             />
//             <button onClick={handleDateSearch} className="search-button">Search by Date</button>
//           </div>

//           <table className="permit-table">
//             <thead>
//               <tr>
//                 <th onClick={() => handleSort('id')}>
//                   ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                 </th>
//                 <th onClick={() => handleSort('createdAt')}>
//                   Name {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                 </th>
//                 <th onClick={() => handleSort('workpermitstatus')}>
//                   Status {sortConfig.key === 'workpermitstatus' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                 </th>
//                 <th onClick={() => handleSort('classification')}>
//                   Classification {sortConfig.key === 'classification' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                 </th>
//                 <th onClick={() => handleSort('createdAt')}>
//                   Date Issued {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
//                 </th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems.map((permit) => (
//                 <tr key={permit._id}>
//                   <td>{permit.id}</td>
//                   <td>{permit.formData.personalInformation.lastName} {permit.formData.personalInformation.firstName}</td>
//                   <td>{permit.workpermitstatus}</td>
//                   <td>{permit.classification}</td>
//                   <td>{new Date(permit.createdAt).toLocaleDateString()}</td>
//                   <td>
//                   <button className="modal-button" onClick={handleViewApplication}>View Application</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="pagination-buttons">
//             {currentPage > 0 && (
//               <button onClick={handlePreviousPage}>Back</button>
//             )}
//             {currentPage < totalPages - 1 && (
//               <button onClick={handleNextPage}>Next</button>
//             )}
//           </div>
//           {/* Modal for Action Options */}
//           {isModalOpen && activePermit && (
//             <div className="modal-overlay">
//               <div className="modal">
//                 <h3>Choose an Action for Permit ID: {activePermit.id}</h3> {/* Display the permit ID */}
//                 <button className="modal-button" onClick={handleViewApplication}>View Application</button>
//                 <button className="modal-button cancel-button" onClick={closeModal}>Cancel</button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DataControllerForPaymentWP;


import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/DAsidebar';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkPermit {
  _id: string;
  id: string;
  workpermitstatus: string;
  classification: string;
  createdAt: string;
  permitExpiryDate: string;
  formData: FormData;
}
interface FormData {
  personalInformation: PersonalInformation;
}
interface PersonalInformation {
  firstName: string;
  lastName: string;
}

const DataControllerForPaymentWP: React.FC = () => {
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkPermit[]>([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/check-auth-datacontroller', {
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
  }, [navigate]); // Only depend on navigate, which is necessary for the redirection

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/logout', {
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

  // CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(workPermits.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleViewApplication = (permitId: string) => {
    navigate(`/DAviewapplicationdetails/${permitId}`);
  };

  // END CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  // Search QUERY @@@@@@@@@@@@@@@@@@@@@
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track the search query
  const [inputValue, setInputValue] = useState<string>('');
  const [classificationFilter, setClassificationFilter] = useState<string>('');

  // New state to track sorting
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' | null }>({
    key: '', 
    direction: null
  });

  // Handle sorting when a table header is clicked
  const handleSort = (key: keyof WorkPermit) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    // Toggle sorting direction if the same column is clicked
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });

    // Sort the filteredItems based on the key and direction
    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredItems(sortedItems);
  };

  // Get current items
  const currentItems = filteredItems.slice(startIndex, endIndex); 

  // Handle the search and classification filter together
  const applyFilters = (searchValue: string, classification: string) => {
    const results = workPermits.filter((permit) => {
      const matchesSearchQuery = permit.id.toString().toLowerCase().includes(searchValue.toLowerCase()) ||
        permit.workpermitstatus.toLowerCase().includes(searchValue.toLowerCase()) ||
        permit.classification.toLowerCase().includes(searchValue.toLowerCase());

      const matchesClassification = classification ? permit.classification === classification : true;

      return matchesSearchQuery && matchesClassification;
    });

    setFilteredItems(results); // Update filtered items
    setCurrentPage(0); // Reset to the first page of results
    console.log('Filtered Results:', results); // Log the filtered results
  };

  // Handle the search when the button is clicked
  const handleSearch = () => {
    const searchValue = inputValue; // Use input value for search
    setSearchQuery(searchValue); // Update search query state
    applyFilters(searchValue, classificationFilter); // Apply both search and classification filters
  };

  // Handle dropdown selection change (classification filter)
  const handleClassificationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClassification = event.target.value;
    setSearchQuery(inputValue); // Keep the current search query
    setInputValue(inputValue); // Keep the current input value
    setClassificationFilter(selectedClassification); // Set the classification filter
    applyFilters(inputValue, selectedClassification); // Apply both search and classification filters
    console.log('Selected Classification:', selectedClassification); // Log selected classification
    console.log('Search Query:', searchQuery);
    console.log('Input Value:', inputValue);
  };

  const fetchWorkPermits = async () => {
    try {
      const response = await fetch('http://localhost:3000/getworkpermitsforpayment', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const WorkPermitData = await response.json();
      setWorkPermits(WorkPermitData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const handleTokenCheck = () => {
      if (!token) {
          navigate('/'); // Redirect to login if no token
      } else {
          fetchWorkPermits(); // Fetch work permits if token is present
      }
    };

    handleTokenCheck(); // Call the function to check the token
  }, [navigate, token]);

  useEffect(() => {
    setFilteredItems(workPermits); // Display all work permits by default
  }, [workPermits]);

  // Date picker states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle date search
  const handleDateSearch = () => {
    const filteredByDate = workPermits.filter((permit) => {
      const permitDate = new Date(permit.createdAt);
      const isAfterStartDate = startDate ? permitDate >= new Date(startDate) : true;
      const isBeforeEndDate = endDate ? permitDate <= new Date(endDate) : true;
      return isAfterStartDate && isBeforeEndDate;
    });

    setFilteredItems(filteredByDate);
    setCurrentPage(0); // Reset to the first page of results
  };

  const maxDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return (
    <section className="DAbody">
      <div className="DAsidebar-container">
        <DASidebar handleLogout={handleLogout} /> {/* Pass handleLogout to DASidebar */}
      </div>

      <div className="DAcontent">
        <header className='DAheader'>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div className='workpermittable'>
          <p>Work Permit Applications (For Payment)</p>
          {/* Search Bar */}
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search by ID, Status, or Classification"
              value={inputValue} // Use inputValue for the input field
              onChange={(e) => setInputValue(e.target.value)} // Update inputValue state
              className="search-input" // Add a class for styling
            />
            <button onClick={handleSearch} className="search-button">Search</button> {/* Button to trigger search */}
          </div>

          {/* Dropdown for Classification Filter */}
          <select value={classificationFilter} onChange={handleClassificationChange}>
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Renew">Renew</option>
          </select>

          {/* Date Pickers for Date Range Filter */}
          <div className="date-picker-container">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={maxDate} // Set the maximum date to today
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={maxDate} // Set the maximum date to today
              placeholder="End Date"
            />
            <button onClick={handleDateSearch} className="search-button">Search by Date</button>
          </div>

          <table className="permit-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>
                  ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  Name {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('workpermitstatus')}>
                  Status {sortConfig.key === 'workpermitstatus' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('classification')}>
                  Classification {sortConfig.key === 'classification' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('createdAt')}>
                  Date Issued {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((permit) => (
                <tr key={permit._id}>
                  <td>{permit.id}</td>
                  <td>{permit.formData.personalInformation.lastName} {permit.formData.personalInformation.firstName}</td>
                  <td>{permit.workpermitstatus}</td>
                  <td>{permit.classification}</td>
                  <td>
                    <input 
                      type="date" 
                      value={new Date(permit.createdAt).toISOString().split('T')[0]} 
                      readOnly 
                    />
                  </td>
                  <td>
                    <button className="modal-button" onClick={() => handleViewApplication(permit._id)}>View Application</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-buttons">
            {currentPage > 0 && (
              <button onClick={handlePreviousPage}>Back</button>
            )}
            {currentPage < totalPages - 1 && (
              <button onClick={handleNextPage}>Next</button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataControllerForPaymentWP;