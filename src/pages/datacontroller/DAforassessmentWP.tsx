import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/NavigationBars/DAsidebar';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
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
const DataControllerForAssessmentWP: React.FC = () => {
  const [isEditingAttach, setIsEditingAttach] = useState(false);
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkPermit[]>([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<WorkPermit | null>(null);
  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track if fields are editable

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
      if (a[key] === null || b[key] === null) {
        return 0;
      }
      if (a[key]! < b[key]!) {
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
 
     const [originalPermit, setOriginalPermit] = useState<WorkPermit | null>(null);
     const handleEditClick = () => {
      setOriginalPermit(selectedPermit); // Save original
      setIsEditing(true);
    };

    const handleCancelEdit = () => {
      setSelectedPermit(originalPermit); // Revert changes
      setIsEditing(false);
    };
  useEffect(() => {
    const handleTokenCheck = () => {
      if (!token) {
          navigate('/'); // Redirect to login if no token
      } else {
        const fetchWorkPermits = async () => {
          try {
            console.log(type);
            const response = await fetch(
              `https://capstone-project-backend-nu.vercel.app/datacontroller/getworkpermitforassessment/${type}`,
              {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
      
            if (!response.ok) {
              throw new Error('Failed to fetch business permits');
            }
      
            const data = await response.json();
            setWorkPermits(data);
          } catch (error) {
            console.error('Error fetching business permits:', error);
          }
        };
          fetchWorkPermits(); // Fetch work permits if token is present
      }
    };

    handleTokenCheck(); // Call the function to check the token
  }, [navigate,type,token]);

  useEffect(() => {
    setFilteredItems(workPermits); // Display all work permits by default
  }, [workPermits]);

   useEffect(() => {
      return () => {
        const lockedPermitId = localStorage.getItem('lockedPermitId');
        if (lockedPermitId) {
          unlockPermit(lockedPermitId);
        }
      };
    }, []);
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

    const unlockPermit = async (permitId: string) => {
  try {
    const response = await fetch(
      `https://capstone-project-backend-nu.vercel.app/datacontroller/unlock/work/${permitId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: localStorage.getItem('token') }), // Pass the current user's ID
      }
    );

    if (response.ok) {
      console.log(`Permit ID ${permitId} unlocked successfully.`);
      if (localStorage.getItem('lockedPermitId') === permitId) {
        localStorage.removeItem('lockedPermitId');
      }
    } else {
      console.error('Failed to unlock permit.');
    }
  } catch (error) {
    console.error('Error unlocking permit:', error);
  }
};

  const handleAction = async (action: string, permit: WorkPermit) => {
    switch (action) {
        case 'viewApplication':
        try {
                const userId = localStorage.getItem('token'); // Retrieve `userId` from localStorage
                console.log('Retrieved userId from localStorage:', userId);
        
                if (!userId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'User ID Missing',
                        text: 'Please log in again to continue.',
                    });
                    return;
                }
        
                const response = await fetch(
                    `https://capstone-project-backend-nu.vercel.app/datacontroller/lock/work/${permit._id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId }), // Pass `userId` in the request body
                    }
                );
        
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Permit ID ${permit._id} locked successfully.`);
                    localStorage.setItem('lockedPermitId', permit._id);
                    Swal.fire({
                        icon: 'success',
                        title: 'Access Granted',
                        text: data.message,
                    });
                    navigate(`/DAviewapplicationdetails/${permit._id}`);
                } else if (response.status === 403) {
                    const errorData = await response.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Cannot Assess',
                        text: errorData.message || 'This permit is already being assessed by another user.',
                    });
                } else {
                    const errorData = await response.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorData.message || 'An unexpected error occurred.',
                    });
                }
            } catch (error) {
                console.error('Error locking permit:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong while locking the permit. Please try again later.',
                });
            }
            break;
      case 'viewAttachments':
        console.log(`View attachments for permit ID: ${permit._id}`);
        setSelectedPermit(permit);
        setIsAttachmentsModalOpen(true);
        break;
      case 'editFormDetails':
        console.log(`Edit form details for permit ID: ${permit._id}`);
        setSelectedPermit(permit);
        setIsModalOpen(true);
        break;
      default:
        console.warn('Unknown action');
    }
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPermit(null);
    setIsEditing(false);
  
  };

  const closeAttachmentsModal = () => {
    setIsAttachmentsModalOpen(false);
    setSelectedPermit(null);
    handleCancelEditAttach();
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermit) {
        // Show loading SweetAlert
        Swal.fire({
          title: 'Updating Work Permit Details...',
          text: 'Please wait while we update the application.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      try {
        const response = await fetch(`https://capstone-project-backend-nu.vercel.app/datacontroller/updateworkpermit/${selectedPermit._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ formData: selectedPermit.formData }),
        });

        if (response.ok) {
          const updatedPermit = await response.json();
          setWorkPermits((prevPermits) =>
            prevPermits.map((permit) =>
              permit._id === updatedPermit._id ? updatedPermit : permit
            )
          );
          closeModal();
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Work permit updated successfully.',
          });
        } else {
          console.error('Failed to update permit');
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to update the work permit.',
          });
        }
      } catch (error) {
        console.error('Error updating permit:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Something went wrong. Please try again later.',
        });
      }
    }
  };
  

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof PersonalInformation) => {
    const value = e.target.value;
    const date = value ? new Date(value) : null;
    const currentYear = new Date().getFullYear();
    const year = date ? date.getFullYear() : null;
  
    if (date && !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(value) && year && year >= 1900 && year <= currentYear) {
      setSelectedPermit((prevPermit) => {
        if (!prevPermit) return prevPermit;
        return {
          ...prevPermit,
          formData: {
            ...prevPermit.formData,
            personalInformation: {
              ...prevPermit.formData.personalInformation,
              [field]: date,
            },
          },
        };
      });
    } else {
      console.error('Invalid date value or format');
    }
  };

  // Removed duplicate handleFileChange function


  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string | null }>({});

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

