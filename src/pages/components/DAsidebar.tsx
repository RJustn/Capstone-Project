import React from 'react';
import { useLocation } from 'react-router-dom';
import '../Styles/DAsidebarStyles.css';

interface DASidebarProps {
handleLogout: (event: React.MouseEvent) => void;
}

const DASidebar: React.FC<DASidebarProps> = ({ handleLogout }) => {
const location = useLocation();

  // Helper function to determine if the current link is active
const isActive = (path: string) => location.pathname === path;

return (
    <div className="DAsidebar">
    <div className="DAsidebar-logo">
        <img src="/obpwlsDAlogo.svg" alt="Logo" className="DAlogo-image" />
    </div>
    <ul className="DAsidebar-list">
        <li>
        <a href="/DAdashboard" className={isActive('/DAdashboard') ? "DAsidebar-linkactive" : "DAsidebar-link"}>
            <img src="/dashboardlogo.svg" alt="Dashboard Icon" className="sidebarlogoimage" />Dashboard
        </a>
        </li>
        <li>
        <a href="/DAforassessment" className={isActive('/DAforassessment') ? "DAsidebar-linkactive" : "DAsidebar-link"}>
            <img src="/DAforassessmentlogo.svg" alt="Assessment Icon" className="sidebarlogoimage" />For Assessment
        </a>
        </li>
        <li>
        <a href="/DAforpayment" className={isActive('/DAforpayment') ? "DAsidebar-linkactive" : "DAsidebar-link"}>
            <img src="/paymentlogo.svg" alt="Payment Icon" className="sidebarlogoimage" />For Payment
        </a>
        </li>
        <li>
        <a href="/DAreleasedpermits" className={isActive('/DAreleasedpermits') ? "DAsidebar-linkactive" : "DAsidebar-link"}>
            <img src="/releasedpermitlogo.svg" alt="Released Permits Icon" className="sidebarlogoimage" />Released Permits
        </a>
        </li>
        <li>
        <a href="/DAreportsngraph" className={isActive('/DAreportsngraph') ? "DAsidebar-linkactive" : "DAsidebar-link"}>
            <img src="/reportsngraphlogo.svg" alt="Reports/Graphs Icon" className="sidebarlogoimage" />Reports/Graphs
        </a>
        </li>
        <li>
        <a href="/DAretirebusiness" className={isActive('/DAretirebusiness') ? "DAsidebar-linkactive" : "DAsidebar-link"}>
            <img src="/reportsngraphlogo.svg" alt="Reports/Graphs Icon" className="sidebarlogoimage" />Retire Business
        </a>
        </li>
        <li>
            <a href="/account" className="DAsidebar-link">
            <img src="/accountlogo.svg" alt="Logo" className="sidebarlogoimage" />Account
            </a>
            </li>
        <li>
        <a href="/" onClick={handleLogout} className="DAsidebar-link">
            <img src="/logoutlogo.svg" alt="Logout Icon" className="sidebarlogoimage" />Log Out
        </a>
        </li>
    </ul>
    </div>
);
};

export default DASidebar;
