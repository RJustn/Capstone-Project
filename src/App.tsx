// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// MAIN PAGES
import Home from './pages/home'; 
import Signup from './pages/signup'; 
import Login from './pages/login'; 
import EmailVerification from './pages/emailverification';
import ForgotPassword from './pages/forgotpassword';

// CLIENT PAGES
import Dashboard from './pages/client/dashboard'; 
import Account from './pages/client/account'; 
import BusinessPermit from './pages/client/businesspermitpage';
import WorkPermit from './pages/client/workpermitpage';
import ViewWorkPermitApplication from './pages/client/viewworkpermitapplication';
import ViewBusinessApplication from './pages/client/viewbusinessapplication';
import ViewAllApplication from './pages/client/viewallapplication';

// SUPERADMIN PAGES
import SuperAdminLogin from './pages/superadmin/superadminLogin';
import SuperAdminDashboard from './pages/superadmin/superadminDashboard';
import SuperAdminEditUser from './pages/superadmin/superadminAccountEdit';
import SuperAdminAccount from './pages/superadmin/superadminAccounts';
import SuperAdminLogbook from './pages/superadmin/superadminLogbook';
import SuperadminAddUser from './pages/superadmin/superadminAccountAdd';

// DATA CONTROLLER PAGES
import DataControllerDashboard from './pages/datacontroller/DAdashboard';
import DataControllerForAssessment from './pages/datacontroller/DAforassessment';
import DataControllerForAssessmentWP from './pages/datacontroller/DAforassessmentWP';
import DataControllerForPayment from './pages/datacontroller/DAforpayment';
import DataControllerForPaymentWP from './pages/datacontroller/DAforpaymentWP';
import DataControllerReleasedPermit from './pages/datacontroller/DAreleasedpermits';
import DataControllerReleasedPermitWP from './pages/datacontroller/DAreleasedpermitsWP';
import DataControllerReportandGraph from './pages/datacontroller/DAreportsngraph';
import DataControllerViewApplicationDetails from './pages/datacontroller/DAviewapplicationdetails';
import DataControllerAccount from './pages/datacontroller/DAaccount';

import ViewApplicationDetails from './pages/client/viewapplicationdetails';
import AppTest from './pages/apptest';
import AppTest2 from './pages/apptest2';

const App: React.FC = () => {
  return (
    <Router>
        <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Default route */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/businesspermitpage" element={<BusinessPermit />} />
        <Route path="/workpermitpage" element={<WorkPermit />} />
        <Route path="/emailverification" element={<EmailVerification />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/viewbusinessapplication" element={<ViewBusinessApplication />} />
        <Route path="/viewworkpermitapplication" element={<ViewWorkPermitApplication />} />
        <Route path="/viewallapplication" element={<ViewAllApplication />} />
        <Route path="/viewapplicationdetails/:id" element={<ViewApplicationDetails />} />
        <Route path="/viewapplicationdetails/" element={<ViewApplicationDetails />} />
        <Route path="/apptest" element={<AppTest />} />
        <Route path="/apptest2" element={<AppTest2 />} />

        {/* Routes for Data Controller */}
        <Route path="/DAdashboard" element={<DataControllerDashboard />} />
        <Route path="/DAforassessment" element={<DataControllerForAssessment />} />
        <Route path="/DAforassessmentWP" element={<DataControllerForAssessmentWP />} />
        <Route path="/DAforpayment" element={<DataControllerForPayment />} />
        <Route path="/DAforpaymentWP" element={<DataControllerForPaymentWP />} />
        <Route path="/DAreleasedpermits" element={<DataControllerReleasedPermit />} />
        <Route path="/DAreleasedpermitsWP" element={<DataControllerReleasedPermitWP />} />
        <Route path="/DAreportsngraph" element={<DataControllerReportandGraph />} />
        <Route path="/DAviewapplicationdetails/" element={<DataControllerViewApplicationDetails />} />
        <Route path="/DAviewapplicationdetails/:id" element={<DataControllerViewApplicationDetails />} />
        <Route path="/DAaccount" element={<DataControllerAccount />} />

        {/* Add more routes as needed */}
  
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/edituser/:id" element={<SuperAdminEditUser />} />
          <Route path="/superadmin/accounts" element={<SuperAdminAccount />} />
          <Route path="/superadmin/logbooks" element={<SuperAdminLogbook />} />
          <Route path='/superadmin/accountadd' element={<SuperadminAddUser />} />
      </Routes>
      </Suspense>
    </Router>
  );
};

export default App;