const [remarksdoc1, setRemarksdoc1] = useState('');
const [remarksdoc2, setRemarksdoc2] = useState('');
const [remarksdoc3, setRemarksdoc3] = useState('');
const [remarksdoc4, setRemarksdoc4] = useState('');

const [files, setFiles] = useState<{
  document1: File | null;
  document2: File | null;
  document3: File | null;
  document4: File | null;
}>({
  document1: null,
  document2: null,
  document3: null,
  document4: null,
});

  //Actionupdate
  const [updatesuccess, setUpdateSuccess] = useState(false);

  const closeupdateSuccess = () => {
    setUpdateSuccess(false);
    window.location.reload();
  };

const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, doc: 'document1' | 'document2' | 'document3' | 'document4') => {
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

const logFormData = (formData: FormData) => {
  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }
};

const updateAttachments = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('remarksdoc1', remarksdoc1);
  formData.append('remarksdoc2', remarksdoc2);
  formData.append('remarksdoc3', remarksdoc3);
  formData.append('remarksdoc4', remarksdoc4);

  if (files.document1) formData.append('document1', files.document1);
  if (files.document2) formData.append('document2', files.document2);
  if (files.document3) formData.append('document3', files.document3);
  if (files.document4) formData.append('document4', files.document4);

  logFormData(formData);
// Show loading SweetAlert
    Swal.fire({
      title: 'Updating Attachments...',
      text: 'Please wait while we upload your documents.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  try {
    if (!selectedPermit) {
      console.error('No permit selected');
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'No permit selected for updating attachments.',
      });
      return;
    }

    const response = await fetch(`https://capstone-project-backend-nu.vercel.app/datacontroller/updateworkpermitattachment/${selectedPermit._id}`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const updatedPermit = await response.json();
      setWorkPermits((prevPermits) =>
        prevPermits.map((permit) =>
          permit._id === updatedPermit._id ? updatedPermit : permit
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Attachments updated successfully.',
      }).then(() => {
        window.location.reload();
      });

      setIsEditingAttach(false);
      closeAttachmentsModal();
      handleCancelEditAttach();
    } else {
      console.error('Failed to upload files');
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to update attachments. Please try again.',
      });
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Something went wrong during the upload.',
    });
  }
};

