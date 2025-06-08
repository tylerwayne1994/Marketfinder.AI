// DealStructureEngine.js - The Creative Financing AI Wizard

// Seller Motivation Analysis Engine
export const analyzeSellerMotivation = (propertyData, marketData = {}) => {
  let motivationScore = 50; // Base score out of 100
  const indicators = [];
  
  // Days on Market Analysis
  const daysOnMarket = marketData.daysOnMarket || 30;
  if (daysOnMarket > 180) {
    motivationScore += 25;
    indicators.push("🔥 Property has been on market 6+ months - seller likely very motivated");
  } else if (daysOnMarket > 90) {
    motivationScore += 15;
    indicators.push("⏰ Property on market 3+ months - seller showing flexibility");
  } else if (daysOnMarket > 60) {
    motivationScore += 10;
    indicators.push("📅 Property on market 2+ months - moderate motivation");
  }
  
  // Price Reduction History
  const priceReductions = marketData.priceReductions || 0;
  if (priceReductions >= 2) {
    motivationScore += 20;
    indicators.push("💰 Multiple price reductions - seller eager to sell");
  } else if (priceReductions === 1) {
    motivationScore += 10;
    indicators.push("📉 One price reduction - seller adjusting expectations");
  }
  
  // Property Condition Factor
  if (propertyData.yearBuilt && propertyData.yearBuilt < 1980) {
    motivationScore += 10;
    indicators.push("🔧 Older property - seller may want to avoid repair headaches");
  }
  
  // Investment Property Factor
  if (propertyData.units > 1) {
    motivationScore += 5;
    indicators.push("🏢 Investment property - seller may be open to creative terms");
  }
  
  // Cap the score at 100
  motivationScore = Math.min(motivationScore, 100);
  
  return {
    score: motivationScore,
    level: motivationScore >= 80 ? 'HIGHLY MOTIVATED' : 
           motivationScore >= 60 ? 'MODERATELY MOTIVATED' : 
           motivationScore >= 40 ? 'SOMEWHAT MOTIVATED' : 'LOW MOTIVATION',
    indicators,
    color: motivationScore >= 80 ? '#10b981' : 
           motivationScore >= 60 ? '#f59e0b' : 
           motivationScore >= 40 ? '#f97316' : '#ef4444'
  };
};

// Creative Financing Structure Generator
export const generateDealStructures = (propertyData, investorProfile, analysis) => {
  const structures = [];
  const price = propertyData.price;
  const cashAvailable = investorProfile.availableCash || 0;
  const downPaymentNeeded = price * 0.20; // Typical 20% down
  const closingCosts = price * 0.03; // 3% closing costs
  const totalCashNeeded = downPaymentNeeded + closingCosts;
  
  // Structure 1: Traditional Seller Financing (if seller motivated)
  if (investorProfile.openToSellerFinancing) {
    structures.push({
      id: 'seller_finance_primary',
      name: 'The Seller Partnership Deal',
      type: 'Seller Financing',
      creativity: 'Moderate',
      cashRequired: closingCosts,
      probability: 70,
      timeline: '30-45 days',
      structure: {
        bankLoan: price * 0.80,
        sellerCarry: downPaymentNeeded,
        yourCash: closingCosts,
        sellerTerms: {
          amount: downPaymentNeeded,
          rate: 6.0,
          term: 5,
          payment: Math.round((downPaymentNeeded * 0.06) / 12)
        }
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        bankPayment: analysis.financing.monthlyPayment,
        sellerPayment: Math.round((downPaymentNeeded * 0.06) / 12),
        netCashFlow: (analysis.returns.grossRent / 12) - analysis.financing.monthlyPayment - Math.round((downPaymentNeeded * 0.06) / 12)
      },
      pros: [
        '💰 Only need closing costs upfront',
        '🤝 Seller gets steady income stream',
        '📈 You control property with minimal cash',
        '🏦 Bank provides 80% financing'
      ],
      cons: [
        '💸 Two monthly payments (bank + seller)',
        '⏰ Balloon payment due in 5 years',
        '🤔 Requires motivated seller'
      ],
      stepByStep: [
        'Approach seller with win-win proposal',
        'Structure bank loan for 80% LTV',
        'Seller carries 20% as second mortgage',
        'Close with only closing costs',
        'Plan refinance strategy for year 3-5'
      ],
      exitStrategy: 'Refinance in years 3-5 when property appreciates, pay off seller note'
    });
  }

  // Structure 2: Subject-To Hybrid (if property has existing financing)
  if (investorProfile.openToSubjectTo && propertyData.price > 400000) {
    const estimatedLoanBalance = price * 0.65; // Assume 65% loan balance
    const sellerEquity = price - estimatedLoanBalance;
    
    structures.push({
      id: 'subject_to_hybrid',
      name: 'The Protected Takeover',
      type: 'Subject-To Hybrid',
      creativity: 'High',
      cashRequired: 15000,
      probability: 45,
      timeline: '20-30 days',
      structure: {
        existingLoan: estimatedLoanBalance,
        sellerEquity: sellerEquity,
        sellerNote: sellerEquity * 0.75, // Seller carries 75% of equity
        sellerCash: sellerEquity * 0.25, // 25% cash to seller
        yourCash: 15000
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        existingLoanPayment: Math.round((estimatedLoanBalance * 0.07) / 12),
        sellerPayment: Math.round((sellerEquity * 0.75 * 0.05) / 12),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((estimatedLoanBalance * 0.07) / 12) - Math.round((sellerEquity * 0.75 * 0.05) / 12)
      },
      pros: [
        '🚀 Take control with minimal cash down',
        '⚡ Fast closing (20-30 days)',
        '🛡️ Seller protection built in',
        '💡 Creative solution for tight markets'
      ],
      cons: [
        '⚖️ Legal complexity requires attorney',
        '📋 Due-on-sale clause risk',
        '🎯 Requires very motivated seller'
      ],
      stepByStep: [
        'Verify existing loan terms and balance',
        'Structure seller protection plan',
        'Take over existing loan payments',
        'Seller carries balance as second note',
        'Transfer title after 24 months of payments'
      ],
      exitStrategy: 'Refinance within 2-3 years, pay off seller completely'
    });
  }

  // Structure 3: The Partnership Play (if low cash)
  if (cashAvailable < totalCashNeeded * 0.5) {
    const partnerCash = downPaymentNeeded;
    const partnerEquity = (partnerCash / price) * 100;
    
    structures.push({
      id: 'equity_partner',
      name: 'The Strategic Partnership',
      type: 'Equity Partnership',
      creativity: 'Moderate',
      cashRequired: closingCosts,
      probability: 60,
      timeline: '45-60 days',
      structure: {
        bankLoan: price * 0.80,
        partnerCash: partnerCash,
        yourCash: closingCosts,
        partnerEquity: partnerEquity,
        yourEquity: 100 - partnerEquity
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        bankPayment: analysis.financing.monthlyPayment,
        partnerReturn: Math.round((analysis.returns.grossRent / 12) * (partnerEquity / 100)),
        yourCashFlow: Math.round((analysis.returns.grossRent / 12) * ((100 - partnerEquity) / 100)) - analysis.financing.monthlyPayment
      },
      pros: [
        '💰 Minimal cash required from you',
        '🤝 Partner provides all down payment',
        '📊 You maintain operational control',
        '🏦 Traditional bank financing'
      ],
      cons: [
        '📉 Share appreciation with partner',
        '💼 Need to find qualified partner',
        '📋 Partnership agreement required'
      ],
      stepByStep: [
        'Find accredited investor partner',
        'Structure partnership agreement',
        'Partner provides down payment',
        'You manage property operations',
        'Plan partner buyout in 5-7 years'
      ],
      exitStrategy: `Buy out partner at ${Math.round(partnerEquity)}% of future appraised value`
    });
  }

  // Structure 4: The Master Lease Option (ultimate creative)
  if (investorProfile.riskTolerance === 'aggressive') {
    structures.push({
      id: 'lease_option',
      name: 'The Control Without Ownership',
      type: 'Master Lease Option',
      creativity: 'Very High',
      cashRequired: 5000,
      probability: 30,
      timeline: '15-30 days',
      structure: {
        optionFee: 5000,
        monthlyLease: Math.round((price * 0.07) / 12),
        optionPrice: price,
        optionTerm: 36 // 3 years
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        leasePayment: Math.round((price * 0.07) / 12),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((price * 0.07) / 12)
      },
      pros: [
        '⚡ Immediate control with tiny investment',
        '🔒 Price locked in for 3 years',
        '📈 Benefit from appreciation',
        '🏃 Fast execution'
      ],
      cons: [
        '📅 Limited time to exercise option',
        '💸 No equity building until purchase',
        '🎯 Requires very creative seller'
      ],
      stepByStep: [
        'Negotiate master lease with purchase option',
        'Pay small option fee ($5K)',
        'Control property for 3 years',
        'Build cash flow and credit',
        'Exercise option or walk away'
      ],
      exitStrategy: 'Exercise option within 36 months or renegotiate terms'
    });
  }

  // Structure 5: The Zero Down Wizard (for $0 cash scenarios)
  if (cashAvailable < 10000) {
    structures.push({
      id: 'zero_down_wizard',
      name: 'The Impossible Deal (Zero Down)',
      type: 'Advanced Creative',
      creativity: 'Extreme',
      cashRequired: 0,
      probability: 15,
      timeline: '60-90 days',
      structure: {
        sellerCarryAll: price,
        assignmentFee: closingCosts,
        crossCollateral: true
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        sellerPayment: Math.round((price * 0.05) / 12),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((price * 0.05) / 12)
      },
      pros: [
        '🚀 Zero cash required',
        '🎯 Control property immediately',
        '💰 Generate cash flow from day one',
        '🧙‍♂️ Ultimate creative financing'
      ],
      cons: [
        '⚡ Extremely complex structure',
        '🎲 Very low probability of acceptance',
        '📋 Requires experienced attorney',
        '🤝 Seller must be highly motivated'
      ],
      stepByStep: [
        'Find distressed/motivated seller',
        'Negotiate full seller financing',
        'Structure interest-only payments initially',
        'Use assignment strategies for closing costs',
        'Plan long-term refinance strategy'
      ],
      exitStrategy: 'Refinance within 2-3 years as property appreciates and you build track record'
    });
  }

  // Structure 6: BRRRR Strategy (if property needs work)
  if (propertyData.yearBuilt && propertyData.yearBuilt < 1990) {
    const rehabCosts = price * 0.15; // Estimate 15% of price for rehab
    const arvEstimate = price * 1.25; // After Repair Value
    
    structures.push({
      id: 'brrrr_strategy',
      name: 'The BRRRR Machine',
      type: 'BRRRR Strategy',
      creativity: 'High',
      cashRequired: downPaymentNeeded + rehabCosts,
      probability: 55,
      timeline: '6-12 months',
      structure: {
        hardMoneyLoan: price * 0.70,
        rehabLoan: rehabCosts,
        yourCash: downPaymentNeeded + rehabCosts - (price * 0.70),
        arv: arvEstimate,
        refinanceAmount: arvEstimate * 0.80
      },
      monthlyNumbers: {
        income: (analysis.returns.grossRent / 12) * 1.15, // Higher rents after rehab
        hardMoneyPayment: Math.round((price * 0.70 * 0.12) / 12),
        netCashFlow: ((analysis.returns.grossRent / 12) * 1.15) - Math.round((price * 0.70 * 0.12) / 12)
      },
      pros: [
        '♻️ Recycle most/all capital via refinance',
        '📈 Force appreciation through improvements',
        '💰 Higher rents post-renovation',
        '🎯 Build wealth through forced equity'
      ],
      cons: [
        '🔨 Construction/contractor management required',
        '⏰ Takes 6-12 months to complete cycle',
        '💸 Higher upfront capital requirements',
        '🎲 Rehab cost overruns possible'
      ],
      stepByStep: [
        'Secure hard money or private financing',
        'Purchase and immediately start renovations',
        'Complete rehab within 4-6 months',
        'Get property appraised at new higher value',
        'Refinance with bank, pull capital back out'
      ],
      exitStrategy: `Refinance at 80% of ${(arvEstimate/1000).toFixed(0)}K ARV, recover ${((arvEstimate * 0.80) - (price * 0.70))/1000}K+ of invested capital`
    });
  }

  // Structure 7: Wrap-Around Mortgage (if existing low-rate loan)
  if (propertyData.price > 300000) {
    const existingBalance = price * 0.60;
    const existingRate = 4.5; // Assume existing low rate
    const wrapRate = 7.0; // Your rate to buyer/tenant
    
    structures.push({
      id: 'wrap_around',
      name: 'The Wrap-Around Wizard',
      type: 'Wrap-Around Mortgage',
      creativity: 'High',
      cashRequired: price - existingBalance,
      probability: 40,
      timeline: '45-60 days',
      structure: {
        existingLoan: existingBalance,
        existingRate: existingRate,
        wrapAmount: price,
        wrapRate: wrapRate,
        sellerCarry: price - existingBalance
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        existingPayment: Math.round((existingBalance * existingRate) / 12 / 100),
        spread: Math.round(((price * wrapRate) / 12 / 100) - ((existingBalance * existingRate) / 12 / 100)),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((existingBalance * existingRate) / 12 / 100)
      },
      pros: [
        '💰 Profit from interest rate spread',
        '🏦 Keep existing low-rate financing',
        '📊 Seller gets higher effective return',
        '⚡ Faster closing than new financing'
      ],
      cons: [
        '📋 Complex legal structure required',
        '🎯 Must find qualified end buyer/tenant',
        '⚖️ Due-on-sale clause considerations',
        '🔍 Requires sophisticated documentation'
      ],
      stepByStep: [
        'Verify existing loan terms and balance',
        'Structure wrap-around mortgage at higher rate',
        'Seller carries difference as second mortgage',
        'You make payments on existing loan',
        'Collect higher payments from end user'
      ],
      exitStrategy: `Profit from ${(wrapRate - existingRate).toFixed(1)}% interest spread while building equity`
    });
  }

  // Structure 8: Assignment Strategy (for quick profits)
  if (investorProfile.experienceLevel === 'advanced' || investorProfile.primaryGoal === 'flip') {
    structures.push({
      id: 'assignment_strategy',
      name: 'The Assignment Ace',
      type: 'Assignment Strategy',
      creativity: 'Moderate',
      cashRequired: 2000, // Just earnest money
      probability: 45,
      timeline: '30-45 days',
      structure: {
        earnestMoney: 2000,
        contractPrice: price,
        assignmentFee: price * 0.03, // 3% assignment fee
        endBuyerDownPayment: price * 0.20
      },
      monthlyNumbers: {
        income: 0, // No monthly income, just assignment fee
        expenses: 0,
        netCashFlow: 0,
        oneTimeProfit: price * 0.03
      },
      pros: [
        '💰 Quick profit with minimal capital',
        '⚡ Fast turnaround (30-45 days)',
        '📈 Use profit as down payment for next deal',
        '🎯 Build investor network relationships'
      ],
      cons: [
        '🔍 Must find qualified end buyer quickly',
        '📋 Requires strong contract negotiation skills',
        '⏰ Time-sensitive deal execution',
        '🎲 Assignment clause must be negotiated upfront'
      ],
      stepByStep: [
        'Get property under contract with assignment clause',
        'Market deal to investor network',
        'Find end buyer willing to pay premium',
        'Assign contract for fee at closing',
        'Use assignment fee for next deal down payment'
      ],
      exitStrategy: `Collect ${(price * 0.03/1000).toFixed(0)}K assignment fee, use for next property down payment`
    });
  }

  // Structure 9: Land Contract / Contract for Deed
  if (propertyData.yearBuilt && propertyData.yearBuilt > 2000) {
    structures.push({
      id: 'land_contract',
      name: 'The Land Contract Control',
      type: 'Contract for Deed',
      creativity: 'Moderate',
      cashRequired: price * 0.05, // 5% down
      probability: 50,
      timeline: '30 days',
      structure: {
        downPayment: price * 0.05,
        contractBalance: price * 0.95,
        monthlyPayment: Math.round((price * 0.95 * 0.07) / 12),
        balloonTerm: 5 // years
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        contractPayment: Math.round((price * 0.95 * 0.07) / 12),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((price * 0.95 * 0.07) / 12)
      },
      pros: [
        '💰 Low down payment required',
        '🏠 Immediate possession and control',
        '📋 Simpler than traditional financing',
        '🎯 Seller retains title as security'
      ],
      cons: [
        '⚖️ Limited legal protections vs ownership',
        '🎯 Balloon payment due in 5 years',
        '📋 Seller keeps deed until paid off',
        '🔍 Requires motivated seller'
      ],
      stepByStep: [
        'Negotiate land contract terms with seller',
        'Structure 5% down payment',
        'Take possession while seller holds title',
        'Make monthly payments directly to seller',
        'Balloon payment or refinance in year 5'
      ],
      exitStrategy: 'Refinance with traditional loan in years 3-5 to pay off contract'
    });
  }

  // Structure 10: Hard Money Bridge (for quick acquisition)
  if (cashAvailable >= 50000 && investorProfile.experienceLevel !== 'beginner') {
    const hardMoneyAmount = price * 0.70;
    const hardMoneyRate = 12;
    
    structures.push({
      id: 'hard_money_bridge',
      name: 'The Speed Demon',
      type: 'Hard Money Bridge',
      creativity: 'Moderate',
      cashRequired: price - hardMoneyAmount + 5000, // Down payment + fees
      probability: 80,
      timeline: '10-15 days',
      structure: {
        hardMoneyLoan: hardMoneyAmount,
        hardMoneyRate: hardMoneyRate,
        yourCash: price - hardMoneyAmount,
        refinanceTimeline: 6 // months
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        hardMoneyPayment: Math.round((hardMoneyAmount * hardMoneyRate) / 12 / 100),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((hardMoneyAmount * hardMoneyRate) / 12 / 100)
      },
      pros: [
        '⚡ Lightning fast closing (10-15 days)',
        '🎯 Beat other buyers to great deals',
        '🏦 Refinance to permanent financing later',
        '💪 Strong negotiating position (cash buyer)'
      ],
      cons: [
        '💸 High interest rate (12%+)',
        '⏰ Must refinance within 6-12 months',
        '💰 Higher upfront costs and fees',
        '🎲 Risk if permanent financing delayed'
      ],
      stepByStep: [
        'Get pre-approved with hard money lender',
        'Make cash offers on time-sensitive deals',
        'Close in 10-15 days with hard money',
        'Stabilize property and income',
        'Refinance to permanent loan within 6 months'
      ],
      exitStrategy: 'Refinance to conventional loan within 6 months, lower payment by ~40%'
    });
  }

  // Structure 11: Private Money Partnership
  if (investorProfile.openToPartnerships) {
    structures.push({
      id: 'private_money',
      name: 'The Private Money Network',
      type: 'Private Lending',
      creativity: 'Moderate',
      cashRequired: 10000, // Just reserves
      probability: 60,
      timeline: '30-45 days',
      structure: {
        privateLoan: price * 0.80,
        privateRate: 8.5,
        yourCash: 10000,
        lenderSecurity: 'First mortgage position'
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        privateLenderPayment: Math.round((price * 0.80 * 0.085) / 12),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((price * 0.80 * 0.085) / 12)
      },
      pros: [
        '💰 Better rates than hard money',
        '🤝 Build long-term lender relationships',
        '⚡ Faster than bank financing',
        '📊 More flexible terms than banks'
      ],
      cons: [
        '🔍 Must find and cultivate private lenders',
        '📋 Requires strong personal relationships',
        '💼 Need track record to attract capital',
        '⚖️ Personal guarantees typically required'
      ],
      stepByStep: [
        'Build network of private money lenders',
        'Present deal with solid returns and security',
        'Structure first mortgage at 8-9% rate',
        'Close quickly with private funds',
        'Option to refinance or keep private loan'
      ],
      exitStrategy: 'Keep private loan long-term or refinance based on relationship and rates'
    });
  }

  // Structure 12: Assumable Loan Takeover (for FHA/VA loans)
  if (propertyData.price < 500000) { // FHA loan limits
    structures.push({
      id: 'assumable_loan',
      name: 'The Assumption Advantage',
      type: 'Loan Assumption',
      creativity: 'Moderate',
      cashRequired: price * 0.25, // Assume 75% existing loan
      probability: 35,
      timeline: '45-60 days',
      structure: {
        existingLoan: price * 0.75,
        existingRate: 3.5, // Assume low existing rate
        cashToSeller: price * 0.25,
        qualificationRequired: true
      },
      monthlyNumbers: {
        income: analysis.returns.grossRent / 12,
        loanPayment: Math.round((price * 0.75 * 0.035) / 12),
        netCashFlow: (analysis.returns.grossRent / 12) - Math.round((price * 0.75 * 0.035) / 12)
      },
      pros: [
        '🎯 Assume existing low interest rate',
        '💰 Potentially lower payment than new loan',
        '📋 Avoid new loan origination fees',
        '⚡ Faster than new loan process'
      ],
      cons: [
        '🏦 Must qualify for loan assumption',
        '💸 Large cash payment to seller',
        '🔍 Limited to FHA/VA assumable loans',
        '📋 Lender approval still required'
      ],
      stepByStep: [
        'Verify loan is assumable (FHA/VA)',
        'Apply for assumption approval with lender',
        'Negotiate cash payment to seller for equity',
        'Complete assumption process with lender',
        'Take over existing loan at current rate'
      ],
      exitStrategy: `Keep low-rate loan ${((price * 0.75 * 0.035) / 12).toFixed(0)}/month vs ${((price * 0.75 * 0.07) / 12).toFixed(0)}/month new loan`
    });
  }

  // Sort by probability and user's risk tolerance
  return structures.sort((a, b) => {
    if (investorProfile.riskTolerance === 'aggressive') {
      return b.creativity === 'Extreme' ? 1 : -1;
    }
    return b.probability - a.probability;
  });
};

