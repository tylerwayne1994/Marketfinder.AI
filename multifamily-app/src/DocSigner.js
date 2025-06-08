import React, { useState, useEffect, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import { 
  PenTool, 
  Send, 
  Check, 
  User, 
  Download, 
  Eye, 
  Clock, 
  Shield, 
  ChevronRight,
  CheckCircle,
  X,
  ArrowLeft,
  FileText
} from 'lucide-react';

// EmailJS Configuration - ALL KEYS CONFIGURED! ✅
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_jq3oli8', // ✅ Your email service
  TEMPLATE_ID: 'template_ysj7vyk', // ✅ Your custom template  
  PUBLIC_KEY: 'G-M9QYnjAY3_KHp8f' // ✅ Your public key
};

// Document Storage Helper (in production, use a real database)
const DocumentStorage = {
  save: (docId, data) => {
    localStorage.setItem(`doc_${docId}`, JSON.stringify(data));
  },
  load: (docId) => {
    const data = localStorage.getItem(`doc_${docId}`);
    return data ? JSON.parse(data) : null;
  },
  getAll: () => {
    const docs = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('doc_')) {
        const docId = key.replace('doc_', '');
        docs[docId] = JSON.parse(localStorage.getItem(key));
      }
    }
    return docs;
  }
};

// Main DocSigner Component - Fixed Hooks Order
const DocSigner = ({ documentData, setCurrentPage, mode, docId, recipientEmail }) => {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL HOOKS!
  const [currentStep, setCurrentStep] = useState('review');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [documentContent, setDocumentContent] = useState(documentData?.content || '');
  const [signaturePositions, setSignaturePositions] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [generatedSignature, setGeneratedSignature] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [allRecipients] = useState(documentData?.recipients || []);
  const [documentId] = useState(documentData?.documentId || `DOC-${Date.now()}`);
  
  // Recipient-specific state
  const [documentData2, setDocumentData2] = useState(null);
  const [loading, setLoading] = useState(mode === 'recipient');
  const [signing, setSigning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px 0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b'
    },
    headerStatus: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      fontSize: '0.875rem',
      color: '#64748b'
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px'
    },
    progressBar: {
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    progressSteps: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative'
    },
    progressLine: {
      position: 'absolute',
      top: '20px',
      left: '40px',
      right: '40px',
      height: '2px',
      background: '#e2e8f0',
      zIndex: 1
    },
    progressLineFilled: {
      background: '#10b981',
      height: '2px',
      transition: 'width 0.3s ease'
    },
    progressStep: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      zIndex: 2,
      background: '#f8fafc',
      padding: '8px',
      borderRadius: '8px'
    },
    stepCircle: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.875rem'
    },
    stepCircleActive: {
      background: '#3b82f6',
      color: 'white'
    },
    stepCircleCompleted: {
      background: '#10b981',
      color: 'white'
    },
    stepCircleInactive: {
      background: '#e2e8f0',
      color: '#64748b'
    },
    stepLabel: {
      fontSize: '0.75rem',
      fontWeight: '500',
      textAlign: 'center'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    cardSubtitle: {
      color: '#64748b',
      marginBottom: '24px',
      lineHeight: '1.6'
    },
    documentViewer: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      maxHeight: '600px',
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      lineHeight: '1.6',
      position: 'relative',
      color: '#000000'
    },
    signatureField: {
      background: '#fef3c7',
      border: '2px dashed #f59e0b',
      borderRadius: '6px',
      padding: '8px 16px',
      margin: '4px 0',
      cursor: 'pointer',
      display: 'inline-block',
      position: 'relative',
      minWidth: '200px',
      textAlign: 'center'
    },
    signatureFieldActive: {
      background: '#dbeafe',
      border: '2px solid #3b82f6',
      animation: 'pulse 2s infinite',
      transform: 'scale(1.02)',
      boxShadow: '0 4px 8px rgba(59, 130, 246, 0.2)'
    },
    signatureFieldSigned: {
      background: '#d1fae5',
      border: '2px solid #10b981',
      cursor: 'default'
    },
    appliedSignature: {
      fontFamily: 'Brush Script MT, cursive',
      fontSize: '1.5rem',
      color: '#1e293b',
      fontWeight: 'normal',
      transform: 'rotate(-2deg) skew(-5deg)',
      fontStyle: 'italic',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
      letterSpacing: '1px'
    },
    docId: {
      fontSize: '0.625rem',
      color: '#64748b',
      marginTop: '2px'
    },
    form: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '24px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      transition: 'border-color 0.2s ease',
      outline: 'none'
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
      gap: '8px',
      justifyContent: 'center'
    },
    buttonPrimary: {
      background: '#3b82f6',
      color: 'white'
    },
    buttonSecondary: {
      background: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0'
    },
    buttonSuccess: {
      background: '#10b981',
      color: 'white'
    },
    buttonDisabled: {
      background: '#f1f5f9',
      color: '#94a3b8',
      cursor: 'not-allowed'
    },
    signaturePreview: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      marginBottom: '16px'
    },
    signatureText: {
      fontFamily: 'Brush Script MT, cursive',
      fontSize: '1.8rem',
      color: '#1e293b',
      marginBottom: '8px',
      transform: 'rotate(-1deg) skew(-2deg)',
      fontStyle: 'italic',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
      letterSpacing: '1px'
    },
    recipientCard: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    recipientInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    recipientStatus: {
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    statusPending: {
      background: '#fef3c7',
      color: '#92400e'
    },
    emailStatus: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    emailStatusSuccess: {
      background: '#d1fae5',
      color: '#065f46',
      border: '1px solid #10b981'
    },
    emailStatusPending: {
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #f59e0b'
    },
    emailStatusError: {
      background: '#fecaca',
      color: '#991b1b',
      border: '1px solid #ef4444'
    },
    completionCard: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      textAlign: 'center',
      padding: '48px 32px'
    },
    completionTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    completionText: {
      fontSize: '1.125rem',
      opacity: 0.9,
      marginBottom: '32px'
    },
    errorMessage: {
      background: '#fecaca',
      color: '#991b1b',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #ef4444',
      marginBottom: '16px'
    },
    successMessage: {
      background: '#d1fae5',
      color: '#065f46',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #10b981',
      marginBottom: '16px',
      textAlign: 'center'
    }
  };

  // Initialize data based on mode (AFTER all hooks are declared)
  useEffect(() => {
    if (mode === 'recipient') {
      // Load document for recipient
      const loadDocument = () => {
        try {
          const data = DocumentStorage.load(docId);
          if (!data) {
            setError('Document not found or has expired.');
            setLoading(false);
            return;
          }

          const recipient = data.recipients?.find(r => r.email === atob(recipientEmail));
          if (!recipient) {
            setError('You are not authorized to sign this document.');
            setLoading(false);
            return;
          }

          const existingSignature = data.signatures?.find(s => s.email === recipient.email);
          if (existingSignature) {
            setCompleted(true);
            setSignerName(existingSignature.name);
          }

          setDocumentData2(data);
          setDocumentContent(data.content || '');
          setLoading(false);
        } catch (err) {
          setError('Error loading document.');
          setLoading(false);
        }
      };

      loadDocument();
    } else {
      // Creator mode initialization
      if (documentData?.creator) {
        setSignerName(documentData.creator.name);
        setSignerEmail(documentData.creator.email);
      }
      
      if (!documentContent || documentContent.trim() === '') {
        const sampleContent = `SAMPLE LEGAL DOCUMENT

This is a sample document for signature testing.

BORROWER SIGNATURE:
_________________________________
[Borrower Name]
Date: ${new Date().toLocaleDateString()}

LENDER SIGNATURE:  
_________________________________
[Lender Name]
Date: ${new Date().toLocaleDateString()}

WITNESS SIGNATURE:
_________________________________
[Witness Name]
Date: ${new Date().toLocaleDateString()}

This document has been executed on ${new Date().toLocaleDateString()}.`;
        
        setDocumentContent(sampleContent);
      }
    }
  }, [mode, docId, recipientEmail, documentData, documentContent]);

  // Generate signature when name changes
  useEffect(() => {
    if (signerName) {
      setGeneratedSignature(signerName);
    }
  }, [signerName]);

  // Parse document for signature fields
  const parseSignatureFields = useCallback(() => {
    if (!documentContent) return;
    
    const positions = [];
    const lines = documentContent.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (line.includes('_________________________________') || 
          line.includes('[Borrower Name]') || 
          line.includes('[Lender Name]') ||
          line.includes('[Buyer Name]') ||
          line.includes('[Seller Name]') ||
          line.includes('[Member') ||
          line.includes('[Manager Name]') ||
          line.includes('[General Partner]') ||
          line.includes('[Limited Partner]') ||
          line.includes('[Witness Name]')) {
        
        let requiredSigner = '';
        if (line.includes('BORROWER:') || line.includes('[Borrower Name]')) {
          requiredSigner = 'Borrower';
        } else if (line.includes('LENDER:') || line.includes('[Lender Name]')) {
          requiredSigner = 'Lender';
        } else if (line.includes('BUYER:') || line.includes('[Buyer Name]')) {
          requiredSigner = 'Buyer';
        } else if (line.includes('SELLER:') || line.includes('[Seller Name]')) {
          requiredSigner = 'Seller';
        } else if (line.includes('[Member') || line.includes('Member')) {
          requiredSigner = 'Member';
        } else if (line.includes('[Manager Name]') || line.includes('Manager')) {
          requiredSigner = 'Manager';
        } else if (line.includes('[General Partner]')) {
          requiredSigner = 'General Partner';
        } else if (line.includes('[Limited Partner]')) {
          requiredSigner = 'Limited Partner';
        } else if (line.includes('[Witness Name]') || line.includes('WITNESS')) {
          requiredSigner = 'Witness';
        }

        positions.push({
          id: `sig-${lineIndex}`,
          lineIndex,
          requiredSigner,
          signed: false,
          signedBy: '',
          signedAt: null
        });
      }
    });

    setSignaturePositions(positions);
  }, [documentContent]);

  useEffect(() => {
    parseSignatureFields();
  }, [parseSignatureFields]);

  // Add CSS for pulse animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Recipient signing handler
  const handleRecipientSign = async () => {
    if (!signerName.trim()) {
      alert('Please enter your name first.');
      return;
    }

    setSigning(true);
    
    try {
      const recipientData = documentData2.recipients.find(r => r.email === atob(recipientEmail));
      const timestamp = new Date().toISOString();
      
      const newSignature = {
        id: `sig_${Date.now()}`,
        name: signerName,
        email: recipientData.email,
        role: recipientData.role,
        signature: signerName,
        timestamp: timestamp,
        docId: docId
      };

      const updatedData = {
        ...documentData2,
        signatures: [...(documentData2.signatures || []), newSignature],
        lastUpdated: timestamp
      };

      DocumentStorage.save(docId, updatedData);

      const allSigned = updatedData.recipients.every(recipient => 
        updatedData.signatures.some(sig => sig.email === recipient.email)
      );

      if (allSigned) {
        await sendCompletionEmails(updatedData);
      }

      setCompleted(true);
      setSigning(false);
      
    } catch (error) {
      console.error('Signing failed:', error);
      setError('Failed to sign document. Please try again.');
      setSigning(false);
    }
  };

  const sendCompletionEmails = async (documentData) => {
    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

      const emailPromises = [
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, 'template_completion', {
          to_email: documentData.creator.email,
          to_name: documentData.creator.name,
          document_title: documentData.documentTitle || 'Legal Document',
          document_id: docId,
          completion_message: 'All parties have successfully signed your document!',
          total_signatures: documentData.signatures.length,
          download_url: `${window.location.origin}/document/${docId}/download`
        }),
        
        ...documentData.recipients.map(recipient => 
          emailjs.send(EMAILJS_CONFIG.SERVICE_ID, 'template_completion', {
            to_email: recipient.email,
            to_name: recipient.name,
            document_title: documentData.documentTitle || 'Legal Document',
            document_id: docId,
            completion_message: 'Document signing is complete! All parties have signed.',
            total_signatures: documentData.signatures.length,
            download_url: `${window.location.origin}/document/${docId}/download`
          })
        )
      ];

      await Promise.all(emailPromises);
      console.log('✅ Completion emails sent to all parties!');
    } catch (error) {
      console.error('Failed to send completion emails:', error);
    }
  };

  // Creator signing handlers
  const handleSignatureClick = (positionId) => {
    if (!signerName.trim()) {
      alert('Please enter your name first to generate your signature.');
      return;
    }

    const position = signaturePositions.find(p => p.id === positionId);
    if (!position || position.signed) return;

    const timestamp = new Date().toISOString();
    const newSignature = {
      id: positionId,
      name: signerName,
      signature: generatedSignature,
      timestamp: timestamp,
      docId: documentId,
      role: getCurrentSignerRole()
    };

    setSignatures([...signatures, newSignature]);
    
    setSignaturePositions(signaturePositions.map(pos => 
      pos.id === positionId 
        ? { ...pos, signed: true, signedBy: signerName, signedAt: timestamp }
        : pos
    ));

    updateDocumentWithSignature(positionId, newSignature);
  };

  const getCurrentSignerRole = () => {
    if (documentData?.creator?.name === signerName) {
      if (documentData.documentType === 'promissory_note') return 'Borrower';
      if (documentData.documentType === 'purchase_contract') return 'Buyer';
      if (documentData.documentType === 'operating_agreement') return 'Member';
      return 'Member';
    }
    
    const recipient = allRecipients.find(r => r.name === signerName);
    return recipient?.role || 'Signer';
  };

  const updateDocumentWithSignature = (positionId, signature) => {
    const position = signaturePositions.find(p => p.id === positionId);
    if (!position) return;

    const lines = documentContent.split('\n');
    const lineIndex = position.lineIndex;
    
    if (lines[lineIndex].includes('_________________________________')) {
      lines[lineIndex] = lines[lineIndex].replace(
        '_________________________________',
        `${signature.signature}
Electronically signed: ${new Date(signature.timestamp).toLocaleString()}
Document ID: ${signature.docId}`
      );
    } else {
      lines[lineIndex] = lines[lineIndex].replace(/\[.*?\]/g, signature.signature);
      lines.splice(lineIndex + 1, 0, `Electronically signed: ${new Date(signature.timestamp).toLocaleString()}`);
      lines.splice(lineIndex + 2, 0, `Document ID: ${signature.docId}`);
    }

    setDocumentContent(lines.join('\n'));
  };

  const handleContinueToSign = () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      alert('Please enter your name and email address to continue.');
      return;
    }
    setCurrentStep('sign');
  };

  const handleCompleteSigning = () => {
    const userSignatures = signatures.filter(s => s.name === signerName);

    if (userSignatures.length === 0) {
      alert('Please sign at least one signature field before continuing.');
      return;
    }

    setCurrentStep('send');
  };

  const sendToRecipients = async () => {
    setEmailStatus('sending');
    
    try {
      const documentToSave = {
        documentId,
        documentTitle: documentData?.documentTitle || 'Legal Document',
        content: documentContent,
        creator: {
          name: signerName,
          email: signerEmail
        },
        recipients: allRecipients,
        signatures: signatures,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      DocumentStorage.save(documentId, documentToSave);

      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      
      const emailData = {
        from_name: signerName,
        from_email: signerEmail,
        document_title: documentData?.documentTitle || 'Legal Document',
        document_id: documentId,
        sender_name: signerName,
        sender_email: signerEmail,
        signature_count: signatures.filter(s => s.name === signerName).length,
        timestamp: new Date().toLocaleString(),
        document_content: documentContent.substring(0, 500) + '...', 
        signing_url: `${window.location.origin}/sign/${documentId}`
      };

      const emailPromises = allRecipients.map(async (recipient) => {
        const recipientEmailData = {
          ...emailData,
          to_email: recipient.email,
          to_name: recipient.name,
          recipient_role: recipient.role,
          personal_signing_url: `${window.location.origin}/sign/${documentId}/${btoa(recipient.email)}`
        };

        return emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          recipientEmailData
        );
      });

      await Promise.all(emailPromises);
      
      console.log('✅ All emails sent successfully!');
      setEmailStatus('sent');
      
      setTimeout(() => {
        setCurrentStep('complete');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      if (error.text && error.text.includes('Invalid')) {
        setEmailStatus('config_error');
        alert('EmailJS not configured properly. Please check your SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY in the code.');
      } else {
        setEmailStatus('error');
      }
    }
  };

  const downloadSignedDocument = () => {
    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentData?.documentTitle || 'Document'}_Signed_${documentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProgressWidth = () => {
    const steps = ['review', 'sign', 'send', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    return `${(currentIndex / (steps.length - 1)) * 100}%`;
  };

  // Render functions
  const renderSignatureField = (position) => {
    const signature = signatures.find(s => s.id === position.id);
    
    if (position.signed && signature) {
      return (
        <span 
          key={position.id}
          style={{...styles.signatureField, ...styles.signatureFieldSigned}}
        >
          <div style={styles.appliedSignature}>{signature.signature}</div>
          <div style={styles.docId}>Signed: {new Date(signature.timestamp).toLocaleString()}</div>
          <div style={styles.docId}>Doc ID: {signature.docId}</div>
        </span>
      );
    }

    return (
      <span 
        key={position.id}
        style={{...styles.signatureField, ...styles.signatureFieldActive}}
        onClick={() => handleSignatureClick(position.id)}
      >
        <div>Click to sign - {position.requiredSigner || 'Signature'} required</div>
        <div style={styles.docId}>Pending signature</div>
      </span>
    );
  };

  const renderDocumentWithSignatures = () => {
    const lines = documentContent.split('\n');
    
    return lines.map((line, index) => {
      const position = signaturePositions.find(p => p.lineIndex === index);
      
      if (position && (line.includes('_________________________________') || /\[.*?\]/.test(line))) {
        return (
          <div key={index} style={{ color: '#000000', fontWeight: 'normal' }}>
            {line.replace('_________________________________', '').replace(/\[.*?\]/g, '')}
            {renderSignatureField(position)}
          </div>
        );
      }
      
      return <div key={index} style={{ color: '#000000', fontWeight: 'normal' }}>{line}</div>;
    });
  };

  const renderRecipientDocument = () => {
    if (!documentData2?.content) return null;

    const lines = documentData2.content.split('\n');
    const recipientData = documentData2.recipients.find(r => r.email === atob(recipientEmail));
    
    return lines.map((line, index) => {
      const hasSignatureField = (line.includes('_________________________________') || /\[.*?\]/.test(line)) &&
        (line.toLowerCase().includes(recipientData?.role?.toLowerCase()) || 
         (line.includes('[') && line.includes(']')));

      if (hasSignatureField) {
        const existingSignature = documentData2.signatures?.find(s => s.email === recipientData.email);
        
        if (existingSignature) {
          return (
            <div key={index} style={{ color: '#000000', marginBottom: '8px' }}>
              {line.replace('_________________________________', '').replace(/\[.*?\]/g, '')}
              <div style={{...styles.signatureField, ...styles.signatureFieldSigned}}>
                <div style={styles.appliedSignature}>{existingSignature.signature}</div>
                <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '4px' }}>
                  Signed: {new Date(existingSignature.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={index} style={{ color: '#000000', marginBottom: '8px' }}>
            {line.replace('_________________________________', '').replace(/\[.*?\]/g, '')}
            <div 
              style={{...styles.signatureField, ...styles.signatureFieldActive}}
              onClick={handleRecipientSign}
            >
              <div>Click here to sign as {recipientData?.role}</div>
              <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                Required: {recipientData?.role} signature
              </div>
            </div>
          </div>
        );
      }

      return <div key={index} style={{ color: '#000000' }}>{line}</div>;
    });
  };

  // RECIPIENT MODE RENDER
  if (mode === 'recipient') {
    if (loading) {
      return (
        <div style={styles.container}>
          <div style={{...styles.card, padding: '20px', textAlign: 'center', margin: '50px auto', maxWidth: '600px'}}>
            <Clock size={48} style={{ color: '#3b82f6', marginBottom: '16px' }} />
            <h2>Loading Document...</h2>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.container}>
          <div style={{...styles.card, padding: '20px', margin: '50px auto', maxWidth: '600px'}}>
            <div style={styles.errorMessage}>
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <div style={{...styles.card, margin: '20px auto', maxWidth: '800px'}}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            padding: '24px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>
              <FileText size={32} style={{ marginRight: '12px', display: 'inline' }} />
              Document Signature Request
            </div>
            <div style={{ fontSize: '1.125rem', opacity: 0.9 }}>
              Document ID: {docId}
            </div>
          </div>

          {completed ? (
            <div style={styles.successMessage}>
              <CheckCircle size={24} style={{ marginRight: '8px', display: 'inline' }} />
              <strong>Signature Complete!</strong>
              <div style={{ marginTop: '8px' }}>
                Thank you, {signerName}! Your signature has been recorded. 
                All parties will be notified once everyone has signed.
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Sign Document</h3>
                <p style={{ color: '#64748b', marginBottom: '16px' }}>
                  Please enter your name and click the signature field below to sign this document.
                </p>
                
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>
                  Your Full Legal Name
                </label>
                <input
                  type="text"
                  style={{...styles.input, width: '100%', marginBottom: '16px'}}
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your legal name exactly as it should appear"
                  disabled={signing}
                />
              </div>
            </>
          )}

          <div style={styles.documentViewer}>
            {renderRecipientDocument()}
          </div>

          {!completed && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={handleRecipientSign}
                disabled={!signerName.trim() || signing}
                style={{
                  ...styles.button,
                  ...(signerName.trim() && !signing ? styles.buttonPrimary : styles.buttonDisabled)
                }}
              >
                {signing ? (
                  <>
                    <Clock size={16} />
                    Signing...
                  </>
                ) : (
                  <>
                    <PenTool size={16} />
                    Sign Document
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CREATOR MODE RENDER (original flow)
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <PenTool size={24} />
            DocSigner
          </div>
          <div style={styles.headerStatus}>
            <Shield size={16} />
            <span>Secure Document Signing</span>
            <span>•</span>
            <span>Document ID: {documentId}</span>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.progressBar}>
          <div style={styles.progressSteps}>
            <div style={styles.progressLine}>
              <div style={{...styles.progressLineFilled, width: getProgressWidth()}}></div>
            </div>
            
            {[
              { id: 'review', label: 'Review Document', icon: Eye },
              { id: 'sign', label: 'Sign Document', icon: PenTool },
              { id: 'send', label: 'Send to Recipients', icon: Send },
              { id: 'complete', label: 'Complete', icon: CheckCircle }
            ].map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = ['review', 'sign', 'send', 'complete'].indexOf(currentStep) > index;
              const StepIcon = step.icon;
              
              return (
                <div key={step.id} style={styles.progressStep}>
                  <div style={{
                    ...styles.stepCircle,
                    ...(isCompleted ? styles.stepCircleCompleted :
                        isActive ? styles.stepCircleActive : styles.stepCircleInactive)
                  }}>
                    <StepIcon size={16} />
                  </div>
                  <div style={{
                    ...styles.stepLabel,
                    color: isCompleted || isActive ? '#1e293b' : '#64748b'
                  }}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {currentStep === 'review' && (
          <>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Review Document</h2>
              <p style={styles.cardSubtitle}>
                Please review the document below and enter your information to begin the signing process.
              </p>

              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Full Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Enter your legal name exactly as it should appear"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Your Email Address</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {generatedSignature && (
                <div style={styles.signaturePreview}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' }}>
                    Your generated signature:
                  </div>
                  <div style={styles.signatureText}>{generatedSignature}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCurrentPage && setCurrentPage('home')}
                  style={{...styles.button, ...styles.buttonSecondary}}
                >
                  <ArrowLeft size={16} />
                  Back to Generator
                </button>
                <button
                  onClick={handleContinueToSign}
                  disabled={!signerName.trim() || !signerEmail.trim()}
                  style={{
                    ...styles.button,
                    ...(signerName.trim() && signerEmail.trim() ? styles.buttonPrimary : styles.buttonDisabled)
                  }}
                >
                  Continue to Sign
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Document Preview</h3>
              <div style={styles.documentViewer}>
                {renderDocumentWithSignatures()}
              </div>
            </div>
          </>
        )}

        {currentStep === 'sign' && (
          <>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Sign Document</h2>
              <p style={styles.cardSubtitle}>
                Click on the highlighted signature fields below to apply your electronic signature. 
                You can only sign fields designated for your role ({getCurrentSignerRole()}).
              </p>

              <div style={{ 
                background: '#dbeafe', 
                border: '1px solid #3b82f6', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '24px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <User size={16} style={{ color: '#3b82f6' }} />
                  <strong>Signing as: {signerName} ({getCurrentSignerRole()})</strong>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                  Your signature: <span style={{ 
                    fontFamily: 'Brush Script MT, cursive', 
                    fontSize: '1.3rem',
                    transform: 'rotate(-1deg) skew(-2deg)',
                    fontStyle: 'italic',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    letterSpacing: '1px',
                    display: 'inline-block'
                  }}>{generatedSignature}</span>
                </div>
              </div>

              <div style={styles.documentViewer}>
                {renderDocumentWithSignatures()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <button
                  onClick={() => setCurrentStep('review')}
                  style={{...styles.button, ...styles.buttonSecondary}}
                >
                  <ArrowLeft size={16} />
                  Back to Review
                </button>
                <button
                  onClick={handleCompleteSigning}
                  style={{...styles.button, ...styles.buttonSuccess}}
                >
                  <Check size={16} />
                  Complete My Signatures
                </button>
              </div>
            </div>
          </>
        )}

        {currentStep === 'send' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Send to Recipients</h2>
            <p style={styles.cardSubtitle}>
              Your signatures have been applied. Now send the document to other parties for their signatures.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px' }}>
                Your Signatures Applied:
              </h4>
              {signatures.filter(s => s.name === signerName).map((sig, index) => (
                <div key={index} style={{ 
                  background: '#d1fae5', 
                  border: '1px solid #10b981', 
                  borderRadius: '6px', 
                  padding: '12px', 
                  marginBottom: '8px' 
                }}>
                  <div style={{ 
                    fontFamily: 'Brush Script MT, cursive', 
                    fontSize: '1.5rem',
                    transform: 'rotate(-1deg) skew(-2deg)',
                    fontStyle: 'italic',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    letterSpacing: '1px',
                    display: 'inline-block',
                    color: '#1e293b',
                    marginBottom: '4px'
                  }}>
                    {sig.signature}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                    Signed: {new Date(sig.timestamp).toLocaleString()} | Doc ID: {sig.docId}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px' }}>
                Recipients ({allRecipients.length}):
              </h4>
              {allRecipients.map((recipient, index) => (
                <div key={index} style={styles.recipientCard}>
                  <div style={styles.recipientInfo}>
                    <User size={16} style={{ color: '#64748b' }} />
                    <div>
                      <div style={{ fontWeight: '500' }}>{recipient.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {recipient.email} • {recipient.role}
                      </div>
                    </div>
                  </div>
                  <div style={{...styles.recipientStatus, ...styles.statusPending}}>
                    Pending Signature
                  </div>
                </div>
              ))}
            </div>

            {emailStatus && (
              <div style={{
                ...styles.emailStatus,
                ...(emailStatus === 'sent' ? styles.emailStatusSuccess :
                    emailStatus === 'sending' ? styles.emailStatusPending :
                    styles.emailStatusError)
              }}>
                {emailStatus === 'sent' && <CheckCircle size={16} />}
                {emailStatus === 'sending' && <Clock size={16} />}
                {(emailStatus === 'error' || emailStatus === 'config_error') && <X size={16} />}
                <span>
                  {emailStatus === 'sent' && 'Document successfully sent to all recipients!'}
                  {emailStatus === 'sending' && 'Sending secure signature requests via EmailJS...'}
                  {emailStatus === 'error' && 'Failed to send document. Please try again.'}
                  {emailStatus === 'config_error' && 'EmailJS not configured. Please check your API keys.'}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCurrentStep('sign')}
                style={{...styles.button, ...styles.buttonSecondary}}
              >
                <ArrowLeft size={16} />
                Back to Signing
              </button>
              <button
                onClick={sendToRecipients}
                disabled={emailStatus === 'sending'}
                style={{
                  ...styles.button,
                  ...(emailStatus === 'sending' ? styles.buttonDisabled : styles.buttonPrimary)
                }}
              >
                <Send size={16} />
                {emailStatus === 'sending' ? 'Sending...' : 'Send Signature Requests'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div style={{...styles.card, ...styles.completionCard}}>
            <div style={styles.completionTitle}>🎉 Document Sent Successfully!</div>
            <div style={styles.completionText}>
              Your document has been sent to all recipients. They will receive secure email links to sign their portions.
              Once everyone signs, you'll all receive the completed document via email automatically!
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                onClick={downloadSignedDocument}
                style={{...styles.button, background: 'rgba(255, 255, 255, 0.2)', color: 'white'}}
              >
                <Download size={16} />
                Download Current Version
              </button>
              <button
                onClick={() => setCurrentPage && setCurrentPage('home')}
                style={{...styles.button, background: 'white', color: '#10b981'}}
              >
                <ArrowLeft size={16} />
                Return to Dashboard
              </button>
            </div>

            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              <strong>🔄 Full Workflow:</strong>
              <br />• ✅ Recipients receive personalized signing emails
              <br />• ✅ Each gets a secure, unique signing link  
              <br />• ✅ They sign their portions on dedicated pages
              <br />• ✅ When everyone signs, completion emails sent to ALL parties
              <br />• ✅ Final document with all signatures distributed automatically
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocSigner;