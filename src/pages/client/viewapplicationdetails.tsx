import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ClientStyles.css';
import { WorkPermit } from "../components/Interface(Front-end)/Types";
import ClientNavbar from '../components/NavigationBars/clientnavbar';


const ViewApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Extract work permit ID from URL
  const [workPermit, setWorkPermit] = useState<WorkPermit | null>(null);
  const token = localStorage.getItem('token'); // Assuming the token is stored in local storage
  const [modalFile, setModalFile] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);



  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkPermitDetails = async () => {
        if (!token) {
            navigate('/'); // Redirect to login if no token
            return;
          } 
      try {
        console.log(id);
        const response = await axios.get(`https://capstone-project-backend-nu.vercel.app/client/fetchworkpermitdetails/${id}`, {
          headers: { },
          withCredentials: true, 

        });
        setWorkPermit(response.data as WorkPermit); // Set the work permit details to state
      } catch (error) {
        console.error('Error fetching work permit details:', error);
     
      } }

    fetchWorkPermitDetails(); // Call the fetch function

  }, [id, token, navigate]);


  useEffect(() => {
    console.log(workPermit); // This will log the updated workPermit when it changes
  }, [workPermit]); // Dependency array ensures it runs when workPermit updates



  

  const closeModal = () => {
    setIsModalOpen(false);
    setModalFile(null);
  };


  

  const DocumentViewer = ({ fileUrl, onClose }: { fileUrl: string; onClose: () => void }) => {
    const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
    const isDocx = fileUrl.toLowerCase().endsWith(".docx") || fileUrl.toLowerCase().endsWith(".doc");
  
    return (
      <div
        className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="modal-content bg-white rounded-2xl p-4 shadow-xl relative w-[90vw] max-w-[700px] max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* File Viewer */}
          {isPdf ? (
            <>
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                className="w-full h-[80vh] rounded-md border mb-4"
                title="PDF Viewer"
              />
              <DownloadButton fileUrl={fileUrl} />
            </>
          ) : isDocx ? (
            <>
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                className="w-full h-[80vh] rounded-md border mb-4"
                title="Word Document Viewer"
              />
              <DownloadButton fileUrl={fileUrl} />
            </>
          ) : (
            <img src={fileUrl} alt="Uploaded Document" className="w-full max-h-[80vh] rounded-md mb-4" />
          )}
  
          {/* Close Button */}
          <button
            className="btn btn-danger self-end bg-[#0056b3] hover:bg-[#003c80] text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  // Reusable Download Button Component
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
  
  // File Renderer Component
  const FileRenderer = ({ fileName }: { fileName: string | null }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const fileUrl = fileName || "";
  
    if (!fileUrl) return <span>Not uploaded</span>;
  
    return (
      <>
        <span style={{ cursor: "pointer", color: "blue" }} onClick={() => setModalOpen(true)}>
          {fileUrl.endsWith(".pdf") ? "View PDF" : "View Document"}
        </span>
        {modalOpen && <DocumentViewer fileUrl={fileUrl} onClose={() => setModalOpen(false)} />}
      </>
    );
  };
  

  

useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-client', {
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
          {/* Navbar */}
          <ClientNavbar/>
  
      <div className="content">
        <header>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div>
        
        <div className="panel">
        <h1 className= "panelviewapplicationdetails">Work Permit Details</h1>
        {workPermit ? (
          <> 
          <div className= "panelviewapplicationdetails">
            <p> <strong>Date Issued:</strong> {workPermit.createdAt ? new Date(workPermit.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p> <strong>Work Permit Status:</strong> {workPermit.workpermitstatus}</p>
            <p> <strong>Classification:</strong> {workPermit.classification}</p>
            </div>

            <h1 className= "panelviewapplicationdetails">Personal Information Details</h1>
            <div className= "panelviewapplicationdetails-personalinfo">
              <p><strong>Application ID:</strong> {workPermit.id}</p>
              <p><strong>Fullname:</strong> {workPermit.formData.personalInformation.lastName}, {workPermit.formData.personalInformation.firstName} {workPermit.formData.personalInformation.middleInitial || 'N/A'}</p>
              <p><strong>Permanent Address:</strong>{workPermit.formData.personalInformation.permanentAddress || 'N/A'}</p>
              <p><strong>Currently Residing:</strong> {workPermit.formData.personalInformation.currentlyResiding || 'N/A'}</p>
              <p><strong>Temporary Address:</strong> {workPermit.formData.personalInformation.temporaryAddress || 'N/A'}</p>
              <p><strong>Age:</strong> {workPermit.formData.personalInformation.age || 'N/A'}</p>
              <p><strong>Place of Birth:</strong> {workPermit.formData.personalInformation.placeOfBirth || 'N/A'}</p>
              <p><strong>Citizenship:</strong> {workPermit.formData.personalInformation.citizenship || 'N/A'}</p>
              <p><strong>Civil Status:</strong> {workPermit.formData.personalInformation.civilStatus || 'N/A'}</p>
              <p><strong>Gender:</strong> {workPermit.formData.personalInformation.gender|| 'N/A'}</p>
              <p><strong>Height:</strong> {workPermit.formData.personalInformation.height || 'N/A'}</p>
              <p><strong>Weight:</strong> {workPermit.formData.personalInformation.weight || 'N/A'}</p>
              <p><strong>Mobile Number:</strong> {workPermit.formData.personalInformation.age || 'N/A'}</p>
              <p><strong>Email:</strong> {workPermit.formData.personalInformation.email || 'N/A'}</p>
              <p><strong>Educational Attainment:</strong> {workPermit.formData.personalInformation.educationalAttainment || 'N/A'}</p>
              <p><strong>Nature of Work:</strong> {workPermit.formData.personalInformation.natureOfWork || 'N/A'}</p>
              <p><strong>Place of Work:</strong> {workPermit.formData.personalInformation.placeOfWork || 'N/A'}</p>
              <p><strong>Company Name:</strong> {workPermit.formData.personalInformation.companyName || 'N/A'}</p>
              <p><strong>Email:</strong> {workPermit.formData.personalInformation.email || 'N/A'}</p>
              <p><strong>Work Permit Classification:</strong> {workPermit.formData.personalInformation.workpermitclassification || 'N/A'}</p>
            </div>

            <h1 className= "panelviewapplicationdetails">Emergency Contact Details</h1>
            <div className= "panelviewapplicationdetails-emergencycontact">
            <p><strong>Name:</strong> {workPermit.formData.emergencyContact.name2 || 'N/A'}</p>
            <p><strong>Mobile Number:</strong> {workPermit.formData.emergencyContact.mobileTel2 || 'N/A'}</p>
            <p><strong>Address:</strong> {workPermit.formData.emergencyContact.address || 'N/A'}</p>
            </div>


            <h1>Documents</h1>
  <div className= "panelviewapplicationdetails">
  {/* Main Documents Container */}
  <div
    style={{
      display: "flex",
      gridTemplateColumns: "1fr 2fr", // Align labels and files
      alignItems: "center",
      gap: "12px",
      maxWidth: "600px", // Adjust for readability
      margin: "0 auto", // Center align
    }}
  >
    {/* 1x1 Picture */}
    <p><strong>1x1 Picture:</strong></p>
    <span>
      {workPermit.formData.files?.document1 ? (
        <FileRenderer fileName={workPermit.formData.files.document1} />
      ) : (
        "No file uploaded"
      )}
    </span>

    {/* Cedula */}
    <p><strong>Cedula:</strong></p>
    <span>
      {workPermit.formData.files?.document2 ? (
        <FileRenderer fileName={workPermit.formData.files.document2} />
      ) : (
        "No file uploaded"
      )}
    </span>

    {/* Referral Letter (Conditional) */}
    {!workPermit.formData.personalInformation.currentlyResiding && (
      <>
        <p><strong>Referral Letter:</strong></p>
        <span>
          {workPermit.formData.files?.document3 ? (
            <FileRenderer fileName={workPermit.formData.files.document3} />
          ) : (
            "No file uploaded"
          )}
        </span>
      </>
    )}

    {/* FTJS Certificate (Conditional) */}
    {workPermit.classification === "New" && (
      <>
        <p><strong>FTJS Certificate:</strong></p>
        <span>
          {workPermit.formData.files?.document4 ? (
            <FileRenderer fileName={workPermit.formData.files.document4} />
          ) : (
            "No file uploaded"
          )}
        </span>
      </>
    )}

    {/* Receipt (Conditional) */}
    {workPermit.receipt?.receiptFile && (
      <>
        <p><strong>Receipt:</strong></p>
        <span>
          <FileRenderer fileName={workPermit.receipt.receiptFile} />
        </span>
      </>
    )}

    {/* Work Permit (Conditional) */}
    {workPermit.permitFile && (
      <>
        <p><strong>Work Permit:</strong></p>
        <span>
          <FileRenderer fileName={workPermit.permitFile} />
        </span>
      </>
    )}
  </div>

  {/* Application Comments (if available) */}
  {workPermit.applicationComments && (
    <div
      style={{
        marginTop: "16px",
        padding: "12px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <strong>Comments:</strong> {workPermit.applicationComments}
    </div>
  )}
</div>

            {/* Render additional fields as necessary */}
            
          </>
        ) : (
          <p>No work permit details available.</p>
        )}

{isModalOpen && (
  <div
  className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  onClick={closeModal}
>
  <div
    className="modal-content bg-white rounded-2xl p-4 shadow-xl relative w-[90vw] max-w-[700px] max-h-[90vh] flex flex-col"
    onClick={(e) => e.stopPropagation()}
  >
    {modalFile && modalFile.endsWith('.pdf') && (
      <iframe
        src={modalFile}
        className="w-full h-[80vh] rounded-md border mb-4"
        title="PDF Viewer"
      />
    )}
    <button
      className="btn btn-danger self-end bg-[#0056b3] hover:bg-[#003c80] text-white font-semibold py-2 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
      onClick={closeModal}
    >
      Close
    </button>
  </div>
</div>
      )
      }
        </div>
        
    
      </div>
      </div>
    </section>
  );
};

export default ViewApplicationDetails;
