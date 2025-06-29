import { useState, useEffect, useRef, useCallback } from 'react';
import { IoSend } from 'react-icons/io5';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mood, setMood] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container || !messagesEndRef.current) return;

    const { clientHeight, scrollHeight, scrollTop } = container;
    const nearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    if (nearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(messages.length > 2 ? 'smooth' : 'auto');
  }, [messages, scrollToBottom]);

  const appendMessage = (text, sender = 'bot') => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const handleInputChange = (e) => setInput(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSending) sendMessage();
  };

  const handleFollowUpClick = (prompt) => {
    if (isSending) return;
    setInput(prompt);
    // Automatically send the follow-up prompt
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    appendMessage(trimmed, 'user');
    setInput('');
    setIsSending(true);

    const isFirstInteraction = mood === null;
    const prompt = isFirstInteraction
      ? `My mood is: ${trimmed}. Give me a song and lyrics that matches.`
      : trimmed;

    try {
      const response = await fetch('/api/moodtunes-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chats: [{ role: 'user', content: prompt }] }),
      });

      const { output } = await response.json();
      if (!output) {
        appendMessage('Sorry, something went wrong.');
        return;
      }

      // Handle song recommendation response
      if (output.type === 'song_recommendation') {
        const { lyricsSnippet, songTitle, artist, spotify, geniusUrl, conversationMessage } = output;

        // Show the conversational message first if it exists
        if (conversationMessage && conversationMessage !== `"${lyricsSnippet}"\n— ${songTitle} by ${artist}`) {
          appendMessage(conversationMessage);
        }

        // Then show the song recommendation
        appendMessage(
          <>
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
            <p className="lyrics-full">
              <a href={geniusUrl} target="_blank" rel="noopener noreferrer">
                View full lyrics on Genius →
              </a>
            </p>
          </>
        );

        if (isFirstInteraction) setMood(trimmed);
      }

      // Handle conversational response
      if (output.type === 'conversation') {
        appendMessage(output.message);
      }

      // Show follow-up prompts
      if (output.followUps && output.followUps.length > 0) {
        appendMessage(
          <div className="follow-ups">
            <p className="follow-up-intro">💭 What's next?</p>
            {output.followUps.map((prompt, index) => (
              <button
                key={index}
                className="follow-up-button"
                onClick={() => handleFollowUpClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        );
      }

      // Optional: Trivia
      if (output.trivia) {
        appendMessage(<p className="trivia">💡 {output.trivia}</p>);
      }

      // Optional: Follow-up questions
      output.followUps?.forEach(fu =>
        appendMessage(<p className="follow-up">🤔 {fu}</p>)
      );
    } catch (err) {
      console.error('Chat error:', err);
      appendMessage('Failed to connect to the server.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chatbot-page">
      <header className="chatbot-heading">
        <h1>Hi there, welcome to MoodTunes!</h1>
        <h2>{mood ? `You're feeling ${mood}. Let's vibe.` : `What's your current mood or vibe?`}</h2>
      </header>

      <main className={`chatbot-container ${messages.length === 0 ? 'centered' : ''}`}>
        <div className="messages" ref={messagesContainerRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`} data-sender={msg.sender}>
              {typeof msg.text === 'string' ? <p>{msg.text}</p> : msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} className="scroll-anchor" />
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={mood ? 'Type your message...' : 'How are you feeling?'}
            className={`message-input ${input.trim() ? 'active' : ''}`}
            disabled={isSending}
            aria-label="Chat input"
          />
          <button
            onClick={sendMessage}
            className="send-button"
            disabled={isSending || !input.trim()}
            aria-label="Send message"
          >
            <IoSend className="send-icon" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