const handleCancelEditAttach = () => {
  setRemarksdoc1('');
  setRemarksdoc2('');
  setRemarksdoc3('');
  setRemarksdoc4('');
  setFiles({
    document1: null,
    document2: null,
    document3: null,
    document4: null,
  });
  setSelectedFiles({});
  setIsEditingAttach(false); // Add this line to exit edit mode
};

useEffect(() => {
  const urls: Record<string, string> = {}; // Define a typed object for URLs

  // Iterate through each file key in the `files` object
  Object.entries(files).forEach(([key, file]) => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      urls[key] = fileUrl; // Store the created URL
      setSelectedFiles((prev) => ({ ...prev, [key]: fileUrl }));
    }
  });

  // Cleanup function to revoke URLs
  return () => {
    Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  };
}, [files]); // Watch the `files` object for changes

let displayTextTitle = 'All Work Permit Applications (For Assessments)';

if (type === 'new') {
  displayTextTitle = 'New Work Permit Applications (For Assessments)';
} else if (type === 'renew') {
  displayTextTitle = 'Renewal of Work Permit Applications (For Assessments)';
} else if (type === 'all') {
  displayTextTitle = 'All Work Permit Applications (For Assessments)';
} else {
  displayTextTitle = 'All Work Permit Applications (For Assessments)';
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

        <div>
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search by ID and Name"
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
                <th>
                  Classification
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
                <option value="viewApplication">View Application (Assess Permit)</option>
                <option value="viewAttachments">View Attachments</option>
                <option value="editFormDetails">Edit Form Details</option>
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
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Work Permit"
        style={customModalStyles} // Apply custom styles
      >
        <h2>Edit Work Permit</h2>
        <p>Application ID: <strong>{selectedPermit?.id}</strong></p>
        {selectedPermit && (
          <form onSubmit={handleFormSubmit}>
            <label>
              First Name:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.firstName}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        firstName: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.lastName}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        lastName: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Middle Initial:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.middleInitial || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        middleInitial: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Permanent Address:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.permanentAddress || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        permanentAddress: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Currently Residing:
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={selectedPermit.formData.personalInformation.currentlyResiding}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        currentlyResiding: e.target.checked,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Temporary Address:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.temporaryAddress || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        temporaryAddress: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
  Date of Birth:
  <input
    type="date"
    disabled={!isEditing}
    value={selectedPermit.formData.personalInformation.dateOfBirth ? new Date(selectedPermit.formData.personalInformation.dateOfBirth).toISOString().split('T')[0] : ''}
    onChange={(e) => handleDateChange(e, 'dateOfBirth')}
    max={maxDate} // Set the maximum date to today
  />
</label>
            <label>
              Age:
              <input
                type="number"
                disabled={!isEditing}
              value={selectedPermit.formData.personalInformation.age?.toString() || ''}
              onChange={(e) =>
                setSelectedPermit({
                  ...selectedPermit,
                  formData: {
                    ...selectedPermit.formData,
                    personalInformation: {
                      ...selectedPermit.formData.personalInformation,
                      age: parseInt(e.target.value, 10) || undefined,
                    },
                  },
                })
              }
              />
            </label>
            <label>
              Place of Birth:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.placeOfBirth || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        placeOfBirth: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Citizenship:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.citizenship || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        citizenship: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Civil Status:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.civilStatus || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        civilStatus: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Gender:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.gender || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        gender: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Height:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.height || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        height: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Weight:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.weight || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        weight: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Mobile Tel:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.mobileTel || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        mobileTel: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.email || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        email: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Educational Attainment:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.educationalAttainment || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        educationalAttainment: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Nature of Work:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.natureOfWork || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        natureOfWork: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Place of Work:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.placeOfWork || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        placeOfWork: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <label>
              Company Name:
              <input
                type="text"
                disabled={!isEditing}
                value={selectedPermit.formData.personalInformation.companyName || ''}
                onChange={(e) =>
                  setSelectedPermit({
                    ...selectedPermit,
                    formData: {
                      ...selectedPermit.formData,
                      personalInformation: {
                        ...selectedPermit.formData.personalInformation,
                        companyName: e.target.value,
                      },
                    },
                  })
                }
              />
            </label>
            <div className='mt-2'>
            <button
  className="btn btn-primary"
  type={isEditing ? "submit" : "button"} // 👉 change the type based on mode
  onClick={(e) => {
    if (!isEditing) {
      e.preventDefault(); // prevent if it's Edit mode
      handleEditClick();
    }
    // If isEditing = true, type="submit" will automatically submit the form!
  }}
>
  {isEditing ? 'Save' : 'Edit'}
</button>
  {isEditing && (
    <button className="btn btn-primary-cancel" onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>
      Cancel
    </button>
  )}
  {!isEditing && (
    <button className="btn btn-primary-cancel" onClick={closeModal} style={{ marginLeft: '10px' }}>Close</button>
  )}
</div>

          </form>
        )}
      </Modal>
      <Modal
        isOpen={isAttachmentsModalOpen}
        onRequestClose={closeAttachmentsModal}
        contentLabel="View Attachments"
        style={customModalStyles} // Apply custom styles
