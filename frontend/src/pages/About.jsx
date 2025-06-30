import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About MoodTunes</h1>

        <div className="about-content">
          <p className="about-description">
            MoodTunes is an AI-powered music companion that recommends songs and lyrics based
            on how you feel. Whether you're feeling joyful, nostalgic, or just need something to
            vibe to, MoodTunes understands your mood and curates tracks that match your
            emotional state. We use cutting-edge technologies like OpenAI for mood interpretation,
            and integrate Spotify and Genius APIs to deliver not just music—but meaning. You'll
            receive both a song suggestion and its lyrics, making your listening experience more
            emotionally resonant and reflective.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;