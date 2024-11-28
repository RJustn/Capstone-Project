import React, { useState, useEffect } from 'react';
import WorkPermitTable from './components/WorkPermitTable';
import './Styles/apptest3.css';


interface Permit {
  _id: string;
  id: string;
  workpermitstatus: string;
  classification: string;
  applicationdateIssued: string;
  permitExpiryDate?: string;
}

interface User {
    id: number;
    name: string;
    groceries: string[];
    totalPrice: number;
  }

  
const AppTest3: React.FC = () => {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  useEffect(() => {
    const fetchWorkPermits = async () => {
        try {
          const response = await fetch('http://localhost:3000/client/fetchuserworkpermits', {
            method: 'GET',
            credentials: 'include', // Ensure cookies (containing the token) are sent
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const workPermitData = await response.json();
          setPermits(workPermitData);
        } catch (error) {
          console.error('Error fetching work permits:', error);
          setError('Failed to fetch work permits, please try again.');
        }finally{
            setLoading(false);
        }
      };
    fetchWorkPermits();
  }, []);


  
  const openModal = (permit: Permit) => {
    alert(`Action chosen for Work Permit ID: ${permit.id}`);
  };

  // Pagination Logic
  const indexOfLastPermit = currentPage * itemsPerPage;
  const indexOfFirstPermit = indexOfLastPermit - itemsPerPage;
  const currentPermits = permits.slice(indexOfFirstPermit, indexOfLastPermit);

  // Handle Next and Previous Page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);






  const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("");

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Function for Option 1: Log to the console
    const handleOption1 = () => {
        console.log("Option 1 was selected");
        setSelectedOption("Option 1");
        setIsOpen(false);  // Close the dropdown
        setSelectedOption("");  // Immediately reset the dropdown text
    };

    // Function for Option 2: Show an alert
    const handleOption2 = () => {
        alert("Option 2 was selected");
        setSelectedOption("Option 2");
        setIsOpen(false);  // Close the dropdown
        setSelectedOption("");
    };

    // Function for Option 3: Refresh the page
    const handleOption3 = () => {
        window.location.reload();  // Refresh the page
        setSelectedOption("Option 3");
        setIsOpen(false);  // Close the dropdown
        setSelectedOption("");
    };


    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const users: User[] = [
      {
        id: 1,
        name: 'user1',
        groceries: ['milk', 'chicken', 'bread'],
        totalPrice: 100,
      },
      {
        id: 2,
        name: 'user2',
        groceries: ['eggs', 'cheese', 'tomatoes'],
        totalPrice: 20,
      },
      {
        id: 3,
        name: 'user3',
        groceries: ['water', 'apple'],
        totalPrice: 10,
      },
    ];
  
    const handleOptionChange = (option: string, userId: number, resetDropdown: () => void) => {
      if (option === 'display') {
        setSelectedUserId(userId);
      } else {
        setSelectedUserId(null); // Close the list if a different option is selected
        if (option === 'console') {
          console.log('Hello World');
        }
      }
      resetDropdown(); // Reset dropdown to "Select Action"
    };




  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Work Permit Management</h1>
      <WorkPermitTable permits={currentPermits} openModal={openModal} />

      {/* Pagination Controls */}
      <div>
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage * itemsPerPage >= permits.length}
        >
          Next
        </button>
      </div>
      <div className="dropdown">
            <button className="dropdown-btn" onClick={toggleDropdown}>
                {selectedOption || "Dropdown"}
            </button>
            {isOpen && (
                <div className="dropdown-content">
                    <button onClick={handleOption1}>Option 1</button>
                    <button onClick={handleOption2}>Option 2</button>
                    <button onClick={handleOption3}>Option 3</button>
                </div>
            )}
        </div>



        <div>
      <table border={1} cellPadding="10">
        <thead>
          <tr>
            <th>User</th>
            <th>Category</th>
            <th>Total Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <tr>
                <td>{user.name}</td>
                <td>groceries</td>
                <td>{user.totalPrice} dollars</td>
                <td>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      e.target.value = ""; // Reset dropdown after selection
                      handleOptionChange(selectedValue, user.id, () => (e.target.value = ""));
                    }}
                  >
                    <option value="" disabled>
                      Select Action
                    </option>
                    <option value="display">Display Groceries</option>
                    <option value="console">Console Hello World</option>
                  </select>
                </td>
              </tr>
              {selectedUserId === user.id && (
                <tr>
                  <td colSpan={4}>
                    <ul>
                      {user.groceries.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>

    </div>


    
  );
};

export default AppTest3;
