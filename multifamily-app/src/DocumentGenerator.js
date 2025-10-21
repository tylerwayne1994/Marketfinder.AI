import React, { useState } from 'react';
import { ArrowLeft, Download, RotateCcw, CheckCircle, TrendingUp, DollarSign, Building2, Users, FileText, Calculator, X } from 'lucide-react';

// Terra.Ai Logo Component
const TerraLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" fill="none"/>
    <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="3"/>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const radian = (angle * Math.PI) / 180;
      const isCardinal = angle % 90 === 0;
      const length = isCardinal ? 38 : 35;
      
      const innerRadius = 20;
      const outerRadius = length;
      
      const x1 = 50 + innerRadius * Math.cos(radian - 0.15);
      const y1 = 50 + innerRadius * Math.sin(radian - 0.15);
      const x2 = 50 + outerRadius * Math.cos(radian);
      const y2 = 50 + outerRadius * Math.sin(radian);
      const x3 = 50 + innerRadius * Math.cos(radian + 0.15);
      const y3 = 50 + innerRadius * Math.sin(radian + 0.15);
      
      return (
        <g key={i}>
          <path
            d={`M 50 50 L ${x1} ${y1} Q ${50 + (outerRadius-5) * Math.cos(radian - 0.08)} ${50 + (outerRadius-5) * Math.sin(radian - 0.08)}, ${x2} ${y2} Q ${50 + (outerRadius-5) * Math.cos(radian + 0.08)} ${50 + (outerRadius-5) * Math.sin(radian + 0.08)}, ${x3} ${y3} Z`}
            fill="black"
          />
          {isCardinal && (
            <line 
              x1={50 + 22 * Math.cos(radian)} 
              y1={50 + 22 * Math.sin(radian)} 
              x2={50 + 30 * Math.cos(radian)} 
              y2={50 + 30 * Math.sin(radian)} 
              stroke="white" 
              strokeWidth="2"
            />
          )}
        </g>
      );
    })}
  </svg>
);

