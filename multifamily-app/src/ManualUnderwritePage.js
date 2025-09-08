import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, DollarSign, Building, TrendingUp, FileText, BarChart3, Download, Home } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { supabase } from './lib/supabase';

const ManualUnderwritePage = ({ setCurrentPage }) => {
  // User tracking state
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial state with all fields from spreadsheet - UNCHANGED
  const [formData, setFormData] = useState({
    // Property Details
    purchasePrice: 5500000,
    downPaymentPercent: 40,
    interestRate: 4.00,
    term: 30,
    closingCostPercent: 0,
    
    // Income - Monthly
    grossRents: 30000,
    parking: 600,
    other: 0,
    
    // Expenses - Monthly
    taxes: 845.33,
    insurance: 716,
    utilities: 4707.50,
    vacancyRate: 7,
    maintenance: 450,
    managementPercent: 7,
    monthlyNOI: 19220.26,
    yearlyNOI: 230643.12,
    
    // Additional Expenses
    electrical: 213,
    water: 213,
    sewer: 213,
    trash: 213,
    gas: 213,
    
    // Unit Details
    studios: 0,
    oneBed: 6,
    twoBed: 5,
    threeBed: 3,
    
    // Current Rent per unit
    studioRent: 0,
    oneBedRent: 1500,
    twoBedRent: 1750,
    threeBedRent: 2100,
    
    // Market Rent (Proforma)
    marketStudioRent: 0,
    marketOneBedRent: 2100,
    marketTwoBedRent: 2475,
    marketThreeBedRent: 2835,
    
    // Additional inputs
    capExPercent: 0,
    ltvPercent: 60,
    closingCosts: 35000,
    arizonaRate: 0,
    sellerFinProp: 0,
    sellerDownPaymentPercent: 0,
    sellerInterestRate: 0,
    sellerTerm: 0
  });

  // Calculated values - UNCHANGED
  const [calculations, setCalculations] = useState({
    downPayment: 0,
    loanAmount: 0,
    monthlyPayment: 0,
    yearlyPayment: 0,
    totalMonthlyExpenses: 0,
    cashFlow: 0,
    cashOnCashReturn: 0,
    debtServiceCoverage: 0,
    capRate: 0,
    loanFactorRate: 0,
    loanConstant: 0,
    spread: 0,
    totalUnits: 0,
    currentRentRoll: 0,
    marketRentRoll: 0,
    annualizedROI: 0,
    totalReturnYear1: 0,
    appreciation: 0,
    roi: 0,
    totalInvestment: 0,
    monthlyGrossIncome: 0,
    monthlyVacancy: 0,
    effectiveGrossIncome: 0,
    monthlyManagement: 0,
    principalAmount: 0,
    interestAmount: 0,
    mortgagePayment: 0,
    mortgageCashflow: 0,
    annualizedAmount: 0,
    annualizedROIPercent: 0
  });

  // Get current user and track usage on page load
  useEffect(() => {
    const getCurrentUserAndTrack = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email
          });
          
          // Track manual underwriting session usage
          await incrementUsage(session.user.id, 'underwriting_sessions');
        }
      } catch (error) {
        console.error('Error tracking usage:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUserAndTrack();
  }, []);

  // Function to increment usage
  const incrementUsage = async (userId, usageType, amount = 1) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      // Get current usage
      const { data: currentUsage, error: fetchError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw fetchError;
      }

      const newValue = (currentUsage?.[usageType] || 0) + amount;

      // Upsert the usage record
      const { error: upsertError } = await supabase
        .from('user_usage')
        .upsert({
          user_id: userId,
          month_year: currentMonth,
          [usageType]: newValue,
          // Initialize other fields if this is a new record
          ...(currentUsage ? {} : {
            om_pdfs_parsed: usageType === 'om_pdfs_parsed' ? amount : 0,
            pages_processed: usageType === 'pages_processed' ? amount : 0,
            underwriting_sessions: usageType === 'underwriting_sessions' ? amount : 0
          })
        }, {
          onConflict: 'user_id,month_year'
        });

      if (upsertError) {
        throw upsertError;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  // All calculation logic - COMPLETELY UNCHANGED
  useEffect(() => {
    const calc = { ...calculations };
    
    // Basic calculations
    calc.downPayment = (formData.purchasePrice * formData.downPaymentPercent) / 100;
    calc.loanAmount = formData.purchasePrice - calc.downPayment;
    calc.totalInvestment = calc.downPayment + parseFloat(formData.closingCosts || 0);
    
    // Monthly payment calculation (P&I)
    const monthlyRate = formData.interestRate / 100 / 12;
    const numPayments = formData.term * 12;
    if (monthlyRate > 0 && calc.loanAmount > 0) {
      calc.monthlyPayment = calc.loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
      calc.monthlyPayment = 0;
    }
    calc.yearlyPayment = calc.monthlyPayment * 12;
    
    // Loan constant
    if (calc.loanAmount > 0) {
      calc.loanConstant = (calc.yearlyPayment / calc.loanAmount) * 100;
    } else {
      calc.loanConstant = 0;
    }
    
    // Calculate mortgage payment breakdown
    calc.mortgagePayment = calc.monthlyPayment;
    calc.interestAmount = calc.loanAmount * monthlyRate;
    calc.principalAmount = calc.monthlyPayment - calc.interestAmount;
    
    // Total units
    calc.totalUnits = parseInt(formData.studios) + parseInt(formData.oneBed) + 
                     parseInt(formData.twoBed) + parseInt(formData.threeBed);
    
    // Current rent roll
    calc.currentRentRoll = (formData.studios * formData.studioRent) +
                          (formData.oneBed * formData.oneBedRent) +
                          (formData.twoBed * formData.twoBedRent) +
                          (formData.threeBed * formData.threeBedRent);
    
    // Market rent roll (Proforma)
    calc.marketRentRoll = (formData.studios * formData.marketStudioRent) +
                         (formData.oneBed * formData.marketOneBedRent) +
                         (formData.twoBed * formData.marketTwoBedRent) +
                         (formData.threeBed * formData.marketThreeBedRent);
    
    // Calculate actual monthly income
    calc.monthlyGrossIncome = calc.currentRentRoll + parseFloat(formData.parking || 0) + parseFloat(formData.other || 0);
    calc.monthlyVacancy = calc.monthlyGrossIncome * (formData.vacancyRate / 100);
    calc.effectiveGrossIncome = calc.monthlyGrossIncome - calc.monthlyVacancy;
    
    // Calculate management fee
    calc.monthlyManagement = calc.effectiveGrossIncome * (formData.managementPercent / 100);
    
    // Calculate total monthly expenses
    calc.totalMonthlyExpenses = parseFloat(formData.taxes || 0) + 
                                parseFloat(formData.insurance || 0) + 
                                parseFloat(formData.utilities || 0) + 
                                parseFloat(formData.maintenance || 0) +
                                parseFloat(formData.electrical || 0) +
                                parseFloat(formData.water || 0) +
                                parseFloat(formData.sewer || 0) +
                                parseFloat(formData.trash || 0) +
                                parseFloat(formData.gas || 0) +
                                calc.monthlyVacancy +
                                calc.monthlyManagement;
    
    // NOI calculation
    const monthlyNOI = calc.effectiveGrossIncome - (calc.totalMonthlyExpenses - calc.monthlyVacancy);
    const yearlyNOI = monthlyNOI * 12;
    
    // Cash flow
    calc.cashFlow = monthlyNOI - calc.monthlyPayment;
    calc.mortgageCashflow = calc.cashFlow;
    
    // Cash on Cash Return
    if (calc.totalInvestment > 0) {
      calc.cashOnCashReturn = ((calc.cashFlow * 12) / calc.totalInvestment) * 100;
    }
    
    // Debt Service Coverage Ratio
    if (calc.yearlyPayment > 0) {
      calc.debtServiceCoverage = yearlyNOI / calc.yearlyPayment;
    }
    
    // Cap Rate
    if (formData.purchasePrice > 0) {
      calc.capRate = (yearlyNOI / formData.purchasePrice) * 100;
    }
    
    // Loan Factor Rate (keeping as is, but added loanConstant separately)
    if (calc.monthlyPayment > 0 && calc.loanAmount > 0) {
      calc.loanFactorRate = (calc.monthlyPayment / (calc.loanAmount / 1000)) * 100;
    }
    
    // Spread
    calc.spread = calc.capRate - calc.loanFactorRate;
    
    // Appreciation (assuming 3% annual)
    calc.appreciation = formData.purchasePrice * 0.03;
    
    // Annualized amount and ROI
    calc.annualizedAmount = (calc.cashFlow * 12) + calc.appreciation;
    if (calc.totalInvestment > 0) {
      calc.annualizedROIPercent = (calc.annualizedAmount / calc.totalInvestment) * 100;
    }
    
    // Total return for Year 1
    calc.totalReturnYear1 = (calc.cashFlow * 12) + calc.appreciation;
    
    // ROI
    if (calc.totalInvestment > 0) {
      calc.roi = (calc.totalReturnYear1 / calc.totalInvestment) * 100;
    }
    
    setCalculations(calc);
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Export to PDF function
  const exportToPDF = () => {
    window.print();
  };

  // Modern styling to match upload page
  const styles = {
    page: { minHeight: "100vh", background: "linear-gradient(to bottom, #f8fafc, #ffffff)" },
    container: { maxWidth: 1400, margin: "0 auto", padding: 20 },
    h1: { fontSize: "2.5rem", fontWeight: 800, color: "#111827", marginBottom: 8, textAlign: "left" },
    card: { 
      background: "#fff", 
      border: "1px solid #e5e7eb", 
      boxShadow: "0 4px 6px rgba(0,0,0,.04)", 
      borderRadius: 16, 
      padding: 24,
      marginBottom: 20
    },
    smallCard: { 
      background: "#fff", 
      border: "1px solid #e5e7eb", 
      boxShadow: "0 4px 6px rgba(0,0,0,.04)", 
      borderRadius: 12, 
      padding: 16,
      marginBottom: 12
    },
    button: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 24px",
      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    homeButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 18px",
      background: "#ffffff",
      color: "#374151",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      border: "2px solid #e5e7eb",
      borderRadius: 8,
      fontSize: 14,
      transition: "border-color 0.2s",
      outline: "none",
      fontFamily: 'inherit'
    },
    readOnlyInput: {
      width: "100%",
      padding: "10px 14px",
      border: "2px solid #e5e7eb",
      borderRadius: 8,
      fontSize: 14,
      backgroundColor: "#f9fafb",
      cursor: "default",
      fontFamily: 'inherit'
    },
    label: {
      fontSize: 13,
      fontWeight: 500,
      color: "#374151",
      marginBottom: 6,
      display: "block"
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: 600,
      color: "#111827",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  };

  const expenseData = [
    { name: 'Mortgage', value: calculations.monthlyPayment, color: '#ef4444' },
    { name: 'Taxes', value: parseFloat(formData.taxes), color: '#f59e0b' },
    { name: 'Insurance', value: parseFloat(formData.insurance), color: '#eab308' },
    { name: 'Utilities', value: parseFloat(formData.utilities), color: '#06b6d4' },
    { name: 'Management', value: calculations.monthlyManagement, color: '#8b5cf6' },
    { name: 'Maintenance', value: parseFloat(formData.maintenance), color: '#ec4899' },
    { name: 'Other', value: parseFloat(formData.electrical) + parseFloat(formData.water) + parseFloat(formData.sewer) + parseFloat(formData.trash) + parseFloat(formData.gas), color: '#64748b' }
  ].filter(item => item.value > 0);

  // Sensitivity Analysis Data
  const cashFlowReturns = [5, 6, 7, 8, 9, 10, 11, 12];
  const exitReturns = [8, 9, 10, 11, 12, 13, 14, 15, 16];

  const getCellColor = (cash, exit) => {
    const total = cash + exit;
    const cashRatio = cash / total;
    return cashRatio >= 0.5 ? '#dcfce7' : '#fee2e2'; // green if balanced, red if exit-heavy
  };

  const leverageColor = calculations.capRate > calculations.loanConstant ? '#16a34a' : '#dc2626';

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <button 
              onClick={() => setCurrentPage('underwrite')} 
              style={styles.homeButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              <ArrowLeft size={16} /> Back to Underwriting Options
            </button>
            
            <button 
              onClick={exportToPDF}
              style={{...styles.button, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"}}
            >
              <Download size={16} /> Export as PDF
            </button>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Calculator size={32} color="white" />
            </div>
            <div>
              <h1 style={styles.h1}>Manual Property Underwriting</h1>
              <p style={{ fontSize: 16, color: "#6b7280", margin: 0 }}>
                Complete property analysis with live calculations
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          
          {/* Price Section */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>
              <DollarSign size={18} /> Price
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Purchase Price</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Down Payment %</label>
              <input
                type="number"
                value={formData.downPaymentPercent}
                onChange={(e) => handleInputChange('downPaymentPercent', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Interest Rate %</label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                step="0.01"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Term (Years)</label>
              <input
                type="number"
                value={formData.term}
                onChange={(e) => handleInputChange('term', parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Financing</label>
              <input
                type="text"
                value="Bank"
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Monthly Payment</label>
              <div style={{ ...styles.readOnlyInput, fontWeight: 600, background: "#fef3c7", border: "2px solid #f59e0b" }}>
                ${calculations.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ marginBottom: 0 }}>
              <label style={styles.label}>Interest Only</label>
              <input
                type="text"
                value="NO"
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
          </div>

          {/* Seller Finance Section */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>
              <Building size={18} /> Seller Finance
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Seller Fin. Prop</label>
              <input
                type="number"
                value={formData.sellerFinProp}
                onChange={(e) => handleInputChange('sellerFinProp', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Down Payment %</label>
              <input
                type="number"
                value={formData.sellerDownPaymentPercent}
                onChange={(e) => handleInputChange('sellerDownPaymentPercent', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Interest Rate %</label>
              <input
                type="number"
                value={formData.sellerInterestRate}
                onChange={(e) => handleInputChange('sellerInterestRate', parseFloat(e.target.value) || 0)}
                step="0.01"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Term</label>
              <input
                type="number"
                value={formData.sellerTerm}
                onChange={(e) => handleInputChange('sellerTerm', parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Financing</label>
              <input
                type="text"
                value=""
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
            
            <div style={{ marginBottom: 0 }}>
              <label style={styles.label}>Monthly Pay</label>
              <div style={styles.readOnlyInput}>
                $0.00
              </div>
            </div>
          </div>

          {/* Current Income Section */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>
              <TrendingUp size={18} /> Current
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Gross Rents</label>
              <div style={styles.readOnlyInput}>
                ${calculations.currentRentRoll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>PMI</label>
              <input
                type="number"
                value={0}
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Taxes</label>
              <input
                type="number"
                value={formData.taxes}
                onChange={(e) => handleInputChange('taxes', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Insurance</label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => handleInputChange('insurance', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Utilities</label>
              <input
                type="number"
                value={formData.utilities}
                onChange={(e) => handleInputChange('utilities', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Vacancy Reserve %</label>
              <input
                type="number"
                value={formData.vacancyRate}
                onChange={(e) => handleInputChange('vacancyRate', parseFloat(e.target.value) || 0)}
                step="0.1"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Maintenance</label>
              <input
                type="number"
                value={formData.maintenance}
                onChange={(e) => handleInputChange('maintenance', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Monthly NOI</label>
              <div style={{ ...styles.readOnlyInput, fontWeight: 600, background: "#dcfce7", border: "2px solid #10b981" }}>
                ${(calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ marginBottom: 0 }}>
              <label style={styles.label}>Yearly NOI</label>
              <div style={{ ...styles.readOnlyInput, fontWeight: 600, background: "#dcfce7", border: "2px solid #10b981" }}>
                ${((calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy)) * 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Proforma Section */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>
              <BarChart3 size={18} /> Proforma
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Gross Rents</label>
              <div style={styles.readOnlyInput}>
                ${calculations.marketRentRoll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>PMI</label>
              <input
                type="number"
                value={0}
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Taxes</label>
              <div style={styles.readOnlyInput}>
                ${formData.taxes}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Insurance</label>
              <div style={styles.readOnlyInput}>
                ${formData.insurance}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Utilities</label>
              <div style={styles.readOnlyInput}>
                ${formData.utilities}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Vacancy Reserve</label>
              <div style={styles.readOnlyInput}>
                ${(calculations.marketRentRoll * formData.vacancyRate / 100).toFixed(2)}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Maintenance</label>
              <div style={styles.readOnlyInput}>
                ${formData.maintenance}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Monthly NOI</label>
              <div style={{ ...styles.readOnlyInput, fontWeight: 600, background: "#dcfce7", border: "2px solid #10b981" }}>
                ${((calculations.marketRentRoll - (calculations.marketRentRoll * formData.vacancyRate / 100)) - 
                   (parseFloat(formData.taxes) + parseFloat(formData.insurance) + parseFloat(formData.utilities) + 
                    parseFloat(formData.maintenance) + ((calculations.marketRentRoll - (calculations.marketRentRoll * formData.vacancyRate / 100)) * formData.managementPercent / 100))).toFixed(2)}
              </div>
            </div>
            
            <div style={{ marginBottom: 0 }}>
              <label style={styles.label}>Yearly NOI</label>
              <div style={{ ...styles.readOnlyInput, fontWeight: 600, background: "#dcfce7", border: "2px solid #10b981" }}>
                ${(((calculations.marketRentRoll - (calculations.marketRentRoll * formData.vacancyRate / 100)) - 
                   (parseFloat(formData.taxes) + parseFloat(formData.insurance) + parseFloat(formData.utilities) + 
                    parseFloat(formData.maintenance) + ((calculations.marketRentRoll - (calculations.marketRentRoll * formData.vacancyRate / 100)) * formData.managementPercent / 100))) * 12).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>
              <FileText size={18} /> Expenses
            </h3>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Closing Cost</label>
              <input
                type="number"
                value={formData.closingCosts}
                onChange={(e) => handleInputChange('closingCosts', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Gas</label>
              <input
                type="number"
                value={formData.gas}
                onChange={(e) => handleInputChange('gas', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Electrical</label>
              <input
                type="number"
                value={formData.electrical}
                onChange={(e) => handleInputChange('electrical', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Water</label>
              <input
                type="number"
                value={formData.water}
                onChange={(e) => handleInputChange('water', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Sewer</label>
              <input
                type="number"
                value={formData.sewer}
                onChange={(e) => handleInputChange('sewer', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Trash</label>
              <input
                type="number"
                value={formData.trash}
                onChange={(e) => handleInputChange('trash', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Other</label>
              <input
                type="number"
                value={formData.other}
                onChange={(e) => handleInputChange('other', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Property Mgmt %</label>
              <input
                type="number"
                value={formData.managementPercent}
                onChange={(e) => handleInputChange('managementPercent', parseFloat(e.target.value) || 0)}
                step="0.5"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Cap Ex %</label>
              <input
                type="number"
                value={formData.capExPercent}
                onChange={(e) => handleInputChange('capExPercent', parseFloat(e.target.value) || 0)}
                step="0.5"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 0 }}>
              <label style={styles.label}>Vacant %</label>
              <input
                type="number"
                value={formData.vacancyRate}
                onChange={(e) => handleInputChange('vacancyRate', parseFloat(e.target.value) || 0)}
                step="0.5"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          
          {/* Proforma Analysis */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>Proforma Analysis</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Approx. Tax Rate</td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>-</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>Arizona</td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>0.00%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Total</td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
                      ${(parseFloat(formData.taxes) * 12).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mortgage Section */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>Mortgage</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6' }}>Sale Price</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                      ${formData.purchasePrice.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6' }}>LTV</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                      {(100 - formData.downPaymentPercent).toFixed(0)}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>Down Payment</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>
                      ${calculations.downPayment.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6' }}>Closing Costs</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                      ${parseFloat(formData.closingCosts).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>Principal Amount</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>
                      ${calculations.loanAmount.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #fef3c7', background: '#fef3c7', fontWeight: 600 }}>Monthly Mortgage</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #fef3c7', background: '#fef3c7', fontWeight: 600 }}>
                      ${calculations.monthlyPayment.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #dcfce7', background: '#dcfce7', fontWeight: 600 }}>Monthly Cashflow</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #dcfce7', background: '#dcfce7', fontWeight: 600 }}>
                      ${calculations.cashFlow.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #dcfce7', background: '#dcfce7', fontWeight: 600 }}>Annualized ROI</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #dcfce7', background: '#dcfce7', fontWeight: 600 }}>
                      {calculations.annualizedROIPercent.toFixed(2)}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #fef3c7', background: '#fef3c7', fontWeight: 600 }}>Cap Rate</td>
                    <td style={{ padding: 6, textAlign: 'right', borderBottom: '1px solid #fef3c7', background: '#fef3c7', fontWeight: 600 }}>
                      {calculations.capRate.toFixed(2)}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 6, fontWeight: 600 }}>Loan Constant</td>
                    <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>
                      {calculations.loanConstant.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Unit Count Section */}
          <div style={{...styles.smallCard, gridColumn: 'span 2'}}>
            <h3 style={styles.sectionHeader}>Unit Count</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 12, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Type</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>#</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Average</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Market</th>
                    <th style={{ padding: 12, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Total</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Proforma</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>Studio</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.studios}
                        onChange={(e) => handleInputChange('studios', parseInt(e.target.value) || 0)}
                        style={{ ...styles.input, width: 50, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center', fontSize: 13 }}>-</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.studioRent}
                        onChange={(e) => handleInputChange('studioRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontSize: 13 }}>${(formData.studios * formData.studioRent).toFixed(0)}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.marketStudioRent}
                        onChange={(e) => handleInputChange('marketStudioRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>One Bed</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.oneBed}
                        onChange={(e) => handleInputChange('oneBed', parseInt(e.target.value) || 0)}
                        style={{ ...styles.input, width: 50, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center', fontSize: 13 }}>-</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.oneBedRent}
                        onChange={(e) => handleInputChange('oneBedRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontSize: 13 }}>${(formData.oneBed * formData.oneBedRent).toFixed(0)}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.marketOneBedRent}
                        onChange={(e) => handleInputChange('marketOneBedRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>Two Bed</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.twoBed}
                        onChange={(e) => handleInputChange('twoBed', parseInt(e.target.value) || 0)}
                        style={{ ...styles.input, width: 50, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center', fontSize: 13 }}>-</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.twoBedRent}
                        onChange={(e) => handleInputChange('twoBedRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontSize: 13 }}>${(formData.twoBed * formData.twoBedRent).toFixed(0)}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.marketTwoBedRent}
                        onChange={(e) => handleInputChange('marketTwoBedRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>Three Bed</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.threeBed}
                        onChange={(e) => handleInputChange('threeBed', parseInt(e.target.value) || 0)}
                        style={{ ...styles.input, width: 50, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center', fontSize: 13 }}>-</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.threeBedRent}
                        onChange={(e) => handleInputChange('threeBedRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'right', fontSize: 13 }}>${(formData.threeBed * formData.threeBedRent).toFixed(0)}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={formData.marketThreeBedRent}
                        onChange={(e) => handleInputChange('marketThreeBedRent', parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, width: 80, padding: 6, fontSize: 12, textAlign: 'center' }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Loan Factor Rate */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>Loan Factor Rate</h3>
            
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Cap Rate</td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                      {calculations.capRate.toFixed(2)}%
                    </td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f4f6', background: '#dcfce7' }}>4.53%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>Loan Factor Rate</td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                      {calculations.loanFactorRate.toFixed(2)}%
                    </td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f4f6', background: '#dcfce7' }}>6.41%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>Spread</td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>
                      {calculations.spread.toFixed(2)}%
                    </td>
                    <td style={{ padding: 8, textAlign: 'right', borderBottom: '1px solid #f3f4f6', background: '#fee2e2', fontWeight: 600 }}>-1.88%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#475569' }}>
              Valuation
            </h4>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 6, fontSize: 10, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Based Rent</th>
                    <th style={{ padding: 6, fontSize: 10, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Cap Rate</th>
                    <th style={{ padding: 6, fontSize: 10, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Value Add</th>
                    <th style={{ padding: 6, fontSize: 10, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Unit Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6', fontSize: 10 }}>4.13%</td>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6', fontSize: 10 }}>$100.00</td>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6', fontSize: 10 }}>$2,384.82</td>
                    <td style={{ padding: 6, borderBottom: '1px solid #f3f4f6', fontSize: 10 }}>{calculations.totalUnits}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Returns Box - Full Width */}
        <div style={{ 
          ...styles.card, 
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
          border: "2px solid #0ea5e9",
          marginTop: 16
        }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: "#1e293b", textAlign: "center" }}>
            Cash Flow - Cash on Cash Return
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
            {/* Left side - Main metrics */}
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ 
                fontSize: 64, 
                fontWeight: 800, 
                color: calculations.cashOnCashReturn >= 8 ? '#16a34a' : calculations.cashOnCashReturn >= 5 ? '#eab308' : '#dc2626',
                lineHeight: 1,
                marginBottom: 8
              }}>
                {calculations.cashOnCashReturn.toFixed(2)}%
              </div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
                per year
              </div>
              
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 14 }}>ROI:</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{calculations.roi.toFixed(2)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 14 }}>Monthly Cash Flow:</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>${calculations.cashFlow.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Detailed breakdown */}
            <div>
              <div style={{ marginBottom: 20, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#475569' }}>
                  Debt Reduction
                </h4>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  ${calculations.yearlyPayment.toFixed(2)} - Debt reduced from total debt service
                </div>
              </div>
              
              <div style={{ marginBottom: 20, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#475569' }}>
                  Appreciation
                </h4>
                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                  ${calculations.appreciation.toFixed(2)} - 3% annual appreciation on property
                </div>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  ROI: {calculations.roi.toFixed(2)}%
                </div>
              </div>
              
              <div style={{ padding: 20, background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', borderRadius: 12, border: '2px solid #16a34a' }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>
                  Summarized Return on Investment After Year 1
                </h4>
                <table style={{ width: '100%', fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: 8 }}>{calculations.cashOnCashReturn.toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', paddingBottom: 8 }}>${(calculations.cashFlow * 12).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', paddingBottom: 8 }}>Cash Flow</td>
                    </tr>
                    <tr>
                      <td style={{ paddingBottom: 8 }}>{(calculations.yearlyPayment / calculations.totalInvestment * 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', paddingBottom: 8 }}>${calculations.yearlyPayment.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', paddingBottom: 8 }}>Debt Reduction</td>
                    </tr>
                    <tr>
                      <td style={{ paddingBottom: 8 }}>{(calculations.appreciation / calculations.totalInvestment * 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', paddingBottom: 8 }}>${calculations.appreciation.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', paddingBottom: 8 }}>Appreciation</td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #16a34a', fontWeight: 700 }}>
                      <td style={{ paddingTop: 12 }}>{calculations.roi.toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', paddingTop: 12 }}>${calculations.totalReturnYear1.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', paddingTop: 12 }}>Total Return on Investment for Year 1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
          
          {/* Income vs Expenses Pie Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Monthly Income Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'NOI', value: calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy), color: '#10b981' },
                    { name: 'Expenses', value: calculations.totalMonthlyExpenses - calculations.monthlyVacancy, color: '#ef4444' },
                    { name: 'Vacancy', value: calculations.monthlyVacancy, color: '#f59e0b' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[
                    { name: 'NOI', value: calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy), color: '#10b981' },
                    { name: 'Expenses', value: calculations.totalMonthlyExpenses - calculations.monthlyVacancy, color: '#ef4444' },
                    { name: 'Vacancy', value: calculations.monthlyVacancy, color: '#f59e0b' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: 2 }}></div>
                <span>NOI: ${(calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy)).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#ef4444', borderRadius: 2 }}></div>
                <span>Expenses: ${(calculations.totalMonthlyExpenses - calculations.monthlyVacancy).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#f59e0b', borderRadius: 2 }}></div>
                <span>Vacancy: ${calculations.monthlyVacancy.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Return Components Bar Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Year 1 Return Components
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: 'Cash Flow', value: calculations.cashFlow * 12, fill: '#10b981' },
                  { name: 'Debt Pay', value: calculations.yearlyPayment, fill: '#06b6d4' },
                  { name: 'Appreciation', value: calculations.appreciation, fill: '#8b5cf6' }
                ]}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(0)}`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 16, padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Year 1 Return</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0ea5e9' }}>
                ${calculations.totalReturnYear1.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Current vs Market Rents Comparison */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Current vs Market Rents
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { 
                    name: '1 Bed', 
                    current: formData.oneBedRent, 
                    market: formData.marketOneBedRent 
                  },
                  { 
                    name: '2 Bed', 
                    current: formData.twoBedRent, 
                    market: formData.marketTwoBedRent 
                  },
                  { 
                    name: '3 Bed', 
                    current: formData.threeBedRent, 
                    market: formData.marketThreeBedRent 
                  }
                ]}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value}`} />
                <Bar dataKey="current" fill="#64748b" />
                <Bar dataKey="market" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 12, marginTop: 12, display: 'flex', justifyContent: 'center', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#64748b', borderRadius: 2 }}></div>
                <span>Current</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: 2 }}></div>
                <span>Market</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, padding: 12, background: '#dcfce7', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                Potential Increase: ${(calculations.marketRentRoll - calculations.currentRentRoll).toFixed(0)}/mo
              </div>
            </div>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
          
          {/* Expense Breakdown Pie Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Monthly Expense Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 12, marginTop: 12 }}>
              {expenseData.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 12, height: 12, backgroundColor: entry.color, borderRadius: 2 }}></div>
                  <span>{entry.name}: ${entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Allocation */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Investment Allocation
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Down Payment', value: calculations.downPayment, color: '#0ea5e9' },
                    { name: 'Loan Amount', value: calculations.loanAmount, color: '#64748b' },
                    { name: 'Closing Costs', value: parseFloat(formData.closingCosts), color: '#fbbf24' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[
                    { name: 'Down Payment', value: calculations.downPayment, color: '#0ea5e9' },
                    { name: 'Loan Amount', value: calculations.loanAmount, color: '#64748b' },
                    { name: 'Closing Costs', value: parseFloat(formData.closingCosts), color: '#fbbf24' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${parseFloat(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#64748b' }}>Total Investment:</span>
                <span style={{ fontWeight: 600 }}>${calculations.totalInvestment.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>LTV:</span>
                <span style={{ fontWeight: 600 }}>{(100 - formData.downPaymentPercent).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
          
          {/* Sensitivity Analysis Matrix */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Sensitivity Analysis: Total IRR (Cash Flow % + Exit %)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 12, fontSize: 12, fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0' }}>Exit \ Cash Flow</th>
                    {cashFlowReturns.map(cash => (
                      <th key={cash} style={{ padding: 12, fontSize: 12, fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0' }}>{cash}%</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exitReturns.map(exit => (
                    <tr key={exit}>
                      <td style={{ padding: 12, fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0', background: '#f8fafc' }}>{exit}%</td>
                      {cashFlowReturns.map(cash => {
                        const total = cash + exit;
                        return (
                          <td key={cash} style={{ 
                            padding: 12, 
                            fontSize: 12, 
                            border: '1px solid #e2e8f0', 
                            backgroundColor: getCellColor(cash, exit), 
                            textAlign: 'center',
                            fontWeight: 600
                          }}>
                            {total}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cap Rate vs Loan Constant Comparison */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Cap Rate vs Loan Constant
            </h3>
            <div style={{ marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: 16, fontSize: 14, fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', textAlign: 'left' }}>Metric</th>
                    <th style={{ padding: 16, fontSize: 14, fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', textAlign: 'right' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: 16, fontSize: 14, border: '1px solid #f3f4f6' }}>Cap Rate</td>
                    <td style={{ padding: 16, fontSize: 14, border: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 600 }}>{calculations.capRate.toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 16, fontSize: 14, border: '1px solid #f3f4f6' }}>Loan Constant</td>
                    <td style={{ padding: 16, fontSize: 14, border: '1px solid #f3f4f6', textAlign: 'right', fontWeight: 600 }}>{calculations.loanConstant.toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 16, fontSize: 14, border: '1px solid #f3f4f6', fontWeight: 600 }}>Leverage</td>
                    <td style={{ 
                      padding: 16, 
                      fontSize: 14, 
                      border: '1px solid #f3f4f6', 
                      textAlign: 'right', 
                      color: leverageColor, 
                      fontWeight: 700 
                    }}>
                      {calculations.capRate > calculations.loanConstant ? 'Positive' : 'Negative'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ 
              padding: 20, 
              borderRadius: 12, 
              background: calculations.capRate > calculations.loanConstant ? 
                'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 
                'linear-gradient(135deg, #fee2e2, #fecaca)',
              border: calculations.capRate > calculations.loanConstant ? 
                '2px solid #16a34a' : 
                '2px solid #dc2626'
            }}>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: calculations.capRate > calculations.loanConstant ? '#166534' : '#991b1b',
                marginBottom: 8
              }}>
                {calculations.capRate > calculations.loanConstant ? 
                  '✓ Positive Leverage' : 
                  '⚠ Negative Leverage'
                }
              </div>
              <div style={{ 
                fontSize: 13, 
                color: calculations.capRate > calculations.loanConstant ? '#166534' : '#991b1b'
              }}>
                {calculations.capRate > calculations.loanConstant ? 
                  'Property generates higher returns than debt costs' : 
                  'Debt costs exceed property returns'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualUnderwritePage;