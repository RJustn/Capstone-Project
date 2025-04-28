import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ClientStyles.css';
import ClientNavbar from '../components/NavigationBars/clientnavbar';
import axios from 'axios';
import { WorkPermits } from "../components/Interface(Front-end)/Types";
import Swal from 'sweetalert2';

const WorkPermit: React.FC = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<{ email: string; firstName: string; lastName: string; id: string} | null>(null);;
  const [step, setStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(true);
  const [workPermits, setWorkPermits] = useState<WorkPermits[]>([]);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [currentlyResiding, setCurrentlyResiding] = useState(false);
  const [temporaryAddress, setTemporaryAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [mobileTel, setMobileTel] = useState('');
  const [email, setEmail] = useState('');
  const [educationalAttainment, setEducationalAttainment] = useState('');
  const [natureOfWork, setNatureOfWork] = useState('');
  const [placeOfWork, setPlaceOfWork] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [name2, setName2] = useState('');
  const [mobileTel2, setMobileTel2] = useState('');
  const [address, setAddress] = useState('');
  const [workpermitclassification, setWorkPermitClassification] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const [latestWorkPermit, setLatestWorkPermit] = useState<WorkPermits | null>(null);

  const fetchWorkPermits = async () => {
    try {
      const response = await fetch('https://capstone-project-backend-nu.vercel.app/client/fetchuserworkpermits', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const WorkPermitData = await response.json();
      setWorkPermits(WorkPermitData);

      WorkPermitData.sort((a: WorkPermits, b: WorkPermits) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      if (WorkPermitData.length > 0) {
        setLatestWorkPermit(WorkPermitData[0]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://capstone-project-backend-nu.vercel.app/client/profile', {
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
    }
  };

  useEffect(() => {
    console.log('Repeating');
    fetchWorkPermits();
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (latestWorkPermit) {
      setLastName(latestWorkPermit.formData.personalInformation.lastName ?? '');
      setFirstName(latestWorkPermit.formData.personalInformation.firstName ?? '');
      setMiddleInitial(latestWorkPermit.formData.personalInformation.middleInitial ?? '');
      setPermanentAddress(latestWorkPermit.formData.personalInformation.permanentAddress ?? '');
      setTemporaryAddress(latestWorkPermit.formData.personalInformation.temporaryAddress ?? '');
      const dob = latestWorkPermit.formData.personalInformation.dateOfBirth;
      if (dob) {
        const formattedDOB = new Date(dob).toISOString().split('T')[0];
        setDateOfBirth(formattedDOB);
      } else {
        setDateOfBirth('');
      }
      setDateOfBirth(dob ?? '');
      setAge(latestWorkPermit.formData.personalInformation.age ?? '');
      setPlaceOfBirth(latestWorkPermit.formData.personalInformation.placeOfBirth ?? '');
      setCitizenship(latestWorkPermit.formData.personalInformation.citizenship ?? '');
      setCivilStatus(latestWorkPermit.formData.personalInformation.civilStatus ?? '');
      setGender(latestWorkPermit.formData.personalInformation.gender ?? '');
      setMobileTel(latestWorkPermit.formData.personalInformation.mobileTel ?? '');
      setEmail(latestWorkPermit.formData.personalInformation.email ?? '');
      setEducationalAttainment(latestWorkPermit.formData.personalInformation.educationalAttainment ?? '');
      setNatureOfWork(latestWorkPermit.formData.personalInformation.natureOfWork ?? '');
      setPlaceOfWork(latestWorkPermit.formData.personalInformation.placeOfWork ?? '');
      setCompanyName(latestWorkPermit.formData.personalInformation.companyName ?? '');
      setName2(latestWorkPermit.formData.emergencyContact.name2 ?? '');
      setMobileTel2(latestWorkPermit.formData.emergencyContact.mobileTel2 ?? '');
      setAddress(latestWorkPermit.formData.emergencyContact.address ?? '');
    }
    if (!latestWorkPermit){
      setLastName(userDetails?.lastName ?? '');
      setFirstName(userDetails?.firstName ?? '');
      setEmail(userDetails?.email ?? '');
    }


  }, [latestWorkPermit, userDetails]);

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    
    if (!lastName) {
      newErrors.lastName = 'Lastname is required.';
    } else {
      delete errors.lastName; // Clear error if valid
    }

    if (!firstName) {
      newErrors.firstName = 'Firstname is required.';
      } else {
        delete errors.firstName; // Clear error if valid
        }
    
        if (!email) {
          newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
          newErrors.email = 'Please enter a valid email address';
        }

    if (!mobileTel) {
      newErrors.mobileTel = 'Mobile number is required.';
    } else {
      delete errors.mobileTel; // Clear error if valid
    }

    if (!natureOfWork) {
      newErrors.natureOfWork = 'Nature of work is required.';
    } else {
      delete errors.natureOfWork; // Clear error if valid
    }

    if (!civilStatus || civilStatus === "") {
      newErrors.civilStatus = "Please select a valid civil status.";
    } else {
      delete errors.civilStatus;
    }

    if (!gender || gender === "") {
      newErrors.gender = "Please select a gender.";
    } else {
      delete errors.gender;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateFiles = () => {
    const fileErrors: string[] = [];

    if (!files.document1) fileErrors.push('1x1 Picture is required.');
    if (!files.document2) fileErrors.push('Cedula is required.');
    if (!files.document3 && !currentlyResiding) fileErrors.push('Referral Letter is required.');
    if (!files.document4 && workPermits.length === 0) fileErrors.push('FTJS Certificate is required.');

    if (fileErrors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'File Validation Failed',
        text: fileErrors.join('\n'),
      });
      return false;
    }

    return true;
  };

  const goToNextStep = () => {
    if (step === 1) {
      const isFieldsValid = validateFields();
      if (!isFieldsValid) {
        setIsFormValid(false);
        return;
      }
    }

    if (step === 2) {
      const areFilesValid = validateFiles();
      if (!areFilesValid) {
        return;
      }
    }

    setIsFormValid(true);
    setStep(prevStep => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    doc: 'document1' | 'document2' | 'document3' | 'document4'
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      setFiles((prev) => ({ ...prev, [doc]: null }));
      setFileErrors((prev) => ({ ...prev, [doc]: 'This file is required.' }));
      return;
    }
  
    const file = selectedFiles[0];
    const maxSizeInBytes = 5 * 1024 * 1024; // 2MB
    const imageTypes = ['image/jpeg', 'image/png'];
    const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
    if (doc === 'document1') {
      // Only JPEG/PNG images for document1 (1x1 picture)
      if (!imageTypes.includes(file.type)) {
        setFileErrors((prev) => ({ ...prev, [doc]: 'Only JPEG or PNG images are allowed.' }));
        return;
      }
  
      if (file.size > maxSizeInBytes) {
        setFileErrors((prev) => ({ ...prev, [doc]: 'File size must be less than 2MB.' }));
        return;
      }
  
      // Check if image is square (1x1)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width !== img.height) {
          setFileErrors((prev) => ({ ...prev, [doc]: 'Image must be a 1x1 (square) picture.' }));
          URL.revokeObjectURL(objectUrl);
          return;
        }
  
        setFiles((prev) => ({ ...prev, [doc]: file }));
        setFileErrors((prev) => ({ ...prev, [doc]: '' }));
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        setFileErrors((prev) => ({ ...prev, [doc]: 'Invalid image file.' }));
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } else {
      // Allow only image, pdf, or word files for doc2-4
      const allowedTypes = [...imageTypes, ...docTypes];
      if (!allowedTypes.includes(file.type)) {
        setFileErrors((prev) => ({
          ...prev,
          [doc]: 'Only image, PDF, or Word documents are allowed.',
        }));
        return;
      }
  
      if (file.size > maxSizeInBytes) {
        setFileErrors((prev) => ({
          ...prev,
          [doc]: 'File size must be less than 5MB.',
        }));
        return;
      }
  
      // File is valid
      setFiles((prev) => ({ ...prev, [doc]: file }));
      setFileErrors((prev) => ({ ...prev, [doc]: '' }));
    }
  };
  
  

  const logFormData = (formData: FormData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  };

  useEffect(() => {
    if (workPermits.length === 0) {
      setWorkPermitClassification("New");
    } else {
      setWorkPermitClassification("Renew");
    }
  }, [workPermits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    const formData = new FormData();
    formData.append('lastName', lastName);
    formData.append('firstName', firstName);
    formData.append('middleInitial', middleInitial);
    formData.append('permanentAddress', permanentAddress);
    formData.append('currentlyResiding', String(currentlyResiding));
    formData.append('temporaryAddress', temporaryAddress);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('age', String(age));
    formData.append('placeOfBirth', placeOfBirth);
    formData.append('citizenship', citizenship);
    formData.append('civilStatus', civilStatus);
    formData.append('gender', gender);
    formData.append('height', height);
    formData.append('weight', weight);
    formData.append('mobileTel', mobileTel);
    formData.append('email', email);
    formData.append('educationalAttainment', educationalAttainment);
    formData.append('natureOfWork', natureOfWork);
    formData.append('placeOfWork', placeOfWork);
    formData.append('companyName', companyName);
    formData.append('name2', name2);
    formData.append('mobileTel2', mobileTel2);
    formData.append('address', address);
    formData.append('workpermitclassification', workpermitclassification);

    if (files.document1) formData.append('document1', files.document1);
    if (files.document2) formData.append('document2', files.document2);
    if (files.document3) formData.append('document3', files.document3);
    if (workPermits.length === 0 && files.document4) {
      formData.append('document4', files.document4);
    }

    logFormData(formData);

    const requiredDocs: ('document1' | 'document2' | 'document3' | 'document4')[] = ['document1', 'document2'];

// Only add document4 if classification is not 'Renew'
if (workpermitclassification !== 'Renew') {
  requiredDocs.push('document4');
}

// Only add document3 if currentlyResiding is false (not checked)
if (!currentlyResiding) {
  requiredDocs.push('document3');
}

// Collect missing documents
const missingDocs = requiredDocs.filter((doc) => !files[doc]);

if (missingDocs.length > 0) {
  const updatedErrors = { ...fileErrors };
  missingDocs.forEach((doc) => {
    updatedErrors[doc] = 'This file is required.';
  });
  setFileErrors(updatedErrors);

  Swal.fire({
    icon: 'error',
    title: 'Missing Required File(s)',
    text: `Please upload the following documents`,
  });
  return;
}

    
    // Check for any file upload errors
    const hasFileErrors = Object.values(fileErrors).some((err) => err !== '');
    
    if (hasFileErrors) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File Upload',
        text: 'Please fix the file errors before submitting.',
      });
      return;
    }
    

    try {
      Swal.fire({
        title: 'Submitting Application...',
        text: 'Please wait while we process your request.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post('https://capstone-project-backend-nu.vercel.app/client/workpermitapplication', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      console.log(response.data);

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Application Submitted!',
          text: 'Your work permit application has been submitted successfully!',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate('/dashboard');
        });
      } else {
        const errorMessage = (response.data as { message: string }).message;
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: errorMessage || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again later.',
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/check-auth-client', {
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

  return (
    <section className="dashboard-container">
      <ClientNavbar />

      <div className="content">
        <header>
          <h1>Work Permit Application</h1>
        </header>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="workpermit-form">
              <h2>Personal Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>LAST NAME<span style={{ color: 'red' }}>*</span></label>
                  <input type="text" disabled readOnly value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  {errors.lastName && <p style={{ color: 'red' }}>{errors.lastName}</p>}
                </div>
                <div className="form-group">
                  <label>FIRST NAME<span style={{ color: 'red' }}>*</span></label>
                  <input type="text" disabled readOnly value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  {errors.firstName && <p style={{ color: 'red' }}>{errors.firstName}</p>}
                </div>
                <div className="form-group">
                  <label>MIDDLE INITIAL</label>
                  <input type="text" value={middleInitial} onChange={(e) => setMiddleInitial(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>PERMANENT ADDRESS</label>
                <input type="text" value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentlyResiding}
                    onChange={() => setCurrentlyResiding(!currentlyResiding)}
                  />
                  Check if Currently Residing in Dasmarinas
                </label>
              </div>
              <div className="form-group">
                <label>TEMPORARY ADDRESS (IF ANY)</label>
                <input type="text" value={temporaryAddress} onChange={(e) => setTemporaryAddress(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>DATE OF BIRTH</label>
                  <input type="date" value={dateOfBirth} onChange={(e) =>{
                    const selectedDate = new Date(e.target.value);
                    const today = new Date();
                    const age = today.getFullYear() - selectedDate.getFullYear();
                    const monthDiff = today.getMonth() - selectedDate.getMonth();
                    const dayDiff = today.getDate() - selectedDate.getDate();
                    const calculateAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
                    if (calculateAge >= 18) {
                      setDateOfBirth(e.target.value);
                      setAge(calculateAge);
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: 'Invalid Age',
                        text: 'You must be at least 18 years old to apply for a work permit.',
                      });
                      setDateOfBirth('');
                    }
                  }}
                   />
                </div>
                <div className="form-group">
                  <label>AGE</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) { // Only allow numeric input
                        const numericValue = Number(value);
                        if (numericValue >= 18 || value === '') { // Allow only 18 or above, or empty for backspacing
                          setAge(value === '' ? '' : numericValue);
                        } else {
                          Swal.fire({
                            icon: 'error',
                            title: 'Invalid Age',
                            text: 'Age must be 18 or above.',
                          });
                        }
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>PLACE OF BIRTH</label>
                  <input type="text" value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CITIZENSHIP</label>
                  <input type="text" value={citizenship} onChange={(e) => setCitizenship(e.target.value)} />
                </div>
                <div className="form-group">
  <label htmlFor="civilStatus">CIVIL STATUS</label>
  <select
    id="civilStatus"
    value={civilStatus}
    onChange={(e) => setCivilStatus(e.target.value)}
    required
  >
    <option value=""> Select Civil Status </option>
    <option value="Single">Single</option>
    <option value="Married">Married</option>
    <option value="Divorced">Divorced</option>
    <option value="Widowed">Widowed</option>
    <option value="Separated">Separated</option>
  </select>
  {errors.civilStatus && <p style={{ color: 'red' }}>{errors.civilStatus}</p>}
</div>

                <div className="form-group">
                  <label htmlFor="gender">GENDER</label>
                  <select
                    id="gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.gender && <p style={{ color: 'red' }}>{errors.gender}</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>HEIGHT (in centimeters)</label>
                  <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>WEIGHT (in kilograms)</label>
                  <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>MOBILE/TEL. NO<span style={{ color: 'red' }}>*</span></label>
                  <input type="text" value={mobileTel} onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 11) { // Only numbers & max 11 digits
                      setMobileTel(value);
                    }
                  }} />
                  
                  {errors.mobileTel && <p style={{ color: 'red' }}>{errors.mobileTel}</p>}
                </div>
                <div className="form-group">
                  <label>EMAIL ADDRESS<span style={{ color: 'red' }}>*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label>EDUCATIONAL ATTAINMENT</label>
                  <input type="text" value={educationalAttainment} onChange={(e) => setEducationalAttainment(e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>NATURE OF WORK<span style={{ color: 'red' }}>*</span></label>
                  <input type="text" value={natureOfWork} onChange={(e) => setNatureOfWork(e.target.value)} />
                  {errors.natureOfWork && <p style={{ color: 'red' }}>{errors.natureOfWork}</p>}
                </div>
                <div className="form-group">
                  <label>PLACE OF WORK</label>
                  <input type="text" value={placeOfWork} onChange={(e) => setPlaceOfWork(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>COMPANY NAME</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
              </div>

              <div className="form-group gender-group">
                <label htmlFor="classification">Work Permit Classification</label>
                <input
                  type="text"
                  id="classification"
                  name="classification"
                  value={
                    workPermits.length === 0
                      ? "First Time Job Seeker / New Work Permit"
                      : "Work Permit Renewal"
                  }
                  disabled
                />
              </div>
              <h2>In Case of Emergency</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>NAME</label>
                  <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>MOBILE/TEL. NO<span style={{ color: 'red' }}>*</span></label>
                  <input type="text" value={mobileTel2} onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 11) { // Only numbers & max 11 digits
                      setMobileTel2(value);
                    }
                  }} />
                </div>
              </div>
              <div className="form-group">
                <label>ADDRESS</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              {!isFormValid && <p style={{ color: 'red' }}>Please fill in all required fields.</p>}
              <button type="button" className="nextbutton" onClick={goToNextStep}>Next</button>
            </div>
          )}
          {step === 2 && (
            <div className="upload-section">
              <div className="upload-item">
                <label>Upload 1x1 Picture<span style={{ color: 'red' }}>*</span></label>
                <input type="file" accept="image/jpeg, image/png" onChange={(e) => handleFileChange(e, 'document1')} />
                {fileErrors.document1 && <p style={{ color: 'red' }}>{fileErrors.document1}</p>}
              </div>
              <div className="upload-item">
                <label>Upload Cedula<span style={{ color: 'red' }}>*</span></label>
                <input type="file" accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document2')} />
                {fileErrors.document2 && <p style={{ color: 'red' }}>{fileErrors.document2}</p>}
              </div>
              {!currentlyResiding && (
                <div className="upload-item">
                  <label>Upload Referral Letter<span style={{ color: 'red' }}>*</span></label>
                  <input type="file" accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document3')} />
                  {fileErrors.document3 && <p style={{ color: 'red' }}>{fileErrors.document3}</p>}
                </div>
              )}
              {workPermits.length === 0 && (
                <div className="upload-item">
                  <label>Upload FTJS (First Time Job Seeker) Certificate</label>
                  <input type="file" accept=".png,.jpg,.jpeg,.pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'document4')} />
                  {fileErrors.document4 && <p style={{ color: 'red' }}>{fileErrors.document4}</p>}
                </div>
              )}
              <div className="buttoncontainer mt-3">
                <button type="button" onClick={goToPreviousStep} className="btn btn-danger">Back</button>
                <button type="submit" className="btn btn-success">Submit</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default WorkPermit;