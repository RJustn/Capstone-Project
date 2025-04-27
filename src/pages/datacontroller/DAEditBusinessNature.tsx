import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/NavigationBars/DAsidebar';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select'; 
import { businessNatureMap, businessNatureOptions } from "../components/Interface(Front-end)/BusinessNatureMap"; 
import {BusinessNatureOption, BusinessPermit} from "../components/Interface(Front-end)/Types";
import Swal from 'sweetalert2';

  export interface Businesses {
    _id?: string;
    businessNature: string;
    businessType: string;
    capitalInvestment: number;
    lastYearGross: number;
    }
    

const DataControllerEditBusinessNature: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('user'); // Initial state set to 'user'

    const handleTabClick = (tab: string) => {
        setActiveTab(tab); // Update active tab when clicked
    };
    const { id } = useParams<{ id: string }>(); // Extract work permit ID from URL
    const [businessPermit, setBusinessPermit] = useState<BusinessPermit | null>(null);
    const token = localStorage.getItem('token'); // Assuming the token is stored in local storage


     useEffect(() => {
        const checkAuth = async () => {
          try {
            const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-datacontroller', {
              method: 'GET',
              credentials: 'include',
            });
    
            if (response.status === 401) {
              console.error('Access denied: No token');
              navigate('/login');
              return;
            }
    
            if (response.status === 204) {
              console.log('Access Success');
              return;
            }
    
            console.error('Unexpected response status:', response.status);
          } catch (error) {
            console.error('Error fetching dashboard data:', error);
          }
        };
    
        checkAuth();
      }, [navigate]);

    useEffect(() => {
        const fetchBusinessPermitDetails = async () => {
            if (!token) {
                navigate('/'); // Redirect to login if no token
                return;
              } 
          try {
            console.log(id);
            const response = await axios.get(`https://capstone-project-backend-nu.vercel.app/datacontroller/businesspermitdetails/${id}`, {
  
            });
            setBusinessPermit(response.data as BusinessPermit); // Set the work permit details to state
          } catch (error) {
            console.error('Error fetching business permit details:', error);
         
          } }
    
          fetchBusinessPermitDetails(); // Call the fetch function
      }, [id, token, navigate]);

       useEffect(() => {
         if (businessPermit?.businesses) {
          setOriginalBusinesses(businessPermit.businesses);
          setBusinesses(businessPermit?.businesses || []);
        }
      }, [businessPermit]);

