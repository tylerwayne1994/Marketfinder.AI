import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, DollarSign, Building, TrendingUp, FileText, BarChart3, Download, Activity, Bot, User, Send } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { supabase } from './lib/supabase';

// Modern styling consistent with Upload Page
const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(to bottom, #f8fafc, #ffffff)" },
  container: { maxWidth: 1400, margin: "0 auto", padding: 16 },
  h1: { fontSize: "1.75rem", fontWeight: 800, color: "#111827", marginBottom: 4, textAlign: "center" },
  card: { 
    background: "#fff", 
    border: "1px solid #e5e7eb", 
    boxShadow: "0 2px 4px rgba(0,0,0,.03)", 
    borderRadius: 12, 
    padding: 14,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#111827",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6
  },
  inputGroup: {
    marginBottom: 8
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 3
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 12,
    transition: "border-color 0.2s",
    outline: "none",
  },
  smallCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 5
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  readOnlyInput: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    fontSize: 12,
    background: "#f9fafb",
    color: "#6b7280",
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
};

const ManualUnderwritePage = ({ setCurrentPage }) => {
  // User tracking state
  const [, setCurrentUser] = useState(null); // User tracking for analytics only
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

  // Value Add Calculator state
  const [valueAddScenarios, setValueAddScenarios] = useState([
    {
      id: 1,
      raisedRent: 100,
      capRate: 13,
      unitCount: 6,
      rehabCostPerUnit: 10000
    }
  ]);

  // AI Chat state
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your AI underwriting assistant. I can help you figure out what purchase price you need to achieve specific cashflow goals based on your current property inputs. Try asking me something like: 'What purchase price do I need to cashflow $2,000 per month?' or 'How much should I offer to get a 12% cash-on-cash return?'"
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);

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
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // AI Chat Functions
  const calculatePurchasePriceForCashflow = (targetMonthlyCashflow, shouldUpdateForm = false) => {
    // Use current form data to reverse-engineer the purchase price
    const monthlyIncome = calculations.monthlyGrossIncome || 
      (parseFloat(formData.grossRents) + parseFloat(formData.parking || 0) + parseFloat(formData.other || 0));
    
    const monthlyExpenses = calculations.totalMonthlyExpenses ||
      (parseFloat(formData.taxes) + parseFloat(formData.insurance) + parseFloat(formData.utilities) + 
       parseFloat(formData.maintenance) + parseFloat(formData.electrical || 0) + parseFloat(formData.water || 0) + 
       parseFloat(formData.sewer || 0) + parseFloat(formData.trash || 0) + parseFloat(formData.gas || 0));
    
    const monthlyVacancy = monthlyIncome * (formData.vacancyRate / 100);
    const effectiveIncome = monthlyIncome - monthlyVacancy;
    const managementFee = effectiveIncome * (formData.managementPercent / 100);
    
    const netIncome = effectiveIncome - monthlyExpenses - managementFee;
    const targetMonthlyPayment = netIncome - targetMonthlyCashflow;
    
    if (targetMonthlyPayment <= 0) {
      return null; // Not feasible with current expenses
    }
    
    // Calculate loan amount from monthly payment
    const monthlyRate = formData.interestRate / 100 / 12;
    const numPayments = formData.term * 12;
    const loanAmount = targetMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
    
    // Calculate purchase price from loan amount and down payment
    const downPaymentDecimal = formData.downPaymentPercent / 100;
    const purchasePrice = loanAmount / (1 - downPaymentDecimal);
    
    const result = {
      purchasePrice: Math.round(purchasePrice),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(targetMonthlyPayment),
      downPayment: Math.round(purchasePrice * downPaymentDecimal),
      projectedCashflow: targetMonthlyCashflow,
      noi: Math.round(netIncome * 12),
      capRate: ((netIncome * 12) / purchasePrice * 100).toFixed(2)
    };

    // Automatically update the form if requested
    if (shouldUpdateForm && result) {
      setFormData(prev => ({
        ...prev,
        purchasePrice: result.purchasePrice
      }));
    }
    
    return result;
  };

  const calculatePurchasePriceForCashOnCash = (targetCashOnCashReturn, shouldUpdateForm = false) => {
    const monthlyIncome = calculations.monthlyGrossIncome || 
      (parseFloat(formData.grossRents) + parseFloat(formData.parking || 0) + parseFloat(formData.other || 0));
    
    const monthlyExpenses = calculations.totalMonthlyExpenses ||
      (parseFloat(formData.taxes) + parseFloat(formData.insurance) + parseFloat(formData.utilities) + 
       parseFloat(formData.maintenance) + parseFloat(formData.electrical || 0) + parseFloat(formData.water || 0) + 
       parseFloat(formData.sewer || 0) + parseFloat(formData.trash || 0) + parseFloat(formData.gas || 0));
    
    const monthlyVacancy = monthlyIncome * (formData.vacancyRate / 100);
    const effectiveIncome = monthlyIncome - monthlyVacancy;
    const managementFee = effectiveIncome * (formData.managementPercent / 100);
    
    // Use iterative approach to find purchase price
    let purchasePrice = 1000000; // Starting point
    const downPaymentDecimal = formData.downPaymentPercent / 100;
    
    for (let i = 0; i < 1000; i++) {
      const loanAmount = purchasePrice * (1 - downPaymentDecimal);
      const monthlyRate = formData.interestRate / 100 / 12;
      const numPayments = formData.term * 12;
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      const netIncome = effectiveIncome - monthlyExpenses - managementFee;
      const cashFlow = netIncome - monthlyPayment;
      const annualCashFlow = cashFlow * 12;
      const downPayment = purchasePrice * downPaymentDecimal;
      const actualCashOnCash = (annualCashFlow / downPayment) * 100;
      
      if (Math.abs(actualCashOnCash - targetCashOnCashReturn) < 0.01) {
        const result = {
          purchasePrice: Math.round(purchasePrice),
          loanAmount: Math.round(loanAmount),
          monthlyPayment: Math.round(monthlyPayment),
          downPayment: Math.round(downPayment),
          projectedCashflow: Math.round(cashFlow),
          annualCashflow: Math.round(annualCashFlow),
          cashOnCashReturn: actualCashOnCash.toFixed(2),
          noi: Math.round(netIncome * 12),
          capRate: ((netIncome * 12) / purchasePrice * 100).toFixed(2)
        };

        // Automatically update the form if requested
        if (shouldUpdateForm) {
          setFormData(prev => ({
            ...prev,
            purchasePrice: result.purchasePrice
          }));
        }

        return result;
      }
      
      // Adjust purchase price based on whether we're above or below target
      if (actualCashOnCash > targetCashOnCashReturn) {
        purchasePrice += 10000;
      } else {
        purchasePrice -= 10000;
      }
      
      if (purchasePrice <= 0) break;
    }
    
    return null;
  };

  const calculateOptimalCapRate = (targetCapRate, shouldUpdateForm = false) => {
    const monthlyIncome = calculations.monthlyGrossIncome || 
      (parseFloat(formData.grossRents) + parseFloat(formData.parking || 0) + parseFloat(formData.other || 0));
    
    const monthlyExpenses = calculations.totalMonthlyExpenses ||
      (parseFloat(formData.taxes) + parseFloat(formData.insurance) + parseFloat(formData.utilities) + 
       parseFloat(formData.maintenance) + parseFloat(formData.electrical || 0) + parseFloat(formData.water || 0) + 
       parseFloat(formData.sewer || 0) + parseFloat(formData.trash || 0) + parseFloat(formData.gas || 0));
    
    const monthlyVacancy = monthlyIncome * (formData.vacancyRate / 100);
    const effectiveIncome = monthlyIncome - monthlyVacancy;
    const managementFee = effectiveIncome * (formData.managementPercent / 100);
    const annualNOI = (effectiveIncome - monthlyExpenses - managementFee) * 12;
    
    // Calculate purchase price for target cap rate: Price = NOI / Cap Rate
    const purchasePrice = Math.round(annualNOI / (targetCapRate / 100));
    
    if (purchasePrice <= 0) return null;

    const result = {
      purchasePrice,
      noi: Math.round(annualNOI),
      capRate: targetCapRate.toFixed(2),
      pricePerUnit: formData.studios + formData.oneBed + formData.twoBed + formData.threeBed > 0 ? 
        Math.round(purchasePrice / (formData.studios + formData.oneBed + formData.twoBed + formData.threeBed)) : 0
    };

    if (shouldUpdateForm) {
      setFormData(prev => ({
        ...prev,
        purchasePrice: result.purchasePrice
      }));
    }

    return result;
  };

  const optimizeForBreakeven = (shouldUpdateForm = false) => {
    const monthlyIncome = calculations.monthlyGrossIncome || 
      (parseFloat(formData.grossRents) + parseFloat(formData.parking || 0) + parseFloat(formData.other || 0));
    
    const monthlyExpenses = calculations.totalMonthlyExpenses ||
      (parseFloat(formData.taxes) + parseFloat(formData.insurance) + parseFloat(formData.utilities) + 
       parseFloat(formData.maintenance) + parseFloat(formData.electrical || 0) + parseFloat(formData.water || 0) + 
       parseFloat(formData.sewer || 0) + parseFloat(formData.trash || 0) + parseFloat(formData.gas || 0));
    
    const monthlyVacancy = monthlyIncome * (formData.vacancyRate / 100);
    const effectiveIncome = monthlyIncome - monthlyVacancy;
    const managementFee = effectiveIncome * (formData.managementPercent / 100);
    const netIncome = effectiveIncome - monthlyExpenses - managementFee;
    
    // For breakeven, monthly payment should equal net income
    const targetMonthlyPayment = netIncome;
    
    if (targetMonthlyPayment <= 0) return null;
    
    const monthlyRate = formData.interestRate / 100 / 12;
    const numPayments = formData.term * 12;
    const loanAmount = targetMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
    const downPaymentDecimal = formData.downPaymentPercent / 100;
    const purchasePrice = loanAmount / (1 - downPaymentDecimal);
    
    const result = {
      purchasePrice: Math.round(purchasePrice),
      loanAmount: Math.round(loanAmount),
      monthlyPayment: Math.round(targetMonthlyPayment),
      downPayment: Math.round(purchasePrice * downPaymentDecimal),
      projectedCashflow: 0,
      noi: Math.round(netIncome * 12),
      capRate: ((netIncome * 12) / purchasePrice * 100).toFixed(2)
    };

    if (shouldUpdateForm) {
      setFormData(prev => ({
        ...prev,
        purchasePrice: result.purchasePrice
      }));
    }

    return result;
  };

  const processAIMessage = async (message) => {
    setIsAIThinking(true);
    
    try {
      // Parse the user's message to understand what they want
      const lowerMessage = message.toLowerCase();
      let response = "";
      let shouldAutoUpdate = lowerMessage.includes('update') || lowerMessage.includes('set') || lowerMessage.includes('change') || lowerMessage.includes('adjust');
      
      if (lowerMessage.includes('cashflow') || lowerMessage.includes('cash flow')) {
        // Extract target cashflow amount
        const cashflowMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        if (cashflowMatch) {
          const targetCashflow = parseFloat(cashflowMatch[1].replace(/,/g, ''));
          const result = calculatePurchasePriceForCashflow(targetCashflow, shouldAutoUpdate);
          
          if (result) {
            response = `💰 **${shouldAutoUpdate ? 'Updated Purchase Price!' : 'Analysis Complete!'}**\n\nTo achieve **$${targetCashflow.toLocaleString()}/month** in cashflow:\n\n` +
              `📊 **Required Purchase Price:** $${result.purchasePrice.toLocaleString()}\n` +
              `🏦 **Loan Amount:** $${result.loanAmount.toLocaleString()}\n` +
              `💵 **Down Payment (${formData.downPaymentPercent}%):** $${result.downPayment.toLocaleString()}\n` +
              `🏠 **Monthly Payment:** $${result.monthlyPayment.toLocaleString()}\n` +
              `📈 **Projected NOI:** $${result.noi.toLocaleString()}/year\n` +
              `🎯 **Cap Rate:** ${result.capRate}%\n\n` +
              `${shouldAutoUpdate ? '✅ **Form Updated!** Your purchase price has been automatically adjusted.' : '💡 **Want me to update the form?** Ask me to "set the purchase price" and I\'ll update it for you!'}\n\n` +
              `*Based on your current income/expense assumptions*`;
          } else {
            response = `❌ **Not Feasible**\n\nWith your current expense structure, achieving $${targetCashflow.toLocaleString()}/month cashflow isn't possible. Consider:\n\n` +
              `• Reducing expenses\n• Increasing rental income\n• Lowering interest rate\n• Increasing down payment percentage\n\n` +
              `💡 **Want me to find the breakeven price?** Just ask "What's the breakeven purchase price?"`;
          }
        } else {
          response = `I'd be happy to help calculate and update the purchase price for your target cashflow! Try:\n\n` +
            `• "Set purchase price for $2,000/month cashflow"\n• "Update form to cashflow $1,500/month"\n• "What purchase price gives me $3,000/month?"`;
        }
      } else if (lowerMessage.includes('cash on cash') || lowerMessage.includes('return') || lowerMessage.includes('%')) {
        // Extract target return percentage
        const returnMatch = message.match(/(\d+(?:\.\d+)?)%?/);
        if (returnMatch) {
          const targetReturn = parseFloat(returnMatch[1]);
          const result = calculatePurchasePriceForCashOnCash(targetReturn, shouldAutoUpdate);
          
          if (result) {
            response = `🎯 **${shouldAutoUpdate ? 'Updated Purchase Price!' : 'Return Analysis Complete!'}**\n\nTo achieve **${targetReturn}%** cash-on-cash return:\n\n` +
              `📊 **Required Purchase Price:** $${result.purchasePrice.toLocaleString()}\n` +
              `🏦 **Loan Amount:** $${result.loanAmount.toLocaleString()}\n` +
              `💵 **Down Payment (${formData.downPaymentPercent}%):** $${result.downPayment.toLocaleString()}\n` +
              `🏠 **Monthly Payment:** $${result.monthlyPayment.toLocaleString()}\n` +
              `💰 **Monthly Cashflow:** $${result.projectedCashflow.toLocaleString()}\n` +
              `📈 **Annual Cashflow:** $${result.annualCashflow.toLocaleString()}\n` +
              `🎯 **Cap Rate:** ${result.capRate}%\n\n` +
              `${shouldAutoUpdate ? '✅ **Form Updated!** Your purchase price has been automatically adjusted.' : '💡 **Want me to update the form?** Ask me to "set the purchase price" and I\'ll update it for you!'}\n\n` +
              `*Based on your current income/expense assumptions*`;
          } else {
            response = `❌ **Target Too High**\n\nAchieving ${targetReturn}% cash-on-cash return with current assumptions isn't feasible. Try asking:\n\n` +
              `• "What's the maximum return possible?"\n• "Set purchase price for 8% return"\n• "Update form for breakeven"`;
          }
        } else {
          response = `I can calculate and update the purchase price for your target return! Try:\n\n` +
            `• "Set purchase price for 12% return"\n• "Update form to get 15% cash-on-cash"\n• "What price gives me 10%?"`;
        }
      } else if (lowerMessage.includes('cap rate')) {
        const capRateMatch = message.match(/(\d+(?:\.\d+)?)%?/);
        if (capRateMatch) {
          const targetCapRate = parseFloat(capRateMatch[1]);
          const result = calculateOptimalCapRate(targetCapRate, shouldAutoUpdate);
          
          if (result) {
            response = `🎯 **${shouldAutoUpdate ? 'Updated Purchase Price!' : 'Cap Rate Analysis Complete!'}**\n\nTo achieve **${targetCapRate}%** cap rate:\n\n` +
              `📊 **Required Purchase Price:** $${result.purchasePrice.toLocaleString()}\n` +
              `📈 **Current NOI:** $${result.noi.toLocaleString()}/year\n` +
              `🎯 **Target Cap Rate:** ${result.capRate}%\n` +
              `${result.pricePerUnit > 0 ? `💰 **Price per Unit:** $${result.pricePerUnit.toLocaleString()}\n` : ''}` +
              `${shouldAutoUpdate ? '✅ **Form Updated!** Your purchase price has been automatically adjusted.' : '💡 **Want me to update the form?** Ask me to "set the purchase price" and I\'ll update it for you!'}\n\n` +
              `*Based on your current NOI of $${result.noi.toLocaleString()}*`;
          } else {
            response = `❌ **Invalid Cap Rate**\n\nUnable to calculate purchase price for ${targetCapRate}% cap rate. Your current NOI might be too low.`;
          }
        } else {
          response = `I can calculate purchase prices for specific cap rates! Try:\n\n` +
            `• "Set purchase price for 6% cap rate"\n• "What price gives me 8% cap rate?"\n• "Update form to 7.5% cap rate"`;
        }
      } else if (lowerMessage.includes('breakeven') || lowerMessage.includes('break even')) {
        const result = optimizeForBreakeven(shouldAutoUpdate);
        
        if (result) {
          response = `⚖️ **${shouldAutoUpdate ? 'Updated to Breakeven!' : 'Breakeven Analysis Complete!'}**\n\nFor **$0 monthly cashflow** (breakeven):\n\n` +
            `📊 **Required Purchase Price:** $${result.purchasePrice.toLocaleString()}\n` +
            `🏦 **Loan Amount:** $${result.loanAmount.toLocaleString()}\n` +
            `💵 **Down Payment (${formData.downPaymentPercent}%):** $${result.downPayment.toLocaleString()}\n` +
            `🏠 **Monthly Payment:** $${result.monthlyPayment.toLocaleString()}\n` +
            `📈 **Annual NOI:** $${result.noi.toLocaleString()}\n` +
            `🎯 **Cap Rate:** ${result.capRate}%\n\n` +
            `${shouldAutoUpdate ? '✅ **Form Updated!** Your purchase price has been set to breakeven.' : '💡 **Want me to update the form?** Ask me to "set breakeven price" and I\'ll update it for you!'}\n\n` +
            `*This is the maximum you can pay without losing money monthly*`;
        } else {
          response = `❌ **Breakeven Not Possible**\n\nWith your current expense structure, you can't achieve breakeven. Your expenses exceed your income.\n\n` +
            `Consider reducing expenses or increasing rental income.`;
        }
      } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        response = `🤖 **I'm your hands-on AI assistant! I can:**\n\n` +
          `💰 **Calculate & Update Cashflow** - "Set purchase price for $2,000/month cashflow"\n\n` +
          `📈 **Calculate & Update Returns** - "Update form to get 12% cash-on-cash return"\n\n` +
          `🎯 **Calculate & Update Cap Rates** - "Set purchase price for 8% cap rate"\n\n` +
          `⚖️ **Find Breakeven** - "What's the breakeven purchase price?"\n\n` +
          `✨ **Auto-Update Magic** - Use words like "set", "update", "change", or "adjust" and I'll automatically update your form!\n\n` +
          `Just tell me what you want to achieve and I'll calculate it AND update your inputs!`;
      } else if (lowerMessage.includes('current') || lowerMessage.includes('what are my')) {
        response = `📊 **Your Current Metrics:**\n\n` +
          `💰 **Monthly Cashflow:** $${calculations.cashFlow.toLocaleString()}\n` +
          `📈 **Cash-on-Cash Return:** ${calculations.cashOnCashReturn.toFixed(2)}%\n` +
          `🎯 **Cap Rate:** ${calculations.capRate.toFixed(2)}%\n` +
          `⚖️ **DSCR:** ${calculations.debtServiceCoverage.toFixed(2)}\n` +
          `🏠 **Purchase Price:** $${formData.purchasePrice.toLocaleString()}\n` +
          `📈 **Monthly NOI:** $${calculations.monthlyGrossIncome - calculations.totalMonthlyExpenses - (calculations.monthlyGrossIncome * formData.vacancyRate / 100) - (calculations.effectiveGrossIncome * formData.managementPercent / 100)}\n\n` +
          `💡 **Want to optimize?** Ask me to "set purchase price for 15% return" or "update to cashflow $3,000/month"!`;
      } else {
        response = `🚀 **I'm your hands-on AI assistant!** I don't just calculate - I UPDATE your form too!\n\n` +
          `**Try saying:**\n` +
          `• "Set purchase price for $1,500/month cashflow"\n` +
          `• "Update form to get 12% cash-on-cash return"\n` +
          `• "Change purchase price for 7% cap rate"\n` +
          `• "Adjust to breakeven cashflow"\n\n` +
          `🎯 **I'll calculate the optimal price AND update your form automatically!**\n\n` +
          `What would you like me to optimize for you?`;
      }
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: response
      }]);
      
    } catch (error) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: '❌ Sorry, I encountered an error calculating that. Please check your inputs and try again.'
      }]);
    } finally {
      setIsAIThinking(false);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    
    // Add user message
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: currentMessage
    }]);
    
    // Process AI response
    processAIMessage(currentMessage);
    setCurrentMessage('');
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
      marginBottom: 12
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
      marginBottom: 10,
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

  // Unused variables removed (sensitivity analysis now uses chart instead of table)
  // const cashFlowReturns = [5, 6, 7, 8, 9, 10, 11, 12];
  // const exitReturns = [8, 9, 10, 11, 12, 13, 14, 15, 16];
  // const getCellColor = (cash, exit) => {
  //   const total = cash + exit;
  //   const cashRatio = cash / total;
  //   return cashRatio >= 0.5 ? '#dcfce7' : '#fee2e2';
  // };

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
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
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
            
            <button 
              onClick={() => setShowAIChat(!showAIChat)}
              style={{
                ...styles.button, 
                background: showAIChat 
                  ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" 
                  : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
              }}
            >
              <Bot size={16} /> {showAIChat ? 'Close AI Chat' : 'AI Assistant'}
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

        {/* Main Input Grid - Clean 3 Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          
          {/* LEFT: Price & Financing */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>
              <DollarSign size={16} /> Price & Financing
            </h3>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Purchase Price</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Down Payment %</label>
              <input
                type="number"
                value={formData.downPaymentPercent}
                onChange={(e) => handleInputChange('downPaymentPercent', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Interest Rate %</label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                step="0.01"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Term (Years)</label>
              <input
                type="number"
                value={formData.term}
                onChange={(e) => handleInputChange('term', parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 0 }}>
              <label style={styles.label}>Monthly Payment</label>
              <div style={{ ...styles.readOnlyInput, fontWeight: 600, background: "#fef3c7", border: "2px solid #f59e0b", fontSize: 15 }}>
                ${calculations.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* MIDDLE: Seller Finance */}
          <div style={styles.smallCard}>
            <h3 style={styles.sectionHeader}>
              <FileText size={16} /> Seller Finance
            </h3>
            
            <div style={{ marginBottom: 12 }}>
              <label style={styles.label}>Seller Price</label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 6 }}>
              <label style={styles.label}>Down Payment %</label>
              <input
                type="number"
                value={formData.downPaymentPercent}
                onChange={(e) => handleInputChange('downPaymentPercent', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 6 }}>
              <label style={styles.label}>Interest Rate %</label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                step="0.01"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 6 }}>
              <label style={styles.label}>Term (Years)</label>
              <input
                type="number"
                value={formData.term}
                onChange={(e) => handleInputChange('term', parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 6 }}>
              <label style={styles.label}>Financing</label>
              <input
                type="text"
                value="Bank"
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
            
            <div style={{ marginBottom: 6 }}>
              <label style={styles.label}>Monthly Payment</label>
              <div style={{ ...styles.readOnlyInput, fontWeight: 600, background: "#fef3c7", border: "1px solid #f59e0b" }}>
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
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Seller Fin. Prop</label>
              <input
                type="number"
                value={formData.sellerFinProp}
                onChange={(e) => handleInputChange('sellerFinProp', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Down Payment %</label>
              <input
                type="number"
                value={formData.sellerDownPaymentPercent}
                onChange={(e) => handleInputChange('sellerDownPaymentPercent', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Interest Rate %</label>
              <input
                type="number"
                value={formData.sellerInterestRate}
                onChange={(e) => handleInputChange('sellerInterestRate', parseFloat(e.target.value) || 0)}
                step="0.01"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Term</label>
              <input
                type="number"
                value={formData.sellerTerm}
                onChange={(e) => handleInputChange('sellerTerm', parseInt(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
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
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Gross Rents</label>
              <div style={styles.readOnlyInput}>
                ${calculations.currentRentRoll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>PMI</label>
              <input
                type="number"
                value={0}
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Taxes</label>
              <input
                type="number"
                value={formData.taxes}
                onChange={(e) => handleInputChange('taxes', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Insurance</label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => handleInputChange('insurance', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Utilities</label>
              <input
                type="number"
                value={formData.utilities}
                onChange={(e) => handleInputChange('utilities', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Vacancy Reserve %</label>
              <input
                type="number"
                value={formData.vacancyRate}
                onChange={(e) => handleInputChange('vacancyRate', parseFloat(e.target.value) || 0)}
                step="0.1"
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Maintenance</label>
              <input
                type="number"
                value={formData.maintenance}
                onChange={(e) => handleInputChange('maintenance', parseFloat(e.target.value) || 0)}
                style={styles.input}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
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
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Gross Rents</label>
              <div style={styles.readOnlyInput}>
                ${calculations.marketRentRoll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>PMI</label>
              <input
                type="number"
                value={0}
                style={styles.readOnlyInput}
                readOnly
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Taxes</label>
              <div style={styles.readOnlyInput}>
                ${formData.taxes}
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Insurance</label>
              <div style={styles.readOnlyInput}>
                ${formData.insurance}
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Utilities</label>
              <div style={styles.readOnlyInput}>
                ${formData.utilities}
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Vacancy Reserve</label>
              <div style={styles.readOnlyInput}>
                ${(calculations.marketRentRoll * formData.vacancyRate / 100).toFixed(2)}
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label style={styles.label}>Maintenance</label>
              <div style={styles.readOnlyInput}>
                ${formData.maintenance}
              </div>
            </div>
            
            <div style={{ marginBottom: 10 }}>
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
            
            <div style={{ overflowX: 'auto', marginBottom: 10 }}>
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

        {/* VALUE ADD CALCULATOR - Full Width Section */}
        <div style={{
          ...styles.card,
          marginTop: 16,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          padding: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="#4F46E5" />
              Value Add Calculator
            </h3>
            <button
              onClick={() => setValueAddScenarios([...valueAddScenarios, {
                id: Date.now(),
                raisedRent: 100,
                capRate: 13,
                unitCount: 6,
                rehabCostPerUnit: 10000
              }])}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #3730a3 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              + Add Scenario
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'white', borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)' }}>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'left' }}>Raised Rent ($/Unit)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'left' }}>Cap Rate (%)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'left' }}>Unit Count</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'left' }}>Rehab Cost/Unit ($)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'right' }}>Value Add/Unit ($)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'right' }}>Total Value Add ($)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'right' }}>Total Rehab Cost ($)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'right' }}>Equity Created ($)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'right' }}>ROI on Rehab (%)</th>
                  <th style={{ padding: 16, fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {valueAddScenarios.map((scenario, index) => {
                  // Calculate Value Add per Unit: (Monthly Rent Increase × 12) ÷ Cap Rate
                  const valueAddPerUnit = (scenario.raisedRent * 12) / (scenario.capRate / 100);
                  
                  // Calculate Total Value Add: Value Add per Unit × Unit Count
                  const totalValueAdd = valueAddPerUnit * scenario.unitCount;
                  
                  // Calculate Total Rehab Cost: Cost per Unit × Unit Count
                  const totalRehabCost = scenario.rehabCostPerUnit * scenario.unitCount;
                  
                  // Calculate Equity Created: Total Value Add - Total Rehab Cost
                  const equityCreated = totalValueAdd - totalRehabCost;
                  
                  // Calculate ROI on Rehab: (Equity Created ÷ Total Rehab Cost) × 100
                  const roiOnRehab = totalRehabCost > 0 ? (equityCreated / totalRehabCost) * 100 : 0;

                  return (
                    <tr key={scenario.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: 12 }}>
                        <input
                          type="number"
                          value={scenario.raisedRent}
                          onChange={(e) => {
                            const newScenarios = [...valueAddScenarios];
                            newScenarios[index].raisedRent = parseFloat(e.target.value) || 0;
                            setValueAddScenarios(newScenarios);
                          }}
                          style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                        />
                      </td>
                      <td style={{ padding: 12 }}>
                        <input
                          type="number"
                          value={scenario.capRate}
                          onChange={(e) => {
                            const newScenarios = [...valueAddScenarios];
                            newScenarios[index].capRate = parseFloat(e.target.value) || 0;
                            setValueAddScenarios(newScenarios);
                          }}
                          step="0.1"
                          style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                        />
                      </td>
                      <td style={{ padding: 12 }}>
                        <input
                          type="number"
                          value={scenario.unitCount}
                          onChange={(e) => {
                            const newScenarios = [...valueAddScenarios];
                            newScenarios[index].unitCount = parseInt(e.target.value) || 0;
                            setValueAddScenarios(newScenarios);
                          }}
                          style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                        />
                      </td>
                      <td style={{ padding: 12 }}>
                        <input
                          type="number"
                          value={scenario.rehabCostPerUnit}
                          onChange={(e) => {
                            const newScenarios = [...valueAddScenarios];
                            newScenarios[index].rehabCostPerUnit = parseFloat(e.target.value) || 0;
                            setValueAddScenarios(newScenarios);
                          }}
                          style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                        />
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                        ${valueAddPerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#059669' }}>
                        ${totalValueAdd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                        ${totalRehabCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 700, fontSize: 15, color: equityCreated >= 0 ? '#16a34a' : '#dc2626' }}>
                        ${equityCreated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 700, fontSize: 15, color: roiOnRehab >= 100 ? '#16a34a' : roiOnRehab >= 50 ? '#eab308' : '#dc2626' }}>
                        {roiOnRehab.toFixed(2)}%
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setValueAddScenarios(valueAddScenarios.filter((_, i) => i !== index));
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                  <td colSpan="5" style={{ padding: 16, textAlign: 'right', fontSize: 14, color: '#374151' }}>
                    TOTAL ACROSS ALL SCENARIOS:
                  </td>
                  <td style={{ padding: 16, textAlign: 'right', fontSize: 16, color: '#059669', fontWeight: 800 }}>
                    ${valueAddScenarios.reduce((sum, s) => sum + ((s.raisedRent * 12) / (s.capRate / 100)) * s.unitCount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: 16, textAlign: 'right', fontSize: 16, color: '#dc2626', fontWeight: 800 }}>
                    ${valueAddScenarios.reduce((sum, s) => sum + (s.rehabCostPerUnit * s.unitCount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: 16, textAlign: 'right', fontSize: 16, color: '#16a34a', fontWeight: 800 }}>
                    ${valueAddScenarios.reduce((sum, s) => {
                      const totalValueAdd = ((s.raisedRent * 12) / (s.capRate / 100)) * s.unitCount;
                      const totalRehabCost = s.rehabCostPerUnit * s.unitCount;
                      return sum + (totalValueAdd - totalRehabCost);
                    }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ marginTop: 20, padding: 16, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#374151' }}>💡 Formula Explanation:</h4>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#64748b', fontSize: 14, lineHeight: 1.8 }}>
              <li><strong>Value Add per Unit</strong> = (Raised Rent × 12) ÷ Cap Rate</li>
              <li><strong>Total Value Add</strong> = Value Add per Unit × Unit Count</li>
              <li><strong>Total Rehab Cost</strong> = Rehab Cost per Unit × Unit Count</li>
              <li><strong>Equity Created</strong> = Total Value Add - Total Rehab Cost</li>
              <li><strong>ROI on Rehab</strong> = (Equity Created ÷ Total Rehab Cost) × 100</li>
            </ul>
          </div>
        </div>

        {/* Summary Returns Box - Compact */}
        <div style={{ 
          ...styles.card, 
          background: "#ffffff", 
          border: "1px solid #e5e7eb",
          marginTop: 12,
          padding: 16
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#111827", display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color="#4F46E5" />
            Cash Flow - Cash on Cash Return
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
            {/* Left side - Main metrics */}
            <div style={{ textAlign: "center", padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
              <div style={{ 
                fontSize: 48, 
                fontWeight: 800, 
                color: calculations.cashOnCashReturn >= 8 ? '#16a34a' : calculations.cashOnCashReturn >= 5 ? '#eab308' : '#dc2626',
                lineHeight: 1,
                marginBottom: 4
              }}>
                {calculations.cashOnCashReturn.toFixed(2)}%
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                per year
              </div>
              
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>ROI:</span>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{calculations.roi.toFixed(2)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>Monthly Cash Flow:</span>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>${calculations.cashFlow.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Detailed breakdown */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#475569' }}>
                    Debt Reduction
                  </h4>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    ${calculations.yearlyPayment.toFixed(2)} - Debt reduced from total debt service
                  </div>
                </div>
                
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#475569' }}>
                    Appreciation
                  </h4>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    ${calculations.appreciation.toFixed(2)} - 3% annual appreciation
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    ROI: {calculations.roi.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div style={{ padding: 14, background: '#ffffff', borderRadius: 10, border: '2px solid #10b981' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>
                  Year 1 Total Return Summary
                </h4>
                <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#64748b' }}>Cash Flow</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, marginRight: 12 }}>{calculations.cashOnCashReturn.toFixed(2)}%</span>
                      <span style={{ color: '#64748b' }}>${(calculations.cashFlow * 12).toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#64748b' }}>Debt Reduction</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, marginRight: 12 }}>{(calculations.yearlyPayment / calculations.totalInvestment * 100).toFixed(2)}%</span>
                      <span style={{ color: '#64748b' }}>${calculations.yearlyPayment.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#64748b' }}>Appreciation</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, marginRight: 12 }}>{(calculations.appreciation / calculations.totalInvestment * 100).toFixed(2)}%</span>
                      <span style={{ color: '#64748b' }}>${calculations.appreciation.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4, background: '#ecfdf5', marginLeft: -14, marginRight: -14, paddingLeft: 14, paddingRight: 14, borderRadius: '0 0 8px 8px' }}>
                    <span style={{ fontWeight: 700, color: '#065f46' }}>Total ROI Year 1</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, marginRight: 12, color: '#065f46' }}>{calculations.roi.toFixed(2)}%</span>
                      <span style={{ fontWeight: 700, color: '#065f46' }}>${calculations.totalReturnYear1.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 16 }}>
          
          {/* Income vs Expenses Pie Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Monthly Income Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'NOI', value: calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy), color: '#10B981' },
                    { name: 'Expenses', value: calculations.totalMonthlyExpenses - calculations.monthlyVacancy, color: '#EF4444' },
                    { name: 'Vacancy', value: calculations.monthlyVacancy, color: '#F59E0B' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {[
                    { name: 'NOI', value: calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy), color: '#10B981' },
                    { name: 'Expenses', value: calculations.totalMonthlyExpenses - calculations.monthlyVacancy, color: '#EF4444' },
                    { name: 'Vacancy', value: calculations.monthlyVacancy, color: '#F59E0B' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, backgroundColor: '#10B981', borderRadius: 2 }}></div>
                  <span style={{ color: '#6b7280' }}>NOI</span>
                </div>
                <span style={{ fontWeight: 600 }}>${(calculations.effectiveGrossIncome - (calculations.totalMonthlyExpenses - calculations.monthlyVacancy)).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 2 }}></div>
                  <span style={{ color: '#6b7280' }}>Expenses</span>
                </div>
                <span style={{ fontWeight: 600 }}>${(calculations.totalMonthlyExpenses - calculations.monthlyVacancy).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, backgroundColor: '#F59E0B', borderRadius: 2 }}></div>
                  <span style={{ color: '#6b7280' }}>Vacancy</span>
                </div>
                <span style={{ fontWeight: 600 }}>${calculations.monthlyVacancy.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Return Components Bar Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Year 1 Return Components
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: 'Cash Flow', value: calculations.cashFlow * 12, fill: '#10B981' },
                  { name: 'Debt Pay', value: calculations.yearlyPayment, fill: '#3B82F6' },
                  { name: 'Appreciation', value: calculations.appreciation, fill: '#8B5CF6' }
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(0)}`} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {[
                    { name: 'Cash Flow', value: calculations.cashFlow * 12, fill: '#10B981' },
                    { name: 'Debt Pay', value: calculations.yearlyPayment, fill: '#3B82F6' },
                    { name: 'Appreciation', value: calculations.appreciation, fill: '#8B5CF6' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 12, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Total Year 1 Return</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#4F46E5' }}>
                ${calculations.totalReturnYear1.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Current vs Market Rents Comparison */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Current vs Market Rents
            </h3>
            <ResponsiveContainer width="100%" height={220}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 16 }}>
          
          {/* Expense Breakdown Pie Chart */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Monthly Expense Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {expenseData.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', background: '#f9fafb', borderRadius: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, backgroundColor: entry.color, borderRadius: 2 }}></div>
                    <span style={{ color: '#6b7280', fontSize: 10 }}>{entry.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 10 }}>${entry.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Allocation */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Investment Allocation
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Down Payment', value: calculations.downPayment, color: '#4F46E5' },
                    { name: 'Loan Amount', value: calculations.loanAmount, color: '#6B7280' },
                    { name: 'Closing Costs', value: parseFloat(formData.closingCosts), color: '#F59E0B' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {[
                    { name: 'Down Payment', value: calculations.downPayment, color: '#4F46E5' },
                    { name: 'Loan Amount', value: calculations.loanAmount, color: '#6B7280' },
                    { name: 'Closing Costs', value: parseFloat(formData.closingCosts), color: '#F59E0B' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${parseFloat(value).toLocaleString()}`} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '10px 12px', background: '#f9fafb', borderRadius: 6 }}>
                <span style={{ color: '#6b7280', fontWeight: 600 }}>Total Investment:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>${calculations.totalInvestment.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f9fafb', borderRadius: 6 }}>
                <span style={{ color: '#6b7280', fontWeight: 600 }}>LTV:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{(100 - formData.downPaymentPercent).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
          
          {/* Interactive Sensitivity Analysis */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              IRR Sensitivity Analysis
            </h3>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              Hover over the chart to see detailed IRR scenarios
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={[
                { exitReturn: '8%', cf5: 13, cf7: 15, cf9: 17, cf11: 19, cf13: 21 },
                { exitReturn: '10%', cf5: 15, cf7: 17, cf9: 19, cf11: 21, cf13: 23 },
                { exitReturn: '12%', cf5: 17, cf7: 19, cf9: 21, cf11: 23, cf13: 25 },
                { exitReturn: '14%', cf5: 19, cf7: 21, cf9: 23, cf11: 25, cf13: 27 },
                { exitReturn: '16%', cf5: 21, cf7: 23, cf9: 25, cf11: 27, cf13: 29 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="exitReturn" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Exit Return %', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#475569' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Total IRR %', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#475569' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 8,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value}%`, 'IRR']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => value.replace('cf', 'Cash Flow ')}
                />
                <Line type="monotone" dataKey="cf5" stroke="#ef4444" strokeWidth={2} name="cf5%" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cf7" stroke="#f59e0b" strokeWidth={2} name="cf7%" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cf9" stroke="#eab308" strokeWidth={2} name="cf9%" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cf11" stroke="#10b981" strokeWidth={2} name="cf11%" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cf13" stroke="#3b82f6" strokeWidth={2} name="cf13%" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 6 }}>
              💡 <strong>Insight:</strong> Higher exit returns and cash flows significantly improve total IRR. Target 20%+ for strong deals.
            </div>
          </div>

          {/* Cap Rate vs Loan Constant Comparison */}
          <div style={styles.card}>
            <h3 style={styles.sectionHeader}>
              Cap Rate vs Loan Constant
            </h3>
            <div style={{ marginBottom: 12 }}>
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

        {/* AI Chat Interface */}
        {showAIChat && (
          <div style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  AI Underwriting Assistant
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                Ask me about purchase price calculations
              </p>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {chatMessages.map(message => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    ...(message.type === 'user' ? { justifyContent: 'flex-end' } : {})
                  }}
                >
                  {message.type === 'ai' && (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bot size={14} color="white" />
                    </div>
                  )}
                  
                  <div style={{
                    maxWidth: message.type === 'user' ? '80%' : '85%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    ...(message.type === 'user' ? {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: 'white',
                      borderBottomRightRadius: '4px'
                    } : {
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#374151',
                      borderBottomLeftRadius: '4px'
                    })
                  }}>
                    {message.content}
                  </div>

                  {message.type === 'user' && (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <User size={14} color="white" />
                    </div>
                  )}
                </div>
              ))}

              {/* AI Thinking Indicator */}
              {isAIThinking && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bot size={14} color="white" />
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    🤔 Calculating...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {[
                'Set purchase price for $2,000/month cashflow',
                'Update form to get 12% cash-on-cash return',
                'Change price for 7% cap rate',
                'Set breakeven purchase price'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentMessage(suggestion);
                    // Auto-send the suggestion
                    setChatMessages(prev => [...prev, {
                      id: Date.now(),
                      type: 'user',
                      content: suggestion
                    }]);
                    processAIMessage(suggestion);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid #e5e7eb',
              borderRadius: '0 0 16px 16px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me about purchase prices..."
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isAIThinking}
                  style={{
                    padding: '10px 12px',
                    background: currentMessage.trim() && !isAIThinking 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                      : '#e5e7eb',
                    color: currentMessage.trim() && !isAIThinking ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentMessage.trim() && !isAIThinking ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualUnderwritePage;
