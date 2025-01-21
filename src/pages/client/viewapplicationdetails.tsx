import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ClientStyles.css';
import ClientSideBar from '../components/ClientSideBar';

export interface PersonalInformation {
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
  
  export interface EmergencyContact {
    name2?: string; // Optional
    mobileTel2?: string; // Optional
    address?: string; // Optional
  }
  
  export interface Files {
    document1: string | null; // Optional
    document2: string | null; // Optional
    document3: string | null; // Optional
    document4: string | null; // Optional
  }
  
  export interface Receipt {
    receiptId?: string; // Optional
    modeOfPayment?: string; // Optional
    receiptDate?: string; // Optional
    amountPaid?: string; // Optional
    receiptFile?: string;
  }
  
  export interface FormData {
    personalInformation: PersonalInformation;
    emergencyContact: EmergencyContact;
    files: Files;
  
  }
  
  export interface WorkPermit {
    _id: string; // Mongoose generated ID
    id: string;
    userId?: string; // Can be a string for front end
    permittype?: string; // Default value can be handled in logic
    classification: string;
    workpermitstatus: string;
    transaction: string;
    transactionstatus: string;
    formData: FormData;
    createdAt?: string;
    receipt: Receipt;
    permitFile?: string;
    applicationComments: string;
  }

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
        const response = await axios.get(`http://localhost:3000/client/workpermitdetails/${id}`, {
          headers: { },
          withCredentials: true, 

        });
        setWorkPermit(response.data as WorkPermit); // Set the work permit details to state
      } catch (error) {
        console.error('Error fetching work permit details:', error);
     
      } }

    fetchWorkPermitDetails(); // Call the fetch function

  }, [id, token, navigate]);

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

  useEffect(() => {
    console.log(workPermit); // This will log the updated workPermit when it changes
  }, [workPermit]); // Dependency array ensures it runs when workPermit updates



   const openModal = (filePath: string) => {
    setModalFile(filePath);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalFile(null);
  };

  const fetchDocumentUrl = (fileName: string | null, folder: 'uploads' | 'permits' | 'receipts'): string | null => {
    if (!fileName) return null;
    
    // Return the file URL based on the folder specified
    return `http://localhost:3000/client/${folder}/${fileName}`;
  };
  
const renderDocument = (fileName: string | null, folder: 'uploads' | 'permits' | 'receipts') => {
  const fileUrl = fetchDocumentUrl(fileName, folder);
  if (!fileUrl) return <span>Not uploaded</span>;

  const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

  return (
    <span style={{ cursor: 'pointer', color: 'blue' }} onClick={() => openModal(fileUrl)}>
      {fileExtension === 'pdf' ? 'View PDF' : 'View Document'}
    </span>
  );
};

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
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div>
        
        <div className="panel">
        <h1>Work Permit Details</h1>
        {workPermit ? (
          <> 
            <p> Date Issued: {workPermit.createdAt ? new Date(workPermit.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p> Work Permit Status: {workPermit.workpermitstatus}</p>
            <p> Classification: {workPermit.classification}</p>

            <h1>Personal Information Details</h1>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', textAlign: 'left'}}>
              <p><strong>Application ID:</strong> {workPermit.id}</p>
              <p><strong>Fullname:</strong> {workPermit.formData.personalInformation.lastName}, {workPermit.formData.personalInformation.firstName} {workPermit.formData.personalInformation.middleInitial}</p>
              <p><strong>Permanent Address:</strong> {workPermit.formData.personalInformation.permanentAddress}</p>
              <p><strong>Currently Residing:</strong> {workPermit.formData.personalInformation.currentlyResiding}</p>
              <p><strong>Temporary Address:</strong> {workPermit.formData.personalInformation.temporaryAddress}</p>
              <p><strong>Age:</strong> {workPermit.formData.personalInformation.age}</p>
              <p><strong>Place of Birth:</strong> {workPermit.formData.personalInformation.placeOfBirth}</p>
              <p><strong>Citizenship:</strong> {workPermit.formData.personalInformation.citizenship}</p>
              <p><strong>Civil Status:</strong> {workPermit.formData.personalInformation.civilStatus}</p>
              <p><strong>Gender:</strong> {workPermit.formData.personalInformation.gender}</p>
              <p><strong>Height:</strong> {workPermit.formData.personalInformation.height}</p>
              <p><strong>Weight:</strong> {workPermit.formData.personalInformation.weight}</p>
              <p><strong>Mobile Number:</strong> {workPermit.formData.personalInformation.age}</p>
              <p><strong>Email:</strong> {workPermit.formData.personalInformation.email}</p>
              <p><strong>Educational Attainment:</strong> {workPermit.formData.personalInformation.educationalAttainment}</p>
              <p><strong>Nature of Work:</strong> {workPermit.formData.personalInformation.natureOfWork}</p>
              <p><strong>Place of Work:</strong> {workPermit.formData.personalInformation.placeOfWork}</p>
              <p><strong>Company Name:</strong> {workPermit.formData.personalInformation.companyName}</p>
              <p><strong>Email:</strong> {workPermit.formData.personalInformation.email}</p>
              <p><strong>Work Permit Classification:</strong> {workPermit.formData.personalInformation.workpermitclassification}</p>
            </div>

            <h1>Emergency Contact Details</h1>
            <p><strong>Name:</strong> {workPermit.formData.emergencyContact.name2}</p>
            <p><strong>Mobile Number:</strong> {workPermit.formData.emergencyContact.mobileTel2}</p>
            <p><strong>Address:</strong> {workPermit.formData.emergencyContact.address}</p>

            <h1>Documents</h1>
            <div>

  <div style={{display: 'flex',justifyContent: 'center', gap: '16px',flexWrap: 'wrap' }}>
    <p>1x1 Picture: {workPermit.formData.files && renderDocument(workPermit.formData.files.document1, 'uploads')}</p>

    <p>Cedula: {workPermit.formData.files && renderDocument(workPermit.formData.files.document2, 'uploads')}</p>

    {!workPermit.formData.personalInformation.currentlyResiding && (
  <p>
    Referral Letter: 
    {workPermit.formData.files && renderDocument(workPermit.formData.files.document3, 'uploads')}
  </p>
)}
  
  {workPermit.classification === 'New' && (
    <p>FTJS (First Time Job Seeker) Certificate: {workPermit.formData.files && renderDocument(workPermit.formData.files.document4, 'uploads')}</p>
)}

  </div>
              
  {workPermit.receipt?.receiptFile && (
    <p>Receipt: {renderDocument(workPermit.receipt.receiptFile, 'receipts')}</p>
  )}
    {workPermit.permitFile && (
    <p>Work Permit: {renderDocument(workPermit.permitFile, 'permits')}</p>
  )}
  {workPermit.applicationComments && (
    <p>Comments: {workPermit.applicationComments}</p>
  )}
</div>
            {/* Render additional fields as necessary */}
            
          </>
        ) : (
          <p>No work permit details available.</p>
        )}

{isModalOpen && (
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
            <button className="back-button"onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
        </div>
        
    
      </div>
      </div>
    </section>
  );
};

export default ViewApplicationDetails;
