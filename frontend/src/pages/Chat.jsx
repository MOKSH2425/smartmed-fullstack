import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const Chat = () => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello. I am Dr. AI. How can I help you today?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || sending) {
      return;
    }

    const userText = input.trim();
    const userMessage = { id: Date.now(), text: userText, sender: 'user' };
    setMessages((current) => [...current, userMessage]);
    setInput('');

    try {
      setSending(true);
      const data = await api.sendChatMessage(userText);
      const botMessage = { id: Date.now() + 1, text: data.reply, sender: 'bot' };
      setMessages((current) => [...current, botMessage]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Chat request failed.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="chat-shell">
      <button type="button" onClick={() => navigate(-1)} className="btn" style={{ width: 'fit-content' }}>
        Back to previous page
      </button>

      <section className="dashboard-hero">
        <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
          Guided support
        </p>
        <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
          Dr. AI Assistant
        </h1>
        <p>
          Ask a quick health question and get an instant response inside the same
          care workspace.
        </p>
      </section>

      <section className="card content-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '32rem' }}>
        <div className="chat-window">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message${message.sender === 'user' ? ' chat-message--user' : ''}`}
            >
              <div
                className={`chat-bubble${message.sender === 'user' ? ' chat-bubble--user' : ' chat-bubble--bot'}`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="chat-compose" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your health question..."
          />
          <button type="submit" className="btn" disabled={sending} style={{ opacity: sending ? 0.75 : 1 }}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Chat;
