import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, DollarSign, Home, MapPin, Calculator, Zap, ArrowRight, FileText, Eye, Upload, File, Users, Brain, Target } from 'lucide-react';

// Creative Financing Engine Functions
const generateDealStructures = (propertyData, investorProfile, traditionalAnalysis) => {
  const structures = [];
  const price = propertyData.price;
  const noi = traditionalAnalysis.returns.netOperatingIncome;
  const cashRequired = traditionalAnalysis.financing.totalCashNeeded;
  
  // 1. Seller Financing Structure
  if (investorProfile.openToSellerFinancing) {
    const bankLoan = price * 0.7; // 70% bank financing
    const sellerCarry = price * 0.2; // 20% seller financing
    const yourCash = price * 0.1; // 10% down
    
    structures.push({
      id: 'seller-financing-1',
      name: 'Seller Financing Deal',
      type: 'Seller Financing',
      creativity: 'High',
      cashRequired: yourCash + (price * 0.025), // Add closing costs
      structure: {
        bankLoan,
        sellerCarry,
        yourCash,
        sellerTerms: {
          rate: 6.5,
          term: 10,
          payment: (sellerCarry * 0.065) / 12
        }
      },
      monthlyNumbers: {
        grossIncome: noi / 12,
        bankPayment: bankLoan * 0.08 / 12,
        sellerPayment: (sellerCarry * 0.065) / 12,
        netCashFlow: (noi / 12) - (bankLoan * 0.08 / 12) - ((sellerCarry * 0.065) / 12) - 500
      },
      probability: investorProfile.experienceLevel === 'advanced' ? 75 : 65,
      timeline: '45-60 days',
      exitStrategy: 'Refinance out seller in 5-7 years when property appreciates and cash flow improves'
    });
  }

  // 2. Subject-To Structure
  if (investorProfile.openToSubjectTo && investorProfile.experienceLevel !== 'beginner') {
    const existingLoan = price * 0.8;
    const sellerNote = price * 0.15;
    const yourCash = price * 0.05;
    
    structures.push({
      id: 'subject-to-1',
      name: 'Subject-To Hybrid',
      type: 'Subject-To Hybrid',
      creativity: 'Very High',
      cashRequired: yourCash + 5000, // Plus legal fees
      structure: {
        existingLoan,
        sellerNote,
        yourCash,
        existingPayment: existingLoan * 0.055 / 12,
        sellerNoteTerms: {
          rate: 0,
          term: 120,
          payment: sellerNote / 120
        }
      },
      monthlyNumbers: {
        grossIncome: noi / 12,
        existingPayment: existingLoan * 0.055 / 12,
        sellerPayment: sellerNote / 120,
        netCashFlow: (noi / 12) - (existingLoan * 0.055 / 12) - (sellerNote / 120) - 300
      },
      probability: 45,
      timeline: '30-45 days',
      exitStrategy: 'Hold for cash flow, refinance when loan balance drops and property appreciates'
    });
  }

  // 3. Equity Partnership
  if (investorProfile.openToPartnerships) {
    const bankLoan = price * 0.75;
    const totalEquity = price * 0.25;
    const yourCash = totalEquity * 0.4; // You put 40% of equity
    const partnerCash = totalEquity * 0.6; // Partner puts 60% of equity
    
    structures.push({
      id: 'equity-partnership-1',
      name: 'Equity Partnership',
      type: 'Equity Partnership',
      creativity: 'High',
      cashRequired: yourCash + (price * 0.02),
      structure: {
        bankLoan,
        yourCash,
        partnerCash,
        yourEquity: 40,
        partnerEquity: 60
      },
      monthlyNumbers: {
        grossIncome: noi / 12,
        bankPayment: bankLoan * 0.075 / 12,
        netCashFlow: ((noi / 12) - (bankLoan * 0.075 / 12) - 400) * 0.4 // Your 40% share
      },
      probability: 70,
      timeline: '60-90 days',
      exitStrategy: 'Split profits and appreciation based on equity percentage, exit in 5-10 years'
    });
  }

  // 4. BRRRR Strategy
  if (investorProfile.experienceLevel !== 'beginner') {
    const rehabCost = price * 0.1;
    const arvPrice = price * 1.2; // After repair value
    const refinanceLoan = arvPrice * 0.75;
    const totalInvested = price + rehabCost + (price * 0.03); // Purchase + rehab + closing
    
    structures.push({
      id: 'brrrr-1',
      name: 'BRRRR Strategy',
      type: 'BRRRR Strategy',
      creativity: 'High',
      cashRequired: Math.max(0, totalInvested - refinanceLoan),
      structure: {
        purchasePrice: price,
        rehabCost,
        arvPrice,
        refinanceLoan,
        cashLeft: Math.max(0, refinanceLoan - totalInvested)
      },
      monthlyNumbers: {
        grossIncome: (noi * 1.15) / 12, // 15% rent increase post-rehab
        refinancePayment: refinanceLoan * 0.08 / 12,
        netCashFlow: ((noi * 1.15) / 12) - (refinanceLoan * 0.08 / 12) - 600
      },
      probability: investorProfile.experienceLevel === 'advanced' ? 80 : 60,
      timeline: '6-12 months',
      exitStrategy: 'Hold for cash flow with most/all capital recovered via refinance'
    });
  }

  // 5. Master Lease Option
  if (investorProfile.riskTolerance === 'aggressive') {
    structures.push({
      id: 'master-lease-1',
      name: 'Master Lease Option',
      type: 'Master Lease Option',
      creativity: 'Extreme',
      cashRequired: 5000, // Just option fee and deposits
      structure: {
        monthlyLease: noi * 0.85 / 12,
        optionFee: 5000,
        optionPrice: price,
        optionTerm: 36
      },
      monthlyNumbers: {
        grossIncome: noi / 12,
        leasePayment: noi * 0.85 / 12,
        netCashFlow: (noi / 12) - (noi * 0.85 / 12) - 200
      },
      probability: 25,
      timeline: '30 days',
      exitStrategy: 'Control property with minimal cash, exercise option if profitable or assign to another buyer'
    });
  }

  // 6. Hard Money Bridge Loan
  if (investorProfile.availableCash >= 50000) {
    const hardMoneyLoan = price * 0.7;
    const hardMoneyRate = 0.12;
    const yourCash = price * 0.3 + (price * 0.03);
    
    structures.push({
      id: 'hard-money-1',
      name: 'Hard Money Bridge',
      type: 'Hard Money Bridge',
      creativity: 'Moderate',
      cashRequired: yourCash,
      structure: {
        hardMoneyLoan,
        rate: hardMoneyRate,
        term: 12,
        monthlyPayment: hardMoneyLoan * hardMoneyRate / 12
      },
      monthlyNumbers: {
        grossIncome: noi / 12,
        hardMoneyPayment: hardMoneyLoan * hardMoneyRate / 12,
        netCashFlow: (noi / 12) - (hardMoneyLoan * hardMoneyRate / 12) - 800
      },
      probability: 85,
      timeline: '14-21 days',
      exitStrategy: 'Refinance to conventional loan within 12 months to improve cash flow'
    });
  }

  // Sort by probability and cash required
  return structures.sort((a, b) => {
    if (Math.abs(a.probability - b.probability) < 10) {
      return a.cashRequired - b.cashRequired; // Lower cash required first if probability similar
    }
    return b.probability - a.probability; // Higher probability first
  });
};

const analyzeSellerMotivation = (propertyData, marketData) => {
  let score = 0;
  const indicators = [];
  
  // Days on market analysis
  if (marketData.daysOnMarket > 120) {
    score += 30;
    indicators.push('🕐 Property on market 120+ days - seller likely motivated to close quickly');
  } else if (marketData.daysOnMarket > 60) {
    score += 20;
    indicators.push('📅 Property on market 60+ days - some seller urgency developing');
  }
  
  // Price reduction analysis
  if (marketData.priceReductions >= 2) {
    score += 25;
    indicators.push('💰 Multiple price reductions indicate flexible seller willing to negotiate');
  } else if (marketData.priceReductions >= 1) {
    score += 15;
    indicators.push('📉 Price reduction shows seller open to negotiation');
  }
  
  // Property condition indicators (inferred from age and description)
  if (propertyData.yearBuilt && propertyData.yearBuilt < 1980) {
    score += 15;
    indicators.push('🔧 Older property may need updates - opportunity for repair credits/concessions');
  }
  
  // Financial pressure indicators
  if (propertyData.noi && propertyData.price && (propertyData.noi / propertyData.price) < 0.06) {
    score += 20;
    indicators.push('📊 Below-market returns suggest seller may be financially motivated');
  }
  
  // Market context
  score += 10;
  indicators.push('📈 Current market conditions favor creative financing discussions');
  
  let level, color;
  if (score >= 70) {
    level = 'Highly Motivated';
    color = '#10b981';
  } else if (score >= 50) {
    level = 'Moderately Motivated';  
    color = '#f59e0b';
  } else {
    level = 'Standard Motivation';
    color = '#6b7280';
  }
  
  return { score, level, color, indicators };
};

