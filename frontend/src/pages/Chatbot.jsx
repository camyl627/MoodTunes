import { useState, useEffect, useRef } from 'react';
import { IoSend } from 'react-icons/io5';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistMood, setPlaylistMood] = useState('');
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);
  const [lastRecommendedSong, setLastRecommendedSong] = useState(null);
  const [currentMoodTheme, setCurrentMoodTheme] = useState('');
  const hasShownWelcomeRef = useRef(false);

  // Debug: Log when component mounts and add welcome message
  useEffect(() => {
    console.log('Chatbot component mounted successfully');
    
    // Prevent duplicate welcome messages
    if (hasShownWelcomeRef.current) return;
    hasShownWelcomeRef.current = true;
    
    // Check for Spotify auth callback
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const spotifyAuth = urlParams.get('spotify_auth');
    
    if (spotifyAuth === 'success' && accessToken) {
      setSpotifyToken(accessToken);
      setIsSpotifyConnected(true);

      // Check if there's a pending playlist to create
      const pendingPlaylist = localStorage.getItem('moodtunes_pending_playlist');
      if (pendingPlaylist) {
        try {
          const playlistData = JSON.parse(pendingPlaylist);
          // Check if the data is recent (within 10 minutes)
          if (Date.now() - playlistData.timestamp < 10 * 60 * 1000) {
            setCurrentPlaylist(playlistData.songs);
            setIsPlaylistMode(true);
            appendMessage('🎉 Successfully connected to Spotify!');
            appendMessage(`🎵 Found your pending playlist with ${playlistData.songs.length} songs. Let's create it now!`);

            // Clear the pending playlist
            localStorage.removeItem('moodtunes_pending_playlist');

            // Show playlist naming options
            setTimeout(() => {
              showPlaylistNamingOptions();
            }, 1000);
          } else {
            // Expired, just show success
            localStorage.removeItem('moodtunes_pending_playlist');
            appendMessage('🎉 Successfully connected to Spotify! You can now create playlists.');
          }
        } catch (error) {
          console.error('Error parsing pending playlist:', error);
          localStorage.removeItem('moodtunes_pending_playlist');
          appendMessage('🎉 Successfully connected to Spotify! You can now create playlists.');
        }
      } else {
        appendMessage('🎉 Successfully connected to Spotify! You can now create playlists.');
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Only show welcome message if not coming from Spotify auth
      setTimeout(() => {
        appendMessage('Welcome to MoodTunes! 🎵 Tell me how you\'re feeling and I\'ll find the perfect song for your mood!');
      }, 500);
    }
  }, []);



  // Removed automatic scroll - users can scroll manually for better control

  // Cleanup mood classes on unmount
  useEffect(() => {
    return () => {
      const appElement = document.querySelector('.app');
      if (appElement) {
        appElement.className = appElement.className.replace(/mood-\w+/g, '');
      }
    };
  }, []);

  // Debug playlist changes
  useEffect(() => {
    console.log('🔄 Playlist state changed:', currentPlaylist);
    console.log('📊 New playlist length:', currentPlaylist.length);
    console.log('🎵 Songs in playlist:', currentPlaylist.map(song => `${song.title} - ${song.artist}`));
  }, [currentPlaylist]);

  const appendMessage = (text, sender = 'bot') => {
    console.log('Adding message:', { text, sender });
    setMessages(prev => [...prev, { text, sender }]);
  };

  const handleInputChange = (e) => setInput(e.target.value);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSending) {
      sendMessage();
    }
  };

  // Detect mood from user messages and update theme
  const detectAndUpdateMood = (message) => {
    const lowerMessage = message.toLowerCase();

    // Mood detection keywords
    const moodKeywords = {
      happy: ['happy', 'joyful', 'excited', 'cheerful', 'upbeat', 'energetic', 'positive', 'good', 'great', 'amazing', 'fantastic', 'wonderful'],
      sad: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'lonely', 'heartbroken', 'crying', 'tears', 'sorrow', 'grief'],
      energetic: ['energetic', 'pumped', 'hyped', 'active', 'workout', 'gym', 'running', 'dancing', 'party', 'wild', 'intense'],
      calm: ['calm', 'peaceful', 'relaxed', 'chill', 'zen', 'meditative', 'quiet', 'serene', 'tranquil', 'mellow'],
      romantic: ['romantic', 'love', 'valentine', 'date', 'crush', 'relationship', 'intimate', 'passionate', 'tender', 'sweet'],
      nostalgic: ['nostalgic', 'memories', 'past', 'childhood', 'old', 'vintage', 'throwback', 'remember', 'miss', 'used to'],
      dark: ['dark', 'gothic', 'metal', 'heavy', 'intense', 'angry', 'rage', 'frustrated', 'mad', 'aggressive']
    };

    // Find the mood with the most keyword matches
    let detectedMood = '';
    let maxMatches = 0;

    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedMood = mood;
      }
    });

    // Update mood theme if detected
    if (detectedMood && detectedMood !== currentMoodTheme) {
      setCurrentMoodTheme(detectedMood);
      console.log('Mood detected and updated:', detectedMood);

      // Apply mood class to the app container for global theming
      const appElement = document.querySelector('.app');
      if (appElement) {
        // Remove existing mood classes
        appElement.className = appElement.className.replace(/mood-\w+/g, '');
        // Add new mood class
        if (detectedMood) {
          appElement.classList.add(`mood-${detectedMood}`);
        }
      }

      // Add a subtle notification about mood change
      setTimeout(() => {
        appendMessage(
          <div style={{
            textAlign: 'center',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '0.9rem',
            opacity: 0.8,
            fontStyle: 'italic'
          }}>
            🎨 Theme updated to match your {detectedMood} mood
          </div>
        );
      }, 1200);
    }
  };

  // Playlist Management Functions
  const addSongToPlaylist = (song) => {
    console.log('🎵 ADDING SONG:', song.title, 'by', song.artist);

    // Use functional state update to ensure we get the latest state
    setCurrentPlaylist(prevPlaylist => {
      console.log('📋 PREVIOUS PLAYLIST:', prevPlaylist.length, 'songs');

      // Check for duplicates
      const isDuplicate = prevPlaylist.some(existingSong =>
        existingSong.title === song.title && existingSong.artist === song.artist
      );

      if (isDuplicate) {
        console.log('⚠️ DUPLICATE FOUND, NOT ADDING');
        appendMessage(`⚠️ "${song.title}" by ${song.artist} is already in your playlist!`);
        return prevPlaylist;
      }

      const newPlaylist = [...prevPlaylist, song];
      console.log('✅ NEW PLAYLIST:', newPlaylist.length, 'songs');
      console.log('🎵 SONGS:', newPlaylist.map(s => `${s.title} - ${s.artist}`));

      return newPlaylist;
    });

    setLastRecommendedSong(song);
    setIsPlaylistMode(true);

    // Return the expected new playlist for immediate use
    const expectedPlaylist = [...currentPlaylist, song];
    return expectedPlaylist;
  };

  const removeSongFromPlaylist = (index) => {
    const newPlaylist = currentPlaylist.filter((_, i) => i !== index);
    setCurrentPlaylist(newPlaylist);
    return newPlaylist;
  };

  const clearPlaylist = () => {
    setCurrentPlaylist([]);
    setPlaylistName('');
    setPlaylistMood('');
    setIsPlaylistMode(false);
    setLastRecommendedSong(null);
  };



  // Show current playlist and management actions
  const showCurrentPlaylistAndActions = (playlistToShow = null) => {
    // Always use the provided playlist if available, otherwise current state
    const playlist = playlistToShow || currentPlaylist;

    console.log('🎵 Showing playlist - provided:', playlistToShow?.length || 0, 'current:', currentPlaylist.length);
    console.log('📊 Final playlist to display:', playlist.length, 'songs');

    // Always show the playlist, even if empty
    if (playlist.length > 0) {
      const playlistDisplay = (
        <div className="playlist-display">
          <h3>🎵 Your Current Playlist ({playlist.length} songs):</h3>
          {playlist.map((song, index) => (
            <div key={index} className="playlist-item">
              <span className="track-number">{index + 1}.</span>
              <div className="track-info">
                <p><strong>{song.title}</strong> by <em>{song.artist}</em></p>
                {song.spotify?.external_url && (
                  <a href={song.spotify.external_url} target="_blank" rel="noopener noreferrer" className="spotify-link">
                    🎵 Preview on Spotify
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      );
      appendMessage(playlistDisplay);
    }

    // Then show playlist management actions
    setTimeout(() => {
      const playlistActions = (
        <div className="follow-ups">
          <p className="follow-up-intro">🎵 Playlist Management ({playlist.length} songs saved)</p>
          <button
            className="follow-up-button"
            onClick={() => handleFollowUpAction('add_more_songs')}
          >
            ➕ Add More Songs
          </button>
          <button
            className="follow-up-button"
            onClick={() => showRemoveSongOptions()}
          >
            ❌ Remove Songs
          </button>
          <button
            className="follow-up-button"
            onClick={() => {
              console.log('🐛 DEBUG - Current playlist state:', currentPlaylist);
              console.log('🐛 DEBUG - Playlist length:', currentPlaylist.length);
              appendMessage(`🐛 DEBUG: Playlist has ${currentPlaylist.length} songs: ${currentPlaylist.map(song => `${song.title} - ${song.artist}`).join(', ') || 'None'}`);
            }}
          >
            🐛 Debug Playlist
          </button>
          <button
            className="follow-up-button"
            onClick={() => {
              // Direct state manipulation test
              const testSong = { title: `Test Song ${Date.now()}`, artist: 'Test Artist', spotify: {}, geniusUrl: '' };
              console.log('🧪 DIRECT TEST - Adding:', testSong.title);

              setCurrentPlaylist(prev => {
                const newList = [...prev, testSong];
                console.log('🧪 DIRECT TEST - New playlist:', newList.length, 'songs');

                // Show playlist immediately
                setTimeout(() => {
                  appendMessage(`🧪 DIRECT TEST: Playlist now has ${newList.length} songs`);
                  if (newList.length > 0) {
                    const playlistDisplay = (
                      <div className="playlist-display">
                        <h3>🧪 TEST PLAYLIST ({newList.length} songs):</h3>
                        {newList.map((song, index) => (
                          <div key={index} className="playlist-item">
                            <span className="track-number">{index + 1}.</span>
                            <div className="track-info">
                              <p><strong>{song.title}</strong> by <em>{song.artist}</em></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                    appendMessage(playlistDisplay);
                  }
                }, 100);

                return newList;
              });
            }}
          >
            🧪 Direct Test
          </button>
          {playlist.length >= 3 ? (
            <button
              className="follow-up-button"
              onClick={() => handleFollowUpAction('create_spotify_playlist')}
            >
              🎵 Create Playlist on Spotify ({playlist.length} songs)
            </button>
          ) : (
            <button
              className="follow-up-button disabled"
              disabled
              title={`Add ${3 - playlist.length} more song${3 - playlist.length > 1 ? 's' : ''} to create playlist`}
            >
              🎵 Create Playlist (Need {3 - playlist.length} more song{3 - playlist.length > 1 ? 's' : ''})
            </button>
          )}
          {playlist.length >= 3 && (
            <button
              className="follow-up-button"
              onClick={() => handleFollowUpAction('finalize_playlist')}
            >
              💾 Other Save Options
            </button>
          )}
          <button
            className="follow-up-button"
            onClick={() => handleFollowUpAction('stop_playlist')}
          >
            🛑 Stop & Clear Playlist
          </button>
        </div>
      );
      appendMessage(playlistActions);
    }, 500);
  };



  // Helper function to show playlist review
  const showPlaylistReview = () => {
    if (currentPlaylist.length === 0) {
      appendMessage('🎵 Your playlist is empty! Add some songs first.');
      return;
    }

    const playlistDisplay = (
      <div className="playlist-display">
        <h3>🎵 Your Playlist Review ({currentPlaylist.length} songs):</h3>
        {currentPlaylist.map((song, index) => (
          <div key={index} className="playlist-item">
            <span className="track-number">{index + 1}.</span>
            <div className="track-info">
              <p><strong>{song.title}</strong> by <em>{song.artist}</em></p>
              {song.spotify?.external_url && (
                <a href={song.spotify.external_url} target="_blank" rel="noopener noreferrer" className="spotify-link">
                  🎵 Preview on Spotify
                </a>
              )}
            </div>
          </div>
        ))}
        <div className="playlist-actions">
          <p className="playlist-summary">
            {playlist.length < 3 && `🎵 Add ${3 - playlist.length} more song${3 - playlist.length > 1 ? 's' : ''} to create a Spotify playlist (minimum 3 songs required)`}
            {playlist.length >= 3 && playlist.length < 8 && '✨ Perfect! Your playlist is ready to save to Spotify.'}
            {playlist.length >= 8 && '🎉 Amazing playlist! Ready to save to Spotify.'}
          </p>
        </div>
      </div>
    );
    appendMessage(playlistDisplay);

    setTimeout(() => {
      appendMessage(
        <div className="follow-ups">
          <p className="follow-up-intro">🎵 Playlist Review Complete. What would you like to do?</p>
          <button className="follow-up-button" onClick={() => handleFollowUpAction('different_mood')}>
            ➕ Add More Songs
          </button>
          <button className="follow-up-button" onClick={() => showRemoveSongOptions()}>
            ❌ Remove a Song
          </button>
          <button className="follow-up-button" onClick={() => handleFollowUpAction('finalize_playlist')}>
            🎯 Ready to Save!
          </button>
        </div>
      );
    }, 1000);
  };

  // Helper function to show remove song options
  const showRemoveSongOptions = () => {
    if (currentPlaylist.length === 0) {
      appendMessage('🎵 Your playlist is empty! Nothing to remove.');
      return;
    }

    const removeButtons = (
      <div className="follow-ups">
        <p className="follow-up-intro">❌ Which song would you like to remove?</p>
        {currentPlaylist.map((song, index) => (
          <button
            key={index}
            className="follow-up-button remove-song-btn"
            onClick={() => handleFollowUpAction('remove_song', index)}
          >
            ❌ {song.title} - {song.artist}
          </button>
        ))}
      </div>
    );
    appendMessage(removeButtons);
  };

  // Helper function to show playlist finalization options
  const showPlaylistFinalization = () => {
    if (currentPlaylist.length === 0) {
      appendMessage('🎵 Your playlist is empty! Add some songs first.');
      return;
    }

    appendMessage(`🎯 Perfect! Your playlist has ${currentPlaylist.length} songs and is ready to save.`);

    setTimeout(() => {
      appendMessage(
        <div className="follow-ups">
          <p className="follow-up-intro">🎵 Choose how to save your playlist:</p>
          <button className="follow-up-button" onClick={() => handleSpotifyPlaylistSave()}>
            {isSpotifyConnected ? '💾 Save to Spotify' : '🔐 Connect & Save to Spotify'}
          </button>
          <button className="follow-up-button" onClick={() => exportPlaylistAsText()}>
            📝 Export as Text List
          </button>
          <button className="follow-up-button" onClick={() => sharePlaylist()}>
            📤 Share Playlist
          </button>
          <button className="follow-up-button" onClick={() => handleFollowUpAction('new_playlist')}>
            🆕 Start New Playlist
          </button>
        </div>
      );
    }, 500);
  };

  // Export playlist as text
  const exportPlaylistAsText = () => {
    if (currentPlaylist.length === 0) {
      appendMessage('🎵 Your playlist is empty! Add some songs first.');
      return;
    }

    const playlistText = currentPlaylist
      .map((song, index) => `${index + 1}. ${song.title} - ${song.artist}`)
      .join('\n');

    const exportDisplay = (
      <div className="playlist-export">
        <h3>📝 Your Playlist as Text:</h3>
        <pre className="playlist-text">{playlistText}</pre>
        <p className="export-tip">💡 Copy this text to save or share your playlist!</p>
      </div>
    );
    appendMessage(exportDisplay);
  };

  // Share playlist
  const sharePlaylist = () => {
    if (currentPlaylist.length === 0) {
      appendMessage('🎵 Your playlist is empty! Add some songs first.');
      return;
    }

    const shareText = `🎵 Check out my MoodTunes playlist!\n\n${currentPlaylist
      .map((song, index) => `${index + 1}. ${song.title} - ${song.artist}`)
      .join('\n')}\n\nCreated with MoodTunes 🎶`;

    appendMessage('📤 Here\'s your shareable playlist:');
    appendMessage(
      <div className="playlist-share">
        <pre className="share-text">{shareText}</pre>
        <button
          className="follow-up-button"
          onClick={() => {
            navigator.clipboard.writeText(shareText);
            appendMessage('✅ Playlist copied to clipboard! You can now paste it anywhere.');
          }}
        >
          📋 Copy to Clipboard
        </button>
      </div>
    );
  };

  // Handle specific follow-up actions
  const handleFollowUpAction = async (action, data = null) => {
    console.log('Follow-up action:', action, data);
    setIsSending(true);

    try {
      switch (action) {
        case 'start_playlist_with_song':
          console.log('🎵 Starting playlist with song data:', data);

          const songToAdd = data || lastRecommendedSong;
          if (songToAdd) {
            // Clear any existing playlist first
            setCurrentPlaylist([]);
            setIsPlaylistMode(true);

            // Add the song to the now-empty playlist
            const newPlaylist = [songToAdd];
            setCurrentPlaylist(newPlaylist);
            setLastRecommendedSong(songToAdd);

            appendMessage(`🎵 Started a new playlist! Added "${songToAdd.title}" by ${songToAdd.artist} as your first song.`);

            // Show the playlist immediately
            setTimeout(() => {
              showCurrentPlaylistAndActions(newPlaylist);
            }, 300);
          } else {
            console.log('❌ No song data available');
            appendMessage('❌ No song to start playlist with. Please get a song recommendation first!');
          }
          break;

        case 'add_current':
          console.log('🎯 Manual add triggered - data:', data, 'lastRecommendedSong:', lastRecommendedSong);
          const songToAddCurrent = data || lastRecommendedSong;
          if (songToAddCurrent) {
            console.log('✅ Adding song manually:', songToAddCurrent);
            const updatedPlaylist = addSongToPlaylist(songToAddCurrent);
            appendMessage(`✅ Added "${songToAddCurrent.title}" by ${songToAddCurrent.artist} to your playlist!`);

            // Show updated playlist immediately
            setTimeout(() => {
              showCurrentPlaylistAndActions(updatedPlaylist);
            }, 300);
          } else {
            console.log('❌ No song available to add');
            appendMessage('❌ No song to add. Please get a song recommendation first!');
          }
          break;

        case 'skip_song':
          appendMessage('⏭️ Skipped this song. Let\'s find another one for your playlist!');
          setTimeout(() => {
            appendMessage(
              <div className="follow-ups">
                <p className="follow-up-intro">🎵 Continue building your playlist:</p>
                <button className="follow-up-button" onClick={() => handleFollowUpAction('similar_song')}>
                  🔄 Try Another Song
                </button>
                <button className="follow-up-button" onClick={() => handleFollowUpAction('different_mood')}>
                  🎭 Different Mood
                </button>
                <button className="follow-up-button" onClick={() => handleFollowUpAction('review_playlist')}>
                  👀 Review Current Playlist ({currentPlaylist.length} songs)
                </button>
              </div>
            );
          }, 500);
          break;

        case 'stop_playlist':
          const playlistLength = currentPlaylist.length;
          clearPlaylist(); // This clears everything including isPlaylistMode

          if (playlistLength > 0) {
            appendMessage(`🛑 Cleared your playlist (${playlistLength} songs removed). You can start a new playlist anytime!`);
          } else {
            appendMessage('🛑 Stopped playlist creation. You can start a new one anytime!');
          }

          setTimeout(() => {
            appendMessage(
              <div className="follow-ups">
                <p className="follow-up-intro">🎵 What would you like to do now?</p>
                <button className="follow-up-button" onClick={() => handleFollowUpAction('similar_song')}>
                  🔄 Get Another Song
                </button>
                <button className="follow-up-button" onClick={() => handleFollowUpAction('different_mood')}>
                  🎭 Different Mood
                </button>
              </div>
            );
          }, 500);
          break;

        case 'similar_song':
          const songForSimilar = data || lastRecommendedSong;
          if (songForSimilar) {
            const prompt = `Give me another song similar to "${songForSimilar.title}" by ${songForSimilar.artist} with the same energy and mood.`;
            await sendMessage(prompt, true);
          } else {
            await sendMessage('Give me another song with the same energy as the last one.', true);
          }
          break;

        case 'add_more_songs':
          appendMessage('🎵 Let\'s add more songs to your playlist! What mood or style would you like to add?');

          setTimeout(() => {
            const addSongsOptions = (
              <div className="follow-ups">
                <p className="follow-up-intro">🎵 Quick options to add songs:</p>
                <button
                  className="follow-up-button"
                  onClick={() => {
                    appendMessage('Same mood', 'user');
                    sendMessage('Add another song with the same mood and energy as my current playlist', true);
                  }}
                >
                  🔄 Same Mood/Energy
                </button>
                <button
                  className="follow-up-button"
                  onClick={() => {
                    appendMessage('Add upbeat songs', 'user');
                    sendMessage('Add some upbeat energetic songs to my playlist', true);
                  }}
                >
                  ⚡ Add Upbeat Songs
                </button>
                <button
                  className="follow-up-button"
                  onClick={() => {
                    appendMessage('Add chill songs', 'user');
                    sendMessage('Add some chill relaxing songs to my playlist', true);
                  }}
                >
                  😌 Add Chill Songs
                </button>
                <button
                  className="follow-up-button"
                  onClick={() => {
                    appendMessage('Add classic hits', 'user');
                    sendMessage('Add some classic hit songs to my playlist', true);
                  }}
                >
                  🎶 Add Classic Hits
                </button>
              </div>
            );
            appendMessage(addSongsOptions);
          }, 500);
          break;

        case 'different_mood':
          appendMessage('🎭 What mood would you like to explore? (happy, sad, energetic, calm, nostalgic, etc.)');
          break;

        case 'review_playlist':
          showPlaylistReview();
          break;

        case 'create_spotify_playlist':
          await handleSpotifyPlaylistCreation();
          break;

        case 'finalize_playlist':
          showPlaylistFinalization();
          break;

        case 'new_playlist':
          clearPlaylist();
          appendMessage('🆕 Started a new playlist! Let\'s find your first song.');
          break;

        case 'remove_song':
          if (data !== null && currentPlaylist[data]) {
            const removedSong = currentPlaylist[data];
            removeSongFromPlaylist(data);
            appendMessage(`✅ Removed "${removedSong.title}" by ${removedSong.artist} from your playlist.`);

            setTimeout(() => {
              if (currentPlaylist.length > 1) {
                appendMessage(`🎵 Your playlist now has ${currentPlaylist.length - 1} songs.`);
              } else {
                appendMessage('🎵 Your playlist is now empty. Ready to start fresh!');
              }
            }, 500);
          }
          break;

        default:
          // Handle text-based actions
          appendMessage(action, 'user');
          await sendMessage(action, true);
      }
    } catch (error) {
      console.error('Follow-up action error:', error);
      appendMessage('Sorry, something went wrong with that action.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle song recommendation response
  const handleSongRecommendationResponse = (output, conversationHistory) => {
    const { lyricsSnippet, songTitle, artist, spotify, geniusUrl } = output;
    const currentSong = {
      title: songTitle,
      artist,
      spotify: {
        track_id: spotify?.track_id,
        embed_url: spotify?.embed_url,
        external_url: spotify?.external_url
      },
      geniusUrl
    };

    // Store the recommended song
    setLastRecommendedSong(currentSong);
    console.log('Stored recommended song:', currentSong);

    // Update conversation history
    const aiResponseContent = output.conversationMessage || output.message || 'Response received';
    const aiResponse = { role: 'assistant', content: aiResponseContent };
    const newConversationHistory = [...conversationHistory, aiResponse];
    setConversationHistory(newConversationHistory);

    appendMessage(
      <div>
        <p className="lyrics">"{lyricsSnippet}"</p>
        <p className="song-info">
          🎵 <strong>{songTitle}</strong> by <em>{artist}</em>
        </p>
        {spotify?.embed_url && (
          <iframe
            title="Spotify Preview"
            src={spotify.embed_url}
            width="100%"
            height="80"
            style={{ border: 'none' }}
            allow="encrypted-media"
            className="spotify-embed"
          />
        )}
      </div>
    );

    // Show appropriate actions based on playlist state
    setTimeout(() => {
      console.log('🎵 Checking playlist mode - isPlaylistMode:', isPlaylistMode);
      console.log('📋 Current playlist length:', currentPlaylist.length);

      if (isPlaylistMode || currentPlaylist.length > 0) {
        // User is building a playlist - automatically add the song and show updated playlist
        console.log('✅ Auto-adding song to playlist');
        const updatedPlaylist = addSongToPlaylist(currentSong);
        appendMessage(`✅ Added "${currentSong.title}" by ${currentSong.artist} to your playlist!`);

        // Show updated playlist immediately using the returned playlist
        setTimeout(() => {
          showCurrentPlaylistAndActions(updatedPlaylist);
        }, 500);
      } else {
        // Regular song discovery mode
        const regularActions = (
          <div className="follow-ups">
            <p className="follow-up-intro">🎵 Love this song? What's next?</p>
            {currentPlaylist.length > 0 ? (
              <button className="follow-up-button" onClick={() => {
                console.log('Adding to existing playlist, currentSong:', currentSong);
                handleFollowUpAction('add_current', currentSong);
              }}>
                ➕ Add to My Playlist ({currentPlaylist.length} songs)
              </button>
            ) : (
              <button className="follow-up-button" onClick={() => {
                console.log('Button clicked, currentSong:', currentSong);
                handleFollowUpAction('start_playlist_with_song', currentSong);
              }}>
                ➕ Start Playlist with This Song
              </button>
            )}
            <button className="follow-up-button" onClick={() => handleFollowUpAction('similar_song', currentSong)}>
              🔄 More Like This
            </button>
            <button className="follow-up-button" onClick={() => handleFollowUpAction('different_mood')}>
              🎭 Different Vibe
            </button>
          </div>
        );
        appendMessage(regularActions);
      }
    }, 500);
  };

  // Main sendMessage function
  const sendMessage = async (messageText = null, skipUserMessage = false) => {
    const messageToSend = messageText || input.trim();
    if (!messageToSend || isSending) {
      console.log('Cannot send message:', { messageToSend, isSending });
      return;
    }

    console.log('Sending message:', messageToSend);

    // Check if we're waiting for a custom playlist name
    if (playlistName === 'WAITING_FOR_NAME' && !skipUserMessage) {
      setPlaylistName('');
      createSpotifyPlaylistWithName(messageToSend);
      setInput('');
      setIsSending(false);
      return;
    }

    // Smart detection for playlist building shortcuts
    if ((isPlaylistMode || currentPlaylist.length > 0) && !skipUserMessage) {
      const lowerMessage = messageToSend.toLowerCase();
      if (lowerMessage.includes('same mood') || lowerMessage === 'same' || lowerMessage.includes('similar')) {
        // Convert to a more specific request
        const enhancedMessage = `Add another song with the same mood and energy as my current playlist`;
        console.log('Enhanced playlist request:', enhancedMessage);
        // Replace the user message with the enhanced version
        appendMessage(messageToSend, 'user');
        setInput('');
        setIsSending(true);

        // Use the enhanced message for the API call
        const newUserMessage = { role: 'user', content: enhancedMessage };
        const updatedHistory = [...conversationHistory, newUserMessage];

        // Continue with API call using enhanced message
        try {
          const response = await fetch('/api/moodtunes-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chats: updatedHistory }),
          });

          const data = await response.json();
          const { output } = data;

          if (output && output.type === 'song_recommendation') {
            // Handle the song recommendation as usual
            handleSongRecommendationResponse(output, updatedHistory);
          } else {
            appendMessage(output?.message || 'Sorry, something went wrong.');
          }
        } catch (err) {
          console.error('Chat error:', err);
          appendMessage('Failed to get song recommendation.');
        } finally {
          setIsSending(false);
        }
        return;
      }
    }

    // Add user message unless we're skipping it
    if (!skipUserMessage) {
      appendMessage(messageToSend, 'user');
      // Detect mood from user message
      detectAndUpdateMood(messageToSend);
    }

    // Only clear input if it's from the input field
    if (!messageText) {
      setInput('');
    }

    setIsSending(true);

    // Build conversation history for proper context
    const newUserMessage = { role: 'user', content: messageToSend };
    const updatedHistory = [...conversationHistory, newUserMessage];

    try {
      console.log('Making API call with history:', updatedHistory);
      const response = await fetch('/api/moodtunes-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chats: updatedHistory
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      const { output } = data;
      if (!output) {
        appendMessage('Sorry, something went wrong.');
        return;
      }

      // Update conversation history with AI response
      const aiResponseContent = output.conversationMessage || output.message || 'Response received';
      const aiResponse = { role: 'assistant', content: aiResponseContent };
      const newConversationHistory = [...updatedHistory, aiResponse];
      setConversationHistory(newConversationHistory);
      console.log('Updated conversation history:', newConversationHistory);

      // Handle song recommendation response
      if (output.type === 'song_recommendation') {
        handleSongRecommendationResponse(output, updatedHistory);
      }

      // Handle conversational response
      if (output.type === 'conversation') {
        appendMessage(output.message);

        // Show context-appropriate follow-up prompts
        if (isPlaylistMode || currentPlaylist.length > 0) {
          // User is building a playlist - show playlist-relevant options
          setTimeout(() => {
            const playlistFollowUps = (
              <div className="follow-ups">
                <p className="follow-up-intro">🎵 Continue building your playlist:</p>
                <button
                  className="follow-up-button"
                  onClick={() => {
                    appendMessage('Get me a song recommendation', 'user');
                    sendMessage('Give me a song recommendation for my playlist', true);
                  }}
                >
                  🎵 Get Song Recommendation
                </button>
                <button
                  className="follow-up-button"
                  onClick={() => handleFollowUpAction('add_more_songs')}
                >
                  ➕ Add Different Style
                </button>
                <button
                  className="follow-up-button"
                  onClick={() => {
                    const updatedPlaylist = currentPlaylist; // Use current state
                    showCurrentPlaylistAndActions(updatedPlaylist);
                  }}
                >
                  👀 View My Playlist ({currentPlaylist.length} songs)
                </button>
              </div>
            );
            appendMessage(playlistFollowUps);
          }, 500);
        } else {
          // Regular conversation mode - show generic follow-ups
          if (output.followUps && output.followUps.length > 0) {
            const followUpButtons = (
              <div className="follow-ups">
                <p className="follow-up-intro">💭 Continue the conversation:</p>
                {output.followUps.map((prompt, index) => (
                  <button
                    key={index}
                    className="follow-up-button"
                    disabled={isSending}
                    onClick={() => handleFollowUpAction(prompt)}
                  >
                    {isSending ? '...' : prompt}
                  </button>
                ))}
              </div>
            );
            appendMessage(followUpButtons);
          }
        }
      }

      // Optional: Trivia
      if (output.trivia) {
        appendMessage(<p className="trivia">💡 {output.trivia}</p>);
      }

    } catch (err) {
      console.error('Chat error:', err);
      appendMessage('Failed to connect to the server. Error: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Spotify playlist creation with redirect
  const handleSpotifyPlaylistCreation = async () => {
    if (currentPlaylist.length === 0) {
      appendMessage('🎵 Your playlist is empty! Add some songs first.');
      return;
    }

    if (currentPlaylist.length < 3) {
      appendMessage(`🎵 You need at least 3 songs to create a Spotify playlist. You currently have ${currentPlaylist.length} song${currentPlaylist.length > 1 ? 's' : ''}.`);
      appendMessage(`💡 Add ${3 - currentPlaylist.length} more song${3 - currentPlaylist.length > 1 ? 's' : ''} and try again!`);
      return;
    }

    if (!isSpotifyConnected) {
      // Show connection flow with playlist creation intent
      appendMessage('🎵 To create playlists on Spotify, you need to connect your account first.');

      setTimeout(() => {
        const authButtons = (
          <div className="follow-ups">
            <p className="follow-up-intro">🔐 Connect to Spotify to create your playlist:</p>
            <button
              className="follow-up-button"
              onClick={async () => {
                try {
                  // Check if we're on localhost
                  if (window.location.hostname === 'localhost') {
                    appendMessage('⚠️ Spotify authentication requires the deployed version of the app.');
                    appendMessage('🌐 Please use the deployed link: https://mood-tunes-x71zoblnz-camyl-richie-giles-projects.vercel.app/');
                    appendMessage('💡 Your playlist will be saved locally until then.');
                    return;
                  }

                  // Store playlist data in localStorage for after auth
                  localStorage.setItem('moodtunes_pending_playlist', JSON.stringify({
                    songs: currentPlaylist,
                    timestamp: Date.now()
                  }));

                  const response = await fetch('/api/spotify-auth');
                  const { authUrl } = await response.json();
                  appendMessage('🔄 Redirecting to Spotify for authentication...');
                  appendMessage('💡 After connecting, your playlist will be created automatically!');

                  // Redirect to Spotify OAuth
                  window.location.href = authUrl;
                } catch (error) {
                  console.error('Spotify auth error:', error);
                  if (error.message.includes('INVALID_CLIENT')) {
                    appendMessage('⚠️ Spotify authentication is only available on the deployed version.');
                    appendMessage('🌐 Please use: https://mood-tunes-x71zoblnz-camyl-richie-giles-projects.vercel.app/');
                  } else {
                    appendMessage('❌ Failed to connect to Spotify. Please try again.');
                  }
                }
              }}
            >
              🎵 Connect & Create Playlist
            </button>
            <button
              className="follow-up-button"
              onClick={() => appendMessage('No problem! You can still export or share your playlist.')}
            >
              ❌ Skip for Now
            </button>
          </div>
        );
        appendMessage(authButtons);
      }, 500);
      return;
    }

    // User is already connected - show playlist naming options
    showPlaylistNamingOptions();
  };

  // Show playlist naming options before creating on Spotify
  const showPlaylistNamingOptions = () => {
    appendMessage('🎵 What would you like to name your Spotify playlist?');

    setTimeout(() => {
      const namingOptions = (
        <div className="follow-ups">
          <p className="follow-up-intro">💡 Choose a name for your playlist:</p>
          <button
            className="follow-up-button"
            onClick={() => {
              const suggestedName = `My MoodTunes Mix - ${new Date().toLocaleDateString()}`;
              createSpotifyPlaylistWithName(suggestedName);
            }}
          >
            🎵 "My MoodTunes Mix"
          </button>
          <button
            className="follow-up-button"
            onClick={() => {
              const suggestedName = `Mood Playlist - ${new Date().toLocaleDateString()}`;
              createSpotifyPlaylistWithName(suggestedName);
            }}
          >
            🎶 "Mood Playlist"
          </button>
          <button
            className="follow-up-button"
            onClick={() => {
              appendMessage('💭 Type your custom playlist name and I\'ll create it for you!');
              // Set a flag to capture the next user input as playlist name
              setPlaylistName('WAITING_FOR_NAME');
            }}
          >
            ✏️ Custom Name
          </button>
        </div>
      );
      appendMessage(namingOptions);
    }, 500);
  };

  // Create Spotify playlist with specific name
  const createSpotifyPlaylistWithName = async (name) => {
    try {
      appendMessage(`🎵 Creating "${name}" on Spotify...`);

      const response = await fetch('/api/spotify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_playlist',
          accessToken: spotifyToken,
          playlistName: name,
          songs: currentPlaylist
        })
      });

      const result = await response.json();

      if (result.success) {
        appendMessage(`🎉 Success! Created "${result.playlist.name}" with ${result.playlist.trackCount} songs on Spotify!`);

        setTimeout(() => {
          const successButtons = (
            <div className="follow-ups">
              <p className="follow-up-intro">🎵 Playlist created successfully!</p>
              <button
                className="follow-up-button"
                onClick={() => {
                  appendMessage('🎵 Opening your playlist on Spotify...');
                  window.open(result.playlist.url, '_blank');
                }}
              >
                🎵 Open in Spotify
              </button>
              <button
                className="follow-up-button"
                onClick={() => {
                  // Redirect to Spotify with the playlist
                  appendMessage('🔄 Redirecting to Spotify...');
                  setTimeout(() => {
                    window.location.href = result.playlist.url;
                  }, 1000);
                }}
              >
                🚀 Go to Spotify Now
              </button>
              <button
                className="follow-up-button"
                onClick={() => handleFollowUpAction('new_playlist')}
              >
                🆕 Start New Playlist
              </button>
            </div>
          );
          appendMessage(successButtons);
        }, 500);
      } else {
        appendMessage(`❌ Failed to create playlist: ${result.error}`);
      }
    } catch (error) {
      console.error('Playlist creation error:', error);
      appendMessage('❌ Failed to create playlist on Spotify. Please try again.');
    }
  };

  // Handle Spotify playlist saving (simplified version)
  const handleSpotifyPlaylistSave = async () => {
    if (currentPlaylist.length === 0) {
      appendMessage('🎵 Your playlist is empty! Add some songs first.');
      return;
    }

    if (!isSpotifyConnected) {
      appendMessage('🔐 To save playlists to Spotify, you need to connect your account first.');

      setTimeout(() => {
        const authButtons = (
          <div className="follow-ups">
            <p className="follow-up-intro">🎵 Connect to Spotify:</p>
            <button
              className="follow-up-button"
              onClick={async () => {
                try {
                  const response = await fetch('/api/spotify-auth');
                  const { authUrl } = await response.json();
                  appendMessage('🔄 Redirecting to Spotify for authentication...');
                  window.location.href = authUrl;
                } catch (error) {
                  appendMessage('❌ Failed to connect to Spotify. Please try again.');
                }
              }}
            >
              🎵 Connect Spotify Account
            </button>
            <button
              className="follow-up-button"
              onClick={() => appendMessage('No problem! Your playlist will stay here in the chat.')}
            >
              ❌ Skip for Now
            </button>
          </div>
        );
        appendMessage(authButtons);
      }, 500);
      return;
    }

    // Create playlist with default name
    try {
      appendMessage('🎵 Creating your playlist on Spotify...');

      const defaultName = `MoodTunes Playlist - ${new Date().toLocaleDateString()}`;

      const response = await fetch('/api/spotify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_playlist',
          accessToken: spotifyToken,
          playlistName: defaultName,
          songs: currentPlaylist
        })
      });

      const result = await response.json();

      if (result.success) {
        appendMessage(`🎉 Success! Created "${result.playlist.name}" with ${result.playlist.trackCount} songs on Spotify!`);

        setTimeout(() => {
          const successButtons = (
            <div className="follow-ups">
              <p className="follow-up-intro">🎵 Playlist created successfully!</p>
              <button
                className="follow-up-button"
                onClick={() => window.open(result.playlist.url, '_blank')}
              >
                🎵 Open in Spotify
              </button>
              <button
                className="follow-up-button"
                onClick={() => handleFollowUpAction('new_playlist')}
              >
                🆕 Start New Playlist
              </button>
            </div>
          );
          appendMessage(successButtons);
        }, 500);
      } else {
        appendMessage(`❌ Failed to create playlist: ${result.error}`);
      }
    } catch (error) {
      console.error('Playlist save error:', error);
      appendMessage('❌ Failed to save playlist to Spotify. Please try again.');
    }
  };

  return (
    <div className={`chatbot-page ${currentMoodTheme ? `mood-${currentMoodTheme}` : ''}`}>
      <div className="chatbot-heading">
        <h1>Hi there, welcome to MoodTunes!</h1>
        <h2>What's your current mood or vibe?</h2>
        {currentMoodTheme && (
          <div className="mood-indicator">
            <span className="mood-emoji">
              {currentMoodTheme === 'happy' && '😊'}
              {currentMoodTheme === 'sad' && '😢'}
              {currentMoodTheme === 'energetic' && '⚡'}
              {currentMoodTheme === 'calm' && '😌'}
              {currentMoodTheme === 'romantic' && '💕'}
              {currentMoodTheme === 'nostalgic' && '🌅'}
              {currentMoodTheme === 'dark' && '🖤'}
            </span>
            <span className="mood-text">
              {currentMoodTheme.charAt(0).toUpperCase() + currentMoodTheme.slice(1)} vibes detected
            </span>
          </div>
        )}
      </div>

      <main className="chatbot-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {typeof msg.text === 'string' ? <p>{msg.text}</p> : msg.text}
            </div>
          ))}
          {isSending && (
            <div className="message bot typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={currentMoodTheme ?
              `Tell me more about your ${currentMoodTheme} mood...` :
              "How are you feeling? Tell me your mood..."
            }
            className="message-input"
            disabled={isSending}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isSending || !input.trim()}
            className="send-button"
            title={isSending ? "Sending..." : "Send message"}
          >
            {isSending ? '⏳' : <IoSend />}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
