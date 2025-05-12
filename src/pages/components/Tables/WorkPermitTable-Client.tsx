import React, {  useState } from 'react';
import { useNavigate } from "react-router-dom";
import {WorkPermit} from "../Interface(Front-end)/Types";
import axios from 'axios';
import Swal from 'sweetalert2';

import '../../Styles/ClientStyles.css';
interface WorkPermitTableProps {
    workPermits: WorkPermit[];


}

const WorkPermitTable: React.FC<WorkPermitTableProps> = ({ workPermits}) => {
  const navigate = useNavigate();
  const [activePermitId, setActivePermitId] = useState<string | null>(null);

//Drop Down Button
  const handleAction = (action: string, permit: WorkPermit) => {
    switch (action) {
      case "viewApplication":

        navigate(`/viewapplicationdetails/${permit._id}`);
        break;
      case "delete":
        setDeleteConfirm(true);
        setActivePermitId(permit._id);

        break;
      case "pay":
        if (permit.receipt.workpermitstatementofaccount) {

          renderDocument(permit.receipt.workpermitstatementofaccount);
        } else {
          console.log(`No receipt file found for permit: ${permit.id}`);
        }
        setActivePermitId(permit._id);
        setShowPaymentMethod(true);
        setModalStep(0);
        break;
      case "viewReceipt":
        if (permit.receipt?.receiptFile) {

          renderDocument(permit.receipt.receiptFile);
        } else {
          console.log(`No receipt file found for permit: ${permit.id}`);
        }
        break;
      case "viewPermit":

        renderDocument(permit.permitFile);
        break;
      case "expirePermit":
        expireWorkPermit(permit._id);
        break;
      default:
        console.warn("Unknown action");
    }
  };

// Pagination Code
const [currentPage, setCurrentPage] = useState(1); // Start from 1
const itemsPerPage = 5;
const totalPages = Math.ceil(workPermits.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage; // Adjust for 1-based index
const endIndex = startIndex + itemsPerPage;

const sortedWorkPermits = workPermits
  .slice()
  .sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return 0;
    }

    return dateB.getTime() - dateA.getTime();
  });

const currentItems = sortedWorkPermits.slice(startIndex, endIndex);

const handleNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage((prev) => prev + 1);
  }
};

