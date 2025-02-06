
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../Styles/ClientStyles.css';
import ClientNavbar from '../components/clientnavbar';
import React from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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
    receipt: Receipt;
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
  
  export interface Receipt {
    receiptId: string,
    receiptDate: string,
    receiptFile: string,
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
  
const ViewBusinessApplication: React.FC = () => {
    const navigate = useNavigate();
    const [businessPermits, setBusinessPermits] = useState<GroupedBusinessPermit[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [activePermitId, setActivePermitId] = useState<BusinessPermit | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    //Payment Modal
    const [viewpayment, setViewPayment] = useState(false);

    //Logout
    const handleLogout = () => {
        sessionStorage.clear(); 
        alert('You have been logged out.');
        navigate('/'); 
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
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    fetchBusinessPermits();
  }, []);

  //Delete Function
  const [deleteconfirm, setDeleteConfirm] = useState(false);
  const closedeleteconfirm = () => {
    setDeleteConfirm(false);
    setActivePermitId(null);

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
  

// Statement of Account Print
  const handlePrint = () => {
    if (!activePermitId || !activePermitId.statementofaccount?.statementofaccountfile) {
      console.warn("No active permit or file URL available for printing.");
      return; // Exit if there is no active permit or file URL
    }
  
    const fileUrl = fetchDocumentUrl(activePermitId.statementofaccount.statementofaccountfile, 'receipts');
    
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
      const response = await axios.put(`http://localhost:3000/client/updatepayments/${activePermitId?._id}`, {
        paymentStatus: 'Paid',
        businesspermitstatus: 'Released'
      });

      if (response.status === 200) {
        console.log('Payment status updated successfully');
        setConfirmPayment(true);
      } else {
        console.error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
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

  const [confirmpayment, setConfirmPayment] = useState(false);

  const confirmpaymentclose = () => {
    setConfirmPayment(false);
    setActivePermitId(null);
    window.location.reload();
  };

  const closeviewpayment = () => {
    setViewPayment(false);
    setActivePermitId(null);

  };


//File Dump
      const fetchDocumentUrl = (fileName: string | null, folder: 'uploads' | 'permits' | 'receipts'): string | null => {
        if (!fileName) return null;
        
        // Return the file URL based on the folder specified
        return `http://localhost:3000/datacontroller/${folder}/${fileName}`;
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

  //Modals
  const [modalFile, setModalFile] = useState<string | null>(null);
  const [isModalOpenFile, setIsModalOpenFile] = useState(false);
  const openModal = (filePath: string) => {
    setModalFile(filePath);
    setIsModalOpenFile(true);
  };

  const closeModal = () => {
    setIsModalOpenFile(false);
    setModalFile(null);
  };

    const [files, setFiles] = useState<{
      document1: File | null;
      document2: File | null;
      document3: File | null;
    }>({
      document1: null,
      document2: null,
      document3: null,
    });


  //Retire Business Function
  const [retireBusinessModal, setRetireBusinessModal] = useState(false);
  const closeRetireBusinessModal = () => {
    setRetireBusinessModal(false);
    setActivePermitId(null);
  
  };

  
  const logFormData = (formData: FormData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  };

  const handleRetireBusiness = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    // Append documents to formData if available
    console.log(activePermitId?._id);
    if (files.document1) formData.append('document1', files.document1);
    if (files.document2) formData.append('document2', files.document2);
    logFormData(formData); // Ensure this logs the formData correctly

    try {
      const response = await axios.post(
        `http://localhost:3000/client/retirebusinessapplication/${activePermitId?._id}`,
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


  const [currentPage, setCurrentPage] = useState(1);
  const permitsPerPage = 5; // Number of permits per page

   // Pagination logic
   const totalPages = Math.ceil(businessPermits.length / permitsPerPage);
   const startIndex = (currentPage - 1) * permitsPerPage;
   const currentPermits = businessPermits.slice(startIndex, startIndex + permitsPerPage);
 
   const handleNextPage = () => {
     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
   };
 
   const handlePreviousPage = () => {
     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
   };
 

  //Action Button Content
  const handleActionBP = (action: string,  permitId: BusinessPermit) => {
    console.log(permitId._id);
    setActivePermitId(null);
  console.log(currentPermits);
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
        setActivePermitId(permitId);
        break;
      case 'renewbusiness':
        navigate(`/businesspermitrenew/${permitId._id}`);
        break;
        case 'deletebusinesspermit':
          setDeleteConfirm(true);
          setActivePermitId(permitId);
          break;

          case 'expireBusiness':
            expireBusinessPermit(permitId._id);
            break;
            case 'retireBusiness':
              setRetireBusinessModal(true);
              setActivePermitId(permitId);
              break;
  
  
      default:
        console.warn('Unknown action');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

    return (
        <section className="dashboard-container">
               {/* Navbar */}
      <ClientNavbar handleLogout={handleLogout}/>
      
            <div className="content">
                <header>
                    <h1>View Business Permit Applications</h1>
                </header>
                

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
            const sortedPermits = [...group.permits].sort((a, b) => {
              const dateA = new Date(a.applicationdateIssued || 0);
              const dateB = new Date(b.applicationdateIssued || 0);
              return dateB.getTime() - dateA.getTime();
            });

            const isExpanded = expandedRows.has(group.id);
            return (
              <React.Fragment key={group.id}>
                <tr>
                  <td>{sortedPermits[0].business?.businessname || 'N/A'}</td>
                  <td>{group.id}</td>
                  <td>{sortedPermits[0].classification || 'N/A'}</td>
                  <td>{sortedPermits[0].businesspermitstatus || 'N/A'}</td>
                  <td>
                    {sortedPermits[0].applicationdateIssued
                      ? new Date(sortedPermits[0].applicationdateIssued).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{sortedPermits[0].businessstatus || 'N/A'}</td>
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
            {sortedPermits[0].businesspermitstatus === 'Pending' && sortedPermits[0].classification === 'NewBusiness' && (
                      <>
                        <option value="viewApplication">View Application</option>
                        <option value="deletebusinesspermit">Delete</option>
                      </>
                    )}
                    {sortedPermits[0].businesspermitstatus === 'Pending' && sortedPermits[0].classification === 'RenewBusiness' && (
                      <>
                        <option value="viewApplication">View Application</option>
                      </>
                    )}
            {sortedPermits[0].businesspermitstatus === 'Assessed' && (
              <>
                <option value="viewApplication">View Application</option>
                <option value="viewAssessment">View Assessment</option>
              </>
            )}
            {sortedPermits[0].businesspermitstatus === 'Waiting for Payment' && (
              <>
                <option value="viewApplication">View Application</option>
                <option value="viewAssessment">View Assessment</option>
                <option value="payment">Pay</option>
              </>
            )}
            {sortedPermits[0].businesspermitstatus === 'Released' && (
              <>
                <option value="viewApplication">View Application</option>
                <option value="viewAssessment">View Assessment</option>
                <option value="viewReceipt">View Receipt</option>
                <option value="viewPermit">View Permit</option>
                <option value="expireBusiness">Expire Business (Developer Option)</option>
              </>
            )}
              <>

              {sortedPermits[0].businessstatus === 'Active' && sortedPermits[0].forretirement !== 'ForRetire' && (
  <option value="retireBusiness">Retire Business</option>
)}
      {sortedPermits[0].businesspermitstatus === 'Expired' && (
        <>
        <option value="viewApplication">View Application</option>
        <option value="viewAssessment">View Assessment</option>
        <option value="viewReceipt">View Receipt</option>
        <option value="viewPermit">View Permit</option>
        {sortedPermits[0].classification !== 'RetiredBusiness' && (
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
                  sortedPermits.slice(1).map((permit, index) => (
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
                      <td>{permit.classification || 'N/A'}</td>
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
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="btn btn-danger"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="btn btn-success"
        >
          Next
        </button>
      </div>
            </div>
            {/* Modal Dump */}
            {viewpayment && activePermitId && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 1050 }}
    onClick={closeviewpayment}
  >
    <div
      className="modal-content p-4"
      style={{
        maxWidth: "600px",
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3">
        <h5 className="text-center mb-3">
          Payment Information for Permit Application
        </h5>
        <div className="mb-2">
          <label><strong>Permit ID:</strong> {activePermitId._id}</label>
        </div>
        <div className="mb-3">
          <label>
            <strong>Statement of Account File:</strong> {activePermitId.statementofaccount?.statementofaccountfile}
          </label>
        </div>
        <div className="mb-3">
          {/* Render the PDF or image file */}
          {renderFile(fetchDocumentUrl(activePermitId.statementofaccount?.statementofaccountfile, "receipts"))}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-success" onClick={handlePrint}>
          Print
        </button>
        <button type="button" className="btn btn-success" onClick={handlePayment}>
          Pay
        </button>
      </div>
    </div>
  </div>
)}

{deleteconfirm && activePermitId && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 1050 }}
    onClick={closedeleteconfirm}
  >
    <div
      className="modal-content p-4"
      style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h5 className="text-center mb-4">
        Are you sure you want to delete this application?  
        <span className="text-danger"> {activePermitId.id}</span>
      </h5>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-success"
          onClick={() => handleDeleteBusiness(activePermitId._id)}
        >
          Accept
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={closedeleteconfirm}
        >
          Decline
        </button>
      </div>
    </div>
  </div>
)}

{confirmpayment && activePermitId && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 1050 }}
    onClick={confirmpaymentclose}
  >
    <div
      className="modal-content p-4"
      style={{
        maxWidth: "400px",
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h5 className="text-center mb-4">
        Payment Completed for Business Permit Application{" "}
        <span className="text-primary">{activePermitId.id}</span>
      </h5>

      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-success"
          onClick={confirmpaymentclose}
        >
          Okay
        </button>
      </div>
    </div>
  </div>
)}

{isModalOpenFile && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 1050 }}
    onClick={closeModal}
  >
    <div
      className="modal-content p-4"
      style={{
        maxWidth: "600px",
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        {modalFile ? (
          modalFile.endsWith(".pdf") ? (
            <iframe
              src={modalFile}
              style={{ width: "100%", height: "500px", border: "none" }}
              title="PDF Viewer"
            />
          ) : (
            <img
              src={modalFile}
              alt="Document"
              style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
            />
          )
        ) : (
          <p className="text-muted text-center">No file selected</p>
        )}
      </div>

      <div className="d-flex justify-content-end">
        <button className="btn btn-danger" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

{retireBusinessModal && activePermitId && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 1050 }}
    onClick={closeRetireBusinessModal}
  >
    <div
      className="modal-content p-4"
      style={{
        maxWidth: "500px",
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h5 className="text-center mb-3">
        Do you want to retire business permit ID{" "}
        <span className="text-primary">{activePermitId.id}</span>?
      </h5>

      <p className="mb-3 text-muted">Please upload the required documents:</p>

      <div className="mb-3">
        <label className="form-label">Business Retire Document</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => handleFileChange(e, "document1")}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Past Business Permit</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => handleFileChange(e, "document2")}
        />
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-success" onClick={handleRetireBusiness}>
          Retire Business
        </button>
        <button className="btn btn-danger" onClick={closeRetireBusinessModal}>
          Close
        </button>
      </div>
    </div>
  </div>
)}
            </div>
        </section>
    );
};

export default ViewBusinessApplication;
