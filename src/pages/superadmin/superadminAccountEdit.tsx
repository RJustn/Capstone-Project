import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import '../Styles/SuperAdminStyles.css';

const SuperadminAccountEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    email: '',
    userId: '',
    userrole: '', // Initialize as an empty string
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    contactNumber: '',
    address: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:3000/accounts/${id}`);
        if (!response.ok) {
          throw new Error('Error fetching user data');
        }
        const userData = await response.json();
        setFormData({
          email: userData.email,
          userId: userData.userId,
          userrole: userData.userrole, // Set the userrole from fetched data
          password: userData.password,
          firstName: userData.firstName,
          middleName: userData.middleName,
          lastName: userData.lastName,
          contactNumber: userData.contactNumber,
          address: userData.address,
        });
      } catch (error) {
        setError('Error fetching user data');
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, [id]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Hash the password before sending it to the server
     const hashedPassword = bcrypt.hashSync(formData.password, 10);
      const updatedFormData = { ...formData, password: hashedPassword };

      const response = await fetch(`http://localhost:3000/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedFormData),
      });
      if (!response.ok) {
        throw new Error('Error updating user data');
      }
      setSuccessMessage('User data updated successfully');
      // Optionally, navigate back to the accounts list or another page
      navigate('/superadmin/accounts');
    } catch (error) {
      setError('Error updating user data');
      console.error('Error updating user data:', error);
    }
  };

  // Check authentication when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/superadmin/authentication', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          console.error('Access denied: No token');
          navigate('/superadmin/login');
          return;
        }

        if (response.status === 204) {
          console.log('Access Success');
          return;
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="text"
        name="userId"
        value={formData.userId}
        onChange={handleChange}
        placeholder="User ID"
        required
      />
      <select
        name="userrole"
        value={formData.userrole}
        onChange={handleChange}
        required
      >
        <option value="Admin">Admin</option>
        <option value="Data Controller">Data Controller</option>
      </select>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
      />
      <input
        type="text"
        name="middleName"
        value={formData.middleName}
        onChange={handleChange}
        placeholder="Middle Name"
      />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />
      <input
        type="text"
        name="contactNumber"
        value={formData.contactNumber}
        onChange={handleChange}
        placeholder="Contact Number"
      />
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
      />
      <button type="submit">Save</button>
      {error && <p>{error}</p>}
      {successMessage && <p>{successMessage}</p>}
    </form>
  );
};

export default SuperadminAccountEdit;