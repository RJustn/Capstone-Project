import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ClientStyles.css';
import {BusinessPermit} from "../components/Interface(Front-end)/Types";
import { businessNatureMap } from "../components/Interface(Front-end)/BusinessNatureMap"; 
import ClientNavbar from '../components/NavigationBars/clientnavbar';
import MapLocationView from '../components/MapContents/MapLocationView';

const ViewApplicationDetailsBusiness: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const [businessPermit, setBusinessPermit] = useState<BusinessPermit | null>(null);
  const token = localStorage.getItem('token'); // Assuming the token is stored in local storage




  const navigate = useNavigate();


  useEffect(() => {
    const fetchBusinessPermitDetails = async () => {
        if (!token) {
            navigate('/'); // Redirect to login if no token
            return;
          } 
      try {
        console.log(id);
        const response = await axios.get(`https://capstone-project-backend-nu.vercel.app/client/fetchbusinesspermitdetails/${id}`, {
          headers: { },
          withCredentials: true, 

        });
        setBusinessPermit(response.data as BusinessPermit);
      } catch (error) {
        console.error('Error fetching Business permit details:', error);
     
      } }

      fetchBusinessPermitDetails(); // Call the fetch function










  }, [id, token, navigate]);

  useEffect(() => {
    console.log(businessPermit); // This will log the updated workPermit when it changes
  }, [businessPermit]); // Dependency array ensures it runs when workPermit updates








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
          <ClientNavbar />
  
      <div className="content">
        <header>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div>
        
        <div className="panel">
        <h1>Business Permit Details</h1>
        {businessPermit ? ( 
          <> 
          <div className="panelviewapplicationdetails-personalinfo">
          <p><strong>Application ID:</strong> {businessPermit.id}</p>
            <p> <strong>Date Issued:</strong> {businessPermit.createdAt ? new Date(businessPermit.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p> <strong>Business Permit Status:</strong> {businessPermit.businesspermitstatus}</p>
            </div>

            <h1 className="panelviewapplicationdetails">Personal Information Details</h1>
            <div className="panelviewapplicationdetails-personalinfo">
              
              {businessPermit?.owner?.corporation ? (
              <>
              <p><strong>Company Name:</strong> {businessPermit.owner.companyname || 'N/A'} </p>
              </>
              ) : (
              <>
              <p><strong>Fullname:</strong> {businessPermit.owner?.lastname || 'N/A'}, {businessPermit.owner?.firstname || 'N/A'} {businessPermit.owner?.middleinitial || 'N/A'}</p>
              <p> <strong>Civi Status:</strong> {businessPermit.owner?.civilstatus || 'N/A'} </p>
              <p> <strong>Gender:</strong> {businessPermit.owner?.gender || 'N/A'} </p>
              </>
              )}
              
              <p><strong>Citizenship</strong> {businessPermit.owner?.citizenship || 'N/A'}</p>
              <p><strong>Tin Number</strong> {businessPermit.owner?.tinnumber || 'N/A'}</p>

              
              {businessPermit?.owner?.representative && businessPermit.owner.representativedetails ? (
              <>
              <p><strong>Representative Fullname:</strong> {businessPermit.owner.representativedetails?.repfullname || 'N/A'}</p>
              <p><strong>Representative Designation:</strong> {businessPermit.owner.representativedetails?.repdesignation || 'N/A'}</p>
              <p><strong>Representative Mobile Number:</strong> {businessPermit.owner.representativedetails?.repmobilenumber || 'N/A'}</p>
              </>
              ) : null}
            </div>



<h1>Contact Information</h1>
<div className="panelviewapplicationdetails-personalinfo">
              <p><strong>House/Bldg No./Blk and Lot:</strong> {businessPermit.owner?.houseandlot || 'N/A'}</p>
              <p><strong>Building Name / Street Name:</strong> {businessPermit.owner?.buildingstreetname || 'N/A'}</p>
              <p><strong>Subdivision / Compound Name:</strong> {businessPermit.owner?.subdivision || 'N/A'}</p>
              <p><strong>Region</strong> {businessPermit.owner?.region || 'N/A'}</p>
              <p><strong>Province</strong> {businessPermit.owner?.province || 'N/A'}</p>
              <p><strong>Municipality:</strong> {businessPermit.owner?.municipality || 'N/A'}</p>
              <p><strong>Barangay:</strong> {businessPermit.owner?.barangay || 'N/A'}</p>
              <p><strong>Telehpone Number:</strong> {businessPermit.owner?.telephonenumber || 'N/A'}</p>
              <p><strong>Mobile Number:</strong> {businessPermit.owner?.mobilenumber || 'N/A'}</p>
              <p><strong>Email Address:</strong> {businessPermit.owner?.email || 'N/A'}</p>
</div>

              <h1 className="panelviewapplicationdetails">Business Information</h1>
              <div className="panelviewapplicationdetails-emergencycontact">
              <p><strong>Business Name:</strong> {businessPermit.business?.businessname || 'N/A'}</p>
              <p><strong>Business Scale:</strong> {businessPermit.business?.businessscale || 'N/A'}</p>
              <p><strong>Payment Mode:</strong> {businessPermit.business?.paymentmethod || 'N/A'}</p>
              </div>
              
              <h1 className="panelviewapplicationdetails">Business Contact Information</h1>
              <div className="panelviewapplicationdetails-personalinfo">
              <p><strong>House/Bldg No./Blk and Lot:</strong> {businessPermit.business?.businessbuildingblocklot || 'N/A'}</p>
              <p><strong>Building Name/Street Name:</strong> {businessPermit.business?.businessbuildingname || 'N/A'}</p>
              <p><strong>Subdivision/Compound Name:</strong> {businessPermit.business?.businesssubcompname|| 'N/A'}</p>
              <p><strong>Region:</strong> {businessPermit.business?.businessregion || 'N/A'}</p>
              <p><strong>Province:</strong> {businessPermit.business?.businessprovince || 'N/A'}</p>
              <p><strong>City/Municipality:</strong> {businessPermit.business?.businessmunicipality || 'N/A'}</p>
              <p><strong>Barangay</strong> {businessPermit.business?.businessbarangay || 'N/A'}</p> 
              <p><strong>Zip:</strong> {businessPermit.business?.businesszip || 'N/A'}</p>
              <p><strong>Contact Number:</strong> {businessPermit.business?.businesscontactnumber || 'N/A'}</p>
              </div>

              <h1 className="panelviewapplicationdetails" >Necessities Information</h1>
              <div className="panelviewapplicationdetails-personalinfo">
              <p><strong>Ownership Type:</strong> {businessPermit.business?.ownershiptype || 'N/A'}</p>
              <p><strong>Agency Registered No:</strong> {businessPermit.business?.agencyregistered || 'N/A'}</p>
              <p><strong>DTI Registration No:</strong> {businessPermit.business?.dtiregistrationnum || 'N/A'}</p>
              <p><strong>DTI Registration Date:</strong> {businessPermit.business?.dtiregistrationdate || 'N/A'}</p>
              <p><strong>DTI Expiration Date:</strong> {businessPermit.business?.dtiregistrationexpdate || 'N/A'}</p>
              <p><strong>SEC Registration No:</strong> {businessPermit.business?.secregistrationnum || 'N/A'}</p>
              <p><strong>BIR Registration No:</strong> {businessPermit.business?.birregistrationnum || 'N/A'}</p>
              <p><strong>Industry Sector:</strong> {businessPermit.business?.industrysector || 'N/A'}</p>
              <p><strong>Business Operation:</strong> {businessPermit.business?.businessoperation || 'N/A'}</p>
              <p><strong>Business Type:</strong> {businessPermit.business?.typeofbusiness || 'N/A'}</p>
              </div>



              <h1 className="panelviewapplicationdetails">Other Information</h1>
              <div className="panelviewapplicationdetails-personalinfo">
              <p><strong>Date Established:</strong> {businessPermit.otherbusinessinfo?.dateestablished || 'N/A'}</p>
              <p><strong>Start Date:</strong> {businessPermit.otherbusinessinfo?.startdate || 'N/A'}</p> 
              <p><strong>Occupancy:</strong> {businessPermit.otherbusinessinfo?.occupancy || 'N/A'}</p>
              <p><strong>Business Type:</strong> {businessPermit.otherbusinessinfo?.otherbusinesstype || 'N/A'}</p>
              <p><strong>Email Address:</strong> {businessPermit.otherbusinessinfo?.businessemail || 'N/A'}</p>
              <p><strong>Business Area:</strong> {businessPermit.otherbusinessinfo?.businessarea || 'N/A'}</p>
              <p><strong>Lot Area:</strong> {businessPermit.otherbusinessinfo?.businesslotarea || 'N/A'}</p> 
              <p><strong>No. of Workers (Male):</strong> {businessPermit.otherbusinessinfo?.numofworkermale || 'N/A'}</p>
              <p><strong>No. of Workers (Female):</strong> {businessPermit.otherbusinessinfo?.numofworkerfemale || 'N/A'}</p>
              <p><strong>Total No. of Workers:</strong> {businessPermit.otherbusinessinfo?.numofworkertotal || 'N/A'}</p>
              <p><strong>Employees Residing within LGU:</strong> {businessPermit.otherbusinessinfo?.numofworkerlgu || 'N/A'}</p>
              </div>

{businessPermit?.otherbusinessinfo?.occupancy === "Agree" && (
   <div className="panelviewapplicationdetails">
     <h1>Lessor's Information</h1>
    <div className="panelviewapplicationdetails-personalinfo">
    <p><strong>Lessor's Full Name:</strong> {businessPermit.otherbusinessinfo?.lessorfullname || 'N/A'}</p>
    <p><strong>Lessor's Mobile Number:</strong> {businessPermit.otherbusinessinfo?.lessormobilenumber || 'N/A'}</p>
    <p><strong>Monthly Rent:</strong> {businessPermit.otherbusinessinfo?.monthlyrent || 'N/A'}</p>
    <p><strong>Lessor's Full Address:</strong> {businessPermit.otherbusinessinfo?.lessorfulladdress || 'N/A'}</p>
    <p><strong>Lessor's Email Address:</strong> {businessPermit.otherbusinessinfo?.lessoremailaddress || 'N/A'}</p>
  </div>
  </div>
)}


<div>
      <h1>View-Only Map</h1>
      {/* Provide initial latitude and longitude */}
      <MapLocationView 
  initialLat={businessPermit?.mapview?.lat ? parseFloat(businessPermit.mapview.lat) : 0} 
  initialLng={businessPermit?.mapview?.lng ? parseFloat(businessPermit.mapview.lng) : 0} 
  disableInteraction={true}
/>
    </div>
    <div>




<h1>List of Businesses</h1>
{businessPermit && businessPermit.businesses && businessPermit.businesses.length > 0 ? (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nature</th>
        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Type</th>
        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Capital Investment</th>
        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Las Year Gross</th>
      </tr>
    </thead>
    <tbody>
      {businessPermit.businesses.map((business) => (
        <tr key={business._id}>
          <td style={{ padding: '8px', border: '1px solid #ddd' }}>
            {businessNatureMap[business.businessNature as keyof typeof businessNatureMap] || business.businessNature || 'N/A'}
          </td>
          <td style={{ padding: '8px', border: '1px solid #ddd' }}>
            {business.businessType || 'N/A'}
          </td>
          <td style={{ padding: '8px', border: '1px solid #ddd' }}>
          ₱  {business.capitalInvestment?.toLocaleString() || 'N/A'}
          </td>
          <td style={{ padding: '8px', border: '1px solid #ddd' }}>
          ₱  {business.lastYearGross?.toLocaleString() || 'N/A'}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <div>No businesses to display.</div>
)}

    </div>
    

            
    <div className= "panelviewapplicationdetails">
  {/* Main Documents Container */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 2fr", // Align labels and files
      alignItems: "center",
      gap: "20px",
      maxWidth: "600px", // Adjust for readability
      margin: "0 auto", // Center align
    }}
  >
    <p> Upload DTI / SEC / CDA: </p>
    <span>
      {businessPermit.files?.document1 ? (
        <FileRenderer fileName={businessPermit.files?.document1} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc1 && (
    <p>Remarks: {businessPermit.files.remarksdoc1}</p>
  )}
    <p> Occupancy Permit (Optional): </p>
    <span>
      {businessPermit.files?.document2 ? (
        <FileRenderer fileName={businessPermit.files?.document2} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc2 && (
    <p>Remarks: {businessPermit.files.remarksdoc2}</p>
  )}
    <p>Lease Contract (if rented) / Tax Declaration (If Owned): </p>
    <span>
      {businessPermit.files?.document3 ? (
        <FileRenderer fileName={businessPermit.files?.document3} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc3 && (
    <p>Remarks: {businessPermit.files.remarksdoc3}</p>
  )}
    <p>Authorization Letter / S.P.A. / Board Resolution / Secretary's Certificate (if thru representative): </p>
    <span>
      {businessPermit.files?.document4 ? (
        <FileRenderer fileName={businessPermit.files?.document4} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc4 && (
    <p>Remarks: {businessPermit.files.remarksdoc4}</p>
  )}
    <p>Owner's ID: </p>
    <span>
      {businessPermit.files?.document5 ? (
        <FileRenderer fileName={businessPermit.files?.document5} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc5 && (
    <p>Remarks: {businessPermit.files.remarksdoc5}</p>
  )}
    <p>Picture of Establishment (Perspective View): </p>
    <span>
      {businessPermit.files?.document6 ? (
        <FileRenderer fileName={businessPermit.files?.document6} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc6 && (
    <p>Remarks: {businessPermit.files.remarksdoc6}</p>
  )}
    <p> Zoning: </p>    
    <span>
      {businessPermit.files?.document7 ? (
        <FileRenderer fileName={businessPermit.files?.document7} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc7 && (
    <p>Remarks: {businessPermit.files.remarksdoc7}</p>
  )}
    <p>Office of the Building Official: </p>
    <span>
      {businessPermit.files?.document8 ? (
        <FileRenderer fileName={businessPermit.files?.document8} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc8 && (
    <p>Remarks: {businessPermit.files.remarksdoc8}</p>
  )}
    <p>City Health Office: </p>
    <span>
      {businessPermit.files?.document9 ? (
        <FileRenderer fileName={businessPermit.files?.document9} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc9 && (
    <p>Remarks: {businessPermit.files.remarksdoc9}</p>
  )}
    <p>Bureau of Fire Protection: </p>
    <span>
      {businessPermit.files?.document10 ? (
        <FileRenderer fileName={businessPermit.files?.document10} />
      ) : (
        "No file uploaded"
      )}
    </span>
    {businessPermit.files.remarksdoc10 && (
    <p>Remarks: {businessPermit.files.remarksdoc10}</p>
  )}
  </div>            
  {businessPermit.receipt?.receiptFile && (
      <div>
    <p>Receipt: </p>
    <span>
    {businessPermit.receipt?.receiptFile ? (
      <FileRenderer fileName={businessPermit.receipt?.receiptFile} />
    ) : (
      "No file uploaded"
    )}
  </span>
  </div>
  )}
  {businessPermit.statementofaccount.statementofaccountfile && (
  <div>
  <p>
    Statement of Account (Assessment): </p>
  <span>
    {businessPermit.statementofaccount?.statementofaccountfile ? (
      <FileRenderer fileName={businessPermit.statementofaccount?.statementofaccountfile} />
    ) : (
      "No file uploaded"
    )}
  </span>
  </div>
  )}
  {businessPermit.permitFile && (
      <div>
    <p>Business Permit: </p>
    <span>
    {businessPermit.permitFile ? (
      <FileRenderer fileName={businessPermit.permitFile} />
    ) : (
      "No file uploaded"
    )}
  </span>
    </div>
  )}
  {businessPermit.applicationComments && (
    <p>Comments: {businessPermit.applicationComments}</p>
  )}
  </div>
            
          </>
        ) : (
          <p>Business permit details available.</p>
        )}
        </div>
      </div>
      </div>
    </section>
  );
};

export default ViewApplicationDetailsBusiness;
