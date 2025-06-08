import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Zap, TrendingUp, DollarSign, Users, Building, Target, Lightbulb, CheckCircle, AlertTriangle, Star, ArrowRight, PieChart, BarChart3, Percent, Calendar, Shield, Award } from 'lucide-react';

const DealStructurePage = ({ setCurrentPage, propertyData }) => {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(true);
  const [strategies, setStrategies] = useState([]);

  // Calculate key metrics
  const metrics = {
    purchasePrice: parseFloat(propertyData.purchasePrice) || 0,
    downPayment: parseFloat(propertyData.downPayment) || 0,
    loanAmount: parseFloat(propertyData.loanAmount) || 0,
    units: parseFloat(propertyData.units) || 0,
    grossRent: parseFloat(propertyData.grossRent) || 0,
    netOperatingIncome: parseFloat(propertyData.netOperatingIncome) || 0,
    capRate: ((parseFloat(propertyData.netOperatingIncome) || 0) / (parseFloat(propertyData.purchasePrice) || 1)) * 100,
    pricePerUnit: (parseFloat(propertyData.purchasePrice) || 0) / (parseFloat(propertyData.units) || 1),
    ltvRatio: ((parseFloat(propertyData.loanAmount) || 0) / (parseFloat(propertyData.purchasePrice) || 1)) * 100,
    cashOnCash: ((parseFloat(propertyData.netOperatingIncome) || 0) - ((parseFloat(propertyData.loanAmount) || 0) * 0.05)) / (parseFloat(propertyData.downPayment) || 1) * 100,
    rentMultiplier: (parseFloat(propertyData.purchasePrice) || 0) / ((parseFloat(propertyData.grossRent) || 0) * 12)
  };

  useEffect(() => {
    // Simulate AI analysis
    setTimeout(() => {
      generateStrategies();
      setAiAnalyzing(false);
    }, 3000);
  }, []);

  const generateStrategies = () => {
    const generatedStrategies = [];

    // Strategy 1: Traditional Purchase
    generatedStrategies.push({
      id: 'traditional',
      title: 'Traditional Bank Financing',
      confidence: 85,
      risk: 'Low',
      complexity: 'Simple',
      timeToClose: '30-45 days',
      icon: Building,
      color: '#10b981',
      description: 'Standard commercial loan with 20-25% down payment',
      structure: {
        downPayment: metrics.downPayment,
        financing: metrics.loanAmount,
        lender: 'Commercial Bank',
        interestRate: '6.5% - 7.5%',
        term: '25-30 years',
        amortization: '25-30 years'
      },
      pros: [
        'Established lending relationship',
        'Competitive interest rates',
        'Long-term fixed rates available',
        'Build credit history'
      ],
      cons: [
        'Requires significant cash down',
        'Personal guarantees required',
        'Strict underwriting standards',
        'Limited flexibility'
      ],
      suitability: metrics.ltvRatio <= 80 && metrics.capRate >= 6 ? 'Excellent' : 'Good'
    });

    // Strategy 2: Seller Financing
    if (metrics.purchasePrice > 500000) {
      generatedStrategies.push({
        id: 'seller-finance',
        title: 'Seller Financing Hybrid',
        confidence: 72,
        risk: 'Medium',
        complexity: 'Moderate',
        timeToClose: '20-30 days',
        icon: Users,
        color: '#3b82f6',
        description: 'Combination of seller financing and traditional loan to reduce cash requirement',
        structure: {
          downPayment: metrics.downPayment * 0.5,
          bankLoan: metrics.loanAmount * 0.7,
          sellerNote: metrics.purchasePrice * 0.2,
          interestRate: '5.5% - 6.5% (seller note)',
          term: '5-10 years (balloon)',
          amortization: '25-30 years'
        },
        pros: [
          'Reduced cash requirement',
          'Faster closing process',
          'Negotiable terms with seller',
          'Potential tax benefits for seller'
        ],
        cons: [
          'Balloon payment risk',
          'Dual payment obligations',
          'Seller due diligence required',
          'Limited availability'
        ],
        suitability: 'Excellent'
      });
    }

    // Strategy 3: Partnership/Syndication
    if (metrics.downPayment > 200000) {
      generatedStrategies.push({
        id: 'partnership',
        title: 'Investment Partnership',
        confidence: 78,
        risk: 'Medium',
        complexity: 'Complex',
        timeToClose: '45-60 days',
        icon: Users,
        color: '#8b5cf6',
        description: 'Partner with other investors to pool capital and share returns',
        structure: {
          yourEquity: '25-51%',
          partnerEquity: '49-75%',
          totalRaise: metrics.downPayment,
          managementFee: '1-2% annually',
          preferredReturn: '8% to partners',
          promoteFee: '20-30% above preferred'
        },
        pros: [
          'Reduced personal capital requirement',
          'Shared risk and expertise',
          'Access to larger deals',
          'Network expansion'
        ],
        cons: [
          'Shared control and profits',
          'Complex legal structure',
          'Partner management required',
          'Potential conflicts'
        ],
        suitability: 'Very Good'
      });
    }

    // Strategy 4: Creative Structure
    generatedStrategies.push({
      id: 'creative',
      title: 'Creative Acquisition Structure',
      confidence: 68,
      risk: 'Medium-High',
      complexity: 'Complex',
      timeToClose: '30-45 days',
      icon: Lightbulb,
      color: '#f59e0b',
      description: 'Innovative approach combining multiple financing sources',
      structure: {
        hardMoney: metrics.purchasePrice * 0.7,
        privateInvestor: metrics.downPayment * 0.6,
        personalFunds: metrics.downPayment * 0.4,
        refinanceIn: '6-12 months',
        strategy: 'Bridge to permanent financing'
      },
      pros: [
        'Speed of execution',
        'Competitive advantage',
        'Less bank bureaucracy',
        'Flexible terms'
      ],
      cons: [
        'Higher interest rates',
        'Refinance risk',
        'Personal relationships required',
        'More complex structure'
      ],
      suitability: metrics.capRate >= 7 ? 'Good' : 'Fair'
    });

    // Strategy 5: Low Down Payment
    if (metrics.ltvRatio > 80) {
      generatedStrategies.push({
        id: 'low-down',
        title: 'High Leverage Strategy',
        confidence: 64,
        risk: 'High',
        complexity: 'Moderate',
        timeToClose: '35-50 days',
        icon: TrendingUp,
        color: '#ef4444',
        description: 'Minimize cash investment through high-leverage financing',
        structure: {
          firstMortgage: metrics.purchasePrice * 0.75,
          secondMortgage: metrics.purchasePrice * 0.15,
          downPayment: metrics.purchasePrice * 0.10,
          combinedLTV: '90%',
          blendedRate: '7.5% - 8.5%'
        },
        pros: [
          'Minimal cash requirement',
          'Higher return on equity',
          'Preserve capital for other deals',
          'Leverage tax benefits'
        ],
        cons: [
          'Higher debt service',
          'Increased risk',
          'Limited cash flow',
          'Refinance challenges'
        ],
        suitability: metrics.cashOnCash >= 12 ? 'Good' : 'Risky'
      });
    }

    // Strategy 6: 1031 Exchange
    generatedStrategies.push({
      id: 'exchange',
      title: '1031 Exchange Structure',
      confidence: 82,
      risk: 'Low-Medium',
      complexity: 'Moderate',
      timeToClose: '45-60 days',
      icon: ArrowRight,
      color: '#06b6d4',
      description: 'Tax-deferred exchange from existing property',
      structure: {
        exchangeValue: metrics.purchasePrice,
        deferredTax: 'Estimate $50k-200k',
        newFinancing: metrics.loanAmount,
        additionalCash: 'If needed for value increase',
        timeline: '180 days total'
      },
      pros: [
        'Tax deferral benefits',
        'Portfolio consolidation',
        'Wealth preservation',
        'Estate planning advantages'
      ],
      cons: [
        'Strict timeline requirements',
        'Like-kind property rules',
        'Intermediary fees',
        'Limited property options'
      ],
      suitability: 'Excellent (if exchanging)'
    });

    setStrategies(generatedStrategies);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return '#10b981';
      case 'Low-Medium': return '#06b6d4';
      case 'Medium': return '#f59e0b';
      case 'Medium-High': return '#ef4444';
      case 'High': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'Excellent': return '#10b981';
      case 'Very Good': return '#06b6d4';
      case 'Good': return '#8b5cf6';
      case 'Fair': return '#f59e0b';
      case 'Risky': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (aiAnalyzing) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            border: '4px solid #374151',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 32px'
          }} />
          
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '16px' }}>
            AI Analyzing Your Deal
          </h2>
          
          <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6' }}>
            Our AI is analyzing {propertyData.propertyName || 'your property'} and generating 
            creative acquisition strategies based on current market conditions, your financial profile, 
            and deal-specific metrics...
          </p>
          
          <div style={{ marginTop: '32px', padding: '24px', background: '#1e293b', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>
              Processing Deal Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.875rem' }}>
              <div>Purchase Price: ${metrics.purchasePrice.toLocaleString()}</div>
              <div>Cap Rate: {metrics.capRate.toFixed(2)}%</div>
              <div>Price/Unit: ${metrics.pricePerUnit.toLocaleString()}</div>
              <div>LTV: {metrics.ltvRatio.toFixed(1)}%</div>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      color: 'white',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => setCurrentPage('results')}
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
            <ArrowLeft size={16} /> Back to Analysis
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
              AI Deal Strategies
            </h1>
            <p style={{ color: '#94a3b8' }}>
              Creative acquisition strategies for {propertyData.propertyName || 'your property'}
            </p>
          </div>
          
          <div style={{ width: '120px' }} />
        </div>

        {/* Property Summary */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #374151 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #10b981'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Brain style={{ color: '#10b981' }} size={24} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
              AI Deal Analysis Summary
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <DollarSign style={{ margin: '0 auto 8px', color: '#10b981' }} size={20} />
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                ${(metrics.purchasePrice/1000000).toFixed(2)}M
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Purchase Price</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <Percent style={{ margin: '0 auto 8px', color: '#3b82f6' }} size={20} />
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {metrics.capRate.toFixed(2)}%
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cap Rate</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <Building style={{ margin: '0 auto 8px', color: '#8b5cf6' }} size={20} />
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                ${(metrics.pricePerUnit/1000).toFixed(0)}K
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Price per Unit</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <TrendingUp style={{ margin: '0 auto 8px', color: '#f59e0b' }} size={20} />
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {metrics.cashOnCash.toFixed(1)}%
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Cash-on-Cash</div>
            </div>
          </div>
        </div>

        {/* Strategies Grid */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
            Recommended Acquisition Strategies
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {strategies.map((strategy) => {
              const IconComponent = strategy.icon;
              const isSelected = selectedStrategy === strategy.id;
              
              return (
                <div
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(isSelected ? null : strategy.id)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #1e293b 0%, #374151 100%)' : '#1e293b',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: isSelected ? `2px solid ${strategy.color}` : '1px solid #374151',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        padding: '8px', 
                        background: strategy.color + '20', 
                        borderRadius: '8px',
                        border: `1px solid ${strategy.color}`
                      }}>
                        <IconComponent style={{ color: strategy.color }} size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>
                          {strategy.title}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                          {strategy.description}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        padding: '4px 8px', 
                        background: strategy.color + '20', 
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: strategy.color
                      }}>
                        {strategy.confidence}% Confidence
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Risk Level</div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: getRiskColor(strategy.risk)
                      }}>
                        {strategy.risk}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Complexity</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{strategy.complexity}</div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Timeline</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{strategy.timeToClose}</div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Suitability</div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600',
                        color: getSuitabilityColor(strategy.suitability)
                      }}>
                        {strategy.suitability}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>
                            Structure Details
                          </h4>
                          <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                            {Object.entries(strategy.structure).map(([key, value]) => (
                              <div key={key} style={{ marginBottom: '6px' }}>
                                <span style={{ color: '#94a3b8' }}>
                                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                </span>{' '}
                                <span style={{ fontWeight: '500' }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#10b981' }}>
                              Pros
                            </h4>
                            {strategy.pros.map((pro, index) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                                <CheckCircle size={12} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{pro}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>
                              Cons
                            </h4>
                            {strategy.cons.map((con, index) => (
                              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                                <AlertTriangle size={12} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{con}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <Zap style={{ margin: '0 auto 12px', color: 'white' }} size={32} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>
            AI Recommendation
          </h3>
          <p style={{ fontSize: '1.125rem', lineHeight: '1.6', opacity: 0.9 }}>
            Based on your deal metrics, market conditions, and risk profile, we recommend starting with{' '}
            <strong>{strategies.find(s => s.confidence === Math.max(...strategies.map(st => st.confidence)))?.title}</strong>{' '}
            as your primary strategy, with {strategies.filter(s => s.suitability === 'Excellent').length > 1 ? 'fallback options' : 'creative alternatives'} ready for negotiation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealStructurePage;