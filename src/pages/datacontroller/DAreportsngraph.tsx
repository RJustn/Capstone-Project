import '../Styles/DataControllerStyles.css'; 
import DASidebar from '../components/DAsidebar';
import { useNavigate } from 'react-router-dom';// Import your CSS file

const DAreportsngraph: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from 
        navigate('/'); // Redirect to home page
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
    </div>
    </section>
);

};

export default DAreportsngraph;