import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const quickPrompts = [
  'I have a fever and body ache',
  'What should I do for a headache?',
  'How do I book a doctor?',
  'Where can I see my reports?',
];

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Chat = () => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      text: 'Hello. I am Dr. AI. How can I help you today?',
      sender: 'bot',
      time: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (rawText) => {
    const userText = rawText.trim();
    if (!userText || sending) {
      return;
    }

    // eslint-disable-next-line react-hooks/purity -- runs only inside a user-triggered send, never during render
    const sentAt = Date.now();
    const userMessage = { id: sentAt, text: userText, sender: 'user', time: sentAt };
    setMessages((current) => [...current, userMessage]);
    setInput('');

    try {
      setSending(true);
      const data = await api.sendChatMessage(userText);
      // eslint-disable-next-line react-hooks/purity -- runs only inside a user-triggered send, never during render
      const receivedAt = Date.now();
      const botMessage = {
        id: receivedAt + 1,
        text: data.reply,
        sender: 'bot',
        time: receivedAt,
      };
      setMessages((current) => [...current, botMessage]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Chat request failed.'));
    } finally {
      setSending(false);
    }
  };

  const handleSend = (event) => {
    event.preventDefault();
    sendMessage(input);
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
              {message.sender === 'bot' && <div className="chat-avatar chat-avatar--bot">AI</div>}
              <div className="chat-bubble-group">
                <div
                  className={`chat-bubble${message.sender === 'user' ? ' chat-bubble--user' : ' chat-bubble--bot'}`}
                >
                  {message.text}
                </div>
                <span
                  className={`chat-time${message.sender === 'user' ? ' chat-time--user' : ''}`}
                >
                  {formatTime(message.time)}
                </span>
              </div>
              {message.sender === 'user' && <div className="chat-avatar chat-avatar--user">You</div>}
            </div>
          ))}

          {sending && (
            <div className="chat-message">
              <div className="chat-avatar chat-avatar--bot">AI</div>
              <div className="chat-bubble-group">
                <div className="chat-bubble chat-bubble--bot chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="symptom-chip-row chat-quick-prompts">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="symptom-chip"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

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
