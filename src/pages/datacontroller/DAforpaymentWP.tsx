import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/NavigationBars/DAsidebar';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import axios from 'axios';
import Swal from 'sweetalert2';

Modal.setAppElement('#root'); // Set the root element for accessibility

interface WorkPermit {
  _id: string;
  id: string;
  workpermitstatus: string;
  classification: string;
  createdAt: string;
  permitExpiryDate: string;
  formData: FormDetails;
}
interface PersonalInformation {
  lastName: string;
  firstName: string;
  middleInitial?: string; // Optional
  permanentAddress?: string; // Optional
  currentlyResiding: boolean;
  temporaryAddress?: string; // Optional
  dateOfBirth?: Date; // Optional
  age?: number; // Optional
  placeOfBirth?: string; // Optional
  citizenship?: string; // Optional
  civilStatus?: string; // Optional
  gender?: string; // Optional
  height?: string; // Optional
  weight?: string; // Optional
  mobileTel?: string; // Optional
  email?: string; // Optional
  educationalAttainment?: string; // Optional
  natureOfWork?: string; // Optional
  placeOfWork?: string; // Optional
  companyName?: string; // Optional
  workpermitclassification?: string;
}

interface EmergencyContact {
  name2?: string; // Optional
  mobileTel2?: string; // Optional
  address?: string; // Optional
}

interface FormDetails {
  personalInformation: PersonalInformation;
  emergencyContact: EmergencyContact;
  files: Files;
}
interface Files {
  document1: string | null; // Optional
  document2: string | null; // Optional
  document3: string | null; // Optional
  document4: string | null; // Optional
  remarksdoc1?: string; // Optional
  remarksdoc2?: string; // Optional
  remarksdoc3?: string; // Optional
  remarksdoc4?: string; // Optional
  }

