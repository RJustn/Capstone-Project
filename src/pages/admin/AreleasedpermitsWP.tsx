import '../Styles/DataControllerStyles.css'; 
import AdminSideBar from '../components/NavigationBars/AdminSideBar';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Set the root element for accessibility

interface WorkPermit {
  _id: string;
  id: string;
  workpermitstatus: string;
  classification: string;
  createdAt: string;
  permitExpiryDate: string;
  formData: FormDetails;
  permitFile: string;
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

const AreleasedpermitsWP: React.FC = () => {
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkPermit[]>([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [selectedPermit, setSelectedPermit] = useState<WorkPermit | null>(null);
  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string | null }>({});



  const customModalStyles = {
    content: {
      width: '50%', // Adjust the width as needed
      margin: 'auto', // Center the modal horizontally
    },
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-admin', {
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
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
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

  // Search QUERY @@@@@@@@@@@@@@@@@@@@@
  const [inputValue, setInputValue] = useState<string>('');


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


  // Handle the search when the button is clicked
  const handleSearch = () => {
    const searchValue = inputValue.toLowerCase(); // normalize input
    const filteredBySearch = workPermits.filter((permit) => {
     
      const firstname = permit?.formData.personalInformation.firstName?.toLowerCase() || "";
      const lastname = permit?.formData.personalInformation.lastName?.toLowerCase() || "";

      const permitid = permit?.id?.toString().toLowerCase() || "";
      return (
        firstname.includes(searchValue) ||
        permitid.includes(searchValue) ||
        lastname.includes(searchValue) 
      );
    });
  
    setFilteredItems(filteredBySearch);
    setCurrentPage(0); // Reset to the first page of results
  };



  const { type } = useParams<{ type: string }>();

  useEffect(() => {
    const fetchWorkPermits = async () => {
      try {
        console.log(type);
        const response = await fetch(`https://capstone-project-backend-nu.vercel.app/datacontroller/getworkpermitrelease/${type}`, {
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
  const [activePermitId, setActivePermitId] = useState<WorkPermit | null>(null);
  const handleAction = (action: string, permit: WorkPermit) => {
    switch (action) {
      case 'viewApplication':
    console.log(`Edit permit ID: ${permit._id}`);
      navigate(`/Aviewapplicationdetails/${permit._id}`);
        break;
      case 'viewAttachments':
        console.log(`View attachments for permit ID: ${permit._id}`);
        setSelectedPermit(permit);
        setIsAttachmentsModalOpen(true);
        break;

      case 'viewWorkPermit':
   renderDocument(permit.permitFile);
   setActivePermitId(permit);
        break;
        
      default:
        console.warn('Unknown action');
    }
  };



  const renderDocument = (fileName: string | null) => {
    const fileUrl = fileName;
  
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
  const [modalFile, setModalFile] = useState<string | null>(null);
  const [isModalOpenFile, setIsModalOpenFile] = useState(false);
  //File Viewing
  const openModal = (filePath: string) => {
    setModalFile(filePath);
    setIsModalOpenFile(true);
  };

 const closeModal = () => {
    setIsModalOpenFile(false);
    setModalFile(null);
    setActivePermitId(null);
  };


  const closeAttachmentsModal = () => {
    setIsAttachmentsModalOpen(false);
    setSelectedPermit(null);
    setActivePermitId(null);
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

let displayTextTitle = 'All Work Permit Applications (Released)';

if (type === 'new') {
  displayTextTitle = 'New Work Permit Applications (Released)';
} else if (type === 'renew') {
  displayTextTitle = 'Renewal of Work Permit Applications (Released)';
} else if (type === 'all') {
  displayTextTitle = 'All Work Permit Applications (Released)';
} else {
  displayTextTitle = 'All Work Permit Applications (Released)';
}


  return (
    <section className="Abody">
      <div className="Asidebar-container">
        <AdminSideBar />{/* Pass handleLogout to DASidebar */}
      </div>

      <div className="Acontent">
        <header className='Aheader'>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div className='workpermittable'>
          <p>{displayTextTitle}</p>
          {/* Search Bar */}
          <div>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search by ID, Name, or Address"
              value={inputValue} // Use inputValue for the input field
              onChange={(e) => setInputValue(e.target.value)} // Update inputValue state
              className="search-input" // Add a class for styling
            />

            <button onClick={handleSearch} className="search-button mt-1">Search</button> {/* Button to trigger search */}
            
          </div>



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
          </div>


          {filteredItems.length === 0 ? (
          <div className="error-message mt-3">
      <p style={{ color: "blue", textAlign: "center", fontSize: "16px" }}>
        No Work Permit Applications found.
      </p>
    </div>
  ) : (
<div>
          <table className="permit-table mt-3">
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
        <td>{permit.formData.personalInformation.lastName}, {permit.formData.personalInformation.firstName} {permit.formData.personalInformation.middleInitial}</td>
        <td>{permit.workpermitstatus}</td>
        
        <td>{permit.classification}</td>
        <td>{new Date(permit.createdAt).toLocaleDateString()}</td>
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
                <option value="viewApplication">View Application</option>
                <option value="viewAttachments">View Attachments</option>
                <option value="viewWorkPermit">View Work Permit</option>
          </select>
        </td>
      </tr>
    ))}
  </tbody>
          </table>

          {totalPages > 1 && (
  <div className="d-flex justify-content-end align-items-center mt-3 pagination">
    <button
      onClick={handlePreviousPage}
      disabled={currentPage === 0}
      className="pagination-button"
    >
      Previous
    </button>
    <span className="page-info me-2" style={{ marginTop: "5px" }}>
      Page {currentPage + 1} of {totalPages}
    </span>
    <button
      onClick={handleNextPage}
      disabled={currentPage === totalPages - 1}
      className="pagination-button"
    >
      Next
    </button>
  </div>
)}

</div>
  )}
        </div>
      </div>

      <Modal
        isOpen={isAttachmentsModalOpen}
        onRequestClose={closeAttachmentsModal}
        contentLabel="View Attachments"
        style={customModalStyles} // Apply custom styles
      >
        <form>
        <h2>View Attachments</h2>
        <p>Work Permit Application ID: <strong>{selectedPermit?.id}</strong></p>
          {selectedPermit && (
            <div>
              {/* Document 1 */}
              <p>
              1x1 Picture: 
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
              Cedula: 
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
              Referral Letter: 
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
              FTJS Certificate:
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

              <button className='btn btn-primary-cancel' onClick={() => closeAttachmentsModal()} style={{ marginLeft: '10px' }}>
            Close
          </button>
            </div>
          )}
        </form>
      </Modal>

      {isModalOpenFile && activePermitId && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{justifyContent:'center'}}>
            {modalFile && (
              <div>
                <p>Viewing Work Permit of <strong>{activePermitId.id}</strong></p>
                <div>
                {modalFile.endsWith('.pdf') ? (
                  <iframe src={modalFile} style={{ width: '700px', height: '600px', marginTop: '20px', marginLeft:'110px'}} title="PDF Viewer" />
                ) : (
                  <img src={modalFile} alt="Document" style={{ maxWidth: '100%', height: 'auto' }} />
                )}
                </div>
              </div>
            )}
            <button className="back-button" onClick={closeModal}>Close</button>
          </div>
        </div>
)}
    </section>
  );
};

export default AreleasedpermitsWP;