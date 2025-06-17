import { aboutMoodTunes } from '../utilities/aboutMoodTunes';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">{aboutMoodTunes.title}</h1>
        
        <div className="about-content">
          <p className="about-description">
            {aboutMoodTunes.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;