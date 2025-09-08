export const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#1e293b',
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
    background: 'linear-gradient(to right, #1e293b, #475569, #64748b)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '24px',
    lineHeight: '1.1'
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: '#64748b',
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
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  cardHover: {
    transform: 'translateY(-4px)',
    borderColor: '#06b6d4',
    boxShadow: '0 20px 40px rgba(6, 182, 212, 0.15)'
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
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1e293b'
  },
  cardText: {
    color: '#64748b',
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
    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
  },
  buttonHover: {
    transform: 'translateY(-2px)',
    background: 'linear-gradient(to right, #0891b2, #2563eb)',
    boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)'
  },
  backButton: {
    color: '#64748b',
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
    color: '#1e293b'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.125rem',
    marginBottom: '48px'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#1e293b'
  },
  pageSubtitle: {
    color: '#64748b',
    fontSize: '1.125rem',
    marginBottom: '48px'
  },
  formContainer: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
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
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
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
    color: '#1e293b',
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
    color: '#374151'
  },
  input: {
    background: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#1e293b',
    fontSize: '1rem',
    transition: 'all 0.2s ease'
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#06b6d4',
    boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.1)'
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
    color: '#06b6d4',
    borderBottomColor: '#06b6d4',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  },
  uploadArea: {
    border: '2px dashed #cbd5e1',
    borderRadius: '16px',
    padding: '64px 24px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  uploadAreaHover: {
    borderColor: '#06b6d4',
    backgroundColor: '#f0f9ff',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  metricCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  metricTitle: {
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '8px'
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '4px',
    color: '#1e293b'
  },
  metricSubtitle: {
    color: '#64748b',
    fontSize: '0.75rem'
  },
  recommendationCard: {
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '40px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    backgroundColor: '#ffffff'
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
    fontWeight: '700',
    color: '#1e293b'
  },
  recommendationScore: {
    fontSize: '1.125rem',
    fontWeight: '600',
    background: '#f8fafc',
    color: '#1e293b',
    padding: '8px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  reasonsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  reasonItem: {
    color: '#374151',
    lineHeight: '1.6'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px'
  },
  detailCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
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
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  detailLabel: {
    color: '#64748b'
  },
  detailValue: {
    fontWeight: '600',
    color: '#1e293b'
  },
  detailValueHighlight: {
    color: '#10b981'
  }
};