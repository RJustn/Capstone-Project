import React from 'react';
import { useLocation } from 'react-router-dom';
import '../Styles/AdminSideBarStyles.css';

interface DASidebarProps {
handleLogout: (event: React.MouseEvent) => void;
}

const DASidebar: React.FC<DASidebarProps> = ({ handleLogout }) => {
const location = useLocation();

  // Helper function to determine if the current link is active
const isActive = (path: string) => location.pathname === path;

return (
    <div className="Asidebar">
    <div className="Asidebar-logo">
        <img src="/obpwlsDAlogo.svg" alt="Logo" className="Alogo-image" />
    </div>
    <ul className="Asidebar-list">
        <li>
        <a href="/Adashboard" className={isActive('/Adashboard') ? "Asidebar-linkactive" : "Asidebar-link"}>
            <img src="/dashboardlogo.svg" alt="Dashboard Icon" className="sidebarlogoimage" />Dashboard
        </a>
        </li>
        <li>
        <a href="/Aforassessment" className={isActive('/Aforassessment') ? "Asidebar-linkactive" : "Asidebar-link"}>
            <img src="/DAforassessmentlogo.svg" alt="Assessment Icon" className="sidebarlogoimage" />For Assessment
        </a>
        </li>
        <li>
        <a href="/Aforpayment" className={isActive('/Aforpayment') ? "Asidebar-linkactive" : "Asidebar-link"}>
            <img src="/paymentlogo.svg" alt="Payment Icon" className="sidebarlogoimage" />For Payment
        </a>
        </li>
        <li>
        <a href="/Areleasedpermits" className={isActive('/Areleasedpermits') ? "Asidebar-linkactive" : "Asidebar-link"}>
            <img src="/releasedpermitlogo.svg" alt="Released Permits Icon" className="sidebarlogoimage" />Released Permits
        </a>
        </li>
        <li>
        <a href="/Areportsngraph" className={isActive('/Areportsngraph') ? "Asidebar-linkactive" : "Asidebar-link"}>
            <img src="/reportsngraphlogo.svg" alt="Reports/Graphs Icon" className="sidebarlogoimage" />Reports/Graphs
        </a>
        </li>
        <li>
            <a href="/account" className="Asidebar-link">
            <img src="/accountlogo.svg" alt="Logo" className="sidebarlogoimage" />Account
            </a>
            </li>
        <li>
        <a href="/" onClick={handleLogout} className="Asidebar-link">
            <img src="/logoutlogo.svg" alt="Logout Icon" className="sidebarlogoimage" />Log Out
        </a>
        </li>
    </ul>
    </div>
);
};

export default DASidebar;
