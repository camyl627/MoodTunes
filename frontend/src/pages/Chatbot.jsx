import { useState, useEffect, useRef, useCallback } from 'react';
import { IoSend } from 'react-icons/io5';
import './Chatbot.css';

const Chatbot = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mood, setMood] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll handling with gentle behavior
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container || !messagesEndRef.current) return;

    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;
    const isNearBottom = scrollHeight - (scrollTop + containerHeight) < 100;

    if (isNearBottom) {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, []);

  // Message management
  const appendMessage = useCallback((text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSending) {
      sendMessage();
    }
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom(messages.length > 2 ? 'smooth' : 'auto');
  }, [messages, scrollToBottom]);

  // API communication
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isSending) return;

    appendMessage(trimmedInput, 'user');
    setInput('');
    setIsSending(true);

    try {
      const isFirstMessage = mood === null;
      const userContent = isFirstMessage
        ? `My mood is: ${trimmedInput}. Give me a song and lyrics that matches.`
        : trimmedInput;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chats: [{ role: 'user', content: userContent }]
        })
      });

      const data = await response.json();
      const botReply = data?.output?.content || 'Sorry, something went wrong.';

      appendMessage(botReply, 'bot');
      if (isFirstMessage) setMood(trimmedInput);
    } catch (error) {
      console.error('Error:', error);
      appendMessage('Failed to connect to the server.', 'bot');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-heading">
        <h1>Hi there, welcome to MoodTunes!</h1>
        <h2>{mood ? `You're feeling ${mood}. Let's vibe.` : `What's your current mood or vibe?`}</h2>
      </div>

      <div className={`chatbot-container ${messages.length === 0 ? 'centered' : ''}`}>
        <div className="messages" ref={messagesContainerRef}>
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender}`}
              data-sender={message.sender}
            >
              {message.text}
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
            placeholder={mood ? "Type your message..." : "How are you feeling?"}
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
      </div>
    </div>
  );
};

export default Chatbot;