const handlePreviousPage = () => {
  if (currentPage > 1) {
    setCurrentPage((prev) => prev - 1);
  }
};
  

  //Modal
  const [modalFile, setModalFile] = useState<string | null>(null);
  const [isModalOpenFile, setIsModalOpenFile] = useState(false);

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



  const logFormData = (formData: FormData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!files.document1) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Receipt!',
        text: 'Please upload a receipt before submitting.',
      });
      return; // Prevent further execution
    }
  
    const formData = new FormData();
    formData.append('document1', files.document1); // Append validated file
  
    logFormData(formData);
  
    // Show loading SweetAlert
    Swal.fire({
      title: 'Processing Payment...',
      text: 'Please wait while we upload your receipt.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    try {
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
  
      if (response.status === 200) {
        console.log(response.data);
        setConfirmPayment(true);
        setFiles({ document1: null }); // Clear uploaded file
  
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Payment Submitted!',
          text: 'Your receipt has been successfully uploaded.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        console.error('Error submitting application:', response.data.message);
        
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: response.data.message || 'Failed to submit payment. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
  
      if (axios.isAxiosError(error)) {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: error.response?.data?.message || 'Failed to submit payment. Please try again.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Unexpected Error',
          text: 'An unexpected error occurred. Please contact support.',
        });
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
     //Delete Function
    const [deleteconfirm, setDeleteConfirm] = useState(false);
    const closedeleteconfirm = () => {
      setDeleteConfirm(false);
      setActivePermitId(null);
  
    };
  const handleDelete = async (permitId: string) => {
    console.log(`Delete permit ID: ${permitId}`);
    try {
      const response = await fetch(`https://capstone-project-backend-nu.vercel.app/client/deleteworkpermit/${permitId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        window.location.reload(); // Reload the page to refresh the data
      } else {
        alert("Failed to delete permit");
      }
    } catch (error) {
      console.error("Error deleting permit:", error);
    }
  };

  const expireWorkPermit = async (permitId: string) => {
    try {
      const response = await axios.put(`https://capstone-project-backend-nu.vercel.app/client/expireworkpermit/${permitId}`, {
        status: 'Expired', // Update the status to "Expired"
      });
  
      if (response.status === 200) {
        console.log('Work permit expired successfully');
        alert('Work permit expired successfully');
        window.location.reload();
        // Optionally refresh permits list or UI state
      } else {
        console.error('Failed to expire business permit');
      }
    } catch (error) {
      console.error('Error expiring business permit:', error);
    }
  };


  return (
    <div className="workpermittable">
      <p>Work Permit Applications</p>
      {/* Error Trap: Check if workPermits is empty */}
    {workPermits.length === 0 ? (
      <p style={{ color: "green", textAlign: "center", fontSize: "16px" }}>
        No Work Permits found.
      </p>
    ) : (
      <>
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
                  : "---"}
              </td>
              <td>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    handleAction(e.target.value, permit);
                    e.target.value = "";
                  }}
                  className="dropdown-button"
                >
                  <option value="" disabled>
                    Select Action
                  </option>
                  {permit.workpermitstatus === "Pending" && (
                    <>
                      <option value="viewApplication">View Application</option>
                      <option value="delete">Delete</option>
                    </>
                  )}
                  {permit.workpermitstatus === "Waiting for Payment" && (
                    <>
                      <option value="viewApplication">View Application</option>
                      <option value="pay">Pay</option>
                    </>
                  )}
                  {permit.workpermitstatus === "Released" && (
                    <>
                      <option value="viewApplication">View Application</option>
                      {permit.classification === "Renew" && (
                        <option value="viewReceipt">View Receipt</option>
                      )}
                      <option value="viewPermit">View Permit</option>
                      <option value="expirePermit">Expire Work Permit(Developer Option)</option>
                    </>
                  )}
                  {permit.workpermitstatus === "Expired" && (
                    <>
                      <option value="viewApplication">View Application</option>
                      {permit.classification === "Renew" && (
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
      {/* Modal Dumps */}
{showPaymentMethod && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", zIndex: 1050 }}
    onClick={handleOverlayClick}
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="modal-title mb-0">
          Choose an Action for Permit ID: {activePermitId}
        </h5>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={closePaymentMethod}
        ></button>
      </div>
        <div className="mb-3">
          <label>
            <strong>Statement of Account File:</strong>
          </label>
        </div>
        <div className="mb-3">
          {/* Render the PDF or image file */}
                  {modalFile && (
          <div>
            {modalFile.endsWith(".pdf") ? (
              <iframe
                src={modalFile}
                style={{ width: "100%", height: "600px", border: "none" }}
                title="PDF Viewer"
              />
            ) : (
              <img
                src={modalFile}
                alt="Document"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "5px" }}
              />
            )}
          </div>
        )}
        </div>
      {modalStep === 0 && (
        <div>
          <h6>Upload Receipt</h6>
          <div className="mb-3">
            <label className="form-label">Select File</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => handleFileChange(e, "document1")}
            />
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end">
        <button type="button" className="btn btn-success">
          Print
        </button>

        <button
          type="button"
          className="btn btn-success"
          onClick={handleSubmit}
          disabled={!files}
        >
          Upload
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
      <div className="mb-3">
        {modalFile && (
          <div>
            {modalFile.endsWith(".pdf") ? (
              <iframe
                src={modalFile}
                style={{ width: "100%", height: "600px", border: "none" }}
                title="PDF Viewer"
              />
            ) : (
              <img
                src={modalFile}
                alt="Document"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "5px" }}
              />
            )}
          </div>
        )}
      </div>
      
      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-danger"
          onClick={closeModal}
        >
          Close
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
      </h5>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-success"
          onClick={() => handleDelete(activePermitId)}
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
    onClick={closeviewpayment}
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
        Payment Completed for Working Permit Application {activePermitId}
      </h5>

      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={confirmpaymentclose}
        >
          Okay
        </button>
      </div>  
    </div>
  </div>
)}
    </div>
  );
};

export default WorkPermitTable;
