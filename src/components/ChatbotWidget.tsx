'use client';

import React, { useState, useEffect, useRef } from 'react';
import './ChatbotWidget.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Assalamualaikum! Saya Asisten AI MQ News Today. Saya siap membantu menjawab pertanyaan Anda seputar kumpulan mimpi Muhammad Qasim secara cerdas berdasarkan basis pengetahuan resmi. Apa yang ingin Anda tanyakan hari ini?',
      },
    ]);
  }, []);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Countdown timer for 429 Busy State
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus input on toggle open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading || countdown > 0) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Rate limit hit - start countdown
        const waitTime = data.retryAfter || 15;
        setCountdown(waitTime);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Maaf sekali, kapasitas server AI kami sedang penuh karena banyaknya permintaan obrolan saat ini. Mohon tunggu selama **${waitTime} detik** ya sebelum mengirim pesan kembali. Terima kasih atas kesabaran Anda! 🙏`,
          },
        ]);
      } else if (!response.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ ${data.error || 'Terjadi kesalahan saat menghubungi asisten AI. Silakan coba beberapa saat lagi.'}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      }
    } catch (error) {
      console.error('Chat widget error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Gagal terhubung ke server. Periksa koneksi internet Anda.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Helper to render markdown-like styles (bold, lists) simply
  const formatMessageContent = (text: string) => {
    if (!text) return '';
    // Format bold (**text**)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Format bullet points (starting with * or -)
    formatted = formatted.split('\n').map((line, idx) => {
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return `<li key=${idx} style="margin-left: 16px; margin-bottom: 4px;">${line.trim().substring(2)}</li>`;
      }
      return `<p key=${idx} style="margin-bottom: 8px; line-height: 1.5;">${line}</p>`;
    }).join('');

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="chatbot-widget-container">
      {/* Floating Action Button (FAB) */}
      <button 
        className={`chatbot-fab ${isOpen ? 'chatbot-fab--active' : ''}`}
        onClick={handleToggle}
        aria-label="Tanya AI Asisten"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <div className="chatbot-fab__content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="chatbot-fab__text">Tanya AI</span>
          </div>
        )}
        {!isOpen && <span className="chatbot-fab__pulse"></span>}
      </button>

      {/* Chat Window Dialog */}
      <div className={`chatbot-window ${isOpen ? 'chatbot-window--open' : ''}`}>
        {/* Header */}
        <div className="chatbot-window__header">
          <div className="chatbot-window__profile">
            <div className="chatbot-window__avatar">
              <span>AI</span>
              <span className="chatbot-window__status-dot"></span>
            </div>
            <div className="chatbot-window__title-group">
              <h4 className="chatbot-window__title">Tanya AI Mimpi Qasim</h4>
              <span className="chatbot-window__subtitle">Asisten Resmi MQ News</span>
            </div>
          </div>
          <button className="chatbot-window__close" onClick={handleToggle} aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Messages Body */}
        <div className="chatbot-window__body">
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`chatbot-msg ${msg.role === 'user' ? 'chatbot-msg--user' : 'chatbot-msg--assistant'}`}
              >
                <div className="chatbot-msg__bubble">
                  {formatMessageContent(msg.content)}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg__bubble chatbot-msg__bubble--loading">
                  <div className="chatbot-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Shown when chat is thin) */}
          {messages.length <= 1 && (
            <div className="chatbot-suggestions">
              <p className="chatbot-suggestions__title">Rekomendasi Pertanyaan:</p>
              <div className="chatbot-suggestions__list">
                <button onClick={() => handleQuickQuestion('Siapa itu Muhammad Qasim?')} className="chatbot-suggestions__btn">
                  Siapa Muhammad Qasim?
                </button>
                <button onClick={() => handleQuickQuestion('Bagaimana mimpi Qasim tentang Pakistan?')} className="chatbot-suggestions__btn">
                  Mimpi kebangkitan Pakistan
                </button>
                <button onClick={() => handleQuickQuestion('Apa ramalan mimpinya tentang Arab Saudi?')} className="chatbot-suggestions__btn">
                  Mimpi tentang Arab Saudi
                </button>
                <button onClick={() => handleQuickQuestion('Apa pesan utama di setiap mimpinya?')} className="chatbot-suggestions__btn">
                  Pesan menghindari syirik
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rate limit lock banner */}
        {countdown > 0 && (
          <div className="chatbot-window__lock-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Server sibuk. Mengaktifkan kembali dalam <strong>{countdown} detik</strong>...
          </div>
        )}

        {/* Footer Input Area */}
        <form onSubmit={handleSubmit} className="chatbot-window__footer">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-window__input"
            placeholder={countdown > 0 ? `Terkunci... tunggu ${countdown}s` : "Ketik pertanyaan Anda..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || countdown > 0}
          />
          <button 
            type="submit" 
            className="chatbot-window__send-btn"
            disabled={!input.trim() || loading || countdown > 0}
            aria-label="Kirim pesan"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
