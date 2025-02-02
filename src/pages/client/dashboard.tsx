import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ClientStyles.css'; //  CSS file
import ClientNavbar from '../components/clientnavbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Define the WorkPermit interface
interface WorkPermit {
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
  export interface BusinessPermit {
    _id: string;
    id: string;
    userId: string;
    permittype?: string;
    businesspermitstatus?: string;
    businessstatus?: string;
    forretirement?: string;
    classification?: string;
    transaction?: string;
    amountToPay?: string;
    permitFile: string;
    permitDateIssued?: string;
    permitExpiryDate?: string;
    expiryDate?: string;
    applicationdateIssued: Date;
    applicationComments?: string;
  
    owner: Owner;
    business: Business;
    otherbusinessinfo: OtherBusiness;
    mapview: MapView;
    businesses: Businesses[];
    files: Files;
    department: Department; // Change to object with key-value pairs
    statementofaccount: Statement;
    receipt: ReceiptBP;
    createdAt?: string;
  }
  
  export interface Owner {
  corporation?: boolean;
  lastname?: string;
  firstname?: string;
  middleinitial?: string;
  civilstatus?: string;
  companyname?: string;
  gender?: string;
  citizenship?: string;
  tinnumber?: string;
  representative?: boolean;
  houseandlot?: string;
  buildingstreetname?: string;
  subdivision?: string;
  region?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  telephonenumber?: string;
  mobilenumber?: string;
  email?: string;
  representativedetails?: RepDetails;
  }
  
  export interface RepDetails {
  repfullname: string,
  repdesignation: string,
  repmobilenumber: string,
  }

  export interface Business {
  businessname?: string,
  businessscale?: string,
  paymentmethod?: string,
  businessbuildingblocklot?: string,
  businessbuildingname?: string,
  businesssubcompname?: string,
  businessregion?: string,
  businessprovince?: string,
  businessmunicipality?: string,
  businessbarangay?: string,
  businesszip?: string,
  businesscontactnumber?: string,
  ownershiptype?: string,
  agencyregistered?: string,
  dtiregistrationnum?: string,
  dtiregistrationdate?: string,
  dtiregistrationexpdate?: string,
  secregistrationnum?: string,
  birregistrationnum?: string,
  industrysector?: string,
  businessoperation?: string,
  typeofbusiness?: string,
  
  }

  export interface ReceiptBP {
    receiptId: string,
    receiptDate: string,
    receiptFile: string,
    }
  
  export interface OtherBusiness {
  dateestablished?: string,
  startdate?: string,
  occupancy?: string,
  otherbusinesstype?: string,
  businessemail?: string,
  businessarea?: string,
  businesslotarea?: string,
  numofworkermale?: string,
  numofworkerfemale?: string,
  numofworkertotal?: string,
  numofworkerlgu?: string,
  lessorfullname?: string,
  lessormobilenumber?: string,
  monthlyrent?: string,
  lessorfulladdress?: string,
  lessoremailaddress?: string,
  }
  
  export interface MapView{
  lat: string,
  lng: string,
  }
  
  export interface Businesses {
  _id: string;
  businessNature: string;
  businessType: string;
  capitalInvestment: string;
  }
  
  
  export interface Department{
   
    Zoning: string;
    OffBldOfcl: string;
    CtyHlthOff: string;
    BreuFrPrt: string;
  
  }
  
  export interface Files {
  document1: string | null; // Optional
  document2: string | null; // Optional
  document3: string | null; // Optional
  document4: string | null; // Optional
  document5: string | null; // Optional
  document6: string | null; // Optional
  remarksdoc1: string;
  remarksdoc2: string;
  remarksdoc3: string;
  remarksdoc4: string;
  remarksdoc5: string;
  remarksdoc6: string;
  }

  export interface Statement{
    permitassessed: string;
    dateassessed: string;
    mayorspermit: string;
    sanitary:  string;
    health:  string;
    businessplate:  string;
    zoningclearance:  string;
    annualInspection:  string;
    environmental:  string;
    miscfee:  string;
    liquortobaco:  string;
    liquorplate:  string;
    statementofaccountfile: string;
}
  

 
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<{ email: string; firstName: string; lastName: string; id: string} | null>(null);;
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [latestStatus, setLatestStatus] = useState<string | null>(null);

//Update Table code
  const [activePermitId, setActivePermitId] = useState<string | null>(null);
  const [modalFile, setModalFile] = useState<string | null>(null);
  const [isModalOpenFile, setIsModalOpenFile] = useState(false);
  // CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(workPermits.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const sortedWorkPermits = workPermits.slice() // Make a copy of the array to avoid modifying the original
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
  
//File
  const [files, setFiles] = useState<{
    document1: File | null;
    document2: File | null;
    document3: File | null;
  }>({
    document1: null,
    document2: null,
    document3: null,
  });
  
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, doc: 'document1' | 'document2' | 'document3' ) => {
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
//File Viewing
  const openModal = (filePath: string) => {
      setModalFile(filePath);
      setIsModalOpenFile(true);
    };
  
   const closeModal = () => {
      setIsModalOpenFile(false);
      setModalFile(null);
    };
  
  

 //MODAL TESTING FOR PAYMENT  WORK PERMIT
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

  const logFormData = (formData: FormData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
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
        setFiles({ document1: null, document2: null, document3: null,

         }); // Clear uploaded file (if applicable)
   
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

//Content Codes
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

const fetchProfile = async () => {
  try {
    const response = await fetch('http://localhost:3000/client/profile', {
      method: 'GET',
      credentials: 'include', // Ensure cookies (containing the token) are sent
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const userData = await response.json();
    setUserDetails(userData.user);
    localStorage.setItem('profile', JSON.stringify(userData.user));
    localStorage.setItem('userId', userData.id);
  } catch (error) {
    console.error('Error fetching profile:', error);
    setError('Failed to fetch profile, please try again.');
  }
};

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
    setWorkPermits(workPermitData);
  } catch (error) {
    console.error('Error fetching work permits:', error);
    setError('Failed to fetch work permits, please try again.');
  }
};

//useEffects
useEffect(() => {
  fetchProfile();
  fetchWorkPermits();
}, []); // Remove workPermits from dependencies

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
      setError('Failed to load dashboard. Please try again.');
    } 
  };

  checkAuth();
}, [navigate]); // Only depend on navigate, which is necessary for the redirection


useEffect(() => {
  if (workPermits.length > 0) {
    // Function to extract and convert DDMMYYYY to YYYYMMDD for comparison
    const convertDateForComparison = (permitID: string) => {
      const dateString = permitID.slice(-8); // Extract the last 8 characters (DDMMYYYY)
      const day = dateString.slice(0, 2);
      const month = dateString.slice(2, 4);
      const year = dateString.slice(4, 8);
      return `${year}${month}${day}`; // Return YYYYMMDD for proper sorting
    };

    // Function to extract sequenceString for comparison
    const extractSequenceString = (permitID: string) => {
      return permitID.match(/\d+/)?.[0] || '0'; // Extract the number from the sequence, assuming it's digits
    };

    // Sort work permits based on date first, then sequenceString
    const sortedPermits = workPermits.sort((a, b) => {
      const dateA = convertDateForComparison(a.id);
      const dateB = convertDateForComparison(b.id);

      // If dates are the same, compare sequenceString
      if (dateA === dateB) {
        const seqA = parseInt(extractSequenceString(a.id), 10);
        const seqB = parseInt(extractSequenceString(b.id), 10);
        return seqB - seqA; // Sort by sequence number (higher number means more recent)
      }
      return dateB.localeCompare(dateA); // Sort by date in descending order
    });

    // The first item in the sorted array is the latest
    setLatestStatus(sortedPermits[0].workpermitstatus);
  }
}, [workPermits]); // This effect now depends only on workPermits

