import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <div className="hero-section">
          <h1 className="about-title">About MoodTunes</h1>
          <p className="about-subtitle">Your AI-powered music companion that understands your emotions</p>
        </div>

        <div className="about-content">
          <section className="intro-section">
            <h2>🎵 What is MoodTunes?</h2>
            <p className="about-description">
              MoodTunes is an innovative AI-powered music companion that recommends songs and lyrics based
              on how you feel. Whether you're feeling joyful, nostalgic, energetic, or just need something to
              vibe to, MoodTunes understands your mood and curates tracks that match your
              emotional state perfectly.
            </p>
          </section>

          <section className="features-section">
            <h2>✨ Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>AI Mood Detection</h3>
                <p>Advanced AI analyzes your messages to understand your current emotional state and musical preferences.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎶</div>
                <h3>Smart Recommendations</h3>
                <p>Get personalized song suggestions with lyrics that resonate with your mood and feelings.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3>Dynamic Themes</h3>
                <p>The entire interface adapts to your mood with beautiful, responsive color themes.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Playlist Creation</h3>
                <p>Build and save custom playlists directly to your Spotify account with seamless integration.</p>
              </div>
            </div>
          </section>

          <section className="tech-section">
            <h2>🚀 Powered by Advanced Technology</h2>
            <div className="tech-stack">
              <div className="tech-item">
                <strong>OpenAI GPT</strong>
                <p>For intelligent mood interpretation and conversational AI</p>
              </div>
              <div className="tech-item">
                <strong>Spotify API</strong>
                <p>For music streaming, playlist creation, and song previews</p>
              </div>
              <div className="tech-item">
                <strong>Genius API</strong>
                <p>For comprehensive lyrics and song information</p>
              </div>
              <div className="tech-item">
                <strong>React & Modern Web</strong>
                <p>For a responsive, interactive user experience</p>
              </div>
            </div>
          </section>

          <section className="experience-section">
            <h2>🎯 The MoodTunes Experience</h2>
            <div className="experience-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Share Your Mood</h3>
                  <p>Tell MoodTunes how you're feeling in natural language</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Get Perfect Matches</h3>
                  <p>Receive song recommendations with lyrics that match your emotions</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Build Your Playlist</h3>
                  <p>Create custom playlists and save them directly to Spotify</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Enjoy & Discover</h3>
                  <p>Listen, explore, and discover new music that speaks to your soul</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mission-section">
            <h2>💝 Our Mission</h2>
            <p className="mission-text">
              We believe music is the universal language of emotions. MoodTunes bridges the gap between
              how you feel and the perfect song to match that feeling. Our goal is to make music discovery
              more personal, meaningful, and emotionally resonant. Every recommendation is crafted to not
              just match your taste, but to understand and enhance your emotional journey through music.
            </p>
          </section>

          <section className="cta-section">
            <h2>🎵 Ready to Start Your Musical Journey?</h2>
            <p>Discover music that truly understands you.</p>
            <a href="/" className="cta-button">Start Using MoodTunes</a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;