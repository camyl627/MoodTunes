import { useState } from 'react';
import PlaylistIntegration from './PlaylistIntegration';
import '../pages/Chatbot.css'; // Import CSS for follow-up buttons

const ChatbotWithPlaylist = () => {
  const [messages, setMessages] = useState([]);
  const [lastRecommendedSong, setLastRecommendedSong] = useState(null);

  const addMessage = (text) => {
    setMessages(prev => [...prev, { text, sender: 'bot', timestamp: Date.now() }]);
  };

  const playlist = PlaylistIntegration({
    onAddMoreSongs: () => {
      addMessage('🎵 Let\'s add more songs! What mood would you like?');
    },
    onSaveToSpotify: (playlistSongs) => {
      if (playlistSongs.length >= 3) {
        addMessage(`💾 Saving ${playlistSongs.length} songs to Spotify...`);
        // Here you would call your Spotify API
      } else {
        addMessage('❌ Need at least 3 songs to save to Spotify.');
      }
    },
    onMessage: addMessage,
    lastRecommendedSong
  });

  // Example: Simulate getting a song recommendation
  const simulateRecommendation = () => {
    const songs = [
      { title: 'Blinding Lights', artist: 'The Weeknd', spotify: {}, geniusUrl: '' },
      { title: 'Watermelon Sugar', artist: 'Harry Styles', spotify: {}, geniusUrl: '' },
      { title: 'Levitating', artist: 'Dua Lipa', spotify: {}, geniusUrl: '' },
      { title: 'Good 4 U', artist: 'Olivia Rodrigo', spotify: {}, geniusUrl: '' },
      { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', spotify: {}, geniusUrl: '' },
      { title: 'Anti-Hero', artist: 'Taylor Swift', spotify: {}, geniusUrl: '' },
      { title: 'As It Was', artist: 'Harry Styles', spotify: {}, geniusUrl: '' },
      { title: 'Heat Waves', artist: 'Glass Animals', spotify: {}, geniusUrl: '' },
      { title: 'Bad Habit', artist: 'Steve Lacy', spotify: {}, geniusUrl: '' },
      { title: 'Flowers', artist: 'Miley Cyrus', spotify: {}, geniusUrl: '' },
      { title: 'Unholy', artist: 'Sam Smith ft. Kim Petras', spotify: {}, geniusUrl: '' },
      { title: 'Shivers', artist: 'Ed Sheeran', spotify: {}, geniusUrl: '' },
      { title: 'Industry Baby', artist: 'Lil Nas X & Jack Harlow', spotify: {}, geniusUrl: '' },
      { title: 'Peaches', artist: 'Justin Bieber ft. Daniel Caesar', spotify: {}, geniusUrl: '' },
      { title: 'Montero', artist: 'Lil Nas X', spotify: {}, geniusUrl: '' }
    ];

    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    setLastRecommendedSong(randomSong);
    addMessage(`🎵 Here's a song for you: "${randomSong.title}" by ${randomSong.artist}`);
  };

  // Quick function to add 10 songs for testing
  const add10Songs = () => {
    const songs = [
      { title: 'Song 1', artist: 'Artist 1', spotify: {}, geniusUrl: '' },
      { title: 'Song 2', artist: 'Artist 2', spotify: {}, geniusUrl: '' },
      { title: 'Song 3', artist: 'Artist 3', spotify: {}, geniusUrl: '' },
      { title: 'Song 4', artist: 'Artist 4', spotify: {}, geniusUrl: '' },
      { title: 'Song 5', artist: 'Artist 5', spotify: {}, geniusUrl: '' },
      { title: 'Song 6', artist: 'Artist 6', spotify: {}, geniusUrl: '' },
      { title: 'Song 7', artist: 'Artist 7', spotify: {}, geniusUrl: '' },
      { title: 'Song 8', artist: 'Artist 8', spotify: {}, geniusUrl: '' },
      { title: 'Song 9', artist: 'Artist 9', spotify: {}, geniusUrl: '' },
      { title: 'Song 10', artist: 'Artist 10', spotify: {}, geniusUrl: '' }
    ];

    songs.forEach((song, index) => {
      setTimeout(() => {
        const success = playlist.handleAddCurrentSong ?
          (() => {
            setLastRecommendedSong(song);
            return playlist.handleAddCurrentSong();
          })() :
          false;

        if (success) {
          addMessage(`✅ Added "${song.title}" to playlist (${index + 1}/10)`);
        }

        if (index === 9) {
          setTimeout(() => {
            addMessage(playlist.showPlaylist());
            addMessage(`🎉 Successfully added 10 songs! Ready to save to Spotify.`);
          }, 500);
        }
      }, index * 200); // Stagger the additions
    });
  };

  // Example: Show song recommendation with playlist options
  const showSongWithOptions = () => {
    if (!lastRecommendedSong) {
      addMessage('❌ No song recommendation available. Get a song first!');
      return;
    }

    const options = (
      <div className="follow-ups">
        <p className="follow-up-intro">🎵 Love this song? What's next?</p>
        
        {playlist.playlistLength > 0 ? (
          <button 
            className="follow-up-button" 
            onClick={() => {
              playlist.handleAddCurrentSong();
              setTimeout(() => {
                addMessage(playlist.showPlaylist());
              }, 500);
            }}
          >
            ➕ Add to My Playlist ({playlist.playlistLength} songs)
          </button>
        ) : (
          <button 
            className="follow-up-button" 
            onClick={() => {
              playlist.handleStartPlaylist();
              setTimeout(() => {
                addMessage(playlist.showPlaylist());
              }, 500);
            }}
          >
            ➕ Start Playlist with This Song
          </button>
        )}
        
        <button className="follow-up-button" onClick={simulateRecommendation}>
          🔄 Get Another Song
        </button>
        
        {playlist.playlistLength > 0 && (
          <button 
            className="follow-up-button" 
            onClick={() => addMessage(playlist.showPlaylist())}
          >
            👀 View My Playlist ({playlist.playlistLength} songs)
          </button>
        )}
      </div>
    );

    addMessage(options);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎵 MoodTunes - Clean Playlist Flow</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={simulateRecommendation} style={{ margin: '0.5rem' }}>
          🎵 Get Song Recommendation
        </button>
        <button onClick={showSongWithOptions} style={{ margin: '0.5rem' }}>
          ➕ Show Playlist Options
        </button>
        <button onClick={add10Songs} style={{ margin: '0.5rem', backgroundColor: '#4CAF50', color: 'white' }}>
          🚀 Quick Add 10 Songs
        </button>
        {playlist.playlistLength > 0 && (
          <button onClick={() => addMessage(playlist.showPlaylist())} style={{ margin: '0.5rem' }}>
            👀 View Playlist ({playlist.playlistLength} songs)
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <strong>Status:</strong> {playlist.playlistLength} songs in playlist
        {playlist.canSaveToSpotify && ' ✅ Ready for Spotify!'}
      </div>

      <div style={{ 
        background: 'rgba(0,0,0,0.1)', 
        padding: '1rem', 
        borderRadius: '8px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            {typeof msg.text === 'string' ? msg.text : msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatbotWithPlaylist;
