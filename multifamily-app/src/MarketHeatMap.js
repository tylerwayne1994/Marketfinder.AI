import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, TrendingUp, DollarSign, Home, Users, Filter, Calendar, Info, AlertTriangle, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';

const MarketHeatMap = ({ setCurrentPage }) => {
  const [selectedMetric, setSelectedMetric] = useState('populationGrowth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countyData, setCountyData] = useState({});
  const [geoData, setGeoData] = useState(null);
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [fmrLoadStatus, setFmrLoadStatus] = useState({ loaded: false, error: null, attempted: false });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // State name to abbreviation mapping
  const stateNameToAbbrev = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC'
  };

  const colors = useMemo(() => ({
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gray: {
      dark: '#374151',
      medium: '#4b5563',
      light: '#6b7280',
      lighter: '#94a3b8',
      lightest: '#cbd5e1'
    }
  }), []);

  const metrics = useMemo(() => ({
    populationGrowth: {
      name: 'Population Growth',
      icon: Users,
      color: colors.success,
      unit: 'percent',
      description: 'Population total and growth rate',
      range: [-2, 4]
    },
    jobGrowth: {
      name: 'Employment & Economy',
      icon: TrendingUp,
      color: colors.primary,
      unit: 'percent',
      description: 'Employment strength and economic opportunity',
      range: [0, 100]
    },
    housingMetrics: {
      name: 'Housing Market',
      icon: Home,
      color: colors.accent,
      unit: 'percent',
      description: 'Renter percentage and vacancy rates',
      range: [-20, 60]
    },
    rentAnalysis: {
      name: 'Live Market Rents',
      icon: DollarSign,
      color: colors.warning,
      unit: 'dollar',
      description: 'AI-powered current market rent estimates',
      range: [500, 2500]
    }
  }), [colors]);

  // Clean Census data values
  const cleanValue = (value) => {
    if (value === null || value === undefined || value === '' || 
        value === '-' || value === 'N' || value === '(X)' || 
        String(value).includes('-666') || String(value).includes('-888') || 
        String(value).includes('-999')) {
      return null;
    }
    return typeof value === 'string' ? parseFloat(value) || null : value;
  };

  // Extract FIPS code from GEO_ID
  const extractFips = (geoId) => {
    if (typeof geoId === 'string' && geoId.includes('US')) {
      return geoId.split('US')[1];
    }
    return null;
  };

  // Parse county name and state
  const parseLocation = (name) => {
    if (typeof name === 'string' && name.includes(',')) {
      const parts = name.split(',').map(part => part.trim());
      return {
        county: parts[0],
        state: parts[1]
      };
    }
    return { county: name, state: null };
  };

  // 🏢 ADVANCED MARKET CLASSIFICATION ALGORITHM
  const classifyMarket = (county) => {
    let indicators = 0;
    let marketFactors = {
      growth: 0,
      employment: 0,
      income: 0,
      housing: 0,
      demographics: 0
    };
    
    // 📈 POPULATION GROWTH FACTOR (Weight: 25%)
    if (county.populationGrowth !== null && county.populationGrowth !== undefined) {
      if (county.populationGrowth > 3) marketFactors.growth = 30;      // Explosive growth
      else if (county.populationGrowth > 1.5) marketFactors.growth = 25; // Strong growth
      else if (county.populationGrowth > 0.5) marketFactors.growth = 20; // Moderate growth
      else if (county.populationGrowth > 0) marketFactors.growth = 15;   // Slow growth
      else if (county.populationGrowth > -1) marketFactors.growth = 10;  // Mild decline
      else marketFactors.growth = 5; // Significant decline
      indicators++;
    }
    
    // 💼 EMPLOYMENT STRENGTH FACTOR (Weight: 25%)
    if (county.employmentRate && county.unemploymentRate) {
      const employmentStrength = county.employmentRate - (county.unemploymentRate * 1.5);
      if (employmentStrength > 85) marketFactors.employment = 30;
      else if (employmentStrength > 75) marketFactors.employment = 25;
      else if (employmentStrength > 65) marketFactors.employment = 20;
      else if (employmentStrength > 55) marketFactors.employment = 15;
      else marketFactors.employment = 10;
      indicators++;
    }
    
    // 💰 INCOME FACTOR (Weight: 20%)
    if (county.medianHouseholdIncome) {
      if (county.medianHouseholdIncome > 100000) marketFactors.income = 25;
      else if (county.medianHouseholdIncome > 80000) marketFactors.income = 22;
      else if (county.medianHouseholdIncome > 65000) marketFactors.income = 18;
      else if (county.medianHouseholdIncome > 50000) marketFactors.income = 15;
      else if (county.medianHouseholdIncome > 40000) marketFactors.income = 12;
      else marketFactors.income = 8;
      indicators++;
    }
    
    // 🏠 HOUSING MARKET FACTOR (Weight: 20%)
    if (county.vacancyRate !== null && county.renterPercentage !== null) {
      let housingScore = 0;
      
      // Vacancy rate impact (lower = better market)
      if (county.vacancyRate < 3) housingScore += 15;      // Very tight
      else if (county.vacancyRate < 5) housingScore += 12; // Tight
      else if (county.vacancyRate < 8) housingScore += 10; // Balanced
      else if (county.vacancyRate < 12) housingScore += 7; // Soft
      else housingScore += 4; // Oversupplied
      
      // Renter percentage (higher = more rental demand)
      if (county.renterPercentage > 50) housingScore += 10;
      else if (county.renterPercentage > 40) housingScore += 8;
      else if (county.renterPercentage > 30) housingScore += 6;
      else housingScore += 4;
      
      marketFactors.housing = housingScore;
      indicators++;
    }
    
    // 👥 DEMOGRAPHIC FACTOR (Weight: 10%)
    if (county.totalPopulation) {
      if (county.totalPopulation > 500000) marketFactors.demographics = 15; // Major metro
      else if (county.totalPopulation > 200000) marketFactors.demographics = 12; // Large county
      else if (county.totalPopulation > 100000) marketFactors.demographics = 10; // Medium county
      else if (county.totalPopulation > 50000) marketFactors.demographics = 8;  // Small county
      else marketFactors.demographics = 6; // Rural
      indicators++;
    }
    
    if (indicators === 0) return { type: 'unknown', score: 0, factors: marketFactors };
    
    // Calculate weighted average
    const totalScore = (
      marketFactors.growth * 0.25 +
      marketFactors.employment * 0.25 +
      marketFactors.income * 0.20 +
      marketFactors.housing * 0.20 +
      marketFactors.demographics * 0.10
    );
    
    let marketType;
    if (totalScore >= 23) marketType = 'superHot';      // 23-30: Explosive markets
    else if (totalScore >= 18) marketType = 'hot';      // 18-22: Strong markets
    else if (totalScore >= 14) marketType = 'warm';     // 14-17: Growing markets
    else if (totalScore >= 10) marketType = 'average';  // 10-13: Stable markets
    else if (totalScore >= 7) marketType = 'cool';      // 7-9: Slow markets
    else marketType = 'cold';                           // 0-6: Declining markets
    
    return { 
      type: marketType, 
      score: Math.round(totalScore * 10) / 10, 
      factors: marketFactors,
      confidence: Math.min(100, Math.round((indicators / 5) * 100))
    };
  };

  // 🎯 ADVANCED FMR-TO-MARKET RENT CALCULATOR
  const estimateMarketRent = (fmr, marketAnalysis, county) => {
    if (!fmr || fmr <= 0) return null;
    
    // Base multipliers (FMR = 40th percentile, so we estimate other percentiles)
    const baseMultipliers = {
      superHot: { 
        market: 1.45,    // 50th percentile (market median)
        competitive: 1.75, // 70th percentile
        premium: 1.95,   // 80th percentile
        luxury: 2.25     // 90th percentile
      },
      hot: { 
        market: 1.35, 
        competitive: 1.65, 
        premium: 1.85, 
        luxury: 2.05 
      },
      warm: { 
        market: 1.28, 
        competitive: 1.55, 
        premium: 1.75, 
        luxury: 1.90 
      },
      average: { 
        market: 1.25, 
        competitive: 1.50, 
        premium: 1.70, 
        luxury: 1.85 
      },
      cool: { 
        market: 1.18, 
        competitive: 1.40, 
        premium: 1.55, 
        luxury: 1.70 
      },
      cold: { 
        market: 1.12, 
        competitive: 1.30, 
        premium: 1.45, 
        luxury: 1.60 
      },
      unknown: { 
        market: 1.25, 
        competitive: 1.50, 
        premium: 1.70, 
        luxury: 1.85 
      }
    };
    
    // Get base multipliers for market type
    const multipliers = baseMultipliers[marketAnalysis.type] || baseMultipliers.unknown;
    
    // 🔧 DYNAMIC ADJUSTMENTS based on specific factors
    let adjustmentFactor = 1.0;
    
    // Income adjustment (high income areas = higher rent premiums)
    if (county.medianHouseholdIncome) {
      if (county.medianHouseholdIncome > 120000) adjustmentFactor += 0.08;
      else if (county.medianHouseholdIncome > 90000) adjustmentFactor += 0.05;
      else if (county.medianHouseholdIncome > 70000) adjustmentFactor += 0.02;
      else if (county.medianHouseholdIncome < 35000) adjustmentFactor -= 0.05;
    }
    
    // Population growth momentum adjustment
    if (county.populationGrowth > 4) adjustmentFactor += 0.06;
    else if (county.populationGrowth > 2) adjustmentFactor += 0.03;
    else if (county.populationGrowth < -1) adjustmentFactor -= 0.04;
    
    // Housing supply constraint adjustment
    if (county.vacancyRate < 2) adjustmentFactor += 0.08;  // Very constrained supply
    else if (county.vacancyRate < 4) adjustmentFactor += 0.04; // Tight supply
    else if (county.vacancyRate > 15) adjustmentFactor -= 0.06; // Oversupplied
    
    // Apply adjustments to multipliers
    const adjustedMultipliers = {
      market: multipliers.market * adjustmentFactor,
      competitive: multipliers.competitive * adjustmentFactor,
      premium: multipliers.premium * adjustmentFactor,
      luxury: multipliers.luxury * adjustmentFactor
    };
    
    // Calculate estimated rents
    const estimates = {
      fmr: Math.round(fmr),
      marketMedian: Math.round(fmr * adjustedMultipliers.market),
      competitiveRent: Math.round(fmr * adjustedMultipliers.competitive),
      premiumRent: Math.round(fmr * adjustedMultipliers.premium),
      luxuryRent: Math.round(fmr * adjustedMultipliers.luxury),
      
      // Market analysis data
      marketType: marketAnalysis.type,
      marketScore: marketAnalysis.score,
      confidence: marketAnalysis.confidence,
      adjustmentFactor: Math.round(adjustmentFactor * 1000) / 1000,
      
      // Rent spreads and insights
      marketPremiumVsFMR: Math.round(((adjustedMultipliers.market - 1) * 100)),
      rentSpread: Math.round(fmr * adjustedMultipliers.luxury) - Math.round(fmr * adjustedMultipliers.market),
      
      // Investment insights
      sectionVsMarket: Math.round(((adjustedMultipliers.market - 1) * 100)), // Premium over Section 8
      cashFlowPotential: marketAnalysis.type === 'hot' || marketAnalysis.type === 'superHot' ? 'High' : 
                        marketAnalysis.type === 'warm' ? 'Medium' : 'Conservative'
    };
    
    // Add rent affordability analysis
    if (county.medianHouseholdIncome) {
      const monthlyIncome = county.medianHouseholdIncome / 12;
      estimates.affordabilityIndex = Math.round((estimates.marketMedian / monthlyIncome) * 100);
      estimates.affordableToMedianIncome = estimates.affordabilityIndex <= 30; // 30% rule
    }
    
    return estimates;
  };

  // Get metric value for coloring
  const getMetricValue = (county, metric) => {
    switch (metric) {
      case 'populationGrowth':
        return county.populationGrowth;
      case 'jobGrowth':
        return county.employmentStrength || 0;
      case 'housingMetrics':
        return county.housingMarketScore || 0;
      case 'rentAnalysis':
        return county.estimatedMarketRent || county.privateMarketRent || 0;
      default:
        return 0;
    }
  };

  // Helper to load CSV with better error handling
  const loadCSV = async (url, type) => {
    try {
      console.log(`📥 Loading ${type} from: ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('File is empty');
      }
      
      const result = Papa.parse(text, { 
        header: true, 
        dynamicTyping: true,
        skipEmptyLines: true 
      });
      
      if (result.errors && result.errors.length > 0) {
        console.warn(`⚠️ Parse warnings in ${type}:`, result.errors.slice(0, 3));
      }
      
      console.log(`✅ ${type} loaded: ${result.data.length} rows, fields: ${result.meta.fields?.slice(0, 5).join(', ')}...`);
      return { type, data: result.data.slice(1), fields: result.meta.fields };
    } catch (error) {
      console.error(`❌ Error loading ${type} from ${url}:`, error.message);
      return { type, data: [], fields: [], error: error.message };
    }
  };



  // Load and process Census data
  useEffect(() => {
    // Process and combine Census data
    const processCensusData = (datasets) => {
      const combined = {};
      
      const { economic = [], housing = [], population2023 = [], population2018 = [], employment = [], fmr = [] } = datasets;
      
      // Start with economic data (DP03) as base
      economic.forEach(row => {
        const geoId = row.GEO_ID;
        const fips = extractFips(geoId);
        const location = parseLocation(row.NAME);
        
        if (!fips || !location.county) return;
        
        const key = `${location.county}, ${location.state}`;
        
        combined[key] = {
          fips: fips,
          name: location.county,
          state: location.state,
          geoId: geoId,
          medianHouseholdIncome: cleanValue(row.DP03_0051E),
          meanHouseholdIncome: cleanValue(row.DP03_0052E),
          povertyRate: cleanValue(row.DP03_0119PE),
          medianEarnings: cleanValue(row.DP03_0062E),
          laborForceParticipation: cleanValue(row.DP03_0002PE),
          employmentRateDP03: cleanValue(row.DP03_0003PE),
          unemploymentRateDP03: cleanValue(row.DP03_0005PE)
        };
      });
      
      console.log(`✅ Economic data processed: ${Object.keys(combined).length} counties`);
      
      // Add housing data (DP04)
      const housingMap = new Map();
      housing.forEach(row => {
        const geoId = row.GEO_ID;
        const fips = extractFips(geoId);
        if (fips) housingMap.set(fips, row);
      });
      
      Object.values(combined).forEach(county => {
        const housingRow = housingMap.get(county.fips);
        if (housingRow) {
          county.totalHousingUnits = cleanValue(housingRow.DP04_0001E);
          county.occupiedUnits = cleanValue(housingRow.DP04_0002E);
          county.vacantUnits = cleanValue(housingRow.DP04_0003E);
          county.vacancyRate = cleanValue(housingRow.DP04_0003PE);
          county.ownerOccupiedUnits = cleanValue(housingRow.DP04_0046E);
          county.renterOccupiedUnits = cleanValue(housingRow.DP04_0047E);
          county.medianHomeValue = cleanValue(housingRow.DP04_0080E);
          county.medianGrossRent = cleanValue(housingRow.DP04_0134E);
          county.medianOwnerCosts = cleanValue(housingRow.DP04_0101E);
          
          if (county.ownerOccupiedUnits && county.occupiedUnits && county.occupiedUnits > 0) {
            county.homeownershipRate = (county.ownerOccupiedUnits / county.occupiedUnits) * 100;
            county.renterPercentage = 100 - county.homeownershipRate;
          }
          
          county.privateMarketRent = county.medianGrossRent;
          
          if (county.privateMarketRent && county.medianHouseholdIncome) {
            county.rentAffordabilityRatio = (county.privateMarketRent * 12) / county.medianHouseholdIncome;
          }
        }
      });
      
      console.log(`✅ Housing data added`);
      
      // Add population data (B01003) - both current and historical
      const population2023Map = new Map();
      const population2018Map = new Map();
      
      population2023.forEach(row => {
        const geoId = row.GEO_ID;
        const fips = extractFips(geoId);
        if (fips) population2023Map.set(fips, row);
      });
      
      population2018.forEach(row => {
        const geoId = row.GEO_ID;
        const fips = extractFips(geoId);
        if (fips) population2018Map.set(fips, row);
      });
      
      let populationGrowthCalculated = 0;
      
      Object.values(combined).forEach(county => {
        const pop2023Row = population2023Map.get(county.fips);
        const pop2018Row = population2018Map.get(county.fips);
        
        if (pop2023Row) {
          county.totalPopulation = cleanValue(pop2023Row.B01003_001E);
        }
        
        if (pop2023Row && pop2018Row) {
          const currentPop = cleanValue(pop2023Row.B01003_001E);
          const historicalPop = cleanValue(pop2018Row.B01003_001E);
          
          if (currentPop && historicalPop && historicalPop > 0) {
            county.populationGrowth = ((currentPop - historicalPop) / historicalPop) * 100;
            populationGrowthCalculated++;
          }
        }
      });
      
      console.log(`✅ Population data added: ${populationGrowthCalculated} counties with growth calculations`);
      
      // Add employment data (S2301)
      const employmentMap = new Map();
      employment.forEach(row => {
        const geoId = row.GEO_ID;
        const fips = extractFips(geoId);
        if (fips) employmentMap.set(fips, row);
      });
      
      Object.values(combined).forEach(county => {
        const empRow = employmentMap.get(county.fips);
        if (empRow) {
          county.population16Plus = cleanValue(empRow.S2301_C01_001E);
          county.laborForceParticipationRate = cleanValue(empRow.S2301_C02_001E);
          county.employmentRate = cleanValue(empRow.S2301_C03_001E);
          county.unemploymentRate = cleanValue(empRow.S2301_C04_001E);
          
          if (county.population16Plus && county.employmentRate && county.unemploymentRate) {
            const laborForce = (county.population16Plus * county.laborForceParticipationRate) / 100;
            county.totalEmployed = Math.round((laborForce * county.employmentRate) / 100);
            county.totalUnemployed = Math.round((laborForce * county.unemploymentRate) / 100);
          }
        }
      });
      
      console.log(`✅ Employment data added`);
      
      // Add FMR data and calculate market rents by matching county names
      console.log(`🏠 Processing FMR data: ${fmr.length} rows`);
      
      if (fmr.length > 0) {
        console.log(`🔍 FMR Data Structure:`);
        console.log(`- Total rows: ${fmr.length}`);
        console.log(`- Sample row:`, fmr[0]);
        
        // Build FMR lookup by county name + state (since FIPS codes are wrong in FMR file)
        const fmrByCountyName = new Map();
        let validFMRRows = 0;
        
        fmr.forEach((row, index) => {
          const countyName = row['countyname'];
          const stateName = row['stusps'];
          
          const fmr2br = cleanValue(row['fmr_2']);
          const fmr1br = cleanValue(row['fmr_1']);
          const fmr3br = cleanValue(row['fmr_3']);
          
          if (countyName && stateName && fmr2br && fmr2br > 0) {
            const key = `${countyName}, ${stateName}`;
            
            const fmrData = {
              fmr1br,
              fmr2br, 
              fmr3br,
              countyName,
              stateName
            };
            
            fmrByCountyName.set(key, fmrData);
            validFMRRows++;
            
            if (validFMRRows <= 5) {
              console.log(`✅ FMR: ${key} = ${fmr2br}`);
            }
          }
        });
        
        console.log(`🏠 Created FMR lookup with ${validFMRRows} counties by name`);
        
        let fmrMatches = 0;
        
        // Match FMR data to counties by name instead of FIPS (with state abbreviation conversion)
        Object.values(combined).forEach((county, index) => {
          if (county.name && county.state) {
            // Convert full state name to abbreviation for matching
            const stateAbbrev = stateNameToAbbrev[county.state] || county.state;
            const lookupKey = `${county.name}, ${stateAbbrev}`;
            const fmrData = fmrByCountyName.get(lookupKey);
            
            if (fmrData && fmrData.fmr2br) {
              county.fmrRent = fmrData.fmr2br;
              county.fmr1br = fmrData.fmr1br;
              county.fmr3br = fmrData.fmr3br;
              
              // Advanced market analysis
              county.marketAnalysis = classifyMarket(county);
              county.rentEstimates = estimateMarketRent(county.fmrRent, county.marketAnalysis, county);
              
              // Extract key metrics for backward compatibility and display
              if (county.rentEstimates) {
                county.marketType = county.rentEstimates.marketType;
                county.estimatedMarketRent = county.rentEstimates.marketMedian;
                county.rentPremiumVsFMR = county.rentEstimates.marketPremiumVsFMR;
                county.marketScore = county.rentEstimates.marketScore;
                county.marketConfidence = county.rentEstimates.confidence;
                
                // Investment metrics
                county.competitiveRent = county.rentEstimates.competitiveRent;
                county.premiumRent = county.rentEstimates.premiumRent;
                county.luxuryRent = county.rentEstimates.luxuryRent;
                county.cashFlowPotential = county.rentEstimates.cashFlowPotential;
                county.affordabilityIndex = county.rentEstimates.affordabilityIndex;
                
                // Market vs Census comparison
                if (county.privateMarketRent && county.estimatedMarketRent) {
                  county.marketAccuracy = ((county.privateMarketRent - county.estimatedMarketRent) / county.estimatedMarketRent) * 100;
                }
              }
              
              fmrMatches++;
              
              if (fmrMatches <= 3) {
                console.log(`🎯 FMR match: ${lookupKey} - FIPS ${county.fips} - ${county.fmrRent}`);
              }
            } else if (index < 10) {
              console.log(`❌ No FMR match for: ${lookupKey}`);
            }
          }
        });
        console.log(`✅ FMR matches: ${fmrMatches} out of ${Object.keys(combined).length} counties (matched by name)`);
      } else {
        console.log(`❌ No FMR data to process`);
      }
      
      // Calculate derived metrics
      Object.values(combined).forEach(county => {
        if (county.employmentRate && county.unemploymentRate) {
          county.employmentStrength = county.employmentRate - (county.unemploymentRate * 2);
        }
        
        if (county.medianHouseholdIncome && county.povertyRate) {
          county.economicOpportunity = (county.medianHouseholdIncome / 1000) - (county.povertyRate * 5);
        }
        
        if (county.renterPercentage && county.vacancyRate) {
          county.housingMarketScore = county.renterPercentage - (county.vacancyRate * 2);
        }
      });
      
      console.log(`✅ Derived metrics calculated`);
      
      return combined;
    };

    const loadCensusData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🌍 Loading GeoJSON...');
        const geoResponse = await fetch('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json');
        const geoJson = await geoResponse.json();
        console.log(`✅ GeoJSON loaded: ${geoJson.features.length} counties`);
        setGeoData(geoJson);

        console.log('📊 Loading Census data files...');
        const censusFiles = [
          { url: '/ACSDP5Y2023.DP03-Data.csv', type: 'economic' },
          { url: '/ACSDP5Y2023.DP04-Data.csv', type: 'housing' },
          { url: '/ACSDT5Y2023.B01003-Data.csv', type: 'population2023' },
          { url: '/ACSDT5Y2018.B01003-Data.csv', type: 'population2018' },
          { url: '/ACSST5Y2023.S2301-Data.csv', type: 'employment' },
          { url: '/FY25_FMRs_corrected_final_static.csv', type: 'fmr' }
        ];

        const dataPromises = censusFiles.map(file => loadCSV(file.url, file.type));
        const results = await Promise.allSettled(dataPromises);
        
        const loadedData = {};
        results.forEach((result, index) => {
          const file = censusFiles[index];
          if (result.status === 'fulfilled') {
            console.log(`✅ ${result.value.type}: ${result.value.data.length} rows`);
            loadedData[result.value.type] = result.value.data;
            
            if (result.value.type === 'fmr') {
              setFmrLoadStatus({ loaded: true, error: null, attempted: true, filePath: file.url });
            }
          } else {
            console.error(`❌ Failed to load ${file.url}:`, result.reason);
            loadedData[file.type] = [];
            
            if (file.type === 'fmr') {
              setFmrLoadStatus({ loaded: false, error: result.reason.message, attempted: true });
            }
          }
        });
        
        console.log('🔄 Processing Census data...');
        const processedData = processCensusData(loadedData);
        console.log(`✅ Processed data: ${Object.keys(processedData).length} counties`);
        
        setCountyData(processedData);
        
      } catch (error) {
        console.error('❌ Error loading Census data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCensusData();
  }, []);

  // Process and combine Census data
  const processCensusData = (datasets) => {
    const combined = {};
    
    const { economic = [], housing = [], population2023 = [], population2018 = [], employment = [], fmr = [] } = datasets;
    
    // Start with economic data (DP03) as base
    economic.forEach(row => {
      const geoId = row.GEO_ID;
      const fips = extractFips(geoId);
      const location = parseLocation(row.NAME);
      
      if (!fips || !location.county) return;
      
      const key = `${location.county}, ${location.state}`;
      
      combined[key] = {
        fips: fips,
        name: location.county,
        state: location.state,
        geoId: geoId,
        medianHouseholdIncome: cleanValue(row.DP03_0051E),
        meanHouseholdIncome: cleanValue(row.DP03_0052E),
        povertyRate: cleanValue(row.DP03_0119PE),
        medianEarnings: cleanValue(row.DP03_0062E),
        laborForceParticipation: cleanValue(row.DP03_0002PE),
        employmentRateDP03: cleanValue(row.DP03_0003PE),
        unemploymentRateDP03: cleanValue(row.DP03_0005PE)
      };
    });
    
    console.log(`✅ Economic data processed: ${Object.keys(combined).length} counties`);
    
    // Add housing data (DP04)
    const housingMap = new Map();
    housing.forEach(row => {
      const geoId = row.GEO_ID;
      const fips = extractFips(geoId);
      if (fips) housingMap.set(fips, row);
    });
    
    Object.values(combined).forEach(county => {
      const housingRow = housingMap.get(county.fips);
      if (housingRow) {
        county.totalHousingUnits = cleanValue(housingRow.DP04_0001E);
        county.occupiedUnits = cleanValue(housingRow.DP04_0002E);
        county.vacantUnits = cleanValue(housingRow.DP04_0003E);
        county.vacancyRate = cleanValue(housingRow.DP04_0003PE);
        county.ownerOccupiedUnits = cleanValue(housingRow.DP04_0046E);
        county.renterOccupiedUnits = cleanValue(housingRow.DP04_0047E);
        county.medianHomeValue = cleanValue(housingRow.DP04_0080E);
        county.medianGrossRent = cleanValue(housingRow.DP04_0134E);
        county.medianOwnerCosts = cleanValue(housingRow.DP04_0101E);
        
        if (county.ownerOccupiedUnits && county.occupiedUnits && county.occupiedUnits > 0) {
          county.homeownershipRate = (county.ownerOccupiedUnits / county.occupiedUnits) * 100;
          county.renterPercentage = 100 - county.homeownershipRate;
        }
        
        county.privateMarketRent = county.medianGrossRent;
        
        if (county.privateMarketRent && county.medianHouseholdIncome) {
          county.rentAffordabilityRatio = (county.privateMarketRent * 12) / county.medianHouseholdIncome;
        }
      }
    });
    
    console.log(`✅ Housing data added`);
    
    // Add population data (B01003) - both current and historical
    const population2023Map = new Map();
    const population2018Map = new Map();
    
    population2023.forEach(row => {
      const geoId = row.GEO_ID;
      const fips = extractFips(geoId);
      if (fips) population2023Map.set(fips, row);
    });
    
    population2018.forEach(row => {
      const geoId = row.GEO_ID;
      const fips = extractFips(geoId);
      if (fips) population2018Map.set(fips, row);
    });
    
    let populationGrowthCalculated = 0;
    
    Object.values(combined).forEach(county => {
      const pop2023Row = population2023Map.get(county.fips);
      const pop2018Row = population2018Map.get(county.fips);
      
      if (pop2023Row) {
        county.totalPopulation = cleanValue(pop2023Row.B01003_001E);
      }
      
      if (pop2023Row && pop2018Row) {
        const currentPop = cleanValue(pop2023Row.B01003_001E);
        const historicalPop = cleanValue(pop2018Row.B01003_001E);
        
        if (currentPop && historicalPop && historicalPop > 0) {
          county.populationGrowth = ((currentPop - historicalPop) / historicalPop) * 100;
          populationGrowthCalculated++;
        }
      }
    });
    
    console.log(`✅ Population data added: ${populationGrowthCalculated} counties with growth calculations`);
    
    // Add employment data (S2301)
    const employmentMap = new Map();
    employment.forEach(row => {
      const geoId = row.GEO_ID;
      const fips = extractFips(geoId);
      if (fips) employmentMap.set(fips, row);
    });
    
    Object.values(combined).forEach(county => {
      const empRow = employmentMap.get(county.fips);
      if (empRow) {
        county.population16Plus = cleanValue(empRow.S2301_C01_001E);
        county.laborForceParticipationRate = cleanValue(empRow.S2301_C02_001E);
        county.employmentRate = cleanValue(empRow.S2301_C03_001E);
        county.unemploymentRate = cleanValue(empRow.S2301_C04_001E);
        
        if (county.population16Plus && county.employmentRate && county.unemploymentRate) {
          const laborForce = (county.population16Plus * county.laborForceParticipationRate) / 100;
          county.totalEmployed = Math.round((laborForce * county.employmentRate) / 100);
          county.totalUnemployed = Math.round((laborForce * county.unemploymentRate) / 100);
        }
      }
    });
    
    console.log(`✅ Employment data added`);
    
    // Add FMR data and calculate market rents by matching county names
    console.log(`🏠 Processing FMR data: ${fmr.length} rows`);
    
    if (fmr.length > 0) {
      console.log(`🔍 FMR Data Structure:`);
      console.log(`- Total rows: ${fmr.length}`);
      console.log(`- Sample row:`, fmr[0]);
      
      // Build FMR lookup by county name + state (since FIPS codes are wrong in FMR file)
      const fmrByCountyName = new Map();
      let validFMRRows = 0;
      
      fmr.forEach((row, index) => {
        const countyName = row['countyname'];
        const stateName = row['stusps'];
        
        const fmr2br = cleanValue(row['fmr_2']);
        const fmr1br = cleanValue(row['fmr_1']);
        const fmr3br = cleanValue(row['fmr_3']);
        
        if (countyName && stateName && fmr2br && fmr2br > 0) {
          const key = `${countyName}, ${stateName}`;
          
          const fmrData = {
            fmr1br,
            fmr2br, 
            fmr3br,
            countyName,
            stateName
          };
          
          fmrByCountyName.set(key, fmrData);
          validFMRRows++;
          
          if (validFMRRows <= 5) {
            console.log(`✅ FMR: ${key} = ${fmr2br}`);
          }
        }
      });
      
      console.log(`🏠 Created FMR lookup with ${validFMRRows} counties by name`);
      
      let fmrMatches = 0;
      
      // Match FMR data to counties by name instead of FIPS (with state abbreviation conversion)
      Object.values(combined).forEach((county, index) => {
        if (county.name && county.state) {
          // Convert full state name to abbreviation for matching
          const stateAbbrev = stateNameToAbbrev[county.state] || county.state;
          const lookupKey = `${county.name}, ${stateAbbrev}`;
          const fmrData = fmrByCountyName.get(lookupKey);
          
          if (fmrData && fmrData.fmr2br) {
            county.fmrRent = fmrData.fmr2br;
            county.fmr1br = fmrData.fmr1br;
            county.fmr3br = fmrData.fmr3br;
            
            // Advanced market analysis
            county.marketAnalysis = classifyMarket(county);
            county.rentEstimates = estimateMarketRent(county.fmrRent, county.marketAnalysis, county);
            
            // Extract key metrics for backward compatibility and display
            if (county.rentEstimates) {
              county.marketType = county.rentEstimates.marketType;
              county.estimatedMarketRent = county.rentEstimates.marketMedian;
              county.rentPremiumVsFMR = county.rentEstimates.marketPremiumVsFMR;
              county.marketScore = county.rentEstimates.marketScore;
              county.marketConfidence = county.rentEstimates.confidence;
              
              // Investment metrics
              county.competitiveRent = county.rentEstimates.competitiveRent;
              county.premiumRent = county.rentEstimates.premiumRent;
              county.luxuryRent = county.rentEstimates.luxuryRent;
              county.cashFlowPotential = county.rentEstimates.cashFlowPotential;
              county.affordabilityIndex = county.rentEstimates.affordabilityIndex;
              
              // Market vs Census comparison
              if (county.privateMarketRent && county.estimatedMarketRent) {
                county.marketAccuracy = ((county.privateMarketRent - county.estimatedMarketRent) / county.estimatedMarketRent) * 100;
              }
            }
            
            fmrMatches++;
            
            if (fmrMatches <= 3) {
              console.log(`🎯 FMR match: ${lookupKey} - FIPS ${county.fips} - ${county.fmrRent}`);
            }
          } else if (index < 10) {
            console.log(`❌ No FMR match for: ${lookupKey}`);
          }
        }
      });
      console.log(`✅ FMR matches: ${fmrMatches} out of ${Object.keys(combined).length} counties (matched by name)`);
    } else {
      console.log(`❌ No FMR data to process`);
    }
    
    // Calculate derived metrics
    Object.values(combined).forEach(county => {
      if (county.employmentRate && county.unemploymentRate) {
        county.employmentStrength = county.employmentRate - (county.unemploymentRate * 2);
      }
      
      if (county.medianHouseholdIncome && county.povertyRate) {
        county.economicOpportunity = (county.medianHouseholdIncome / 1000) - (county.povertyRate * 5);
      }
      
      if (county.renterPercentage && county.vacancyRate) {
        county.housingMarketScore = county.renterPercentage - (county.vacancyRate * 2);
      }
    });
    
    console.log(`✅ Derived metrics calculated`);
    
    return combined;
  };

  // Pre-calculate tooltip content to improve performance
  const preCalculateTooltips = useMemo(() => {
    const tooltips = {};
    Object.values(countyData).forEach(county => {
      if (!county.fips) return;
      
      const baseContent = {
        populationGrowth: `
          <div>Total Population: ${county.totalPopulation?.toLocaleString() || 'N/A'}</div>
          <div>Population Growth: ${county.populationGrowth ? county.populationGrowth.toFixed(1) + '%' : 'N/A'}</div>
        `,
        jobGrowth: `
          <div>Median Income: $${county.medianHouseholdIncome?.toLocaleString() || 'N/A'}</div>
          <div>Employed: ${county.totalEmployed?.toLocaleString() || 'N/A'}</div>
          <div>Unemployed: ${county.totalUnemployed?.toLocaleString() || 'N/A'}</div>
          <div>Employment Rate: ${county.employmentRate ? county.employmentRate.toFixed(1) + '%' : 'N/A'}</div>
          <div>Unemployment Rate: ${county.unemploymentRate ? county.unemploymentRate.toFixed(1) + '%' : 'N/A'}</div>
        `,
        housingMetrics: `
          <div>Total Housing Units: ${county.totalHousingUnits?.toLocaleString() || 'N/A'}</div>
          <div>Occupied: ${county.occupiedUnits?.toLocaleString() || 'N/A'}</div>
          <div>Vacant: ${county.vacantUnits?.toLocaleString() || 'N/A'}</div>
          <div>Vacancy Rate: ${county.vacancyRate ? county.vacancyRate.toFixed(1) + '%' : 'N/A'}</div>
          <div>Renter Percentage: ${county.renterPercentage ? county.renterPercentage.toFixed(1) + '%' : 'N/A'}</div>
        `,
        rentAnalysis: `
          <div>FMR (Section 8): ${county.fmrRent?.toLocaleString() || 'N/A'}</div>
          <div>Market Median: ${county.estimatedMarketRent?.toLocaleString() || 'N/A'}</div>
          <div>Competitive: ${county.competitiveRent?.toLocaleString() || 'N/A'}</div>
          <div>Premium: ${county.premiumRent?.toLocaleString() || 'N/A'}</div>
          <div>Luxury: ${county.luxuryRent?.toLocaleString() || 'N/A'}</div>
          <div>Market Type: <span style="color: ${county.marketType === 'superHot' ? '#ef4444' : county.marketType === 'hot' ? '#f59e0b' : county.marketType === 'warm' ? '#10b981' : '#6b7280'}">${county.marketType || 'Unknown'}</span></div>
          <div>Score: ${county.marketScore || 'N/A'}/30 (${county.marketConfidence || 0}% confidence)</div>
          <div>Premium vs FMR: ${county.rentPremiumVsFMR ? '+' + county.rentPremiumVsFMR.toFixed(0) + '%' : 'N/A'}</div>
          <div>Cash Flow: ${county.cashFlowPotential || 'N/A'}</div>
        `
      };
      
      tooltips[county.fips] = baseContent;
    });
    return tooltips;
  }, [countyData]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!geoData || loading || mapInstanceRef.current) return;

    const loadLeaflet = async () => {
      // Wait for the DOM to be ready and ensure container has dimensions
      let retries = 0;
      const maxRetries = 10;
      
      const initMap = () => {
        if (!mapRef.current) {
          console.log('Map ref not available, retrying...');
          if (retries < maxRetries) {
            retries++;
            setTimeout(initMap, 200);
          }
          return;
        }

        // Force a reflow to ensure dimensions are calculated
        mapRef.current.style.height = '100vh';
        mapRef.current.style.width = '100%';
        
        // Check if container has dimensions after setting them
        const rect = mapRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.log(`Map container has no dimensions: ${rect.width}x${rect.height}, retrying...`);
          if (retries < maxRetries) {
            retries++;
            setTimeout(initMap, 200);
          }
          return;
        }

        // Import Leaflet and create map
        import('leaflet').then(L => {
          try {
            console.log('Creating Leaflet map...');
            
            const map = L.default.map(mapRef.current, {
              center: [39.8283, -98.5795],
              zoom: 4,
              zoomControl: true,
              scrollWheelZoom: true
            });

            L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: 'abcd',
              maxZoom: 19
            }).addTo(map);

            mapInstanceRef.current = map;
            console.log('Map created successfully');
            
            // Update county layer after map is ready
            setTimeout(() => {
              updateCountyLayer(L.default, map);
            }, 100);
            
          } catch (error) {
            console.error('Error creating map:', error);
            if (retries < maxRetries) {
              retries++;
              setTimeout(initMap, 500);
            }
          }
        }).catch(error => {
          console.error('Error importing Leaflet:', error);
        });
      };

      // Start the initialization process
      initMap();
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(loadLeaflet, 100);
    });

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [geoData, loading]);

  // Update county layer when metric changes
  useEffect(() => {
    if (mapInstanceRef.current && geoData) {
      import('leaflet').then(L => {
        updateCountyLayer(L.default, mapInstanceRef.current);
      });
    }
  }, [selectedMetric, countyData, geoData]);

  const updateCountyLayer = (L, map) => {
    // Clear all existing layers and tooltips
    map.eachLayer(layer => {
      if (layer.feature) {
        map.removeLayer(layer);
      }
    });

    // Clear any existing timeouts
    map.off();
    
    // Clear any lingering tooltips
    const tooltips = document.querySelectorAll('.custom-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());

    const getColor = (value, metric) => {
      if (value == null || isNaN(value)) return '#4b5563';
      
      if (metric === 'populationGrowth') {
        return value > 0 ? '#10b981' : '#ef4444';
      } else if (metric === 'rentAnalysis') {
        const range = metrics[metric].range;
        const normalized = (value - range[0]) / (range[1] - range[0]);
        const clamped = Math.max(0, Math.min(1, normalized));
        
        if (clamped < 0.33) return '#ef4444';
        if (clamped < 0.66) return '#f59e0b';
        return '#10b981';
      } else {
        const range = metrics[metric].range;
        const normalized = (value - range[0]) / (range[1] - range[0]);
        const clamped = Math.max(0, Math.min(1, normalized));
        
        if (clamped < 0.33) return '#ef4444';
        if (clamped < 0.66) return '#f59e0b';
        return '#10b981';
      }
    };

    const countyLookup = {};
    Object.values(countyData).forEach(county => {
      if (county.fips) {
        countyLookup[county.fips] = county;
      }
    });

    const style = (feature) => {
      const fips = feature.properties.STATE + feature.properties.COUNTY;
      const county = countyLookup[fips];
      const value = county ? getMetricValue(county, selectedMetric) : null;
      
      return {
        fillColor: getColor(value, selectedMetric),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
      };
    };

    // Single timeout reference to prevent multiple tooltips
    let activeTimeout = null;
    
    const onEachFeature = (feature, layer) => {
      const fips = feature.properties.STATE + feature.properties.COUNTY;
      const county = countyLookup[fips];
      
      if (county && preCalculateTooltips[fips]) {
        const tooltipContent = `
          <div style="font-weight: bold; margin-bottom: 4px;">${feature.properties.NAME}</div>
          ${preCalculateTooltips[fips][selectedMetric]}
        `;
        
        // Bind tooltip but don't make it permanent
        layer.bindTooltip(tooltipContent, {
          permanent: false,
          sticky: true,
          className: 'custom-tooltip',
          opacity: 0.95
        });

        layer.on({
          mouseover: (e) => {
            // Clear any existing timeout
            if (activeTimeout) {
              clearTimeout(activeTimeout);
            }
            
            // Clear sidebar hover state
            setHoveredCounty(null);
            
            // Set new hover state with delay
            activeTimeout = setTimeout(() => {
              setHoveredCounty({
                ...county,
                displayName: feature.properties.NAME
              });
            }, 150);
            
            // Open tooltip immediately
            layer.openTooltip();
          },
          mouseout: (e) => {
            // Clear any existing timeout
            if (activeTimeout) {
              clearTimeout(activeTimeout);
            }
            
            // Close tooltip immediately
            layer.closeTooltip();
            
            // Clear sidebar hover state with delay
            activeTimeout = setTimeout(() => {
              setHoveredCounty(null);
            }, 100);
          }
        });
      }
    };

    // Create the GeoJSON layer
    const geoJsonLayer = L.geoJSON(geoData, {
      style: style,
      onEachFeature: onEachFeature
    });
    
    // Add to map
    geoJsonLayer.addTo(map);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${colors.gray.dark}`,
            borderTop: `3px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Loading Census data...</p>
          <p style={{ fontSize: '0.875rem', color: colors.gray.lighter, marginTop: '8px' }}>
            Processing county demographics and economics
          </p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{
            color: colors.error,
            fontSize: '3rem',
            marginBottom: '16px'
          }}>⚠️</div>
          <h2 style={{ marginBottom: '8px' }}>Error Loading Census Data</h2>
          <p style={{ color: colors.gray.lighter, marginBottom: '16px' }}>{error}</p>
          <p style={{ color: colors.gray.lighter, fontSize: '0.875rem' }}>
            Please check that all Census CSV files are in the public folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.background,
      color: 'white',
      display: 'flex'
    }}>
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        .custom-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          color: white !important;
          font-size: 0.875rem !important;
          padding: 8px !important;
          max-width: 300px !important;
        }
        .leaflet-tooltip-top:before,
        .leaflet-tooltip-bottom:before,
        .leaflet-tooltip-left:before,
        .leaflet-tooltip-right:before {
          border-top-color: rgba(15, 23, 42, 0.95) !important;
          border-bottom-color: rgba(15, 23, 42, 0.95) !important;
          border-left-color: rgba(15, 23, 42, 0.95) !important;
          border-right-color: rgba(15, 23, 42, 0.95) !important;
        }
      `}</style>
      
      <div style={{
        width: '320px',
        background: '#1e293b',
        borderRight: `1px solid ${colors.gray.dark}`,
        padding: '24px',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        {/* Back to Home Button */}
        <button
          onClick={() => setCurrentPage('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '24px'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#06b6d4';
            e.target.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#94a3b8';
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          County Investment Map
        </h1>
        <p style={{ color: colors.gray.lighter, fontSize: '0.875rem', marginBottom: '32px' }}>
          US Census-based investment analysis
        </p>

        <div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Filter size={20} style={{ color: colors.primary }} />
            Select Metric
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(metrics).map(([key, metric]) => {
              const IconComponent = metric.icon;
              const isSelected = selectedMetric === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: isSelected ? `${metric.color}20` : colors.gray.dark,
                    border: isSelected ? `2px solid ${metric.color}` : `1px solid ${colors.gray.medium}`,
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    width: '100%'
                  }}
                >
                  <IconComponent size={20} style={{ color: metric.color }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {metric.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: colors.gray.lighter,
                      marginTop: '2px'
                    }}>
                      {metric.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FMR Load Status Warning */}
        {fmrLoadStatus.attempted && !fmrLoadStatus.loaded && (
          <div style={{
            background: colors.warning + '20',
            border: `2px solid ${colors.warning}`,
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={16} style={{ color: colors.warning }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.warning }}>FMR Data Missing</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.gray.lightest, marginBottom: '8px' }}>
              {fmrLoadStatus.error}
            </div>
            <div style={{ fontSize: '0.7rem', color: colors.gray.lighter }}>
              <strong>To fix this:</strong>
              <br />1. Download FMR data from HUD.gov
              <br />2. Save as: <code style={{ background: colors.gray.dark, padding: '2px 4px', borderRadius: '2px' }}>FY25_FMRs_revised.csv</code>
              <br />3. Place in your <code style={{ background: colors.gray.dark, padding: '2px 4px', borderRadius: '2px' }}>/public</code> folder
              <br />4. Refresh the page
            </div>
          </div>
        )}

        <div style={{
          background: colors.gray.dark,
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px',
          border: `2px solid ${metrics[selectedMetric].color}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Info size={16} style={{ color: metrics[selectedMetric].color }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Data Summary</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.gray.lightest }}>
            Showing {Object.keys(countyData).length} counties with Census data
          </div>
          
          <div style={{ marginTop: '8px', fontSize: '0.7rem', color: colors.gray.lighter }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Data Coverage:</div>
            {(() => {
              const coverage = {
                'Population Growth': Object.values(countyData).filter(d => d.populationGrowth !== undefined && d.populationGrowth !== null).length,
                'Employment Data': Object.values(countyData).filter(d => d.employmentRate && d.unemploymentRate).length,
                'Housing Metrics': Object.values(countyData).filter(d => d.vacancyRate && d.renterPercentage).length,
                'FMR Data': Object.values(countyData).filter(d => d.fmrRent && d.fmrRent > 0).length,
                'Market Rent Est': Object.values(countyData).filter(d => d.estimatedMarketRent && d.estimatedMarketRent > 0).length,
                'Census Rent': Object.values(countyData).filter(d => d.privateMarketRent && d.privateMarketRent > 0).length,
                'Total Counties': Object.keys(countyData).length
              };
              
              return Object.entries(coverage).map(([metric, count]) => {
                const total = coverage['Total Counties'];
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                const isTotal = metric === 'Total Counties';
                
                return (
                  <div key={metric} style={{ 
                    marginTop: '2px',
                    color: isTotal ? colors.primary : percentage > 90 ? colors.success : percentage > 50 ? colors.warning : colors.error
                  }}>
                    {metric}: {count.toLocaleString()}{!isTotal && ` (${percentage}%)`}
                  </div>
                );
              });
            })()}
          </div>
          
          {/* FMR Status */}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${colors.gray.medium}` }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', marginBottom: '4px' }}>FMR Status:</div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: fmrLoadStatus.loaded ? colors.success : colors.error 
            }}>
              {fmrLoadStatus.loaded ? 
                `✅ Loaded (${fmrLoadStatus.filePath})` : 
                fmrLoadStatus.attempted ? 
                  '❌ Not Found' : 
                  '⏳ Loading...'
              }
            </div>
          </div>
          
          {hoveredCounty && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.gray.medium}` }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{hoveredCounty.displayName}</div>
              <div style={{ fontSize: '0.75rem', color: colors.gray.lighter, marginBottom: '8px' }}>
                {hoveredCounty.state}
              </div>
              
              {selectedMetric === 'populationGrowth' && (
                <div style={{ fontSize: '0.7rem' }}>
                  <div style={{ marginBottom: '2px' }}>
                    Population: <span style={{ color: colors.primary }}>{hoveredCounty.totalPopulation?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Growth Rate: <span style={{ color: hoveredCounty.populationGrowth > 0 ? colors.success : colors.error }}>
                      {hoveredCounty.populationGrowth ? hoveredCounty.populationGrowth.toFixed(1) + '%' : 'N/A'}
                    </span>
                  </div>
                </div>
              )}
              
              {selectedMetric === 'jobGrowth' && (
                <div style={{ fontSize: '0.7rem' }}>
                  <div style={{ marginBottom: '2px' }}>
                    Median Income: <span style={{ color: colors.success }}>${hoveredCounty.medianHouseholdIncome?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Employment Rate: <span style={{ color: colors.primary }}>{hoveredCounty.employmentRate ? hoveredCounty.employmentRate.toFixed(1) + '%' : 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Unemployment Rate: <span style={{ color: colors.error }}>{hoveredCounty.unemploymentRate ? hoveredCounty.unemploymentRate.toFixed(1) + '%' : 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Employed: <span style={{ color: colors.success }}>{hoveredCounty.totalEmployed?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              )}
              
              {selectedMetric === 'housingMetrics' && (
                <div style={{ fontSize: '0.7rem' }}>
                  <div style={{ marginBottom: '2px' }}>
                    Vacancy Rate: <span style={{ color: colors.error }}>{hoveredCounty.vacancyRate ? hoveredCounty.vacancyRate.toFixed(1) + '%' : 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Renter %: <span style={{ color: colors.warning }}>{hoveredCounty.renterPercentage ? hoveredCounty.renterPercentage.toFixed(1) + '%' : 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Total Units: <span style={{ color: colors.primary }}>{hoveredCounty.totalHousingUnits?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Median Rent: <span style={{ color: colors.accent }}>${hoveredCounty.medianGrossRent?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              )}
              
              {selectedMetric === 'rentAnalysis' && (
                <div style={{ fontSize: '0.7rem' }}>
                  <div style={{ marginBottom: '2px' }}>
                    FMR (Section 8): <span style={{ color: colors.secondary }}>${hoveredCounty.fmrRent?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Market Median: <span style={{ color: colors.success }}>${hoveredCounty.estimatedMarketRent?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Competitive: <span style={{ color: colors.primary }}>${hoveredCounty.competitiveRent?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Premium: <span style={{ color: colors.warning }}>${hoveredCounty.premiumRent?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Luxury: <span style={{ color: colors.accent }}>${hoveredCounty.luxuryRent?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Market Type: <span style={{ 
                      color: hoveredCounty.marketType === 'superHot' ? colors.error : 
                             hoveredCounty.marketType === 'hot' ? colors.warning : 
                             hoveredCounty.marketType === 'warm' ? colors.success : colors.gray.lighter 
                    }}>
                      {hoveredCounty.marketType || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Market Score: <span style={{ color: colors.primary }}>
                      {hoveredCounty.marketScore || 'N/A'}/30
                    </span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Confidence: <span style={{ color: colors.accent }}>
                      {hoveredCounty.marketConfidence || 0}%
                    </span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Premium vs FMR: <span style={{ color: hoveredCounty.rentPremiumVsFMR > 0 ? colors.success : colors.error }}>
                      {hoveredCounty.rentPremiumVsFMR ? (hoveredCounty.rentPremiumVsFMR > 0 ? '+' : '') + hoveredCounty.rentPremiumVsFMR.toFixed(0) + '%' : 'N/A'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Cash Flow: <span style={{ 
                      color: hoveredCounty.cashFlowPotential === 'High' ? colors.success : 
                             hoveredCounty.cashFlowPotential === 'Medium' ? colors.warning : colors.gray.lighter 
                    }}>
                      {hoveredCounty.cashFlowPotential || 'N/A'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Affordability: <span style={{ 
                      color: hoveredCounty.affordabilityIndex <= 30 ? colors.success : 
                             hoveredCounty.affordabilityIndex <= 40 ? colors.warning : colors.error 
                    }}>
                      {hoveredCounty.affordabilityIndex ? hoveredCounty.affordabilityIndex + '%' : 'N/A'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '2px' }}>
                    Census Median: <span style={{ color: colors.gray.lighter }}>${hoveredCounty.privateMarketRent?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${colors.gray.dark}`,
            backdropFilter: 'blur(8px)'
          }}>
            <h3 style={{
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: '600',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MapPin size={20} style={{ color: metrics[selectedMetric].color }} />
              {metrics[selectedMetric].name} by County
            </h3>
          </div>
          
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: `1px solid ${colors.gray.dark}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)'
          }}>
            <Calendar size={16} style={{ color: colors.gray.lighter }} />
            <span style={{ fontSize: '0.875rem', color: 'white' }}>ACS 2019-2023</span>
          </div>
        </div>

        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '100vh',
            background: '#1a202c'
          }} 
        />

        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '16px',
          borderRadius: '8px',
          border: `1px solid ${colors.gray.dark}`,
          backdropFilter: 'blur(8px)',
          zIndex: 10
        }}>
          <h4 style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', margin: '0 0 8px 0' }}>
            Color Scale
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '150px',
              height: '12px',
              background: selectedMetric === 'populationGrowth' 
                ? `linear-gradient(to right, ${colors.error}, #4b5563, ${colors.success})`
                : `linear-gradient(to right, ${colors.error}, ${colors.warning}, ${colors.success})`,
              borderRadius: '2px'
            }} />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '4px',
            fontSize: '0.7rem',
            color: colors.gray.lightest 
          }}>
            <span>
              {selectedMetric === 'populationGrowth' ? 'Decline' : 
               selectedMetric === 'rentAnalysis' ? 'Low Market Rent' : 'Low'}
            </span>
            <span>
              {selectedMetric === 'populationGrowth' ? 'Growth' : 
               selectedMetric === 'rentAnalysis' ? 'High Market Rent' : 'High'}
            </span>
          </div>
        </div>

        {Object.keys(countyData).length === 0 && !loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '24px',
            borderRadius: '8px',
            border: `1px solid ${colors.gray.dark}`,
            textAlign: 'center',
            zIndex: 100
          }}>
            <div style={{ color: colors.warning, fontSize: '2rem', marginBottom: '12px' }}>📊</div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>No Census Data Available</h3>
            <p style={{ color: colors.gray.lighter, fontSize: '0.875rem' }}>
              Check that Census CSV files are in the public folder
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketHeatMap;