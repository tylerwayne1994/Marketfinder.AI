import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, DollarSign, Calculator } from 'lucide-react';
import { styles } from './styles';

const FinancingPage = ({ setCurrentPage, propertyData, setPropertyData, uploadedFile }) => {
  const [hoveredButton, setHoveredButton] = useState(false);
  const [activeTab, setActiveTab] = useState('traditional');

  const calculateMonthlyPayment = (principal, rate, years) => {
    if (!principal || !rate || !years) return 0;
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const totalPayments = parseFloat(years) * 12;
    if (monthlyRate === 0) return parseFloat(principal) / totalPayments;
    return parseFloat(principal) * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
  };

  const calculateBalloonAmount = (principal, rate, amortization, balloonYears) => {
    if (!principal || !rate || !amortization || !balloonYears) return 0;
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const totalAmortPayments = parseFloat(amortization) * 12;
    const balloonPayments = parseFloat(balloonYears) * 12;
    
    if (monthlyRate === 0) {
      return parseFloat(principal) - (parseFloat(principal) / totalAmortPayments * balloonPayments);
    }
    
    const monthlyPayment = parseFloat(principal) * (monthlyRate * Math.pow(1 + monthlyRate, totalAmortPayments)) / (Math.pow(1 + monthlyRate, totalAmortPayments) - 1);
    let balance = parseFloat(principal);
    
    for (let i = 0; i < balloonPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
    }
    
    return Math.max(0, balance);
  };

  // Memoize setPropertyData to avoid useEffect dependency issues
  const updatePropertyData = useCallback((updates) => {
    setPropertyData(prev => ({ ...prev, ...updates }));
  }, [setPropertyData]);

  // Auto-calculate monthly payment when loan details change
  useEffect(() => {
    if (activeTab === 'traditional' && propertyData.downPayment && propertyData.interestRate && propertyData.loanTerm && propertyData.purchasePrice) {
      const loanAmount = parseFloat(propertyData.purchasePrice) - parseFloat(propertyData.downPayment);
      const monthlyPayment = calculateMonthlyPayment(loanAmount, propertyData.interestRate, propertyData.loanTerm);
      updatePropertyData({ 
        monthlyPayment: monthlyPayment.toFixed(2), 
        loanAmount: loanAmount.toString() 
      });
    }
  }, [propertyData.downPayment, propertyData.interestRate, propertyData.loanTerm, propertyData.purchasePrice, activeTab, updatePropertyData]);

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    background: isActive ? 'linear-gradient(to right, #06b6d4, #3b82f6)' : 'rgba(51, 65, 85, 0.5)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  });

  const renderTraditionalFinancing = () => (
    <div style={styles.formGrid}>
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxGreen, width: '40px', height: '40px', marginBottom: '0'}}>
            <DollarSign size={20} color="white" />
          </div>
          Loan Details
        </h3>
        
        {[
          { label: 'Down Payment ($)', key: 'downPayment', placeholder: 'e.g., 400000', type: 'number' },
          { label: 'Interest Rate (%)', key: 'interestRate', placeholder: 'e.g., 6.5', type: 'number' },
          { label: 'Loan Term (Years)', key: 'loanTerm', placeholder: 'e.g., 30', type: 'number' }
        ].map((field) => (
          <div key={field.key} style={styles.inputGroup}>
            <label style={styles.label}>{field.label}</label>
            <input
              type={field.type}
              value={propertyData[field.key]}
              onChange={(e) => setPropertyData({...propertyData, [field.key]: e.target.value})}
              style={styles.input}
              placeholder={field.placeholder}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        ))}
      </div>
      
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxCyan, width: '40px', height: '40px', marginBottom: '0'}}>
            <Calculator size={20} color="white" />
          </div>
          Calculated Values
        </h3>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Loan Amount ($)</label>
          <div style={{...styles.input, backgroundColor: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8'}}>
            ${(parseFloat(propertyData.purchasePrice || 0) - parseFloat(propertyData.downPayment || 0)).toLocaleString()}
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Down Payment (%)</label>
          <div style={{...styles.input, backgroundColor: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8'}}>
            {propertyData.purchasePrice && propertyData.downPayment 
              ? (((parseFloat(propertyData.downPayment)) / parseFloat(propertyData.purchasePrice)) * 100).toFixed(1)
              : 0}%
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Monthly Payment ($)</label>
          <div style={{...styles.input, backgroundColor: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8'}}>
            ${parseFloat(propertyData.monthlyPayment || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSellerFinancing = () => (
    <div style={styles.formGrid}>
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxPurple, width: '40px', height: '40px', marginBottom: '0'}}>
            <DollarSign size={20} color="white" />
          </div>
          Seller Financing Terms
        </h3>
        
        {[
          { label: 'Amount Being Financed ($)', key: 'sellerFinanceAmount', placeholder: 'e.g., 1200000', type: 'number' },
          { label: 'Interest Rate (%)', key: 'sellerInterestRate', placeholder: 'e.g., 5.5', type: 'number' },
          { label: 'Amortization Period (Years)', key: 'sellerAmortization', placeholder: 'e.g., 30', type: 'number' },
          { label: 'Balloon Period (Years)', key: 'sellerBalloonPeriod', placeholder: 'e.g., 5', type: 'number' }
        ].map((field) => (
          <div key={field.key} style={styles.inputGroup}>
            <label style={styles.label}>{field.label}</label>
            <input
              type={field.type}
              value={propertyData[field.key] || ''}
              onChange={(e) => setPropertyData({...propertyData, [field.key]: e.target.value})}
              style={styles.input}
              placeholder={field.placeholder}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        ))}
      </div>
      
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxCyan, width: '40px', height: '40px', marginBottom: '0'}}>
            <Calculator size={20} color="white" />
          </div>
          Calculated Payments
        </h3>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Monthly Payment ($)</label>
          <div style={{...styles.input, backgroundColor: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8'}}>
            ${calculateMonthlyPayment(
              propertyData.sellerFinanceAmount, 
              propertyData.sellerInterestRate, 
              propertyData.sellerAmortization
            ).toLocaleString()}
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Balloon Payment Due ($)</label>
          <div style={{...styles.input, backgroundColor: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8'}}>
            ${calculateBalloonAmount(
              propertyData.sellerFinanceAmount, 
              propertyData.sellerInterestRate, 
              propertyData.sellerAmortization, 
              propertyData.sellerBalloonPeriod
            ).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubjectTo = () => (
    <div style={styles.formGrid}>
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxGreen, width: '40px', height: '40px', marginBottom: '0'}}>
            <DollarSign size={20} color="white" />
          </div>
          Existing Loan Details
        </h3>
        
        {[
          { label: 'Original Loan Amount ($)', key: 'subjectToOriginal', placeholder: 'e.g., 1800000', type: 'number' },
          { label: 'Current Balance ($)', key: 'subjectToBalance', placeholder: 'e.g., 1650000', type: 'number' },
          { label: 'Interest Rate (%)', key: 'subjectToRate', placeholder: 'e.g., 4.5', type: 'number' },
          { label: 'Remaining Years', key: 'subjectToYears', placeholder: 'e.g., 25', type: 'number' }
        ].map((field) => (
          <div key={field.key} style={styles.inputGroup}>
            <label style={styles.label}>{field.label}</label>
            <input
              type={field.type}
              value={propertyData[field.key] || ''}
              onChange={(e) => setPropertyData({...propertyData, [field.key]: e.target.value})}
              style={styles.input}
              placeholder={field.placeholder}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        ))}
      </div>
      
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxCyan, width: '40px', height: '40px', marginBottom: '0'}}>
            <Calculator size={20} color="white" />
          </div>
          Current Payment Info
        </h3>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Current Monthly Payment ($)</label>
          <div style={{...styles.input, backgroundColor: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8'}}>
            ${calculateMonthlyPayment(
              propertyData.subjectToOriginal, 
              propertyData.subjectToRate, 
              30 // Assuming original 30-year term
            ).toLocaleString()}
          </div>
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Remaining Payments</label>
          <div style={{...styles.input, backgroundColor: 'rgba(51, 65, 85, 0.3)', color: '#94a3b8'}}>
            {(parseFloat(propertyData.subjectToYears || 0) * 12).toFixed(0)} months
          </div>
        </div>
      </div>
    </div>
  );

  const renderHybridFinancing = () => (
    <div style={styles.formGrid}>
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxPurple, width: '40px', height: '40px', marginBottom: '0'}}>
            <DollarSign size={20} color="white" />
          </div>
          Hybrid Financing Structure
        </h3>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Down Payment ($)</label>
          <input
            type="number"
            value={propertyData.hybridDownPayment || ''}
            onChange={(e) => setPropertyData({...propertyData, hybridDownPayment: e.target.value})}
            style={styles.input}
            placeholder="e.g., 200000"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Traditional Loan Amount ($)</label>
          <input
            type="number"
            value={propertyData.hybridTraditionalAmount || ''}
            onChange={(e) => setPropertyData({...propertyData, hybridTraditionalAmount: e.target.value})}
            style={styles.input}
            placeholder="e.g., 1000000"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Traditional Interest Rate (%)</label>
          <input
            type="number"
            value={propertyData.hybridTraditionalRate || ''}
            onChange={(e) => setPropertyData({...propertyData, hybridTraditionalRate: e.target.value})}
            style={styles.input}
            placeholder="e.g., 6.5"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Traditional Loan Term (Years)</label>
          <input
            type="number"
            value={propertyData.hybridTraditionalTerm || '30'}
            onChange={(e) => setPropertyData({...propertyData, hybridTraditionalTerm: e.target.value})}
            style={styles.input}
            placeholder="e.g., 30"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
      
      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          <div style={{...styles.iconBox, ...styles.iconBoxGreen, width: '40px', height: '40px', marginBottom: '0'}}>
            <Calculator size={20} color="white" />
          </div>
          Seller Finance Portion
        </h3>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Seller Finance Amount ($)</label>
          <input
            type="number"
            value={propertyData.hybridSellerAmount || ''}
            onChange={(e) => setPropertyData({...propertyData, hybridSellerAmount: e.target.value})}
            style={styles.input}
            placeholder="e.g., 500000"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Seller Interest Rate (%)</label>
          <input
            type="number"
            value={propertyData.hybridSellerRate || ''}
            onChange={(e) => setPropertyData({...propertyData, hybridSellerRate: e.target.value})}
            style={styles.input}
            placeholder="e.g., 5.0"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Seller Amortization (Years)</label>
          <input
            type="number"
            value={propertyData.hybridSellerAmortization || '30'}
            onChange={(e) => setPropertyData({...propertyData, hybridSellerAmortization: e.target.value})}
            style={styles.input}
            placeholder="e.g., 30"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Seller Balloon Period (Years)</label>
          <input
            type="number"
            value={propertyData.hybridSellerBalloon || '5'}
            onChange={(e) => setPropertyData({...propertyData, hybridSellerBalloon: e.target.value})}
            style={styles.input}
            placeholder="e.g., 5"
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(71, 85, 105, 0.5)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Calculated Combined Payments */}
        <div style={{marginTop: '24px', padding: '16px', background: 'rgba(51, 65, 85, 0.3)', borderRadius: '12px'}}>
          <h4 style={{color: '#10b981', fontSize: '1rem', marginBottom: '12px'}}>Combined Monthly Payment:</h4>
          <div style={{color: '#ffffff', fontSize: '1.25rem', fontWeight: '600'}}>
            ${(
              calculateMonthlyPayment(propertyData.hybridTraditionalAmount, propertyData.hybridTraditionalRate, propertyData.hybridTraditionalTerm) +
              calculateMonthlyPayment(propertyData.hybridSellerAmount, propertyData.hybridSellerRate, propertyData.hybridSellerAmortization)
            ).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.largeContainer}>
        <div style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage(uploadedFile ? 'upload' : 'manual')}
            onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={styles.pageTitle}>Financing Details</h1>
          <p style={styles.pageSubtitle}>Select your financing method and enter the details</p>
          
          <div style={styles.formContainer}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
              {[
                { key: 'traditional', label: 'Traditional' },
                { key: 'seller', label: 'Seller Finance' },
                { key: 'subject', label: 'Subject To' },
                { key: 'hybrid', label: 'Hybrid' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  style={tabStyle(activeTab === tab.key)}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            {activeTab === 'traditional' && renderTraditionalFinancing()}
            {activeTab === 'seller' && renderSellerFinancing()}
            {activeTab === 'subject' && renderSubjectTo()}
            {activeTab === 'hybrid' && renderHybridFinancing()}
            
            <div style={{ marginTop: '40px' }}>
              <button
                style={{
                  ...styles.button,
                  width: '100%',
                  justifyContent: 'center',
                  ...(hoveredButton ? styles.buttonHover : {})
                }}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                onClick={() => setCurrentPage('results')}
              >
                Analyze Investment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancingPage;