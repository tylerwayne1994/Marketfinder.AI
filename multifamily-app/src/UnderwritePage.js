import React, { useState } from 'react';
import { Upload, Calculator, ArrowLeft } from 'lucide-react';
import { styles } from './styles';

const UnderwritePage = ({ setCurrentPage }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('home')}
            onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <h1 style={styles.pageTitle}>Choose Analysis Method</h1>
          <p style={styles.pageSubtitle}>Select how you'd like to analyze your property</p>
          
          <div style={styles.cardGrid}>
            {[
              { 
                icon: Upload, 
                title: 'Upload Documents', 
                text: 'Upload your offering memorandum, T12, or other property documents for automatic analysis',
                action: () => setCurrentPage('upload'),
                gradient: styles.iconBoxCyan
              },
              { 
                icon: Calculator, 
                title: 'Manual Entry', 
                text: 'Enter property and financial data manually for quick analysis',
                action: () => setCurrentPage('manual'),
                gradient: styles.iconBoxGreen
              }
            ].map((item, index) => (
              <div 
                key={index}
                style={{
                  ...styles.card,
                  ...(hoveredCard === index ? styles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={item.action}
              >
                <div style={{...styles.iconBox, ...item.gradient}}>
                  <item.icon size={48} color="white" />
                </div>
                <h3 style={{...styles.cardTitle, fontSize: '1.5rem'}}>{item.title}</h3>
                <p style={styles.cardText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderwritePage;