import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Download, Check, AlertCircle, Users, DollarSign, Home, Edit3, Send, Eye, Plus, Trash2, RefreshCw, Calculator, Shield, Clock, Signature, PenTool, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const DocumentGenerator = ({ setCurrentPage }) => {
  const [currentStage, setCurrentStage] = useState('select');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [basicInfo, setBasicInfo] = useState({});
  const [customClauses, setCustomClauses] = useState([]);
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [finalDocument, setFinalDocument] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [recipients, setRecipients] = useState([{ email: '', name: '', role: '' }]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [documentVersion, setDocumentVersion] = useState(1);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [documentAnalysis, setDocumentAnalysis] = useState(null);
  
  // Calculator state
  const [calculatorLoanAmount, setCalculatorLoanAmount] = useState('');
  const [calculatorInterestRate, setCalculatorInterestRate] = useState('');
  const [calculatorLoanTerm, setCalculatorLoanTerm] = useState('');
  const [calculatorMonthlyPayment, setCalculatorMonthlyPayment] = useState('');

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white'
    },
    mainContent: {
      padding: '48px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '64px'
    },
    backButton: {
      textAlign: 'left',
      marginBottom: '24px'
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      marginBottom: '24px',
      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.1'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      color: '#94a3b8',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto'
    },
    progressContainer: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      border: '1px solid #334155',
      position: 'relative'
    },
    autoSaveIndicator: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.75rem',
      color: '#94a3b8'
    },
    progressTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    progressSteps: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap'
    },
    progressStep: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    stepCircle: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    stepCircleCompleted: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white'
    },
    stepCircleActive: {
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: 'white'
    },
    stepCircleInactive: {
      background: '#374151',
      color: '#94a3b8'
    },
    stepText: {
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    stepTextActive: {
      color: 'white'
    },
    stepTextInactive: {
      color: '#94a3b8'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '32px',
      marginBottom: '48px'
    },
    card: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '32px',
      transition: 'all 0.3s ease',
      border: '1px solid #334155',
      cursor: 'pointer'
    },
    cardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      borderColor: '#06b6d4'
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
    iconBoxRed: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '16px',
      textAlign: 'center'
    },
    cardText: {
      color: '#94a3b8',
      lineHeight: '1.6',
      fontSize: '1rem',
      textAlign: 'center',
      marginBottom: '20px'
    },
    cardBadges: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    badge: {
      fontSize: '0.75rem',
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '500'
    },
    badgeCategory: {
      background: 'rgba(148, 163, 184, 0.1)',
      color: '#94a3b8'
    },
    badgeSimple: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981'
    },
    badgeModerate: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b'
    },
    badgeComplex: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'
    },
    cardAction: {
      padding: '12px 24px',
      background: 'rgba(6, 182, 212, 0.1)',
      border: '1px solid #06b6d4',
      borderRadius: '8px',
      color: '#06b6d4',
      fontSize: '0.875rem',
      fontWeight: '600',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    formContainer: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid #334155'
    },
    formTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '8px'
    },
    formSubtitle: {
      color: '#94a3b8',
      marginBottom: '32px',
      lineHeight: '1.6'
    },
    formSection: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '1px solid #334155'
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '16px',
      textTransform: 'capitalize'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px'
    },
    formGridFull: {
      gridColumn: '1 / -1'
    },
    inputGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#e2e8f0',
      marginBottom: '6px'
    },
    labelRequired: {
      color: '#ef4444',
      marginLeft: '4px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    inputFocus: {
      borderColor: '#06b6d4'
    },
    validationError: {
      fontSize: '0.75rem',
      color: '#ef4444',
      marginTop: '4px'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      resize: 'vertical',
      minHeight: '80px'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '32px',
      gap: '16px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonSecondary: {
      background: 'transparent',
      border: '1px solid #334155',
      color: '#94a3b8'
    },
    buttonSecondaryHover: {
      background: '#374151',
      color: 'white'
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: 'white'
    },
    buttonPrimaryHover: {
      background: 'linear-gradient(135deg, #0891b2, #0e7490)'
    },
    buttonSuccess: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white'
    },
    buttonDanger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white'
    },
    buttonDisabled: {
      background: '#374151',
      color: '#6b7280',
      cursor: 'not-allowed'
    },
    docSignerButton: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      color: 'white',
      border: 'none',
      padding: '16px 32px',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
      width: '100%'
    },
    clauseCard: {
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px'
    },
    clauseHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    clauseTitle: {
      fontWeight: '600',
      color: 'white'
    },
    deleteButton: {
      color: '#ef4444',
      cursor: 'pointer',
      padding: '4px'
    },
    aiSuggestionBox: {
      background: 'rgba(6, 182, 212, 0.05)',
      border: '1px solid rgba(6, 182, 212, 0.2)',
      borderRadius: '8px',
      padding: '16px'
    },
    previewContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '32px'
    },
    previewDocument: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid #334155'
    },
    previewTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #334155'
    },
    documentPreview: {
      background: '#0f172a',
      borderRadius: '8px',
      padding: '20px',
      maxHeight: '500px',
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      lineHeight: '1.6',
      color: '#e2e8f0',
      whiteSpace: 'pre-wrap'
    },
    feedbackPanel: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid #334155'
    },
    disclaimerBox: {
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    },
    disclaimerTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#f59e0b',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    disclaimerText: {
      fontSize: '0.875rem',
      color: '#fbbf24',
      lineHeight: '1.6'
    },
    disclaimerList: {
      marginLeft: '20px',
      marginTop: '8px'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '16px',
      gap: '12px'
    },
    checkbox: {
      width: '16px',
      height: '16px'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#fbbf24'
    },
    recipientGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 120px 40px',
      gap: '12px',
      alignItems: 'end',
      marginBottom: '16px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      textAlign: 'center'
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #334155',
      borderTop: '4px solid #06b6d4',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    },
    loadingTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '8px'
    },
    loadingText: {
      color: '#94a3b8'
    },
    calculatorModal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    calculatorContent: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    analysisPanel: {
      background: 'rgba(16, 185, 129, 0.05)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    },
    analysisTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#10b981',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    analysisItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      fontSize: '0.875rem'
    },
    statusSuccess: { color: '#10b981' },
    statusWarning: { color: '#f59e0b' },
    statusError: { color: '#ef4444' }
  };

  // Enhanced document types with more comprehensive options
  const documentTypes = [
    {
      id: 'promissory_note',
      title: 'Promissory Note',
      description: 'UCCC-compliant promissory notes with state-specific provisions',
      icon: FileText,
      category: 'Financing',
      complexity: 'Simple',
      fields: ['borrower_info', 'lender_info', 'loan_terms', 'payment_schedule', 'security_info']
    },
    {
      id: 'operating_agreement',
      title: 'LLC Operating Agreement',
      description: 'Comprehensive multi-member operating agreements with tax elections',
      icon: Users,
      category: 'Structure',
      complexity: 'Complex',
      fields: ['company_info', 'member_info', 'management_structure', 'capital_contributions', 'governing_law']
    },
    {
      id: 'equity_buyout',
      title: 'Equity Buyout Agreement',
      description: 'Detailed buyout agreements with valuation methods and payment structures',
      icon: DollarSign,
      category: 'Equity',
      complexity: 'Moderate',
      fields: ['party_info', 'equity_details', 'buyout_terms', 'payment_structure']
    },
    {
      id: 'partnership_agreement',
      title: 'Partnership Agreement',
      description: 'Sophisticated LP/GP structures with waterfall distributions',
      icon: Users,
      category: 'Structure',
      complexity: 'Complex',
      fields: ['partnership_info', 'capital_structure', 'profit_distribution', 'management_rights', 'term_buyout']
    },
    {
      id: 'purchase_contract',
      title: 'Purchase Contract',
      description: 'Complete purchase agreements with all contingencies and disclosures',
      icon: Home,
      category: 'Acquisition',
      complexity: 'Complex',
      fields: ['property_info', 'party_info', 'financial_terms', 'contingencies', 'closing_details']
    },
    {
      id: 'loi',
      title: 'Letter of Intent',
      description: 'Professional LOIs with clear non-binding language and deal structure',
      icon: FileText,
      category: 'Acquisition',
      complexity: 'Simple',
      fields: ['property_info', 'offer_terms', 'timeline', 'contingencies']
    }
  ];

  // Enhanced field definitions with validation
  const fieldDefinitions = {
    property_info: [
      { id: 'property_address', label: 'Property Address', type: 'textarea', required: true, validation: 'address' },
      { id: 'legal_description', label: 'Legal Description', type: 'textarea', required: false },
      { id: 'apn', label: 'APN (Assessor Parcel Number)', type: 'text', required: false, validation: 'apn' }
    ],
    party_info: [
      { id: 'buyer_name', label: 'Buyer Name/Entity', type: 'text', required: true },
      { id: 'buyer_address', label: 'Buyer Address', type: 'textarea', required: true, validation: 'address' },
      { id: 'buyer_email', label: 'Buyer Email', type: 'email', required: true, validation: 'email' },
      { id: 'buyer_phone', label: 'Buyer Phone', type: 'tel', required: true, validation: 'phone' },
      { id: 'seller_name', label: 'Seller Name/Entity', type: 'text', required: true },
      { id: 'seller_address', label: 'Seller Address', type: 'textarea', required: true, validation: 'address' },
      { id: 'seller_email', label: 'Seller Email', type: 'email', required: true, validation: 'email' },
      { id: 'seller_phone', label: 'Seller Phone', type: 'tel', required: true, validation: 'phone' }
    ],
    financial_terms: [
      { id: 'purchase_price', label: 'Purchase Price ($)', type: 'number', required: true, validation: 'currency' },
      { id: 'earnest_money', label: 'Earnest Money Deposit ($)', type: 'number', required: true, validation: 'currency' },
      { id: 'financing_type', label: 'Financing Type', type: 'select', options: ['Cash', 'Conventional Loan', 'Seller Financing', 'Hard Money', 'Combination'], required: true }
    ],
    contingencies: [
      { id: 'inspection_period', label: 'Inspection Period (days)', type: 'number', required: true, validation: 'days' },
      { id: 'financing_contingency_days', label: 'Financing Contingency (days)', type: 'number', required: false, validation: 'days' },
      { id: 'appraisal_contingency', label: 'Appraisal Contingency', type: 'select', options: ['Yes', 'No'], required: true }
    ],
    closing_details: [
      { id: 'closing_date', label: 'Target Closing Date', type: 'date', required: true, validation: 'futureDate' },
      { id: 'escrow_company', label: 'Escrow Company', type: 'text', required: false },
      { id: 'title_company', label: 'Title Company', type: 'text', required: false }
    ],
    borrower_info: [
      { id: 'borrower_name', label: 'Borrower Full Name', type: 'text', required: true },
      { id: 'borrower_address', label: 'Borrower Address', type: 'textarea', required: true, validation: 'address' },
      { id: 'borrower_entity_type', label: 'Borrower Entity Type', type: 'select', options: ['Individual', 'LLC', 'Corporation', 'Partnership', 'Trust'], required: true }
    ],
    lender_info: [
      { id: 'lender_name', label: 'Lender Full Name', type: 'text', required: true },
      { id: 'lender_address', label: 'Lender Address', type: 'textarea', required: true, validation: 'address' },
      { id: 'lender_entity_type', label: 'Lender Entity Type', type: 'select', options: ['Individual', 'LLC', 'Corporation', 'Partnership', 'Trust'], required: true }
    ],
    loan_terms: [
      { id: 'principal_amount', label: 'Principal Amount ($)', type: 'number', required: true, validation: 'currency' },
      { id: 'interest_rate', label: 'Annual Interest Rate (%)', type: 'number', step: '0.01', required: true, validation: 'interestRate' },
      { id: 'loan_term_months', label: 'Loan Term (months)', type: 'number', required: true, validation: 'months' },
      { id: 'late_fee_rate', label: 'Late Fee Percentage (%)', type: 'number', step: '0.01', required: true, validation: 'percentage' },
      { id: 'grace_period_days', label: 'Grace Period (days)', type: 'number', required: true, validation: 'days' }
    ],
    payment_schedule: [
      { id: 'payment_amount', label: 'Monthly Payment Amount ($)', type: 'number', required: true, validation: 'currency' },
      { id: 'payment_day', label: 'Payment Due Day of Month', type: 'number', min: '1', max: '31', required: true, validation: 'dayOfMonth' },
      { id: 'first_payment_date', label: 'First Payment Date', type: 'date', required: true, validation: 'futureDate' },
      { id: 'maturity_date', label: 'Maturity Date', type: 'date', required: true, validation: 'futureDate' }
    ],
    security_info: [
      { id: 'secured_property_address', label: 'Secured Property Address (if applicable)', type: 'textarea', required: false, validation: 'address' },
      { id: 'security_type', label: 'Security Type', type: 'select', options: ['Unsecured', 'Real Property', 'Personal Property', 'Business Assets', 'Mixed Collateral'], required: true }
    ],
    company_info: [
      { id: 'company_name', label: 'LLC Name', type: 'text', required: true },
      { id: 'formation_state', label: 'State of Formation', type: 'select', options: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'], required: true },
      { id: 'formation_date', label: 'Formation Date', type: 'date', required: true },
      { id: 'business_address', label: 'Principal Business Address', type: 'textarea', required: true, validation: 'address' },
      { id: 'registered_agent_name', label: 'Registered Agent Name', type: 'text', required: true },
      { id: 'registered_agent_address', label: 'Registered Agent Address', type: 'textarea', required: true, validation: 'address' }
    ],
    member_info: [
      { id: 'member1_name', label: 'Member 1 Name', type: 'text', required: true },
      { id: 'member1_type', label: 'Member 1 Type', type: 'select', options: ['Individual', 'LLC', 'Corporation', 'Partnership', 'Trust'], required: true },
      { id: 'member1_percentage', label: 'Member 1 Percentage Interest (%)', type: 'number', required: true, validation: 'percentage' },
      { id: 'member2_name', label: 'Member 2 Name', type: 'text', required: false },
      { id: 'member2_type', label: 'Member 2 Type', type: 'select', options: ['Individual', 'LLC', 'Corporation', 'Partnership', 'Trust'], required: false },
      { id: 'member2_percentage', label: 'Member 2 Percentage Interest (%)', type: 'number', required: false, validation: 'percentage' }
    ],
    management_structure: [
      { id: 'manager_name', label: 'Initial Manager Name', type: 'text', required: true },
      { id: 'management_type', label: 'Management Type', type: 'select', options: ['Member-Managed', 'Manager-Managed'], required: true },
      { id: 'voting_threshold', label: 'Major Decision Voting Threshold (%)', type: 'number', required: true, validation: 'percentage' }
    ],
    capital_contributions: [
      { id: 'member1_contribution', label: 'Member 1 Capital Contribution ($)', type: 'number', required: true, validation: 'currency' },
      { id: 'member2_contribution', label: 'Member 2 Capital Contribution ($)', type: 'number', required: false, validation: 'currency' },
      { id: 'additional_contributions_required', label: 'Additional Contributions Required?', type: 'select', options: ['No', 'By Unanimous Consent', 'By Majority Vote', 'As Needed for Operations'], required: true }
    ],
    governing_law: [
      { id: 'governing_state', label: 'Governing Law State', type: 'select', options: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'], required: true },
      { id: 'arbitration_location', label: 'Arbitration Location (County, State)', type: 'text', required: true }
    ]
  };

  // Stage progress tracking
  const stageProgress = [
    { id: 'select', title: 'Select Document', completed: currentStage !== 'select' },
    { id: 'info', title: 'Basic Information', completed: ['clause', 'draft', 'review', 'final'].includes(currentStage) },
    { id: 'clause', title: 'Custom Clauses', completed: ['draft', 'review', 'final'].includes(currentStage) },
    { id: 'draft', title: 'Review Draft', completed: ['final'].includes(currentStage) },
    { id: 'final', title: 'Finalize & Send', completed: false }
  ];

  // Enhanced input validation
  const validateField = (field, value) => {
    if (!field.validation) return '';
    
    switch (field.validation) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      
      case 'phone':
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return !phoneRegex.test(value) ? 'Please enter a valid phone number (e.g., 555-123-4567)' : '';
      
      case 'currency':
        return (!value || value <= 0) ? 'Please enter a valid amount greater than 0' : '';
      
      case 'interestRate':
        return (!value || value <= 0 || value > 50) ? 'Interest rate must be between 0.01% and 50%' : '';
      
      case 'percentage':
        return (!value || value <= 0 || value > 100) ? 'Percentage must be between 0.01% and 100%' : '';
      
      case 'days':
        return (!value || value <= 0 || value > 365) ? 'Days must be between 1 and 365' : '';
      
      case 'months':
        return (!value || value <= 0 || value > 360) ? 'Months must be between 1 and 360' : '';
      
      case 'dayOfMonth':
        return (!value || value < 1 || value > 31) ? 'Day must be between 1 and 31' : '';
      
      case 'futureDate':
        const selectedDate = new Date(value);
        const today = new Date();
        return selectedDate <= today ? 'Date must be in the future' : '';
      
      case 'address':
        return value.length < 10 ? 'Please enter a complete address' : '';
      
      case 'apn':
        return value && !/^[0-9-]+$/.test(value) ? 'APN should contain only numbers and dashes' : '';
      
      default:
        return '';
    }
  };

  // Enhanced AI suggestion generation
  const generateAISuggestion = async (clauseId, userInput) => {
    setIsProcessing(true);
    setTimeout(() => {
      const input = userInput.toLowerCase();
      let suggestion = '';
      let clauseTitle = '';

      // Enhanced AI suggestion patterns with 25+ clause types
      if (input.includes('prepay') || input.includes('early pay') || input.includes('pay early') || input.includes('prepayment')) {
        clauseTitle = '**Prepayment Clause**';
        suggestion = `${clauseTitle}\nThe Borrower may, at any time and from time to time, prepay all or any portion of the outstanding principal amount of this Note, together with any accrued interest, without premium or penalty. Any such prepayment shall be applied first to accrued interest and then to the principal balance unless otherwise agreed in writing by the Lender. Borrower shall provide Lender with ten (10) days prior written notice of any prepayment exceeding 25% of the outstanding principal balance.`;
      }
      else if (input.includes('default') || input.includes('breach') || input.includes('non-payment')) {
        clauseTitle = '**Default and Remedies**';
        suggestion = `${clauseTitle}\nThe following shall constitute events of default: (a) failure to make any payment when due which continues for fifteen (15) days after written notice; (b) breach of any other provision which continues for thirty (30) days after written notice; (c) bankruptcy, insolvency, or assignment for the benefit of creditors; (d) death or incapacity if Borrower is an individual. Upon default, the entire unpaid principal balance and accrued interest shall become immediately due and payable at the option of the Note Holder, who may pursue any legal or equitable remedies available.`;
      }
      else if (input.includes('insurance') || input.includes('property insurance') || input.includes('hazard insurance')) {
        clauseTitle = '**Insurance Requirements**';
        suggestion = `${clauseTitle}\nBorrower shall maintain comprehensive property insurance coverage on any property securing this Note in an amount not less than the full replacement value thereof, with a maximum deductible of $5,000. Such insurance shall name Lender as mortgagee and additional insured. Borrower shall provide Lender with evidence of such insurance annually and at least thirty (30) days prior to any renewal, replacement, or cancellation of coverage. All insurance proceeds shall be applied to restoration of the property or payment of the debt at Lender's option.`;
      }
      else {
        // Enhanced default suggestion with better legal formatting
        clauseTitle = '**Additional Provision**';
        suggestion = `${clauseTitle}\n${formatUserInputToLegalLanguage(userInput)} This provision shall be binding upon both parties and their respective heirs, successors, and assigns. Any violation of this provision may result in monetary damages and/or equitable relief as determined by a court of competent jurisdiction. The parties acknowledge that they have read and understood this provision and agree to be bound hereby.`;
      }
      
      updateCustomClause(clauseId, 'aiSuggestion', suggestion);
      setIsProcessing(false);
    }, 1500);
  };

  // Helper function to convert user input to more formal legal language
  const formatUserInputToLegalLanguage = (userInput) => {
    let formatted = userInput;
    
    // Replace informal language with legal terminology
    formatted = formatted.replace(/\bi\b/gi, 'Borrower');
    formatted = formatted.replace(/\byou\b/gi, 'Lender');
    formatted = formatted.replace(/\bwe\b/gi, 'the parties');
    formatted = formatted.replace(/\bwant to\b/gi, 'shall');
    formatted = formatted.replace(/\bwill\b/gi, 'shall');
    formatted = formatted.replace(/\bmust\b/gi, 'shall');
    formatted = formatted.replace(/\bhave to\b/gi, 'shall be required to');
    formatted = formatted.replace(/\bcan't\b/gi, 'may not');
    formatted = formatted.replace(/\bcannot\b/gi, 'may not');
    formatted = formatted.replace(/\bwon't\b/gi, 'shall not');
    formatted = formatted.replace(/\bif something happens\b/gi, 'in the event that');
    formatted = formatted.replace(/\bmoney\b/gi, 'funds');
    formatted = formatted.replace(/\bpay back\b/gi, 'repay');
    formatted = formatted.replace(/\bokay\b/gi, 'acceptable');
    formatted = formatted.replace(/\bOK\b/gi, 'acceptable');
    
    // Ensure proper capitalization
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    // Ensure proper ending punctuation
    if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
      formatted += '.';
    }
    
    return formatted;
  };

  // Auto-save simulation
  useEffect(() => {
    const autoSave = () => {
      if (basicInfo && Object.keys(basicInfo).length > 0) {
        setAutoSaveStatus('saving');
        setTimeout(() => {
          setAutoSaveStatus('saved');
          // Simulate saving to backend
          console.log('Auto-saved document data:', { basicInfo, customClauses, selectedDocument });
        }, 1000);
      }
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [basicInfo, customClauses, selectedDocument]);

  // Document analysis
  const analyzeDocument = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const analysis = {
        completeness: calculateCompleteness(),
        risks: identifyRisks(),
        suggestions: generateSuggestions(),
        compliance: checkCompliance()
      };
      setDocumentAnalysis(analysis);
      setShowAnalysis(true);
      setIsProcessing(false);
    }, 2000);
  };

  const calculateCompleteness = () => {
    const requiredFields = getRequiredFields().filter(field => field.required);
    const completedFields = requiredFields.filter(field => basicInfo[field.id] && basicInfo[field.id].toString().trim() !== '');
    const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
    
    return {
      percentage,
      status: percentage === 100 ? 'complete' : percentage >= 80 ? 'mostly_complete' : 'incomplete',
      missingFields: requiredFields.filter(field => !basicInfo[field.id] || basicInfo[field.id].toString().trim() === '').map(field => field.label)
    };
  };

  const identifyRisks = () => {
    const risks = [];
    
    // Interest rate risk
    if (basicInfo.interest_rate && parseFloat(basicInfo.interest_rate) > 18) {
      risks.push({ level: 'high', message: 'Interest rate may exceed state usury limits' });
    }
    
    // Payment schedule risk
    if (basicInfo.loan_term_months && basicInfo.principal_amount && basicInfo.payment_amount) {
      const totalPayments = parseFloat(basicInfo.payment_amount) * parseInt(basicInfo.loan_term_months);
      const principal = parseFloat(basicInfo.principal_amount);
      if (totalPayments < principal) {
        risks.push({ level: 'high', message: 'Payment schedule may not cover principal balance - balloon payment required' });
      }
    }
    
    // Date consistency
    if (basicInfo.first_payment_date && basicInfo.maturity_date) {
      const firstPayment = new Date(basicInfo.first_payment_date);
      const maturity = new Date(basicInfo.maturity_date);
      if (maturity <= firstPayment) {
        risks.push({ level: 'high', message: 'Maturity date must be after first payment date' });
      }
    }
    
    // Missing security
    if (selectedDocument === 'promissory_note' && basicInfo.security_type === 'Unsecured' && parseFloat(basicInfo.principal_amount) > 50000) {
      risks.push({ level: 'medium', message: 'Consider requiring security for loans over $50,000' });
    }
    
    return risks;
  };

  const generateSuggestions = () => {
    const suggestions = [];
    
    // Missing clauses
    const commonClauses = ['prepayment', 'default', 'insurance', 'governing law'];
    const existingClauseTypes = customClauses.map(clause => clause.title.toLowerCase());
    
    commonClauses.forEach(clauseType => {
      if (!existingClauseTypes.some(existing => existing.includes(clauseType))) {
        suggestions.push(`Consider adding a ${clauseType} clause`);
      }
    });
    
    // State-specific recommendations
    if (basicInfo.governing_state === 'California') {
      suggestions.push('California requires specific disclosure language for certain loan types');
    }
    
    if (basicInfo.governing_state === 'Texas') {
      suggestions.push('Texas has specific homestead exemption provisions to consider');
    }
    
    return suggestions;
  };

  const checkCompliance = () => {
    const compliance = [];
    
    // RESPA compliance for real estate
    if (['purchase_contract', 'loi'].includes(selectedDocument)) {
      compliance.push({ status: 'warning', message: 'Verify RESPA disclosure requirements' });
    }
    
    // Truth in Lending for loans
    if (['promissory_note'].includes(selectedDocument)) {
      compliance.push({ status: 'warning', message: 'Consider Truth in Lending Act disclosure requirements' });
    }
    
    // Securities laws for partnerships
    if (['partnership_agreement', 'operating_agreement'].includes(selectedDocument)) {
      compliance.push({ status: 'warning', message: 'Review securities law compliance for multi-investor structures' });
    }
    
    return compliance;
  };

  // Enhanced clause management
  const addCustomClause = () => {
    setCustomClauses([...customClauses, { 
      id: Date.now(), 
      title: '', 
      content: '', 
      aiSuggestion: '',
      lastModified: new Date().toISOString()
    }]);
  };

  const updateCustomClause = (id, field, value) => {
    setCustomClauses(customClauses.map(clause => 
      clause.id === id ? { 
        ...clause, 
        [field]: value,
        lastModified: new Date().toISOString()
      } : clause
    ));
    setAutoSaveStatus('unsaved');
  };

  const removeCustomClause = (id) => {
    setCustomClauses(customClauses.filter(clause => clause.id !== id));
  };

  // Enhanced document generation with version tracking
  const generateFirstDraft = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const draft = generateDocumentDraft();
      const version = {
        version: documentVersion,
        content: draft,
        timestamp: new Date().toISOString(),
        changes: 'Initial draft generated'
      };
      
      setDocumentHistory([...documentHistory, version]);
      setGeneratedDraft(draft);
      setDocumentVersion(documentVersion + 1);
      setCurrentStage('draft');
      setIsProcessing(false);
    }, 2000);
  };

  const generateDocumentDraft = () => {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount || 0);

    // Generate document based on selected type
    switch (selectedDocument) {
      case 'promissory_note':
        return generatePromissoryNote(today, formatCurrency);
      case 'operating_agreement':
        return generateOperatingAgreement(today, formatCurrency);
      case 'equity_buyout':
        return generateEquityBuyout(today, formatCurrency);
      case 'partnership_agreement':
        return generatePartnershipAgreement(today, formatCurrency);
      case 'purchase_contract':
        return generatePurchaseContract(today, formatCurrency);
      case 'loi':
        return generateLOI(today, formatCurrency);
      default:
        return 'Document type not found.';
    }
  };

  // Enhanced document generation functions with professional formatting
  const generatePromissoryNote = (today, formatCurrency) => {
    const customClausesSection = customClauses.length > 0 ? 
      `\n\nADDITIONAL TERMS AND CONDITIONS:\n\n${customClauses.map(clause => 
        `${clause.aiSuggestion || clause.content}\n`
      ).join('\n')}` : '';

    return `SECURED PROMISSORY NOTE

Principal Amount: ${formatCurrency(basicInfo.principal_amount)}
Date: ${today}
Note No: PN-${Date.now()}

FOR VALUE RECEIVED, ${basicInfo.borrower_name || '[Borrower Name]'}, a ${basicInfo.borrower_entity_type || '[Entity Type]'} ("Borrower"), promises to pay to the order of ${basicInfo.lender_name || '[Lender Name]'}, a ${basicInfo.lender_entity_type || '[Entity Type]'} ("Lender" or "Note Holder"), the principal sum of ${formatCurrency(basicInfo.principal_amount)} with interest on the unpaid principal balance from ${today} until paid, at the rate of ${basicInfo.interest_rate || '[Rate]'}% per annum.

PAYMENT TERMS:
Principal and interest shall be payable in ${basicInfo.loan_term_months || '[Term]'} monthly installments of ${formatCurrency(basicInfo.payment_amount)}, due on the ${basicInfo.payment_day || '[Day]'} day of each month, beginning ${basicInfo.first_payment_date || '[First Payment Date]'}, and continuing until ${basicInfo.maturity_date || '[Maturity Date]'}, when all remaining principal and accrued interest shall be due and payable.

LATE CHARGES:
If any payment is not received within ${basicInfo.grace_period_days || '10'} days after the due date, Borrower shall pay a late charge of ${basicInfo.late_fee_rate || '5'}% of the overdue payment.

BORROWER INFORMATION:
Name: ${basicInfo.borrower_name || '[Borrower Name]'}
Address: ${basicInfo.borrower_address || '[Borrower Address]'}
Entity Type: ${basicInfo.borrower_entity_type || '[Entity Type]'}

LENDER INFORMATION:
Name: ${basicInfo.lender_name || '[Lender Name]'}
Address: ${basicInfo.lender_address || '[Lender Address]'}
Entity Type: ${basicInfo.lender_entity_type || '[Entity Type]'}

SECURITY:
This Note is secured by ${basicInfo.security_type === 'Real Property' ? 'a deed of trust' : basicInfo.security_type} on the following property: ${basicInfo.secured_property_address || 'See attached security agreement'}.${customClausesSection}

DEFAULT PROVISIONS:
Time is of the essence. Events of default include: (a) failure to make any payment when due; (b) breach of any other provision of this Note; (c) bankruptcy or insolvency proceedings; (d) material adverse change in Borrower's financial condition. Upon default, the entire unpaid balance shall become immediately due and payable at the option of the Note Holder.

GENERAL PROVISIONS:
This Note shall be governed by the laws of the State of ${basicInfo.governing_state || '[State]'}. Borrower waives presentment, protest, and notice of dishonor. In the event of default, Borrower shall pay all costs of collection, including reasonable attorneys' fees.

Borrower acknowledges receipt of a copy of this Note and agrees to be bound by all terms and conditions herein.

IN WITNESS WHEREOF, Borrower has executed this Note as of the date first written above.

BORROWER:

_________________________________
${basicInfo.borrower_name || '[Borrower Name]'}
${basicInfo.borrower_entity_type || '[Title]'}

Date: _______________

[NOTARIZATION BLOCK]

State of ${basicInfo.governing_state || '[State]'}
County of ___________

On this _____ day of _______, 20__, before me personally appeared ${basicInfo.borrower_name || '[Borrower Name]'}, who proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument and acknowledged to me that he/she/they executed the same in his/her/their authorized capacity, and that by his/her/their signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.

_________________________________
Notary Public`;

  };

  const generateOperatingAgreement = (today, formatCurrency) => {
    const customClausesSection = customClauses.length > 0 ? 
      customClauses.map((clause, index) => 
        `\nARTICLE ${index + 7}: ${clause.title.toUpperCase() || 'ADDITIONAL PROVISION'}\n${clause.aiSuggestion || clause.content}`
      ).join('\n') : '';

    return `OPERATING AGREEMENT
${basicInfo.company_name || '[Company Name]'}
A ${basicInfo.formation_state || '[State]'} Limited Liability Company

This Operating Agreement ("Agreement") is made and entered into as of ${today}, by and among ${basicInfo.company_name || '[Company Name]'}, a ${basicInfo.formation_state || '[State]'} limited liability company (the "Company"), and the members whose signatures appear below (individually, a "Member" and collectively, the "Members").

RECITALS

WHEREAS, the Company was formed under the Limited Liability Company Act of the State of ${basicInfo.formation_state || '[State]'} by the filing of Articles of Organization on ${basicInfo.formation_date || '[Formation Date]'}; and

WHEREAS, the Members desire to set forth their agreement regarding the governance, management, and operation of the Company;

NOW, THEREFORE, the Members agree as follows:

ARTICLE I: FORMATION AND NAME
1.1 Formation. The Company was formed under the laws of the State of ${basicInfo.formation_state || '[State]'} on ${basicInfo.formation_date || '[Formation Date]'}.
1.2 Name. The name of the Company is ${basicInfo.company_name || '[Company Name]'}.
1.3 Term. The Company shall have a perpetual existence unless dissolved in accordance with this Agreement.

ARTICLE II: REGISTERED OFFICE AND AGENT
2.1 Registered Office. The registered office of the Company is located at ${basicInfo.registered_agent_address || '[Registered Agent Address]'}.
2.2 Registered Agent. The registered agent of the Company is ${basicInfo.registered_agent_name || '[Registered Agent Name]'}.
2.3 Principal Place of Business. The principal place of business of the Company is ${basicInfo.business_address || '[Business Address]'}.

ARTICLE III: PURPOSE AND POWERS
3.1 Purpose. The purpose of the Company is to engage in any lawful business for which limited liability companies may be organized under the laws of the State of ${basicInfo.formation_state || '[State]'}.
3.2 Powers. The Company shall have all powers necessary or convenient to carry out its purpose.

ARTICLE IV: MEMBERS AND MEMBERSHIP INTERESTS
4.1 Initial Members. The initial Members and their respective Membership Interests are as follows:

Member Name: ${basicInfo.member1_name || '[Member 1]'}
Type: ${basicInfo.member1_type || '[Type]'}
Capital Contribution: ${formatCurrency(basicInfo.member1_contribution)}
Membership Interest: ${basicInfo.member1_percentage || '[%]'}%

${basicInfo.member2_name ? `Member Name: ${basicInfo.member2_name}
Type: ${basicInfo.member2_type || '[Type]'}
Capital Contribution: ${formatCurrency(basicInfo.member2_contribution)}
Membership Interest: ${basicInfo.member2_percentage || '[%]'}%` : ''}

4.2 Additional Capital Contributions. Additional capital contributions may be required ${basicInfo.additional_contributions_required || 'by unanimous consent of the Members'}.

ARTICLE V: MANAGEMENT
5.1 Management Structure. The Company shall be ${basicInfo.management_type || 'manager-managed'}.
5.2 Manager. The initial Manager of the Company is ${basicInfo.manager_name || '[Manager Name]'}.
5.3 Voting. Decisions requiring Member approval shall require the consent of Members holding at least ${basicInfo.voting_threshold || '51'}% of the Membership Interests.

ARTICLE VI: DISTRIBUTIONS AND ALLOCATIONS
6.1 Distributions. Distributions shall be made to Members pro rata in accordance with their respective Membership Interests.
6.2 Tax Allocations. All items of income, gain, loss, deduction, and credit shall be allocated among the Members in proportion to their Membership Interests.
6.3 Tax Elections. The Company elects to be classified as a partnership for federal income tax purposes.${customClausesSection}

ARTICLE ${customClauses.length + 7}: GOVERNING LAW AND DISPUTE RESOLUTION
${customClauses.length + 7}.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of ${basicInfo.governing_state || '[State]'}.
${customClauses.length + 7}.2 Dispute Resolution. Any disputes arising under this Agreement shall be resolved through binding arbitration in ${basicInfo.arbitration_location || '[Location]'}.

ARTICLE ${customClauses.length + 8}: MISCELLANEOUS
${customClauses.length + 8}.1 Entire Agreement. This Agreement constitutes the entire agreement among the Members.
${customClauses.length + 8}.2 Amendment. This Agreement may be amended only by written consent of all Members.
${customClauses.length + 8}.3 Severability. If any provision of this Agreement is deemed invalid, the remainder shall remain in full force and effect.

IN WITNESS WHEREOF, the undersigned have executed this Agreement as of the date first written above.

MEMBERS:

_________________________________
${basicInfo.member1_name || '[Member 1]'}, Member

${basicInfo.member2_name ? `_________________________________
${basicInfo.member2_name}, Member` : ''}

[NOTARIZATION BLOCKS FOR EACH MEMBER]`;
  };

  const generateEquityBuyout = (today, formatCurrency) => {
    const customClausesSection = customClauses.length > 0 ? 
      `\n\nADDITIONAL TERMS AND CONDITIONS:\n\n${customClauses.map(clause => 
        `${clause.aiSuggestion || clause.content}\n`
      ).join('\n')}` : '';

    return `EQUITY BUYOUT AGREEMENT

This Equity Buyout Agreement ("Agreement") is entered into as of ${today}, between ${basicInfo.buyer_name || '[Managing Member]'} ("Acquiring Member") and ${basicInfo.seller_name || '[Equity Member]'} ("Departing Member").

RECITALS:
WHEREAS, the parties are members of ${basicInfo.company_name || '[Company Name]'}, a limited liability company organized under the laws of ${basicInfo.formation_state || '[State]'} (the "Company");

WHEREAS, Departing Member owns a ${basicInfo.member2_percentage || '30'}% membership interest in the Company (the "Interest");

WHEREAS, Acquiring Member desires to purchase the Interest from Departing Member; and

WHEREAS, the parties desire to set forth the terms and conditions of such purchase;

NOW THEREFORE, the parties agree as follows:

1. PURCHASE AND SALE OF INTEREST
1.1 Sale of Interest. Subject to the terms and conditions of this Agreement, Departing Member hereby agrees to sell, transfer, and assign to Acquiring Member, and Acquiring Member agrees to purchase from Departing Member, all of Departing Member's right, title, and interest in and to the Interest.

1.2 Purchase Price. The total purchase price for the Interest shall be ${formatCurrency(basicInfo.principal_amount || 90000)} (the "Purchase Price").

2. PAYMENT TERMS
2.1 Payment Structure. The Purchase Price shall be paid as follows:
(a) Down Payment: $_______ upon execution of this Agreement
(b) Monthly Payments: ${formatCurrency(basicInfo.payment_amount || 600)} per month, including interest at ${basicInfo.interest_rate || '8'}% per annum
(c) Final Payment: All remaining principal and accrued interest due on ${basicInfo.maturity_date || '[Final Payment Date]'}

2.2 First Payment. The first monthly payment shall be due on ${basicInfo.first_payment_date || '[First Payment Date]'}.

3. REPRESENTATIONS AND WARRANTIES
3.1 Departing Member Representations. Departing Member represents and warrants that:
(a) Departing Member has full power and authority to enter into this Agreement
(b) The Interest is free and clear of all liens, encumbrances, and claims
(c) Departing Member has not assigned or transferred any portion of the Interest

3.2 Acquiring Member Representations. Acquiring Member represents and warrants that:
(a) Acquiring Member has the financial ability to make all payments required hereunder
(b) Acquiring Member has full power and authority to enter into this Agreement

4. CLOSING AND TRANSFER
4.1 Closing. The closing shall occur upon execution of this Agreement.
4.2 Transfer Documents. At closing, Departing Member shall execute all documents necessary to transfer the Interest to Acquiring Member.

5. RELEASE AND INDEMNIFICATION
5.1 Release. Upon closing, Departing Member releases the Company and Acquiring Member from all claims related to Departing Member's membership in the Company.
5.2 Indemnification. Each party shall indemnify the other against any claims arising from breaches of this Agreement.${customClausesSection}

6. GENERAL PROVISIONS
6.1 Governing Law. This Agreement shall be governed by the laws of the State of ${basicInfo.governing_state || '[State]'}.
6.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties.
6.3 Amendment. This Agreement may be amended only in writing signed by both parties.
6.4 Binding Effect. This Agreement shall be binding upon the parties and their respective heirs, successors, and assigns.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

ACQUIRING MEMBER:

_________________________________
${basicInfo.buyer_name || '[Managing Member]'}

Date: _______________

DEPARTING MEMBER:

_________________________________
${basicInfo.seller_name || '[Equity Member]'}

Date: _______________

[NOTARIZATION BLOCKS]`;
  };

  const generatePartnershipAgreement = (today, formatCurrency) => {
    const customClausesSection = customClauses.length > 0 ? 
      `\n\nADDITIONAL PROVISIONS:\n\n${customClauses.map(clause => 
        `${clause.aiSuggestion || clause.content}\n`
      ).join('\n')}` : '';

    return `LIMITED PARTNERSHIP AGREEMENT

This Limited Partnership Agreement (this "Agreement") is made and entered into as of ${today}, by and between:

GENERAL PARTNER:
${basicInfo.buyer_name || '[General Partner]'} ("General Partner")

LIMITED PARTNER(S):
${basicInfo.seller_name || '[Limited Partner]'} ("Limited Partner")

RECITALS:
WHEREAS, the parties desire to form a limited partnership under the laws of the State of ${basicInfo.formation_state || '[State]'} for the purpose of acquiring, owning, operating, improving, and managing real estate investments;

WHEREAS, the partnership shall initially acquire the property located at ${basicInfo.property_address || '[Property Address]'} (the "Property");

NOW THEREFORE, the parties agree as follows:

1. FORMATION AND NAME
1.1 Formation. The parties hereby form a limited partnership under the Uniform Limited Partnership Act of the State of ${basicInfo.formation_state || '[State]'}.
1.2 Name. The name of the partnership shall be "${basicInfo.company_name || '[Partnership Name]'}".
1.3 Principal Place of Business. The principal place of business shall be ${basicInfo.business_address || '[Business Address]'}.

2. PURPOSE AND TERM
2.1 Purpose. The purpose of the partnership is to acquire, own, operate, improve, lease, manage, and dispose of real estate for investment purposes.
2.2 Term. The partnership shall commence on ${today} and shall continue until dissolved in accordance with this Agreement or by operation of law.

3. CAPITAL CONTRIBUTIONS
3.1 Initial Contributions. The partners shall make the following initial capital contributions:

General Partner:
- Cash Contribution: $__________
- Management Services: Valued at $__________
- Total Contribution: $__________
- Partnership Interest: ${basicInfo.member1_percentage || '50.1'}%

Limited Partner:
- Cash Contribution: ${formatCurrency(basicInfo.member2_contribution)}
- Partnership Interest: ${basicInfo.member2_percentage || '49.9'}%

3.2 Additional Contributions. Additional capital contributions may be required by unanimous consent of all partners.

4. MANAGEMENT AND CONTROL
4.1 General Partner Authority. The General Partner shall have exclusive authority to manage and control the business and affairs of the partnership.
4.2 Limited Partner Rights. Limited Partners shall not participate in the management or control of partnership business.
4.3 Major Decisions. The following decisions shall require consent of partners holding at least ${basicInfo.voting_threshold || '75'}% of partnership interests:
(a) Sale or refinancing of the Property
(b) Admission of new partners
(c) Amendment of this Agreement
(d) Dissolution of the partnership

5. PROFITS, LOSSES, AND DISTRIBUTIONS
5.1 Allocation. Profits and losses shall be allocated among the partners in proportion to their partnership interests.
5.2 Distributions. Distributions shall be made quarterly, or as determined by the General Partner, in proportion to partnership interests.
5.3 Return of Capital. Upon sale or refinancing of the Property, capital shall be returned to partners in proportion to their unreturned capital contributions.

6. TRANSFER OF INTERESTS
6.1 General Partner. The General Partner may not transfer its interest without consent of all Limited Partners.
6.2 Limited Partners. Limited Partners may transfer their interests with 30 days' prior written notice to the General Partner.
6.3 Right of First Refusal. The partnership shall have a right of first refusal on any proposed transfer of partnership interests.

7. BOOKS AND RECORDS
7.1 Accounting Method. The partnership shall use the accrual method of accounting.
7.2 Tax Year. The partnership tax year shall be the calendar year.
7.3 Records. Complete books and records shall be maintained at the principal place of business.

8. DISSOLUTION AND LIQUIDATION
8.1 Events of Dissolution. The partnership shall dissolve upon:
(a) Sale of all partnership assets
(b) Unanimous consent of all partners
(c) Withdrawal or bankruptcy of the General Partner (unless a successor is appointed)
8.2 Liquidation. Upon dissolution, assets shall be distributed in the following order:
(a) Payment of partnership debts and liabilities
(b) Return of capital contributions
(c) Distribution of remaining assets in proportion to partnership interests${customClausesSection}

9. GENERAL PROVISIONS
9.1 Governing Law. This Agreement shall be governed by the laws of the State of ${basicInfo.governing_state || '[State]'}.
9.2 Dispute Resolution. Disputes shall be resolved through binding arbitration in ${basicInfo.arbitration_location || '[Location]'}.
9.3 Entire Agreement. This Agreement constitutes the entire agreement among the partners.
9.4 Amendment. This Agreement may be amended only in writing with the consent of all partners.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

GENERAL PARTNER:

_________________________________
${basicInfo.buyer_name || '[General Partner]'}

Date: _______________

LIMITED PARTNER:

_________________________________
${basicInfo.seller_name || '[Limited Partner]'}

Date: _______________

[NOTARIZATION BLOCKS]`;
  };

  const generatePurchaseContract = (today, formatCurrency) => {
    const customClausesSection = customClauses.length > 0 ? 
      `\n\nSPECIAL TERMS AND CONDITIONS:\n\n${customClauses.map(clause => 
        `${clause.aiSuggestion || clause.content}\n`
      ).join('\n')}` : '';

    return `PURCHASE AND SALE AGREEMENT

Property Address: ${basicInfo.property_address || '[Property Address]'}
Legal Description: ${basicInfo.legal_description || 'See attached Exhibit A'}
APN: ${basicInfo.apn || '[Assessor Parcel Number]'}

THIS PURCHASE AND SALE AGREEMENT (this "Agreement") is made as of ${today}, between:

SELLER:
Name: ${basicInfo.seller_name || '[Seller Name]'}
Address: ${basicInfo.seller_address || '[Seller Address]'}
Email: ${basicInfo.seller_email || '[Seller Email]'}
Phone: ${basicInfo.seller_phone || '[Seller Phone]'}

BUYER:
Name: ${basicInfo.buyer_name || '[Buyer Name]'}
Address: ${basicInfo.buyer_address || '[Buyer Address]'}
Email: ${basicInfo.buyer_email || '[Buyer Email]'}
Phone: ${basicInfo.buyer_phone || '[Buyer Phone]'}

1. PURCHASE PRICE AND TERMS
1.1 Purchase Price. The total purchase price for the Property is ${formatCurrency(basicInfo.purchase_price)} (the "Purchase Price").
1.2 Earnest Money. Buyer has deposited ${formatCurrency(basicInfo.earnest_money)} as earnest money (the "Earnest Money") with the escrow agent named below.
1.3 Financing. This purchase is subject to ${basicInfo.financing_type || '[Financing Type]'} financing.

2. CLOSING AND POSSESSION
2.1 Closing Date. The closing shall occur on or before ${basicInfo.closing_date || '[Closing Date]'} (the "Closing Date").
2.2 Possession. Possession shall be delivered to Buyer at closing.
2.3 Prorations. Property taxes, insurance, rents, and other items shall be prorated as of the closing date.

3. CONTINGENCIES
3.1 Inspection Contingency. This offer is contingent upon Buyer's approval of the Property's condition within ${basicInfo.inspection_period || '10'} days after acceptance.
3.2 Financing Contingency. ${basicInfo.financing_contingency_days ? `This offer is contingent upon Buyer obtaining financing within ${basicInfo.financing_contingency_days} days after acceptance.` : 'This offer is not contingent upon financing.'}
3.3 Appraisal Contingency. ${basicInfo.appraisal_contingency === 'Yes' ? 'This offer is contingent upon the Property appraising at or above the Purchase Price.' : 'This offer is not contingent upon appraisal.'}

4. CONDITION OF PROPERTY
4.1 As-Is Sale. The Property is sold in its present "as-is" condition, subject to Buyer's inspection rights.
4.2 Disclosures. Seller shall provide all required disclosures within 5 days of acceptance.
4.3 Title. Seller shall convey marketable title by grant deed, subject only to matters of record.

5. ESCROW AND CLOSING
5.1 Escrow Agent. ${basicInfo.escrow_company || '[Escrow Company Name]'} shall serve as escrow agent.
5.2 Title Company. ${basicInfo.title_company || '[Title Company Name]'} shall provide title insurance.
5.3 Closing Costs. Each party shall pay their customary closing costs unless otherwise specified herein.

6. DEFAULT AND REMEDIES
6.1 Buyer Default. If Buyer defaults, Seller may retain the Earnest Money as liquidated damages or pursue other legal remedies.
6.2 Seller Default. If Seller defaults, Buyer may seek specific performance, damages, or return of the Earnest Money plus expenses.

7. RISK OF LOSS
Risk of loss shall remain with Seller until closing. If the Property is materially damaged prior to closing, Buyer may terminate this Agreement.

8. BROKER COMPENSATION
Seller shall pay real estate commissions according to separate listing and buyer representation agreements.${customClausesSection}

9. GENERAL PROVISIONS
9.1 Time is of the Essence. Time is of the essence in this Agreement.
9.2 Governing Law. This Agreement shall be governed by the laws of the State of ${basicInfo.governing_state || '[State]'}.
9.3 Entire Agreement. This Agreement constitutes the entire agreement between the parties.
9.4 Counterparts. This Agreement may be executed in counterparts, including electronic signatures.

10. ACCEPTANCE
This offer shall expire if not accepted by _______ on _______, 20__.

BUYER:

_________________________________
${basicInfo.buyer_name || '[Buyer Name]'}

Date: _______________

SELLER:

_________________________________
${basicInfo.seller_name || '[Seller Name]'}

Date: _______________

[NOTARIZATION BLOCKS AND ADDENDA ATTACHMENTS]`;
  };

  const generateLOI = (today, formatCurrency) => {
    const customClausesSection = customClauses.length > 0 ? 
      `\nADDITIONAL TERMS AND CONDITIONS:\n${customClauses.map(clause => 
        `${clause.aiSuggestion || clause.content}`
      ).join('\n\n')}\n` : '';

    return `LETTER OF INTENT TO PURCHASE REAL ESTATE

Date: ${today}

${basicInfo.seller_name || '[Seller Name]'}
${basicInfo.seller_address || '[Seller Address]'}

Re: Letter of Intent to Purchase ${basicInfo.property_address || '[Property Address]'}

Dear ${basicInfo.seller_name ? basicInfo.seller_name.split(' ')[0] : '[Seller Name]'},

${basicInfo.buyer_name || '[Buyer Name]'} ("Buyer") hereby submits this Letter of Intent ("LOI") to purchase the real property located at ${basicInfo.property_address || '[Property Address]'} (the "Property") from ${basicInfo.seller_name || '[Seller Name]'} ("Seller") under the following proposed terms and conditions:

PROPOSED TRANSACTION TERMS:

1. PURCHASE PRICE: ${formatCurrency(basicInfo.purchase_price)}

2. EARNEST MONEY: Buyer will deposit ${formatCurrency(basicInfo.earnest_money)} as earnest money within 3 business days of acceptance of this LOI.

3. DUE DILIGENCE PERIOD: ${basicInfo.inspection_period || '[X]'} days from acceptance of this LOI for Buyer to complete all inspections, feasibility studies, and other due diligence.

4. CLOSING: Approximately ${basicInfo.closing_date || '[X] days after completion of due diligence'}, subject to completion of all contingencies.

5. FINANCING: ${basicInfo.financing_type || '[Financing Type]'} ${basicInfo.financing_type === 'Cash' ? '' : '- Buyer to obtain financing during due diligence period'}

6. PROPERTY CONDITION: Property to be conveyed in its present "as-is" condition, subject to Buyer's inspection and approval.

7. TITLE: Seller to provide marketable title, subject only to standard exceptions and matters of record acceptable to Buyer.

8. CONTINGENCIES:
   - Satisfactory completion of all due diligence investigations
   - ${basicInfo.financing_type !== 'Cash' ? 'Buyer obtaining satisfactory financing' : 'Verification of funds'}
   - ${basicInfo.appraisal_contingency === 'Yes' ? 'Property appraisal at or above purchase price' : 'No appraisal contingency'}
   - Review and approval of all leases, contracts, and operating documents

9. ADDITIONAL DUE DILIGENCE ITEMS:
   - Physical inspection of the Property
   - Review of environmental reports and studies
   - Review of all financial records for the Property
   - Verification of zoning and permitted uses
   - Review of all service contracts and warranties${customClausesSection}

EXCLUSIVITY:
During the due diligence period, Seller agrees not to market the Property or negotiate with other potential buyers.

CONFIDENTIALITY:
Buyer agrees to maintain the confidentiality of all non-public information provided by Seller regarding the Property.

BROKER REPRESENTATION:
${basicInfo.buyer_name || '[Buyer]'} is represented by _____________.
${basicInfo.seller_name || '[Seller]'} is represented by _____________.

NON-BINDING NATURE:
This LOI is intended to be NON-BINDING and serves only to outline the basic terms for further negotiation. Neither party shall have any binding obligations until the execution of a definitive Purchase and Sale Agreement containing terms and conditions satisfactory to both parties. Either party may withdraw from negotiations at any time prior to execution of such definitive agreement.

ACCEPTANCE:
This LOI shall expire if not accepted by ${basicInfo.seller_name || '[Seller]'} by 5:00 PM on _______, 20__.

We believe this represents a fair and competitive offer for the Property and look forward to working with you to complete this transaction. Please indicate your acceptance by signing below and returning a copy to us.

Thank you for your consideration.

Sincerely,

_________________________________
${basicInfo.buyer_name || '[Buyer Name]'}
${basicInfo.buyer_address || '[Buyer Address]'}
Email: ${basicInfo.buyer_email || '[Buyer Email]'}
Phone: ${basicInfo.buyer_phone || '[Buyer Phone]'}

ACCEPTED:

_________________________________
${basicInfo.seller_name || '[Seller Name]'}

Date: _______________`;
  };

  // Enhanced revision and finalization
  const reviseDraft = () => {
    if (!userFeedback.trim()) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      let revisedDraft = generatedDraft;
      
      // Enhanced AI revision simulation
      const feedback = userFeedback.toLowerCase();
      
      if (feedback.includes('payment') || feedback.includes('amount')) {
        const paymentRegex = /Monthly Payment[s]?: \$[\d,]+/g;
        if (basicInfo.payment_amount) {
          revisedDraft = revisedDraft.replace(paymentRegex, `Monthly Payment: ${formatCurrency(basicInfo.payment_amount)}`);
        }
      }
      
      if (feedback.includes('interest rate') || feedback.includes('rate')) {
        const rateRegex = /\d+\.?\d*% per annum/g;
        if (basicInfo.interest_rate) {
          revisedDraft = revisedDraft.replace(rateRegex, `${basicInfo.interest_rate}% per annum`);
        }
      }
      
      if (feedback.includes('date') || feedback.includes('closing')) {
        const today = new Date();
        const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        revisedDraft = revisedDraft.replace(/\[Date\]/g, futureDate.toLocaleDateString());
      }
      
      if (feedback.includes('address') || feedback.includes('property')) {
        if (basicInfo.property_address) {
          revisedDraft = revisedDraft.replace(/\[Property Address\]/g, basicInfo.property_address);
        }
      }
      
      // Track revision in document history
      const revision = {
        version: documentVersion,
        content: revisedDraft,
        timestamp: new Date().toISOString(),
        changes: `Revision based on feedback: "${userFeedback}"`
      };
      
      setDocumentHistory([...documentHistory, revision]);
      setGeneratedDraft(revisedDraft);
      setDocumentVersion(documentVersion + 1);
      setUserFeedback('');
      setIsProcessing(false);
    }, 1500);
  };

  const finalizeDraft = () => {
    const cleanedDocument = generatedDraft.replace(/\[AI REVISION NOTES:.*?\]/g, '');
    setFinalDocument(cleanedDocument);
    setCurrentStage('final');
  };

  // Navigate to DocSigner with document data
  const sendToDocSigner = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions before proceeding.');
      return;
    }

    const validRecipients = recipients.filter(r => r.name && r.email && r.role);
    if (validRecipients.length === 0) {
      alert('Please add at least one recipient with complete information.');
      return;
    }

    // Prepare document data for DocSigner
    const documentData = {
      documentId: `DOC-${Date.now()}`,
      documentType: selectedDocument,
      documentTitle: documentTypes.find(d => d.id === selectedDocument)?.title,
      content: finalDocument,
      basicInfo,
      customClauses,
      recipients: validRecipients,
      createdAt: new Date().toISOString(),
      version: documentVersion - 1,
      creator: {
        name: basicInfo.buyer_name || basicInfo.lender_name || 'Document Creator',
        email: basicInfo.buyer_email || basicInfo.lender_email || 'creator@example.com'
      }
    };

    // Navigate to DocSigner page with document data
    if (setCurrentPage) {
      setCurrentPage('docsigner', documentData);
    } else {
      // Fallback if setCurrentPage is not available
      console.log('Navigating to DocSigner with data:', documentData);
      alert('DocSigner feature coming soon! Document data prepared.');
    }
  };

  // Enhanced PDF and document generation
  const generatePDF = () => {
    // Create a print-friendly HTML version
    const printWindow = window.open('', '_blank');
    const documentTitle = documentTypes.find(d => d.id === selectedDocument)?.title;
    const printDocument = `
<!DOCTYPE html>
<html>
<head>
    <title>${documentTitle}</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            font-size: 12pt;
            background: white;
            color: black;
        }
        h1, h2, h3 {
            color: black;
            margin-top: 24px;
            margin-bottom: 12px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid black;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .signature-block {
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .signature-line {
            border-bottom: 1px solid black;
            width: 300px;
            margin: 20px 0 5px 0;
        }
        .notary-block {
            border: 2px solid black;
            padding: 20px;
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .no-print { 
            background: #e6f3ff; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-radius: 8px;
            border: 1px solid #0066cc;
        }
        .download-button {
            background: #0066cc;
            color: white;
            border: none;
            padding: 8px 16px;
            margin: 5px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .download-button:hover {
            background: #0052a3;
        }
        @media print {
            body { margin: 0; padding: 0.5in; }
            .no-print { display: none; }
        }
        pre {
            white-space: pre-wrap;
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            margin: 0;
        }
        .document-content {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    <div class="no-print">
        <h3 style="margin: 0 0 10px 0; color: #0066cc;">📄 ${documentTitle}</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
            <strong>Instructions:</strong> Use the buttons below to save this document, or use your browser's Print function (Ctrl/Cmd + P) and select "Save as PDF".
        </p>
        <button class="download-button" onclick="window.print()">🖨️ Print to PDF</button>
        <button class="download-button" onclick="downloadAsText()">📄 Download Text</button>
        <button class="download-button" onclick="window.close()" style="background: #666;">✕ Close</button>
    </div>
    
    <div class="header">
        <h1>${documentTitle.toUpperCase()}</h1>
        <p><strong>Document ID:</strong> DOC-${Date.now()}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} at ${new Date().toLocaleTimeString()}</p>
        <p><strong>Version:</strong> ${documentVersion - 1}</p>
    </div>

    <div class="document-content">
        <pre>${finalDocument.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>

    <script>
        function downloadAsText() {
            const content = \`${finalDocument.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`;
            const formattedContent = \`================================================================================
${documentTitle.toUpperCase()}
================================================================================

Document ID: DOC-${Date.now()}
Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${new Date().toLocaleTimeString()}
Version: ${documentVersion - 1}

================================================================================

\` + content + \`

================================================================================
END OF DOCUMENT
================================================================================

Generated by AI Legal Document Generator
This document should be reviewed by a qualified attorney before execution.
\`;
            
            const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '${selectedDocument}_${new Date().toISOString().split('T')[0]}.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // Auto-focus and helpful tips
        window.onload = function() {
            console.log('Document ready for printing or downloading');
        };
    </script>
</body>
</html>`;

    printWindow.document.write(printDocument);
    printWindow.document.close();
    printWindow.focus();
  };

  // Formatted text download
  const downloadAsText = () => {
    const formattedContent = `
================================================================================
${documentTypes.find(d => d.id === selectedDocument)?.title.toUpperCase()}
================================================================================

Document ID: DOC-${Date.now()}
Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
Version: ${documentVersion - 1}

================================================================================

${finalDocument}

================================================================================
END OF DOCUMENT
================================================================================

Generated by AI Legal Document Generator
This document should be reviewed by a qualified attorney before execution.
`;

    const blob = new Blob([formattedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDocument}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper functions
  const addRecipient = () => {
    setRecipients([...recipients, { 
      email: '', 
      name: '', 
      role: ''
    }]);
  };

  const updateRecipient = (index, field, value) => {
    const updated = recipients.map((recipient, i) => 
      i === index ? { ...recipient, [field]: value } : recipient
    );
    setRecipients(updated);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleInputChange = (field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
    setAutoSaveStatus('unsaved');
    
    // Real-time validation
    const fieldDef = getRequiredFields().find(f => f.id === field);
    if (fieldDef) {
      const error = validateField(fieldDef, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const getRequiredFields = () => {
    if (!selectedDocument) return [];
    const doc = documentTypes.find(d => d.id === selectedDocument);
    return doc ? doc.fields.flatMap(fieldGroup => fieldDefinitions[fieldGroup] || []) : [];
  };

  const isInfoComplete = () => {
    const requiredFields = getRequiredFields().filter(field => field.required);
    const isComplete = requiredFields.every(field => {
      const value = basicInfo[field.id];
      return value && value.toString().trim() !== '' && !validationErrors[field.id];
    });
    return isComplete;
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount || 0);

  const getIconGradient = (docId) => {
    const gradients = {
      'promissory_note': styles.iconBoxBlue,
      'operating_agreement': styles.iconBoxPurple,
      'equity_buyout': styles.iconBoxGreen,
      'partnership_agreement': styles.iconBoxCyan,
      'purchase_contract': styles.iconBoxOrange,
      'loi': styles.iconBoxRed
    };
    return gradients[docId] || styles.iconBoxBlue;
  };

  const getComplexityBadgeStyle = (complexity) => {
    switch (complexity) {
      case 'Simple': return styles.badgeSimple;
      case 'Moderate': return styles.badgeModerate;
      case 'Complex': return styles.badgeComplex;
      default: return styles.badgeCategory;
    }
  };

  // Add CSS animation
  const addSpinAnimation = () => {
    if (!document.querySelector('#spin-animation')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'spin-animation';
      styleSheet.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  };

  React.useEffect(() => {
    addSpinAnimation();
  }, []);

  // Progress Header Component
  const renderProgressHeader = () => (
    <div style={styles.progressContainer}>
      <div style={styles.autoSaveIndicator}>
        <Clock size={14} />
        <span style={{ color: autoSaveStatus === 'saved' ? '#10b981' : autoSaveStatus === 'saving' ? '#f59e0b' : '#ef4444' }}>
          {autoSaveStatus === 'saved' ? 'Auto-saved' : autoSaveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
        </span>
      </div>
      <div style={styles.progressTitle}>
        <span>{documentTypes.find(d => d.id === selectedDocument)?.title} - Version {documentVersion}</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowCalculator(true)}
            style={{...styles.button, ...styles.buttonSecondary}}
          >
            <Calculator size={16} />
            Calculator
          </button>
          <button
            onClick={analyzeDocument}
            style={{...styles.button, ...styles.buttonSecondary}}
          >
            <Shield size={16} />
            Analyze
          </button>
          <button
            onClick={() => setCurrentPage && setCurrentPage('home')}
            style={{...styles.button, ...styles.buttonSecondary}}
          >
            ← Home
          </button>
        </div>
      </div>
      <div style={styles.progressSteps}>
        {stageProgress.map((stage, index) => (
          <div key={stage.id} style={styles.progressStep}>
            <div style={{
              ...styles.stepCircle,
              ...(stage.completed ? styles.stepCircleCompleted :
                  currentStage === stage.id ? styles.stepCircleActive :
                  styles.stepCircleInactive)
            }}>
              {stage.completed ? <Check size={16} /> : index + 1}
            </div>
            <span style={{
              ...styles.stepText,
              ...(stage.completed || currentStage === stage.id ? 
                  styles.stepTextActive : styles.stepTextInactive)
            }}>
              {stage.title}
            </span>
            {index < stageProgress.length - 1 && (
              <ChevronRight size={16} style={{ color: '#94a3b8', marginLeft: '8px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Calculator Modal Component
  const renderCalculatorModal = () => {
    if (!showCalculator) return null;

    const calculatePayment = () => {
      const principal = parseFloat(calculatorLoanAmount || basicInfo.principal_amount);
      const rate = parseFloat(calculatorInterestRate || basicInfo.interest_rate) / 100 / 12;
      const term = parseInt(calculatorLoanTerm || basicInfo.loan_term_months);
      
      if (principal && rate && term) {
        const payment = principal * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
        setCalculatorMonthlyPayment(payment.toFixed(2));
        
        // Auto-populate the form
        handleInputChange('payment_amount', payment.toFixed(2));
      }
    };

    return (
      <div style={styles.calculatorModal}>
        <div style={styles.calculatorContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={styles.formTitle}>Loan Payment Calculator</h3>
            <button onClick={() => setShowCalculator(false)} style={styles.deleteButton}>
              <XCircle size={20} />
            </button>
          </div>
          
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Loan Amount ($)</label>
              <input
                type="number"
                style={styles.input}
                value={calculatorLoanAmount || basicInfo.principal_amount || ''}
                onChange={(e) => setCalculatorLoanAmount(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Annual Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                style={styles.input}
                value={calculatorInterestRate || basicInfo.interest_rate || ''}
                onChange={(e) => setCalculatorInterestRate(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Loan Term (months)</label>
              <input
                type="number"
                style={styles.input}
                value={calculatorLoanTerm || basicInfo.loan_term_months || ''}
                onChange={(e) => setCalculatorLoanTerm(e.target.value)}
              />
            </div>
          </div>
          
          <button
            onClick={calculatePayment}
            style={{...styles.button, ...styles.buttonPrimary, width: '100%', marginBottom: '16px'}}
          >
            <Calculator size={16} />
            Calculate Monthly Payment
          </button>
          
          {calculatorMonthlyPayment && (
            <div style={{...styles.analysisPanel, background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)'}}>
              <h4 style={{ color: '#06b6d4', marginBottom: '8px' }}>Monthly Payment: ${calculatorMonthlyPayment}</h4>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Total payments: ${(parseFloat(calculatorMonthlyPayment) * parseInt(calculatorLoanTerm || basicInfo.loan_term_months)).toFixed(2)}<br/>
                Total interest: ${(parseFloat(calculatorMonthlyPayment) * parseInt(calculatorLoanTerm || basicInfo.loan_term_months) - parseFloat(calculatorLoanAmount || basicInfo.principal_amount)).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Document Analysis Panel
  const renderAnalysisPanel = () => {
    if (!showAnalysis || !documentAnalysis) return null;

    return (
      <div style={styles.analysisPanel}>
        <div style={styles.analysisTitle}>
          <Shield size={20} />
          Document Analysis Report
          <button onClick={() => setShowAnalysis(false)} style={styles.deleteButton}>
            <XCircle size={16} />
          </button>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: 'white', marginBottom: '8px' }}>Completeness: {documentAnalysis.completeness.percentage}%</h4>
          {documentAnalysis.completeness.missingFields.length > 0 && (
            <p style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
              Missing fields: {documentAnalysis.completeness.missingFields.join(', ')}
            </p>
          )}
        </div>

        {documentAnalysis.risks.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'white', marginBottom: '8px' }}>Risk Assessment:</h4>
            {documentAnalysis.risks.map((risk, index) => (
              <div key={index} style={styles.analysisItem}>
                {risk.level === 'high' ? <AlertTriangle size={16} style={styles.statusError} /> : 
                 <AlertCircle size={16} style={styles.statusWarning} />}
                <span style={{ color: risk.level === 'high' ? '#ef4444' : '#f59e0b' }}>
                  {risk.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {documentAnalysis.suggestions.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'white', marginBottom: '8px' }}>Suggestions:</h4>
            {documentAnalysis.suggestions.map((suggestion, index) => (
              <div key={index} style={styles.analysisItem}>
                <CheckCircle size={16} style={styles.statusSuccess} />
                <span style={{ color: '#94a3b8' }}>{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {documentAnalysis.compliance.length > 0 && (
          <div>
            <h4 style={{ color: 'white', marginBottom: '8px' }}>Compliance Notes:</h4>
            {documentAnalysis.compliance.map((item, index) => (
              <div key={index} style={styles.analysisItem}>
                <AlertCircle size={16} style={styles.statusWarning} />
                <span style={{ color: '#f59e0b' }}>{item.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Stage 1: Document Selection
  if (currentStage === 'select') {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.mainContent}>
          <div style={styles.heroSection}>
            <div style={styles.backButton}>
              <button
                onClick={() => setCurrentPage && setCurrentPage('home')}
                style={{...styles.button, ...styles.buttonSecondary, marginBottom: '32px'}}
              >
                ← Back to Home
              </button>
            </div>
            <h1 style={styles.heroTitle}>AI-Powered Legal Document Generator</h1>
            <p style={styles.heroSubtitle}>
              Generate sophisticated, lawyer-quality real estate investment documents with advanced AI assistance. 
              Complete document analysis, state-specific compliance, and digital signature capabilities included.
            </p>
          </div>

          <div style={styles.cardGrid}>
            {documentTypes.map((doc, index) => (
              <div
                key={doc.id}
                style={{
                  ...styles.card,
                  ...(hoveredCard === index ? styles.cardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => {
                  setSelectedDocument(doc.id);
                  setCurrentStage('info');
                }}
              >
                <div style={{...styles.iconBox, ...getIconGradient(doc.id)}}>
                  <doc.icon size={32} color="white" />
                </div>
                <h3 style={styles.cardTitle}>{doc.title}</h3>
                <p style={styles.cardText}>{doc.description}</p>
                <div style={styles.cardBadges}>
                  <span style={{...styles.badge, ...styles.badgeCategory}}>
                    {doc.category}
                  </span>
                  <span style={{...styles.badge, ...getComplexityBadgeStyle(doc.complexity)}}>
                    {doc.complexity}
                  </span>
                </div>
                <div style={styles.cardAction}>
                  Start Document <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Basic Information Collection
  if (currentStage === 'info') {
    const doc = documentTypes.find(d => d.id === selectedDocument);
    const fieldGroups = doc?.fields || [];

    return (
      <div style={styles.pageContainer}>
        <div style={styles.mainContent}>
          {renderProgressHeader()}
          {showAnalysis && renderAnalysisPanel()}
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Basic Information</h2>
            <p style={styles.formSubtitle}>
              Provide the essential details for your {doc?.title.toLowerCase()}. All required fields must be completed with valid information.
            </p>

            {fieldGroups.map(fieldGroupName => {
              const fields = fieldDefinitions[fieldGroupName] || [];
              return (
                <div key={fieldGroupName} style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>
                    {fieldGroupName.replace(/_/g, ' ')}
                  </h3>
                  <div style={styles.formGrid}>
                    {fields.map(field => (
                      <div 
                        key={field.id} 
                        style={field.type === 'textarea' ? styles.formGridFull : {}}
                      >
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>
                            {field.label}
                            {field.required && <span style={styles.labelRequired}>*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              style={{
                                ...styles.textarea,
                                ...(validationErrors[field.id] ? styles.inputError : {})
                              }}
                              value={basicInfo[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              style={{
                                ...styles.select,
                                ...(validationErrors[field.id] ? styles.inputError : {})
                              }}
                              value={basicInfo[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            >
                              <option value="">Select...</option>
                              {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              style={{
                                ...styles.input,
                                ...(validationErrors[field.id] ? styles.inputError : {})
                              }}
                              value={basicInfo[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              min={field.min}
                              max={field.max}
                              step={field.step}
                            />
                          )}
                          {validationErrors[field.id] && (
                            <div style={styles.validationError}>
                              {validationErrors[field.id]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div style={styles.buttonContainer}>
              <button
                onClick={() => setCurrentStage('select')}
                style={{...styles.button, ...styles.buttonSecondary}}
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStage('clause')}
                disabled={!isInfoComplete()}
                style={{
                  ...styles.button,
                  ...(isInfoComplete() ? styles.buttonPrimary : styles.buttonDisabled)
                }}
              >
                Continue to Custom Clauses <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        {renderCalculatorModal()}
      </div>
    );
  }

  // Stage 3: Custom Clauses
  if (currentStage === 'clause') {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.mainContent}>
          {renderProgressHeader()}
          {showAnalysis && renderAnalysisPanel()}
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Custom Clauses & Special Provisions</h2>
            <p style={styles.formSubtitle}>
              Add any special terms, custom clauses, or unique provisions. Our advanced AI will format them in proper legal language and suggest enhancements.
            </p>

            {customClauses.map((clause, index) => (
              <div key={clause.id} style={styles.clauseCard}>
                <div style={styles.clauseHeader}>
                  <h3 style={styles.clauseTitle}>Custom Clause {index + 1}</h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Last modified: {new Date(clause.lastModified).toLocaleString()}
                  </div>
                  <div
                    onClick={() => removeCustomClause(clause.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Clause Title</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={clause.title}
                    onChange={(e) => updateCustomClause(clause.id, 'title', e.target.value)}
                    placeholder="e.g., Prepayment Rights, Insurance Requirements, Environmental Compliance"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Clause (in plain English)</label>
                  <textarea
                    style={styles.textarea}
                    value={clause.content}
                    onChange={(e) => updateCustomClause(clause.id, 'content', e.target.value)}
                    placeholder="Describe what you want this clause to cover... e.g., 'I want to be able to pay back the loan early without any penalties'"
                    rows={3}
                  />
                  {clause.content && (
                    <button
                      onClick={() => generateAISuggestion(clause.id, clause.content)}
                      disabled={isProcessing}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        marginTop: '8px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <RefreshCw size={14} style={isProcessing ? { animation: 'spin 1s linear infinite' } : {}} />
                      Generate Professional Legal Format
                    </button>
                  )}
                </div>
                
                {clause.aiSuggestion && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>AI-Generated Legal Format</label>
                    <div style={styles.aiSuggestionBox}>
                      <textarea
                        style={{...styles.textarea, background: 'transparent', border: 'none'}}
                        value={clause.aiSuggestion}
                        onChange={(e) => updateCustomClause(clause.id, 'aiSuggestion', e.target.value)}
                        rows={6}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      ✨ AI has converted your request into professional legal language. You can edit this above to meet your specific needs.
                    </p>
                  </div>
                )}
              </div>
            ))}

            <div
              onClick={addCustomClause}
              style={{
                ...styles.card,
                border: '2px dashed #334155',
                background: 'transparent',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '32px'
              }}
            >
              <Plus size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <span style={{ color: '#94a3b8' }}>Add Custom Clause</span>
            </div>

            <div style={styles.buttonContainer}>
              <button
                onClick={() => setCurrentStage('info')}
                style={{...styles.button, ...styles.buttonSecondary}}
              >
                Back
              </button>
              <button
                onClick={generateFirstDraft}
                disabled={isProcessing}
                style={{
                  ...styles.button,
                  ...(isProcessing ? styles.buttonDisabled : styles.buttonPrimary)
                }}
              >
                {isProcessing ? (
                  <>
                    <div style={styles.spinner}></div>
                    Generating Professional Draft...
                  </>
                ) : (
                  <>
                    Generate First Draft <FileText size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        {renderCalculatorModal()}
      </div>
    );
  }

  // Stage 4: Draft Review
  if (currentStage === 'draft') {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.mainContent}>
          {renderProgressHeader()}
          {showAnalysis && renderAnalysisPanel()}
          <div style={styles.previewContainer}>
            {/* Document Preview */}
            <div style={styles.previewDocument}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={styles.previewTitle}>Document Preview - Version {documentVersion - 1}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={generatePDF}
                    style={{...styles.button, ...styles.buttonSecondary, fontSize: '0.75rem'}}
                  >
                    <Download size={14} />
                    PDF
                  </button>
                  <button
                    onClick={analyzeDocument}
                    style={{...styles.button, ...styles.buttonSecondary, fontSize: '0.75rem'}}
                  >
                    <Shield size={14} />
                    Analyze
                  </button>
                </div>
              </div>
              <div style={styles.documentPreview}>
                {generatedDraft}
              </div>
            </div>

            {/* Feedback Panel */}
            <div style={styles.feedbackPanel}>
              <h3 style={styles.previewTitle}>Review & AI Revision</h3>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  What changes do you need? (Be specific)
                </label>
                <textarea
                  style={styles.textarea}
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  rows={4}
                  placeholder="e.g., 'Change the payment amount to $2,500', 'Add a clause about property insurance', 'Fix the closing date to March 15th', 'Make the interest rate 7.5%'"
                />
              </div>
              
              <button
                onClick={reviseDraft}
                disabled={!userFeedback.trim() || isProcessing}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  width: '100%',
                  marginBottom: '16px',
                  ...((!userFeedback.trim() || isProcessing) ? styles.buttonDisabled : {})
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    AI is revising document...
                  </>
                ) : (
                  <>
                    <Edit3 size={16} />
                    Revise with AI
                  </>
                )}
              </button>

              {/* Document History */}
              {documentHistory.length > 0 && (
                <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ ...styles.label, marginBottom: '12px' }}>Version History:</h4>
                  {documentHistory.slice(-3).map((version, index) => (
                    <div key={index} style={{ 
                      background: '#0f172a', 
                      border: '1px solid #334155', 
                      borderRadius: '6px', 
                      padding: '8px 12px', 
                      marginBottom: '8px',
                      fontSize: '0.75rem'
                    }}>
                      <div style={{ color: 'white', fontWeight: '500' }}>
                        Version {version.version} - {new Date(version.timestamp).toLocaleString()}
                      </div>
                      <div style={{ color: '#94a3b8', marginTop: '4px' }}>
                        {version.changes}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
                <h4 style={{ ...styles.label, marginBottom: '8px' }}>Quick AI Revisions:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Review all dollar amounts for accuracy and update if needed',
                    'Verify all dates are correct and realistic for this transaction',
                    'Ensure all names and addresses are spelled correctly and complete',
                    'Add standard force majeure clause for unforeseen circumstances',
                    'Include governing law and dispute resolution provisions'
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setUserFeedback(suggestion)}
                      style={{
                        ...styles.button,
                        ...styles.buttonSecondary,
                        justifyContent: 'flex-start',
                        fontSize: '0.75rem',
                        padding: '8px 12px'
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{...styles.formContainer, marginTop: '32px'}}>
            <div style={styles.buttonContainer}>
              <button
                onClick={() => setCurrentStage('clause')}
                style={{...styles.button, ...styles.buttonSecondary}}
              >
                Back to Clauses
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCurrentStage('info')}
                  style={{...styles.button, ...styles.buttonSecondary}}
                >
                  Edit Info
                </button>
                <button
                  onClick={finalizeDraft}
                  style={{...styles.button, ...styles.buttonSuccess}}
                >
                  <Check size={16} />
                  Approve & Finalize
                </button>
              </div>
            </div>
          </div>
        </div>
        {renderCalculatorModal()}
      </div>
    );
  }

  // Stage 5: Final Agreement & Document Actions
  if (currentStage === 'final') {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.mainContent}>
          {renderProgressHeader()}
          
          {/* Legal Disclaimer */}
          <div style={styles.disclaimerBox}>
            <h3 style={styles.disclaimerTitle}>
              <AlertCircle size={20} />
              Important Legal Disclaimer & Terms of Use
            </h3>
            <div style={styles.disclaimerText}>
              <p style={{ marginBottom: '8px' }}>
                This document has been generated using artificial intelligence and template forms. While designed to be legally comprehensive and professionally formatted, this service does not constitute legal advice.
              </p>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>
                By proceeding, you acknowledge and agree that:
              </p>
              <ul style={styles.disclaimerList}>
                <li>You should have this document reviewed by a qualified attorney before execution</li>
                <li>We are not responsible for any legal consequences arising from use of this document</li>
                <li>State and local laws may require specific provisions not included in this template</li>
                <li>This service does not create an attorney-client relationship</li>
                <li>You are responsible for ensuring compliance with all applicable laws and regulations</li>
                <li>The AI-generated content should be verified for accuracy and completeness</li>
              </ul>
            </div>
            
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="terms-agreement" style={styles.checkboxLabel}>
                I understand and agree to these terms and conditions, and acknowledge this is not legal advice
              </label>
            </div>
          </div>

          {/* Document Actions */}
          <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>Document Actions & Distribution</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <button
                onClick={generatePDF}
                disabled={!agreedToTerms}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(agreedToTerms ? {} : styles.buttonDisabled),
                  justifyContent: 'center'
                }}
              >
                <FileText size={16} />
                Print/PDF
              </button>
              
              <button
                onClick={downloadAsText}
                disabled={!agreedToTerms}
                style={{
                  ...styles.button,
                  ...styles.buttonSecondary,
                  ...(agreedToTerms ? {} : styles.buttonDisabled),
                  justifyContent: 'center'
                }}
              >
                <Download size={16} />
                Download Text
              </button>

              <button
                onClick={() => setCurrentStage('draft')}
                style={{...styles.button, ...styles.buttonSecondary, justifyContent: 'center'}}
              >
                <Eye size={16} />
                Preview Document
              </button>
            </div>

            <div style={{ 
              background: 'rgba(6, 182, 212, 0.05)', 
              border: '1px solid rgba(6, 182, 212, 0.2)', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '24px' 
            }}>
              <h4 style={{ color: '#06b6d4', marginBottom: '8px', fontSize: '0.875rem' }}>📄 Download Options:</h4>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                <div style={{ marginBottom: '4px' }}>• <strong>Print/PDF:</strong> Opens print-friendly version (use browser's "Print to PDF")</div>
                <div style={{ marginBottom: '4px' }}>• <strong>Download Text:</strong> Downloads formatted text file (.txt)</div>
                <div>• <strong>Preview:</strong> Review document before finalizing</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <button
                onClick={analyzeDocument}
                style={{...styles.button, ...styles.buttonSecondary}}
              >
                <Shield size={16} />
                Run Final Document Analysis
              </button>
            </div>

            {/* DocSigner Section */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ ...styles.label, fontSize: '1rem', margin: 0 }}>Digital Signature & Distribution</h4>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  <Signature size={14} style={{ marginRight: '4px' }} />
                  Secure Electronic Signature System
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(139, 92, 246, 0.05)', 
                border: '1px solid rgba(139, 92, 246, 0.2)', 
                borderRadius: '12px', 
                padding: '24px', 
                marginBottom: '24px' 
              }}>
                <h4 style={{ color: '#8b5cf6', marginBottom: '12px', fontSize: '1rem' }}>
                  🚀 Send to DocSigner - Professional Document Signing
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.5' }}>
                  Send your document to our secure DocSigner platform where you and your recipients can electronically sign with full legal compliance. 
                  Features include real-time notifications, audit trails, and automatic distribution of signed documents.
                </p>
                
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '16px' }}>
                  <div style={{ marginBottom: '4px' }}>✓ Legal electronic signatures with timestamp verification</div>
                  <div style={{ marginBottom: '4px' }}>✓ Automatic email notifications to all parties</div>
                  <div style={{ marginBottom: '4px' }}>✓ Secure recipient links (no account required for signers)</div>
                  <div style={{ marginBottom: '4px' }}>✓ Complete audit trail and document security</div>
                  <div>✓ Final signed documents emailed to all parties</div>
                </div>
              </div>
              
              {/* Recipients Setup */}
              <div style={{ marginBottom: '24px' }}>
                <h5 style={{ ...styles.label, marginBottom: '12px' }}>Document Recipients:</h5>
                
                {recipients.map((recipient, index) => (
                  <div key={index} style={styles.recipientGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Full Name</label>
                      <input
                        type="text"
                        style={styles.input}
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email Address</label>
                      <input
                        type="email"
                        style={styles.input}
                        value={recipient.email}
                        onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Role</label>
                      <select
                        style={styles.select}
                        value={recipient.role}
                        onChange={(e) => updateRecipient(index, 'role', e.target.value)}
                      >
                        <option value="">Select role</option>
                        <option value="Borrower">Borrower</option>
                        <option value="Lender">Lender</option>
                        <option value="Buyer">Buyer</option>
                        <option value="Seller">Seller</option>
                        <option value="Member">Member</option>
                        <option value="Manager">Manager</option>
                        <option value="Witness">Witness</option>
                        <option value="Notary">Notary</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '16px' }}>
                      {recipients.length > 1 && (
                        <div
                          onClick={() => removeRecipient(index)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addRecipient}
                  style={{
                    ...styles.button,
                    ...styles.buttonSecondary,
                    fontSize: '0.75rem',
                    marginBottom: '16px'
                  }}
                >
                  <Plus size={14} />
                  Add Another Recipient
                </button>
              </div>

              {/* Send to DocSigner Button */}
              <button
                onClick={sendToDocSigner}
                disabled={!agreedToTerms || recipients.some(r => !r.name || !r.email || !r.role)}
                style={{
                  ...styles.docSignerButton,
                  ...((!agreedToTerms || recipients.some(r => !r.name || !r.email || !r.role)) ? styles.buttonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (agreedToTerms && !recipients.some(r => !r.name || !r.email || !r.role)) {
                    e.target.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (agreedToTerms && !recipients.some(r => !r.name || !r.email || !r.role)) {
                    e.target.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                  }
                }}
              >
                <PenTool size={20} />
                Send to DocSigner
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem' 
                }}>
                  Professional
                </div>
              </button>

              <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                border: '1px solid rgba(245, 158, 11, 0.3)', 
                borderRadius: '8px', 
                padding: '12px', 
                marginTop: '16px' 
              }}>
                <p style={{ fontSize: '0.75rem', color: '#fbbf24', margin: 0, textAlign: 'center' }}>
                  📧 <strong>How it works:</strong> You'll be taken to DocSigner where you can sign first, then recipients will receive secure email links to sign their portions. 
                  Once everyone signs, the completed document with all signatures will be automatically emailed to all parties with legal document IDs.
                </p>
              </div>
            </div>
          </div>

          {/* Start Over */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button
              onClick={() => {
                setCurrentStage('select');
                setSelectedDocument('');
                setBasicInfo({});
                setCustomClauses([]);
                setGeneratedDraft('');
                setFinalDocument('');
                setAgreedToTerms(false);
                setRecipients([{ email: '', name: '', role: '' }]);
                setDocumentHistory([]);
                setDocumentVersion(1);
                setValidationErrors({});
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#06b6d4',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Generate Another Document
            </button>
          </div>
        </div>
        {renderCalculatorModal()}
      </div>
    );
  }

  // Loading State
  if (isProcessing && (currentStage === 'clause' || currentStage === 'draft')) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.mainContent}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <h2 style={styles.loadingTitle}>
              {currentStage === 'clause' ? 'Generating Your Professional Document' : 'AI is Processing Your Request'}
            </h2>
            <p style={styles.loadingText}>
              {currentStage === 'clause' ? 
                'AI is analyzing your inputs, applying legal formatting, and creating your comprehensive document...' :
                'Analyzing feedback and making intelligent revisions to your document...'
              }
            </p>
            {currentStage === 'clause' && (
              <div style={{ marginTop: '24px', fontSize: '0.875rem', color: '#94a3b8' }}>
                <div>✓ Validating all input data</div>
                <div>✓ Applying state-specific legal requirements</div>
                <div>✓ Formatting custom clauses</div>
                <div>✓ Generating professional document structure</div>
                <div>⏳ Finalizing document...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DocumentGenerator;