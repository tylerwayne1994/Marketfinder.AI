import React, { useState, useRef, useEffect } from 'react';

const Chatbot = ({ zipData, zipCentroids }) => {
  const [messages, setMessages] = useState([
    { 
      text: 'Hey there! 👋 Ask me about real estate markets. Try "highest rents in Georgia" or "most population density around Atlanta, Georgia with highest income"', 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Simple ZIP code to city/state mapping (subset for demonstration; in production, use a full ZIP code database)
  const zipToLocation = {
    '30301': { city: 'Atlanta', state: 'GA' },
    '30303': { city: 'Atlanta', state: 'GA' },
    '30305': { city: 'Atlanta', state: 'GA' },
    '30306': { city: 'Atlanta', state: 'GA' },
    '30308': { city: 'Atlanta', state: 'GA' },
    // Add more mappings as needed
    '30080': { city: 'Smyrna', state: 'GA' },
    '30082': { city: 'Smyrna', state: 'GA' },
    '30126': { city: 'Mableton', state: 'GA' },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { 
      text: input, 
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const lower = input.toLowerCase();
      let response = 'Sorry, I couldn\'t understand that query. Try asking about population density, income, rents, or employment rates!';
      let results = Object.values(zipData).map(z => ({
        ...z,
        city: zipToLocation[z.zip]?.city || 'Unknown',
        state: zipToLocation[z.zip]?.state || 'Unknown'
      }));

      // Parse location
      const locationMatch = lower.match(/(in|near|around|surrounding) ([\w\s,]+?)(?=\s*(with|have|population|density|income|rent|employment|$))/i);
      let city = null, state = null;
      if (locationMatch) {
        const loc = locationMatch[2].trim().split(/\s*,\s*/);
        city = loc[0]?.toLowerCase();
        state = loc[1]?.toLowerCase();
        results = results.filter(z => 
          (!city || z.city.toLowerCase().includes(city)) && 
          (!state || z.state.toLowerCase() === state)
        );
      }

      // Parse population
      const popMatch = lower.match(/population (over|above|greater than|of|at least) (\d+)/i);
      const minPop = popMatch ? parseInt(popMatch[2]) : null;
      if (minPop) {
        results = results.filter(z => z.population >= minPop);
      }

      // Parse income
      const incomeMatch = lower.match(/income (over|above|greater than|of|at least) \$?(\d+)/i);
      const minIncome = incomeMatch ? parseInt(incomeMatch[2]) : null;
      if (minIncome) {
        results = results.filter(z => z.medianHouseholdIncome >= minIncome);
      }

      // Handle specific queries
      if (lower.includes('highest rents')) {
        results.sort((a, b) => (b.medianGrossRent || 0) - (a.medianGrossRent || 0));
        response = `💵 Top ZIP codes with highest rents:\n\n${results.slice(0, 5).map((z, i) => 
          `${i + 1}. ${z.zip} - ${z.city}, ${z.state}\n   💰 $${z.medianGrossRent || 'N/A'}/month`
        ).join('\n\n')}`;
      } else if (lower.includes('population density') && lower.includes('highest income')) {
        results.sort((a, b) => {
          const scoreA = (a.density_sqmi || 0) + (a.medianHouseholdIncome || 0) / 1000;
          const scoreB = (b.density_sqmi || 0) + (b.medianHouseholdIncome || 0) / 1000;
          return scoreB - scoreA;
        });
        response = `🏙️ Top ZIP codes with high population density and income:\n\n${results.slice(0, 5).map((z, i) => 
          `${i + 1}. ${z.zip} - ${z.city}, ${z.state}\n   🏙️ Density: ${z.density_sqmi?.toFixed(1) || 'N/A'} people/sq mi\n   💰 Income: $${z.medianHouseholdIncome?.toLocaleString() || 'N/A'}`
        ).join('\n\n')}`;
      } else if (lower.includes('highest population density')) {
        results.sort((a, b) => (b.density_sqmi || 0) - (a.density_sqmi || 0));
        response = `🏙️ Top ZIP codes with highest population density:\n\n${results.slice(0, 5).map((z, i) => 
          `${i + 1}. ${z.zip} - ${z.city}, ${z.state}\n   🏙️ ${z.density_sqmi?.toFixed(1) || 'N/A'} people/sq mi`
        ).join('\n\n')}`;
      } else if (lower.includes('highest income')) {
        results.sort((a, b) => (b.medianHouseholdIncome || 0) - (a.medianHouseholdIncome || 0));
        response = `💰 Top ZIP codes with highest median household income:\n\n${results.slice(0, 5).map((z, i) => 
          `${i + 1}. ${z.zip} - ${z.city}, ${z.state}\n   💰 $${z.medianHouseholdIncome?.toLocaleString() || 'N/A'}`
        ).join('\n\n')}`;
      } else if (lower.includes('highest employment')) {
        results.sort((a, b) => (b.employmentRate || 0) - (a.employmentRate || 0));
        response = `💼 Top ZIP codes with highest employment rates:\n\n${results.slice(0, 5).map((z, i) => 
          `${i + 1}. ${z.zip} - ${z.city}, ${z.state}\n   💼 ${z.employmentRate?.toFixed(1) || 'N/A'}%`
        ).join('\n\n')}`;
      } else {
        response = '💡 Try asking me about:\n• Highest population density in [location]\n• Highest income in [city]\n• Highest rents in [state]\n• Areas with population over [number]\n• High population density and income around [city]';
      }

      setIsTyping(false);
      setMessages((msgs) => [...msgs, { 
        text: response, 
        sender: 'bot',
        timestamp: new Date()
      }]);
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const styles = {
    container: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 440,
      height: 450,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
      borderRadius: 24,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.8)'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    headerTitle: {
      margin: 0,
      fontSize: '1.1rem',
      fontWeight: 600,
      color: 'white',
      letterSpacing: '-0.02em'
    },
    headerSubtitle: {
      margin: '4px 0 0 0',
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: 400
    },
    statusDot: {
      width: 8,
      height: 8,
      background: '#10b981',
      borderRadius: '50%',
      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)',
      animation: 'pulse 2s infinite'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      scrollBehavior: 'smooth'
    },
    messageWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    },
    userMessageWrapper: {
      alignItems: 'flex-end'
    },
    botMessageWrapper: {
      alignItems: 'flex-start'
    },
    message: {
      maxWidth: '75%',
      padding: '12px 16px',
      borderRadius: 18,
      fontSize: '0.95rem',
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      transition: 'all 0.2s ease',
      animation: 'slideIn 0.3s ease'
    },
    userMessage: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderBottomRightRadius: 4,
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    botMessage: {
      background: 'white',
      color: '#1a1a2e',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      borderBottomLeftRadius: 4,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    },
    timestamp: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      padding: '0 4px'
    },
    typingIndicator: {
      display: 'flex',
      gap: 4,
      padding: '16px',
      background: 'white',
      borderRadius: 18,
      borderBottomLeftRadius: 4,
      width: 'fit-content',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)'
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: '#94a3b8',
      animation: 'typing 1.4s infinite'
    },
    inputContainer: {
      padding: '16px 20px 20px',
      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)'
    },
    inputWrapper: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    },
    input: {
      flex: 1,
      padding: '14px 18px',
      border: '2px solid transparent',
      borderRadius: 14,
      fontSize: '0.95rem',
      background: 'white',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      '&:focus': {
        borderColor: '#667eea',
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
      }
    },
    sendButton: {
      padding: '14px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: 14,
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
      },
      '&:active': {
        transform: 'translateY(0)'
      }
    }
  };

  // Add keyframe animations
  const styleSheet = document.styleSheets[0];
  if (styleSheet && !document.querySelector('#chatbot-animations')) {
    const animationStyles = document.createElement('style');
    animationStyles.id = 'chatbot-animations';
    animationStyles.innerHTML = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes slideIn {
        from { 
          opacity: 0;
          transform: translateY(10px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(animationStyles);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h4 style={styles.headerTitle}>Market Insights AI</h4>
          <p style={styles.headerSubtitle}>Your real estate data assistant</p>
        </div>
        <div style={styles.statusDot}></div>
      </div>
      
      <div style={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={{
              ...styles.messageWrapper,
              ...(msg.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper)
            }}
          >
            <div style={{
              ...styles.message,
              ...(msg.sender === 'user' ? styles.userMessage : styles.botMessage)
            }}>
              {msg.text}
            </div>
            <span style={styles.timestamp}>
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}
        {isTyping && (
          <div style={styles.messageWrapper}>
            <div style={styles.typingIndicator}>
              <div style={{ ...styles.typingDot, animationDelay: '0s' }}></div>
              <div style={{ ...styles.typingDot, animationDelay: '0.2s' }}></div>
              <div style={{ ...styles.typingDot, animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div style={styles.inputContainer}>
        <div style={styles.inputWrapper}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = 'transparent'}
            style={styles.input}
            placeholder="Ask about markets, rents, or opportunities..." 
          />
          <button 
            onClick={handleSend}
            style={styles.sendButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;