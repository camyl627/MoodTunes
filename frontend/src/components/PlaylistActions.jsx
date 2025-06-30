const PlaylistActions = ({
  playlist,
  onAddMoreSongs,
  onRemoveSongs,
  onSaveToSpotify,
  onClearPlaylist
}) => {

  const playlistLength = playlist?.length || 0;
  const canSaveToSpotify = playlistLength >= 3;

  return (
    <div className="follow-ups">
      <p className="follow-up-intro">🎵 Playlist Management ({playlistLength} songs saved)</p>

      <button
        className="follow-up-button"
        onClick={onAddMoreSongs}
      >
        ➕ Add More Songs
      </button>

      {playlistLength > 0 && (
        <button
          className="follow-up-button"
          onClick={onRemoveSongs}
        >
          ❌ Remove Songs
        </button>
      )}

      {canSaveToSpotify ? (
        <button
          className="follow-up-button"
          onClick={onSaveToSpotify}
          style={{ backgroundColor: '#1DB954', color: 'white' }}
        >
          💾 Save {playlistLength} Songs to Spotify
        </button>
      ) : (
        <button
          className="follow-up-button disabled"
          disabled
          title={`Add ${3 - playlistLength} more song${3 - playlistLength > 1 ? 's' : ''} to save to Spotify`}
        >
          💾 Save to Spotify (Need {3 - playlistLength} more song{3 - playlistLength > 1 ? 's' : ''})
        </button>
      )}

      {playlistLength > 0 && (
        <button
          className="follow-up-button"
          onClick={onClearPlaylist}
        >
          🗑️ Clear Playlist
        </button>
      )}
    </div>
  );
};

export default PlaylistActions;
