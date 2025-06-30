import { useState, useCallback } from 'react';

const usePlaylist = () => {
  const [playlist, setPlaylist] = useState([]);
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);

  const addSong = useCallback((song) => {
    let wasAdded = false;

    setPlaylist(prevPlaylist => {
      // Check for duplicates
      const isDuplicate = prevPlaylist.some(existingSong =>
        existingSong.title === song.title && existingSong.artist === song.artist
      );

      if (isDuplicate) {
        return prevPlaylist;
      }

      const newPlaylist = [...prevPlaylist, song];
      wasAdded = true;
      return newPlaylist;
    });

    setIsPlaylistMode(true);
    return wasAdded;
  }, []);

  const removeSong = useCallback((index) => {
    setPlaylist(prevPlaylist => {
      return prevPlaylist.filter((_, i) => i !== index);
    });
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setIsPlaylistMode(false);
  }, []);

  const startNewPlaylist = useCallback((firstSong) => {
    setPlaylist([firstSong]);
    setIsPlaylistMode(true);
    return [firstSong];
  }, []);

  const canSaveToSpotify = playlist.length >= 3;

  return {
    playlist,
    isPlaylistMode,
    addSong,
    removeSong,
    clearPlaylist,
    startNewPlaylist,
    canSaveToSpotify,
    playlistLength: playlist.length
  };
};

export default usePlaylist;
