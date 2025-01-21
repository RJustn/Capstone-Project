import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ClientStyles.css'; //  CSS file
import ClientSideBar from '../components/ClientSideBar'
import axios from 'axios';

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
  

  interface GroupedBusinessPermit {
    _id?: string;
    id: string; // Business ID
    permits: BusinessPermit[]; // Array of BusinessPermit
  }
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<{ email: string; firstName: string; lastName: string; id: string} | null>(null);;
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
  const [businessPermits, setBusinessPermits] = useState<GroupedBusinessPermit[]>([]);
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
  
//For Businesspermit

  const [currentPageBP, setCurrentPageBP] = useState(1);
  const permitsPerPage = 5; // Number of permits per page
  const [activePermitIdBP, setActivePermitIdBP] = useState<BusinessPermit | null>(null);
   // Pagination logic
   const totalPagesBP = Math.ceil(businessPermits.length / permitsPerPage);
   const startIndexBP = (currentPageBP - 1) * permitsPerPage;
   const currentPermits = businessPermits.slice(startIndexBP, startIndexBP + permitsPerPage);
 
   const handleNextPageBP = () => {
     if (currentPageBP < totalPagesBP) setCurrentPageBP((prev) => prev + 1);
   };
 
   const handlePreviousPageBP = () => {
     if (currentPageBP > 1) setCurrentPageBP((prev) => prev - 1);
   };
 
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  // Toggle the visibility of past permits for a specific business ID
  const toggleRowExpansion = (businessId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  };

  const renderFile = (fileUrl: string | null) => {
    if (!fileUrl) return <p>No file selected.</p>;

    if (fileUrl.endsWith('.pdf')) {
      return (
        <iframe
          src={fileUrl}
          style={{ width: '100%', height: '400px', marginTop: '10px' }}
          title="PDF Viewer"
        />
      );
    } else {
      return (
        <img
          src={fileUrl}
          alt="Document"
          style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
        />
      );
    }
  };

  const [viewpayment, setViewPayment] = useState(false);
