import './Footer.css';
import { FaSpotify } from 'react-icons/fa';
import { SiGenius } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img
            src="/MoodTunesImage.svg"
            alt="MoodTunes Logo"
            className="footer-logo-image"
            style={{ height: '24px', marginRight: '8px', verticalAlign: 'middle' }}
          />
          <span className="footer-logo-text">MoodTunes</span>
        </div>
        
        <div className="footer-center">
          <span className="footer-year">MoodTunes, June 2025</span>
        </div>
        
        <div className="footer-credits">
          <span className="credits-text">Credits to</span>
          <div className="credits-icons">
            <a
              href="https://genius.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="credit-icon"
              title="Genius"
            >
              <SiGenius size={22} color="#ffff64" />
            </a>
            <a
              href="https://spotify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="credit-icon spotify"
              title="Spotify"
            >
              <FaSpotify size={22} color="#1DB954" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;