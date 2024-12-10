import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ClientStyles.css';
import ClientSideBar from '../components/ClientSideBar';
import MapLocation from '../components/MapLocation';



  
  
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
      applicationdateIssued?: string;
      applicationComments?: string;
    
      owner: Owner;
      business: Business;
      otherbusinessinfo: OtherBusiness;
      mapview: MapView;
      businesses: Businesses[];
      files: Files;
      department: Department;
    
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
  
    export interface Businesses {
      _id?: string;
      businessNature: string;
      businessType: string;
      capitalInvestment: number;
      lastYearGross: number;
      }



const BusinessPermitRenew: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Extract work permit ID from URL
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
        const response = await axios.get(`http://localhost:3000/client/businesspermitdetails/${id}`, {
          headers: { },
          withCredentials: true, 

        });
        setBusinessPermit(response.data as BusinessPermit); // Set the work permit details to state
      } catch (error) {
        console.error('Error fetching work permit details:', error);
     
      } }

      fetchBusinessPermitDetails(); // Call the fetch function

  }, [id, token, navigate]);

  useEffect(() => {
    console.log(businessPermit); // This will log the updated workPermit when it changes
  }, [businessPermit]); // Dependency array ensures it runs when workPermit updates

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

//Form and Data Display
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
    //Step 2
    const [businessname, setBusinessName] = useState('');
    const [businessscale, setBusinessScale] = useState('');
    const [paymentmethod, setPaymentMethod] = useState('');
    const [businessbuildingblocklot, setBusinessBuildingBlockLot] = useState('');
    const [businessbuildingname, setBusinessBuildingName] = useState('');
    const [businesssubcompname, setBusinessSubCompName] = useState('');
    const [businessregion, setBusinessRegion] = useState('REGION IV-A (CALABARZON)');
    const [businessprovince, setBusinessProvince] = useState('CAVITE');
    const [businessmunicipality, setBusinessMunicipality] = useState('CITY OF DASMARIÑAS');
    const [businessbarangay, setbusinessBarangay] = useState('');
    const [businesszip, setBusinessZip] = useState('4114');
    const [businesscontactnumber, setBusinessContactNumber] = useState('');
    const [ownershiptype, setOwnershipType] = useState('');
    const [agencyregistered, setAgencyRegistered] = useState('');
    const [dtiregistrationnum, setDTIRegistrationNum] = useState('');
    const [dtiregistrationdate, setDTIRegistrationDate] = useState('');
    const [dtiregistrationexpdate, setDTIRegistrationExpDate] = useState('');
    const [secregistrationnum, setSECRegistrationNum] = useState('');
    const [birregistrationnum, setBIRRegistrationNum] = useState('');
    const [industrysector, setIndustrySector] = useState('');
    const [businessoperation, setBusinessOperation] = useState('');
    const [typeofbusiness, setTypeofBusiness] = useState('');
    //Step 3
    const [dateestablished, setDateEstablished] = useState('');
    const [startdate, setStartDate] = useState('');
    const [occupancy, setOccupancy] = useState('');
    const [otherbusinesstype, setOtherBusinessType] = useState('');
    const [businessemail, setBusinessEmail] = useState('');
    const [businessarea, setBusinessArea] = useState('');
    const [businesslotarea, setBusinessLotArea] = useState('');
    const [numofworkermale, setNumofWorkerMale] = useState('');
    const [numofworkerfemale, setNumofWorkerFemale] = useState('');
    const [numofworkertotal, setNumofWorkerTotal] = useState(0);
    const [numofworkerlgu, setNumofWorkerLGU] = useState('');
    const [lessorfullname, setLessorFullName] = useState('');
    const [lessormobilenumber, setLessorMobileNumber] = useState('');
    const [monthlyrent, setMonthlyRent] = useState('');
    const [lessorfulladdress, setLessorFullAddress] = useState('');
    const [lessoremailaddress, setLessorEmailAddress] = useState('');
    //Step 4
    const [lat, setLat] = useState<number>(14.326248);
    const [lng, setLng] = useState<number>(120.935973);
    //Step 5
  
    //Step 6
    // const [files, setFiles] = useState<{
    //   document1: File | null;
    //   document2: File | null;
    //   document3: File | null;
    //   document4: File | null;
    //   document5: File | null;
    //   document6: File | null;
    // }>({
    //   document1: null,
    //   document2: null,
    //   document3: null,
    //   document4: null,
    //   document5: null,
    //   document6: null,
    // });

    const handleMaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const male = parseInt(e.target.value) || 0; // Convert to number or default to 0
        setNumofWorkerMale(e.target.value); // Update male workers
        setNumofWorkerTotal(male + (parseInt(numofworkerfemale) || 0)); // Update total
      };
    
      const handleFemaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const female = parseInt(e.target.value) || 0; // Convert to number or default to 0
        setNumofWorkerFemale(e.target.value); // Update female workers
        setNumofWorkerTotal((parseInt(numofworkermale) || 0) + female); // Update total
      };

      const handleLocationChange = (latitude: number, longitude: number) => {
        setLat(latitude);
        setLng(longitude);
      };
      const [activeTab, setActiveTab] = useState('user'); // Initial state set to 'user'

      const handleTabClick = (tab: string) => {
        setActiveTab(tab); // Update active tab when clicked
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
        

                     {/* Tabs */}
                     <div className="tabs">
                <button 
                    className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
                    onClick={() => handleTabClick('user')}
                >
                     Renew Business Permit
                </button>
                <button 
                    className={`tab-button ${activeTab === 'owner' ? 'active' : ''}`}
                    onClick={() => handleTabClick('owner')}
                >
                    Owner's Information
                </button>
                <button 
                    className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
                    onClick={() => handleTabClick('business')}
                >
                    Business Information
                </button>
            </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                {activeTab === 'user' ? (
                    <div className="user-info">
                        <h2>Renew Business Permit</h2>
                        {/* Add your user information content here */}


                        <p>{/* User Info content */}</p>
                    </div>
                ) : activeTab === 'owner' ? (
                    <div className="business-info">
                        <h2>Owner's Information</h2>
                        {businessPermit ? (
          <> 
            <p> Date Issued: {businessPermit.createdAt ? new Date(businessPermit.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p> Business Permit Status: {businessPermit.businesspermitstatus}</p>
            
            <h2>Personal Details</h2>

<label className="checkbox-label">
  <input
    type="checkbox"
    checked={corporation}
    onChange={() => {
      setCorporation(!corporation);
      setFirstName('');
      setLastName('');
      setMiddleInitial('');
      setCivilStatus('Undefined');
      setGender('Corp');

      if (corporation) {
        setCompanyName(''); // Clear the company name if unchecking
        setCivilStatus('');
        setGender('');
      }
    }}
  />
  Check if Corporation
</label>


  <label>LAST NAME:</label>
  <input type="text" value={lastname} onChange={(e) => setLastName(e.target.value)} required disabled={corporation} />

  <label>FIRST NAME:</label>
  <input type="text" value={firstname} onChange={(e) => setFirstName(e.target.value)}  required disabled={corporation} />

  <label>MIDDLE INITIAL:</label>
  <input type="text" value={middleinitial} onChange={(e) => setMiddleInitial(e.target.value)}  disabled={corporation} />

  <label>Company Name:</label>
  <input type="text" value={companyname} onChange={(e) => setCompanyName(e.target.value)}  disabled={!corporation} />

<label>CIVIL STATUS:</label>
<select
  value={civilstatus}
  onChange={(e) => setCivilStatus(e.target.value)}
  className="form-control"
>
  <option value="" disabled>Select Civil Status</option>
  <option value="Single">Single</option>
  <option value="Married">Married</option>
  <option value="Widowed">Widowed / Widower</option>
  <option value="Seperated">Seperated</option>
  <option value="Undefined">Undefined</option>
</select>

<label>Gender:</label>
<select
  value={gender}
  onChange={(e) => setGender(e.target.value)}
  className="form-control"
>
  <option value="" disabled>Select Gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
  <option value="Corp">Corporation</option>
</select>
<label>CITIZENSHIP:</label>
<input type="text" value={citizenship} onChange={(e) => setCitizenship(e.target.value)} />

  <label>TIN NUMBER:</label>
  <input type="number" value={tinnumber} onChange={(e) => setTinNumber(e.target.value)} />

<label className="checkbox-label">
  <input type="checkbox" checked={representative} onChange={() => setRepresentative(!representative)} />
  Check if Thru Representative
</label>

<label>Representative Full Name:</label>
<input type="text" value={repfullname} onChange={(e) => setRepFullName(e.target.value)} disabled={!representative} />

<label>Designation/Position:</label>
<input type="text" value={repdesignation} onChange={(e) => setRepDesignation(e.target.value)} disabled={!representative} />

<label>Representative Mobile Number:</label>
<input type="text" value={repmobilenumber} onChange={(e) => setRepMobileNumber(e.target.value)} disabled={!representative} />

<h2>Contact Information</h2>

<label>House/Bldg No./Blk and Lot</label>
<input type="text" value={houseandlot} onChange={(e) => setHouseandLot(e.target.value)} />

<label>Building Name / Street Name</label>
<input type="text" value={buildingstreetname} onChange={(e) => setBuildingStreetName(e.target.value)}  />

<label>Subdivision / Compound Name</label>
<input type="text" value={subdivision} onChange={(e) => setSubdivision(e.target.value)} />

<label>Region</label>
<input type="text" value={region} onChange={(e) => setRegion(e.target.value)} />

<label>Province</label>
<input type="text" value={province} onChange={(e) => setProvince(e.target.value)} />

<label>Municipality</label>
<input type="text" value={municipality} onChange={(e) => setMunicipality(e.target.value)} />

<label>Barangay</label>
<input type="text" value={barangay} onChange={(e) => setBarangay(e.target.value)} />

<label>Telephone Number</label>
<input type="text" value={telephonenumber} onChange={(e) => setTelephoneNumber(e.target.value)} />


<label>Mobile Number</label>
<input type="text" value={mobilenumber} onChange={(e) => setMobileNumber(e.target.value)} />


<label>Email Address</label>
<input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />



              
          </>
        ) : (
          <p>No business permit details available.</p>
        )}
                    
                        <p>{/* Business Info content */}</p>
                    </div>
                ) : activeTab === 'business' ? (
                    <div className="attachments-info">
                        <h2>Business Information</h2>
                        {/* Add your attachments content here */}
                        {businessPermit ? (
          <> 
                <h2>Business Information</h2>
                  <label>Business Name:</label>
                  <input type="text" value={businessname} onChange={(e) => setBusinessName(e.target.value)} />
   
    
                  <label>Business Scale:</label>
                  <select
                    value={businessscale}
                    onChange={(e) => setBusinessScale(e.target.value)}
                    className="form-control"
                  >
                    <option value="" disabled>Select Business Scale</option>
                    <option value="Micro">Micro (Not more than 3M or Having 1-9 Employees)</option>
                    <option value="Small">Small (3M - 15M or Having 10-99 Employees)</option>
                    <option value="Medium">Medium (15M - 100M or Having 100-199 Employees)</option>
                    <option value="Large">Large (more than 100M or Asset size of more than 100M)</option>
                  </select>
 
                  <label>Payment Mode:</label>
                  <select
                    value={paymentmethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-control"
                  >
                    <option value="" disabled>Select Payment Method</option>
                    <option value="Annual">Annual</option>
                    <option value="Semi-Annual">Semi-Annual</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
               
                <h2>Buisness Contact Information</h2>
               
                  <label>House/Bldg No./Blk and Lot:</label>
                  <input type="text" value={businessbuildingblocklot} onChange={(e) => setBusinessBuildingBlockLot(e.target.value)} />
    
             
                  <label>Building Name/Street Name:</label>
                  <input type="text" value={businessbuildingname} onChange={(e) => setBusinessBuildingName(e.target.value)} />


                  <label>Subdivision/Compound Name:</label>
                  <input type="text" value={businesssubcompname} onChange={(e) => setBusinessSubCompName(e.target.value)}  />

      
                  <label>Region:</label>
                  <input type="text" value={businessregion} onChange={(e) => setBusinessRegion(e.target.value)} disabled />

        
                  <label>Province:</label>
                  <input type="text" value={businessprovince} onChange={(e) => setBusinessProvince(e.target.value)} disabled />
    
   
                  <label>City/Municipality:</label>
                  <input type="text" value={businessmunicipality} onChange={(e) => setBusinessMunicipality(e.target.value)} disabled />

                  <label>Barangay:</label>
                  <input type="text" value={businessbarangay} onChange={(e) => setbusinessBarangay(e.target.value)} />
         

    
                  <label>Zip:</label>
                  <input type="text" value={businesszip} onChange={(e) => setBusinessZip(e.target.value)} />

                  <label>Contact Number:</label>
                  <input type="text" value={businesscontactnumber} onChange={(e) => setBusinessContactNumber(e.target.value)} />
                  Check if Same as Owner Info
                  <input
  type="checkbox"
  onChange={(e) => {
    if (e.target.checked) {
      setBusinessContactNumber(mobilenumber); // Set the value when checked
    } else {
      setBusinessContactNumber(''); // Clear the value when unchecked
    }
  }}
/>

               
                <h2>Necessities Information</h2>
          
                  <label>Ownership Type:</label>
                  <select
                    value={ownershiptype}
                    onChange={(e) => {
                      setOwnershipType(e.target.value);
                      if (e.target.value === "COOP") {
                        setDTIRegistrationNum(''); // Clear DTI Registration No for specific types
                        setDTIRegistrationDate('');
                        setDTIRegistrationExpDate('');
                        setSECRegistrationNum('');
                      }
                      if (e.target.value === "CORP" || e.target.value === "INST" || e.target.value === "PART") {
                        setDTIRegistrationNum(''); // Clear DTI Registration No for specific types
                        setDTIRegistrationDate('');
                        setDTIRegistrationExpDate('');
                        setBIRRegistrationNum('');
                      }
                      if (e.target.value === "SOLE") {
                        setSECRegistrationNum('');
                        setBIRRegistrationNum('');

                      }
                    }}
                    className="form-control"
                  >
                    <option value="" disabled>Select Ownership Type</option>
                    <option value="COOP">Cooperative</option>
                    <option value="CORP">Corporation</option>
                    <option value="INST">Institutional</option>
                    <option value="PART">Partnership</option>
                    <option value="SOLE">Sole Person</option>
                  </select>
    
   
                  <label>Agency Registered No:</label>
                  <input type="text" value={agencyregistered} onChange={(e) => setAgencyRegistered(e.target.value)} />
 
                  <label>DTI Registration No:</label>
                  <input
                    type="text"
                    value={dtiregistrationnum}
                    onChange={(e) => setDTIRegistrationNum(e.target.value)}
                    placeholder="Enter DTI Registration No"
                    disabled={ownershiptype === "COOP" || ownershiptype === "CORP" || ownershiptype === "INST" || ownershiptype === "PART"}
                  />

 
                  <label>DTI Registration Date:</label>
                  <input type="date" value={dtiregistrationdate} onChange={(e) => setDTIRegistrationDate(e.target.value)} disabled={ownershiptype === "COOP" || ownershiptype === "CORP" || ownershiptype === "INST" || ownershiptype === "PART"} />

                  <label>DTI Expiration Date:</label>
                  <input type="date" value={dtiregistrationexpdate} onChange={(e) => setDTIRegistrationExpDate(e.target.value)} disabled={ownershiptype === "COOP" || ownershiptype === "CORP" || ownershiptype === "INST" || ownershiptype === "PART"} />

                  <label>SEC Registration No:</label>
                  <input type="text" value={secregistrationnum} onChange={(e) => setSECRegistrationNum(e.target.value)} disabled={ownershiptype === "COOP" || ownershiptype === "SOLE"} />

       
                  <label>BIR Registration No:</label>
                  <input type="text" value={birregistrationnum} onChange={(e) => setBIRRegistrationNum(e.target.value)} disabled={ownershiptype === "CORP" || ownershiptype === "INST" || ownershiptype === "PART" || ownershiptype === "SOLE"} />
 
                  <label>Industry Sector:</label>
                  <select
                    value={industrysector}
                    onChange={(e) => setIndustrySector(e.target.value)}
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
   
                  <label>Business Operation:</label>
                  <select
                    value={businessoperation}
                    onChange={(e) => setBusinessOperation(e.target.value)}
                    className="form-control"
                  >
                    <option value="Daytime">DAYTIME</option>
                    <option value="Nightshift">NIGHTSHIFT</option>
                    <option value="Day&Night">BOTH DAY AND NIGHT</option>
                  </select>
                  <label>Business Type:</label>
                  <select
                    value={typeofbusiness}
                    onChange={(e) => setTypeofBusiness(e.target.value)}
                    className="form-control"
                  >
                    <option value="Main">MAIN</option>
                    <option value="Franchise">FRANCHISE</option>
                    <option value="Branch">BRANCH</option>
                  </select>




                  <h2>Other Business Information</h2>
                <div className="form-group">
                  <label>Date Established:</label>
                  <input type="date" value={dateestablished} onChange={(e) => setDateEstablished(e.target.value)} />
                  <label>Check if Same as DTI</label>
                  <input
  type="checkbox"
  onChange={(e) => {
    if (e.target.checked) {
      setDateEstablished(dtiregistrationdate); // Set the value when checked
    } else {
      setDateEstablished(''); // Clear the value when unchecked
    }
  }}
/>
                </div>
                <div className="form-group">
                  <label>Start Date:</label>
                  <input type="date" value={startdate} onChange={(e) => setStartDate(e.target.value)} />
                  <label>Check if Same as DTI</label>
                  <input
  type="checkbox"
  onChange={(e) => {
    if (e.target.checked) {
      setStartDate(dtiregistrationdate); // Set the value when checked
    } else {
      setStartDate(''); // Clear the value when unchecked
    }
  }}
/>

                  <label>Occupancy:</label>
                  <select
                    value={occupancy}
                    onChange={(e) => setOccupancy(e.target.value)}
                    className="form-control"
                  >
                    <option value="" disabled>Select Occupancy</option>
                    <option value="Agree">Agree To Use</option>
                    <option value="Owned">Owned</option>
                    <option value="Rented">Rented</option>
                  </select>

                  <label>Business Type:</label>
                  <select
                    value={otherbusinesstype}
                    onChange={(e) => setOtherBusinessType(e.target.value)}
                    className="form-control"
                  >
                    <option value="" disabled>Select Business Type</option>
                    <option value="COMM">COMMERCIAL</option>
                    <option value="INDUST">INDUSTRIAL</option>
                  </select>
 
                  <label>Email Address:</label>
                  <input type="text" value={businessemail} onChange={(e) => setBusinessEmail(e.target.value)} />

                  <label>Business Area:</label>
                  <input type="number" value={businessarea} onChange={(e) => setBusinessArea(e.target.value)} />

                  <label>Lot Area:</label>
                  <input type="number" value={businesslotarea} onChange={(e) => setBusinessLotArea(e.target.value)} />

                  <label>No of Workers:</label>
                  Male:
                  <input type="number" value={numofworkermale} onChange={handleMaleChange} /> 
                  Female:
                  <input type="number" value={numofworkerfemale} onChange={handleFemaleChange} />
                  <label>Total:</label>
                  <input type="text" value={numofworkertotal} readOnly placeholder='Total Workers'/>

                  <label>Employees residing within LGU:</label>
                  <input type="text" value={numofworkerlgu} onChange={(e) => setNumofWorkerLGU(e.target.value)} />

                <h2>Fill up only if Business Place is Rented</h2>
        
                  <label>Lessor's Full Name:</label>
                  <input type="text" value={lessorfullname} onChange={(e) => setLessorFullName(e.target.value)} disabled={occupancy === "Agree" || occupancy === "" || occupancy === "Owned"} />
  
                  <label>Lessor's Mobile Number:</label>
                  <input type="text" value={lessormobilenumber} onChange={(e) => setLessorMobileNumber(e.target.value)} disabled={occupancy === "Agree" || occupancy === "" || occupancy === "Owned"}/>

                  <label>Monthly Rent:</label>
                  <input type="text" value={monthlyrent} onChange={(e) => setMonthlyRent(e.target.value)} disabled={occupancy === "Agree" || occupancy === "" || occupancy === "Owned"}/>

                  <label>Lessor's Full Address:</label>
                  <input type="text" value={lessorfulladdress} onChange={(e) => setLessorFullAddress(e.target.value)} disabled={occupancy === "Agree" || occupancy === "" || occupancy === "Owned"} />

      
                  <label>Email Address:</label>
                  <input type="text" value={lessoremailaddress} onChange={(e) => setLessorEmailAddress(e.target.value)} disabled={occupancy === "Agree" || occupancy === "" || occupancy === "Owned"}/>
</div>

<h2>Step 4 Map Location</h2>
                <h4>Map Location</h4>

                <MapLocation initialLat={lat} initialLng={lng} onLocationChange={handleLocationChange} />

                <div style={{ marginTop: '10px' }}>
                  <label>
                    Latitude:
                    <input type="text" value={lat} readOnly />
                  </label>
                  <br />
                  <label>
                    Longitude:
                    <input type="text" value={lng} readOnly />
                  </label>
                </div>


            

              
          </>
        ) : (
          <p>No business permit details available.</p>
        )}
                        <p>{/* Attachments content */}</p>
                    </div>
                ) : null}
            </div>

        
    
      </div>
      </div>
    </section>
  );
};

export default BusinessPermitRenew;
