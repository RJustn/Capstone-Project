import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ClientStyles.css';
import WorkPermit from './workpermitpage';
import ClientSideBar from '../components/ClientSideBar';
import axios from 'axios';

// Define the WorkPermit interface
export interface WorkPermit {
  _id: string;
  id: string;
  workpermitstatus: string;
  classification: string;
  createdAt: string;
  permitExpiryDate: string;
  applicationdateIssued: string;
  permitFile: string;
  receipt: Receipt;
}


export interface Receipt {
    receiptId?: string; // Optional
    modeOfPayment?: string; // Optional
    receiptDate?: string; // Optional
    amountPaid?: string; // Optional
    receiptFile?: string;
  }


const ViewWorkPermitApplication: React.FC = () => {
    const navigate = useNavigate();
    const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
    const [, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    //Active Permit ID
    const [activePermitId, setActivePermitId] = useState<string | null>(null);
    //Modals
    const [modalFile, setModalFile] = useState<string | null>(null);
    const [isModalOpenFile, setIsModalOpenFile] = useState(false);

// CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
const [currentPage, setCurrentPage] = useState(0);
const itemsPerPage = 5;
const totalPages = Math.ceil(workPermits.length / itemsPerPage)
const startIndex = currentPage * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const sortedWorkPermits = workPermits
  .slice() // Make a copy of the array to avoid modifying the original
  .sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    // Check if both dates are valid
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return 0; // If either date is invalid, keep their order (or handle as needed)
    }

    return dateB.getTime() - dateA.getTime(); // Sort in descending order
  });

// Now slice the sorted array to get the current items
const currentItems = sortedWorkPermits.slice(startIndex, endIndex);
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


// File Viewing
const openModal = (filePath: string) => {
  setModalFile(filePath);
  setIsModalOpenFile(true);
};

const closeModal = () => {
  setIsModalOpenFile(false);
  setModalFile(null);
};

// File Deleting
const handleDelete = async (permitId: string) => {
  console.log(`Delete permit ID: ${permitId}`);
  try {
    const response = await fetch(`http://localhost:3000/datacontroller/deletePermit/${permitId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert("Permit deleted successfully");
      window.location.reload(); // Reload the page to refresh the data
    } else {
      alert("Failed to delete permit");
    }
  } catch (error) {
    console.error("Error deleting permit:", error);
  }
};

//Payment Method
const [showPaymentMethod, setShowPaymentMethod] = useState(false);
 const [modalStep, setModalStep] = useState(0);
 const closePaymentMethod = () => {
    setShowPaymentMethod(false);
    setModalStep(0); // Reset when closing
  };

 // Close modal on overlay click
 const handleOverlayClick = () => {
   closePaymentMethod();
 };

const logFormData = (formData: FormData) => {
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
};


//Payment Submission

 const [confirmpayment, setConfirmPayment] = useState(false);

  const confirmpaymentclose = () => {
    setConfirmPayment(false);
    setActivePermitId(null);
    setShowPaymentMethod(false);
    window.location.reload();
  };

  const closeviewpayment = () => {
    setShowPaymentMethod(false);
    setActivePermitId(null);
    setConfirmPayment(false);
    window.location.reload();

  };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!files.document1) {
    alert('Please Upload a Receipt');
    return; // Prevent further execution
  }
else{
  const formData = new FormData();
  formData.append('document1', files.document1); // Append validated file


  logFormData(formData);


  try {
    const response = await axios.post(`http://localhost:3000/datacontroller/updateworkpermitpayments/${activePermitId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true, 
    });
      console.log(response.data);
      if (response.status === 200) {
        setConfirmPayment(true);
        setFiles({ document1: null }); // Clear uploaded file (if applicable)

        // Optionally update state/UI instead of reloading
      } else {
        const errorMessage = (response.data as { message: string }).message;
        console.error('Error submitting application:', errorMessage);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        alert('Failed to submit work permit payment. Please try again.');
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred. Please contact support.');
      }
    }
  }
};


//File Codes
  const [files, setFiles] = useState<{
    document1: File | null;
  }>({
    document1: null,
  });
  
      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, doc: 'document1') => {
        const selectedFiles = event.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        setFiles((prev) => ({
          ...prev,
          [doc]: selectedFiles[0],
        }));
      } else {
        setFiles((prev) => ({
          ...prev,
          [doc]: null, 
        }));
      }
    };

  const fetchDocumentUrl = (fileName: string | null, folder: 'uploads' | 'permits' | 'receipts'): string | null => {
    if (!fileName) return null;
    
    // Return the file URL based on the folder specified
    return `http://localhost:3000/datacontroller/${folder}/${fileName}`;
  };
  
  const renderDocument = (fileName: string | null, folder: 'uploads' | 'permits' | 'receipts') => {
    const fileUrl = fetchDocumentUrl(fileName, folder);
  
    if (!fileUrl) return <span>Not uploaded</span>;
  
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
  
    // Automatically open the modal if a valid file is found
   
        openModal(fileUrl); // Open the modal automatically
  
  
    return (
      <span>
        {fileExtension === 'pdf' ? 'View PDF' : 'View Document'}
      </span>
    );
  };

    