//Handle Action Work Permit
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

  return (
    <section className="dashboard-container">
        {/* Navbar */}
      <ClientNavbar handleLogout={handleLogout}/>

      <div className="content">
      <div id="carouselExampleFade" className="carousel slide carousel-fade">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/public/landingpagebackground.svg" className="d-block w-100" alt="..."></img>
          </div>
          <div className="carousel-item">
            <img src="/public/loginbackground.svg" className="d-block w-100" alt="..."></img>
          </div>
          <div className="carousel-item">
            <img src="/public/landingpagebackground.svg" className="d-block w-100" alt="..."></img>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
  
        {error && <p className="error">{error}</p>}
        {userDetails ? (
          <div className="user-details">
            <h2>Welcome, {userDetails.firstName} {userDetails.lastName}!</h2>
            {/* Display other user details as needed */}
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
        
        <div className="applicationcontainer">
          <div>
            <a href="/businesspermitpage" className="businesspermitbutton">
              <img 
                src="applicationslogo.svg" 
                alt="Logo" 
                className="button-logo" 
              />
            <span>Apply for Business Permit</span>
            </a>
          </div>
          
          <div>
          <a 
          href={!(latestStatus === 'Pending' || latestStatus === 'Waiting for Payment' || latestStatus === 'Released') ? "/workpermitpage" : "#"} 
          className='workpermitbutton'
          onClick={(e) => {
          if (latestStatus === 'Pending' || latestStatus === 'Waiting for Payment' || latestStatus === 'Released') {
           e.preventDefault(); // Disable click if status is 'For Assessment', 'Waiting for Payment', or 'Released'
          }
          }}
            >
              <img 
                src="applicationslogo.svg" 
                alt="Logo" 
                className="button-logo" 
              />
          <span>Apply for Work Permit</span>
          </a>
          </div>
          <div>
            <a href="/businesspermitpage" className="businesspermitbutton">
              <img 
                src="applicationslogo.svg" 
                alt="Logo" 
                className="button-logo" 
              />
            <span>Apply for Business Permit</span>
            </a>
          </div>

          <div>
            <a href="/businesspermitpage" className="businesspermitbutton">
              <img 
                src="applicationslogo.svg" 
                alt="Logo" 
                className="button-logo" 
              />
            <span>Apply for Business Permit</span>
            </a>
          </div>

          <div>
            <a href="/businesspermitpage" className="businesspermitbutton">
              <img 
                src="applicationslogo.svg" 
                alt="Logo" 
                className="button-logo" 
              />
            <span>Apply for Business Permit</span>
            </a>
          </div>
        </div>



        <div className="workpermittable">
          <p> Work Permit Applications</p>
        <table className="table table-striped table-hover ">
          <thead style={{ backgroundColor: '#ffd23' }}>
 
            <tr>
    <th style={{ backgroundColor: "#ffff00", color: "black" }}>ID</th>
    <th style={{ backgroundColor: "#ffff00", color: "black" }}>Status</th>
    <th style={{ backgroundColor: "#ffff00", color: "black" }}>Transaction</th>
    <th style={{ backgroundColor: "#ffff00", color: "black" }}>Date Issued</th>
    <th style={{ backgroundColor: "#ffff00", color: "black" }}>Date Expired</th>
    <th style={{ backgroundColor: "#ffff00", color: "black" }}>Action</th>
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
              <button className="btn btn-success" onClick={handlePreviousPage}>Back</button>
            )}
            {currentPage < totalPages - 1 && (
              <button className="btn btn-success" onClick={handleNextPage}>Next</button>
            )}
          </div>
      </div>

                     

{/* Modal Dump */}



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




{/* Confirm Payment for Working Permit */}
{confirmpayment && activePermitId &&(
  <div className="modal-overlay" onClick={closeviewpayment}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          Payment Completed for Working Permit Application {activePermitId}
          <button onClick={confirmpaymentclose}>Okay</button>
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
{/* End Modal Dump */}
      </div>
    </section>
  );
  
};

export default Dashboard;