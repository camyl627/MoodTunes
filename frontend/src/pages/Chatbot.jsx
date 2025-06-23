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
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;

    if (isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(messages.length > 2 ? 'smooth' : 'auto');
  }, [messages, scrollToBottom]);

  const appendMessage = (msg, sender = 'bot') => {
    setMessages(prev => [...prev, { text: msg, sender }]);
  };

  const handleInputChange = (e) => setInput(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSending) sendMessage();
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    appendMessage(trimmed, 'user');
    setInput('');
    setIsSending(true);

    const isFirst = mood === null;
    const userPrompt = isFirst
      ? `My mood is: ${trimmed}. Give me a song and lyrics that matches.`
      : trimmed;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chats: [{ role: 'user', content: userPrompt }] })
      });

      const data = await response.json();
      const botOutput = data?.output?.content || 'Sorry, something went wrong.';

      // Example AI format: "Some lyrics here"\n— Song Title by Artist
      const parts = botOutput.split('\n— ');
if (parts.length === 2) {
  const lyrics = parts[0].replace(/^"|"$/g, '');
  const [title, artist] = parts[1].split(' by ');

  const searchQuery = `${title} ${artist}`;
  const geniusLink = `https://genius.com/search?q=${encodeURIComponent(searchQuery)}`;
  const spotifySearchLink = `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`;

  appendMessage(
    <>
      <div className="embed-card">
        <p className="lyrics">"{lyrics}"</p>
        <p className="song-info">🎵 <strong>{title}</strong> by <em>{artist}</em></p>

        <iframe
          title="Spotify Embed"
          src={`https://open.spotify.com/embed/search/${encodeURIComponent(searchQuery)}`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>

        <a className="genius-link" href={geniusLink} target="_blank" rel="noopener noreferrer">
          📖 View full lyrics on Genius
        </a>
      </div>
    </>
  );

        appendMessage(
          <>
            <p className="lyrics">"{lyrics}"</p>
            <p className="song-info">🎵 <strong>{title}</strong> by <em>{artist}</em></p>
          </>
        );
      } else {
        appendMessage(botOutput);
      }

      if (isFirst) setMood(trimmed);
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
