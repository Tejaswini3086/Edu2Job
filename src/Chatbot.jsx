import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css'; 

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "👋 Hi! I am your AI Career Coach.\n\nHow can I help you reach your goals today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isOpen) setIsFullScreen(false);
  };

  const toggleFullScreen = (e) => {
    e.stopPropagation();
    setIsFullScreen(!isFullScreen);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(msg => ({
          sender: msg.sender,
          text: msg.text
      }));

      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: userMessage.text,
            history: historyPayload 
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "⚠️ Connection Error.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* GLOWING FLOATING BUTTON */}
      <button 
        onClick={toggleChat} 
        style={{
            position: 'fixed', bottom: '20px', right: '20px', 
            width: '65px', height: '65px', borderRadius: '50%', 
            background: '#2E8B57', border: 'none', fontSize: '30px', 
            cursor: 'pointer', boxShadow: '0 0 20px rgba(46, 139, 87, 0.6)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.3s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1.0)'}
      >
        {isOpen ? '❌' : '🤖'}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div style={{
            position: 'fixed', 
            bottom: isFullScreen ? '50%' : '100px', 
            right: isFullScreen ? '50%' : '20px',
            transform: isFullScreen ? 'translate(50%, 50%)' : 'none',
            width: isFullScreen ? '90vw' : '400px', 
            height: isFullScreen ? '85vh' : '600px', 
            background: 'rgba(15, 23, 42, 0.95)', // Deep dark blue-black
            borderRadius: '20px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            zIndex: 1001, 
            border: '1px solid rgba(46, 139, 87, 0.5)', // Sea Green Border
            backdropFilter: 'blur(15px)', // Glass effect
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
            {/* VIBRANT HEADER */}
            <div style={{
                background: '#2E8B57', 
                padding: '18px', 
                color: 'white', 
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }}></span>
                    <span>AI Career Expert</span>
                </div>
                <button 
                    onClick={toggleFullScreen} 
                    style={{
                        background: 'rgba(255,255,255,0.2)', 
                        border: 'none', 
                        color: 'white',
                        cursor: 'pointer', 
                        fontSize: '18px',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        transition: '0.2s'
                    }}
                >
                    {isFullScreen ? "❐" : "⛶"}
                </button>
            </div>

            {/* MESSAGES AREA */}
            <div style={{flex: 1, padding: '20px', overflowY: 'auto', background: 'transparent'}}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        textAlign: msg.sender === "user" ? "right" : "left",
                        marginBottom: '15px'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '14px 18px',
                            borderRadius: msg.sender === "user" ? '20px 20px 0 20px' : '20px 20px 20px 0',
                            background: msg.sender === "user" ? '#2E8B57' : 'rgba(51, 65, 85, 0.8)',
                            color: 'white',
                            maxWidth: isFullScreen ? '75%' : '85%',
                            fontSize: isFullScreen ? '1.1rem' : '0.95rem',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            lineHeight: '1.5'
                        }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && <div style={{color: '#2E8B57', fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '10px'}}>AI is typing...</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div style={{padding: '15px', background: 'rgba(30, 41, 59, 0.5)', display: 'flex', gap: '12px', borderTop: '1px solid rgba(46, 139, 87, 0.3)'}}>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    style={{
                        flex: 1, padding: '14px 20px', borderRadius: '30px', 
                        border: '1px solid rgba(46, 139, 87, 0.3)', 
                        outline: 'none', background: '#0f172a', color: 'white',
                        fontSize: isFullScreen ? '1.1rem' : '0.95rem'
                    }}
                />
                <button onClick={handleSend} style={{
                    background: '#2E8B57', border: 'none', borderRadius: '50%', 
                    width: '50px', height: '50px', cursor: 'pointer', color: 'white',
                    fontSize: '20px', boxShadow: '0 0 15px rgba(46, 139, 87, 0.4)'
                }}>➤</button>
            </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;