export const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  },
  largeContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px'
  },
  heroSection: {
    textAlign: 'center',
    paddingTop: '80px',
    paddingBottom: '80px'
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '800',
    background: 'linear-gradient(to right, #ffffff, #cbd5e1, #94a3b8)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '24px',
    lineHeight: '1.1'
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: '#94a3b8',
    maxWidth: '768px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    marginBottom: '64px'
  },
  card: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  cardHover: {
    transform: 'scale(1.05)',
    borderColor: 'rgba(6, 182, 212, 0.5)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
  },
  iconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  iconBoxBlue: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  iconBoxCyan: {
    background: 'linear-gradient(to right, #06b6d4, #3b82f6)'
  },
  iconBoxGreen: {
    background: 'linear-gradient(to right, #10b981, #22c55e)'
  },
  iconBoxPurple: {
    background: 'linear-gradient(to right, #8b5cf6, #ec4899)'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#ffffff'
  },
  cardText: {
    color: '#94a3b8',
    lineHeight: '1.6'
  },
  button: {
    background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
    color: '#ffffff',
    fontWeight: '600',
    padding: '16px 40px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1.125rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)'
  },
  buttonHover: {
    transform: 'scale(1.05)',
    background: 'linear-gradient(to right, #0891b2, #2563eb)',
    boxShadow: '0 15px 40px rgba(6, 182, 212, 0.4)'
  },
  backButton: {
    color: '#94a3b8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    marginBottom: '24px',
    transition: 'color 0.3s ease'
  },
  header: {
    paddingTop: '40px',
    paddingBottom: '40px',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#ffffff'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.125rem',
    marginBottom: '48px'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#ffffff'
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: '1.125rem',
    marginBottom: '48px'
  },
  formContainer: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(51, 65, 85, 0.5)'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(51, 65, 85, 0.5)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#cbd5e1'
  },
  input: {
    background: 'rgba(51, 65, 85, 0.5)',
    border: '1px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '1rem',
    transition: 'all 0.2s ease'
  },
  inputFocus: {
    outline: 'none',
    borderColor: 'rgba(6, 182, 212, 0.5)',
    boxShadow: '0 0 0 2px rgba(6, 182, 212, 0.1)'
  },
  tabButton: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  tabButtonActive: {
    color: '#667eea',
    borderBottomColor: '#667eea',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#cbd5e1',
    cursor: 'pointer',
  },
  uploadArea: {
    border: '2px dashed #475569',
    borderRadius: '16px',
    padding: '64px',
    textAlign: 'center',
    transition: 'border-color 0.3s ease'
  },
  uploadAreaHover: {
    borderColor: 'rgba(6, 182, 212, 0.5)'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  metricCard: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(51, 65, 85, 0.5)'
  },
  metricTitle: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '8px'
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '4px'
  },
  metricSubtitle: {
    color: '#94a3b8',
    fontSize: '0.75rem'
  },
  recommendationCard: {
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '40px',
    border: '1px solid',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
  },
  recommendationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  recommendationTitle: {
    fontSize: '1.875rem',
    fontWeight: '700'
  },
  recommendationScore: {
    fontSize: '1.125rem',
    fontWeight: '600',
    background: 'rgba(30, 41, 59, 0.5)',
    padding: '8px 16px',
    borderRadius: '12px'
  },
  reasonsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  reasonItem: {
    color: '#cbd5e1',
    lineHeight: '1.6'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px'
  },
  detailCard: {
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid rgba(51, 65, 85, 0.5)'
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  },
  detailItemHighlight: {
    background: 'rgba(51, 65, 85, 0.3)',
    padding: '12px 16px',
    borderRadius: '12px'
  },
  detailLabel: {
    color: '#94a3b8'
  },
  detailValue: {
    fontWeight: '600',
    color: '#ffffff'
  },
  detailValueHighlight: {
    color: '#10b981'
  }
};