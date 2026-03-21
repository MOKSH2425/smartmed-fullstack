import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const Chat = () => {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello. I am Dr. AI. How can I help you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input.trim();
    const userMsg = { id: Date.now(), text: userText, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      setSending(true);
      const data = await api.sendChatMessage(userText);
      const botMsg = { id: Date.now() + 1, text: data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Chat request failed."));
    } finally {
      setSending(false);
    }
  };

  return (
    <main style={{ padding: '1rem', maxWidth: '600px', margin: 'auto', height: '85vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '1rem' }}>Back</button>
        <h2 style={{ margin: 0 }}>Dr. AI Assistant</h2>
      </div>

      <div style={{
        flex: 1,
        background: '#fff',
        borderRadius: '12px',
        padding: '1rem',
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '0.8rem'
          }}>
            <div style={{
              maxWidth: '70%',
              padding: '0.8rem 1rem',
              borderRadius: '18px',
              background: msg.sender === 'user' ? '#2563eb' : '#f3f4f6',
              color: msg.sender === 'user' ? 'white' : '#1f2937',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
              borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your health question..."
          style={{ flex: 1, padding: '1rem', borderRadius: '99px', border: '1px solid #d1d5db', outline: 'none' }}
        />
        <button type="submit" className="btn" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sending ? 0.7 : 1 }} disabled={sending}>
          {sending ? '...' : 'Go'}
        </button>
      </form>
    </main>
  );
};

export default Chat;