const DataControllerForPaymentWP: React.FC = () => {
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkPermit[]>([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [selectedPermit, setSelectedPermit] = useState<WorkPermit | null>(null);
  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);

  const [activePermitId, setActivePermitId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string | null }>({});

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const customModalStyles = {
    content: {
      width: '50%', // Adjust the width as needed
      margin: 'auto', // Center the modal horizontally
    },
  };

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
  }, [navigate]); // Only depend on navigate, which is necessary for the redirection



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

  // END CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

 


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
  const { type } = useParams<{ type: string }>();

  useEffect(() => {
    const fetchWorkPermits = async () => {
      try {
        console.log(type);
        const response = await fetch(`https://capstone-project-backend-nu.vercel.app/datacontroller/getworkpermitforpayment/${type}`, {
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
    fetchWorkPermits(); 
 
  }, [type,token]);

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

  const handleAction = (action: string, permit: WorkPermit) => {
    switch (action) {
      case 'viewApplication':
    console.log(`Edit permit ID: ${permit._id}`);
      navigate(`/DAviewapplicationdetails/${permit._id}`);
        break;
      case 'viewAttachments':
        console.log(`View attachments for permit ID: ${permit._id}`);
        setSelectedPermit(permit);
        setIsAttachmentsModalOpen(true);
        break;
        case 'pay':
          setActivePermitId(permit._id);  // Save the permit ID
          setShowPaymentMethod(true);
          setModalStep(0);                 // Reset modal to the first step
           console.log(`Pay for permit: ${permit._id}`);
          console.log(`Pay for permit: ${permit.id}`);
          break;
      default:
        console.warn('Unknown action');
    }
  };

//Payment
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





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!receiptFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Receipt',
        text: 'Please upload a receipt before proceeding.',
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('document1', receiptFile);
  
    logFormData(formData); // Debugging
  
    try {
      // Show confirmation alert before uploading
      const { isConfirmed } = await Swal.fire({
        title: 'Submit Payment?',
        text: 'Are you sure you want to submit this payment?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit',
        cancelButtonText: 'Cancel',
      });
  
      if (!isConfirmed) return; // Stop execution if user cancels
  
      // Show loading alert while submitting
      Swal.fire({
        title: 'Processing...',
        text: 'Uploading payment receipt. Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      const response = await axios.post(
        `https://capstone-project-backend-nu.vercel.app/client/workpermithandlepayment/${activePermitId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
  
      console.log(response.data);
  
      if (response.status === 200) {
        setReceiptFile(null); // Clear file state
        window.location.reload();
        Swal.fire({
          icon: 'success',
          title: 'Payment Submitted',
          text: 'Receipt payment has been submitted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorMessage = (response.data as { message: string }).message;
        console.error('Error submitting application:', errorMessage);
  
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: errorMessage || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
  
      Swal.fire({
        icon: 'error',
        title: 'Payment Submission Failed',
        text: 'An error occurred while submitting the payment. Please try again.',
      });
    }
  };
  



  const closeAttachmentsModal = () => {
    setIsAttachmentsModalOpen(false);
    setSelectedPermit(null);
  };



  const handleFileChangeReceipt = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setReceiptFile(selectedFiles[0]);
    } else {
      setReceiptFile(null);
    }
  };

  const handleViewDocument = (documentKey: 'document1' | 'document2' | 'document3' | 'document4') => {
    const documentUrl = selectedPermit?.formData.files[documentKey] ?? null; // Ensure it's never undefined
    
    setSelectedFiles((prev) => ({
      ...prev,
      [documentKey]: prev[documentKey] === documentUrl ? null : documentUrl, // Toggle visibility
    }));
  };


const renderFile = (fileUrl: string | null) => {

  
  if (!fileUrl) return null;

  if (fileUrl.endsWith('.pdf')) {
    return (
      <>
      <iframe
      src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
      width="100%"
      height="500px"
      style={{ border: '1px solid #ccc' }}
    />
        <DownloadButton fileUrl={fileUrl || ''} /> 
    </>
    );
  } 
  else if (fileUrl.endsWith('.docx')) {
    return (
      <>
      <iframe
      src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
      width="100%"
      height="500px"
      style={{ border: '1px solid #ccc' }}
    />
    
    <DownloadButton fileUrl={fileUrl || ''} />
    </>
    );

  }
  else {
    return (
      <img
        src={fileUrl}
        alt="Document"
        style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
      />
    );
  }
};

const DownloadButton = ({ fileUrl }: { fileUrl: string }) => {
  return (
    <button
      className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all text-center block"
      onClick={(e) => {
        e.preventDefault(); // Prevent default behavior
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileUrl.split("/").pop() || "download"; // Extract filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
    >
     Download File
    </button>
  );
};

  let displayTextTitle = 'All Work Permit Applications (For Payments)';

if (type === 'new') {
  displayTextTitle = 'New Work Permit Applications (For Payments)';
} else if (type === 'renew') {
  displayTextTitle = 'Renewal of Work Permit Applications (For Payments)';
} else if (type === 'all') {
  displayTextTitle = 'All Work Permit Applications (For Payments)';
} else {
  displayTextTitle = 'All Work Permit Applications (For Payments)';
}

  return (
    <section className="DAbody">
      <div className="DAsidebar-container">
        <DASidebar /> {/* Pass handleLogout to DASidebar */}
      </div>

      <div className="DAcontent">
        <header className='DAheader'>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div className='workpermittable'>
        <p>{displayTextTitle}</p>



          {/* Date Pickers for Date Range Filter */}
          <div className="date-picker-container">
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={maxDate} // Set the maximum date to today
              placeholder="Start Date"
            />
            End Date:
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
                  Created At {sortConfig.key === 'createdAt' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('workpermitstatus')}>
                  Status {sortConfig.key === 'workpermitstatus' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('classification')}>
                  Classification {sortConfig.key === 'classification' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((permit) => (
                <tr key={permit._id}>
                  <td>{permit.id}</td>
                  <td>{new Date(permit.createdAt).toLocaleDateString()}</td>
                  <td>{permit.workpermitstatus}</td>
                  <td>{permit.classification}</td>
                  <td>
                  <select
            defaultValue=""
            onChange={(e) => {
              handleAction(e.target.value, permit);
              e.target.value = ""; // Reset dropdown to default
            }}
            className="dropdown-button"
          >
                      <option value="">Select Action</option>
                      <option value="viewApplication">View Application</option>
                      <option value="viewAttachments">View Attachments</option>
                      <option value="pay">Upload Application Receipt</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="btn btn-danger"
              >
                Previous
              </button>
              <span style={{ margin: "0 10px", marginTop: "8px" }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="btn btn-success"
              >
                Next
              </button>
            </div>
          )}
        </div>
        {/* Modal Dumps */}
        {showPaymentMethod && (
  <div className="modal-overlay-pay" onClick={handleOverlayClick}>
    <div className="modal-content-pay" onClick={(e) => e.stopPropagation()}>
      <button className="close-button-pay" onClick={closePaymentMethod}>✖</button>
      <h3>Choose an Action for Permit ID: {activePermitId}</h3>
      {modalStep === 0 && (
        <div>
          <h2>Upload Receipt</h2>
          <input type="file" onChange={handleFileChangeReceipt} />
          <button onClick={handleSubmit} disabled={!receiptFile}>Upload</button>
        </div>
      )}
    </div>
  </div>
)}

      </div>
      <Modal
        isOpen={isAttachmentsModalOpen}
        onRequestClose={closeAttachmentsModal}
        contentLabel="View Attachments"
        style={customModalStyles} // Apply custom styles
      >
        <form>
          <h2>View Attachments</h2>
          {selectedPermit && (
            <div>
              <label>Attachments:</label>
              <p>Permit ID: {selectedPermit?._id}</p>
              {/* Document 1 */}
              <p>
                Document 1: 
                {selectedPermit.formData.files.document1 && (
                  <button
                    type="button"
                    onClick={() => handleViewDocument('document1')}
                  >
                    {selectedFiles.document1 ? 'Back' : 'View'}
                  </button>
                )}
                <label>Remarks:</label>
                <input 
                  type="text" 
                  value={(selectedPermit.formData.files.remarksdoc1 || '')} 
                  disabled
                />
              </p>
              {renderFile(selectedFiles.document1)}
              {/* Document 2 */}
              <p>
                Document 2: 
                {selectedPermit.formData.files.document2 && (
                  <button
                    type="button"
                    onClick={() => handleViewDocument('document2')}
                  >
                    {selectedFiles.document2 ? 'Back' : 'View'}
                  </button>
                )}

                <label>Remarks:</label>
                <input 
                  type="text" 
                  value={(selectedPermit.formData.files.remarksdoc2 || '')} 
   
                  disabled
                />
              </p>
              {renderFile(selectedFiles.document2)}
              {/* Document 3 */}
              <p>
                Document 3: 
                {selectedPermit.formData.files.document3 && (
                  <button
                    type="button"
                    onClick={() => handleViewDocument('document3')}
                  >
                    {selectedFiles.document3 ? 'Back' : 'View'}
                  </button>
                )}
                
                <label>Remarks:</label>
                <input 
                  type="text" 
                  value={(selectedPermit.formData.files.remarksdoc3 || '')} 
                  disabled
                />
              </p>
              {renderFile(selectedFiles.document3)}
              {/* Document 4 */}
              <p>
                Document 4: 
                {selectedPermit.formData.files.document4 && (
                  <button
                    type="button"
                    onClick={() => handleViewDocument('document4')}
                  >
                    {selectedFiles.document4 ? 'Back' : 'View'}
                  </button>
                )}

                <label>Remarks:</label>
                <input 
                  type="text" 
                  value={(selectedPermit.formData.files.remarksdoc4 || '')} 
                  disabled
                />
              </p>
              {renderFile(selectedFiles.document4)}

              <button className='btn btn-danger' onClick={() => closeAttachmentsModal()} style={{ marginLeft: '10px' }}>
            Close
          </button>
            </div>
          )}
        </form>
      </Modal>
    </section>
  );
};

export default DataControllerForPaymentWP;
