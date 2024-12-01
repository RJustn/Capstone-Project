
import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/DAsidebar';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export interface BusinessPermit {
  _id: string;
  id: string;
  userId: string;
  permittype?: string;
  businesspermitstatus?: string;
  businessstatus?: string;
  classification?: string;
  transaction?: string;
  amountToPay?: string;
  permitFile?: string;
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
}

const DataControllerForAssessmentBP: React.FC = () => {
  const [businessPermits, setBusinesPermits] = useState<BusinessPermit[]>([]);
  const [filteredItems, setFilteredItems] = useState<BusinessPermit[]>([]);
  
  const navigate = useNavigate();


  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);




  const [activePermitId, setActivePermitId] = useState<BusinessPermit | null>(null);


  //Modals
  const [editownermodal, setEditOwnerModal] = useState(false);
  const [viewAttachmentsModal, setViewAttatchmentsModal] = useState(false);


  const [isEditing, setIsEditing] = useState(false); // Track if fields are editable
  const [isEditingAttach, setIsEditingAttach] = useState(false); // Track if fields are editable
  //Step 1
  const [corporation, setCorporation] = useState(false);
  const [lastname, setLastName] = useState('');
  const [firstname, setFirstName] = useState('');
  const [middleinitial, setMiddleInitial] = useState('');
  const [civilstatus, setCivilStatus] = useState('');
  const [companyname, setCompanyName] = useState('');
  const [gender, setGender] = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [tinnumber, setTinNumber] = useState('');
  const [representative, setRepresentative] = useState(false);
  const [repfullname, setRepFullName] = useState('');
  const [repdesignation, setRepDesignation] = useState('');
  const [repmobilenumber, setRepMobileNumber] = useState('');
  const [houseandlot, setHouseandLot] = useState('');
  const [buildingstreetname, setBuildingStreetName] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [barangay, setBarangay] = useState('');
  const [telephonenumber, setTelephoneNumber] = useState('');
  const [mobilenumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/client/check-auth-datacontroller', {
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

  // CODE FOR TABLE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(businessPermits.length / itemsPerPage)
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
  const [, setSearchQuery] = useState<string>(''); // Track the search query
  const [inputValue, setInputValue] = useState<string>('');


  // Get current items
  const currentItems = filteredItems.slice(startIndex, endIndex); 


  // Handle the search when the button is clicked
  const handleSearch = () => {
    const searchValue = inputValue; // Use input value for search
    setSearchQuery(searchValue); // Update search query state
  };



//File



const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string | null }>({});

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