// Statement of Account Print
  const handlePrint = () => {
    if (!activePermitIdBP || !activePermitIdBP.statementofaccount?.statementofaccountfile) {
      console.warn("No active permit or file URL available for printing.");
      return; // Exit if there is no active permit or file URL
    }
  
    const fileUrl = fetchDocumentUrl(activePermitIdBP.statementofaccount?.statementofaccountfile, 'receipts');
    
    // Open a new window
    const newWindow = window.open('', '', 'height=500,width=800');
    
    if (newWindow) {
    
      
      // Embed the PDF file using iframe
      newWindow.document.write(`
        <iframe
          src="${fileUrl}"
          style="width: 100%; height: 100%; border: none;"
          title="PDF Viewer"
        ></iframe>
      `);
      newWindow.document.close();  // Ensure the document is fully loaded
  
      // Wait for the content to load, then print
      newWindow.onload = () => {
        newWindow.print();  // Open the print dialog
      };
    }
  };
  
  // Function to handle the payment update
  const handlePayment = async () => {
    try {
      // Call the API to update the payment status
      const response = await axios.put(`http://localhost:3000/client/updatepayments/${activePermitIdBP?._id}`, {
        paymentStatus: 'Paid',
        businesspermitstatus: 'Released'
      });

      if (response.status === 200) {
        console.log('Payment status updated successfully');
        setConfirmPaymentBP(true);
      } else {
        console.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const [confirmpaymentBP, setConfirmPaymentBP] = useState(false);

  const confirmpaymentcloseBP = () => {
    setConfirmPayment(false);
    setActivePermitIdBP(null);
    window.location.reload();
  };

  const closeviewpaymentBP = () => {
    setViewPayment(false);
    setActivePermitIdBP(null);

  };

  
    //Delete Function
    const [deleteconfirm, setDeleteConfirm] = useState(false);
    const closedeleteconfirm = () => {
      setDeleteConfirm(false);
      setActivePermitIdBP(null);
  
    };
    const handleDeleteBusiness = async (permitId: string) => {
      console.log(`Delete permit ID: ${permitId}`);
      try {
        const response = await fetch(`http://localhost:3000/datacontroller/deletePermitBusiness/${permitId}`, {
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
    
//Retire Business Function
const [retireBusinessModal, setRetireBusinessModal] = useState(false);
const closeRetireBusinessModal = () => {
  setRetireBusinessModal(false);
  setActivePermitIdBP(null);

};
  
//End Business Permit Code
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

 useEffect(() => {
    const fetchBusinessPermits = async () => {
      try {
        const response = await fetch('http://localhost:3000/client/business-permits', {
          method: 'GET',
          credentials: 'include', // Ensure cookies (containing the token) are sent
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const businessPermitData = await response.json();
        setBusinessPermits(businessPermitData);
      } catch (error) {
        console.error('Error fetching business permits:', error);
      }
    };

    fetchBusinessPermits();
  }, []);

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

  const handleRetireBusiness = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    // Append documents to formData if available
    console.log(activePermitIdBP?._id);
    if (files.document1) formData.append('document1', files.document1);
    if (files.document2) formData.append('document2', files.document2);
    logFormData(formData); // Ensure this logs the formData correctly

    try {
      const response = await axios.post(
        `http://localhost:3000/client/retirebusinessapplication/${activePermitIdBP?._id}`,
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
        alert('Business Retire Application submitted successfully!');
        window.location.reload();
        setFiles({ document1: null, document2: null, document3: null,

        });
      } else {
        // Log error response data for debugging
        const errorMessage = response.data?.message || 'Unknown error';
        console.error('Error submitting application:', errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the business retirement application.');
    }
};


  
  const expireBusinessPermit = async (permitId: string) => {
    try {
      const response = await axios.put(`http://localhost:3000/datacontroller/expirebusinesspermit/${permitId}`, {
        status: 'Expired', // Update the status to "Expired"
      });
  
      if (response.status === 200) {
        console.log('Business permit expired successfully');
        alert('Business permit expired successfully');
        window.location.reload();
        // Optionally refresh permits list or UI state
      } else {
        console.error('Failed to expire business permit');
      }
    } catch (error) {
      console.error('Error expiring business permit:', error);
    }
  };

//Handle Action Business Permit
  const handleActionBP = (action: string,  permitId: BusinessPermit) => {
    console.log(permitId._id);
    setActivePermitIdBP(null);
  
    switch (action) {
      case 'viewApplication':
        navigate(`/viewapplicationdetailsbusiness/${permitId._id}`);
        break;
        case 'viewAssessment':
          renderDocument(permitId.statementofaccount.statementofaccountfile, 'receipts'); // Automatically open modal
          break;
      case 'viewReceipt':
        renderDocument(permitId.receipt.receiptFile, 'receipts'); // Automatically open modal
        break;
      case 'viewPermit':
        renderDocument(permitId.permitFile, 'permits'); // Automatically open modal
        break;
      case 'payment':
        setViewPayment(true);
        setActivePermitIdBP(permitId);
        break;
      case 'renewbusiness':
        navigate(`/businesspermitrenew/${permitId._id}`);
        break;
        case 'deletebusinesspermit':
          setDeleteConfirm(true);
          setActivePermitIdBP(permitId);

          break;

          case 'expireBusiness':
            expireBusinessPermit(permitId._id);
            break;

            case 'retireBusiness':
              setRetireBusinessModal(true);
              setActivePermitIdBP(permitId);
              break;
  
  
      default:
        console.warn('Unknown action');
    }
  };

  return (
    <section className="dashboard-container">
      <div className="sidebar-container">
      <ClientSideBar handleLogout={handleLogout} /> {/* Pass handleLogout to ClientSideBar */}
      </div>
  
      <div className="content">
        <header>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div>
        <img src="/public/instructions.svg" alt="Instruction Icon" width="1375" height="300" />
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
        </div>


        
        <div className='workpermittable'>{/* Work Permits */}
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
                        <div className='businesspermittable'>
                        <p>Business Permits</p>
              <table className="permit-table">
                <thead>
                  <tr>
                    <th>Business Information</th>
                    <th>Business ID</th>
                    <th>Classification</th>
                    <th>Status</th>
                    <th>Application Date</th>
                    <th>Business Status</th>
                    <th>Show Previous</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {currentPermits.map((group) => {
                    // Sort permits by applicationdateIssued (newest first)
                    const sortedPermitsBP = [...group.permits].sort((a, b) => {
                      const dateA = new Date(a.applicationdateIssued || 0);
                      const dateB = new Date(b.applicationdateIssued || 0);
                      return dateB.getTime() - dateA.getTime();
                    });
        
                    const isExpanded = expandedRows.has(group.id);
                    return (
                      <React.Fragment key={group.id}>
                        <tr>
                          <td>{sortedPermitsBP[0].business?.businessname || 'N/A'}</td>
                          <td>{group.id}</td>
                          <td>
                        {sortedPermitsBP[0].classification || 'N/A'}
                          </td>
                          <td>{sortedPermitsBP[0].businesspermitstatus || 'N/A'}</td>
                          <td>
                            {sortedPermitsBP[0].applicationdateIssued
                              ? new Date(sortedPermitsBP[0].applicationdateIssued).toLocaleDateString()
                              : 'N/A'}
                          </td>
                  
                          <td>   {sortedPermitsBP[0].forretirement === 'ForRetire' ? 'For Retirement' : sortedPermitsBP[0].businessstatus || 'N/A'}</td>
                          <td>
                            <button className="table-button" onClick={() => toggleRowExpansion(group.id)}>
                              {isExpanded ? 'Hide Past Permits' : 'Show Past Permits'}
                            </button>
                          </td>
                          <td>
                          <select
                    defaultValue=""
                    onChange={(e) => {
         handleActionBP(e.target.value, group.permits[0]);  // Pass action and permit to handler
         e.target.value = ""; // Reset dropdown to default after selection
                    }}
                    className="dropdown-button"
                  >
                    <option value="" disabled>
                      Select Action
                    </option>
                    {sortedPermitsBP[0].businesspermitstatus === 'Pending' && sortedPermitsBP[0].classification === 'NewBusiness' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="deletebusinesspermit">Delete</option>
                      </>
                    )}
                    {sortedPermitsBP[0].businesspermitstatus === 'Pending' && sortedPermitsBP[0].classification === 'RenewBusiness' && (
                      <>
                        <option value="viewApplication">View Application</option>
                      </>
                    )}
                    {sortedPermitsBP[0].businesspermitstatus === 'Assessed' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="viewAssessment">View Assessment</option>
                      </>
                    )}
                    {sortedPermitsBP[0].businesspermitstatus === 'Waiting for Payment' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="viewAssessment">View Assessment</option>
                        <option value="payment">Pay</option>
                      </>
                    )}
                    {sortedPermitsBP[0].businesspermitstatus === 'Released' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="viewAssessment">View Assessment</option>
                        <option value="viewReceipt">View Receipt</option>
                        <option value="viewPermit">View Permit</option>
                        <option value="expireBusiness">Expire Business (Developer Option)</option>
                      </>
                    )}
                      <>
        
                      {sortedPermitsBP[0].businessstatus === 'Active' && sortedPermitsBP[0].forretirement !== 'ForRetire' && (
  <option value="retireBusiness">Retire Business</option>
)}
              {sortedPermitsBP[0].businesspermitstatus === 'Expired' && (
                <>
                <option value="viewApplication">View Application</option>
                <option value="viewAssessment">View Assessment</option>
                <option value="viewReceipt">View Receipt</option>
                <option value="viewPermit">View Permit</option>
                {sortedPermitsBP[0].classification !== 'RetiredBusiness' && (
                <>
              <option value="renewbusiness">Renew Business</option>
              </>
          )}
              </>
          )}
                      </>
                  </select>
                          </td>
                        </tr>
                        {isExpanded &&
                          sortedPermitsBP.slice(1).map((permit, index) => (
                            <tr key={`${group.id}-${index}`} className="past-permit-row">
        <td>
          {permit.business?.businessname ? (
            <>
              <div>Business Name: {permit.business.businessname}</div>
              <div>
                Owner: {permit.owner?.lastname}, {permit.owner?.firstname}{' '}
                {permit.owner?.middleinitial || ''}
              </div>
            </>
          ) : (
            'N/A'
          )}
        </td>
                              <td>{group.id}</td>
                              <td>{permit.businesspermitstatus || 'N/A'}</td>
                              <td>{permit.businesspermitstatus || 'N/A'}</td>
                              <td>
                                {permit.applicationdateIssued
                                  ? new Date(permit.applicationdateIssued).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                              <td>{permit.businessstatus || 'N/A'}</td>
                              <td></td>
                              <td> <select
                    defaultValue=""
                    onChange={(e) => {
         handleActionBP(e.target.value, group.permits[0]);  // Pass action and permit to handler
         e.target.value = ""; // Reset dropdown to default after selection
                    }}
                    className="dropdown-button"
                  >
                    <option value="" disabled>
                      Select Action
                    </option>
                    {permit.businesspermitstatus === 'Pending' && permit.classification === 'NewBusiness' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="deletebusinesspermit">Delete</option>
                      </>
                    )}
                    {permit.businesspermitstatus === 'Pending' && permit.classification === 'RenewBusiness' && (
                      <>
                        <option value="viewApplication">View Application</option>
                      </>
                    )}
                    {permit.businesspermitstatus === 'Assessed' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="viewAssessment">View Assessment</option>
                      </>
                    )}
                    {permit.businesspermitstatus === 'Waiting for Payment' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="viewAssessment">View Assessment</option>
                        <option value="payment">Pay</option>
                      </>
                    )}
                    {permit.businesspermitstatus === 'Released' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="viewAssessment">View Assessment</option>
                        <option value="viewReceipt">View Receipt</option>
                        <option value="viewPermit">View Permit</option>
                      </>
                    )}
                      <>
        
            {permit.businessstatus === 'Active' && (
            <option>Retire Business</option>
          )}
              {permit.businesspermitstatus === 'Expired' && (
                <>
                <option value="viewApplication">View Application</option>
                <option value="viewAssessment">View Assessment</option>
                <option value="viewReceipt">View Receipt</option>
                <option value="viewPermit">View Permit</option>
              </>
          )}
                      </>
                  </select></td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  onClick={handlePreviousPageBP}
                  disabled={currentPageBP === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span>
                  Page {currentPageBP} of {totalPagesBP}
                </span>
                <button
                  onClick={handleNextPageBP}
                  disabled={currentPageBP === totalPagesBP}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
              {viewpayment && activePermitIdBP &&(
              <div className="modal-overlay" onClick={closeviewpaymentBP}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <label>{activePermitIdBP._id}</label>
                  <label>{activePermitIdBP.statementofaccount.statementofaccountfile}</label>

                        {/* Render the PDF or image file */}
      {renderFile(fetchDocumentUrl(activePermitIdBP.statementofaccount?.statementofaccountfile, 'receipts'))}

      <button onClick={handlePrint}>Print</button>
      <button onClick={handlePayment}>Pay</button> {/* Add the handler for Pay button */}
          </div>
        </div>
)}

{deleteconfirm && activePermitIdBP &&(
   <div className="modal-overlay" onClick={closedeleteconfirm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            Are you sure you want to delete this application? {activePermitIdBP.id}
            <button onClick={()=> handleDeleteBusiness(activePermitIdBP._id)}>Accept</button>
            <button onClick={closedeleteconfirm}>Decline</button>
</div>
</div>
)}
{retireBusinessModal && activePermitIdBP &&(
  <div className="modal-overlay" onClick={closeRetireBusinessModal}>
  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
  Do you want to Retire {activePermitIdBP.id}?
Please Upload the Documents
  Business Retire Document
  <input type="file" onChange={(e) => handleFileChange(e, 'document1')} />
  Past Business Permit
  <input type="file" onChange={(e) => handleFileChange(e, 'document2')} />
  <button onClick={handleRetireBusiness}>Retire Business</button> {/* Add the handler for Pay button */}
  <button onClick={closeRetireBusinessModal}>Close</button>
    </div>
    </div>
)}

{confirmpaymentBP && activePermitIdBP &&(
  <div className="modal-overlay" onClick={confirmpaymentcloseBP}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          Payment Completed for Business Permit Application {activePermitIdBP.id}
          <button onClick={confirmpaymentcloseBP}>Okay</button>
            </div>
            </div>
)}
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