// Pattern Recognition Learning System
export const updateLearningProfile = (investorProfile, successfulDeal) => {
  return {
    ...investorProfile,
    successfulStructures: [...investorProfile.successfulStructures, successfulDeal],
    analyzedProperties: [...investorProfile.analyzedProperties, successfulDeal.propertyData],
    preferredStrategies: updatePreferredStrategies(investorProfile.preferredStrategies, successfulDeal.structure.type)
  };
};

const updatePreferredStrategies = (current, newStrategy) => {
  const updated = { ...current };
  updated[newStrategy] = (updated[newStrategy] || 0) + 1;
  return updated;
};

// Negotiation Strategy Generator
export const generateNegotiationStrategy = (propertyData, sellerMotivation, chosenStructure) => {
  const strategies = [];
  
  if (sellerMotivation.score >= 70) {
    strategies.push({
      approach: 'Direct Creative Pitch',
      script: `"I can see this property has been on the market for a while. I have a unique proposal that could solve your situation immediately while giving you ongoing passive income."`,
      timing: 'Lead with creative financing immediately'
    });
  } else {
    strategies.push({
      approach: 'Traditional First, Creative Second',
      script: `"I'm interested in your property. While I explore traditional financing, would you be open to discussing some alternative structures that might work better for both of us?"`,
      timing: 'Present traditional offer first, then introduce creative options'
    });
  }
  
  // Add structure-specific strategies
  if (chosenStructure.type === 'Seller Financing') {
    strategies.push({
      approach: 'Seller Benefits Focus',
      script: `"Instead of getting all cash now and paying capital gains taxes, what if I could provide you with steady monthly income at a better rate than CDs or bonds?"`,
      timing: 'Emphasize tax benefits and steady income'
    });
  }
  
  return strategies;
};