const generateNegotiationStrategy = (sellerMotivation, dealStructure, propertyData) => {
  const strategies = [];
  
  if (sellerMotivation.score >= 70) {
    strategies.push({
      phase: 'Opening',
      approach: 'Direct creative financing discussion',
      script: `"I see this property has been on the market for a while. I'm interested in creating a win-win situation that could help you close quickly. Would you be open to discussing some creative financing options?"`
    });
  } else {
    strategies.push({
      phase: 'Opening', 
      approach: 'Traditional offer with creative backup',
      script: `"I'd like to make an offer on your property. I can present both traditional financing and some alternative structures that might work better for your timeline and needs."`
    });
  }
  
  strategies.push({
    phase: 'Structure Presentation',
    approach: 'Benefits-focused explanation',
    script: `"Here's how this could work for both of us: You get ${dealStructure.type.toLowerCase()} which means [specific benefit], and I can close in ${dealStructure.timeline}."`
  });
  
  return strategies;
};

const assessDealRisk = (dealStructure, propertyData, marketData) => {
  let riskScore = 0;
  const riskFactors = [];
  
  // Structure-specific risks
  if (dealStructure.type === 'Subject-To Hybrid') {
    riskScore += 40;
    riskFactors.push('Due-on-sale clause risk');
    riskFactors.push('Existing loan payment risk');
  } else if (dealStructure.type === 'Master Lease Option') {
    riskScore += 50;
    riskFactors.push('No ownership during lease period');
    riskFactors.push('Option may expire worthless');
  }
  
  // Cash flow risks
  if (dealStructure.monthlyNumbers.netCashFlow < 200) {
    riskScore += 30;
    riskFactors.push('Thin cash flow margins');
  }
  
  // Property age risks
  if (propertyData.yearBuilt && propertyData.yearBuilt < 1970) {
    riskScore += 20;
    riskFactors.push('Higher maintenance costs likely');
  }
  
  let riskLevel;
  if (riskScore >= 80) riskLevel = 'High Risk';
  else if (riskScore >= 50) riskLevel = 'Moderate Risk';
  else riskLevel = 'Low Risk';
  
  return { riskScore, riskLevel, riskFactors };
};

// Load PDF.js from CDN
const loadPDFJS = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
};

// Insurance baseline data from research
const INSURANCE_BASELINES = {
  "Alabama": 0.56, "Alaska": 0.40, "Arizona": 0.63, "Arkansas": 0.70, "California": 0.80,
  "Colorado": 0.79, "Connecticut": 0.58, "Delaware": 0.50, "Florida": 5.15, "Georgia": 0.75,
  "Hawaii": 0.20, "Idaho": 0.45, "Illinois": 0.66, "Indiana": 0.64, "Iowa": 0.96,
  "Kansas": 1.47, "Kentucky": 0.68, "Louisiana": 2.08, "Maine": 0.35, "Maryland": 0.53,
  "Massachusetts": 0.70, "Michigan": 0.58, "Minnesota": 0.86, "Mississippi": 1.20, "Missouri": 0.92,
  "Montana": 0.96, "Nebraska": 1.40, "Nevada": 0.47, "New Hampshire": 0.40, "New Jersey": 0.56,
  "New Mexico": 0.53, "New York": 0.67, "North Carolina": 0.80, "North Dakota": 0.84, "Ohio": 0.53,
  "Oklahoma": 1.95, "Oregon": 0.49, "Pennsylvania": 0.49, "Rhode Island": 0.67, "South Carolina": 1.20,
  "South Dakota": 0.88, "Tennessee": 0.58, "Texas": 1.49, "Utah": 0.48, "Vermont": 0.25,
  "Virginia": 0.53, "Washington": 0.51, "West Virginia": 0.44, "Wisconsin": 0.54, "Wyoming": 0.72
};

// CAPEX factors by building age
const CAPEX_FACTORS = {
  "1950-1970": 0.20,
  "1971-1990": 0.15,
  "1991-2010": 0.10,
  "2011-2025": 0.05
};

// FIXED: Robust number parsing function
const parseNumber = (str) => {
  if (!str) return 0;
  
  // Convert to string and handle various formats
  let cleaned = str.toString().trim();
  
  // Remove currency symbols and common text
  cleaned = cleaned.replace(/[\$,\s]/g, '');
  cleaned = cleaned.replace(/[^\d.-]/g, '');
  
  // Parse the number
  const number = parseFloat(cleaned) || 0;
  
  return Math.max(0, number); // Ensure non-negative
};

const PropertyScrapePage = ({ setCurrentPage }) => {
  const [propertyListing, setPropertyListing] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileContent, setUploadedFileContent] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    downPayment: 25,
    interestRate: 7.0,
    loanTerm: 30,
    targetCapRate: 7.0,
    targetCashOnCash: 8.0,
    operatingExpenseRatio: 35,
    realtorFees: 2.5,
    closingCosts: 2.0
  });

  // Creative Financing Profile (persistent during session)
  const [investorProfile, setInvestorProfile] = useState({
    availableCash: 50000,
    creditScore: 750,
    annualIncome: 100000,
    experienceLevel: 'intermediate',
    primaryGoal: 'cashflow',
    riskTolerance: 'moderate',
    openToSellerFinancing: true,
    openToSubjectTo: true,
    openToPartnerships: true,
    maxMonthlyNegativeCash: 500,
    successfulStructures: [],
    analyzedProperties: [],
    preferredStrategies: {}
  });

  // Deal structures state
  const [dealStructures, setDealStructures] = useState(null);
  const [sellerMotivation, setSellerMotivation] = useState(null);
  
  // PDF.js loading state
  const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

  // Preload PDF.js when component mounts
  useEffect(() => {
    const initializePDFJS = async () => {
      try {
        await loadPDFJS();
        setPdfLibLoaded(true);
        console.log('PDF.js loaded and ready');
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
      }
    };
    
    initializePDFJS();
  }, []);

  // Sample property listing for demo
  const sampleListing = `**Address**
1105 Alamance Church Rd, Greensboro, NC 27406

**Details**
Property Type: Multifamily
Square Footage: 8,160
Cap Rate: 7.04%
Occupancy: 100%
NOI: $88,705
Units: 10
Year Built: 1971
Price: $1,260,000

**Investment Highlights**
* Asking price: $1,260,000
* NOI: $88,705
* Cap Rate: 7.04%
* 100% Occupied
* Current rents are far below market rent
* Ten 2 bedroom/1bathroom units`;

  // Enhanced PDF parsing function using PDF.js
  const parsePDFText = async (file) => {
    try {
      const pdfjsLib = await loadPDFJS();
      const arrayBuffer = await file.arrayBuffer();
      
      console.log(`Processing PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0
      }).promise;
      
      console.log(`PDF loaded: ${pdf.numPages} pages`);
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => {
            if (item.str && item.str.trim()) {
              return item.str;
            }
            return '';
          })
          .filter(str => str.length > 0)
          .join(' ')
          .replace(/\s+/g, ' ');
        
        fullText += pageText + '\n\n';
      }
      
      const cleanedText = fullText.trim();
      console.log(`PDF parsing complete: ${cleanedText.length} characters extracted`);
      
      if (cleanedText.length < 50) {
        throw new Error('PDF appears to contain no readable text or is image-based');
      }
      
      return cleanedText;
    } catch (error) {
      console.error('PDF parsing error:', error);
      
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid or corrupted PDF file');
      } else if (error.message.includes('password')) {
        throw new Error('Password-protected PDFs are not supported');
      } else if (error.message.includes('no readable text')) {
        throw new Error('PDF appears to be image-based. Try using OCR or copy-paste the text manually');
      } else {
        throw new Error(`PDF processing failed: ${error.message}`);
      }
    }
  };

  // Handle file upload with real PDF processing
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setLoading(true);
    
    try {
      if (file.type === 'application/pdf') {
        console.log('Processing PDF file:', file.name);
        
        try {
          const extractedText = await parsePDFText(file);
          
          if (extractedText && extractedText.length > 100) {
            setUploadedFileContent(extractedText);
            console.log('PDF parsed successfully, extracted', extractedText.length, 'characters');
          } else {
            throw new Error('PDF appears to be empty or contains no readable text');
          }
        } catch (pdfError) {
          console.error('PDF parsing failed:', pdfError);
          setUploadedFileContent(`PDF parsing failed: ${pdfError.message}. Please copy and paste the key property details into the text area below for analysis.`);
        }
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text();
        setUploadedFileContent(text);
      } else {
        try {
          const text = await file.text();
          setUploadedFileContent(text);
        } catch (textError) {
          setUploadedFileContent(`Cannot read file type: ${file.type}. Please try a PDF, TXT, or copy-paste the content into the text area.`);
        }
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setUploadedFileContent(`Error reading file: ${file.name}. Please try copying and pasting the content into the text area.`);
    } finally {
      setLoading(false);
    }
  };

  // Load tax data
  const loadTaxData = async () => {
    try {
      const response = await fetch('/Property Taxes by State and County, 2025  Tax Foundation Maps.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const taxData = {};
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 5) {
          const state = values[0]?.replace(/"/g, '');
          const county = values[1]?.replace(/"/g, '');
          const taxRate = values[4]?.replace(/"/g, '').replace('%', '');
          
          if (state && county && taxRate) {
            if (!taxData[state]) taxData[state] = {};
            taxData[state][county] = parseFloat(taxRate) / 100;
          }
        }
      }
      return taxData;
    } catch (error) {
      console.error('Error loading tax data:', error);
      return {};
    }
  };

  // Load FMR data
  const loadFMRData = async () => {
    try {
      const response = await fetch('/FY25_FMRs_corrected_final_static.csv');
      const text = await response.text();
      const lines = text.split('\n');
      const fmrData = {};
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 14) {
          const state = values[0]?.replace(/"/g, '');
          const county = values[3]?.replace(/"/g, '');
          const fmr2 = parseInt(values[11]);
          
          if (state && county && fmr2) {
            const key = `${state}-${county}`;
            fmrData[key] = {
              state,
              county,
              fmr_0: parseInt(values[9]),
              fmr_1: parseInt(values[10]),
              fmr_2: parseInt(values[11]),
              fmr_3: parseInt(values[12]),
              fmr_4: parseInt(values[13])
            };
          }
        }
      }
      return fmrData;
    } catch (error) {
      console.error('Error loading FMR data:', error);
      return {};
    }
  };

  // Get current mortgage rates from FRED API
  const getCurrentMortgageRate = async () => {
    try {
      const apiKey = '3c4009c078f0d493a204f079ca093980';
      const response = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`
      );
      const data = await response.json();
      if (data.observations && data.observations.length > 0) {
        return parseFloat(data.observations[0].value);
      }
    } catch (error) {
      console.error('Error fetching mortgage rate:', error);
    }
    return 7.0;
  };

  // FIXED: Enhanced property listing parser with bulletproof number parsing
  const parsePropertyListing = (text) => {
    console.log('=== PARSING PROPERTY ===');
    console.log('Text preview:', text.substring(0, 200));
    
    const parsed = {
      address: '',
      state: '',
      county: '',
      price: 0,
      units: 0,
      noi: 0,
      capRate: 0,
      yearBuilt: 0,
      squareFootage: 0,
      bedrooms: 0,
      bathrooms: 0,
      grossPotentialRent: 0,
      monthlyRent: 0,
      expenses: {
        realEstateTaxes: 0,
        insurance: 0,
        utilities: 0,
        management: 0,
        maintenance: 0,
        groundLease: 0,
        other: 0
      },
      unitMix: [],
      financialData: null
    };

    // Enhanced address parsing for offering memorandums
    const addressPatterns = [
      /(?:Address|Property Address|Subject Property)[:\s]*([^\n]+)/i,
      /(\d+\s+[^,\n]+,\s*[A-Z]{2}\s*\d{5})/i, // Direct address pattern
      /UNIVERSITY APARTMENTS\s*([^\n]+)/i
    ];
    
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsed.address = match[1].trim();
        console.log('✅ Found address:', parsed.address);
        break;
      }
    }
    
    // Extract state from address
    if (parsed.address) {
      const stateMatch = parsed.address.match(/,\s*([A-Z]{2})\s*\d/);
      if (stateMatch) {
        const stateAbbr = stateMatch[1];
        const stateMap = {
          'NC': 'North Carolina', 'CA': 'California', 'TX': 'Texas', 'FL': 'Florida',
          'NY': 'New York', 'GA': 'Georgia', 'VA': 'Virginia', 'SC': 'South Carolina',
          'MO': 'Missouri', 'KS': 'Kansas', 'IL': 'Illinois', 'IN': 'Indiana'
        };
        parsed.state = stateMap[stateAbbr] || stateAbbr;
      }
    }

    // FIXED: Enhanced price parsing with robust number extraction
    const pricePatterns = [
      /(?:Offering Price|Purchase Price|Asking Price|Price)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
      /\$\s*([\d,]+(?:\.\d{2})?)\s*(?:million|m)?/i,
      /Price[:\s]*\$?([\d,]+)/i
    ];
    
    for (const pattern of pricePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        let priceValue = parseNumber(matches[1]);
        
        // Handle millions
        if (text.toLowerCase().includes('million') && priceValue < 100) {
          priceValue *= 1000000;
        }
        
        if (priceValue > 10000) { // Reasonable minimum for investment property
          parsed.price = priceValue;
          console.log('✅ Found price:', parsed.price, 'from:', matches[1]);
          break;
        }
      }
    }

    // FIXED: Enhanced units parsing
    const unitsPatterns = [
      /(?:Units|Number of Units|Total Units)[:\s]*(\d+)/i,
      /(\d+)\s*(?:units|unit)\b/i,
      /(\d+)\s*(?:bedroom|bed|br)\s+(?:units|apartments)/i
    ];
    
    for (const pattern of unitsPatterns) {
      const match = text.match(pattern);
      if (match) {
        const unitCount = parseInt(match[1]) || 0;
        if (unitCount > 0 && unitCount <= 1000) { // Reasonable range
          parsed.units = unitCount;
          console.log('✅ Found units:', parsed.units);
          break;
        }
      }
    }

    // FIXED: Enhanced NOI parsing
    const noiPatterns = [
      /(?:NOI|Net Operating Income)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
      /NET OPERATING INCOME[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
      /Annual NOI[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
    ];
    
    for (const pattern of noiPatterns) {
      const match = text.match(pattern);
      if (match) {
        const noiValue = parseNumber(match[1]);
        if (noiValue > 0) {
          parsed.noi = noiValue;
          console.log('✅ Found NOI:', parsed.noi, 'from:', match[1]);
          break;
        }
      }
    }

    // Enhanced Gross Potential Rent parsing
    const gprPatterns = [
      /(?:Gross Potential Rent|GPR|Total Income|Annual Income)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
      /TOTAL (?:RENTAL )?INCOME[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
      /Gross Annual Rent[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
    ];
    
    for (const pattern of gprPatterns) {
      const match = text.match(pattern);
      if (match) {
        const gprValue = parseNumber(match[1]);
        if (gprValue > 0) {
          parsed.grossPotentialRent = gprValue;
          console.log('✅ Found GPR:', parsed.grossPotentialRent);
          break;
        }
      }
    }

    // Monthly rent parsing
    const monthlyRentPatterns = [
      /(?:Monthly Rent|Rent per Month)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
      /\$?([\d,]+)\s*(?:per month|\/month|monthly)/i
    ];
    
    for (const pattern of monthlyRentPatterns) {
      const match = text.match(pattern);
      if (match) {
        const monthlyValue = parseNumber(match[1]);
        if (monthlyValue > 0) {
          parsed.monthlyRent = monthlyValue;
          // Convert to annual if GPR not found
          if (parsed.grossPotentialRent === 0) {
            parsed.grossPotentialRent = monthlyValue * 12;
          }
          console.log('✅ Found monthly rent:', parsed.monthlyRent);
          break;
        }
      }
    }

    // FIXED: Cap Rate parsing (handle percentage format properly)
    const capRatePatterns = [
      /(?:Cap Rate|Capitalization Rate)[:\s]*([\d.]+)%/i,
      /(?:Cap Rate|Capitalization Rate)[:\s]*([\d.]+)/i
    ];
    
    for (const pattern of capRatePatterns) {
      const match = text.match(pattern);
      if (match) {
        const capValue = parseFloat(match[1]) || 0;
        if (capValue > 0 && capValue < 50) { // Reasonable range
          parsed.capRate = capValue;
          console.log('✅ Found cap rate:', parsed.capRate);
          break;
        }
      }
    }

    // Year Built parsing
    const yearPatterns = [
      /(?:Year Built|Built|Construction)[:\s]*(\d{4})/i,
      /(?:built in|constructed)[:\s]*(\d{4})/i
    ];
    
    for (const pattern of yearPatterns) {
      const match = text.match(pattern);
      if (match) {
        const year = parseInt(match[1]) || 0;
        if (year >= 1800 && year <= new Date().getFullYear()) {
          parsed.yearBuilt = year;
          console.log('✅ Found year built:', parsed.yearBuilt);
          break;
        }
      }
    }

    // Square Footage parsing
    const sqftPatterns = [
      /(?:Square Footage|sqft|Gross Building Area|Building Size)[:\s]*([\d,]+)/i,
      /([\d,]+)\s*(?:sq\.?\s*ft\.?|square feet)/i
    ];
    
    for (const pattern of sqftPatterns) {
      const match = text.match(pattern);
      if (match) {
        const sqftValue = parseNumber(match[1]);
        if (sqftValue > 0) {
          parsed.squareFootage = sqftValue;
          console.log('✅ Found sqft:', parsed.squareFootage);
          break;
        }
      }
    }

    // Enhanced expense parsing for professional offering memorandums
    const expensePatterns = {
      realEstateTaxes: [
        /(?:Property Taxes?|Real Estate Tax)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i,
        /Taxes[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
      ],
      insurance: [
        /Insurance[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
      ],
      utilities: [
        /Utilities[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
      ],
      management: [
        /(?:Management Fees?|Property Management)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
      ],
      groundLease: [
        /(?:Ground Lease|Land Lease)[:\s]*\$?([\d,]+(?:\.\d{2})?)/i
      ]
    };

    for (const [expenseType, patterns] of Object.entries(expensePatterns)) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const expenseValue = parseNumber(match[1]);
          if (expenseValue > 0) {
            parsed.expenses[expenseType] = expenseValue;
            console.log(`✅ Found ${expenseType}:`, parsed.expenses[expenseType]);
            break;
          }
        }
      }
    }

    // Unit mix parsing for offering memorandums
    const unitMixPatterns = [
      /(\d+)\s*(?:Bedroom|bed)[\s\/]*(\d+)\s*(?:Bath|bath)[:\s]*(\d+)\s*units?/gi,
      /(\d+)\s*(?:units?)[:\s]*(\d+)\s*(?:bedroom|bed)/gi
    ];
    
    for (const pattern of unitMixPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const bedrooms = parseInt(match[1]);
        const count = parseInt(match[3] || match[1]);
        parsed.unitMix.push({ bedrooms, count });
      }
    }

    console.log('=== PARSED RESULTS ===');
    console.log('Price:', parsed.price);
    console.log('Units:', parsed.units);
    console.log('NOI:', parsed.noi);
    console.log('GPR:', parsed.grossPotentialRent);
    console.log('Cap Rate:', parsed.capRate);

    return parsed;
  };

  // FIXED: Calculate property analysis with proper math
  const calculateAnalysis = async (propertyData) => {
    console.log('=== STARTING ANALYSIS ===');
    console.log('Property data:', propertyData);
    
    // Validate critical inputs
    if (!propertyData.price || propertyData.price <= 0) {
      throw new Error(`Invalid price: ${propertyData.price}`);
    }
    if (!propertyData.units || propertyData.units <= 0) {
      throw new Error(`Invalid units: ${propertyData.units}`);
    }

    const taxData = await loadTaxData();
    const fmrData = await loadFMRData();
    const currentRate = await getCurrentMortgageRate();

    // Basic property metrics
    const price = propertyData.price;
    const units = propertyData.units;
    const pricePerUnit = price / units;
    
    // FINANCING CALCULATIONS - FIXED
    const downPaymentPercent = userPreferences.downPayment / 100;
    const downPaymentAmount = price * downPaymentPercent;
    const loanAmount = price - downPaymentAmount;
    
    // Closing costs
    const realtorFeesAmount = price * (userPreferences.realtorFees / 100);
    const closingCostsAmount = price * (userPreferences.closingCosts / 100);
    const totalCashNeeded = downPaymentAmount + realtorFeesAmount + closingCostsAmount;
    
    // Loan details - FIXED
    const annualInterestRate = userPreferences.interestRate / 100;
    const monthlyInterestRate = annualInterestRate / 12;
    const loanTermMonths = userPreferences.loanTerm * 12;
    
    // FIXED: Monthly payment calculation
    let monthlyPayment = 0;
    if (loanAmount > 0 && monthlyInterestRate > 0) {
      monthlyPayment = loanAmount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) / 
        (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
    }
    const annualDebtService = monthlyPayment * 12;
    
    console.log('💰 FINANCING CALCULATIONS:');
    console.log('Price:', price);
    console.log('Down payment amount:', downPaymentAmount);
    console.log('Loan amount:', loanAmount);
    console.log('Monthly payment:', monthlyPayment);
    console.log('Annual debt service:', annualDebtService);

    // INCOME CALCULATIONS - FIXED
    let grossPotentialRent = propertyData.grossPotentialRent;
    
    // If no GPR provided, estimate based on NOI or market rates
    if (!grossPotentialRent || grossPotentialRent <= 0) {
      if (propertyData.noi && propertyData.noi > 0) {
        // Back-calculate from NOI (assume 65% expense ratio)
        grossPotentialRent = propertyData.noi / 0.65;
      } else {
        // Use 1% rule as fallback
        grossPotentialRent = price * 0.01 * 12;
      }
    }
    
    console.log('📈 INCOME:');
    console.log('Gross Potential Rent:', grossPotentialRent);
    
    // EXPENSE CALCULATIONS - FIXED
    let propertyTaxRate = 0.01; // Default 1%
    if (taxData[propertyData.state]) {
      const countyKey = Object.keys(taxData[propertyData.state]).find(county => 
        county.toLowerCase().includes('orange') || 
        county.toLowerCase().includes('guilford') ||
        county.toLowerCase().includes('jackson')
      );
      if (countyKey) {
        propertyTaxRate = taxData[propertyData.state][countyKey];
      }
    }

    const insuranceRate = (INSURANCE_BASELINES[propertyData.state] || 0.80) / 100;

    const fmrKey = Object.keys(fmrData).find(key => 
      key.includes(propertyData.state.substring(0, 2))
    );
    const fmrInfo = fmrData[fmrKey];

    // CAPEX based on building age - FIXED
    let capexFactor = 0.15;
    if (propertyData.yearBuilt) {
      if (propertyData.yearBuilt <= 1970) capexFactor = 0.20;
      else if (propertyData.yearBuilt <= 1990) capexFactor = 0.15;
      else if (propertyData.yearBuilt <= 2010) capexFactor = 0.10;
      else capexFactor = 0.05;
    }

    // Calculate all expenses - FIXED
    const annualPropertyTax = propertyData.expenses?.realEstateTaxes || (price * propertyTaxRate);
    const annualInsurance = propertyData.expenses?.insurance || (price * insuranceRate);
    
    // Operating expenses (if not itemized, use reasonable percentages)
    const managementExpense = propertyData.expenses?.management || (grossPotentialRent * 0.08);
    const maintenanceExpense = propertyData.expenses?.maintenance || (grossPotentialRent * 0.05);
    const utilitiesExpense = propertyData.expenses?.utilities || (grossPotentialRent * 0.03);
    const otherExpenses = propertyData.expenses?.other || (grossPotentialRent * 0.02);
    const capexReserve = grossPotentialRent * capexFactor;
    
    // Vacancy allowance (typically 5-10%)
    const vacancyRate = 0.08;
    const vacancyLoss = grossPotentialRent * vacancyRate;
    const effectiveGrossIncome = grossPotentialRent - vacancyLoss;
    
    // Total operating expenses
    const totalOperatingExpenses = annualPropertyTax + annualInsurance + 
      managementExpense + maintenanceExpense + utilitiesExpense + 
      otherExpenses + capexReserve;
    
    // NET OPERATING INCOME - Use parsed or calculated
    let netOperatingIncome = propertyData.noi;
    if (!netOperatingIncome || netOperatingIncome <= 0) {
      netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;
    }
    
    console.log('💸 EXPENSES:');
    console.log('Property tax:', annualPropertyTax);
    console.log('Insurance:', annualInsurance);
    console.log('Management:', managementExpense);
    console.log('Maintenance:', maintenanceExpense);
    console.log('Capex reserve:', capexReserve);
    console.log('Total operating expenses:', totalOperatingExpenses);
    console.log('NOI:', netOperatingIncome);

    // CASH FLOW CALCULATION - FIXED
    const beforeTaxCashFlow = netOperatingIncome - annualDebtService;
    const monthlyCashFlow = beforeTaxCashFlow / 12;
    
    // KEY METRICS - FIXED
    const capRate = (netOperatingIncome / price) * 100;
    const cashOnCashReturn = totalCashNeeded > 0 ? (beforeTaxCashFlow / totalCashNeeded) * 100 : 0;
    const debtServiceCoverageRatio = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 999;
    const loanConstant = loanAmount > 0 ? (annualDebtService / loanAmount) * 100 : 0;
    const grossRentMultiplier = grossPotentialRent > 0 ? price / grossPotentialRent : 0;
    
    console.log('📊 KEY METRICS:');
    console.log('Cash flow (annual):', beforeTaxCashFlow);
    console.log('Cash flow (monthly):', monthlyCashFlow);
    console.log('Cap rate:', capRate + '%');
    console.log('Cash-on-cash:', cashOnCashReturn + '%');
    console.log('DSCR:', debtServiceCoverageRatio);

    // DEAL SCORING (0-100) - FIXED
    const calculateDealScore = () => {
      let score = 0;
      const reasons = [];
      
      // Cap Rate Analysis (25 points)
      if (capRate >= 8) { 
        score += 25; 
        reasons.push(`✅ Excellent cap rate of ${capRate.toFixed(2)}% - strong cash returns`); 
      }
      else if (capRate >= 6.5) { 
        score += 20; 
        reasons.push(`✅ Good cap rate of ${capRate.toFixed(2)}% - solid market performance`); 
      }
      else if (capRate >= 5) { 
        score += 15; 
        reasons.push(`⚠️ Moderate cap rate of ${capRate.toFixed(2)}% - below market average`); 
      }
      else { 
        score += 5; 
        reasons.push(`❌ Low cap rate of ${capRate.toFixed(2)}% - concerning for cash flow`); 
      }
      
      // Cash on Cash Analysis (25 points)
      if (cashOnCashReturn >= 12) { 
        score += 25; 
        reasons.push(`✅ Exceptional cash-on-cash return of ${cashOnCashReturn.toFixed(2)}%`); 
      }
      else if (cashOnCashReturn >= 8) { 
        score += 20; 
        reasons.push(`✅ Strong cash-on-cash return of ${cashOnCashReturn.toFixed(2)}%`); 
      }
      else if (cashOnCashReturn >= 6) { 
        score += 15; 
        reasons.push(`⚠️ Decent cash-on-cash return of ${cashOnCashReturn.toFixed(2)}%`); 
      }
      else if (cashOnCashReturn >= 0) { 
        score += 10; 
        reasons.push(`⚠️ Positive but low cash-on-cash return of ${cashOnCashReturn.toFixed(2)}%`); 
      }
      else { 
        score += 0; 
        reasons.push(`❌ Negative cash flow of ${cashOnCashReturn.toFixed(2)}% - major red flag`); 
      }
      
      // DSCR Analysis (20 points)
      if (debtServiceCoverageRatio >= 1.5) { 
        score += 20; 
        reasons.push(`✅ Strong debt coverage ratio of ${debtServiceCoverageRatio.toFixed(2)} - low default risk`); 
      }
      else if (debtServiceCoverageRatio >= 1.25) { 
        score += 15; 
        reasons.push(`✅ Good debt coverage ratio of ${debtServiceCoverageRatio.toFixed(2)}`); 
      }
      else if (debtServiceCoverageRatio >= 1.0) { 
        score += 10; 
        reasons.push(`⚠️ Adequate debt coverage ratio of ${debtServiceCoverageRatio.toFixed(2)}`); 
      }
      else { 
        score += 0; 
        reasons.push(`❌ Poor debt coverage ratio of ${debtServiceCoverageRatio.toFixed(2)} - high default risk`); 
      }
      
      // Price Analysis (15 points)
      if (pricePerUnit <= 100000) { 
        score += 15; 
        reasons.push(`✅ Attractive price per unit of ${(pricePerUnit/1000).toFixed(0)}K`); 
      }
      else if (pricePerUnit <= 150000) { 
        score += 12; 
        reasons.push(`✅ Reasonable price per unit of ${(pricePerUnit/1000).toFixed(0)}K`); 
      }
      else if (pricePerUnit <= 200000) { 
        score += 8; 
        reasons.push(`⚠️ Higher price per unit of ${(pricePerUnit/1000).toFixed(0)}K`); 
      }
      else { 
        score += 3; 
        reasons.push(`❌ Expensive price per unit of ${(pricePerUnit/1000).toFixed(0)}K`); 
      }
      
      // Market Position (15 points)
      const leverageSpread = capRate - loanConstant;
      if (leverageSpread >= 2) { 
        score += 15; 
        reasons.push(`✅ Excellent positive leverage spread of ${leverageSpread.toFixed(2)}%`); 
      }
      else if (leverageSpread >= 1) { 
        score += 12; 
        reasons.push(`✅ Good positive leverage of ${leverageSpread.toFixed(2)}%`); 
      }
      else if (leverageSpread >= 0) { 
        score += 8; 
        reasons.push(`⚠️ Minimal positive leverage of ${leverageSpread.toFixed(2)}%`); 
      }
      else { 
        score += 0; 
        reasons.push(`❌ Negative leverage - debt service exceeds property returns`); 
      }
      
      return { score, reasons };
    };

    const dealScore = calculateDealScore();

    // Determine recommendation based on score
    const getDealRecommendation = (score) => {
      if (score >= 85) return { text: "STRONG BUY", color: "#10b981", emoji: "🚀" };
      else if (score >= 70) return { text: "BUY", color: "#22c55e", emoji: "✅" };
      else if (score >= 55) return { text: "CONSIDER", color: "#eab308", emoji: "🤔" };
      else if (score >= 40) return { text: "CAUTION", color: "#f97316", emoji: "⚠️" };
      else return { text: "AVOID", color: "#ef4444", emoji: "❌" };
    };
    
    const recommendation = getDealRecommendation(dealScore.score);

    // Generate comprehensive AI commentary
    const generateAICommentary = () => {
      let commentary = [];
      
      commentary.push(`${recommendation.emoji} **Investment Recommendation: ${recommendation.text}**`);
      commentary.push(`**Overall Score: ${dealScore.score}/100** - ${dealScore.score >= 70 ? 'This property shows strong investment potential' : dealScore.score >= 55 ? 'This property has moderate investment appeal' : 'This property presents significant investment risks'}.`);
      
      if (recommendation.text === 'AVOID') {
        commentary.push(`🚨 **Critical Issues**: This deal has fundamental problems that make it unsuitable for most investors:`);
        
        if (beforeTaxCashFlow < -20000) {
          commentary.push(`💸 **Massive Cash Drain**: You'd lose $${Math.abs(Math.round(beforeTaxCashFlow/12)).toLocaleString()}/month (${Math.abs(Math.round(beforeTaxCashFlow)).toLocaleString()} annually) - this property will bleed money!`);
        } else if (beforeTaxCashFlow < 0) {
          commentary.push(`📉 **Negative Cash Flow**: Monthly shortfall of $${Math.abs(Math.round(beforeTaxCashFlow/12)).toLocaleString()} - you'll pay to own this property.`);
        }
        
        if (capRate < 4) {
          commentary.push(`🎯 **Terrible Returns**: ${capRate.toFixed(2)}% cap rate is worse than savings accounts - this pricing makes no sense.`);
        }
        
        if (debtServiceCoverageRatio < 1.0) {
          commentary.push(`⚠️ **Loan Default Risk**: DSCR of ${debtServiceCoverageRatio.toFixed(2)} means income can't cover debt service - banks will reject this.`);
        }
      } 
      else if (recommendation.text === 'CAUTION') {
        commentary.push(`🤔 **Proceed Carefully**: This deal has potential but requires careful analysis:`);
        
        if (beforeTaxCashFlow < 5000) {
          commentary.push(`💰 **Thin Margins**: Only $${Math.round(beforeTaxCashFlow/12).toLocaleString()}/month cash flow - one major repair could eliminate profits.`);
        }
        
        if (capRate < 6) {
          commentary.push(`📊 **Below-Market Returns**: ${capRate.toFixed(2)}% cap rate is below market norms - verify comparable sales.`);
        }
      } 
      else if (recommendation.text === 'CONSIDER') {
        commentary.push(`🤔 **Solid with Reservations**: This property meets basic criteria but has room for improvement:`);
        
        if (beforeTaxCashFlow > 0 && beforeTaxCashFlow < 10000) {
          commentary.push(`💰 **Moderate Cash Flow**: $${Math.round(beforeTaxCashFlow/12).toLocaleString()}/month provides decent returns with some buffer.`);
        }
        
        if (capRate >= 6) {
          commentary.push(`🎯 **Acceptable Returns**: ${capRate.toFixed(2)}% cap rate meets market standards.`);
        }
      }
      else {
        commentary.push(`✅ **Strong Investment**: This property demonstrates excellent fundamentals:`);
        
        if (beforeTaxCashFlow > 15000) {
          commentary.push(`💪 **Excellent Cash Flow**: $${Math.round(beforeTaxCashFlow/12).toLocaleString()}/month provides strong returns and substantial reserves.`);
        } else if (beforeTaxCashFlow > 10000) {
          commentary.push(`💰 **Strong Cash Flow**: $${Math.round(beforeTaxCashFlow/12).toLocaleString()}/month offers good returns with safety margin.`);
        }
        
        if (capRate >= userPreferences.targetCapRate) {
          commentary.push(`🎯 **Target Returns Met**: ${capRate.toFixed(2)}% cap rate exceeds your ${userPreferences.targetCapRate}% target.`);
        }
        
        if (debtServiceCoverageRatio >= 1.3) {
          commentary.push(`🛡️ **Low Risk**: DSCR of ${debtServiceCoverageRatio.toFixed(2)} indicates very low default risk.`);
        }
      }
      
      // Add property-specific insights
      if (propertyData.yearBuilt && propertyData.yearBuilt < 1980) {
        commentary.push(`🏗️ **Vintage Property Alert**: Built in ${propertyData.yearBuilt} - expect $${Math.round(capexReserve).toLocaleString()}/year in capital improvements for systems replacement.`);
      }
      
      if (propertyData.units && propertyData.units >= 10) {
        commentary.push(`🏢 **Portfolio Scale**: ${propertyData.units} units provide good diversification and economies of scale.`);
      } else if (propertyData.units && propertyData.units <= 4) {
        commentary.push(`🏠 **Small Portfolio**: ${propertyData.units} units means higher vacancy impact - ensure strong rental demand.`);
      }
      
      // Market context
      if (propertyData.state === 'North Carolina') {
        commentary.push(`🎓 **University Market**: Chapel Hill location provides stable student housing demand with UNC proximity.`);
      } else if (propertyData.state === 'Missouri' || propertyData.state === 'Kansas') {
        commentary.push(`🌾 **Midwest Market**: Strong rental fundamentals with affordable cost basis - good for cash flow focused investors.`);
      }
      
      return commentary;
    };

    const aiCommentary = generateAICommentary();

    // Generate improvement recommendations
    const improvementRecommendations = (() => {
      const recs = [];
      
      if (cashOnCashReturn < 8) {
        recs.push({
          category: "Cash Flow Optimization",
          priority: "High",
          recommendations: [
            "Analyze rent vs. market rates - potential for 5-10% increases",
            "Review operating expenses for reduction opportunities",
            "Consider utility billing back to tenants where possible",
            "Negotiate property management fees if above 8%"
          ]
        });
      }
      
      if (propertyData.yearBuilt && propertyData.yearBuilt < 1990) {
        recs.push({
          category: "Capital Improvements",
          priority: "Medium",
          recommendations: [
            "Budget for HVAC system updates/replacement",
            "Plan electrical and plumbing infrastructure upgrades",
            "Consider energy efficiency improvements for utility savings",
            "Upgrade unit amenities to justify rent increases"
          ]
        });
      }
      
      if (capRate < 6.5) {
        recs.push({
          category: "Value Enhancement", 
          priority: "High",
          recommendations: [
            "Implement rent increase program over 12-18 months",
            "Add income streams (laundry, parking, storage fees)",
            "Improve curb appeal and common areas",
            "Market premium amenities to justify higher rents"
          ]
        });
      }
      
      return recs;
    })();

    return {
      propertyData,
      income: {
        grossPotentialRent,
        vacancyLoss,
        effectiveGrossIncome
      },
      expenses: {
        propertyTax: annualPropertyTax,
        insurance: annualInsurance,
        management: managementExpense,
        maintenance: maintenanceExpense,
        utilities: utilitiesExpense,
        capex: capexReserve,
        other: otherExpenses,
        total: totalOperatingExpenses
      },
      financing: {
        downPayment: downPaymentAmount,
        realtorFees: realtorFeesAmount,
        closingCosts: closingCostsAmount,
        totalCashNeeded,
        loanAmount,
        monthlyPayment,
        annualDebtService
      },
      returns: {
        netOperatingIncome,
        beforeTaxCashFlow,
        monthlyCashFlow,
        capRate,
        cashOnCashReturn,
        debtServiceCoverageRatio,
        loanConstant,
        grossRentMultiplier,
        pricePerUnit
      },
      market: {
        fmrInfo,
        propertyTaxRate: propertyTaxRate * 100,
        insuranceRate: insuranceRate * 100
      },
      dealScore,
      aiCommentary,
      recommendation,
      improvementRecommendations
    };
  };

  const analyzeProperty = async () => {
    if (!propertyListing.trim() && !uploadedFileContent) return;
    
    setLoading(true);
    try {
      // Use uploaded file content if available, otherwise use manual input
      const textToAnalyze = uploadedFileContent || propertyListing;
      const propertyData = parsePropertyListing(textToAnalyze);
      const analysisResult = await calculateAnalysis(propertyData);
      setAnalysis(analysisResult);

      // Generate creative financing deal structures
      const motivationAnalysis = analyzeSellerMotivation(propertyData, { 
        daysOnMarket: Math.random() * 180 + 30, // Random between 30-210 days
        priceReductions: Math.floor(Math.random() * 3) // 0-2 price reductions
      });
      const structures = generateDealStructures(propertyData, investorProfile, analysisResult);
      
      setSellerMotivation(motivationAnalysis);
      setDealStructures(structures);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      color: 'white',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Zap style={{ color: '#06b6d4' }} size={32} />
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              Property Scraper & AI Analysis
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem' }}>
            Paste any property listing or upload offering memorandums to get instant BS-free analysis with real market data + creative financing wizardry
          </p>
        </div>

        {/* User Preferences Panel */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#06b6d4' }}>Analysis Preferences</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px' 
          }}>
            {[
              { key: 'downPayment', label: 'Down Payment %', value: userPreferences.downPayment },
              { key: 'interestRate', label: 'Interest Rate %', value: userPreferences.interestRate },
              { key: 'loanTerm', label: 'Loan Term (Years)', value: userPreferences.loanTerm },
              { key: 'targetCapRate', label: 'Target Cap Rate %', value: userPreferences.targetCapRate },
              { key: 'targetCashOnCash', label: 'Target Cash-on-Cash %', value: userPreferences.targetCashOnCash },
              { key: 'operatingExpenseRatio', label: 'Operating Expense %', value: userPreferences.operatingExpenseRatio },
              { key: 'realtorFees', label: 'Realtor/Broker Fees %', value: userPreferences.realtorFees },
              { key: 'closingCosts', label: 'Closing Costs %', value: userPreferences.closingCosts }
            ].map(({ key, label, value }) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#94a3b8' }}>
                  {label}
                </label>
                <input
                  type="number"
                  value={value}
                  step="0.1"
                  onChange={(e) => setUserPreferences(prev => ({
                    ...prev,
                    [key]: parseFloat(e.target.value) || 0
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Creative Financing Profile Panel */}
        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={20} />
            Creative Financing Profile
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '16px' 
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#94a3b8' }}>
                Available Cash
              </label>
              <input
                type="number"
                value={investorProfile.availableCash}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  availableCash: parseInt(e.target.value) || 0
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#94a3b8' }}>
                Credit Score
              </label>
              <input
                type="number"
                value={investorProfile.creditScore}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  creditScore: parseInt(e.target.value) || 0
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#94a3b8' }}>
                Experience Level
              </label>
              <select
                value={investorProfile.experienceLevel}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  experienceLevel: e.target.value
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#94a3b8' }}>
                Risk Tolerance
              </label>
              <select
                value={investorProfile.riskTolerance}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  riskTolerance: e.target.value
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', color: '#94a3b8' }}>
                Primary Goal
              </label>
              <select
                value={investorProfile.primaryGoal}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  primaryGoal: e.target.value
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                <option value="cashflow">Cash Flow</option>
                <option value="appreciation">Appreciation</option>
                <option value="portfolio">Portfolio Growth</option>
                <option value="flip">Fix & Flip</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={investorProfile.openToSellerFinancing}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  openToSellerFinancing: e.target.checked
                }))}
                style={{ transform: 'scale(1.2)' }}
              />
              <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Open to Seller Financing
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={investorProfile.openToSubjectTo}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  openToSubjectTo: e.target.checked
                }))}
                style={{ transform: 'scale(1.2)' }}
              />
              <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Open to Subject-To
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={investorProfile.openToPartnerships}
                onChange={(e) => setInvestorProfile(prev => ({
                  ...prev,
                  openToPartnerships: e.target.checked
                }))}
                style={{ transform: 'scale(1.2)' }}
              />
              <label style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                Open to Partnerships
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          {/* Input Panel */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #334155'
          }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ color: '#06b6d4' }} size={20} />
              Property Listing
            </h3>
            
            <textarea
              value={propertyListing}
              onChange={(e) => setPropertyListing(e.target.value)}
              placeholder="Paste your property listing here... or upload an offering memorandum below"
              style={{
                width: '100%',
                height: '200px',
                padding: '16px',
                background: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                resize: 'vertical',
                marginBottom: '16px'
              }}
            />

            {/* Enhanced informational note */}
            <div style={{
              background: pdfLibLoaded ? '#065f46' : '#374151',
              border: `1px solid ${pdfLibLoaded ? '#059669' : '#4b5563'}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.875rem',
              color: pdfLibLoaded ? '#d1fae5' : '#94a3b8'
            }}>
              {pdfLibLoaded ? (
                <>🚀 <strong>PDF Parser Ready:</strong> Upload offering memorandums for automatic data extraction using PDF.js. The tool will parse key financial metrics, property details, and generate comprehensive analysis from professional real estate documents.</>
              ) : (
                <>⏳ <strong>Loading PDF Parser:</strong> Initializing PDF.js for document processing...</>
              )}
            </div>

            {/* File Upload Section */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ 
                marginBottom: '12px', 
                color: '#06b6d4', 
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Upload size={16} />
                Upload Offering Memorandum
              </h4>
              
              <div style={{
                border: '2px dashed #4b5563',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                background: loading ? '#374151' : '#374151',
                marginBottom: '12px',
                opacity: loading ? 0.7 : 1
              }}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={loading || !pdfLibLoaded}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  style={{
                    cursor: (loading || !pdfLibLoaded) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: !pdfLibLoaded ? 0.6 : 1
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #06b6d4',
                        borderTop: '3px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span style={{ color: '#06b6d4', fontSize: '0.875rem', fontWeight: '600' }}>
                        Processing PDF...
                      </span>
                    </>
                  ) : !pdfLibLoaded ? (
                    <>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #94a3b8',
                        borderTop: '3px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Loading PDF engine...
                      </span>
                    </>
                  ) : (
                    <>
                      <File size={32} style={{ color: '#06b6d4' }} />
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Click to upload PDF, DOC, or TXT file
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        ✅ PDF.js Ready • Professional offering memorandums supported
                      </span>
                    </>
                  )}
                </label>
              </div>

              {uploadedFile && !loading && (
                <div style={{
                  background: '#065f46',
                  border: '1px solid #059669',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.875rem',
                  color: '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={14} />
                  {uploadedFile.name} processed successfully
                </div>
              )}

              {uploadedFileContent && !loading && (
                <div style={{
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  marginTop: '8px',
                  maxHeight: '150px',
                  overflow: 'auto'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <strong>Extracted Content ({uploadedFileContent.length} characters):</strong>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {uploadedFileContent.length > 1000 && (
                        <span style={{ 
                          background: '#10b981', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '0.6rem'
                        }}>
                          Rich Content
                        </span>
                      )}
                      {uploadedFile?.type === 'application/pdf' && (
                        <span style={{ 
                          background: '#8b5cf6', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '0.6rem'
                        }}>
                          PDF Parsed
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ 
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {uploadedFileContent.substring(0, 500)}
                    {uploadedFileContent.length > 500 && '...'}
                  </div>
                  
                  {uploadedFileContent.includes('$') && uploadedFileContent.length > 500 && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: '#065f46',
                      borderRadius: '4px',
                      fontSize: '0.7rem'
                    }}>
                      <strong style={{ color: '#a7f3d0' }}>🎯 Ready for Analysis:</strong>
                      <span style={{ color: '#d1fae5', marginLeft: '6px' }}>
                        Financial data detected - click "Analyze Property" to process
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={analyzeProperty}
                disabled={loading || (!propertyListing.trim() && !uploadedFileContent)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: loading ? '#4b5563' : 'linear-gradient(to right, #06b6d4, #0891b2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff40',
                      borderTop: '2px solid #ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Calculator size={16} />
                    Analyze Property
                  </>
                )}
              </button>
              
              <button
                onClick={() => setPropertyListing(sampleListing)}
                style={{
                  padding: '12px 16px',
                  background: '#374151',
                  color: '#94a3b8',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Sample
              </button>
            </div>
          </div>

          {/* Empty state for no analysis */}
          {!analysis && (
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #334155',
              textAlign: 'center'
            }}>
              <Eye size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#94a3b8' }} />
              <p style={{ color: '#94a3b8' }}>Paste a property listing or upload an offering memorandum and click "Analyze Property" to see instant AI analysis + creative financing options</p>
            </div>
          )}
        </div>

        {/* Analysis Results - Split Layout */}
        {analysis && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            {/* LEFT SIDE: Creative Financing */}
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #334155'
            }}>
              {/* Creative Financing Deal Structures */}
              {dealStructures && dealStructures.length > 0 && (
                <div style={{
                  background: '#0f172a',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '2px solid #8b5cf6'
                }}>
                  <h4 style={{ 
                    margin: '0 0 20px 0', 
                    color: '#8b5cf6', 
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    🧙‍♂️ Creative Financing Wizard
                    {sellerMotivation && (
                      <div style={{
                        fontSize: '0.875rem',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: `${sellerMotivation.color}20`,
                        color: sellerMotivation.color,
                        border: `1px solid ${sellerMotivation.color}`
                      }}>
                        Seller: {sellerMotivation.level}
                      </div>
                    )}
                  </h4>

                  {sellerMotivation && sellerMotivation.indicators.length > 0 && (
                    <div style={{
                      background: '#1e293b',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '24px',
                      border: '1px solid #334155'
                    }}>
                      <h5 style={{ color: '#06b6d4', margin: '0 0 12px 0', fontSize: '1rem' }}>
                        📊 Seller Motivation Analysis (Score: {sellerMotivation.score}/100)
                      </h5>
                      <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                        {sellerMotivation.indicators.map((indicator, index) => (
                          <div key={index} style={{ color: '#e2e8f0', marginBottom: '4px' }}>
                            {indicator}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    display: 'grid', 
                    gap: '20px'
                  }}>
                    {dealStructures.slice(0, 3).map((structure, index) => {
                      const riskAssessment = assessDealRisk(structure, analysis.propertyData, {});
                      
                      return (
                        <div key={structure.id} style={{
                          background: '#1e293b',
                          borderRadius: '12px',
                          padding: '20px',
                          border: index === 0 ? '2px solid #10b981' : '1px solid #334155',
                          position: 'relative'
                        }}>
                          {/* Header */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <h5 style={{ 
                                color: '#06b6d4', 
                                margin: '0 0 6px 0', 
                                fontSize: '1.125rem',
                                fontWeight: '600'
                              }}>
                                {index === 0 && '🏆 '}{structure.name}
                              </h5>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{
                                  background: '#374151',
                                  color: '#94a3b8',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem'
                                }}>
                                  {structure.type}
                                </span>
                                <span style={{
                                  background: structure.creativity === 'Extreme' ? '#ef444420' : 
                                             structure.creativity === 'Very High' ? '#f9731620' :
                                             structure.creativity === 'High' ? '#f59e0b20' : '#10b98120',
                                  color: structure.creativity === 'Extreme' ? '#ef4444' : 
                                         structure.creativity === 'Very High' ? '#f97316' :
                                         structure.creativity === 'High' ? '#f59e0b' : '#10b981',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  border: `1px solid ${structure.creativity === 'Extreme' ? '#ef4444' : 
                                                       structure.creativity === 'Very High' ? '#f97316' :
                                                       structure.creativity === 'High' ? '#f59e0b' : '#10b981'}`
                                }}>
                                  {structure.creativity}
                                </span>
                              </div>
                            </div>
                            
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: 'bold', 
                                color: structure.cashRequired === 0 ? '#10b981' : '#06b6d4'
                              }}>
                                ${structure.cashRequired.toLocaleString()}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                Cash Required
                              </div>
                              <div style={{ 
                                fontSize: '0.8rem', 
                                color: structure.probability >= 70 ? '#10b981' : 
                                       structure.probability >= 50 ? '#f59e0b' : '#ef4444',
                                marginTop: '2px'
                              }}>
                                {structure.probability}% Success
                              </div>
                            </div>
                          </div>

                          {/* Key Numbers */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '12px',
                            marginBottom: '16px',
                            background: '#374151',
                            padding: '12px',
                            borderRadius: '8px'
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: 'bold', 
                                color: structure.monthlyNumbers.netCashFlow >= 0 ? '#10b981' : '#ef4444'
                              }}>
                                ${Math.round(structure.monthlyNumbers.netCashFlow).toLocaleString()}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Monthly Cash</div>
                            </div>
                            
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                                {structure.timeline}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Timeline</div>
                            </div>
                          </div>

                          {/* Deal Structure Visual - Compact */}
                          <div style={{
                            background: '#0f172a',
                            borderRadius: '6px',
                            padding: '12px',
                            marginBottom: '16px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            border: '1px solid #334155'
                          }}>
                            <div style={{ color: '#06b6d4', marginBottom: '8px', fontWeight: 'bold' }}>
                              💰 DEAL STRUCTURE
                            </div>
                            {structure.type === 'Seller Financing' && (
                              <div style={{ color: '#e2e8f0', lineHeight: '1.4' }}>
                                <div>🏦 Bank: ${(structure.structure.bankLoan/1000).toFixed(0)}K</div>
                                <div>🤝 Seller: ${(structure.structure.sellerCarry/1000).toFixed(0)}K @ {structure.structure.sellerTerms.rate}%</div>
                                <div>💵 Your Cash: ${(structure.structure.yourCash/1000).toFixed(0)}K</div>
                              </div>
                            )}
                            
                            {structure.type === 'Subject-To Hybrid' && (
                              <div style={{ color: '#e2e8f0', lineHeight: '1.4' }}>
                                <div>🏠 Existing: ${(structure.structure.existingLoan/1000).toFixed(0)}K</div>
                                <div>📝 Seller Note: ${(structure.structure.sellerNote/1000).toFixed(0)}K</div>
                                <div>💰 Your Cash: ${(structure.structure.yourCash/1000).toFixed(0)}K</div>
                              </div>
                            )}
                            
                            {structure.type === 'Equity Partnership' && (
                              <div style={{ color: '#e2e8f0', lineHeight: '1.4' }}>
                                <div>🏦 Bank: ${(structure.structure.bankLoan/1000).toFixed(0)}K</div>
                                <div>🤝 Partner: {structure.structure.partnerEquity.toFixed(0)}% equity</div>
                                <div>💵 Your Cash: ${(structure.structure.yourCash/1000).toFixed(0)}K</div>
                              </div>
                            )}

                            {(structure.type === 'BRRRR Strategy' || structure.type === 'Assignment Strategy' || structure.type === 'Master Lease Option' || structure.type === 'Contract for Deed' || structure.type === 'Hard Money Bridge' || structure.type === 'Private Lending' || structure.type === 'Loan Assumption') && (
                              <div style={{ color: '#e2e8f0', lineHeight: '1.4' }}>
                                <div>💰 Cash: ${(structure.cashRequired/1000).toFixed(0)}K</div>
                                <div>📊 Monthly: ${Math.round(structure.monthlyNumbers.netCashFlow).toLocaleString()}</div>
                                <div>⏰ {structure.timeline}</div>
                              </div>
                            )}
                          </div>

                          {/* Exit Strategy - Compact */}
                          <div style={{
                            background: '#065f46',
                            border: '1px solid #059669',
                            borderRadius: '6px',
                            padding: '10px',
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#d1fae5', fontSize: '0.8rem', fontWeight: '600' }}>
                              🎯 {structure.exitStrategy.length > 60 ? structure.exitStrategy.substring(0, 60) + '...' : structure.exitStrategy}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {dealStructures.length > 3 && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '16px',
                      color: '#94a3b8',
                      fontSize: '0.875rem'
                    }}>
                      <p>+ {dealStructures.length - 3} more creative options</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Traditional Analysis */}
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #334155'
            }}>
              {/* Recommendation Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  background: `${analysis.recommendation.color}20`,
                  border: `2px solid ${analysis.recommendation.color}`,
                  borderRadius: '12px',
                  color: analysis.recommendation.color,
                  fontSize: '1.25rem',
                  fontWeight: 'bold'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{analysis.recommendation.emoji}</span>
                  {analysis.recommendation.text}
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '1rem', 
                  color: '#94a3b8' 
                }}>
                  Investment Score: {analysis.dealScore.score}/100
                </div>
                
                {/* Score Bar */}
                <div style={{ 
                  width: '100%', 
                  maxWidth: '250px',
                  height: '10px', 
                  background: '#374151', 
                  borderRadius: '5px', 
                  overflow: 'hidden',
                  margin: '6px auto'
                }}>
                  <div style={{ 
                    width: `${analysis.dealScore.score}%`, 
                    height: '100%', 
                    background: `linear-gradient(to right, ${analysis.recommendation.color}, ${analysis.recommendation.color}aa)`, 
                    transition: 'width 0.8s ease',
                    borderRadius: '5px'
                  }}></div>
                </div>
              </div>

              {/* AI Commentary */}
              <div style={{
                background: '#374151',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #4b5563'
              }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  color: '#06b6d4',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🤖 AI Investment Analysis
                </h4>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                  {analysis.aiCommentary.slice(0, 4).map((comment, index) => (
                    <div key={index} style={{ 
                      marginBottom: '12px',
                      color: '#e2e8f0',
                      padding: '6px 0'
                    }}>
                      {comment.includes('**') ? (
                        <div dangerouslySetInnerHTML={{
                          __html: comment.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #06b6d4;">$1</strong>')
                        }} />
                      ) : (
                        comment
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '14px', 
                marginBottom: '20px' 
              }}>
                <div style={{ 
                  textAlign: 'center',
                  background: '#374151',
                  padding: '14px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#06b6d4' }}>
                    {analysis.returns.capRate.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cap Rate</div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: '#374151',
                  padding: '14px',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: analysis.returns.beforeTaxCashFlow >= 0 ? '#10b981' : '#ef4444' 
                  }}>
                    ${Math.round(analysis.returns.monthlyCashFlow).toLocaleString()}/mo
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cash Flow</div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: '#374151',
                  padding: '14px',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: analysis.returns.cashOnCashReturn >= 0 ? '#8b5cf6' : '#ef4444' 
                  }}>
                    {analysis.returns.cashOnCashReturn.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cash-on-Cash</div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: '#374151',
                  padding: '14px',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: analysis.returns.debtServiceCoverageRatio >= 1.2 ? '#10b981' : '#ef4444' 
                  }}>
                    {analysis.returns.debtServiceCoverageRatio.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>DSCR</div>
                </div>
              </div>

              {/* Additional Key Metrics */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '10px', 
                marginBottom: '20px' 
              }}>
                <div style={{ 
                  textAlign: 'center',
                  background: '#4b5563',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {analysis.returns.loanConstant.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Loan Constant</div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: '#4b5563',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ec4899' }}>
                    ${(analysis.returns.pricePerUnit/1000).toFixed(0)}K
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Price/Unit</div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  background: '#4b5563',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#06b6d4' }}>
                    ${(analysis.returns.netOperatingIncome/1000).toFixed(0)}K
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Annual NOI</div>
                </div>
              </div>

              {/* Investment Summary */}
              <div style={{
                background: '#374151',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '1rem' }}>Investment Summary</h4>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px', 
                  marginBottom: '12px' 
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                      Total Cash Required
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#06b6d4' }}>
                      ${analysis.financing.totalCashNeeded.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                      Annual Cash Flow
                    </div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold', 
                      color: analysis.returns.beforeTaxCashFlow >= 0 ? '#10b981' : '#ef4444' 
                    }}>
                      ${analysis.returns.beforeTaxCashFlow.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  borderTop: '1px solid #4b5563', 
                  paddingTop: '12px' 
                }}>
                  <div style={{ fontSize: '0.8rem', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span>Down Payment ({userPreferences.downPayment}%):</span>
                      <span>${analysis.financing.downPayment.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span>Closing Costs:</span>
                      <span>${(analysis.financing.realtorFees + analysis.financing.closingCosts).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Annual Debt Service:</span>
                      <span>${analysis.financing.annualDebtService.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Projections */}
              <div style={{
                background: '#374151',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#06b6d4', 
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📊 5-Year Projections
                </h4>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '3px' }}>Total Cash Flow</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                      ${(analysis.returns.beforeTaxCashFlow * 5).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '3px' }}>Appreciation</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                      ${(analysis.propertyData.price * 0.15).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '3px' }}>Total Return</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      ${((analysis.returns.beforeTaxCashFlow * 5) + (analysis.propertyData.price * 0.15)).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '3px' }}>Est. IRR</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ec4899' }}>
                      {(((analysis.returns.beforeTaxCashFlow * 5) + (analysis.propertyData.price * 0.15)) / analysis.financing.totalCashNeeded * 20).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Improvement Recommendations - Compact */}
              {analysis.improvementRecommendations && analysis.improvementRecommendations.length > 0 && (
                <div style={{
                  background: '#065f46',
                  border: '1px solid #059669',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h4 style={{ 
                    color: '#d1fae5', 
                    margin: '0 0 12px 0', 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    💡 Key Improvements
                  </h4>
                  {analysis.improvementRecommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: '#a7f3d0', 
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ 
                          background: rec.priority === 'High' ? '#ef4444' : '#f59e0b',
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '2px 4px',
                          borderRadius: '3px'
                        }}>
                          {rec.priority}
                        </span>
                        {rec.category}
                      </div>
                      <ul style={{ 
                        color: '#d1fae5', 
                        fontSize: '0.8rem', 
                        margin: '0', 
                        paddingLeft: '16px' 
                      }}>
                        {rec.recommendations.slice(0, 2).map((recommendation, recIndex) => (
                          <li key={recIndex} style={{ marginBottom: '3px' }}>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#374151',
              color: 'white',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
            Back to Home
          </button>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    </div>
  );
};

export default PropertyScrapePage;