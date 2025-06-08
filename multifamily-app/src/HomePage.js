import React, { useState, useContext, createContext } from 'react';
import { Upload, Calculator, TrendingUp, Search, ArrowRight, BarChart3, Home, Map, Zap, FileText, Settings, Moon, Sun, Palette, Type, Bell, Chrome } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const themes = {
    dark: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      sidebarBg: '#1e293b',
      cardBg: '#1e293b',
      borderColor: '#334155',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      hover: '#374151'
    },
    light: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      sidebarBg: '#ffffff',
      cardBg: '#ffffff',
      borderColor: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      hover: '#f1f5f9'
    }
  };

  const fontSizes = {
    small: { base: '0.875rem', title: '3rem', subtitle: '1.125rem' },
    medium: { base: '1rem', title: '3.5rem', subtitle: '1.25rem' },
    large: { base: '1.125rem', title: '4rem', subtitle: '1.5rem' }
  };

  const accentColors = {
    blue: { primary: '#3b82f6', secondary: '#06b6d4' },
    purple: { primary: '#8b5cf6', secondary: '#a855f7' },
    green: { primary: '#10b981', secondary: '#22c55e' },
    orange: { primary: '#f59e0b', secondary: '#fb923c' }
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    currentTheme: themes[theme],
    accentColor,
    setAccentColor,
    currentAccent: accentColors[accentColor],
    fontSize,
    setFontSize,
    currentFontSize: fontSizes[fontSize]
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Settings Page Component
const SettingsPage = ({ setCurrentPage }) => {
  const { theme, toggleTheme, currentTheme, accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const styles = {
    container: {
      minHeight: '100vh',
      background: currentTheme.background,
      color: currentTheme.textPrimary,
      padding: '48px',
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: currentTheme.textSecondary,
      marginBottom: '48px'
    },
    section: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '24px',
      border: `1px solid ${currentTheme.borderColor}`,
      transition: 'all 0.3s ease'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    settingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    settingLabel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    settingTitle: {
      fontSize: '1rem',
      fontWeight: '500'
    },
    settingDescription: {
      fontSize: '0.875rem',
      color: currentTheme.textSecondary
    },
    toggle: {
      width: '60px',
      height: '32px',
      background: theme === 'dark' ? '#374151' : '#e2e8f0',
      borderRadius: '16px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.3s ease'
    },
    toggleActive: {
      background: '#3b82f6'
    },
    toggleKnob: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute',
      top: '3px',
      left: theme === 'dark' ? '3px' : '31px',
      transition: 'left 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    colorOptions: {
      display: 'flex',
      gap: '12px'
    },
    colorOption: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease'
    },
    colorOptionSelected: {
      transform: 'scale(1.1)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)'
    },
    sizeOptions: {
      display: 'flex',
      gap: '12px'
    },
    sizeOption: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: `1px solid ${currentTheme.borderColor}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.875rem'
    },
    sizeOptionSelected: {
      background: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: currentTheme.cardBg,
      border: `1px solid ${currentTheme.borderColor}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      marginBottom: '32px'
    }
  };

  return (
    <div style={styles.container}>
      <div 
        style={styles.backButton}
        onClick={() => setCurrentPage('home')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = currentTheme.hover;
          e.currentTarget.style.transform = 'translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = currentTheme.cardBg;
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
        Back to Home
      </div>

      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Customize your experience across all pages</p>

      {/* Appearance Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Palette size={24} />
          Appearance
        </h2>

        {/* Theme Toggle */}
        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Theme</span>
            <span style={styles.settingDescription}>Switch between light and dark mode</span>
          </div>
          <div 
            style={{...styles.toggle, ...(theme === 'light' ? styles.toggleActive : {})}}
            onClick={toggleTheme}
          >
            <div style={styles.toggleKnob}>
              {theme === 'dark' ? <Moon size={16} color="#374151" /> : <Sun size={16} color="#3b82f6" />}
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Accent Color</span>
            <span style={styles.settingDescription}>Choose your preferred accent color</span>
          </div>
          <div style={styles.colorOptions}>
            {Object.entries({
              blue: '#3b82f6',
              purple: '#8b5cf6',
              green: '#10b981',
              orange: '#f59e0b'
            }).map(([color, hex]) => (
              <div
                key={color}
                style={{
                  ...styles.colorOption,
                  background: hex,
                  ...(accentColor === color ? styles.colorOptionSelected : {})
                }}
                onClick={() => setAccentColor(color)}
              >
                {accentColor === color && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Font Size</span>
            <span style={styles.settingDescription}>Adjust text size for better readability</span>
          </div>
          <div style={styles.sizeOptions}>
            {['small', 'medium', 'large'].map((size) => (
              <div
                key={size}
                style={{
                  ...styles.sizeOption,
                  ...(fontSize === size ? styles.sizeOptionSelected : {})
                }}
                onClick={() => setFontSize(size)}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Bell size={24} />
          Notifications
        </h2>

        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Email Notifications</span>
            <span style={styles.settingDescription}>Receive updates about your saved properties</span>
          </div>
          <div 
            style={{...styles.toggle, ...(notifications ? styles.toggleActive : {})}}
            onClick={() => setNotifications(!notifications)}
          >
            <div style={{...styles.toggleKnob, left: notifications ? '31px' : '3px'}} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated HomePage Component with Theme Support
const HomePage = ({ setCurrentPage }) => {
  const { currentTheme, currentAccent, currentFontSize } = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      page: 'dashboard',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: Calculator,
      label: 'Underwrite',
      page: 'underwrite',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: Chrome,
      label: 'Property Scraper',
      page: 'propertyScrape',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: Map,
      label: 'Market Heat Map',
      page: 'marketHeatMap',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      icon: FileText,
      label: 'Document Generator',
      page: 'documentGenerator',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      icon: Settings,
      label: 'Settings',
      page: 'settings',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    }
  ];

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: currentTheme.background,
      color: currentTheme.textPrimary,
      display: 'flex',
      transition: 'all 0.3s ease',
      fontSize: currentFontSize.base
    },
    sidebar: {
      width: '280px',
      background: currentTheme.sidebarBg,
      borderRight: `1px solid ${currentTheme.borderColor}`,
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      transition: 'all 0.3s ease'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: `linear-gradient(135deg, ${currentAccent.secondary}, ${currentAccent.primary})`,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    menuSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: currentTheme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '8px'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: currentTheme.textPrimary
    },
    menuItemHover: {
      background: currentTheme.hover,
      transform: 'translateX(4px)'
    },
    mainContent: {
      flex: 1,
      padding: '48px',
      overflow: 'auto'
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '64px'
    },
    heroTitle: {
      fontSize: currentFontSize.title,
      fontWeight: 'bold',
      marginBottom: '24px',
      background: `linear-gradient(135deg, ${currentAccent.secondary} 0%, ${currentAccent.primary} 50%, #8b5cf6 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.1'
    },
    heroSubtitle: {
      fontSize: currentFontSize.subtitle,
      color: currentTheme.textSecondary,
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      marginBottom: '48px'
    },
    card: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: `1px solid ${currentTheme.borderColor}`,
      cursor: 'pointer'
    },
    cardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      borderColor: currentAccent.primary
    },
    iconBox: {
      width: '80px',
      height: '80px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      transition: 'transform 0.3s ease'
    },
    iconBoxBlue: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    iconBoxCyan: {
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    iconBoxGreen: {
      background: 'linear-gradient(135deg, #10b981, #059669)'
    },
    iconBoxPurple: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    iconBoxOrange: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: currentTheme.textPrimary,
      marginBottom: '16px'
    },
    cardText: {
      color: currentTheme.textSecondary,
      lineHeight: '1.6',
      fontSize: '1rem'
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <BarChart3 size={24} color="white" />
          </div>
          <span>MultifamilyAI</span>
        </div>

        {/* Navigation Menu */}
        <div style={styles.menuSection}>
          <div style={styles.sectionTitle}>Navigation</div>
          {menuItems.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.menuItem,
                ...(hoveredMenuItem === index ? styles.menuItemHover : {})
              }}
              onMouseEnter={() => setHoveredMenuItem(index)}
              onMouseLeave={() => setHoveredMenuItem(null)}
              onClick={() => setCurrentPage(item.page)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: item.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <item.icon size={18} color="white" />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div style={styles.menuSection}>
          <div style={styles.sectionTitle}>Resources</div>
          <div style={styles.menuItem}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={18} color="white" />
            </div>
            <span>Templates</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>AI Multifamily Market Finder</h1>
          <p style={styles.heroSubtitle}>
            Analyze multifamily properties instantly with AI-powered underwriting and discover deals with intelligent market scanning across major real estate platforms.
          </p>
        </div>
        
        {/* Page Feature Boxes */}
        <div style={styles.cardGrid}>
          {[
            { 
              icon: Home, 
              title: 'Dashboard', 
              text: 'View your saved properties, portfolio analytics, and investment performance metrics. Track deals from analysis to closing with comprehensive portfolio management.',
              gradient: styles.iconBoxBlue,
              page: 'dashboard'
            },
            { 
              icon: Calculator, 
              title: 'Underwrite Properties', 
              text: 'Upload PDFs or manually enter property data for instant financial analysis. Get cap rates, cash flow projections, and AI-powered investment recommendations.',
              gradient: styles.iconBoxGreen,
              page: 'underwrite'
            },
            { 
              icon: Chrome, 
              title: 'Property Scraper', 
              text: 'Chrome extension and web scraping tools to automatically collect property listings from Zillow, Crexi, and LoopNet with AI-powered analysis.',
              gradient: styles.iconBoxCyan,
              page: 'propertyScrape'
            },
            { 
              icon: Map, 
              title: 'Market Heat Map', 
              text: 'Discover emerging markets and identify investment opportunities with real-time market data visualization and property value trend analysis.',
              gradient: styles.iconBoxPurple,
              page: 'marketHeatMap'
            },
            { 
              icon: FileText, 
              title: 'Document Generator', 
              text: 'Generate professional legal documents for real estate investments. Create promissory notes, operating agreements, purchase contracts, and more with AI assistance.',
              gradient: styles.iconBoxOrange,
              page: 'documentGenerator'
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
              onClick={() => setCurrentPage(item.page)}
            >
              <div style={{...styles.iconBox, ...item.gradient}}>
                <item.icon size={32} color="white" />
              </div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardText}>{item.text}</p>
              <div style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: `rgba(${currentAccent.primary.match(/\d+/g).slice(0,3).join(',')}, 0.1)`,
                border: `1px solid ${currentAccent.primary}`,
                borderRadius: '8px',
                color: currentAccent.primary,
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Click to Access →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <ThemeProvider>
      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
      {currentPage === 'settings' && <SettingsPage setCurrentPage={setCurrentPage} />}
      {/* Add other pages here */}
      {currentPage === 'dashboard' && (
        <div style={{ padding: '48px', minHeight: '100vh', background: '#0f172a', color: 'white' }}>
          <h1>Dashboard Page</h1>
          <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px' }}>Back to Home</button>
        </div>
      )}
    </ThemeProvider>
  );
};

export default App;