import React from 'react';
import './Styles/home.css'; // Import your CSS file
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Home: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleApplyNowClick = () => {
    navigate('/login'); // Redirect to the login page
  };

  return (
    <section className="bodylandingpage">
      <nav className="navbar navbar-custom navbar-expand-lg fixed-top py-3"> 
        <div className="container-fluid">
          <a className="navbar-brand me-auto text-white">
            <span className="d-none d-lg-inline">Online Business and Work Permit Licensure System</span>
            <span className="d-lg-none">OBWPLS</span>
          </a>
            <div className="offcanvas offcanvas-end" tabIndex={-1} id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
              <div className="offcanvas-header offcanvas-custom">
                <h5 className="offcanvas-title text-white" id="offcanvasNavbarLabel">OBWPLS</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
              </div>
            <div className="offcanvas-body offcanvas-custom">
              <ul className="navbar-nav justify-content-end flex-grow-1">
              <li className="nav-item">
                <a className="nav-link text-white " href="signup"> Sign Up</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white " href="login"> Log In</a>
              </li>
            </ul>
            </div>
            </div>
            <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
        </div>
      </nav>
  
      <div className='title'>
        <h2>
          THE CITY OF DASMARIÑAS BUSINESS PERMITS <br></br> AND LICENSING OFFICE
        </h2>
      </div>
      <div className='subtitle'>
        <h2>
          Making <span className="highlight">Business Permit</span> and 
          <span className="highlight"> Work Permit</span> <br /> Application
          <span className="highlight"> Easier.</span>
        </h2>
      </div>
      <div className="applybuttoncontainer">
        <button className='btn btn-apply-custom' onClick={handleApplyNowClick}>Apply Now</button>
      </div>


      <footer>
        <p>&copy; 2024 Online Business and Work Permit Licensing System. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default Home;
