import React, { useState, useRef } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, BarChart3, Calculator, Edit3, Home, Users, Download, Copy, Zap } from 'lucide-react';

const ResultsPage = ({ setCurrentPage, propertyData }) => {
  const printRef = useRef();
  
  // Property details state - start with empty/placeholder values
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  
  // Initialize with PDF data
  const [financialData, setFinancialData] = useState({
    // Property basics
    purchasePrice: 3495000,
    units: 49,
    grossPotentialRent: 435900,
    currentRent: 352980,
    downPayment: 2163928,
    loanAmount: 1331072,
    interestRate: 4.96,
    
    // Interactive percentages (0-15% range)
    vacancyRate: 5.0,
    managementFeeRate: 10.0,
    maintenanceRate: 6.2,
    capexRate: 3.5,
    
    // Base expenses from PDF
    realEstateTaxes: 17889,
    insurance: 28415,
    contractServices: 8329,
    turnover: 8575,
    generalAdmin: 2148,
    operatingReserves: 12250,
    
    // Utilities breakdown
    water: 426,
    sewer: 284,
    gas: 355,
    electric: 213,
    snowRemoval: 71,
    garbage: 71,
    
    // Unit rents
    studioRent: 500,
    oneBedRent: 574,
    twoBedRent: 641,
    threeBedRent: 735
  });

  // Pro Forma data (separate from current)
  const [proFormaData, setProFormaData] = useState({
    purchasePrice: 3495000,
    units: 49,
    grossPotentialRent: 435900,
    downPayment: 2163928,
    loanAmount: 1331072,
    interestRate: 4.96,
    vacancyRate: 5.0,
    managementFeeRate: 10.0,
    maintenanceRate: 6.2,
    capexRate: 3.5,
    realEstateTaxes: 17889,
    insurance: 28415,
    contractServices: 8329,
    turnover: 8575,
    generalAdmin: 2148,
    operatingReserves: 12250,
    water: 426,
    sewer: 284,
    gas: 355,
    electric: 213,
    snowRemoval: 71,
    garbage: 71,
    studioRent: 500,
    oneBedRent: 574,
    twoBedRent: 641,
    threeBedRent: 735
  });

  // Exit cap rate for valuation analysis
  const [exitCapRate, setExitCapRate] = useState(6.5);

  // State property tax features
  const [selectedState, setSelectedState] = useState('');
  const [useStateRate, setUseStateRate] = useState(false);

  const STATE_TAX_RATES = {
    'Alabama': 0.39, 'Alaska': 1.02, 'Arizona': 0.49, 'Arkansas': 0.54, 'California': 0.71,
    'Colorado': 0.46, 'Connecticut': 1.78, 'Delaware': 0.57, 'Florida': 0.88, 'Georgia': 0.87,
    'Hawaii': 0.28, 'Idaho': 0.69, 'Illinois': 1.95, 'Indiana': 0.85, 'Iowa': 1.50,
    'Kansas': 1.41, 'Kentucky': 0.82, 'Louisiana': 0.55, 'Maine': 1.09, 'Maryland': 1.09,
    'Massachusetts': 1.14, 'Michigan': 1.31, 'Minnesota': 1.05, 'Mississippi': 0.80,
    'Missouri': 0.97, 'Montana': 0.83, 'Nebraska': 1.54, 'Nevada': 0.44, 'New Hampshire': 1.89,
    'New Jersey': 2.08, 'New Mexico': 0.75, 'New York': 1.38, 'North Carolina': 0.84,
    'North Dakota': 0.98, 'Ohio': 1.52, 'Oklahoma': 1.09, 'Oregon': 0.90, 'Pennsylvania': 1.35,
    'Rhode Island': 1.37, 'South Carolina': 0.50, 'South Dakota': 1.14, 'Tennessee': 0.67,
    'Texas': 1.80, 'Utah': 0.58, 'Vermont': 1.78, 'Virginia': 0.82, 'Washington': 0.93,
    'West Virginia': 0.58, 'Wisconsin': 1.53, 'Wyoming': 0.61
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    if (useStateRate && STATE_TAX_RATES[state]) {
      const estimatedTax = (proFormaData.purchasePrice * STATE_TAX_RATES[state] / 100) || 0;
      updateProFormaData('realEstateTaxes', estimatedTax.toFixed(0));
    }
  };

  // Calculate total utilities
  const totalUtilities = financialData.water + financialData.sewer + financialData.gas + financialData.electric + financialData.snowRemoval + financialData.garbage;
  const proFormaTotalUtilities = proFormaData.water + proFormaData.sewer + proFormaData.gas + proFormaData.electric + proFormaData.snowRemoval + proFormaData.garbage;

  // Calculate monthly P&I payment for loan factor rate
  const monthlyPI = (financialData.loanAmount * (financialData.interestRate / 100 / 12)) / (1 - Math.pow(1 + (financialData.interestRate / 100 / 12), -360));
  const proFormaMonthlyPI = (proFormaData.loanAmount * (proFormaData.interestRate / 100 / 12)) / (1 - Math.pow(1 + (proFormaData.interestRate / 100 / 12), -360));
  
  // Calculate loan factor rate: (Monthly P&I * 12) / Loan Amount * 100
  const loanFactorRate = ((monthlyPI * 12) / financialData.loanAmount) * 100;
  const proFormaLoanFactorRate = ((proFormaMonthlyPI * 12) / proFormaData.loanAmount) * 100;

  // Calculate derived values for current data
  const calculations = {
    effectiveGrossIncome: financialData.grossPotentialRent * (1 - financialData.vacancyRate / 100),
    managementFee: financialData.grossPotentialRent * (financialData.managementFeeRate / 100),
    maintenanceExpense: financialData.grossPotentialRent * (financialData.maintenanceRate / 100),
    capexExpense: financialData.grossPotentialRent * (financialData.capexRate / 100),
    debtService: monthlyPI * 12
  };

  // Calculate derived values for pro forma
  const proFormaCalcs = {
    effectiveGrossIncome: proFormaData.grossPotentialRent * (1 - proFormaData.vacancyRate / 100),
    managementFee: proFormaData.grossPotentialRent * (proFormaData.managementFeeRate / 100),
    maintenanceExpense: proFormaData.grossPotentialRent * (proFormaData.maintenanceRate / 100),
    capexExpense: proFormaData.grossPotentialRent * (proFormaData.capexRate / 100),
    debtService: proFormaMonthlyPI * 12
  };

  const totalExpenses = 
    financialData.realEstateTaxes +
    financialData.insurance +
    totalUtilities +
    financialData.contractServices +
    financialData.turnover +
    financialData.generalAdmin +
    financialData.operatingReserves +
    calculations.managementFee +
    calculations.maintenanceExpense +
    calculations.capexExpense;

  const proFormaTotalExpenses =
    proFormaData.realEstateTaxes +
    proFormaData.insurance +
    proFormaTotalUtilities +
    proFormaData.contractServices +
    proFormaData.turnover +
    proFormaData.generalAdmin +
    proFormaData.operatingReserves +
    proFormaCalcs.managementFee +
    proFormaCalcs.maintenanceExpense +
    proFormaCalcs.capexExpense;

  const netOperatingIncome = calculations.effectiveGrossIncome - totalExpenses;
  const proFormaNOI = proFormaCalcs.effectiveGrossIncome - proFormaTotalExpenses;
  
  const capRate = (netOperatingIncome / financialData.purchasePrice) * 100;
  const proFormaCapRate = (proFormaNOI / proFormaData.purchasePrice) * 100;
  
  const cashFlow = netOperatingIncome - calculations.debtService;
  const proFormaCashFlow = proFormaNOI - proFormaCalcs.debtService;
  
  const cashOnCash = (cashFlow / financialData.downPayment) * 100;
  const proFormaCashOnCash = (proFormaCashFlow / proFormaData.downPayment) * 100;
  
  const roi = ((cashFlow + (financialData.purchasePrice * 0.03)) / financialData.downPayment) * 100; // Assuming 3% appreciation
  const proFormaROI = ((proFormaCashFlow + (proFormaData.purchasePrice * 0.03)) / proFormaData.downPayment) * 100;

  // Calculate weighted average rents for valuation
  const currentWeightedRent = (
    (financialData.studioRent * 11) + 
    (financialData.oneBedRent * 11) + 
    (financialData.twoBedRent * 24) + 
    (financialData.threeBedRent * 3)
  ) / 49;
  
  const proFormaWeightedRent = (
    (proFormaData.studioRent * 11) + 
    (proFormaData.oneBedRent * 11) + 
    (proFormaData.twoBedRent * 24) + 
    (proFormaData.threeBedRent * 3)
  ) / 49;
  
  const rentIncrease = proFormaWeightedRent - currentWeightedRent;
  const annualRentIncrease = rentIncrease * 12;
  const totalValueAdd = (annualRentIncrease / (exitCapRate / 100)) * financialData.units;

  // Export to PDF function
  const exportToPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${propertyName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.pdf`);
    } catch (error) {
      alert('PDF export requires: npm install jspdf html2canvas\n\nPlease install these packages first.');
    }
  };

  // Unit distribution from PDF
  const unitMix = [
    { type: 'Studio', units: 11, percentage: 22.4, rent: financialData.studioRent, color: '#8b5cf6' },
    { type: '1 Bedroom', units: 11, percentage: 22.4, rent: financialData.oneBedRent, color: '#06b6d4' },
    { type: '2 Bedroom', units: 24, percentage: 49.0, rent: financialData.twoBedRent, color: '#10b981' },
    { type: '3 Bedroom', units: 3, percentage: 6.1, rent: financialData.threeBedRent, color: '#f59e0b' }
  ];

  const proFormaUnitMix = [
    { type: 'Studio', units: 11, percentage: 22.4, rent: proFormaData.studioRent, color: '#8b5cf6' },
    { type: '1 Bedroom', units: 11, percentage: 22.4, rent: proFormaData.oneBedRent, color: '#06b6d4' },
    { type: '2 Bedroom', units: 24, percentage: 49.0, rent: proFormaData.twoBedRent, color: '#10b981' },
    { type: '3 Bedroom', units: 3, percentage: 6.1, rent: proFormaData.threeBedRent, color: '#f59e0b' }
  ];

  // Utilities breakdown for pie chart
  const utilitiesData = [
    { name: 'Water', value: financialData.water, color: '#3b82f6' },
    { name: 'Sewer', value: financialData.sewer, color: '#8b5cf6' },
    { name: 'Gas', value: financialData.gas, color: '#f59e0b' },
    { name: 'Electric', value: financialData.electric, color: '#eab308' },
    { name: 'Snow Removal', value: financialData.snowRemoval, color: '#06b6d4' },
    { name: 'Garbage', value: financialData.garbage, color: '#10b981' }
  ];

  const proFormaUtilitiesData = [
    { name: 'Water', value: proFormaData.water, color: '#3b82f6' },
    { name: 'Sewer', value: proFormaData.sewer, color: '#8b5cf6' },
    { name: 'Gas', value: proFormaData.gas, color: '#f59e0b' },
    { name: 'Electric', value: proFormaData.electric, color: '#eab308' },
    { name: 'Snow Removal', value: proFormaData.snowRemoval, color: '#06b6d4' },
    { name: 'Garbage', value: proFormaData.garbage, color: '#10b981' }
  ];

  // Expense breakdown for pie chart
  const expenseData = [
    { name: 'Management Fee', value: calculations.managementFee, color: '#ef4444' },
    { name: 'Insurance', value: financialData.insurance, color: '#f97316' },
    { name: 'Maintenance', value: calculations.maintenanceExpense, color: '#eab308' },
    { name: 'Real Estate Taxes', value: financialData.realEstateTaxes, color: '#22c55e' },
    { name: 'CapEx', value: calculations.capexExpense, color: '#3b82f6' },
    { name: 'Operating Reserves', value: financialData.operatingReserves, color: '#8b5cf6' },
    { name: 'Turnover', value: financialData.turnover, color: '#06b6d4' },
    { name: 'Contract Services', value: financialData.contractServices, color: '#84cc16' },
    { name: 'General Admin', value: financialData.generalAdmin, color: '#f59e0b' },
    { name: 'Utilities', value: totalUtilities, color: '#ec4899' }
  ];

  const proFormaExpenseData = [
    { name: 'Management Fee', value: proFormaCalcs.managementFee, color: '#ef4444' },
    { name: 'Insurance', value: proFormaData.insurance, color: '#f97316' },
    { name: 'Maintenance', value: proFormaCalcs.maintenanceExpense, color: '#eab308' },
    { name: 'Real Estate Taxes', value: proFormaData.realEstateTaxes, color: '#22c55e' },
    { name: 'CapEx', value: proFormaCalcs.capexExpense, color: '#3b82f6' },
    { name: 'Operating Reserves', value: proFormaData.operatingReserves, color: '#8b5cf6' },
    { name: 'Turnover', value: proFormaData.turnover, color: '#06b6d4' },
    { name: 'Contract Services', value: proFormaData.contractServices, color: '#84cc16' },
    { name: 'General Admin', value: proFormaData.generalAdmin, color: '#f59e0b' },
    { name: 'Utilities', value: proFormaTotalUtilities, color: '#ec4899' }
  ];

  // AI Deal Analysis
  const dealScore = (() => {
    let score = 0;
    const reasons = [];
    
    // Cap Rate Analysis (25 points)
    if (capRate >= 8) { score += 25; reasons.push("Excellent cap rate of " + capRate.toFixed(2) + "%"); }
    else if (capRate >= 6.5) { score += 20; reasons.push("Good cap rate of " + capRate.toFixed(2) + "%"); }
    else if (capRate >= 5) { score += 15; reasons.push("Moderate cap rate of " + capRate.toFixed(2) + "%"); }
    else { score += 5; reasons.push("Low cap rate of " + capRate.toFixed(2) + "% - concerning"); }
    
    // Cash on Cash Analysis (25 points)
    if (cashOnCash >= 12) { score += 25; reasons.push("Exceptional cash-on-cash return of " + cashOnCash.toFixed(2) + "%"); }
    else if (cashOnCash >= 8) { score += 20; reasons.push("Strong cash-on-cash return of " + cashOnCash.toFixed(2) + "%"); }
    else if (cashOnCash >= 6) { score += 15; reasons.push("Decent cash-on-cash return of " + cashOnCash.toFixed(2) + "%"); }
    else if (cashOnCash >= 0) { score += 10; reasons.push("Positive but low cash-on-cash return of " + cashOnCash.toFixed(2) + "%"); }
    else { score += 0; reasons.push("Negative cash flow - significant concern"); }
    
    // Leverage Analysis (20 points)
    const leverageSpread = capRate - loanFactorRate;
    if (leverageSpread >= 2) { score += 20; reasons.push("Excellent positive leverage spread of " + leverageSpread.toFixed(2) + "%"); }
    else if (leverageSpread >= 1) { score += 15; reasons.push("Good positive leverage of " + leverageSpread.toFixed(2) + "%"); }
    else if (leverageSpread >= 0) { score += 10; reasons.push("Minimal positive leverage of " + leverageSpread.toFixed(2) + "%"); }
    else { score += 0; reasons.push("Negative leverage - debt service exceeds cap rate"); }
    
    // Value-Add Potential (20 points)
    if (totalValueAdd >= 500000) { score += 20; reasons.push("Significant value-add opportunity of $" + (totalValueAdd/1000).toFixed(0) + "K"); }
    else if (totalValueAdd >= 250000) { score += 15; reasons.push("Good value-add potential of $" + (totalValueAdd/1000).toFixed(0) + "K"); }
    else if (totalValueAdd >= 100000) { score += 10; reasons.push("Moderate value-add opportunity of $" + (totalValueAdd/1000).toFixed(0) + "K"); }
    else if (totalValueAdd > 0) { score += 5; reasons.push("Limited value-add potential"); }
    else { score += 0; reasons.push("No immediate value-add opportunity identified"); }
    
    // Price per Unit Analysis (10 points)
    const pricePerUnit = financialData.purchasePrice / financialData.units;
    if (pricePerUnit <= 60000) { score += 10; reasons.push("Attractive price per unit of $" + (pricePerUnit/1000).toFixed(0) + "K"); }
    else if (pricePerUnit <= 80000) { score += 7; reasons.push("Reasonable price per unit of $" + (pricePerUnit/1000).toFixed(0) + "K"); }
    else if (pricePerUnit <= 100000) { score += 5; reasons.push("Higher price per unit of $" + (pricePerUnit/1000).toFixed(0) + "K"); }
    else { score += 2; reasons.push("Expensive price per unit of $" + (pricePerUnit/1000).toFixed(0) + "K"); }
    
    return { score, reasons };
  })();
  
  const getDealRecommendation = (score) => {
    if (score >= 85) return { text: "STRONG BUY", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
    else if (score >= 70) return { text: "BUY", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" };
    else if (score >= 55) return { text: "CONSIDER", color: "#eab308", bg: "rgba(234, 179, 8, 0.1)" };
    else if (score >= 40) return { text: "CAUTION", color: "#f97316", bg: "rgba(249, 115, 22, 0.1)" };
    else return { text: "AVOID", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
  };
  
  const recommendation = getDealRecommendation(dealScore.score);

  // Enhanced geocoding function with better accuracy
  const geocodeAddress = async (address) => {
    try {
      if (!address || address.trim().length === 0) {
        console.warn('No address provided for geocoding');
        return { lat: 39.8283, lng: -98.5795 };
      }
      
      // Clean and normalize the address for better accuracy
      const cleanAddress = address.trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s,.-]/g, '')
        .replace(/\b(apt|apartment|unit|suite|ste|#)\s*\w*\d*\w*$/i, '');
      
      console.log('Geocoding cleaned address:', cleanAddress);
      
      // Multiple geocoding attempts for better accuracy
      const geocodingStrategies = [
        // Strategy 1: Full address with detailed parameters
        {
          url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}&limit=3&addressdetails=1&countrycodes=us&extratags=1&namedetails=1`,
          name: 'Full Address Detailed'
        },
        // Strategy 2: Standard full address
        {
          url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}&limit=1&addressdetails=1&countrycodes=us`,
          name: 'Full Address Standard'
        }
      ];
      
      // Try each strategy
      for (const strategy of geocodingStrategies) {
        try {
          console.log(`Trying ${strategy.name} for:`, cleanAddress);
          
          const response = await fetch(strategy.url, {
            headers: { 'User-Agent': 'RealEstateAnalyzer/1.0' }
          });
          
          if (!response.ok) continue;
          
          const data = await response.json();
          
          if (data && data.length > 0) {
            // Find the best result (prefer house numbers over general areas)
            const bestResult = data.find(result => 
              result.type === 'house' || 
              result.type === 'building' || 
              result.class === 'building'
            ) || data[0];
            
            const coordinates = {
              lat: parseFloat(bestResult.lat),
              lng: parseFloat(bestResult.lon)
            };
            
            // Validate coordinates are in US bounds
            if (coordinates.lat >= 25.0 && coordinates.lat <= 49.0 && 
                coordinates.lng >= -125.0 && coordinates.lng <= -66.0) {
              
              console.log(`${strategy.name} geocoding successful:`, {
                address: cleanAddress,
                coordinates: coordinates,
                displayName: bestResult.display_name,
                type: bestResult.type
              });
              
              return coordinates;
            }
          }
        } catch (strategyError) {
          console.warn(`${strategy.name} failed:`, strategyError);
          continue;
        }
      }
      
      // Fallback: City/State search
      const addressParts = cleanAddress.split(',');
      if (addressParts.length >= 2) {
        const cityState = addressParts.slice(-2).join(',').trim();
        console.log('Trying city/state fallback:', cityState);
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityState)}&limit=1&addressdetails=1&countrycodes=us`,
            { headers: { 'User-Agent': 'RealEstateAnalyzer/1.0' } }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              const coordinates = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
              };
              
              console.log('City/state fallback successful:', coordinates);
              return coordinates;
            }
          }
        } catch (error) {
          console.error('City/state fallback error:', error);
        }
      }
      
      // Final fallback
      console.warn('All geocoding attempts failed, using US center coordinates');
      return { lat: 39.8283, lng: -98.5795 };
      
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: 39.8283, lng: -98.5795 };
    }
  };

  // Save property to dashboard function
  const savePropertyToDashboard = async () => {
    console.log('Attempting to save property:', { propertyName, propertyAddress });
    
    // Validate property details
    if (!propertyName.trim()) {
      alert('Please enter a property name before saving.');
      return;
    }
    
    if (!propertyAddress.trim()) {
      alert('Please enter a property address before saving.');
      return;
    }
    
    // Show loading message
    const originalAlert = window.alert;
    const loadingMessage = 'Geocoding address and saving property...';
    
    // Create a temporary loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(30, 41, 59, 0.95);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: system-ui;
      text-align: center;
      border: 2px solid #06b6d4;
    `;
    loadingDiv.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 10px;">📍 Geocoding Address...</div>
      <div style="font-size: 14px; color: #94a3b8;">Please wait while we locate your property</div>
    `;
    document.body.appendChild(loadingDiv);
    
    try {
      const propertyId = Date.now();
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Get coordinates for map with improved error handling
      console.log('Starting geocoding for address:', propertyAddress.trim());
      const coordinates = await geocodeAddress(propertyAddress.trim());
      console.log('Geocoded coordinates:', coordinates);
      
      // Update loading message
      loadingDiv.innerHTML = `
        <div style="font-size: 16px; margin-bottom: 10px;">✅ Address Located!</div>
        <div style="font-size: 14px; color: #94a3b8;">Saving property to dashboard...</div>
      `;
      
      // Small delay to show the success message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save in dashboard format (flat structure for list/map display)
      const dashboardProperty = {
        id: propertyId,
        name: propertyName.trim(),
        address: propertyAddress.trim(),
        units: financialData.units,
        purchasePrice: financialData.purchasePrice,
        capRate: parseFloat(capRate.toFixed(2)),
        cashOnCash: parseFloat(cashOnCash.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        noi: parseFloat(netOperatingIncome.toFixed(0)),
        dateSaved: currentDate,
        status: 'Under Analysis',
        // Add coordinates for map
        lat: coordinates.lat,
        lng: coordinates.lng
      };
      
      console.log('Dashboard property data:', dashboardProperty);
    
      // Save detailed analysis data separately (for results page view)
      const detailedAnalysis = {
        id: propertyId,
        name: propertyName.trim(),
        address: propertyAddress.trim(),
        
        // All financial data for exact results page recreation
        financialData: { ...financialData },
        proFormaData: { ...proFormaData },
        
        // Calculated values
        calculations: {
          totalUtilities,
          monthlyPI,
          loanFactorRate,
          calculations,
          proFormaCalcs,
          totalExpenses,
          proFormaTotalExpenses,
          netOperatingIncome,
          proFormaNOI,
          capRate,
          proFormaCapRate,
          cashFlow,
          proFormaCashFlow,
          cashOnCash,
          proFormaCashOnCash,
          roi,
          proFormaROI,
          currentWeightedRent,
          proFormaWeightedRent,
          rentIncrease,
          totalValueAdd,
          exitCapRate
        },
        
        // Deal analysis
        dealScore: dealScore,
        recommendation: recommendation,
        
        // Save date
        savedDate: new Date().toISOString()
      };
      
      // Get existing data
      const existingProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      const existingDetailedAnalyses = JSON.parse(localStorage.getItem('detailedAnalyses') || '[]');
      
      console.log('Existing properties:', existingProperties.length);
      console.log('Existing detailed analyses:', existingDetailedAnalyses.length);
      
      // Add new property to both
      existingProperties.push(dashboardProperty);
      existingDetailedAnalyses.push(detailedAnalysis);
      
      // Save both to localStorage
      localStorage.setItem('savedProperties', JSON.stringify(existingProperties));
      localStorage.setItem('detailedAnalyses', JSON.stringify(existingDetailedAnalyses));
      
      console.log('Property saved successfully');
      
      // Remove loading indicator
      document.body.removeChild(loadingDiv);
      
      // Show success message with coordinates info
      const coordsText = `Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)}`;
      alert(`Property saved successfully! 

"${propertyName.trim()}" has been added to your dashboard.

📍 Address: ${propertyAddress.trim()}
🗺️ Map Coordinates: ${coordsText}

The property will appear on your dashboard map at the geocoded location.`);
      
      // Navigate to dashboard
      setCurrentPage('dashboard');
      
    } catch (error) {
      console.error('Error saving property:', error);
      
      // Remove loading indicator if it exists
      if (document.body.contains(loadingDiv)) {
        document.body.removeChild(loadingDiv);
      }
      
      // Show detailed error message
      let errorMessage = 'Error saving property. ';
      if (error.message.includes('Geocoding')) {
        errorMessage += 'There was an issue finding the exact location of your address. The property will be saved with approximate coordinates. ';
      }
      errorMessage += 'Please check the console for details and try again.';
      
      alert(errorMessage);
    }
  };

  const updateFinancialData = (field, value) => {
    setFinancialData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const updateProFormaData = (field, value) => {
    setProFormaData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const copyToProForma = () => {
    setProFormaData({ ...financialData });
  };

  const PieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div style={{ 
        background: '#1e293b', 
        borderRadius: '12px', 
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: 'white', 
          marginBottom: '16px', 
          textAlign: 'center' 
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage * 2.51} 251.2`;
                const strokeDashoffset = -cumulativePercentage * 2.51;
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx="100"
                    cy="100"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                );
              })}
            </svg>
            <div style={{ 
              position: 'absolute', 
              inset: '0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>
                  ${(total/1000).toFixed(0)}K
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ 
          marginTop: '16px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '8px', 
          fontSize: '0.75rem' 
        }}>
          {data.slice(0, 6).map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '2px', 
                backgroundColor: item.color 
              }}></div>
              <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SliderControl = ({ label, value, onChange, min = 0, max = 15, step = 0.1, unit = '%' }) => (
    <div style={{ 
      background: '#374151', 
      borderRadius: '8px', 
      padding: '16px' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '8px' 
      }}>
        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1' }}>
          {label}
        </label>
        <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '8px',
          background: '#4b5563',
          borderRadius: '8px',
          appearance: 'none',
          cursor: 'pointer'
        }}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '0.75rem', 
        color: '#94a3b8', 
        marginTop: '4px' 
      }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      color: 'white' 
    }}>
      <div ref={printRef} style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => setCurrentPage('financing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            <ArrowLeft size={16} /> Back to Financing
          </button>
          <button
            onClick={exportToPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(to right, #0891b2, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Download size={16} /> Export to PDF
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Investment Analysis Results
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '8px' }}>
              Enter property details to save this analysis
            </div>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Enter property name"
              style={{
                background: '#374151',
                color: 'white',
                border: '1px solid #4b5563',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '1.125rem',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
              }}
            />
            <input
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="Enter full property address (e.g., 123 Main St, City, State, ZIP)"
              style={{
                background: '#374151',
                color: 'white',
                border: '1px solid #4b5563',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '1rem',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', maxWidth: '400px' }}>
  💡         Tip: Include full address with street, city, state, and ZIP code for most accurate map placement
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          <div style={{
            background: 'linear-gradient(to right, #059669, #047857)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <DollarSign style={{ margin: '0 auto 8px', color: 'white' }} size={24} />
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{capRate.toFixed(2)}%</div>
            <div style={{ color: '#bbf7d0', fontSize: '0.875rem' }}>Cap Rate</div>
          </div>
          <div style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <TrendingUp style={{ margin: '0 auto 8px', color: 'white' }} size={24} />
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{cashOnCash.toFixed(2)}%</div>
            <div style={{ color: '#bfdbfe', fontSize: '0.875rem' }}>Cash on Cash</div>
          </div>
          <div style={{
            background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <Calculator style={{ margin: '0 auto 8px', color: 'white' }} size={24} />
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{roi.toFixed(2)}%</div>
            <div style={{ color: '#ddd6fe', fontSize: '0.875rem' }}>ROI</div>
          </div>
          <div style={{
            background: 'linear-gradient(to right, #ea580c, #dc2626)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <Home style={{ margin: '0 auto 8px', color: 'white' }} size={24} />
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${(netOperatingIncome/1000).toFixed(0)}K</div>
            <div style={{ color: '#fed7aa', fontSize: '0.875rem' }}>Annual NOI</div>
          </div>
          <div style={{
            background: 'linear-gradient(to right, #0891b2, #0e7490)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <BarChart3 style={{ margin: '0 auto 8px', color: 'white' }} size={24} />
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{loanFactorRate.toFixed(2)}%</div>
            <div style={{ color: '#a5f3fc', fontSize: '0.875rem' }}>Loan Factor Rate</div>
          </div>
          <div style={{
            background: 'linear-gradient(to right, #4338ca, #3730a3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <Users style={{ margin: '0 auto 8px', color: 'white' }} size={24} />
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${(financialData.purchasePrice/financialData.units/1000).toFixed(0)}K</div>
            <div style={{ color: '#c7d2fe', fontSize: '0.875rem' }}>Price/Unit</div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px' 
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <BarChart3 style={{ color: '#06b6d4' }} />
            Live Analysis Controls
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px' 
          }}>
            <SliderControl
              label="Vacancy Rate"
              value={financialData.vacancyRate}
              onChange={(value) => updateFinancialData('vacancyRate', value)}
            />
            <SliderControl
              label="Property Management"
              value={financialData.managementFeeRate}
              onChange={(value) => updateFinancialData('managementFeeRate', value)}
            />
            <SliderControl
              label="Maintenance Rate"
              value={financialData.maintenanceRate}
              onChange={(value) => updateFinancialData('maintenanceRate', value)}
            />
            <SliderControl
              label="CapEx Rate"
              value={financialData.capexRate}
              onChange={(value) => updateFinancialData('capexRate', value)}
            />
          </div>
        </div>

        {/* Pro Forma Section */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '24px' 
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <Edit3 style={{ color: '#ea580c' }} />
              Pro Forma Analysis
            </h2>
            <button
              onClick={copyToProForma}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#4b5563',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#6b7280'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4b5563'}
            >
              <Copy size={16} /> Copy Current to Pro Forma
            </button>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '32px' 
          }}>
            {/* Current Analysis Column */}
            <div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: '#06b6d4' 
              }}>
                Current Analysis
              </h3>
              <div style={{ 
                background: '#374151', 
                borderRadius: '8px', 
                padding: '16px', 
                fontSize: '0.875rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: '600', 
                  color: '#10b981', 
                  marginBottom: '12px' 
                }}>
                  <span>Gross Potential Rent</span>
                  <span>${financialData.grossPotentialRent.toLocaleString()}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  color: '#ef4444' 
                }}>
                  <span>Vacancy Loss ({financialData.vacancyRate.toFixed(1)}%)</span>
                  <span>-${((financialData.grossPotentialRent * financialData.vacancyRate / 100)).toLocaleString()}</span>
                </div>
                <div style={{ 
                  borderTop: '1px solid #4b5563', 
                  paddingTop: '8px', 
                  marginTop: '8px', 
                  marginBottom: '16px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: '600', 
                    color: '#10b981' 
                  }}>
                    <span>Effective Gross Income</span>
                    <span>${calculations.effectiveGrossIncome.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Real Estate Taxes</span>
                    <span>${financialData.realEstateTaxes.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Insurance</span>
                    <span>${financialData.insurance.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Utilities</span>
                    <span>${totalUtilities.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Contract Services</span>
                    <span>${financialData.contractServices.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Turnover</span>
                    <span>${financialData.turnover.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>General Admin</span>
                    <span>${financialData.generalAdmin.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Operating Reserves</span>
                    <span>${financialData.operatingReserves.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4' }}>
                    <span>Management ({financialData.managementFeeRate.toFixed(1)}%)</span>
                    <span>${calculations.managementFee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4' }}>
                    <span>Maintenance ({financialData.maintenanceRate.toFixed(1)}%)</span>
                    <span>${calculations.maintenanceExpense.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4' }}>
                    <span>CapEx ({financialData.capexRate.toFixed(1)}%)</span>
                    <span>${calculations.capexExpense.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={{ 
                  borderTop: '1px solid #4b5563', 
                  paddingTop: '12px', 
                  marginTop: '12px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: '600', 
                    color: '#ef4444' 
                  }}>
                    <span>Total Expenses</span>
                    <span>${totalExpenses.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#10b981', 
                    fontSize: '1.125rem', 
                    marginTop: '8px' 
                  }}>
                    <span>Net Operating Income</span>
                    <span>${netOperatingIncome.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#3b82f6', 
                    marginTop: '4px' 
                  }}>
                    <span>Cap Rate</span>
                    <span>{capRate.toFixed(2)}%</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#8b5cf6', 
                    marginTop: '4px' 
                  }}>
                    <span>Cash on Cash</span>
                    <span>{cashOnCash.toFixed(2)}%</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#ea580c', 
                    marginTop: '4px' 
                  }}>
                    <span>ROI</span>
                    <span>{roi.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Forma Column */}
            <div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: '#ea580c' 
              }}>
                Pro Forma (Editable)
              </h3>
              <div style={{ 
                background: '#374151', 
                borderRadius: '8px', 
                padding: '16px', 
                fontSize: '0.875rem' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: '600', 
                  color: '#10b981', 
                  marginBottom: '12px' 
                }}>
                  <span>Gross Potential Rent</span>
                  <input
                    type="number"
                    value={proFormaData.grossPotentialRent}
                    onChange={(e) => updateProFormaData('grossPotentialRent', e.target.value)}
                    style={{
                      background: '#4b5563',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      textAlign: 'right',
                      width: '100px'
                    }}
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  color: '#ef4444' 
                }}>
                  <span>Vacancy Loss</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={proFormaData.vacancyRate}
                      onChange={(e) => updateProFormaData('vacancyRate', e.target.value)}
                      style={{
                        background: '#4b5563',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        width: '64px'
                      }}
                      step="0.1"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div style={{ 
                  borderTop: '1px solid #4b5563', 
                  paddingTop: '8px', 
                  marginTop: '8px', 
                  marginBottom: '16px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: '600', 
                    color: '#10b981' 
                  }}>
                    <span>Effective Gross Income</span>
                    <span>${proFormaCalcs.effectiveGrossIncome.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Property Tax Section with State Rate Feature */}
                  <div style={{ 
                    background: '#475569', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    marginBottom: '8px' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '8px' 
                    }}>
                      <span style={{ fontWeight: '600', color: '#fbbf24' }}>Real Estate Taxes</span>
                      <input
                        type="number"
                        value={proFormaData.realEstateTaxes}
                        onChange={(e) => updateProFormaData('realEstateTaxes', e.target.value)}
                        style={{
                          background: '#4b5563',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          textAlign: 'right',
                          width: '100px'
                        }}
                      />
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '8px' 
                    }}>
                      <input
                        type="checkbox"
                        checked={useStateRate}
                        onChange={(e) => setUseStateRate(e.target.checked)}
                        style={{ width: '14px', height: '14px', accentColor: '#06b6d4' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Use state rate</span>
                    </div>

                    {useStateRate && (
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          background: '#4b5563',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      >
                        <option value="">Select state...</option>
                        {Object.keys(STATE_TAX_RATES).map(state => (
                          <option key={state} value={state}>
                            {state} ({STATE_TAX_RATES[state]}%)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {[
                    { label: 'Insurance', field: 'insurance' },
                    { label: 'Contract Services', field: 'contractServices' },
                    { label: 'Turnover', field: 'turnover' },
                    { label: 'General Admin', field: 'generalAdmin' },
                    { label: 'Operating Reserves', field: 'operatingReserves' }
                  ].map((expense) => (
                    <div key={expense.field} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{expense.label}</span>
                      <input
                        type="number"
                        value={proFormaData[expense.field]}
                        onChange={(e) => updateProFormaData(expense.field, e.target.value)}
                        style={{
                          background: '#4b5563',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          textAlign: 'right',
                          width: '100px'
                        }}
                      />
                    </div>
                  ))}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Utilities</span>
                    <span style={{ fontWeight: '600', color: '#eab308' }}>
                      ${proFormaTotalUtilities.toLocaleString()}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4' }}>
                    <span>Management Fee</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={proFormaData.managementFeeRate}
                        onChange={(e) => updateProFormaData('managementFeeRate', e.target.value)}
                        style={{
                          background: '#4b5563',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          width: '64px'
                        }}
                        step="0.1"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4' }}>
                    <span>Maintenance</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={proFormaData.maintenanceRate}
                        onChange={(e) => updateProFormaData('maintenanceRate', e.target.value)}
                        style={{
                          background: '#4b5563',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          width: '64px'
                        }}
                        step="0.1"
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06b6d4' }}>
                    <span>CapEx</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={proFormaData.capexRate}
                        onChange={(e) => updateProFormaData('capexRate', e.target.value)}
                        style={{
                          background: '#4b5563',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          width: '64px'
                        }}
                        step="0.1"
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  borderTop: '1px solid #4b5563', 
                  paddingTop: '12px', 
                  marginTop: '12px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: '600', 
                    color: '#ef4444' 
                  }}>
                    <span>Total Expenses</span>
                    <span>${proFormaTotalExpenses.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#10b981', 
                    fontSize: '1.125rem', 
                    marginTop: '8px' 
                  }}>
                    <span>Net Operating Income</span>
                    <span>${proFormaNOI.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#3b82f6', 
                    marginTop: '4px' 
                  }}>
                    <span>Cap Rate</span>
                    <span>{proFormaCapRate.toFixed(2)}%</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#8b5cf6', 
                    marginTop: '4px' 
                  }}>
                    <span>Cash on Cash</span>
                    <span>{proFormaCashOnCash.toFixed(2)}%</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#ea580c', 
                    marginTop: '4px' 
                  }}>
                    <span>ROI</span>
                    <span>{proFormaROI.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Rents Adjustment Section */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px' 
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <Home style={{ color: '#8b5cf6' }} />
            Unit Rent Adjustments (Pro Forma)
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px' 
          }}>
            {[
              { label: 'Studio Rent', field: 'studioRent', units: 11 },
              { label: '1 Bedroom Rent', field: 'oneBedRent', units: 11 },
              { label: '2 Bedroom Rent', field: 'twoBedRent', units: 24 },
              { label: '3 Bedroom Rent', field: 'threeBedRent', units: 3 }
            ].map((rent) => (
              <div key={rent.field} style={{ 
                background: '#374151', 
                borderRadius: '8px', 
                padding: '16px' 
              }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#cbd5e1', 
                  marginBottom: '8px' 
                }}>
                  {rent.label} ({rent.units} units)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>$</span>
                  <input
                    type="number"
                    value={proFormaData[rent.field]}
                    onChange={(e) => updateProFormaData(rent.field, e.target.value)}
                    style={{
                      background: '#4b5563',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      width: '100%'
                    }}
                  />
                  <span>/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilities Breakdown Section */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px' 
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <Zap style={{ color: '#eab308' }} />
            Utilities Breakdown (Pro Forma)
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '32px' 
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
                Current Utilities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {utilitiesData.map((utility) => (
                  <div key={utility.name} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: '#374151', 
                    padding: '12px', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '2px', 
                        backgroundColor: utility.color 
                      }}></div>
                      <span>{utility.name}</span>
                    </div>
                    <span style={{ fontWeight: '600' }}>${utility.value}</span>
                  </div>
                ))}
                <div style={{ 
                  borderTop: '1px solid #4b5563', 
                  paddingTop: '12px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#eab308' 
                  }}>
                    <span>Total Utilities</span>
                    <span>${totalUtilities}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
                Pro Forma Utilities (Editable)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Water', field: 'water', color: '#3b82f6' },
                  { label: 'Sewer', field: 'sewer', color: '#8b5cf6' },
                  { label: 'Gas', field: 'gas', color: '#f59e0b' },
                  { label: 'Electric', field: 'electric', color: '#eab308' },
                  { label: 'Snow Removal', field: 'snowRemoval', color: '#06b6d4' },
                  { label: 'Garbage', field: 'garbage', color: '#10b981' }
                ].map((utility) => (
                  <div key={utility.field} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: '#374151', 
                    padding: '12px', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '2px', 
                        backgroundColor: utility.color 
                      }}></div>
                      <span>{utility.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>$</span>
                      <input
                        type="number"
                        value={proFormaData[utility.field]}
                        onChange={(e) => updateProFormaData(utility.field, e.target.value)}
                        style={{
                          background: '#4b5563',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          width: '80px'
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div style={{ 
                  borderTop: '1px solid #4b5563', 
                  paddingTop: '12px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    color: '#eab308' 
                  }}>
                    <span>Total Pro Forma Utilities</span>
                    <span>${proFormaTotalUtilities}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Utilities Breakdown Charts */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '32px', 
          marginBottom: '32px' 
        }}>
          <PieChart data={utilitiesData} title="Current Utilities Breakdown" />
          <PieChart data={proFormaUtilitiesData} title="Pro Forma Utilities Breakdown" />
        </div>

        {/* Side-by-Side Comparison Charts */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px' 
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '24px', 
            textAlign: 'center' 
          }}>
            Expense Comparison
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '32px' 
          }}>
            <PieChart data={expenseData} title="Current Total Expenses" />
            <PieChart data={proFormaExpenseData} title="Pro Forma Total Expenses" />
          </div>
        </div>

        {/* Comparison Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            background: '#1e293b', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
              NOI Comparison
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#06b6d4' }}>
                Current: ${(netOperatingIncome/1000).toFixed(0)}K
              </div>
              <div style={{ color: '#ea580c' }}>
                Pro Forma: ${(proFormaNOI/1000).toFixed(0)}K
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                color: (proFormaNOI - netOperatingIncome) >= 0 ? '#10b981' : '#ef4444' 
              }}>
                Difference: ${((proFormaNOI - netOperatingIncome)/1000).toFixed(0)}K
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: '#1e293b', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
              Cap Rate Comparison
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#06b6d4' }}>
                Current: {capRate.toFixed(2)}%
              </div>
              <div style={{ color: '#ea580c' }}>
                Pro Forma: {proFormaCapRate.toFixed(2)}%
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                color: (proFormaCapRate - capRate) >= 0 ? '#10b981' : '#ef4444' 
              }}>
                Difference: {(proFormaCapRate - capRate).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: '#1e293b', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
              Cash on Cash
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#06b6d4' }}>
                Current: {cashOnCash.toFixed(2)}%
              </div>
              <div style={{ color: '#ea580c' }}>
                Pro Forma: {proFormaCashOnCash.toFixed(2)}%
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                color: (proFormaCashOnCash - cashOnCash) >= 0 ? '#10b981' : '#ef4444' 
              }}>
                Difference: {(proFormaCashOnCash - cashOnCash).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: '#1e293b', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
              ROI Comparison
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#06b6d4' }}>
                Current: {roi.toFixed(2)}%
              </div>
              <div style={{ color: '#ea580c' }}>
                Pro Forma: {proFormaROI.toFixed(2)}%
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                color: (proFormaROI - roi) >= 0 ? '#10b981' : '#ef4444' 
              }}>
                Difference: {(proFormaROI - roi).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: '#1e293b', 
            borderRadius: '12px', 
            padding: '24px', 
            textAlign: 'center' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
              Leverage Analysis
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#06b6d4' }}>
                Cap Rate: {capRate.toFixed(2)}%
              </div>
              <div style={{ color: '#ea580c' }}>
                Loan Factor: {loanFactorRate.toFixed(2)}%
              </div>
              <div style={{ 
                fontWeight: 'bold', 
                color: (capRate - loanFactorRate) >= 0 ? '#10b981' : '#ef4444' 
              }}>
                {capRate > loanFactorRate ? '✓ Positive Leverage' : '✗ Negative Leverage'}
              </div>
            </div>
          </div>
        </div>

        {/* Unit Mix Details */}
        <div style={{ 
          background: '#1e293b', 
          borderRadius: '12px', 
          padding: '24px',
          marginBottom: '32px' 
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <Users style={{ color: '#8b5cf6' }} />
            Unit Mix & Current vs Pro Forma Rents
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px' 
          }}>
            {unitMix.map((unit, index) => (
              <div key={unit.type} style={{ 
                background: '#374151', 
                borderRadius: '8px', 
                padding: '16px', 
                textAlign: 'center' 
              }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '2px', 
                  backgroundColor: unit.color, 
                  margin: '0 auto 8px' 
                }}></div>
                <div style={{ fontWeight: '600' }}>{unit.type}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                  {unit.units}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                  units ({unit.percentage}%)
                </div>
                <div style={{ color: '#06b6d4', fontWeight: '600' }}>
                  Current: ${unit.rent}/mo
                </div>
                <div style={{ color: '#ea580c', fontWeight: '600' }}>
                  Pro Forma: ${proFormaUnitMix[index].rent}/mo
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Valuation Analysis Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
          borderRadius: '12px', 
          padding: '32px', 
          marginBottom: '32px',
          border: '1px solid #475569'
        }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: 'white'
          }}>
            <TrendingUp style={{ color: '#10b981' }} size={28} />
            Valuation Analysis
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* Value Add Calculation */}
            <div style={{ 
              background: '#374151', 
              borderRadius: '12px', 
              padding: '24px' 
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: '#10b981' 
              }}>
                Value-Add Calculation
              </h3>
              <div style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Current Avg Rent:</span>
                  <span>${currentWeightedRent.toFixed(0)}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Pro Forma Avg Rent:</span>
                  <span>${proFormaWeightedRent.toFixed(0)}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#06b6d4' }}>
                  <span>Monthly Rent Increase:</span>
                  <span>+${rentIncrease.toFixed(0)}/unit</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span>Exit Cap Rate:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={exitCapRate}
                      onChange={(e) => setExitCapRate(parseFloat(e.target.value) || 6.5)}
                      style={{
                        background: '#4b5563',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        width: '70px'
                      }}
                      step="0.1"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
              <div style={{ 
                borderTop: '1px solid #4b5563', 
                paddingTop: '16px' 
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#10b981', 
                  textAlign: 'center' 
                }}>
                  ${(totalValueAdd/1000).toFixed(0)}K
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#94a3b8', 
                  textAlign: 'center' 
                }}>
                  Total Value Add
                </div>
              </div>
            </div>
            
            {/* AI Deal Analysis */}
            <div style={{ 
              background: recommendation.bg,
              border: `2px solid ${recommendation.color}`,
              borderRadius: '12px', 
              padding: '24px' 
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: recommendation.color,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Calculator size={20} />
                AI Deal Analysis
              </h3>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '16px' 
              }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: recommendation.color 
                }}>
                  {recommendation.text}
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#cbd5e1' 
                }}>
                  Score: {dealScore.score}/100
                </div>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: '#374151', 
                borderRadius: '4px', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  width: `${dealScore.score}%`, 
                  height: '100%', 
                  background: `linear-gradient(to right, ${recommendation.color}, ${recommendation.color}aa)`, 
                  transition: 'width 0.5s ease' 
                }}></div>
              </div>
            </div>
          </div>
          
          {/* Detailed Analysis */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '24px' 
          }}>
            {/* Key Strengths */}
            <div style={{ 
              background: '#374151', 
              borderRadius: '12px', 
              padding: '24px' 
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ✓ Key Strengths
              </h3>
              <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                {dealScore.reasons.filter(reason => 
                  reason.includes('Excellent') || 
                  reason.includes('Strong') || 
                  reason.includes('Good') ||
                  reason.includes('Exceptional') ||
                  reason.includes('Significant')
                ).map((reason, index) => (
                  <div key={index} style={{ 
                    marginBottom: '8px', 
                    color: '#cbd5e1',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Areas of Concern */}
            <div style={{ 
              background: '#374151', 
              borderRadius: '12px', 
              padding: '24px' 
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⚠ Areas of Concern
              </h3>
              <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                {dealScore.reasons.filter(reason => 
                  reason.includes('Low') || 
                  reason.includes('Negative') || 
                  reason.includes('concerning') ||
                  reason.includes('Expensive') ||
                  reason.includes('Limited') ||
                  reason.includes('No immediate')
                ).map((reason, index) => (
                  <div key={index} style={{ 
                    marginBottom: '8px', 
                    color: '#cbd5e1',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#ef4444', flexShrink: 0 }}>•</span>
                    <span>{reason}</span>
                  </div>
                ))}
                {dealScore.reasons.filter(reason => 
                  reason.includes('Low') || 
                  reason.includes('Negative') || 
                  reason.includes('concerning') ||
                  reason.includes('Expensive') ||
                  reason.includes('Limited') ||
                  reason.includes('No immediate')
                ).length === 0 && (
                  <div style={{ color: '#10b981', fontStyle: 'italic' }}>
                    No major concerns identified with this investment.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Improvement Recommendations */}
          <div style={{ 
            background: '#374151', 
            borderRadius: '12px', 
            padding: '24px', 
            marginTop: '24px' 
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💡 Property Improvement Recommendations
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '16px',
              fontSize: '0.875rem'
            }}>
              <div style={{ 
                background: '#4b5563', 
                padding: '16px', 
                borderRadius: '8px',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                  Rent Optimization
                </div>
                <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                  Current rents appear below market. Consider phased rent increases of ${Math.max(50, Math.round(rentIncrease/2))}/month per unit over 12-18 months to reach market rates while minimizing vacancy.
                </div>
              </div>
              
              <div style={{ 
                background: '#4b5563', 
                padding: '16px', 
                borderRadius: '8px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <div style={{ fontWeight: '600', color: '#3b82f6', marginBottom: '8px' }}>
                  Unit Upgrades
                </div>
                <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                  Focus on high-impact, low-cost improvements: updated fixtures, fresh paint, modern light switches, and energy-efficient appliances to justify rent increases.
                </div>
              </div>
              
              <div style={{ 
                background: '#4b5563', 
                padding: '16px', 
                borderRadius: '8px',
                borderLeft: '4px solid #8b5cf6'
              }}>
                <div style={{ fontWeight: '600', color: '#8b5cf6', marginBottom: '8px' }}>
                  Expense Management
                </div>
                <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                  {financialData.managementFeeRate > 8 ? 
                    "Management fee of " + financialData.managementFeeRate.toFixed(1) + "% is high. Consider self-management or negotiate lower rates." :
                    "Utility costs of $" + totalUtilities + " should be analyzed for energy efficiency improvements and tenant billing opportunities."
                  }
                </div>
              </div>
              
              <div style={{ 
                background: '#4b5563', 
                padding: '16px', 
                borderRadius: '8px',
                borderLeft: '4px solid #ea580c'
              }}>
                <div style={{ fontWeight: '600', color: '#ea580c', marginBottom: '8px' }}>
                  Value-Add Strategy
                </div>
                <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                  {totalValueAdd > 300000 ? 
                    "Strong value-add potential justifies acquisition. Execute improvements systematically to capture $" + (totalValueAdd/1000).toFixed(0) + "K in additional value." :
                    "Limited immediate value-add opportunity. Focus on operational efficiency and gradual rent growth to improve returns."
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Projections Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
          borderRadius: '12px', 
          padding: '32px', 
          marginBottom: '32px',
          border: '1px solid #475569'
        }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: 'white',
            textAlign: 'center',
            justifyContent: 'center'
          }}>
            <Calculator style={{ color: '#3b82f6' }} size={28} />
            Financial Projections
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
            gap: '32px' 
          }}>
            {/* Year 1 Projections */}
            <div style={{ 
              background: '#374151', 
              borderRadius: '12px', 
              padding: '24px',
              border: '2px solid #06b6d4'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#06b6d4',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                📈 Year 1 Projections
              </h3>
              
              <div style={{ fontSize: '0.875rem', marginBottom: '16px', color: '#94a3b8', textAlign: 'center' }}>
                Assuming 2.5% rent growth, 3% expense growth
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Gross Potential Rent:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${(proFormaData.grossPotentialRent * 1.025).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Effective Gross Income:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${((proFormaData.grossPotentialRent * 1.025) * (1 - proFormaData.vacancyRate / 100)).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Total Operating Expenses:</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    ${(proFormaTotalExpenses * 1.03).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px',
                  background: '#1e293b',
                  borderRadius: '8px',
                  border: '2px solid #06b6d4'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Net Operating Income:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    ${(((proFormaData.grossPotentialRent * 1.025) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * 1.03)).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Annual Cash Flow:</span>
                  <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                    ${((((proFormaData.grossPotentialRent * 1.025) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * 1.03)) - proFormaCalcs.debtService).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Cap Rate:</span>
                  <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                    {(((((proFormaData.grossPotentialRent * 1.025) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * 1.03)) / proFormaData.purchasePrice) * 100).toFixed(2)}%
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Property Value (6.5% cap):</span>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                    ${((((proFormaData.grossPotentialRent * 1.025) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * 1.03)) / (exitCapRate / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Year 5 Projections */}
            <div style={{ 
              background: '#374151', 
              borderRadius: '12px', 
              padding: '24px',
              border: '2px solid #8b5cf6'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                🚀 Year 5 Projections
              </h3>
              
              <div style={{ fontSize: '0.875rem', marginBottom: '16px', color: '#94a3b8', textAlign: 'center' }}>
                Compound growth: 2.5% rent, 3% expenses annually
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Gross Potential Rent:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${(proFormaData.grossPotentialRent * Math.pow(1.025, 5)).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Effective Gross Income:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${((proFormaData.grossPotentialRent * Math.pow(1.025, 5)) * (1 - proFormaData.vacancyRate / 100)).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Total Operating Expenses:</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    ${(proFormaTotalExpenses * Math.pow(1.03, 5)).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '12px',
                  background: '#1e293b',
                  borderRadius: '8px',
                  border: '2px solid #8b5cf6'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Net Operating Income:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    ${(((proFormaData.grossPotentialRent * Math.pow(1.025, 5)) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * Math.pow(1.03, 5))).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Annual Cash Flow:</span>
                  <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                    ${((((proFormaData.grossPotentialRent * Math.pow(1.025, 5)) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * Math.pow(1.03, 5))) - proFormaCalcs.debtService).toLocaleString()}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Cap Rate:</span>
                  <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                    {(((((proFormaData.grossPotentialRent * Math.pow(1.025, 5)) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * Math.pow(1.03, 5))) / proFormaData.purchasePrice) * 100).toFixed(2)}%
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 12px',
                  background: '#4b5563',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Property Value (6.5% cap):</span>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                    ${((((proFormaData.grossPotentialRent * Math.pow(1.025, 5)) * (1 - proFormaData.vacancyRate / 100)) - (proFormaTotalExpenses * Math.pow(1.03, 5))) / (exitCapRate / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Comparison */}
          <div style={{ 
            marginTop: '32px',
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            border: '2px solid #10b981'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#10b981',
              textAlign: 'center'
            }}>
              📊 5-Year Investment Summary
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Total Cash Flow (5 Years)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  ${(() => {
                    let totalCashFlow = 0;
                    for (let year = 1; year <= 5; year++) {
                      const yearlyRent = proFormaData.grossPotentialRent * Math.pow(1.025, year);
                      const yearlyEGI = yearlyRent * (1 - proFormaData.vacancyRate / 100);
                      const yearlyExpenses = proFormaTotalExpenses * Math.pow(1.03, year);
                      const yearlyNOI = yearlyEGI - yearlyExpenses;
                      const yearlyCashFlow = yearlyNOI - proFormaCalcs.debtService;
                      totalCashFlow += yearlyCashFlow;
                    }
                    return totalCashFlow.toLocaleString();
                  })()}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Value-Add Realized
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#06b6d4' }}>
                  ${totalValueAdd.toLocaleString()}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Property Appreciation (3%/yr)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  ${(proFormaData.purchasePrice * (Math.pow(1.03, 5) - 1)).toLocaleString()}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Total Property Value (Year 5)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  ${(proFormaData.purchasePrice + totalValueAdd + (proFormaData.purchasePrice * (Math.pow(1.03, 5) - 1))).toLocaleString()}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Total Return (5 Years)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ec4899' }}>
                  ${(() => {
                    let totalCashFlow = 0;
                    for (let year = 1; year <= 5; year++) {
                      const yearlyRent = proFormaData.grossPotentialRent * Math.pow(1.025, year);
                      const yearlyEGI = yearlyRent * (1 - proFormaData.vacancyRate / 100);
                      const yearlyExpenses = proFormaTotalExpenses * Math.pow(1.03, year);
                      const yearlyNOI = yearlyEGI - yearlyExpenses;
                      const yearlyCashFlow = yearlyNOI - proFormaCalcs.debtService;
                      totalCashFlow += yearlyCashFlow;
                    }
                    const totalAppreciation = proFormaData.purchasePrice * (Math.pow(1.03, 5) - 1);
                    const totalEquityGain = (proFormaData.purchasePrice + totalValueAdd + totalAppreciation) - proFormaData.purchasePrice;
                    return (totalCashFlow + totalEquityGain).toLocaleString();
                  })()}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '4px' }}>
                  IRR (5 Years)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  {(() => {
                    let totalCashFlow = 0;
                    for (let year = 1; year <= 5; year++) {
                      const yearlyRent = proFormaData.grossPotentialRent * Math.pow(1.025, year);
                      const yearlyEGI = yearlyRent * (1 - proFormaData.vacancyRate / 100);
                      const yearlyExpenses = proFormaTotalExpenses * Math.pow(1.03, year);
                      const yearlyNOI = yearlyEGI - yearlyExpenses;
                      const yearlyCashFlow = yearlyNOI - proFormaCalcs.debtService;
                      totalCashFlow += yearlyCashFlow;
                    }
                    const finalPropertyValue = proFormaData.purchasePrice + totalValueAdd + (proFormaData.purchasePrice * (Math.pow(1.03, 5) - 1));
                    const totalReturn = totalCashFlow + (finalPropertyValue - proFormaData.purchasePrice);
                    const irr = (Math.pow((totalReturn + proFormaData.downPayment) / proFormaData.downPayment, 1/5) - 1) * 100;
                    return irr.toFixed(2);
                  })()}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          marginTop: '48px', 
          marginBottom: '24px' 
        }}>
          <button
            onClick={() => setCurrentPage('dealStructure')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 25%, #047857 75%, #065f46 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            <Edit3 size={20} />
            Generate Deal Structure & Documents
          </button>

          <button
            onClick={savePropertyToDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 25%, #1d4ed8 75%, #1e40af 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Home size={20} />
            Save Property
          </button>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0891b2;
        }
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid #0891b2;
        }
        
        /* Hide default spinners and create custom ones */
        input[type="number"] {
          -moz-appearance: textfield;
          position: relative;
          padding-right: 35px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        /* Create custom spinner container */
        input[type="number"] {
          background-image: 
            /* Up arrow */
            linear-gradient(45deg, transparent 30%, #64748b 30%, #64748b 70%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, #64748b 30%, #64748b 70%, transparent 70%),
            /* Down arrow */
            linear-gradient(-45deg, transparent 30%, #64748b 30%, #64748b 70%, transparent 70%),
            linear-gradient(45deg, transparent 30%, #64748b 30%, #64748b 70%, transparent 70%),
            /* Spinner background */
            linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 75%, #64748b 100%);
          
          background-position:
            calc(100% - 16px) 8px,
            calc(100% - 12px) 8px,
            calc(100% - 12px) calc(100% - 8px),
            calc(100% - 16px) calc(100% - 8px),
            calc(100% - 30px) 0;
            
          background-size:
            3px 4px,
            3px 4px,
            3px 4px,
            3px 4px,
            30px 100%;
            
          background-repeat: no-repeat;
          border-radius: 6px;
        }
        
        /* Enhanced hover state */
        input[type="number"]:hover {
          border-color: #64748b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          
          background-image: 
            /* Brighter up arrow */
            linear-gradient(45deg, transparent 30%, #94a3b8 30%, #94a3b8 70%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, #94a3b8 30%, #94a3b8 70%, transparent 70%),
            /* Brighter down arrow */
            linear-gradient(-45deg, transparent 30%, #94a3b8 30%, #94a3b8 70%, transparent 70%),
            linear-gradient(45deg, transparent 30%, #94a3b8 30%, #94a3b8 70%, transparent 70%),
            /* Hover background with glow */
            linear-gradient(135deg, #334155 0%, #475569 25%, #64748b 75%, #94a3b8 100%),
            radial-gradient(ellipse at 80% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 70%);
        }
        
        /* Enhanced focus state */
        input[type="number"]:focus {
          outline: none;
          border-color: #06b6d4;
          box-shadow: 
            0 0 0 3px rgba(6, 182, 212, 0.3),
            0 4px 12px rgba(6, 182, 212, 0.15);
          transform: translateY(-1px);
          
          background-image: 
            /* Glowing white arrows */
            linear-gradient(45deg, transparent 30%, #ffffff 30%, #ffffff 70%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, #ffffff 30%, #ffffff 70%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, #ffffff 30%, #ffffff 70%, transparent 70%),
            linear-gradient(45deg, transparent 30%, #ffffff 30%, #ffffff 70%, transparent 70%),
            /* Cyan gradient background */
            linear-gradient(135deg, #0891b2 0%, #06b6d4 25%, #22d3ee 75%, #67e8f9 100%),
            radial-gradient(ellipse at 80% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
        }
        
        /* Add a subtle click area highlight */
        input[type="number"]:active {
          transform: translateY(0px);
          box-shadow: 
            inset 0 2px 4px rgba(0,0,0,0.1),
            0 0 0 3px rgba(6, 182, 212, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;