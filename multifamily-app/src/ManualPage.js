import React, { useState } from 'react';
import { ArrowLeft, BarChart3, DollarSign } from 'lucide-react';
import { styles } from './styles';

const ManualPage = ({ setCurrentPage, propertyData, setPropertyData }) => {
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.largeContainer}>
        <div style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('underwrite')}
            onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={styles.pageTitle}>Manual Property Entry</h1>
          <p style={styles.pageSubtitle}>Enter your property and financing details</p>
          
          <div style={styles.formContainer}>
            <div style={styles.formGrid}>
              {/* Property Information */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <div style={{...styles.iconBox, ...styles.iconBoxCyan, width: '40px', height: '40px', marginBottom: '0'}}>
                    <BarChart3 size={20} color="white" />
                  </div>
                  Property Information
                </h3>
                
                {[
                  { label: 'Property Name', key: 'propertyName', placeholder: 'Enter property name', type: 'text' },
                  { label: 'Number of Units', key: 'units', placeholder: 'e.g., 24', type: 'number' },
                  { label: 'Purchase Price ($)', key: 'purchasePrice', placeholder: 'e.g., 2400000', type: 'number' },
                  { label: 'Gross Monthly Rent ($)', key: 'grossRent', placeholder: 'e.g., 18000', type: 'number' },
                  { label: 'Vacancy Rate (%)', key: 'vacancy', placeholder: 'e.g., 5', type: 'number' },
                  { label: 'Annual Operating Expenses ($)', key: 'operatingExpenses', placeholder: 'e.g., 65000', type: 'number' }
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
              
              {/* Financing Information */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionTitle}>
                  <div style={{...styles.iconBox, ...styles.iconBoxGreen, width: '40px', height: '40px', marginBottom: '0'}}>
                    <DollarSign size={20} color="white" />
                  </div>
                  Financing Information
                </h3>
                
                {[
                  { label: 'Loan Amount ($)', key: 'loanAmount', placeholder: 'e.g., 1800000', type: 'number' },
                  { label: 'Interest Rate (%)', key: 'interestRate', placeholder: 'e.g., 6.5', type: 'number' },
                  { label: 'Loan Term (Years)', key: 'loanTerm', placeholder: 'e.g., 30', type: 'number' },
                  { label: 'Monthly Payment ($)', key: 'monthlyPayment', placeholder: 'e.g., 11500', type: 'number' },
                  { label: 'Exit Cap Rate (%)', key: 'exitCapRate', placeholder: 'e.g., 6.5', type: 'number' },
                  { label: 'Hold Period (Years)', key: 'holdPeriod', placeholder: 'e.g., 5', type: 'number' }
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
            </div>
            
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
                Analyze Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPage;