import './Header.css';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <nav className="navigation-bar">
        <div className="nav-content">
          <NavLink to="/" className="logo-section">
            <img
              src="/MoodTunesImage.svg"
              alt="MoodTunes Logo"
              className="logo-image"
              style={{ height: '32px', marginRight: '8px' }}
            />
            <span className="logo-text">MoodTunes</span>
          </NavLink>
          <NavLink to="/about" className="about-button">
            About
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;