//File
const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: string | null }>({});

      const fetchDocumentUrl = (fileName: string | null, folder: 'uploads' | 'permits' | 'receipts'): string | null => {
        if (!fileName) return null;
        
        // Return the file URL based on the folder specified
        return `https://capstone-project-backend-nu.vercel.app/${folder}/${fileName}`;
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

  //Business Adding


// Handle change for businessNature dropdown
const handleDropdownChange = (selectedOption: BusinessNatureOption | null) => {
  setNewBusiness((prevState) => ({
    ...prevState,
    businessNature: selectedOption ? selectedOption.value : '',
  }));
};
  const [originalBusinesses, setOriginalBusinesses] = useState<Businesses[]>(businessPermit?.businesses || []);
  const [businesses, setBusinesses] = useState<Businesses[]>(businessPermit?.businesses || []);
  const [newBusiness, setNewBusiness] = useState<Businesses>({
    _id: '',
    businessNature: '',
    businessType: '',
    capitalInvestment: 0,
    lastYearGross: 0,
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBusiness((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (index: number) => {
    const updatedBusinesses = businesses.filter((_, i) => i !== index); // Remove the business at the specific index
    setBusinesses(updatedBusinesses); // Update the state with the new businesses list
  };

  const handleAddBusiness = () => {
    // Validate based on business type
    if (
      newBusiness.businessNature.trim() &&
      newBusiness.businessType.trim() &&
      (newBusiness.businessType === 'New'
        ? newBusiness.capitalInvestment > 0  // For "new", validate capitalInvestment
        : newBusiness.businessType === 'Renew' && newBusiness.lastYearGross > 0) // For "renew", validate lastYearGross
    ) {
      const newBusinessWithId = {
        ...newBusiness,
        _id: Date.now().toString(), // Temporary _id for local use
        capitalInvestment: newBusiness.capitalInvestment,  // Ensure this is treated as string
        lastYearGross: newBusiness.lastYearGross, // Store lastYearGross as string
      };
  
      // Add new business to the state
      setBusinesses([...businesses, newBusinessWithId]);
  
      // Reset input fields after adding
      setNewBusiness({
        _id: '',
        businessNature: '',
        businessType: '',
        capitalInvestment: 0,
        lastYearGross: 0,
      });
    } else {
      alert('Please provide valid inputs.');
    }
  };
  
 const handleSaveBusinessNature = async () => {
    if (!businessPermit) return;
  
    // Find deleted businesses
    const deletedBusinesses = originalBusinesses.filter(
      (original) => !businesses.some((current) => current._id === original._id)
    );
  
    // Businesses to update
    const busiesstoupdate = [...businesses];
  
    // Find added businesses
    const addedBusinesses = businesses.filter(
      (current) => !originalBusinesses.some((original) => original._id === current._id)
    );
  
    // Reset _id to undefined for new businesses
    addedBusinesses.forEach((business) => {
      business._id = undefined;
    });
  
    // Prepare data to send
    const updatedData = {
      businesses: addedBusinesses,
      deletedIds: deletedBusinesses.map((business) => business._id),
      businessesupdates: busiesstoupdate,
    };
  
    // Show loading SweetAlert
    Swal.fire({
      title: 'Updating Businesses...',
      text: 'Please wait while we process your request.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  
    try {
      const response = await axios.post(
        `https://capstone-project-backend-nu.vercel.app/datacontroller/updatebusinessnature/${businessPermit._id}`,
        updatedData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
  
      if (response.status === 200) {
        console.log(addedBusinesses);
  
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Update Successful!',
          text: 'Businesses have been successfully updated.',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.reload();
        });
      } else {
        console.error('Error updating businesses:', response.data.message);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: response.data.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating businesses. Please try again later.',
      });
    }
  };
  
  // Business Adding


  //Editing

  const [isEditing, setIsEditing] = useState(false);

  const handleCancelEdit = () => {
    setBusinesses(businessPermit?.businesses || []);
    setIsEditing(false);

  };

return (
    <section className="DAbody">
        <div className="DAsidebar-container">
        <DASidebar /> {/* Pass handleLogout to DASidebar */}
    </div>

    <div className="DAcontent">
            <header className='DAheader'>
                <h1>Online Business and Work Permit Licensing System</h1>
            </header>

             {/* Tabs */}
             <div className="tabs">
                <button 
                    className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
                    onClick={() => handleTabClick('user')}
                >
                    Edit Business Nature
                </button>
                <button 
                    className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
                    onClick={() => handleTabClick('business')}
                >
                    View Full Business Information
                </button>
                <button 
                    className={`tab-button ${activeTab === 'attachments' ? 'active' : ''}`}
                    onClick={() => handleTabClick('attachments')}
                >
                    Attachments
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'user' ? (
                    <div className="user-info">
                        <h2>Edit Business Nature</h2>
                        <p>For Application ID: <strong>{businessPermit?.id}</strong></p>
                        {/* Add your user information content here */}
          {businessPermit?.businesses && businessPermit.businesses.length > 0 ? (

            
            <div>
              <div>
                        <h1>List of Businesses</h1>
                         <button className="editbutton"onClick={isEditing ? handleSaveBusinessNature : () => setIsEditing(true)}>
    {isEditing ? 'Save' : 'Edit'}
  </button>
  
  {isEditing && (
    <button className="cancel-button" onClick={handleCancelEdit} style={{ marginLeft: '10px' }}>
      Cancel
    </button>
  )}

  <button className='editbutton' onClick={() => { window.location.href = `/DABusinessAssessment/${businessPermit?._id}`;}}>For Assessment</button>
                    
                        {isEditing && (
  <>
    <h2>Add a New Business</h2>
    <div style={{ marginBottom: '1rem' }}>
      <label>Business Nature:</label>
      <Select
        name="businessNature"
        placeholder="Business Nature"
        value={newBusiness.businessNature
          ? businessNatureOptions.find(
              (option) => option.value === newBusiness.businessNature
            )
          : null // Reset the value to null to show the placeholder
        }
        onChange={handleDropdownChange}
        options={businessNatureOptions}
      />
      <label>Business Type:</label>
      <select
        name="businessType"
        value={newBusiness.businessType || ""}
        onChange={handleInputChange}
        style={{ marginRight: '0.5rem' }}
      >
        <option value="" disabled>Select Type</option>
        <option value="New">New</option>
        <option value="Renew">Renew</option>
      </select>

      <div>
        {newBusiness.businessType === 'New' ? (
          <div>
            <label>Capital Investment:</label>
            <input
              type="number"
              name="capitalInvestment"
              placeholder="Capital Investment"
              value={newBusiness.capitalInvestment || ""}
              onChange={handleInputChange}
              style={{ marginRight: '0.5rem' }}
            />
          </div>
        ) : newBusiness.businessType === 'Renew' ? (
          <div>
            <label>Last Gross Sales:</label>
            <input
              type="number"
              name="lastYearGross"
              placeholder="Last Gross Sales"
              value={newBusiness.lastYearGross || ""}
              onChange={handleInputChange}
              style={{ marginRight: '0.5rem' }}
            />
          </div>
        ) : null}
      </div>
      <div className='mt-2'>
      <button className='mbtn btn-primary' onClick={handleAddBusiness}>Add Business</button>
      </div>
    </div>
  </>
)}

</div>
<div className='mt-2'>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Business Nature</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Capital Investment</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Gross Sales</th>
              {isEditing && (
  <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
)}
            </tr>
          </thead>
          <tbody>
  {businesses.map((business, index) => (
    <tr key={business._id}>
 <td style={{ border: '1px solid #ddd', padding: '8px' }}>
        {businessNatureMap[business.businessNature as keyof typeof businessNatureMap] || business.businessNature}
      </td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
        {business.businessType}
      </td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
        <input
          type="number"
          value={business.capitalInvestment || ""}
          disabled = {!isEditing}
          placeholder='---'
          onChange={(e) => {
            const updatedBusinesses = [...businesses];
            updatedBusinesses[index] = {
              ...business,
              capitalInvestment: parseFloat(e.target.value),
            };
            setBusinesses(updatedBusinesses); // Update the state
          }}
          style={{ width: '70%', padding: '4px', boxSizing: 'border-box' }}
        />
      </td>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
        <input
          type="number"
          value={business.lastYearGross || ""}
          disabled = {!isEditing}
          placeholder='---'
          onChange={(e) => {
            const updatedBusinesses = [...businesses];
            updatedBusinesses[index] = {
              ...business,
              lastYearGross: parseFloat(e.target.value),
            };
            setBusinesses(updatedBusinesses); // Update the state
          }}
          style={{ width: '70%', padding: '4px', boxSizing: 'border-box' }}
        />
      </td>
      {isEditing && (
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
      <button
          onClick={() => handleDelete(index)}
          style={{
            padding: '4px 8px',
            marginLeft: '8px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
        </td>
      )}
    </tr>
  ))}
</tbody>
        </table>
        </div>
        </div>
      ) : (
        <div className="error-message mt-3">
        <p style={{ color: "blue", textAlign: "center", fontSize: "16px" }}>
        No business to display
        </p>
      </div>
      )}  
                        <p>{/* User Info content */}</p>
                    </div>
                ) : activeTab === 'business' ? (
                    <div className="business-info">
                        <h2>Business Information</h2>
                        {/* Add your business information content here */}
                        {businessPermit?.businesses && businessPermit.businesses.length > 0 ? (   
                          <div>
                    

                        <div className="form-group">
                  <label>Business Name:</label>
                  <input type="text" value={businessPermit?.business.businessname} disabled/>
                </div>
                <div className="form-group">
                  <label>Business Scale:</label>
                  <select
                    value={businessPermit?.business.businessscale}
              
                    className="form-control view-only"
                 
                  
                    disabled
                    
                  >
                    <option value="" disabled>Select Business Scale</option>
                    <option value="Micro">Micro (Not more than 3M or Having 1-9 Employees)</option>
                    <option value="Small">Small (3M - 15M or Having 10-99 Employees)</option>
                    <option value="Medium">Medium (15M - 100M or Having 100-199 Employees)</option>
                    <option value="Large">Large (more than 100M or Asset size of more than 100M)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Mode:</label>
                  <select
                    value={businessPermit?.business.paymentmethod}
                    className="form-control"
                    disabled
                  >
                    <option value="" disabled>Select Payment Method</option>
                    <option value="Annual">Annual</option>
                    <option value="Semi-Annual">Semi-Annual</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
                <h2>Buisness Contact Information</h2>
                <div className="form-group">
                  <label>House/Bldg No./Blk and Lot:</label>
                  <input type="text" disabled value={businessPermit?.business.businessbuildingblocklot} />
                </div>
                <div className="form-group">
                  <label>Building Name/Street Name:</label>
                  <input type="text" disabled value={businessPermit?.business.businessbuildingname} />
                </div>
                <div className="form-group">
                  <label>Subdivision/Compound Name:</label>
                  <input type="text" disabled value={businessPermit?.business.businesssubcompname}   />
                </div>
                <div className="form-group">
                  <label>Region:</label>
                  <input type="text"  disabled value={businessPermit?.business.businessregion} />
                </div>
                <div className="form-group">
                  <label>Province:</label>
                  <input type="text"  disabled value={businessPermit?.business.businessprovince} />
                </div>
                <div className="form-group">
                  <label>City/Municipality:</label>
                  <input type="text"  disabled value={businessPermit?.business.businessmunicipality} />
                </div>
                <div className="form-group">
                  <label>Barangay:</label>
                  <input type="text" disabled value={businessPermit?.business.businessbarangay} />
                </div>

                <div className="form-group">
                  <label>Zip:</label>
                  <input type="text" disabled value={businessPermit?.business.businesszip} />
                </div>
                <div className="form-group">
                  <label>Contact Number:</label>
                  <input type="text" disabled value={businessPermit?.business.businesscontactnumber} />


                </div>
                <h2>Necessities Information</h2>
                <div className="form-group">
                  <label>Ownership Type:</label>
                  <select
                    disabled 
                    value={businessPermit?.business.ownershiptype}
                    className="form-control"
                  >
                    <option value="" disabled>Select Ownership Type</option>
                    <option value="COOP">Cooperative</option>
                    <option value="CORP">Corporation</option>
                    <option value="INST">Institutional</option>
                    <option value="PART">Partnership</option>
                    <option value="SOLE">Sole Person</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Agency Registered No:</label>
                  <input type="text" disabled value={businessPermit?.business.agencyregistered} />
                </div>
                <div className="form-group">
                  <label>DTI Registration No:</label>
                  <input
                    type="text"
                    disabled value={businessPermit?.business.dtiregistrationnum}

                
                  />
                </div>
                <div className="form-group">
                  <label>DTI Registration Date:</label>
                  <input type="date" disabled value={businessPermit?.business.dtiregistrationdate}/>
                </div>
                <div className="form-group">
                  <label>DTI Expiration Date:</label>
                  <input type="date"  disabled value={businessPermit?.business.dtiregistrationexpdate} />
                </div>
                <div className="form-group">
                  <label>SEC Registration No:</label>
                  <input type="text"  disabled value={businessPermit?.business.secregistrationnum} />
                </div>
                <div className="form-group">
                  <label>BIR Registration No:</label>
                  <input type="text" disabled value={businessPermit?.business.birregistrationnum}  />
                </div>
                <div className="form-group">
                  <label>Industry Sector:</label>
                  <select
                    disabled 
                    value={businessPermit?.business.industrysector}
                   
                    className="form-control"
                    
                  >
                    <option value="EL">Electronic</option>
                    <option value="CN">Construction</option>
                    <option value="GM">Garments</option>
                    <option value="CH">Chemical</option>
                    <option value="MT">Metal</option>
                    <option value="PL">Plastic</option>
                    <option value="AL">Aluminum</option>
                    <option value="BLB">Bulb</option>
                    <option value="FP">Food Processing</option>
                    <option value="LPG">LPG</option>
                    <option value="CR">Ceramics</option>
                    <option value="HT">Hatchery</option>
                    <option value="BC">Batching</option>
                    <option value="RF">Refinery</option>
                    <option value="PR">Printing</option>
                    <option value="P">Paper</option>
                    <option value="CT">Concrete</option>
                    <option value="FRN">Furniture</option>
                    <option value="RL">Realty</option>
                    <option value="TRD">Trading</option>
                    <option value="SVC">Services</option>
                    <option value="INS">Institutional</option>
                    <option value="AMU">Amusement</option>
                    <option value="RS">Repair Shop</option>
                    <option value="BNK">Bank</option>
                    <option value="FL">Financing/Lending</option>
                    <option value="LS">Lease</option>
                    <option value="DEV">Developer</option>
                    <option value="MC">Medical Clinic</option>
                    <option value="LC">Laboratory Clinic</option>
                    <option value="MPS">Manpower Supply</option>
                    <option value="GRY">Grocery</option>
                    <option value="SSS">Sari-Sari Store</option>
                    <option value="LSR">Lessor</option>
                    <option value="PP">Power Plants</option>
                    <option value="RFN">Refineries</option>
                    <option value="PTC">Petrochemicals</option>
                    <option value="EPD">Electric Power Distributor</option>
                    <option value="TC">Telecommunication Company</option>
                    <option value="MLR">Millers</option>
                    <option value="MFR">Manufacturer</option>
                    <option value="EXP">Exporters</option>
                    <option value="IMP">Importers</option>
                    <option value="RTL">Retailer</option>
                    <option value="CTR">Contractor</option>
                    <option value="FDS">Food Services</option>
                    <option value="PF">Poultry Farm</option>
                    <option value="PGY">Piggery</option>
                    <option value="CMT">Cemetery</option>
                    <option value="COP">Cooperative</option>
                    <option value="JS">Junkshop</option>
                    <option value="CTN">Canteen</option>
                    <option value="BSL">Beauty Salon</option>
                    <option value="FF">Frozen Foods</option>
                    <option value="DG">Dry Goods</option>
                    <option value="PN">Party Needs</option>
                    <option value="WS">Water Station</option>
                    <option value="GFS">Gift Shop</option>
                    <option value="VLS">Vulcanizing Shop</option>
                    <option value="BKY">Bakery</option>
                    <option value="TLR">Tailoring</option>
                    <option value="IA">Insurance Agency</option>
                    <option value="ENT">Enterprises</option>
                    <option value="HCS">Hardware Construction Supply</option>
                    <option value="CP">Coconut Processor</option>
                    <option value="CS">Computer Shop</option>
                    <option value="LO">Lotto Outlet</option>
                    <option value="GBR">Gowns and Barong Rentals</option>
                    <option value="BR">Beach Resort</option>
                    <option value="RST">Restaurant</option>
                    <option value="GSW">Glassware</option>
                    <option value="FDC">Firework Display Center</option>
                    <option value="FST">Food Stand</option>
                    <option value="RP">Refreshment Parlor</option>
                    <option value="FC">Food Cart</option>
                    <option value="AF">Agricultural Farm</option>
                    <option value="SFO">Steel Fabrication and Oxygen/Acetylene Plant</option>
                    <option value="TRKS">Trucking Services</option>
                    <option value="ES">Electrical Supplies</option>
                    <option value="RSV">Roofing Services</option>
                    <option value="HSP">Hospital</option>
                    <option value="CNS">Cable Network System</option>
                    <option value="CRS">Cellphone Repair Shop</option>
                    <option value="MPA">Motorcycle Parts and Accessories</option>
                    <option value="TT">Travel and Tours</option>
                    <option value="LDH">Lodging House</option>
                    <option value="SA">Security Agency</option>
                    <option value="RWS">Repair and Welding Shop</option>
                    <option value="SRS">Shoe Repair Shop</option>
                    <option value="PHS">Photographic Studio</option>
                    <option value="RCP">Recapping Shop</option>
                    <option value="BSP">Barber Shop</option>
                    <option value="BPR">Beauty Parlor</option>
                    <option value="FPS">Funeral Parlor and Services</option>
                    <option value="FSH">Furniture Shop</option>
                    <option value="MASC">Massage Clinic</option>
                    <option value="RFDS">Rice and Feeds Supply</option>
                    <option value="MST">Meat Stand</option>
                    <option value="EMS">Events Management Services</option>
                    <option value="DC">Dental Clinic</option>
                    <option value="RR">Rice Retailer</option>
                    <option value="SS">School Supplies</option>
                    <option value="DFR">Dried Fish Retailer</option>
                    <option value="ER">Egg Retailer</option>
                    <option value="EAT">Eatery</option>
                    <option value="GMC">General Merchandise</option>
                    <option value="FW">Footwear</option>
                    <option value="FV">Fruits and Vegetables Stand</option>
                    <option value="CTS">Catering Services</option>
                    <option value="CMS">Consultancy Marketing Services</option>
                    <option value="FS">Feeds Supply</option>
                    <option value="FRW">Fireworks Retailer</option>
                    <option value="MP">Motorcycle Parts</option>
                    <option value="BS">Bike Shop</option>
                    <option value="VSP">Veterinary Supply</option>
                    <option value="FSTN">Food Stand (Night Market)</option>
                    <option value="TNEC">Trading of Non-Essential Commodities</option>
                    <option value="HR">Hotel and Rental</option>
                    <option value="CRD">Carinderia</option>
                    <option value="ARS">Auto Repair Shop</option>
                    <option value="STF">Storage Tank Facility</option>
                    <option value="AS">Auto Supply</option>
                    <option value="OE">Office Equipment</option>
                    <option value="SOS">School and Office Supplies</option>
                    <option value="PGF">Piggery Farm</option>
                    <option value="HBM">Hollow Block Making</option>
                    <option value="CHBM">CHB Manufacturing</option>
                    <option value="CSUP">Construction and Supply</option>
                    <option value="FSUP">Fishing Supply</option>
                    <option value="BDC">Bridal Collection</option>
                    <option value="MSC">Massage and Spa Center</option>
                    <option value="IR">In-Land Resort</option>
                    <option value="COD">Cooking Oil Dealer</option>
                    <option value="NP">Native Products</option>
                    <option value="MD">Motorcycle Dealer</option>
                    <option value="FV2">Fruits and Vegetables</option>
                    <option value="EPS">Electronic Parts and Supply</option>
                    <option value="WRS">Water Refilling Station</option>
                    <option value="CA">Cellphone and Accessories</option>
                    <option value="PH">Pharmacy</option>
                    <option value="SHF">Sash Factory</option>
                    <option value="FS2">Funeral Services</option>
                    <option value="CPG">Cockpit Personnel - Gaffer</option>
                    <option value="MM">Minimart</option>
                    <option value="NSNP">Non-Stock/Non-Profit</option>
                    <option value="BH">Burger House</option>
                    <option value="DGS">Drugstore</option>
                    <option value="OS">Office Supply</option>
                    <option value="JRS">Jewelry and Repair Shop</option>
                    <option value="GS">Gas Station</option>
                    <option value="PS">Port Services</option>
                    <option value="EI">Educational Institution</option>
                    <option value="ELTS">Electronic Services</option>
                    <option value="BT">Bet Taker</option>
                    <option value="PDT">Petroleum Depot and Terminal</option>
                    <option value="SSIE">Seaport Services and Industrial Estate Developer</option>
                    <option value="ETC">Emission Testing Center</option>
                    <option value="CRR">Car Rental</option>
                    <option value="PD">Petroleum Depot</option>
                    <option value="BAS">Bakery Supply</option>
                    <option value="GAF">Gaffer</option>
                    <option value="BKS">Banking Services</option>
                    <option value="BTM">Bet Manager</option>
                    <option value="FS3">Flower Shop</option>
                    <option value="CSP">Catering Services and Party Needs </option>
                    <option value="PS2">Pawnshop</option>
                    <option value="M">Medicator</option>
                    <option value="GAS">Glass and Aluminum Supply</option>
                    <option value="CKA">Cockpit Arena</option>
                    <option value="FCL">Furniture and Coco Lumber</option>
                    <option value="LWO">Law Office</option>
                    <option value="RFS">Rice and Fertilizer Supply</option>
                    <option value="MANS">Manpower Services</option>
                    <option value="IC">Internet Cafe</option>
                    <option value="TS">Trading and Services</option>
                    <option value="LH">Lomi House</option>
                    <option value="BK">Banking</option>
                    <option value="RTW2">RTW</option>
                    <option value="A">Appliances</option>
                    <option value="TGBS">Tugboat Services</option>
                    <option value="FNI">Financial Institution</option>
                    <option value="MLA">Med. Lab./Scientific Apparatus/Microscope/Anatomical Models, Equipment Supplies</option>
                    <option value="MSH">Meat Shop</option>
                    <option value="CGS">Construction and General Services</option>
                    <option value="SH">Slaughter House</option>
                    <option value="R">Resort</option>
                    <option value="TRS">Tire and Retreading Services</option>
                    <option value="L">Lending</option>
                    <option value="LIC">Lying-in Clinic</option>
                    <option value="AM">Alcohol Manufacturing</option>
                    <option value="RW">Retailer/Wholesaler</option>
                    <option value="DPS">Digital Printing Services</option>
                    <option value="RDI">Retailer of Disposable Items</option>
                    <option value="PSMR">Pawnshop, Money Remittance, E-Loading, Money Changer</option>
                    <option value="ICM">Ice Cream Maker</option>
                    <option value="CC">Cold Cuts</option>
                    <option value="DS">Department Store</option>
                    <option value="PBB">Photocopying and Book Binding</option>
                    <option value="CG">Cereal and Grains</option>
                    <option value="PSGM">Pawnshop/Kwarta Padala/General Merchandise/Money Changer</option>
                    <option value="GLM">Gloves Manufacturing</option>
                    <option value="BRDS">Bread Store</option>
                    <option value="GWGS">Glassware and Gift Shop</option>
                    <option value="WR">Wholesaler/Retailer</option>
                    <option value="RE">Real Estate</option>
                    <option value="PPO">Power Plant Operator</option>
                    <option value="MRCB">Money Remittance/Courier Cargo/Bills Payment and Ticketing Services</option>
                    <option value="AAS">Auto Aircon Services</option>
                    <option value="FI2">Financing Institution</option>
                    <option value="TSP">T-Shirt Printing</option>
                    <option value="MPKS">Memorial Park Services</option>
                    <option value="PG">Power Generation</option>
                    <option value="PSMSA">Pawnshop, Money Transfer, and Other Service Activities</option>
                    <option value="CVS">Convenience Store</option>
                    <option value="DPC">Digital Printing Clothing</option>
                    <option value="ASS">Association</option>
                    <option value="JWRS">Jewelry Repair Shop</option>
                    <option value="AGS">Agricultural Supply</option>
                    <option value="AWS">Autoworks and Vulcanizing Shop</option>
                    <option value="TRC">Training Center</option>
                    <option value="FR">Feeds Retailer</option>
                    <option value="CPA">Cellphone Accessories</option>
                    <option value="VAC">Visa Assistance/Consultancy</option>
                    <option value="IGM">Industrial Gas Manufacturing</option>
                    <option value="GFF">Game Fowl Farm</option>
                    <option value="LNDS">Laundry Shop</option>
                    <option value="CAP">Candies and Pasalubong</option>
                    <option value="LR">Lechon Retailer</option>
                    <option value="IRT">Ice Retailer</option>
                    <option value="SPOS">Sports Officiating Services</option>
                    <option value="CF">Cooked Food</option>
                    <option value="TCN">Tiles Center</option>
                    <option value="DGW">Dry Goods and Glassware</option>
                    <option value="RPH">Retailer of Pharmaceutical, Medical, Cosmetics, and Toilet Articles</option>
                    <option value="BP">Beauty Products</option>
                    <option value="HS">Hauling Services</option>
                    <option value="PC">Paint Center</option>
                    <option value="ERS">Electronics Repair Shop</option>
                    <option value="PPF">Piggery and Poultry Farm</option>
                    <option value="VFS">Veterinary and Feeds Supply</option>
                    <option value="FA">Footwear and Accessories</option>
                    <option value="CGH">Cargo Handling</option>
                    <option value="MSSS">Meat Shop and Sari-Sari Store</option>
                    <option value="CPSS">Coconut Processor and Sari-Sari Store</option>
                    <option value="CARS">Cellphone Accessories and Repair Shop</option>
                    <option value="SSE">Sari-Sari Store and Eatery</option>
                    <option value="OC">Optical Clinic</option>
                    <option value="FG">Food Store/Grocery</option>
                    <option value="BPMRS">Bills Payment and Money Remittance Services</option>
                    <option value="PLS">Poultry Supply</option>
                    <option value="BATM">Banking/ATM Machine</option>
                    <option value="EC">Electric Cooperative</option>
                    <option value="N">Nursery</option>
                    <option value="STS">Stevedoring Services</option>
                    <option value="CSC">Contractor (Supplier of Coal)</option>
                    <option value="RH">Retreat House</option>
                    <option value="CW">Car Wash</option>
                    <option value="LD">LPG Depot</option>
                    <option value="MRBC">Money Remittance/Bayad Center/Ticketing/E-Load/PA Insurance/Money Changer/Foreign Exchange Dealer</option>
                    <option value="CCS">CCTV and Computer Supplies</option>
                    <option value="LA">Legal Activities</option>
                    <option value="DIIS">Distributor of Industrial Iodized Salt</option>
                    <option value="W">Warehouse</option>
                    <option value="DF">Dragon Fruit Farm</option>
                    <option value="FRFW">Freight Forwarder</option>
                    <option value="FCNM">Food Cart (Night Market)</option>
                    <option value="ESI">Electrical Supply and Installation</option>
                    <option value="PCS">Pest Control Services</option>
                    <option value="MTS">Management and Technical Services</option>
                    <option value="CD">Chemical Depot</option>
                    <option value="SRM">Storage of Raw Materials for Surfactants (Linear Alkyl Benzene)</option>
                    <option value="PED">Peddler (Selling Dry Goods)</option>
                    <option value="BGS">Burger Stand</option>
                    <option value="SP">Sugarcane Planters</option>
                    <option value="TRNS">Transport Services</option>
                    <option value="VCGC">Veterinary Clinic and Grooming Center</option>
                    <option value="HAA">Hawker (Accessories)</option>
                    <option value="HA8">Hawker (Dry Goods) 8 sq. m.</option>
                    <option value="HAF88">Hawker (Footwear) 8.8 sq. m.</option>
                    <option value="HA85">Hawker (Dry Goods) 8.5 sq. m.</option>
                    <option value="HA575">Hawker (Dry Goods) 5.75 sq. m.</option>
                    <option value="HA4">Hawker (Dry Goods) 4 sq. m.</option>
                    <option value="HA3">Hawker (Dry Goods) 3 sq. m.</option>
                    <option value="HA7">Hawker (Dry Goods) 7 sq. m.</option>
                    <option value="HAF2">Hawker (Dried Fish) 2 sq. m.</option>
                    <option value="RED">Real Estate Developer</option>
                    <option value="HAG525">Hawker (Glassware) 5.25 sq. m.</option>
                    <option value="HA6S">Hawker (Dry Goods) 6 sq. m.</option>
                    <option value="HAA5">Hawker (Accessories) 5 sq. m.</option>
                    <option value="SWO">Social Work Without Accommodation</option>
                    <option value="HPR">Health Product Retailer</option>
                    <option value="WSF">Warehousing/Storage Facility</option>
                    <option value="MS">Medical Supply</option>
                    <option value="CFMT">Construction and Fabrication of Mild Steel Vertical Storage Tank</option>
                    <option value="SSA">Storage of Sulfuric Acid</option>
                    <option value="PLBS">Plumbing Services</option>
                    <option value="PBL">Publishing</option>
                    <option value="HAAF4">Hawker (Aquatic Fish) 4 sq. m.</option>
                    <option value="HAA2">Hawker (Accessories) 2 sq. m.</option>
                    <option value="HAF13">Hawker (Footwear) 13 sq. m.</option>
                    <option value="HAA6">Hawker (Accessories) 6 sq. m.</option>
                    <option value="HA125">Hawker (Dry Goods) 12.5 sq. m.</option>
                    <option value="CEWS">Civil Engineering Works Services</option>
                    <option value="ACRS">Aircon Repair Shop</option>
                    <option value="HA42">Hawker (Dry Goods) 4.2 sq. m.</option>
                    <option value="TRPS">Transportation Services</option>
                    <option value="HA245">Hawker (Dry Goods) 24.5 sq. m.</option>
                    <option value="PZP">Pizza Parlor</option>
                    <option value="HA9">Hawker (Dry Goods) 9 sq. m.</option>
                    <option value="GASAW">Glass and Aluminum Supply and Steel Works</option>
                    <option value="FVSNM">Fruits and Vegetables Stand (Night Market)</option>
                    <option value="MTBP">Money Transfer/Bills Payment</option>
                    <option value="PSTC">Pest Control</option>
                    <option value="CWT">Construction of Water Tank</option>
                    <option value="RRC">Sale/Retail/Oven Roasted Chicken</option>
                    <option value="MRMC">Money Remittance/Money Changer</option>
                    <option value="RENES">Retailer of Essential, Non-Essential, Cigarette, Liquor, Drugstore, Refreshment</option>
                    <option value="BCTM">Bayad Center/Ticketing/Money Changer/Money Remittance</option>
                    <option value="CSPN">Computer Shop (Piso Net)</option>
                    <option value="TPS">Trading and Pest Control Services</option>
                    <option value="MTLS">Money Transfer/Loading Station</option>
                    <option value="PNDT">Plant Non-Destructive Testing</option>
                    <option value="SBPR">Sante Barley Product Retailer</option>
                    <option value="T2CS">Tower for Two Cell Sites</option>
                    <option value="PMSCPP">PMS Contractor for Power Plants</option>
                    <option value="CTST">Contractor (Sharpening Tools)</option>
                    <option value="HER">Heavy Equipment Rentals</option>
                    <option value="CFNM">Cooked Food (Night Market)</option>
                    <option value="PSMTFE">Pawnshop/Money Transfer/Foreign Exchange Dealing/Other Service Activities</option>
                    <option value="CPC">Cockpit Personnel/Cashier</option>
                    <option value="FXD">Foreign Exchange Dealer/Money Remittance/Money Changer/Ticketing/Bayad Center/E-Load/PA Insurance/DepED/Pension Loan</option>
                    <option value="CSH">Cashier</option>
                    <option value="APC">Atchara Processing Center</option>
                    <option value="PM">Pit Manager</option>
                    <option value="PRT">Promoter</option>
                    <option value="CPR">Cockpit Personnel - Referee</option>
                    <option value="TF">Temporary Facility</option>
                    <option value="DGCP">Dry Goods and Cosmetic Products</option>
                    <option value="DT">Depot (Terminaling)</option>
                    <option value="APIS">All Types of Paint, Industrial Services</option>
                    <option value="PRWC">Prawn Culture</option>
                    <option value="BKKS">Bookkeeping Services</option>
                    <option value="CSER">Construction Services</option>
                    <option value="INKR">Ink Retailer</option>
                    <option value="FER">Fire Extinguisher Retailer</option>
                    <option value="LPGP">LPG Refilling Plant</option>
                    <option value="LPR">LPG Retailer</option>
                    <option value="EWS">Engineering Works Services</option>
                    <option value="DMC">Dealer - Motorcycle</option>
                    <option value="D">Distributor</option>
                    <option value="EXEMPT">EXEMPTED</option>
                    <option value="PRVS">Private School</option>
                    <option value="PRVM">Private Market</option>
                    <option value="PUBM">Public Market</option>
                    <option value="ML">Mall</option>
                    <option value="SPM">Supermarket</option>

                  </select>
                </div>
                <div className="form-group">
                  <label>Business Operation:</label>
                  <select
                    disabled
                     value={businessPermit?.business.businessoperation}
                   
                    className="form-control"
                
                  >
                    <option value="Daytime">DAYTIME</option>
                    <option value="Nightshift">NIGHTSHIFT</option>
                    <option value="Day&Night">BOTH DAY AND NIGHT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Business Type:</label>
                  <select
                    disabled 
                    value={businessPermit?.business.typeofbusiness}
                
                    className="form-control"
                    
                  >
                    <option value="Main">MAIN</option>
                    <option value="Franchise">FRANCHISE</option>
                    <option value="Branch">BRANCH</option>
                  </select>
                </div>
                </div>
                 ) : (
                  <div className="error-message mt-3">
                  <p style={{ color: "blue", textAlign: "center", fontSize: "16px" }}>
                  No business to display
                  </p>
                </div>
                )}  
                        <p>{/* Business Info content */}</p>
                    </div>
                ) : activeTab === 'attachments' ? (
                    <div className="attachments-info">
                        <h2>Attachments</h2>
                        {/* Add your attachments content here */}
                        {businessPermit?.businesses && businessPermit.businesses.length > 0 ? (   
                          <div>
                        {/* Document 1 */}
<p>
{businessPermit.classification === 'RenewBusiness' ? (
    <span>BIR: </span>
  ) : (
    <span>DTI / SEC / CDA: </span>
  )}
  {businessPermit?.files.document1 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document1, 'uploads');
        setSelectedFiles((prev) => {
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

</p>

{renderFile( selectedFiles.document1)}

{/* Document 2 */}
<p>
{businessPermit?.classification === 'RenewBusiness' ? (
    <span>Past Business Permit Copy: </span>
  ) : (
    <span>Occupancy Permit:</span>
  )}

  {businessPermit?.files.document2 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document2, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document2 === newFileUrl;
          return {
            ...prev,
            document2: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document2 ? 'Close' : 'View'}
    </button>
  )}
</p>
{renderFile(selectedFiles.document2)}


{/* Document 3 */}
<p>
{businessPermit?.classification === 'RenewBusiness' ? (
    <span>Certification of Gross Sales: </span>
  ) : (
    <span>Lease Contract (if rented) / Tax Declaration (If Owned): </span>
  )}

  {businessPermit?.files.document3 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document3, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document3 === newFileUrl;
          return {
            ...prev,
            document3: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document3 ? 'Close' : 'View'}
    </button>
  )}
</p>

{renderFile(selectedFiles.document3)}

{businessPermit?.classification !== 'RenewBusiness' && (
    <div>
{/* Document 4 */}
<p>

    <span>Authorization Letter / S.P.A. / Board Resolution / Secretary's Certificate (if thru representative): </span>


  {businessPermit?.files.document4 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document4, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document4 === newFileUrl;
          return {
            ...prev,
            document4: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document4 ? 'Close' : 'View'}
    </button>
  )}
</p>

{renderFile(selectedFiles.document4)}

{/* Document 5 */}
<p>

    <span>Owner's ID: </span>
 
  {businessPermit?.files.document5 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document5, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document5 === newFileUrl;
          return {
            ...prev,
            document5: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document5 ? 'Close' : 'View'}
    </button>
  )}
</p>

{renderFile( selectedFiles.document5)}

{/* Document 6 */}
<p>

    <span>Picture of Establishment (Perspective View): </span>

  {businessPermit?.files.document6 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document6, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document6 === newFileUrl;
          return {
            ...prev,
            document6: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document6 ? 'Close' : 'View'}
    </button>
  )}
</p>

{renderFile(selectedFiles.document6)}

{/* Document 7 */}
<p>

    <span>Zoning: </span>
  

{businessPermit?.files.document7 && (
    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document7, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document7 === newFileUrl;
          return {
            ...prev,
            document7: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document7 ? 'Close' : 'View'}
    </button>
  )}

</p>
{renderFile(selectedFiles.document7)}

{businessPermit?.classification !== 'RenewBusiness' && (
  <div>
    {/* Document 8 */}
    <p>
    Office of the Building Official:

    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document8, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document8 === newFileUrl;
          return {
            ...prev,
            document8: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document8 ? 'Close' : 'View'}
    </button>
    </p>
    {renderFile(selectedFiles.document8)}

{/* Document 9 */}
<p>
City Health Office:

    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document9, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document9 === newFileUrl;
          return {
            ...prev,
            document9: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document9 ? 'Close' : 'View'}
    </button>
    </p>
    {renderFile(selectedFiles.document9)}

    {/* Document 10 */}
    <p>
    Bureau of Fire Protection:

    <button
      onClick={() => {
        const newFileUrl = fetchDocumentUrl(businessPermit?.files.document10, 'uploads');
        setSelectedFiles((prev) => {
          const isFileSelected = prev.document10 === newFileUrl;
          return {
            ...prev,
            document10: isFileSelected ? null : newFileUrl, // Toggle visibility based on the URL
          };
        });
      }}
    >
      {selectedFiles.document10 ? 'Close' : 'View'}
    </button>
    </p>
    {renderFile(selectedFiles.document10)}
    </div>
  )}
    </div>
)}
                        <p>{/* Attachments content */}</p>
                    </div>
                ) : null}
                                </div>
                 ) : (
                  <div className="error-message mt-3">
                  <p style={{ color: "blue", textAlign: "center", fontSize: "16px" }}>
                  No business to display
                  </p>
                </div>
                )}  
            </div>
            
        </div>
    </section>
);

};

export default DataControllerEditBusinessNature;