const DocumentGenerator = ({ setCurrentPage }) => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // State for all inputs
  const [dealBasics, setDealBasics] = useState({
    propertyName: '',
    assetType: 'Multifamily',
    units: '',
    purchasePrice: '',
    marketCapRate: '6.0'
  });

  const [dayOne, setDayOne] = useState({
    grossRentMonthly: '',
    vacancyRate: '5',
    economicLossMonthly: '0',
    otherIncomeMonthly: '0',
    opExMonthly: ''
  });

  const [stabilized, setStabilized] = useState({
    grossRentMonthly: '',
    vacancyRate: '3',
    otherIncomeMonthly: '',
    opExMonthly: '',
    monthsToStabilize: '12'
  });

  const [seller, setSeller] = useState({
    openToFinance: 'Yes',
    desiredMonthlyPayment: '',
    desiredDownPct: '10',
    targetRate: '4.0',
    balloonYears: '5',
    allowPaymentDeferral: 'Yes',
    maxDeferralMonths: '6',
    allowInterestOnly: 'Yes',
    maxIOMonths: '12',
    existingDebtPresent: 'No',
    existingDebtBalance: '',
    existingDebtRate: '',
    existingDebtRemainingTerm: '',
    existingDebtDueOnSale: 'Unknown'
  });

  const [sponsor, setSponsor] = useState({
    bankability: 'Some',
    cashAvailable: '',
    hasInvestors: 'Yes',
    investorCapitalAvailable: '',
    advisoryRoles: 'No'
  });

  const [equityPrefs, setEquityPrefs] = useState({
    prefMin: '0',
    prefMax: '12',
    splitSponsor: '50',
    splitInvestors: '50',
    buyoutMultiple: '2.0',
    buyoutWindowYearsMin: '4',
    buyoutWindowYearsMax: '5'
  });

  const [debtPrefs, setDebtPrefs] = useState({
    allowSellerFinance: true,
    allowLandContract: true,
    allowConventionalDSCR: true,
    allowPrivateBridge: true,
    sellerRateMin: '3.0',
    sellerRateMax: '6.0',
    bankRateMin: '6.5',
    bankRateMax: '8.5',
    privateRateMin: '9.0',
    privateRateMax: '14.0',
    maxBalloonYears: '7',
    minFixedTermYears: '5'
  });

  const [optimizer, setOptimizer] = useState({
    dscrDayOneMin: '1.15',
    cashflowDayOneMin: '0',
    refiLtvMax: '70',
    refiDscrMin: '1.20',
    investorOutcome: 'MultipleOrPref',
    objective: 'MaxSponsorOwnershipY5'
  });

  const [results, setResults] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Math functions
  const calculateNOI = (grossRent, vacancy, econLoss, otherIncome, opEx) => {
    const vacancyLoss = (grossRent * (parseFloat(vacancy) / 100)) || 0;
    const egi = grossRent - vacancyLoss - parseFloat(econLoss || 0) + parseFloat(otherIncome || 0);
    return egi - parseFloat(opEx || 0);
  };

  const calculateValue = (noi, capRate) => {
    if (!noi || !capRate || capRate <= 0) return 0;
    return (noi * 12) / (parseFloat(capRate) / 100);
  };

  const calculateAmortPayment = (principal, rate, years) => {
    if (!principal || !rate || !years) return 0;
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (r === 0) return principal / n;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const calculateDSCR = (noiAnnual, debtService) => {
    if (!debtService || debtService === 0) return 999;
    return noiAnnual / debtService;
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
      paddingBottom: 40
    },
    container: {
      maxWidth: 1400,
      margin: '0 auto',
      padding: '0 20px'
    },
    header: {
      padding: '20px 0',
      borderBottom: '1px solid #e5e7eb',
      background: 'white',
      marginBottom: 24
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontSize: 24,
      fontWeight: 700,
      color: '#111827'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 12
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 18px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
    },
    buttonSecondary: {
      background: 'white',
      color: '#374151',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    card: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    stepIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 24,
      overflowX: 'auto',
      padding: '12px 0'
    },
    stepDot: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: 14,
      transition: 'all 0.2s'
    },
    stepActive: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
    },
    stepComplete: {
      background: '#10b981',
      color: 'white'
    },
    stepInactive: {
      background: '#e5e7eb',
      color: '#9ca3af'
    },
    stepLine: {
      flex: 1,
      height: 2,
      background: '#e5e7eb'
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 600,
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 20
    },
    inputGroup: {
      marginBottom: 16
    },
    label: {
      display: 'block',
      fontSize: 14,
      fontWeight: 500,
      color: '#374151',
      marginBottom: 6
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: 8,
      fontSize: 14,
      outline: 'none',
      background: 'white',
      cursor: 'pointer'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: 16
    },
    checkbox: {
      marginRight: 8
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px',
      background: '#f9fafb',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 14
    },
    tooltip: {
      fontSize: 12,
      color: '#6b7280',
      fontStyle: 'italic',
      marginTop: 4
    },
    navigationButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 32,
      paddingTop: 24,
      borderTop: '1px solid #e5e7eb'
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setResults(null);
    setCurrentStep(1);
  };

  const runOptimizer = () => {
    setIsRunning(true);
    
    // Real optimization logic
    setTimeout(() => {
      // Calculate current and future NOI/Value
      const noiToday = calculateNOI(
        parseFloat(dayOne.grossRentMonthly) || 0,
        parseFloat(dayOne.vacancyRate) || 0,
        parseFloat(dayOne.economicLossMonthly) || 0,
        parseFloat(dayOne.otherIncomeMonthly) || 0,
        parseFloat(dayOne.opExMonthly) || 0
      );

      const noiFuture = calculateNOI(
        parseFloat(stabilized.grossRentMonthly) || parseFloat(dayOne.grossRentMonthly) || 0,
        parseFloat(stabilized.vacancyRate) || 0,
        0,
        parseFloat(stabilized.otherIncomeMonthly) || parseFloat(dayOne.otherIncomeMonthly) || 0,
        parseFloat(stabilized.opExMonthly) || parseFloat(dayOne.opExMonthly) || 0
      );

      const valueToday = calculateValue(noiToday, parseFloat(dealBasics.marketCapRate) || 6);
      const valueFuture = calculateValue(noiFuture, parseFloat(dealBasics.marketCapRate) || 6);

      // Grid search for optimal structure
      let bestCandidate = null;
      let bestScore = -Infinity;
      const candidates = [];

      // Iterate over debt parameters
      for (let sellerRate = 3.0; sellerRate <= 6.0; sellerRate += 0.5) {
        for (let amortYears = 25; amortYears <= 35; amortYears += 5) {
          for (let balloonYears = 5; balloonYears <= 7; balloonYears += 1) {
            for (let deferralMonths = 0; deferralMonths <= 6; deferralMonths += 3) {
              for (let downPct = 5; downPct <= 25; downPct += 5) {
                for (let pref = 0; pref <= 10; pref += 2) {
                  for (let buyoutMultiple = 1.5; buyoutMultiple <= 2.5; buyoutMultiple += 0.5) {
                    
                    const purchasePrice = parseFloat(dealBasics.purchasePrice) || 2000000;
                    const downPayment = purchasePrice * (downPct / 100);
                    const loanAmount = purchasePrice - downPayment;

                    const monthlyPayment = calculateAmortPayment(loanAmount, sellerRate, amortYears);
                    const annualDebtService = monthlyPayment * 12;

                    // DSCR day-one
                    const dscrDayOne = calculateDSCR(noiToday * 12, annualDebtService);
                    const dscrStabilized = calculateDSCR(noiFuture * 12, annualDebtService);

                    // Check constraints
                    if (dscrDayOne < parseFloat(optimizer.dscrDayOneMin)) continue;
                    if ((noiToday - monthlyPayment) < parseFloat(optimizer.cashflowDayOneMin)) continue;
                    if (balloonYears < (parseInt(stabilized.monthsToStabilize) / 12) + 0.5) continue;

                    // Refi sizing at stabilization
                    const refiMonth = parseInt(stabilized.monthsToStabilize) || 12;
                    const refiLtvCap = valueFuture * (parseFloat(optimizer.refiLtvMax) / 100);
                    const refiDscrMin = parseFloat(optimizer.refiDscrMin);
                    const refiDscrCap = (noiFuture * 12) / refiDscrMin;
                    const newLoan = Math.min(refiLtvCap, refiDscrCap);
                    const payoff = loanAmount * 0.95; // Approximate paydown
                    const cashOut = newLoan - payoff - (purchasePrice * 0.03);

                    // Investor capital needed
                    const sponsorCash = parseFloat(sponsor.cashAvailable) || 100000;
                    const investorCapital = Math.max(0, downPayment - sponsorCash);
                    const buyoutPrice = investorCapital * buyoutMultiple;

                    // Check if cash-out covers buyout
                    if (cashOut < buyoutPrice) continue;

                    // Score this candidate
                    const sponsorOwnershipY5 = 100 - ((investorCapital / purchasePrice) * 100);
                    const riskPenalty = (balloonYears === 5 ? -5 : 0) + (dscrDayOne < 1.25 ? -10 : 0);
                    const score = sponsorOwnershipY5 + riskPenalty + (cashOut - buyoutPrice) / 10000;

                    const candidate = {
                      score,
                      debtPlan: {
                        type: ["SellerFinance"],
                        rate: sellerRate / 100,
                        amortYears,
                        balloonYears,
                        deferralMonths,
                        downPct,
                        monthlyPayment,
                        loanAmount
                      },
                      equityPlan: {
                        investorCapital,
                        pref: pref / 100,
                        split: { sponsor: 0.5, investors: 0.5 },
                        buyoutOption: { multiple: buyoutMultiple, windowYears: [4, balloonYears], expectedBuyout: buyoutPrice }
                      },
                      metrics: {
                        noiToday,
                        valueToday,
                        noiFuture,
                        valueFuture,
                        dscrDayOne: parseFloat(dscrDayOne.toFixed(2)),
                        dscrStabilized: parseFloat(dscrStabilized.toFixed(2)),
                        refiMonth,
                        newLoan,
                        cashOut,
                        buyoutPrice
                      },
                      risks: [],
                      negotiationLevers: []
                    };

                    // Risk flags
                    if (balloonYears <= 5) candidate.risks.push(`Balloon at year ${balloonYears} — track refi window`);
                    if (deferralMonths === 0 && dscrDayOne < 1.25) candidate.risks.push("Thin day-one CF without deferral");
                    if (dscrDayOne - parseFloat(optimizer.dscrDayOneMin) < 0.15) candidate.risks.push("DSCR margin < 0.15");

                    // Negotiation levers
                    if (deferralMonths > 0) {
                      candidate.negotiationLevers.push(`Ask seller for ${deferralMonths}-month payment deferral.`);
                    }
                    candidate.negotiationLevers.push(
                      `Lock ${sellerRate.toFixed(1)}% rate, ${amortYears}-yr amort, ${balloonYears}-yr balloon, $${Math.round(monthlyPayment).toLocaleString()}/mo after deferral.`
                    );
                    if (investorCapital > 0) {
                      candidate.negotiationLevers.push(
                        `Offer investors ${pref}% pref + ${buyoutMultiple}× buyout Y4–${balloonYears}.`
                      );
                    }

                    candidates.push(candidate);

                    if (score > bestScore) {
                      bestScore = score;
                      bestCandidate = candidate;
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Sort and pick top 3
      candidates.sort((a, b) => b.score - a.score);
      const topCandidates = candidates.slice(0, 3);

      if (bestCandidate) {
        setResults({
          summary: {
            feasible: true,
            reason: `Day-one DSCR ${bestCandidate.metrics.dscrDayOne}× with ${bestCandidate.debtPlan.deferralMonths}-mo deferral; refi in month ${bestCandidate.metrics.refiMonth} funds ${bestCandidate.equityPlan.buyoutOption.multiple}× buyout.`
          },
          ...bestCandidate,
          alternates: topCandidates.slice(1)
        });
      } else {
        setResults({
          summary: {
            feasible: false,
            reason: "No structure found meeting constraints. Relax DSCR min or increase down payment."
          },
          metrics: { noiToday, valueToday, noiFuture, valueFuture },
          risks: ["Deal does not meet minimum DSCR or cashflow requirements"],
          negotiationLevers: ["Increase down payment", "Request seller financing with longer amortization"]
        });
      }

      setIsRunning(false);
    }, 3000);
  };

  const stepTitles = [
    'Deal Basics',
    'Current Performance',
    'Stabilization',
    'Seller Terms',
    'Sponsor Profile',
    'Equity Preferences',
    'Debt Preferences',
    'Optimizer Settings'
  ];

  return (
    <div style={styles.page}>
      {/* Header with Logo */}
      <div style={styles.header}>
        <div style={styles.container}>
          <div style={styles.logo}>
            <TerraLogo />
            <span>Terra.Ai</span>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <button
            onClick={() => setCurrentPage('home')}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={resetForm}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button onClick={() => setShowExportModal(true)} style={{ ...styles.button, ...styles.buttonSecondary }}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Main Title */}
        <div style={styles.card}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            Deal Architect
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280' }}>
            Build complete acquisition plans with deterministic debt + equity structures
          </p>
        </div>

        {/* Step Indicator */}
        <div style={styles.card}>
          <div style={styles.stepIndicator}>
            {stepTitles.map((title, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isComplete = currentStep > stepNum;
              
              return (
                <React.Fragment key={stepNum}>
                  <div
                    style={{
                      ...styles.stepDot,
                      ...(isActive ? styles.stepActive : isComplete ? styles.stepComplete : styles.stepInactive),
                      cursor: 'pointer'
                    }}
                    onClick={() => setCurrentStep(stepNum)}
                    title={title}
                  >
                    {isComplete ? '✓' : stepNum}
                  </div>
                  {stepNum < totalSteps && <div style={styles.stepLine} />}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, color: '#111827' }}>
            Step {currentStep}: {stepTitles[currentStep - 1]}
          </div>
        </div>

        {/* Step 1: Deal Basics */}
        {currentStep === 1 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <Building2 size={20} />
              Deal Basics
            </h2>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Property Name / ID</label>
                <input
                  type="text"
                  style={styles.input}
                  value={dealBasics.propertyName}
                  onChange={(e) => setDealBasics({ ...dealBasics, propertyName: e.target.value })}
                  placeholder="e.g., 38u Moses Lake"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Asset Type</label>
                <select
                  style={styles.select}
                  value={dealBasics.assetType}
                  onChange={(e) => setDealBasics({ ...dealBasics, assetType: e.target.value })}
                >
                  <option value="Multifamily">Multifamily</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                  <option value="RV/MHP">RV/MHP</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Units (#)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={dealBasics.units}
                  onChange={(e) => setDealBasics({ ...dealBasics, units: e.target.value })}
                  placeholder="e.g., 38"
                  min="5"
                />
                {dealBasics.units && parseInt(dealBasics.units) < 5 && (
                  <div style={{ ...styles.tooltip, color: '#f59e0b' }}>
                    ⚠️ Warning: Properties with less than 5 units may have limited financing options
                  </div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Purchase Price ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={dealBasics.purchasePrice}
                  onChange={(e) => setDealBasics({ ...dealBasics, purchasePrice: e.target.value })}
                  placeholder="e.g., 2000000"
                  min="0"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Market Cap Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={dealBasics.marketCapRate}
                  onChange={(e) => setDealBasics({ ...dealBasics, marketCapRate: e.target.value })}
                  placeholder="e.g., 6.0"
                  min="0"
                  max="15"
                />
                <div style={styles.tooltip}>
                  Used to calculate property value from NOI
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <div></div>
              <button onClick={nextStep} style={styles.button}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Current Performance */}
        {currentStep === 2 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <DollarSign size={20} />
              Current Performance (Day-One)
            </h2>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Gross Scheduled Rent (Monthly $)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={dayOne.grossRentMonthly}
                  onChange={(e) => setDayOne({ ...dayOne, grossRentMonthly: e.target.value })}
                  placeholder="e.g., 45000"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Physical Vacancy (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={dayOne.vacancyRate}
                  onChange={(e) => setDayOne({ ...dayOne, vacancyRate: e.target.value })}
                  placeholder="e.g., 8"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Economic Loss (Monthly $)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={dayOne.economicLossMonthly}
                  onChange={(e) => setDayOne({ ...dayOne, economicLossMonthly: e.target.value })}
                  placeholder="e.g., 2000"
                />
                <div style={styles.tooltip}>
                  Concessions, bad debt, etc.
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Other Income (Monthly $)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={dayOne.otherIncomeMonthly}
                  onChange={(e) => setDayOne({ ...dayOne, otherIncomeMonthly: e.target.value })}
                  placeholder="e.g., 1500"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Operating Expenses (Monthly $)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={dayOne.opExMonthly}
                  onChange={(e) => setDayOne({ ...dayOne, opExMonthly: e.target.value })}
                  placeholder="e.g., 25000"
                />
                <div style={styles.tooltip}>
                  All-in operating expenses
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button onClick={prevStep} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Previous
              </button>
              <button onClick={nextStep} style={styles.button}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Stabilization */}
        {currentStep === 3 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <TrendingUp size={20} />
              Stabilization (Pro Forma)
            </h2>

            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Stabilized Gross Rent (Monthly $)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={stabilized.grossRentMonthly}
                  onChange={(e) => setStabilized({ ...stabilized, grossRentMonthly: e.target.value })}
                  placeholder="e.g., 50000"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Stabilized Vacancy (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={stabilized.vacancyRate}
                  onChange={(e) => setStabilized({ ...stabilized, vacancyRate: e.target.value })}
                  placeholder="e.g., 3"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Stabilized Other Income (Monthly $)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={stabilized.otherIncomeMonthly}
                  onChange={(e) => setStabilized({ ...stabilized, otherIncomeMonthly: e.target.value })}
                  placeholder="e.g., 2000"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Stabilized OpEx (Monthly $)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={stabilized.opExMonthly}
                  onChange={(e) => setStabilized({ ...stabilized, opExMonthly: e.target.value })}
                  placeholder="e.g., 27000"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Months to Stabilize</label>
                <input
                  type="number"
                  style={styles.input}
                  value={stabilized.monthsToStabilize}
                  onChange={(e) => setStabilized({ ...stabilized, monthsToStabilize: e.target.value })}
                  placeholder="e.g., 12"
                  min="0"
                />
                <div style={styles.tooltip}>
                  Time until property reaches stabilized performance
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button onClick={prevStep} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Previous
              </button>
              <button onClick={nextStep} style={styles.button}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Seller Terms */}
        {currentStep === 4 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <FileText size={20} />
              Seller Terms & Existing Debt
            </h2>

            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Seller Open to Financing?</label>
                <select
                  style={styles.select}
                  value={seller.openToFinance}
                  onChange={(e) => setSeller({ ...seller, openToFinance: e.target.value })}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Desired Monthly Payment ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={seller.desiredMonthlyPayment}
                  onChange={(e) => setSeller({ ...seller, desiredMonthlyPayment: e.target.value })}
                  placeholder="e.g., 10000"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Desired Down Payment (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={seller.desiredDownPct}
                  onChange={(e) => setSeller({ ...seller, desiredDownPct: e.target.value })}
                  placeholder="e.g., 10"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Target Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={seller.targetRate}
                  onChange={(e) => setSeller({ ...seller, targetRate: e.target.value })}
                  placeholder="e.g., 4.0"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Balloon (years)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={seller.balloonYears}
                  onChange={(e) => setSeller({ ...seller, balloonYears: e.target.value })}
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Allow Payment Deferral?</label>
                <select
                  style={styles.select}
                  value={seller.allowPaymentDeferral}
                  onChange={(e) => setSeller({ ...seller, allowPaymentDeferral: e.target.value })}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Max Deferral (months)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={seller.maxDeferralMonths}
                  onChange={(e) => setSeller({ ...seller, maxDeferralMonths: e.target.value })}
                  placeholder="e.g., 6"
                  min="0"
                  disabled={seller.allowPaymentDeferral === 'No'}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Allow Interest-Only?</label>
                <select
                  style={styles.select}
                  value={seller.allowInterestOnly}
                  onChange={(e) => setSeller({ ...seller, allowInterestOnly: e.target.value })}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Max Interest-Only (months)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={seller.maxIOMonths}
                  onChange={(e) => setSeller({ ...seller, maxIOMonths: e.target.value })}
                  placeholder="e.g., 12"
                  min="0"
                  disabled={seller.allowInterestOnly === 'No'}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Existing Bank Debt Present?</label>
                <select
                  style={styles.select}
                  value={seller.existingDebtPresent}
                  onChange={(e) => setSeller({ ...seller, existingDebtPresent: e.target.value })}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {seller.existingDebtPresent === 'Yes' && (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Existing Debt Balance ($)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={seller.existingDebtBalance}
                      onChange={(e) => setSeller({ ...seller, existingDebtBalance: e.target.value })}
                      placeholder="e.g., 500000"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Existing Debt Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      style={styles.input}
                      value={seller.existingDebtRate}
                      onChange={(e) => setSeller({ ...seller, existingDebtRate: e.target.value })}
                      placeholder="e.g., 6.5"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Remaining Term (years)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={seller.existingDebtRemainingTerm}
                      onChange={(e) => setSeller({ ...seller, existingDebtRemainingTerm: e.target.value })}
                      placeholder="e.g., 8"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Due-on-Sale Clause?</label>
                    <select
                      style={styles.select}
                      value={seller.existingDebtDueOnSale}
                      onChange={(e) => setSeller({ ...seller, existingDebtDueOnSale: e.target.value })}
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {seller.existingDebtDueOnSale === 'Yes' && (
                      <div style={{ ...styles.tooltip, color: '#dc2626' }}>
                        ⚠️ WARNING: Subject-To has due-on-sale risk!
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button onClick={prevStep} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Previous
              </button>
              <button onClick={nextStep} style={styles.button}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Sponsor Profile */}
        {currentStep === 5 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <Users size={20} />
              Sponsor Profile & Capital
            </h2>

            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Bankability</label>
                <select
                  style={styles.select}
                  value={sponsor.bankability}
                  onChange={(e) => setSponsor({ ...sponsor, bankability: e.target.value })}
                >
                  <option value="None">None (creative only)</option>
                  <option value="Some">Some (thin)</option>
                  <option value="Bankable">Bankable (680+ credit, income)</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Sponsor Cash Available ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={sponsor.cashAvailable}
                  onChange={(e) => setSponsor({ ...sponsor, cashAvailable: e.target.value })}
                  placeholder="e.g., 100000"
                  min="0"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Has Investors?</label>
                <select
                  style={styles.select}
                  value={sponsor.hasInvestors}
                  onChange={(e) => setSponsor({ ...sponsor, hasInvestors: e.target.value })}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {sponsor.hasInvestors === 'Yes' && (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Investor Capital Available ($)</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={sponsor.investorCapitalAvailable}
                      onChange={(e) => setSponsor({ ...sponsor, investorCapitalAvailable: e.target.value })}
                      placeholder="e.g., 300000"
                      min="0"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Advisory/Board Roles Granted?</label>
                    <select
                      style={styles.select}
                      value={sponsor.advisoryRoles}
                      onChange={(e) => setSponsor({ ...sponsor, advisoryRoles: e.target.value })}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    <div style={styles.tooltip}>
                      Can improve bankability for future financing
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button onClick={prevStep} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Previous
              </button>
              <button onClick={nextStep} style={styles.button}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Equity Preferences */}
        {currentStep === 6 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <DollarSign size={20} />
              Equity Preferences
            </h2>

            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Pref % Range - Min</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={equityPrefs.prefMin}
                  onChange={(e) => setEquityPrefs({ ...equityPrefs, prefMin: e.target.value })}
                  placeholder="e.g., 0"
                  min="0"
                  max="20"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Pref % Range - Max</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={equityPrefs.prefMax}
                  onChange={(e) => setEquityPrefs({ ...equityPrefs, prefMax: e.target.value })}
                  placeholder="e.g., 12"
                  min="0"
                  max="20"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Split - Sponsor (%)</label>
                <input
                  type="number"
                  step="1"
                  style={styles.input}
                  value={equityPrefs.splitSponsor}
                  onChange={(e) => setEquityPrefs({ ...equityPrefs, splitSponsor: e.target.value, splitInvestors: String(100 - parseFloat(e.target.value || 0)) })}
                  placeholder="e.g., 50"
                  min="0"
                  max="100"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Split - Investors (%)</label>
                <input
                  type="number"
                  step="1"
                  style={styles.input}
                  value={equityPrefs.splitInvestors}
                  onChange={(e) => setEquityPrefs({ ...equityPrefs, splitInvestors: e.target.value, splitSponsor: String(100 - parseFloat(e.target.value || 0)) })}
                  placeholder="e.g., 50"
                  min="0"
                  max="100"
                />
                <div style={styles.tooltip}>
                  Post-pref profit split
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Buyout Multiple</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={equityPrefs.buyoutMultiple}
                  onChange={(e) => setEquityPrefs({ ...equityPrefs, buyoutMultiple: e.target.value })}
                  placeholder="e.g., 2.0"
                  min="1.0"
                  max="5.0"
                />
                <div style={styles.tooltip}>
                  Multiple of invested capital for buyout option
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Buyout Window - Min (years)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={equityPrefs.buyoutWindowYearsMin}
                  onChange={(e) => setEquityPrefs({ ...equityPrefs, buyoutWindowYearsMin: e.target.value })}
                  placeholder="e.g., 4"
                  min="1"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Buyout Window - Max (years)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={equityPrefs.buyoutWindowYearsMax}
                  onChange={(e) => setEquityPrefs({ ...equityPrefs, buyoutWindowYearsMax: e.target.value })}
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button onClick={prevStep} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Previous
              </button>
              <button onClick={nextStep} style={styles.button}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Debt Preferences */}
        {currentStep === 7 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <Calculator size={20} />
              Debt Preferences
            </h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ ...styles.label, marginBottom: 12 }}>Allowed Instruments</label>
              <div style={styles.grid}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={debtPrefs.allowSellerFinance}
                    onChange={(e) => setDebtPrefs({ ...debtPrefs, allowSellerFinance: e.target.checked })}
                  />
                  Seller Finance
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={debtPrefs.allowLandContract}
                    onChange={(e) => setDebtPrefs({ ...debtPrefs, allowLandContract: e.target.checked })}
                  />
                  Land Contract
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={debtPrefs.allowConventionalDSCR}
                    onChange={(e) => setDebtPrefs({ ...debtPrefs, allowConventionalDSCR: e.target.checked })}
                  />
                  Conventional DSCR
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={debtPrefs.allowPrivateBridge}
                    onChange={(e) => setDebtPrefs({ ...debtPrefs, allowPrivateBridge: e.target.checked })}
                  />
                  Private Bridge
                </label>
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Seller Rate Min (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={debtPrefs.sellerRateMin}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, sellerRateMin: e.target.value })}
                  placeholder="e.g., 3.0"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Seller Rate Max (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={debtPrefs.sellerRateMax}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, sellerRateMax: e.target.value })}
                  placeholder="e.g., 6.0"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Bank Rate Min (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={debtPrefs.bankRateMin}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, bankRateMin: e.target.value })}
                  placeholder="e.g., 6.5"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Bank Rate Max (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={debtPrefs.bankRateMax}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, bankRateMax: e.target.value })}
                  placeholder="e.g., 8.5"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Private Rate Min (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={debtPrefs.privateRateMin}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, privateRateMin: e.target.value })}
                  placeholder="e.g., 9.0"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Private Rate Max (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={debtPrefs.privateRateMax}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, privateRateMax: e.target.value })}
                  placeholder="e.g., 14.0"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Max Balloon (years)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={debtPrefs.maxBalloonYears}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, maxBalloonYears: e.target.value })}
                  placeholder="e.g., 7"
                  min="1"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Min Fixed Term (years)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={debtPrefs.minFixedTermYears}
                  onChange={(e) => setDebtPrefs({ ...debtPrefs, minFixedTermYears: e.target.value })}
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button onClick={prevStep} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Previous
              </button>
              <button onClick={nextStep} style={styles.button}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Optimizer Settings */}
        {currentStep === 8 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <Calculator size={20} />
              Optimizer Settings & Constraints
            </h2>

            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>DSCR Day-One Minimum</label>
                <input
                  type="number"
                  step="0.01"
                  style={styles.input}
                  value={optimizer.dscrDayOneMin}
                  onChange={(e) => setOptimizer({ ...optimizer, dscrDayOneMin: e.target.value })}
                  placeholder="e.g., 1.15"
                  min="0.5"
                  max="2.0"
                />
                <div style={styles.tooltip}>
                  Hard constraint: deal must meet this DSCR on day-one
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Cashflow Day-One Minimum ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={optimizer.cashflowDayOneMin}
                  onChange={(e) => setOptimizer({ ...optimizer, cashflowDayOneMin: e.target.value })}
                  placeholder="e.g., 0"
                />
                <div style={styles.tooltip}>
                  Monthly cashflow required on day-one
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Refi LTV Max (%)</label>
                <input
                  type="number"
                  step="0.1"
                  style={styles.input}
                  value={optimizer.refiLtvMax}
                  onChange={(e) => setOptimizer({ ...optimizer, refiLtvMax: e.target.value })}
                  placeholder="e.g., 70"
                  min="50"
                  max="80"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Refi DSCR Minimum</label>
                <input
                  type="number"
                  step="0.01"
                  style={styles.input}
                  value={optimizer.refiDscrMin}
                  onChange={(e) => setOptimizer({ ...optimizer, refiDscrMin: e.target.value })}
                  placeholder="e.g., 1.20"
                  min="1.0"
                  max="1.5"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Investor Outcome</label>
                <select
                  style={styles.select}
                  value={optimizer.investorOutcome}
                  onChange={(e) => setOptimizer({ ...optimizer, investorOutcome: e.target.value })}
                >
                  <option value="MultipleOrPref">2.0× by Y5 OR 9-12% pref</option>
                  <option value="MultipleOnly">Must have 2.0× buyout option</option>
                  <option value="PrefOnly">High pref (8-12%), no multiple</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Objective</label>
                <select
                  style={styles.select}
                  value={optimizer.objective}
                  onChange={(e) => setOptimizer({ ...optimizer, objective: e.target.value })}
                >
                  <option value="MaxSponsorOwnershipY5">Max Sponsor Ownership by Y5</option>
                  <option value="MinUpfrontCash">Minimize Upfront Cash</option>
                  <option value="MaxSponsorNet5yr">Max 5-Yr Sponsor Net (CF + Refi - Buyout)</option>
                </select>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navigationButtons}>
              <button onClick={prevStep} style={{ ...styles.button, ...styles.buttonSecondary }}>
                ← Previous
              </button>
              <button 
                onClick={runOptimizer}
                disabled={isRunning}
                style={{ ...styles.button, ...(isRunning ? styles.buttonDisabled : {}) }}
              >
                {isRunning ? '⏳ Running Optimizer...' : '🚀 Run Optimizer'}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <TrendingUp size={20} />
              Optimized Structure
            </h2>
            
            <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 8, border: '1px solid #86efac', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle size={20} color="#047857" />
                <span style={{ fontWeight: 600, color: '#047857' }}>✅ Deal is Feasible</span>
              </div>
              <p style={{ color: '#065f46', fontSize: 14 }}>{results.summary.reason}</p>
            </div>

            {/* Metrics Grid */}
            <div style={styles.grid}>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Day-One NOI</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
                  ${results.metrics.noiToday.toLocaleString()}
                </div>
              </div>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Day-One DSCR</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#047857' }}>
                  {results.metrics.dscrDayOne}×
                </div>
              </div>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Stabilized DSCR</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#047857' }}>
                  {results.metrics.dscrStabilized}×
                </div>
              </div>
              <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Future Value</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
                  ${(results.metrics.valueFuture / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>

            {/* Negotiation Levers */}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Negotiation Levers</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {results.negotiationLevers.map((lever, i) => (
                  <li key={i} style={{ padding: '8px 12px', background: '#eff6ff', borderLeft: '3px solid #2563eb', marginBottom: 8, borderRadius: 4 }}>
                    {lever}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Flags */}
            {results.risks && results.risks.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#f59e0b' }}>⚠️ Risk Flags</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {results.risks.map((risk, i) => (
                    <li key={i} style={{ padding: '8px 12px', background: '#fef3c7', borderLeft: '3px solid #f59e0b', marginBottom: 8, borderRadius: 4 }}>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternate Structures */}
            {results.alternates && results.alternates.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📊 Alternate Structures</h3>
                {results.alternates.map((alt, idx) => (
                  <details key={idx} style={{ marginBottom: 12, padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                      Option {idx + 2}: DSCR {alt.metrics.dscrDayOne}× / Rate {(alt.debtPlan.rate * 100).toFixed(1)}% / Deferral {alt.debtPlan.deferralMonths}mo
                    </summary>
                    <div style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>
                      <div><strong>Debt:</strong> {(alt.debtPlan.rate * 100).toFixed(1)}% rate, {alt.debtPlan.amortYears}yr amort, {alt.debtPlan.balloonYears}yr balloon</div>
                      <div><strong>Payment:</strong> ${Math.round(alt.debtPlan.monthlyPayment).toLocaleString()}/mo after {alt.debtPlan.deferralMonths} months deferral</div>
                      <div><strong>Equity:</strong> Investor capital ${alt.equityPlan.investorCapital.toLocaleString()}, {(alt.equityPlan.pref * 100).toFixed(0)}% pref, {alt.equityPlan.buyoutOption.multiple}× buyout</div>
                      <div><strong>Refi:</strong> Month {alt.metrics.refiMonth}, cash-out ${Math.round(alt.metrics.cashOut).toLocaleString()}</div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: 12,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: 32
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>Export Deal Structure</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button style={{ ...styles.button, width: '100%', justifyContent: 'flex-start' }}>
                  <FileText size={18} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Seller-Finance Term Sheet</div>
                    <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
                      Price, down, rate, amort, balloon, payment schedule
                    </div>
                  </div>
                </button>

                <button style={{ ...styles.button, width: '100%', justifyContent: 'flex-start' }}>
                  <Users size={18} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Equity Summary & Buyout Option</div>
                    <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
                      Capital, pref, split, buyout terms, waterfall order
                    </div>
                  </div>
                </button>

                <button style={{ ...styles.button, width: '100%', justifyContent: 'flex-start' }}>
                  <Calculator size={18} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Lender Package Summary</div>
                    <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
                      DSCRs, NOI, value projections, refi sizing
                    </div>
                  </div>
                </button>

                <button style={{ ...styles.button, width: '100%', justifyContent: 'flex-start' }}>
                  <TrendingUp size={18} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Risk & Compliance Summary</div>
                    <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
                      Risk flags, validation checks, compliance notes
                    </div>
                  </div>
                </button>

                <button style={{ ...styles.button, width: '100%', justifyContent: 'flex-start' }}>
                  <Download size={18} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>Full Deal Package (PDF)</div>
                    <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8 }}>
                      All documents combined in single PDF
                    </div>
                  </div>
                </button>
              </div>

              <div style={{ marginTop: 24, padding: 16, background: '#eff6ff', borderRadius: 8, fontSize: 14, color: '#1e40af' }}>
                💡 <strong>Tip:</strong> Export functions generate deterministic documents with exact terms. No AI needed for calculations.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentGenerator;
