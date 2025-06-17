import { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');

      setTimeout(() => {
        setMessages(prev => [...prev, { text: 'Thanks for your message!', sender: 'bot' }]);
      }, 1000);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chatbot-heading">
        <h1>Hi there, welcome to MoodTunes!</h1>
        <h2>What’s your current mood or vibe?</h2>
      </div>

      <div className="chatbot-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="message-input"
          />
          <button onClick={sendMessage} className="send-button">
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
