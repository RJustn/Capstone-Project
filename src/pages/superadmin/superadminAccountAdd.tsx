import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/SuperAdminStyles.css';

const SuperadminAccountAdd = () => {
  const navigate = useNavigate(); // Define navigate
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [userrole, setRole] = useState('');

  const logFormData = (formData: FormData) => {
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('lastName', lastName);
    formData.append('firstName', firstName);
    formData.append('middleInitial', middleName);
    formData.append('contactNumber', contactNumber);
    formData.append('password', password);
    formData.append('address', address);
    formData.append('userrole', userrole);
    formData.append('email', email);

    logFormData(formData);

    try {
      const response = await fetch('http://localhost:3000/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          contactNumber,
          email,
          address,
          password,
          userrole,
        }),
      });
      await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div>
      <h1 className='SAaccountaddH1'>Create New User</h1>
      <form className="SaAccountAddForm" onSubmit={handleSubmit}>
        <div className="flex-row">
          <label>
            First Name:
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </label>
          <label>
            Middle Initial:
            <input type="text" value={middleName} onChange={(e) => setMiddleInitial(e.target.value)} />
          </label>
          <label>
            Last Name:
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </label>
        </div>

        <div className="flex-row">
          <label>
            Contact Number:
            <input type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          </label>
          <label>
            Email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>

        <div className="flex-row">
          <label>
            Address:
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </div>

        <label>
          Role:
          <select value={userrole} onChange={(e) => setRole(e.target.value)} required>
            <option value="" disabled>Select a role</option>
            <option value="CL">Client</option>
            <option value="ADM">Admin</option>
            <option value="DC">Data Controller</option>
          </select>
        </label>

        <div className="button-group">
          <button type="button" onClick={handleBack} className="SAbackButton">Back</button>
          <button type="submit" className="SAcreateAccountButton">Create User</button>
        </div>
      </form>
    </div>
  );
};

export default SuperadminAccountAdd;
