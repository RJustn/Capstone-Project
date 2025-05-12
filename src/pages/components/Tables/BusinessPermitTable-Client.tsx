import React, {  useState } from 'react';
import { useNavigate } from "react-router-dom";
import {BusinessPermit, GroupedBusinessPermit,} from "../Interface(Front-end)/Types";
import axios from 'axios';
import Swal from 'sweetalert2';

import '../../Styles/ClientStyles.css';
interface BusinessPermitTableProps {
    businessPermits: GroupedBusinessPermit[];


}


const BusinessPermitTable: React.FC<BusinessPermitTableProps> = ({ businessPermits}) => {
    const navigate = useNavigate();
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [activePermitId, setActivePermitId] = useState<BusinessPermit | null>(null);
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


    
    //Functions
   //Delete Function
  const [deleteconfirm, setDeleteConfirm] = useState(false);
  const closedeleteconfirm = () => {
    setDeleteConfirm(false);
    setActivePermitId(null);

  };
  const handleDeleteBusiness = async (permitId: string) => {
    console.log(`Delete permit ID: ${permitId}`);
    try {
      const response = await fetch(`https://capstone-project-backend-nu.vercel.app/client/deletebusinesspermit/${permitId}`, {
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
    setActivePermitId(null);
  
  };
  // Removed unused file errors state

  // Removed unused validateFiles function
  
  const handleRetireBusiness = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.document1 || !files.document2) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Documents',
        text: 'Please upload all required documents.',
      });
      return;
    }

  
    if (!activePermitId?._id) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Permit ID',
        text: 'The permit ID is missing. Please try again.',
      });
      return;
    }
  
    const formData = new FormData();
  
    // Append documents if available
    if (files.document1) formData.append('document1', files.document1);
    if (files.document2) formData.append('document2', files.document2);
    logFormData(formData); // Ensure this logs the formData correctly
  
    try {
      // Show confirmation alert before proceeding
      const { isConfirmed } = await Swal.fire({
        title: 'Submit Retirement Application?',
        text: 'Are you sure you want to submit your business retirement application?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Submit',
        cancelButtonText: 'Cancel',
      });
  
      if (!isConfirmed) return; // Stop execution if the user cancels
  
      // Show loading indicator while processing
      Swal.fire({
        title: 'Submitting Application...',
        text: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      const response = await axios.post(
        `https://capstone-project-backend-nu.vercel.app/client/retirebusinessapplication/${activePermitId?._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
  
      if (response.status === 200) {
        console.log(response.data);
  
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Application Submitted!',
          text: 'Your business retirement application has been successfully submitted.',
          timer: 2000,
          showConfirmButton: false,
        });
  
        setFiles({ document1: null, document2: null, document3: null }); // Clear uploaded files
        window.location.reload(); // Reload page
      } else {
        const errorMessage = response.data?.message || 'Unknown error';
        console.error('Error submitting application:', errorMessage);
  
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: `Error: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
  
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred while submitting the application. Please try again.',
      });
    }
  };

  const logFormData = (formData: FormData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  };
  
// Statement of Account Print
  const handlePrint = () => {
    if (!activePermitId || !activePermitId.statementofaccount?.statementofaccountfile) {
      console.warn("No active permit or file URL available for printing.");
      return; // Exit if there is no active permit or file URL
    }
  
    const fileUrl = activePermitId.statementofaccount.statementofaccountfile;
    
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


  
  const handlePayment = async () => {
    try {
      // Show confirmation alert before proceeding
      const { isConfirmed } = await Swal.fire({
        title: 'Confirm Payment?',
        text: 'Are you sure you want to update the payment status?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed!',
        cancelButtonText: 'Cancel',
      });
  
      if (!isConfirmed) return; // Stop execution if the user cancels
  
      // Show loading SweetAlert
      Swal.fire({
        title: 'Processing Payment...',
        text: 'Please wait while we update the payment status.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      // Call the API to update the payment status
      const response = await axios.put(
        `https://capstone-project-backend-nu.vercel.app/client/businesspermithandlepayment/${activePermitId?._id}`,
        {
          paymentStatus: 'Processing',
          businesspermitstatus: 'Processing Payment',
        }
      );
  
      if (response.status === 200) {
        console.log('Payment status updated successfully');
  
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful!',
          text: 'The payment status has been updated.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        console.error('Failed to update payment status');
  
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Failed to update the payment status. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
  
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An error occurred while updating the payment status. Please try again.',
      });
    }
  };
  

  const expireBusinessPermit = async (permitId: string) => {
    try {
      const response = await axios.put(`https://capstone-project-backend-nu.vercel.app/client/expirebusinesspermit/${permitId}`, {
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



//File Dump
const [files, setFiles] = useState<{
    document1: File | null;
    document2: File | null;
    document3: File | null;
  }>({
    document1: null,
    document2: null,
    document3: null,
  });

 

  const renderFile = (fileUrl: string | null) => {
    if (!fileUrl) return <p>No file selected.</p>;

    if (fileUrl.endsWith('.pdf')) {
      return (
        <iframe
          src={fileUrl}
          width="100%"
          height="500px"
          style={{ border: '1px solid #ccc' }}
        />
      );
    } else {
      return (
        <img
          src={fileUrl}
          width="100%"
          height="500px"
          style={{ border: '1px solid #ccc' }}
        />
      );
    }
  };

  const renderDocument = (fileName: string | null) => {
    const fileUrl = fileName;
  
    if (!fileUrl) return <span>Not uploaded</span>;
    // Automatically open the modal if a valid file is found

        openModal(fileUrl); // Open the modal automatically

  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    doc: 'document1' | 'document2' | 'document3'
  ) => {
    const selectedFiles = event.target.files;
  
    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
  
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please upload a valid file type (PNG, JPG, JPEG, PDF, DOC, DOCX).',
        });
        return;
      }
  
      // Validate file size (e.g., max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'The file size exceeds the 5MB limit. Please upload a smaller file.',
        });
        return;
      }
  
      // If validation passes, set the file
      setFiles((prev) => ({
        ...prev,
        [doc]: file,
      }));
    } else {
      // If no file is selected, reset the state for the document
      setFiles((prev) => ({
        ...prev,
        [doc]: null,
      }));
    }
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

      //Payment Modal
      const [viewpayment, setViewPayment] = useState(false);