//File






  const handleeditsave = async () => {
    if (!activePermitId) return;
  
    const updatedData = {
      owner: {
        lastname,
        firstname,
        middleinitial,
        companyname,
        civilstatus,
        gender,
        citizenship,
        tinnumber,
        representative,
        representativedetails: {
          repfullname,
          repdesignation,
          repmobilenumber,
        },
        houseandlot,
        buildingstreetname,
        subdivision,
        region,
        province,
        municipality,
        barangay,
        telephonenumber,
        mobilenumber,
        email,
      },
    };
  
    try {
      const response = await axios.put(`http://localhost:3000/datacontroller/updatebusinessownerPermit/${activePermitId._id}`, updatedData);

      fetchBusinessPermits(); // Fetch work permits if token is present
      console.log('Update successful:', response.data);
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  
  //Attach
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

  const updateAttachments = async () => {
    if (!activePermitId) return;
  
    const formData = new FormData();

    if (files.document1) formData.append('document1', files.document1);
    if (files.document2) formData.append('document2', files.document2);
    if (files.document3) formData.append('document3', files.document3);
    if (files.document4) formData.append('document4', files.document4);

    logFormData(formData);

  
    try {
      const response = await axios.post(
        `http://localhost:3000/datacontroller/updatebusinessattachment/${activePermitId._id}`,
        formData,
        {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, 
      });
        console.log(response.data);
        if (response.status === 200) {
          fetchBusinessPermits(); // Fetch work permits if token is present
          alert('Work Permit Application submitted successfully!');
        } else {
          const errorMessage = (response.data as { message: string }).message;
          console.error('Error submitting application:', errorMessage);
        }
      } catch (error) {
        console.error('Error:', error);
      }
  };
  //Attach


  const handleActionBP = (action: string, permit: BusinessPermit) => {
    setSelectedUserId(null);
    setActivePermitId(null);
    switch (action) {
      case 'viewApplication':
        navigate(`/DAviewbusinessapplicationdetails/${permit._id}`);
    console.log(`Edit permit ID: ${permit._id}`);
        break;
        case 'department':
          setSelectedUserId(permit._id);
          break;
          case 'editowner':
            setActivePermitId(permit);
            setEditOwnerModal(true);
            break;
          case 'viewattatchments':
            setViewAttatchmentsModal(true)
            setActivePermitId(permit);
        break;
      default:
        console.warn('Unknown action');
    }
  };
  const editcloseModal = () => {
    setEditOwnerModal(false);
    setIsEditing(false);
  };

  const closeViewAttachmentsModal = () => {
    if (selectedFiles.document1) {
      URL.revokeObjectURL(selectedFiles.document1);
    }
    if (selectedFiles.document2) {
      URL.revokeObjectURL(selectedFiles.document2);
    }
    if (selectedFiles.document3) {
      URL.revokeObjectURL(selectedFiles.document3);
    }
    if (selectedFiles.document4) {
      URL.revokeObjectURL(selectedFiles.document4);
    }
  
    setViewAttatchmentsModal(false);
    setSelectedFiles({});
    setIsEditingAttach(false);
    setFiles({
      document1: null,
      document2: null,
      document3: null,
      document4: null,
    });
  };


  useEffect(() => {
    if (activePermitId) {
      setLastName(activePermitId.owner.lastname || '');
      setFirstName(activePermitId.owner.firstname || '');
      setMiddleInitial(activePermitId.owner.middleinitial || '');
      setCompanyName(activePermitId.owner.companyname || '');
      setCivilStatus(activePermitId.owner.civilstatus || '');
      setGender(activePermitId.owner.gender || '');
      setCitizenship(activePermitId.owner.citizenship || '');
      setTinNumber(activePermitId.owner.tinnumber || '');
      setRepFullName(activePermitId.owner.representativedetails?.repfullname || '');
      setRepDesignation(activePermitId.owner.representativedetails?.repdesignation || '');
      setRepMobileNumber(activePermitId.owner.representativedetails?.repmobilenumber || '');
      setHouseandLot(activePermitId.owner.houseandlot || '');
      setBuildingStreetName(activePermitId.owner.buildingstreetname || '');
      setSubdivision(activePermitId.owner.subdivision || '');
      setRegion(activePermitId.owner.region || '');
      setProvince(activePermitId.owner.province || '');
      setMunicipality(activePermitId.owner.municipality || '');
      setBarangay(activePermitId.owner.barangay || '');
      setTelephoneNumber(activePermitId.owner.telephonenumber || '');
      setMobileNumber(activePermitId.owner.mobilenumber || '');
      setEmail(activePermitId.owner.email || '');
      setCorporation(activePermitId.owner.corporation || false);
      setRepresentative(activePermitId.owner.representative || false);
    }
  }, [activePermitId]);

  useEffect(() => {
    const fileUrls: { [key: string]: string } = {};
  
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        fileUrls[key] = fileUrl;
  
        // Cleanup for this specific file
        return () => URL.revokeObjectURL(fileUrl);
      }
    });
  
    setSelectedFiles((prev) => ({ ...prev, ...fileUrls }));
  }, [files]); // Dependency on `files`

  const fetchBusinessPermits = async () => {
    try {
      const response = await fetch('http://localhost:3000/datacontroller/getbusinesspermitsforassessment', {
        method: 'GET',
        credentials: 'include', // Ensure cookies (containing the token) are sent
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const businessPermitData = await response.json();
      setBusinesPermits(businessPermitData);
    } catch (error) {
      console.error('Error fetching work permits:', error);
    }
  };

  useEffect(() => {
          fetchBusinessPermits(); // Fetch work permits if token is present

         
            const fileUrls: { [key: string]: string } = {};
          
            Object.entries(files).forEach(([key, file]) => {
              if (file) {
                const fileUrl = URL.createObjectURL(file);
                fileUrls[key] = fileUrl;
          
                // Cleanup for this specific file
                return () => URL.revokeObjectURL(fileUrl);
              }
            });
          
            setSelectedFiles((prev) => ({ ...prev, ...fileUrls }));
         
  }, [files]);

  useEffect(() => {
    setFilteredItems(businessPermits); // Display all work permits by default
  }, [businessPermits]);

  // Date picker states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle date search
  const handleDateSearch = () => {
    const filteredByDate = businessPermits.filter((permit) => {
      const permitDate = new Date(permit?.applicationdateIssued || Date.now());
      const isAfterStartDate = startDate ? permitDate >= new Date(startDate) : true;
      const isBeforeEndDate = endDate ? permitDate <= new Date(endDate) : true;
      return isAfterStartDate && isBeforeEndDate;
    });

    setFilteredItems(filteredByDate);
    setCurrentPage(0); // Reset to the first page of results
  };

  const handleCorpChange = () => {
    if (!corporation) {
      // If toggling to corporation, clear the first and last names
      setFirstName('');
      setLastName('');
      setMiddleInitial('');
      setCompanyName(activePermitId?.owner?.companyname || '');
    } else {
      // If switching back to individual, restore original names from activePermitId (or keep current state)
      setFirstName(activePermitId?.owner?.firstname || '');
      setLastName(activePermitId?.owner?.lastname || '');
      setMiddleInitial(activePermitId?.owner?.middleinitial || '');
      setCompanyName('');
    }
  
    // Toggle corporation state
    setCorporation(!corporation);
  };

  const handleRepChange = () => {
    if (!representative) {
      // If toggling to corporation, clear the first and last names
      setRepFullName(activePermitId?.owner?.representativedetails?.repfullname || '');
      setRepDesignation(activePermitId?.owner?.representativedetails?.repdesignation || '');
      setRepMobileNumber(activePermitId?.owner?.representativedetails?.repmobilenumber || '');
    } else {
      // If switching back to individual, restore original names from activePermitId (or keep current state)
      setRepFullName('');
      setRepDesignation('');
      setRepMobileNumber('');
    }
  
    // Toggle corporation state
    setRepresentative(!representative);
  };


  const maxDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  const handleCancelEdit = () => {
    if (activePermitId) {
      setLastName(activePermitId.owner.lastname || '');
      setFirstName(activePermitId.owner.firstname || '');
      setMiddleInitial(activePermitId.owner.middleinitial || '');
      setCompanyName(activePermitId.owner.companyname || '');
      setCivilStatus(activePermitId.owner.civilstatus || '');
      setGender(activePermitId.owner.gender || '');
      setCitizenship(activePermitId.owner.citizenship || '');
      setTinNumber(activePermitId.owner.tinnumber || '');
      setRepFullName(activePermitId.owner.representativedetails?.repfullname || '');
      setRepDesignation(activePermitId.owner.representativedetails?.repdesignation || '');
      setRepMobileNumber(activePermitId.owner.representativedetails?.repmobilenumber || '');
      setHouseandLot(activePermitId.owner.houseandlot || '');
      setBuildingStreetName(activePermitId.owner.buildingstreetname || '');
      setSubdivision(activePermitId.owner.subdivision || '');
      setRegion(activePermitId.owner.region || '');
      setProvince(activePermitId.owner.province || '');
      setMunicipality(activePermitId.owner.municipality || '');
      setBarangay(activePermitId.owner.barangay || '');
      setTelephoneNumber(activePermitId.owner.telephonenumber || '');
      setMobileNumber(activePermitId.owner.mobilenumber || '');
      setEmail(activePermitId.owner.email || '');

    }
    setIsEditing(false);
    setCorporation(false);
    setRepresentative(false);
  };

  const handleCancelEditAttach = () => {
 setIsEditingAttach(false);
 setFiles({
  document1: null,
  document2: null,
  document3: null,
  document4: null,
});
setSelectedFiles({});
if (selectedFiles.document1) {
  URL.revokeObjectURL(selectedFiles.document1);
}
if (selectedFiles.document2) {
  URL.revokeObjectURL(selectedFiles.document2);
}
if (selectedFiles.document3) {
  URL.revokeObjectURL(selectedFiles.document3);
}
if (selectedFiles.document4) {
  URL.revokeObjectURL(selectedFiles.document4);
}

  };

  return (
    <section className="DAbody">
      <div className="DAsidebar-container">
        <DASidebar handleLogout={handleLogout} /> {/* Pass handleLogout to DASidebar */}
      </div>

      <div className="DAcontent">
        <header className='DAheader'>
          <h1>Online Business and Work Permit Licensing System</h1>
        </header>
        <div className='workpermittable'>
          <p>Work Permit Applications (For Assessments)</p>
          {/* Search Bar */}
          Search:
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search by ID, Status, or Classification"
              value={inputValue} // Use inputValue for the input field
              onChange={(e) => setInputValue(e.target.value)} // Update inputValue state
              className="search-input" // Add a class for styling
            />
            <button onClick={handleSearch} className="search-button">Search</button> {/* Button to trigger search */}
          </div>


          {/* Date Pickers for Date Range Filter */}
          Start Date:
          <div className="date-picker-container">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={maxDate} // Set the maximum date to today
              placeholder="Start Date"
            />
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={maxDate} // Set the maximum date to today
              placeholder="End Date"
            />
            <button onClick={handleDateSearch} className="search-button">Search by Date</button>
          </div>

          <table className="permit-table">
            <thead>
              <tr>
                <th>
                 Business Information 
                </th>
                <th>
                  ID
                </th>
                <th>
                 Application Status
                </th>
                <th>
                 Business Status 
                </th>
                <th>
                  Date Issued 
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>

    {currentItems.map((permit) => (
      <React.Fragment key={permit._id}>
      <tr key={permit._id}>
        <th>Business Name:{permit.business.businessname}<br />
            Owner:{permit.owner.lastname}, {permit.owner.firstname} {permit.owner.middleinitial}<br />
            Address:</th>
        <td>{permit.id}</td>
        <th>{permit.businesspermitstatus}</th>
        <td>{permit.businessstatus}</td>
        <td>{new Date(permit.applicationdateIssued).toLocaleDateString()}</td>
        <td>
          <select
            defaultValue=""
            onChange={(e) => {
              handleActionBP(e.target.value, permit);
              e.target.value = ""; // Reset dropdown to default
            }}
            className="dropdown-button"
          >
            <option value="" disabled>
              Select Action
            </option>
              <>
                <option value="editowner">Edit Owner Details</option>
                <option>Edit Business Details</option>
                <option value="viewApplication">View Application</option>
                <option>Edit Business Nature</option>
                <option>Assessment</option>
                <option value="viewattatchments">View Attatchments</option>
                <option value="department">Department</option>
                <option>Cancel Application</option>
              </>
          </select>
        </td>
      </tr>
      {selectedUserId === permit._id && (
  <tr>
    <td colSpan={6}>
      <table>
        <thead>
          <tr>
            <th>Departments</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(permit.department).map(([, departmentValue], index) => (
            <tr key={index}>
              <td>{departmentValue}</td>
              <td>Approved</td>
              <td>This is a test statement remarks for other departments</td>
            </tr>
          ))}
        </tbody>
      </table>
    </td>
  </tr>
)}

               </React.Fragment>
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



        {editownermodal && activePermitId && (
      <div className="modal-overlay" onClick={editcloseModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <p>Edit Owner Details {activePermitId._id}</p>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isEditing ? corporation : activePermitId?.owner?.corporation || false}
                onChange={() => {
                  handleCorpChange();
                                }}
                disabled={!isEditing} // Disable unless editing
              />
              Check if Corporation
            </label>
          </div>

        
          <div className="form-group">
  <label>LAST NAME:</label>
  <input
    type="text"
    value={isEditing ? lastname : activePermitId.owner.lastname} // Use `lastname` when editing
    onChange={(e) => setLastName(e.target.value)}
    required
    disabled={!isEditing || corporation} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>FIRST NAME:</label>
  <input
    type="text"
    value={isEditing ? firstname : activePermitId.owner.firstname} // Use `lastname` when editing
    onChange={(e) => setFirstName(e.target.value)}
    required
    disabled={!isEditing || corporation} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>MIDDLE INITIAL:</label>
  <input
    type="text"
    value={isEditing ? middleinitial : activePermitId.owner.middleinitial} // Use `lastname` when editing
    onChange={(e) => setMiddleInitial(e.target.value)}
    required
    disabled={!isEditing || corporation} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>COMPANY NAME:</label>
  <input
    type="text"
    value={isEditing ? companyname : activePermitId.owner.companyname} // Use `lastname` when editing
    onChange={(e) => setCompanyName(e.target.value)}
    required
    disabled={!isEditing || !corporation} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Civil Status:</label>
   <select
                  value={isEditing ? civilstatus : activePermitId.owner.civilstatus} // Use `lastname` when editing
                  onChange={(e) => setCivilStatus(e.target.value)}
                  required
                  disabled={!isEditing}
                  className="form-control"
                >
                  <option value="" disabled>Select Civil Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed / Widower</option>
                  <option value="Seperated">Seperated</option>
                  <option value="Undefined">Undefined</option>
                </select>
</div>
<div className="form-group">
  <label>Gender:</label>
  <select
                  value={isEditing ? gender : activePermitId.owner.gender} // Use `lastname` when editing
                  onChange={(e) => setGender(e.target.value)}
                  className="form-control"
                  disabled={!isEditing} // Disable if not editing or is corporation
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Corp">Corporation</option>
                </select>
</div>
<div className="form-group">
  <label>Citizenship:</label>
  <input
    type="text"
    value={isEditing ? citizenship : activePermitId.owner.citizenship} // Use `lastname` when editing
    onChange={(e) => setCitizenship(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Tin Number:</label>
  <input
    type="text"
    value={isEditing ? tinnumber : activePermitId.owner.tinnumber} // Use `lastname` when editing
    onChange={(e) => setTinNumber(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isEditing ? representative : activePermitId?.owner?.representative || false}
                onChange={() => {
                  handleRepChange();
                                }}
                disabled={!isEditing} // Disable unless editing
              />
              Check if thru Representative
            </label>
          </div>
          <div className="form-group">
  <label>Representative Full Name:</label>
  <input
    type="text"
    value={isEditing ? repfullname : activePermitId.owner.representativedetails?.repfullname} // Use `lastname` when editing
    onChange={(e) => setRepFullName(e.target.value)}
    required
    disabled={!isEditing || !representative} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Representative Designation:</label>
  <input
    type="text"
    value={isEditing ? repdesignation : activePermitId.owner.representativedetails?.repdesignation} // Use `lastname` when editing
    onChange={(e) => setRepDesignation(e.target.value)}
    required
    disabled={!isEditing || !representative} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Representative Mobile Number:</label>
  <input
    type="text"
    value={isEditing ? repmobilenumber : activePermitId.owner.representativedetails?.repmobilenumber} // Use `lastname` when editing
    onChange={(e) => setRepMobileNumber(e.target.value)}
    required
    disabled={!isEditing || !representative} // Disable if not editing or is corporation
  />
</div>
<h1>Contact Details</h1>
<div className="form-group">
  <label>House/Bldg No./Blk and Lot:</label>
  <input
    type="text"
    value={isEditing ? houseandlot : activePermitId.owner.houseandlot} // Use `lastname` when editing
    onChange={(e) => setHouseandLot(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Building Name / Street Name:</label>
  <input
    type="text"
    value={isEditing ? buildingstreetname : activePermitId.owner.buildingstreetname} // Use `lastname` when editing
    onChange={(e) => setBuildingStreetName(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Subdivision / Compound Name:</label>
  <input
    type="text"
    value={isEditing ? subdivision : activePermitId.owner.subdivision} // Use `lastname` when editing
    onChange={(e) => setSubdivision(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Region:</label>
  <input
    type="text"
    value={isEditing ? region : activePermitId.owner.region} // Use `lastname` when editing
    onChange={(e) => setRegion(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Province:</label>
  <input
    type="text"
    value={isEditing ? province : activePermitId.owner.province} // Use `lastname` when editing
    onChange={(e) => setProvince(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Municipality:</label>
  <input
    type="text"
    value={isEditing ? municipality : activePermitId.owner.municipality} // Use `lastname` when editing
    onChange={(e) => setMunicipality(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Barangay:</label>
  <input
    type="text"
    value={isEditing ? barangay : activePermitId.owner.barangay} // Use `lastname` when editing
    onChange={(e) => setBarangay(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Telephone Number:</label>
  <input
    type="text"
    value={isEditing ? telephonenumber : activePermitId.owner.telephonenumber} // Use `lastname` when editing
    onChange={(e) => setTelephoneNumber(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Mobile Number:</label>
  <input
    type="text"
    value={isEditing ? mobilenumber : activePermitId.owner.mobilenumber} // Use `lastname` when editing
    onChange={(e) => setMobileNumber(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
<div className="form-group">
  <label>Email:</label>
  <input
    type="text"
    value={isEditing ? email : activePermitId.owner.email} // Use `lastname` when editing
    onChange={(e) => setEmail(e.target.value)}
    required
    disabled={!isEditing} // Disable if not editing or is corporation
  />
</div>
          
          {/* Additional fields */}
          <div>
              <div>
  <button onClick={isEditing ? handleeditsave : () => setIsEditing(true)}>
    {isEditing ? 'Save' : 'Edit'}
  </button>
  {isEditing && (
    <button onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>
      Cancel
    </button>
  )}
              </div>
            <button onClick={editcloseModal}>Close</button>
          </div>
        </div>
      </div>
           )}

{viewAttachmentsModal && activePermitId && (
  <div className="modal-overlay" onClick={closeViewAttachmentsModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p>Permit ID: {activePermitId._id}</p>

        {/* Document 1 */}
        <p>
          Document 1: {activePermitId.files.document1 || 'Not uploaded'}
        
          {activePermitId.files.document1 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(activePermitId.files.document1, 'uploads');
        setSelectedFiles((prev) => {
          // Toggle logic to ensure proper update
          const isFileSelected = prev.document1 === newFileUrl;
          return {
            ...prev,
            document1: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document1 ? 'Close' : 'View'}
    </button>
  )}

  {isEditingAttach && (
    <input type="file" onChange={(e) => handleFileChange(e, 'document1')} />
  )}

  <label>Remarks:</label>
  <input
    type="text"
    disabled={!isEditingAttach} // Disable if not editing or is corporation
  />
</p>

{renderFile(
  selectedFiles.document1 || (files.document1 && URL.createObjectURL(files.document1))
)}

        {/* Document 2 */}
        <p>
          Document 2: {activePermitId.files.document2 || 'Not uploaded'}
          {activePermitId.files.document2 && (
            <button
              onClick={() =>
                setSelectedFiles((prev) => ({
                  ...prev,
                  document2:
                  prev.document2 === null
                    ? fetchDocumentUrl(activePermitId.files.document2, 'uploads')
                    : null, // Toggle visibility by setting to null
                }))
              }
            >
               {selectedFiles.document2 ? 'Close' : 'View'}
            </button>
          )}
        </p>
        {renderFile(selectedFiles.document2)}

        {/* Document 3 */}
        <p>
          Document 3: {activePermitId.files.document3 || 'Not uploaded'}
          {activePermitId.files.document3 && (
            <button
              onClick={() =>
                setSelectedFiles((prev) => ({
                  ...prev,
                  document3:
                  prev.document3 === null
                    ? fetchDocumentUrl(activePermitId.files.document3, 'uploads')
                    : null, // Toggle visibility by setting to null
                }))
              }
            >
               {selectedFiles.document3 ? 'Close' : 'View'}
            </button>
          )}
        </p>
        {renderFile(selectedFiles.document3)}

        <p>
          Document 4: {activePermitId.files.document4 || 'Not uploaded'}
          {activePermitId.files.document4 && (
            <button
              onClick={() =>
                setSelectedFiles((prev) => ({
                  ...prev,
                  document4:
                    prev.document4 === null
                      ? fetchDocumentUrl(activePermitId.files.document4, 'uploads')
                      : null, // Toggle visibility by setting to null
                }))
              }
            >
              {selectedFiles.document4 ? 'Close' : 'View'}
            </button>
          )}
        </p>
        {renderFile(selectedFiles.document4)}
        <button onClick={isEditingAttach ? updateAttachments : () => setIsEditingAttach(true)}>
    {isEditingAttach ? 'Save' : 'Edit'}
  </button>
  {isEditingAttach && (
    <button onClick={handleCancelEditAttach} style={{ marginLeft: '10px' }}>
      Cancel
    </button>
  )}
        {/* Close Modal Button */}
        <button className="close-modal" onClick={closeViewAttachmentsModal}>
          Close
        </button>
      </div>
    </div>
      )}







      </div>
    </section>
  );
};

export default DataControllerForAssessmentBP;