// Deal Risk Assessment
export const assessDealRisk = (structure, propertyData, marketData) => {
  let riskScore = 0;
  const riskFactors = [];
  
  // Structure complexity risk
  if (structure.creativity === 'Extreme') {
    riskScore += 30;
    riskFactors.push('High complexity increases execution risk');
  } else if (structure.creativity === 'Very High') {
    riskScore += 20;
    riskFactors.push('Moderate complexity requires careful execution');
  }
  
  // Market risk
  if (propertyData.capRate < 6) {
    riskScore += 15;
    riskFactors.push('Lower cap rate increases market risk');
  }
  
  // Cash flow risk
  if (structure.monthlyNumbers.netCashFlow < 500) {
    riskScore += 20;
    riskFactors.push('Thin cash flow margins');
  }
  
  // Probability risk
  if (structure.probability < 30) {
    riskScore += 25;
    riskFactors.push('Low probability of seller acceptance');
  }
  
  return {
    score: Math.min(riskScore, 100),
    level: riskScore >= 70 ? 'HIGH RISK' : 
           riskScore >= 40 ? 'MODERATE RISK' : 'LOW RISK',
    factors: riskFactors,
    color: riskScore >= 70 ? '#ef4444' : 
           riskScore >= 40 ? '#f59e0b' : '#10b981'
  };
};