>
  <form onSubmit={updateAttachments}>
    <h2>View Attachments</h2>
    <p>Permit ID: {selectedPermit?.id}</p>
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
          {isEditingAttach && (
            <input type="file"  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document1')} />
          )}
          <label>Remarks:</label>
          <input 
            type="text" 
            value={isEditingAttach ? (remarksdoc1 || '') : (selectedPermit.formData.files.remarksdoc1 || '')} 
            onChange={(e) => setRemarksdoc1(e.target.value)} 
            disabled={!isEditingAttach} 

            
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
          {isEditingAttach && (
            <input type="file"  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document2')} />
          )}
          <label>Remarks:</label>
          <input 
            type="text" 
            value={isEditingAttach ? (remarksdoc2 || '') : (selectedPermit.formData.files.remarksdoc2 || '')} 
            onChange={(e) => setRemarksdoc2(e.target.value)} 
            disabled={!isEditingAttach} 
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
          {isEditingAttach && (
            <input type="file"  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document3')} />
          )}
          <label>Remarks:</label>
          <input 
            type="text" 
            value={isEditingAttach ? (remarksdoc3 || '') : (selectedPermit.formData.files.remarksdoc3 || '')} 
            onChange={(e) => setRemarksdoc3(e.target.value)} 
            disabled={!isEditingAttach} 
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
          {isEditingAttach && (
            <input type="file"  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"  onChange={(e) => handleFileChange(e, 'document4')} />
          )}
          <label>Remarks:</label>
          <input 
            type="text" 
            value={isEditingAttach ? (remarksdoc4 || '') : (selectedPermit.formData.files.remarksdoc4 || '')} 
            onChange={(e) => setRemarksdoc4(e.target.value)} 
            disabled={!isEditingAttach} 
          />
        </p>
        {renderFile(selectedFiles.document4)}

        <div className='mt-2'>
        <div>
  <button className="btn btn-primary" onClick={isEditingAttach ? updateAttachments : () => setIsEditingAttach(true)}>
    {isEditingAttach ? 'Save' : 'Edit'}
  </button>
  {isEditingAttach && (
    <button className="btn btn-primary-cancel" onClick={handleCancelEditAttach} style={{ marginLeft: '10px' }}>
      Cancel
    </button>
  )}
  {!isEditingAttach && (
    <button className="btn btn-primary-cancel" onClick={closeAttachmentsModal} style={{ marginLeft: '10px' }}>Close</button>
  )}
</div>
        </div>
      </div>

    )}
  </form>
</Modal>
{updatesuccess && selectedPermit && (
  <div className="modal-overlay" onClick={closeupdateSuccess}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    <p>Updated Business Permit ID:{selectedPermit.id}</p>
    <button className="btn btn-danger" onClick={closeupdateSuccess}>
          Close
        </button>
  </div>
  </div>
      )}

    </section>
  );
};

export default DataControllerForAssessmentWP;