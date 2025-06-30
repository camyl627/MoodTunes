import './PlaylistManager.css';

const PlaylistDisplay = ({ playlist, onRemoveSong, showActions = true }) => {
  if (!playlist || playlist.length === 0) {
    return (
      <div className="playlist-display">
        <h3>🎵 Your Playlist is Empty</h3>
        <p className="playlist-summary">Add some songs to get started!</p>
      </div>
    );
  }

  return (
    <div className="playlist-display">
      <h3>🎵 Your Current Playlist ({playlist.length} songs):</h3>
      {playlist.map((song, index) => (
        <div key={`${song.title}-${song.artist}-${index}`} className="playlist-item">
          <span className="track-number">{index + 1}.</span>
          <div className="track-info">
            <p><strong>{song.title}</strong> by <em>{song.artist}</em></p>
            {song.spotify?.external_url && (
              <a
                href={song.spotify.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="spotify-link"
              >
                🎵 Preview on Spotify
              </a>
            )}
          </div>
          {showActions && onRemoveSong && (
            <button
              className="remove-song-btn"
              onClick={() => onRemoveSong(index)}
              title="Remove song"
            >
              ❌
            </button>
          )}
        </div>
      ))}
      <div className="playlist-actions">
        <p className="playlist-summary">
          {playlist.length < 3 && `🎵 Add ${3 - playlist.length} more song${3 - playlist.length > 1 ? 's' : ''} to save to Spotify (minimum 3 songs required)`}
          {playlist.length >= 3 && playlist.length < 10 && `✨ Perfect! Your playlist with ${playlist.length} songs is ready to save to Spotify.`}
          {playlist.length >= 10 && `🎉 Amazing! You have ${playlist.length} songs - perfect for a great playlist!`}
        </p>
      </div>
    </div>
  );
};

export default PlaylistDisplay;