// Content CODE
const handleAction = (action: string, permit: WorkPermit) => {
  switch (action) {
    case 'viewApplication':
  console.log(`Edit permit ID: ${permit._id}`);
    navigate(`/viewapplicationdetails/${permit._id}`);
      break;
    case 'delete':
      handleDelete(permit._id);
      console.log(`Delete permit: ${permit._id}`);
      break;
    case 'pay':
      setActivePermitId(permit._id);  // Save the permit ID
      setShowPaymentMethod(true);
      setModalStep(0);                 // Reset modal to the first step
       console.log(`Pay for permit: ${permit._id}`);
      console.log(`Pay for permit: ${permit.id}`);
      break;
    case 'viewReceipt':
      if (permit.receipt?.receiptFile) { // Check if the receipt file exists
          renderDocument(permit.receipt.receiptFile, 'receipts'); // Automatically open modal
          console.log(`View receipt for permit: ${permit.id}`);
        } else {
          console.log(`No receipt file found for permit: ${permit.id}`);
        }
      break;
    case 'viewPermit':
   
      renderDocument(permit.permitFile, 'permits');

      console.log(`View permit: ${permit.permitFile}`);
      console.log(`View permit: ${permit.id}`);
      break;

    default:
      console.warn('Unknown action');
  }
};

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
// Use Effects
  useEffect(() => {
    if (!token) {
      navigate('/'); // Redirect to login if no token
      return;
    }
  
    const fetchWorkPermits = async () => {
      try {
        const response = await fetch('http://localhost:3000/client/fetchuserworkpermits', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const WorkPermitData = await response.json();
        setWorkPermits(WorkPermitData);
      } catch (error) {
        console.error('Error fetching work permits:', error);
        setError('Failed to fetch work permits, please try again.');
      }
    };
  
    fetchWorkPermits();
  }, [navigate, token]); // Only run when token changes
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/client/check-auth-client', {
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


    return (
        <section className="dashboard-container">
            <div className="sidebar-container">
            <ClientSideBar handleLogout={handleLogout} /> {/* Pass handleLogout to ClientSideBar */}
            </div>

            <div className="content">
                <header>
                    <h1>View Work Permit Applications</h1>
                </header>

                <div className='workpermittable'>
  <p>Work Permit Applications</p>
  <table className="permit-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Status</th>
      <th>Transaction</th>
      <th>Date Issued</th>
      <th>Date Expired</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {currentItems.map((permit) => (
      <tr key={permit._id}>
        <td>{permit.id}</td>
        <td>{permit.workpermitstatus}</td>
        <td>{permit.classification}</td>
        <td>{new Date(permit.applicationdateIssued).toLocaleDateString()}</td>
        <td>
          {permit.permitExpiryDate
            ? new Date(permit.permitExpiryDate).toLocaleDateString()
            : '---'}
        </td>
        <td>
          <select
            defaultValue=""
            onChange={(e) => {
              handleAction(e.target.value, permit);
              e.target.value = ""; // Reset dropdown to default
            }}
            className="dropdown-button"
          >
            <option value="" disabled>
              Select Action
            </option>
            {permit.workpermitstatus === 'Pending' && (
              <>
                <option value="viewApplication">View Application</option>
                <option value="delete">Delete</option>
              </>
            )}
            {permit.workpermitstatus === 'Waiting for Payment' && (
              <>
                <option value="viewApplication">View Application</option>
                <option value="pay">Pay</option>
              </>
            )}
            {permit.workpermitstatus === 'Released' && (
              <>
                <option value="viewApplication">View Application</option>
                {permit.classification === 'Renew' && (
                       <option value="viewReceipt">View Receipt</option>
                )}
                <option value="viewPermit">View Permit</option>
              </>
            )}
            {permit.workpermitstatus === 'Expired' && (
              <>
                <option value="viewApplication">View Application</option>
                {permit.classification === 'Renew' && (
                       <option value="viewReceipt">View Receipt</option>
                )}
                <option value="viewPermit">View Permit</option>
              </>
            )}
          </select>
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
{/* Modal Dumps */}
{showPaymentMethod && (
        <div className="modal-overlay-pay" onClick={handleOverlayClick}>
          <div className="modal-content-pay" onClick={(e) => e.stopPropagation()}>
            <button className="close-button-pay" onClick={closePaymentMethod}>✖</button>
            <h3>Choose an Action for Permit ID: {activePermitId}</h3> {/* Display the permit ID */}
            {modalStep === 0 && (
              <div>
                <h2>Upload Receipt</h2>
            
                <input type="file" onChange={(e) => handleFileChange(e, 'document1')} />

                <button onClick={handleSubmit} disabled={!files}>Upload</button>
              </div>
            )}


          </div>
        </div>
      )}

{isModalOpenFile && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalFile && (
              <div>
                {modalFile.endsWith('.pdf') ? (
                  <iframe src={modalFile} style={{ width: '500px', height: '600px' }} title="PDF Viewer" />
                ) : (
                  <img src={modalFile} alt="Document" style={{ maxWidth: '100%', height: 'auto' }} />
                )}
              </div>
            )}
            <button className="back-button" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

{confirmpayment && activePermitId &&(
  <div className="modal-overlay" onClick={closeviewpayment}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          Payment Completed for Working Permit Application {activePermitId}
          <button onClick={confirmpaymentclose}>Okay</button>
            </div>
            </div>
)}
            </div>
        </section>
    );
};

export default ViewWorkPermitApplication;