const viewpaymentclose = () => {
setViewPayment(false);
}

   // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const permitsPerPage = 5; // Number of permits per page
   const totalPages = Math.ceil(businessPermits.length / permitsPerPage);
   const startIndex = (currentPage - 1) * permitsPerPage;
   const currentPermits = businessPermits.slice(startIndex, startIndex + permitsPerPage);
 
   const handleNextPage = () => {
     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
   };
 
   const handlePreviousPage = () => {
     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
   };
 
   const [viewingType, setViewingType] = useState('');

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
          renderDocument(permitId.statementofaccount.statementofaccountfile); // Automatically open modal
          setViewingType('receipts');
          setActivePermitId(permitId);
          break;
      case 'viewReceipt':
        renderDocument(permitId.receipt.receiptFile); // Automatically open modal
        setActivePermitId(permitId);
        setViewingType('receipts');
        break;
      case 'viewPermit':
        renderDocument(permitId.permitFile); // Automatically open modal
        setActivePermitId(permitId);
        setViewingType('permits');
        break;
      case 'payment':
        setViewPayment(true);
        setActivePermitId(permitId);
        setViewingType('receipts')
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

  return (
                    <div className='businesspermittable'>
                    <p>Business Permit Applications</p>
                    {businessPermits.length === 0 ? (
      <p style={{ color: "green", textAlign: "center", fontSize: "16px" }}>
        No Business Permits found.
      </p>
    ) : (
      <>
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
     handleActionBP(e.target.value, sortedPermits[0]);  // Pass action and permit to handler
     e.target.value = ""; // Reset dropdown to default after selection
                }}
                className="dropdown-button"
              >
                <option value="" disabled>
                  Select Action {group._id}
                </option>
                {sortedPermits[0].businesspermitstatus === 'Pending' && sortedPermits[0].classification === 'NewBusiness' && (
                          <>
                            <option value="viewApplication">View Application</option>
                            <option value="deletebusinesspermit">Delete</option>
                          </>
                )}
                {sortedPermits[0].businesspermitstatus === 'Rejected' && (
                          <>
                            <option value="viewApplication">View Application</option>
                          </>
                )}
                {sortedPermits[0].businesspermitstatus === 'Processing Payment' && (
                          <>
                            <option value="viewApplication">View Application</option>
                            <option value="viewAssessment">View Assessment</option>
                            <option value="viewReceipt">View Receipt</option>
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
                {sortedPermits[0].businesspermitstatus === 'Waiting for Payment' &&  (sortedPermits[0].businessstatus === 'On Process' || sortedPermits[0].businessstatus === 'Active') &&(
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
                {sortedPermits[0].businessstatus === 'Active' && sortedPermits[0].forretirement !== 'ForRetire' && (
      <option value="retireBusiness">Retire Business</option>
                )}
          {sortedPermits[0].businesspermitstatus === 'Expired' && (
            <>
            <option value="viewApplication">View Application</option>
            <option value="viewAssessment">View Assessment</option>
            <option value="viewReceipt">View Receipt</option>
            <option value="viewPermit">View Permit</option>
            {sortedPermits[0].businessstatus !== 'RetiredBusiness' && (
                    <>
                  <option value="renewbusiness">Renew Business</option>
                  </>
              )}
          </>
                )}
    
               
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
     handleActionBP(e.target.value, permit);  // Pass action and permit to handler
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
            <span style={{ margin: "0 10px",  marginTop: "8px" }}>
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
          </>)}

            {/* Modal Dump */}
{viewpayment && activePermitId && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 1050 }}
    onClick={viewpaymentclose}
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
          {renderFile(activePermitId.statementofaccount?.statementofaccountfile)}
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



{isModalOpenFile && activePermitId && (
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
      {viewingType === 'receipts' && (
            <label>Viewing Receipt for {activePermitId.id}</label>
          )}
          {viewingType === 'permits' && (
            <label>Viewing Business Permit for {activePermitId.id}</label>
          )}
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
    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
    onChange={(e) => handleFileChange(e, "document1")}
  />
</div>

<div className="mb-4">
  <label className="form-label">Past Business Permit</label>
  <input
    type="file"
    className="form-control"
    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
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
                

                
  );
};

export default BusinessPermitTable;
