import usePlaylist from '../hooks/usePlaylist';
import PlaylistDisplay from './PlaylistDisplay';
import PlaylistActions from './PlaylistActions';

const PlaylistIntegration = ({ 
  onAddMoreSongs, 
  onSaveToSpotify, 
  onMessage,
  lastRecommendedSong 
}) => {
  const { 
    playlist, 
    isPlaylistMode, 
    addSong, 
    removeSong, 
    clearPlaylist, 
    startNewPlaylist,
    canSaveToSpotify,
    playlistLength
  } = usePlaylist();

  // Function to handle adding current song to playlist
  const handleAddCurrentSong = () => {
    if (lastRecommendedSong) {
      const success = addSong(lastRecommendedSong);
      if (success) {
        onMessage(`✅ Added "${lastRecommendedSong.title}" by ${lastRecommendedSong.artist} to your playlist!`);
        return true;
      } else {
        onMessage(`⚠️ "${lastRecommendedSong.title}" is already in your playlist!`);
        return false;
      }
    }
    return false;
  };

  // Function to start new playlist with current song
  const handleStartPlaylist = () => {
    if (lastRecommendedSong) {
      startNewPlaylist(lastRecommendedSong);
      onMessage(`🎵 Started a new playlist! Added "${lastRecommendedSong.title}" by ${lastRecommendedSong.artist} as your first song.`);
      return true;
    }
    return false;
  };

  // Function to handle removing songs
  const handleRemoveSongs = () => {
    if (playlistLength === 0) {
      onMessage('🎵 Your playlist is empty!');
      return;
    }

    // Show remove options
    const removeOptions = playlist.map((song, index) => ({
      text: `❌ Remove "${song.title}" by ${song.artist}`,
      action: () => {
        removeSong(index);
        onMessage(`✅ Removed "${song.title}" from your playlist.`);
      }
    }));

    return removeOptions;
  };

  // Function to handle clearing playlist
  const handleClearPlaylist = () => {
    const songsCount = playlistLength;
    clearPlaylist();
    onMessage(`🗑️ Cleared your playlist (${songsCount} songs removed).`);
  };

  // Function to show current playlist
  const showPlaylist = () => {
    return (
      <div>
        <PlaylistDisplay 
          playlist={playlist} 
          onRemoveSong={(index) => {
            const song = playlist[index];
            removeSong(index);
            onMessage(`✅ Removed "${song.title}" from your playlist.`);
          }}
          showActions={false}
        />
        <PlaylistActions
          playlist={playlist}
          onAddMoreSongs={onAddMoreSongs}
          onRemoveSongs={() => {
            const options = handleRemoveSongs();
            return options;
          }}
          onSaveToSpotify={() => onSaveToSpotify(playlist)}
          onClearPlaylist={handleClearPlaylist}
        />
      </div>
    );
  };

  return {
    playlist,
    isPlaylistMode,
    playlistLength,
    canSaveToSpotify,
    handleAddCurrentSong,
    handleStartPlaylist,
    handleRemoveSongs,
    handleClearPlaylist,
    showPlaylist
  };
};

export default PlaylistIntegration;
