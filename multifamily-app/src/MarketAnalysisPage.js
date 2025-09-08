// src/MarketAnalysisPage.js
import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { BarChart3, Search, Home, ArrowLeft, MapPin, Building, TrendingUp, Download } from 'lucide-react';

/* ---- one-time spinner keyframes ---- */
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('style[data-spinner]');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.setAttribute('data-spinner', 'true');
    style.textContent = `
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }
}

/* ---------------- PDF Export Function ---------------- */
const exportToPDF = async () => {
  // Check if libraries are available
  if (typeof window === 'undefined') return;
  
  // Load html2canvas and jsPDF from CDN if not already loaded
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  try {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 24px 48px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 16px;
    `;
    loadingDiv.innerHTML = `
      <div style="width: 24px; height: 24px; border: 3px solid #e5e7eb; border-top: 3px solid #06b6d4; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <div style="color: #333; font-size: 16px; font-weight: 600;">Generating PDF...</div>
    `;
    document.body.appendChild(loadingDiv);

    // Load required libraries
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    // Wait for libraries to be available
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get the main content div (entire page)
    const element = document.getElementById('market-analysis-content') || document.body;
    
    // Configure html2canvas options
    const canvas = await window.html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY
    });

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    
    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Create PDF with proper dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Get location name for filename
    const locationElement = document.querySelector('[data-location]');
    const locationName = locationElement ? locationElement.textContent : 'market_analysis';
    const fileName = `${locationName.replace(/[^a-z0-9]/gi, '_')}_report_${new Date().toISOString().split('T')[0]}.pdf`;

    // Save the PDF
    pdf.save(fileName);

    // Remove loading indicator
    document.body.removeChild(loadingDiv);

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Remove loading indicator if it exists
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) document.body.removeChild(loadingDiv);
    
    alert('Failed to generate PDF. Please try again or use your browser\'s print function (Ctrl+P / Cmd+P) and save as PDF.');
  }
};

/* ---------------- helpers ---------------- */
const fmt = (n) => (n || n === 0 ? Number(n).toLocaleString('en-US') : 'N/A');
const formatCurrency = (num) => {
  const n = Number(num);
  if (isNaN(n) || n === 0) return '$0';
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits:0, maximumFractionDigits:0 }).format(n);
};
const formatPercent = (num, digits = 1) =>
  num !== null && num !== undefined && !isNaN(num) ? `${Number(num).toFixed(digits)}%` : 'N/A';

const cleanValue = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const num = Number(String(v).replace(/[, %$]/g, ''));
  return isNaN(num) ? null : num;
};
const zeroZip = (z) => {
  if (z === null || z === undefined) return null;
  const s = String(Math.trunc(Number(z) || Number(String(z).replace(/\D/g, '')) || 0));
  return s.padStart(5, '0');
};
const absUrl = (p) => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const base = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
  return `${base}${p.startsWith('/') ? p : '/' + p}`;
};
const loadCSV = async (url) => {
  const u = absUrl(url);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`${u}: ${res.status}`);
  const text = await res.text();
  return Papa.parse(text, { header: true, dynamicTyping: false, skipEmptyLines: true }).data;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* -------- responsive width hook -------- */
function useContainerWidth(min = 620) {
  const ref = useRef(null);
  const [w, setW] = useState(min);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr?.width) setW(Math.max(min, cr.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [min]);
  return [ref, w];
}

/* ---------------- Investment Algorithm ---------------- */
function calculateInvestmentScore(data) {
  // Initialize with default values to prevent errors
  const scores = {
    renterDemand: 0,
    cashFlow: 0,
    appreciation: 0,
    marketStability: 0,
    regulatory: 0
  };
  
  const weights = {
    renterDemand: 0.30,
    cashFlow: 0.25,
    appreciation: 0.20,
    marketStability: 0.15,
    regulatory: 0.10
  };
  
  let dataPoints = 0;
  let maxPoints = 0;
  
  // 1. RENTER DEMAND SCORE (30%)
  const renterPct = cleanValue(data.pct_renter);
  if (renterPct != null && !isNaN(renterPct)) {
    maxPoints += 40;
    if (renterPct >= 40) { scores.renterDemand += 40; dataPoints++; }
    else if (renterPct >= 30) { scores.renterDemand += 30; dataPoints++; }
    else if (renterPct >= 20) { scores.renterDemand += 20; dataPoints++; }
    else { scores.renterDemand += 5; dataPoints++; }
  }
  
  const vacancy = cleanValue(data.vacancyRate);
  if (vacancy != null && !isNaN(vacancy)) {
    maxPoints += 30;
    if (vacancy >= 3 && vacancy <= 7) { scores.renterDemand += 30; dataPoints++; }
    else if (vacancy > 7 && vacancy <= 10) { scores.renterDemand += 20; dataPoints++; }
    else if (vacancy < 3) { scores.renterDemand += 15; dataPoints++; }
    else { scores.renterDemand += 5; dataPoints++; }
  }
  
  const popGrowth = cleanValue(data.population_change_pct_17_23);
  if (popGrowth != null && !isNaN(popGrowth)) {
    maxPoints += 30;
    if (popGrowth >= 10) { scores.renterDemand += 30; dataPoints++; }
    else if (popGrowth >= 5) { scores.renterDemand += 20; dataPoints++; }
    else if (popGrowth >= 0) { scores.renterDemand += 10; dataPoints++; }
    else { scores.renterDemand += 0; dataPoints++; }
  }
  
  // 2. CASH FLOW SCORE (25%)
  const medianRent = cleanValue(data.medianGrossRent);
  const income = cleanValue(data.medianHouseholdIncome);
  if (medianRent && income && income > 0) {
    const rentToIncome = (medianRent * 12) / income;
    maxPoints += 40;
    if (rentToIncome >= 0.25 && rentToIncome <= 0.35) { scores.cashFlow += 40; dataPoints++; }
    else if (rentToIncome > 0.20 && rentToIncome < 0.40) { scores.cashFlow += 30; dataPoints++; }
    else if (rentToIncome <= 0.20) { scores.cashFlow += 10; dataPoints++; }
    else { scores.cashFlow += 5; dataPoints++; }
  }
  
  const employment = cleanValue(data.employmentRate);
  if (employment != null && !isNaN(employment)) {
    maxPoints += 30;
    if (employment >= 60) { scores.cashFlow += 30; dataPoints++; }
    else if (employment >= 50) { scores.cashFlow += 20; dataPoints++; }
    else if (employment >= 40) { scores.cashFlow += 10; dataPoints++; }
    else { scores.cashFlow += 5; dataPoints++; }
  }
  
  const fmr2br = cleanValue(data.fmr_2br);
  if (medianRent && fmr2br && fmr2br > 0) {
    const rentGap = (medianRent - fmr2br) / fmr2br;
    maxPoints += 30;
    if (rentGap >= -0.1 && rentGap <= 0.1) { scores.cashFlow += 30; dataPoints++; }
    else if (rentGap > 0.1) { scores.cashFlow += 20; dataPoints++; }
    else { scores.cashFlow += 10; dataPoints++; }
  }
  
  // 3. APPRECIATION SCORE (20%)
  const zhvi5y = cleanValue(data.zhvi_5y_growth_pct);
  if (zhvi5y != null && !isNaN(zhvi5y)) {
    maxPoints += 40;
    if (zhvi5y >= 40) { scores.appreciation += 40; dataPoints++; }
    else if (zhvi5y >= 25) { scores.appreciation += 30; dataPoints++; }
    else if (zhvi5y >= 10) { scores.appreciation += 20; dataPoints++; }
    else if (zhvi5y >= 0) { scores.appreciation += 10; dataPoints++; }
    else { scores.appreciation += 0; dataPoints++; }
  }
  
  if (income != null && !isNaN(income)) {
    maxPoints += 30;
    if (income >= 75000) { scores.appreciation += 30; dataPoints++; }
    else if (income >= 60000) { scores.appreciation += 20; dataPoints++; }
    else if (income >= 45000) { scores.appreciation += 15; dataPoints++; }
    else { scores.appreciation += 10; dataPoints++; }
  }
  
  // 4. MARKET STABILITY SCORE (15%)
  const density = cleanValue(data.density_sqmi);
  if (density != null && !isNaN(density)) {
    maxPoints += 40;
    if (density >= 1000 && density <= 8000) { scores.marketStability += 40; dataPoints++; }
    else if (density >= 500 && density < 1000) { scores.marketStability += 30; dataPoints++; }
    else if (density > 8000) { scores.marketStability += 20; dataPoints++; }
    else { scores.marketStability += 10; dataPoints++; }
  }
  
  const totalUnits = cleanValue(data.total_units) || cleanValue(data.totalHousingUnits);
  if (totalUnits != null && !isNaN(totalUnits)) {
    maxPoints += 30;
    if (totalUnits >= 5000) { scores.marketStability += 30; dataPoints++; }
    else if (totalUnits >= 2000) { scores.marketStability += 20; dataPoints++; }
    else if (totalUnits >= 500) { scores.marketStability += 10; dataPoints++; }
    else { scores.marketStability += 5; dataPoints++; }
  }
  
  // 5. REGULATORY SCORE (10%) - Use defaults if missing
  const landlordScore = cleanValue(data.landlord_friendly_score);
  if (landlordScore != null && !isNaN(landlordScore)) {
    const normalizedScore = landlordScore > 1 ? landlordScore / 5 : landlordScore;
    scores.regulatory = normalizedScore * 100;
    dataPoints++;
  } else {
    scores.regulatory = 50; // Default to neutral if no data
  }
  
  // Calculate weighted total
  let totalScore = 0;
  for (const [category, score] of Object.entries(scores)) {
    totalScore += (score / 100) * weights[category] * 100;
  }
  
  // Determine recommendation
  let recommendation = '';
  let confidence = '';
  let reasons = [];
  
  if (totalScore >= 75) {
    recommendation = 'STRONG BUY';
    confidence = 'High';
  } else if (totalScore >= 60) {
    recommendation = 'BUY';
    confidence = 'Moderate-High';
  } else if (totalScore >= 45) {
    recommendation = 'HOLD/RESEARCH';
    confidence = 'Moderate';
  } else if (totalScore >= 30) {
    recommendation = 'CAUTION';
    confidence = 'Low-Moderate';
  } else {
    recommendation = 'AVOID';
    confidence = 'Low';
  }
  
  // Generate specific reasons
  if (renterPct != null) {
    if (renterPct < 25) reasons.push(`Low renter demand (${renterPct.toFixed(1)}%)`);
    if (renterPct >= 40) reasons.push(`Strong renter base (${renterPct.toFixed(1)}%)`);
  }
  if (popGrowth != null) {
    if (popGrowth >= 10) reasons.push(`Excellent population growth (${popGrowth.toFixed(1)}%)`);
    if (popGrowth < 0) reasons.push(`Declining population (${popGrowth.toFixed(1)}%)`);
  }
  if (vacancy != null) {
    if (vacancy >= 3 && vacancy <= 7) reasons.push(`Healthy vacancy rate (${vacancy.toFixed(1)}%)`);
    if (vacancy > 10) reasons.push(`High vacancy risk (${vacancy.toFixed(1)}%)`);
  }
  if (zhvi5y != null && zhvi5y >= 25) {
    reasons.push(`Strong appreciation history (${zhvi5y.toFixed(1)}% over 5 years)`);
  }
  if (employment != null && employment >= 60) {
    reasons.push(`Strong employment (${employment.toFixed(1)}%)`);
  }
  
  // Always return a valid object
  return {
    totalScore: Math.round(totalScore),
    recommendation: recommendation || 'HOLD/RESEARCH',
    confidence: confidence || 'Moderate',
    reasons: reasons.length > 0 ? reasons : ['Limited data available for comprehensive analysis'],
    breakdown: scores,
    dataPoints: dataPoints
  };
}
function norm01(v, lo, hi) {
  if (v == null || isNaN(v) || lo == null || hi == null || lo === hi) return 0;
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
}

function bandScore(v, idealLo, idealHi, hardLo, hardHi) {
  // 1.0 inside [idealLo, idealHi]; linearly taper to 0.0 at [hardLo, hardHi] bounds
  if (v == null || isNaN(v)) return 0;
  if (v >= idealLo && v <= idealHi) return 1;
  if (v < idealLo) return Math.max(0, (v - hardLo) / (idealLo - hardLo));
  // v > idealHi
  return Math.max(0, (hardHi - v) / (hardHi - idealHi));
}

function computeRangesAll(rows) {
  const acc = {
    popGrowth: [], employmentRate: [], income: [], homeValueGrowth: [],
    rentBurden: [], vacancy: [], density: [], listingsPerK: [], fmrGap: [], renterPct: []
  };
  for (const r of rows) {
    const p17 = cleanValue(r.population_2017);
    const p23 = cleanValue(r.population_2023 ?? r.population);
    if (p17 && p23) acc.popGrowth.push(((p23 - p17) / p17) * 100);
    const emp = cleanValue(r.employmentRate); if (emp != null) acc.employmentRate.push(emp);
    const inc = cleanValue(r.medianHouseholdIncome); if (inc != null) acc.income.push(inc);
    const zhvi5 = cleanValue(r.zhvi_5y_growth_pct); const zhvi1 = cleanValue(r.zhvi_1y_growth_pct);
    const hvg = zhvi5 != null ? zhvi5 : zhvi1; if (hvg != null) acc.homeValueGrowth.push(hvg);
    const rent = cleanValue(r.medianGrossRent); if (rent && inc) acc.rentBurden.push((rent * 12) / inc);
    const vac = cleanValue(r.vacancyRate); if (vac != null) acc.vacancy.push(vac);
    const dens = cleanValue(r.density_sqmi); if (dens != null) acc.density.push(dens);
    const units = cleanValue(r.total_units ?? r.totalHousingUnits);
    const listings = Number(r._totalListings || 0);
    if (units) acc.listingsPerK.push((listings / units) * 1000);
    const fmr2 = cleanValue(r.fmr_2br);
    const live2 = Number(r._avgLive2br || NaN);
    if (fmr2 && live2) acc.fmrGap.push((live2 - fmr2) / fmr2);
    const pctR = cleanValue(r.pct_renter); if (pctR != null) acc.renterPct.push(pctR);
  }
  const range = a => a.length ? [Math.min(...a), Math.max(...a)] : [null, null];
  return {
    popGrowth: range(acc.popGrowth),
    employmentRate: range(acc.employmentRate),
    income: range(acc.income),
    homeValueGrowth: range(acc.homeValueGrowth),
    rentBurden: range(acc.rentBurden),
    vacancy: range(acc.vacancy),
    density: range(acc.density),
    listingsPerK: range(acc.listingsPerK),
    fmrGap: range(acc.fmrGap),
    renterPct: range(acc.renterPct),
  };
}

function scoreMarket(row, ranges) {
  // Core metrics
  const p17 = cleanValue(row.population_2017);
  const p23 = cleanValue(row.population_2023 ?? row.population);
  const popG = (p17 && p23) ? ((p23 - p17) / p17) * 100 : null;
  const emp = cleanValue(row.employmentRate);
  const inc = cleanValue(row.medianHouseholdIncome);
  const zhvi5 = cleanValue(row.zhvi_5y_growth_pct);
  const zhvi1 = cleanValue(row.zhvi_1y_growth_pct);
  const hvg = zhvi5 != null ? zhvi5 : zhvi1;

  // Affordability / demand
  const rent = cleanValue(row.medianGrossRent);
  const rentBurden = (rent && inc) ? (rent * 12) / inc : null; // want ~25–33%
  const vac = cleanValue(row.vacancyRate); // want ~5–7%
  const dens = cleanValue(row.density_sqmi);
  const units = cleanValue(row.total_units ?? row.totalHousingUnits);
  const listings = Number(row._totalListings || 0);
  const listingsPerK = (units && listings) ? (listings / units) * 1000 : null;

  // FMR alignment
  const fmr2 = cleanValue(row.fmr_2br);
  const live2 = Number(row._avgLive2br || NaN);
  const fmrGap = (fmr2 && live2) ? (live2 - fmr2) / fmr2 : null; // <=0 is better (undervalued vs FMR)

  // Tenure mix
  const pctR = cleanValue(row.pct_renter); // want 45–65%

  // Normalize
  const sPop  = norm01(popG, ranges.popGrowth[0], ranges.popGrowth[1]);
  const sJob  = norm01(emp,   ranges.employmentRate[0], ranges.employmentRate[1]);
  const sInc  = norm01(inc,   ranges.income[0], ranges.income[1]);
  const sHvg  = norm01(hvg,   ranges.homeValueGrowth[0], ranges.homeValueGrowth[1]);

  const sBurden = bandScore(rentBurden, 0.25, 0.33, 0.15, 0.45);
  const sVac    = bandScore(vac, 0.05, 0.07, 0.02, 0.12);
  const sDense  = bandScore(dens, 1000, 6000, 200, 15000); // flexible, tweak
  const sList   = (listingsPerK == null) ? 0.5 : bandScore(listingsPerK, 2, 6, 0, 12); // mid supply best
  const sFmr    = (fmrGap == null) ? 0.5 : bandScore(fmrGap, -0.08, 0.02, -0.20, 0.12); // undervalued or near parity
  const sTenure = (pctR == null) ? 0.5 : bandScore(pctR, 45, 65, 25, 80);

  // Landlord-friendly (0..1)
  let lf = row.landlord_friendly_score != null ? Number(row.landlord_friendly_score) : null;
  if (lf != null) lf = lf > 1 ? lf / 100 : lf;
  const sLF = lf == null ? 0.5 : Math.max(0, Math.min(1, lf));

  // Optional crime (plug a real 0..1 input when you have it)
  const sCrime = 0.5;

  const W = {
    pop: 0.16, job: 0.14, inc: 0.10, hvg: 0.10,     // growth/level
    burden: 0.12, vac: 0.10, fmr: 0.08,             // demand/affordability
    density: 0.06, listings: 0.06, tenure: 0.04,    // structure/supply
    ll: 0.02, safety: 0.02
  };

  let raw =
    W.pop*sPop + W.job*sJob + W.inc*sInc + W.hvg*sHvg +
    W.burden*sBurden + W.vac*sVac + W.fmr*sFmr +
    W.density*sDense + W.listings*sList + W.tenure*sTenure +
    W.ll*sLF + W.safety*(1 - sCrime);

  return Math.round(Math.max(0, Math.min(1, raw)) * 100);
}

/* ---------------- charts ---------------- */
const BarChart = ({ data, dataKey, title, color = '#06b6d4', width = 700, height = 320, slim = true }) => {
  const entries = Object.entries(data.liveRentStats || {}).filter(([, v]) => (v[dataKey] || 0) > 0);
  if (entries.length === 0) return (
    <div style={{ color:'#9ca3af', background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24 }}>
      No rent data available
    </div>
  );
  const maxValue = Math.max(...entries.map(([, v]) => v[dataKey]));
  const gap = slim ? 10 : 20;
  const pad = 50;
  const barsArea = Math.max(0, width - pad * 2);
  const barWidth = Math.max(6, Math.min(36, (barsArea / entries.length) - gap)); // slim bars

  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24, boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize:'1.25rem', fontWeight:600, color:'#333', marginBottom:24, display:'flex', alignItems:'center', gap:8 }}>
        <BarChart3 size={20} style={{ color:'#06b6d4' }} /> {title}
      </h3>
      <div style={{ overflowX:'auto' }}>
        <svg width={width} height={height + 60} style={{ minWidth:'100%' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <g key={ratio}>
              <line x1={pad} y1={height * (1 - ratio)} x2={width - pad} y2={height * (1 - ratio)} stroke="#e5e7eb" strokeWidth={1} />
              <text x={pad - 10} y={height * (1 - ratio) + 5} fill="#64748b" fontSize="12" textAnchor="end">
                {formatCurrency(maxValue * ratio)}
              </text>
            </g>
          ))}
          {entries.map(([bed, val], i) => {
            const value = val[dataKey] || 0;
            const barHeight = maxValue > 0 ? (value / maxValue) * height : 0;
            const x = pad + i * (barWidth + gap);
            return (
              <g key={i}>
                <defs>
                  <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.65 }} />
                  </linearGradient>
                </defs>
                <rect x={x} y={height - barHeight} width={barWidth} height={barHeight} fill={`url(#gradient-${i})`} rx="6"
                      style={{ filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.08))' }} />
                <text x={x + barWidth / 2} y={height + 20} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="600">
                  {String(bed).toLowerCase() === '0' || String(bed).toLowerCase() === 'studio' ? 'Studio' : `${bed} BD`}
                </text>
                <text x={x + barWidth / 2} y={height - barHeight - 8} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="700">
                  {formatCurrency(value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const DonutChart = ({ data, title, width = 360, height = 360, totalListings }) => {
  const entries = Object.entries(data.liveRentStats || {}).filter(([, v]) => v.count > 0);
  if (entries.length === 0) return (
    <div style={{ color:'#9ca3af', background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24 }}>
      No rent data available
    </div>
  );

  const total = entries.reduce((sum, [, v]) => sum + v.count, 0);
  const centerX = width / 2, centerY = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 20;
  const innerRadius = outerRadius * 0.6;
  let currentAngle = -90;
  const colors = ['#06b6d4','#10b981','#f59e0b','#8b5cf6','#ef4444','#f97316','#14b8a6','#0ea5e9'];

  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24, boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize:'1.25rem', fontWeight:600, color:'#333', marginBottom:24, display:'flex', alignItems:'center', gap:8 }}>
        <Building size={20} style={{ color:'#06b6d4' }} /> {title}
      </h3>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width={width} height={height}>
          <defs>
            {colors.map((c, i) => (
              <linearGradient key={i} id={`donut-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: c, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: c, stopOpacity: 0.7 }} />
              </linearGradient>
            ))}
          </defs>
          {entries.map(([bed, val], i) => {
            const pct = val.count / total;
            const angle = pct * 360;
            const start = currentAngle * Math.PI / 180;
            const end = (currentAngle + angle) * Math.PI / 180;
            const x1 = centerX + outerRadius * Math.cos(start);
            const y1 = centerY + outerRadius * Math.sin(start);
            const x2 = centerX + outerRadius * Math.cos(end);
            const y2 = centerY + outerRadius * Math.sin(end);
            const x3 = centerX + innerRadius * Math.cos(end);
            const y3 = centerY + innerRadius * Math.sin(end);
            const x4 = centerX + innerRadius * Math.cos(start);
            const y4 = centerY + innerRadius * Math.sin(start);
            const large = angle > 180 ? 1 : 0;
            const path = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${x4} ${y4} Z`;
            currentAngle += angle;
            return <path key={i} d={path} fill={`url(#donut-${i})`} style={{ filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.08))' }} />;
          })}
          <text x={centerX} y={centerY - 5} textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">
            {totalListings}
          </text>
          <text x={centerX} y={centerY + 15} textAnchor="middle" fill="#64748b" fontSize="13">
            Total Listings
          </text>
        </svg>
      </div>
    </div>
  );
};

const LineChart = ({ points, title, width = 700, height = 280 }) => {
  const valid = points.filter(p => p.y != null && !isNaN(p.y));
  if (valid.length < 2) {
    return <div style={{ color:'#9ca3af', background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24 }}>Not enough population history to plot</div>;
  }
  const pad = { left: 60, right: 24, top: 20, bottom: 34 };
  const ys = valid.map(p => Number(p.y));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scaleX = (i) => pad.left + (i / (valid.length - 1)) * (width - pad.left - pad.right);
  const scaleY = (y) => pad.top + (1 - (y - minY) / Math.max(1, (maxY - minY))) * (height - pad.top - pad.bottom);
  const d = valid.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(p.y)}`).join(' ');
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24, boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize:'1.25rem', fontWeight:600, color:'#333', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <TrendingUp size={20} style={{ color:'#06b6d4' }} /> {title}
      </h3>
      <svg width={width} height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
          const y = pad.top + r * (height - pad.top - pad.bottom);
          return (
            <g key={idx}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={pad.left - 10} y={y + 4} fontSize="12" fill="#64748b" textAnchor="end">
                {fmt(minY + (1 - r) * (maxY - minY))}
              </text>
            </g>
          );
        })}
        {valid.map((p, i) => (
          <text key={i} x={scaleX(i)} y={height - 10} fontSize="12" fill="#64748b" textAnchor="middle">{p.xLabel}</text>
        ))}
        <path d={d} fill="none" stroke="#06b6d4" strokeWidth="3" />
        {valid.map((p, i) => (
          <g key={i}>
            <circle cx={scaleX(i)} cy={scaleY(p.y)} r="4" fill="#06b6d4" />
            <text x={scaleX(i)} y={scaleY(p.y) - 8} textAnchor="middle" fontSize="12" fill="#334155" fontWeight="700">
              {fmt(p.y)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const FMRChart = ({ fmrs, title, width = 700, height = 280 }) => {
  const keys = ['fmr_0br','fmr_1br','fmr_2br','fmr_3br','fmr_4br'];
  const labels = ['Studio','1 BR','2 BR','3 BR','4 BR'];
  const vals = keys.map(k => cleanValue(fmrs?.[k]));
  const pairs = labels.map((lab, i) => ({ lab, val: vals[i] })).filter(p => p.val != null && !isNaN(p.val));
  if (!pairs.length) {
    return <div style={{ color:'#9ca3af', background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24 }}>No FMR data available</div>;
  }
  const pad = 50; const gap = 16;
  const maxValue = Math.max(...pairs.map(p => p.val));
  const barWidth = Math.max(22, Math.min(40, (width - pad*2 - gap*(pairs.length-1)) / pairs.length));
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24, boxShadow:'0 2px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize:'1.25rem', fontWeight:600, color:'#333', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <BarChart3 size={20} style={{ color:'#06b6d4' }} /> {title}
      </h3>
      <svg width={width} height={height + 40}>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line x1={pad} y1={height * (1 - ratio)} x2={width - pad} y2={height * (1 - ratio)} stroke="#e5e7eb" strokeWidth={1} />
            <text x={pad - 10} y={height * (1 - ratio) + 5} fill="#64748b" fontSize="12" textAnchor="end">
              {formatCurrency(maxValue * ratio)}
            </text>
          </g>
        ))}
        {pairs.map((p, i) => {
          const h = (p.val / maxValue) * height;
          const x = pad + i * (barWidth + gap);
          return (
            <g key={i}>
              <rect x={x} y={height - h} width={barWidth} height={h} fill="#06b6d4" rx="6" />
              <text x={x + barWidth / 2} y={height + 18} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="600">{p.lab}</text>
              <text x={x + barWidth / 2} y={height - h - 8} textAnchor="middle" fill="#334155" fontSize="12" fontWeight="700">
                {formatCurrency(p.val)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ---------------- constants ---------------- */
const STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
  'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
  'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'
];

// master + fallbacks (you kept these in /public)
const MASTER_CSV = '/zip_city_units_rent_percent_pop_2017_23.csv';
const FMR_CSV = '/fmr_by_zip_clean.csv';
const LANDLORD_CSV = '/landlord_friendly_scores.csv';
const DP03_CSV = '/ZIPACSDP5Y2023.DP03-Data.csv';
const DP04_CSV = '/ZIPACSDP5Y2023.DP04-Data.csv';
const DENSITY_CSV = '/zcta_density.csv';
const RENTER_OWNER_CSV = '/zip_renter_owner_stats_with_counts.csv';
const ZHVI_CSV = '/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv';
const ZHVF_GROWTH_CSV = '/Zip_zhvf_growth_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv';

/* ---------------- main page ---------------- */
const MarketAnalysisPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({ location: '' });
  const [zipData, setZipData] = useState({});
  const [uniqueZips, setUniqueZips] = useState([]);
  const [cityIndex, setCityIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [results, setResults] = useState({});
  const [ranges, setRanges] = useState(null);

  const [chartsRef, chartsWidth] = useContainerWidth(620);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setError('');

        // Load everything in parallel
        const [
          masterRows, landlordRows, fmrRows,
          dp03, dp04, density, renterOwner,
          zhviRows, zhvfGrowthRows
        ] = await Promise.all([
          loadCSV(MASTER_CSV),
          loadCSV(LANDLORD_CSV).catch(() => []),
          loadCSV(FMR_CSV).catch(() => []),
          loadCSV(DP03_CSV),
          loadCSV(DP04_CSV),
          loadCSV(DENSITY_CSV),
          loadCSV(RENTER_OWNER_CSV),
          loadCSV(ZHVI_CSV).catch(() => []),
          loadCSV(ZHVF_GROWTH_CSV).catch(() => [])
        ]);

        // Debug: Log column names to understand the CSV structure
        if (zhviRows && zhviRows.length > 0) {
          console.log('ZHVI CSV columns:', Object.keys(zhviRows[0]));
        }
        if (zhvfGrowthRows && zhvfGrowthRows.length > 0) {
          console.log('ZHVF CSV columns:', Object.keys(zhvfGrowthRows[0]));
        }

        // Fixed ZHVI (home values) data processing
        const zhviByZip = {};
        for (const r of zhviRows || []) {
          const zip = zeroZip(r.RegionName);
          if (!zip) continue;
          
          // Get latest available month value - using correct column names
          const latestValue = r['06-30-25'] || r['05-31-25'] || r['04-30-25'] || r['03-31-25'] || r['02-28-25'] || r['01-31-25'];
          
          if (latestValue != null) {
            zhviByZip[zip] = {
              currentValue: cleanValue(latestValue),
              city: r.City,
              metro: r.Metro,
              state: r.State
            };
          }
        }

        // Fixed ZHVF growth forecast data  
        const zhvfByZip = {};
        for (const r of zhvfGrowthRows || []) {
          const zip = zeroZip(r.RegionName);
          if (!zip) continue;
          
          zhvfByZip[zip] = {
            forecast_3m: cleanValue(r['2025-09-30']),    // 3 months out
            forecast_1y: cleanValue(r['2025-07-31']),    // ~1 year out  
            forecast_12m: cleanValue(r['2026-06-30'])    // 12+ months out
          };
        }

        // landlord map
        const landlordByState = {};
        for (const r of landlordRows || []) {
          const s = (r.State || r.state || r.state_usps || '').toString().trim();
          if (!s) continue;
          
          // Calculate composite score from individual components if available
          let totalScore = 0;
          let componentCount = 0;
          
          if (r.RentalPropertiesScore != null) { totalScore += Number(r.RentalPropertiesScore); componentCount++; }
          if (r.RentAsIncomeScore != null) { totalScore += Number(r.RentAsIncomeScore); componentCount++; }
          if (r.EvictionScore != null) { totalScore += Number(r.EvictionScore); componentCount++; }
          if (r.DepositAmountScore != null) { totalScore += Number(r.DepositAmountScore); componentCount++; }
          if (r.DepositReturnScore != null) { totalScore += Number(r.DepositReturnScore); componentCount++; }
          if (r.RepairPolicyScore != null) { totalScore += Number(r.RepairPolicyScore); componentCount++; }
          if (r.TerminationNoticeScore != null) { totalScore += Number(r.TerminationNoticeScore); componentCount++; }
          if (r.RentControlScore != null) { totalScore += Number(r.RentControlScore); componentCount++; }
          
          const avgScore = componentCount > 0 ? totalScore / componentCount : null;
          const category = avgScore >= 3.5 ? 'Very Landlord Friendly' : 
                          avgScore >= 2.5 ? 'Landlord Friendly' :
                          avgScore >= 1.5 ? 'Neutral' : 
                          avgScore > 0 ? 'Tenant Friendly' : null;
          
          landlordByState[s.toUpperCase()] = { 
            score: avgScore,
            note: category,
            evictionScore: r.EvictionScore,
            rentControlScore: r.RentControlScore
          };
        }

        // FMR by zip
        const fmrByZip = {};
        for (const r of fmrRows || []) {
          const z = zeroZip(r.zip);
          if (!z) continue;
          fmrByZip[z] = {
            fmr_0br: cleanValue(r.fmr_0br),
            fmr_1br: cleanValue(r.fmr_1br),
            fmr_2br: cleanValue(r.fmr_2br),
            fmr_3br: cleanValue(r.fmr_3br),
            fmr_4br: cleanValue(r.fmr_4br),
            hud_area_name: r.hud_area_name || null,
            county_fips: r.county_fips || null,
            county_name: r.county_name || null,
          };
        }

        // DP03/DP04/density/renter-owner indexes (fallbacks)
        const dp03ByZip = {};
        for (const r of dp03) {
          const zip = zeroZip(r.NAME ? r.NAME.split(' ')[1] : r.RegionName);
          if (!zip) continue;
          dp03ByZip[zip] = {
            medianHouseholdIncome: cleanValue(r.DP03_0062E),
            employmentRate: cleanValue(r.DP03_0002PE)
          };
        }
        const dp04ByZip = {};
        for (const r of dp04) {
          const zip = zeroZip(r.NAME ? r.NAME.split(' ')[1] : r.RegionName);
          if (!zip) continue;
          dp04ByZip[zip] = {
            medianGrossRent: cleanValue(r.DP04_0134E),
            totalHousingUnits: cleanValue(r.DP04_0001E),
            vacantUnits: cleanValue(r.DP04_0003E),
            occupiedUnits: cleanValue(r.DP04_0002E),
            vacancyRate: cleanValue(r.DP04_0003PE)
          };
        }
        const densityByZip = {};
        for (const r of density) {
          const zip = zeroZip(r.ZCTA);
          if (!zip) continue;
          const land = cleanValue(r.land_sqmi);
          const pop = cleanValue(r.population);
          let dens = cleanValue(r.density_sqmi);
          if (dens == null && land > 0 && pop > 0) dens = pop / land;
          densityByZip[zip] = { land_sqmi: land, population: pop, density_sqmi: dens };
        }
        const roByZip = {};
        for (const r of renterOwner) {
          const zip = zeroZip(r.zip);
          if (!zip) continue;
          roByZip[zip] = {
            total_units: cleanValue(r.total_units),
            owner_units: cleanValue(r.owner_units),
            renter_units: cleanValue(r.renter_units),
            pct_owner: cleanValue(r.pct_owner),
            pct_renter: cleanValue(r.pct_renter)
          };
        }

        // Merge master with fallbacks
        const zips = {};
        const cityIdx = {};
        for (const r of masterRows) {
          const zip = zeroZip(r.zip); if (!zip) continue;
          const city = (r.city || '').toString().trim().toUpperCase();
          const state = (r.state || '').toString().trim().toUpperCase();
          const cityKey = `${city}, ${state}`;

          const mhi = cleanValue(r.medianHouseholdIncome) ?? dp03ByZip[zip]?.medianHouseholdIncome ?? null;
          const emp = cleanValue(r.employmentRate) ?? dp03ByZip[zip]?.employmentRate ?? null;
          const mgr = cleanValue(r.medianGrossRent) ?? dp04ByZip[zip]?.medianGrossRent ?? null;

          const th = cleanValue(r.totalHousingUnits) ?? dp04ByZip[zip]?.totalHousingUnits ?? null;
          const vu = cleanValue(r.vacantUnits) ?? dp04ByZip[zip]?.vacantUnits ?? null;
          const oc = cleanValue(r.occupiedUnits) ?? dp04ByZip[zip]?.occupiedUnits ?? null;
          const vr = cleanValue(r.vacancyRate) ?? dp04ByZip[zip]?.vacancyRate ?? null;

          const ro = roByZip[zip] || {};
          const dens = densityByZip[zip] || {};

          const population_2017 = cleanValue(r.population_2017);
          const population_2023 = cleanValue(r.population_2023 ?? r.population ?? dens.population ?? null);
          const population_change_pct_17_23 = (population_2017 && population_2023)
            ? ((population_2023 - population_2017) / population_2017) * 100 : null;

          const rent_to_income = (mhi && mgr) ? (mgr * 12) / mhi : null;
          const ls = landlordByState[state] || null;

          zips[zip] = {
            zip, city, state,
            medianHouseholdIncome: mhi,
            employmentRate: emp,
            medianGrossRent: mgr,
            totalHousingUnits: th,
            vacantUnits: vu,
            occupiedUnits: oc,
            vacancyRate: vr,
            total_units: ro.total_units ?? cleanValue(r.total_units),
            owner_units: ro.owner_units ?? cleanValue(r.owner_units),
            renter_units: ro.renter_units ?? cleanValue(r.renter_units),
            pct_owner: ro.pct_owner ?? cleanValue(r.pct_owner),
            pct_renter: ro.pct_renter ?? cleanValue(r.pct_renter),
            population: population_2023 ?? null,
            population_2017,
            population_2023,
            population_change_pct_17_23,
            density_sqmi: cleanValue(r.density_sqmi) ?? dens.density_sqmi ?? null,
            landlord_friendly_score: ls?.score ?? null,
            landlord_friendly_note: ls?.note ?? null,
            eviction_score: ls?.evictionScore ?? null,
            rent_control_score: ls?.rentControlScore ?? null,
            ...(fmrByZip[zip] || {}),
            zhvi: cleanValue(r.zhvi) ?? zhviByZip[zip]?.currentValue ?? null,
            zhvf_1y: cleanValue(r.zhvf_1y) ?? zhvfByZip[zip]?.forecast_1y ?? null,
            zhvi_5y_growth_pct: cleanValue(r.zhvi_5y_growth_pct),
            zhvi_1y_growth_pct: cleanValue(r.zhvi_1y_growth_pct),
            zhvf_forecast_3m: zhvfByZip[zip]?.forecast_3m ?? null,
            zhvf_forecast_12m: zhvfByZip[zip]?.forecast_12m ?? null,
            rent_to_income,
          };

          if (!cityIdx[cityKey]) cityIdx[cityKey] = [];
          cityIdx[cityKey].push(zip);
        }

        if (cancelled) return;
        setZipData(zips);
        setUniqueZips(Object.keys(zips).sort());
        setCityIndex(cityIdx);
        setRanges(computeRangesAll(Object.values(zips))); // Using improved ranges function

        // Debug: Check if ZHVI data is properly loaded
        console.log('Sample ZIP data with ZHVI:', Object.values(zips).slice(0, 5));

        // state rental CSVs (best-effort) for live listings
        let allRentData = [];
        for (const stateName of STATES) {
          let csvText = null;
          let fileName = `${stateName}_Rental_Data - ${stateName}_Rental_Data.csv`;
          try {
            const response = await fetch(`/states/${fileName}`);
            if (response.ok) csvText = await response.text();
          } catch {}
          if (!csvText) {
            fileName = `${stateName}_Rental_Data.csv`;
            try {
              const response = await fetch(`/states/${fileName}`);
              if (response.ok) csvText = await response.text();
            } catch {}
          }
          if (csvText) {
            const parsed = Papa.parse(csvText, { header:true, skipEmptyLines:true });
            if (parsed.data?.length) allRentData = allRentData.concat(parsed.data.map(row => ({ ...row, state: stateName })));
          }
        }
        if (cancelled) return;
        setMarketData(allRentData);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading data:', err);
        setError('Failed to load market data. Please try again.');
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');

    const loc = (formData.location || '').trim().toLowerCase();
    if (!loc) { setError('Please enter a ZIP code or city'); return; }

    const zipMatch = uniqueZips.find(z => z.toLowerCase() === loc || z.toLowerCase().startsWith(loc));
    const resolvedZip = zipMatch || null;

    // Try city key "CITY, ST" or just city
    let cityKey = null;
    if (!resolvedZip) {
      const keys = Object.keys(cityIndex);
      const exactCity = keys.find(k => k.toLowerCase() === loc);
      if (exactCity) cityKey = exactCity;
      else {
        const byCity = keys.find(k => k.split(',')[0].trim().toLowerCase() === loc);
        if (byCity) cityKey = byCity;
      }
    }
    if (!resolvedZip && !cityKey) { setError('No matching ZIP or City found in dataset.'); return; }

    // LIVE RENT slice
    const rentData = marketData.filter(row => {
      const rowZip = zeroZip(row.zipCode);
      const rowCity = (row.city || '').toString().trim().toLowerCase();
      if (resolvedZip) return rowZip === resolvedZip;
      if (!cityKey) return false;
      const cityOnly = cityKey.split(',')[0].trim().toLowerCase();
      return rowCity === cityOnly;
    });
    const rentStats = rentData.reduce((acc, row) => {
      const bed = row.bed ? `${row.bed}` : 'Studio';
      if (!acc[bed]) acc[bed] = { rents: [], sqfts: [], rentPerSf: [], count: 0 };
      const r = cleanValue(row.rent); const s = cleanValue(row.sqft); const rpsf = cleanValue(row.rentPerSf);
      if (r != null) acc[bed].rents.push(r);
      if (s != null) acc[bed].sqfts.push(s);
      if (rpsf != null) acc[bed].rentPerSf.push(rpsf);
      acc[bed].count++;
      return acc;
    }, {});
    const rentAverages = Object.keys(rentStats).reduce((acc, bed) => {
      const d = rentStats[bed];
      acc[bed] = {
        avgRent: d.rents.length ? d.rents.reduce((a,b)=>a+b,0)/d.rents.length : 0,
        avgSqft: d.sqfts.length ? d.sqfts.reduce((a,b)=>a+b,0)/d.sqfts.length : 0,
        avgRentPerSf: d.rentPerSf.length ? d.rentPerSf.reduce((a,b)=>a+b,0)/d.rentPerSf.length : 0,
        count: d.count
      };
      return acc;
    }, {});
    setTotalListings(rentData.length);

    // Build result object
    let base = {};
    if (resolvedZip) {
      base = zipData[resolvedZip] || {};
    } else if (cityKey) {
      const zipsInCity = cityIndex[cityKey] || [];
      const agg = (field, sum = true) => {
        const vals = zipsInCity.map(z => cleanValue(zipData[z]?.[field])).filter(v => v != null);
        if (!vals.length) return null;
        return sum ? vals.reduce((a,b)=>a+b,0) : (vals.reduce((a,b)=>a+b,0) / vals.length);
      };
      const pop17 = agg('population_2017');
      const pop23 = agg('population_2023') ?? agg('population');
      const popChange = (pop17 && pop23) ? ((pop23 - pop17) / pop17) * 100 : null;

      base = {
        city: cityKey.split(',')[0],
        state: cityKey.split(',')[1].trim(),
        population_2017: pop17,
        population_2023: pop23,
        population: pop23,
        population_change_pct_17_23: popChange,
        medianHouseholdIncome: agg('medianHouseholdIncome', false),
        employmentRate: agg('employmentRate', false),
        medianGrossRent: agg('medianGrossRent', false),
        totalHousingUnits: agg('totalHousingUnits'),
        vacantUnits: agg('vacantUnits'),
        occupiedUnits: agg('occupiedUnits'),
        vacancyRate: agg('vacancyRate', false),
        total_units: agg('total_units'),
        owner_units: agg('owner_units'),
        renter_units: agg('renter_units'),
        pct_owner: agg('pct_owner', false),
        pct_renter: agg('pct_renter', false),
        density_sqmi: agg('density_sqmi', false),
        landlord_friendly_score: agg('landlord_friendly_score', false),
        landlord_friendly_note: zipData[zipsInCity[0]]?.landlord_friendly_note || null,
        fmr_0br: agg('fmr_0br', false),
        fmr_1br: agg('fmr_1br', false),
        fmr_2br: agg('fmr_2br', false),
        fmr_3br: agg('fmr_3br', false),
        fmr_4br: agg('fmr_4br', false),
        zhvi: agg('zhvi', false),
        zhvi_5y_growth_pct: agg('zhvi_5y_growth_pct', false),
        zhvi_1y_growth_pct: agg('zhvi_1y_growth_pct', false),
        zhvf_1y: agg('zhvf_1y', false),
        zhvf_forecast_3m: agg('zhvf_forecast_3m', false),
        zhvf_forecast_12m: agg('zhvf_forecast_12m', false),
      };
    }

    // Stash needed fields for improved scoring
    base._totalListings = totalListings;
    base._avgLive2br = rentAverages['2']?.avgRent || rentAverages['2 BD']?.avgRent || null;

    const marketScore = ranges ? scoreMarket(base, ranges) : null;
    
    // Debug: Check if we have the data needed for investment analysis
    console.log('Investment Analysis Input Data:', {
      pct_renter: base.pct_renter,
      vacancyRate: base.vacancyRate,
      population_change: base.population_change_pct_17_23,
      landlord_score: base.landlord_friendly_score,
      zhvi_data: base.zhvi,
      zhvf_forecast: base.zhvf_forecast_12m
    });
    
    const investmentAnalysis = calculateInvestmentScore(base);
    console.log('Investment Analysis Result:', investmentAnalysis);
    
    setResults({ ...base, liveRentStats: rentAverages, neil_market_score: marketScore, investmentAnalysis });
  };

  const ai = (results && Object.keys(results).length)
    ? (() => {
        const score = results.neil_market_score != null ? results.neil_market_score : 0;
        let verdict = 'Weak';
        if (score >= 75) verdict = 'Strong';
        else if (score >= 60) verdict = 'Solid';
        else if (score >= 45) verdict = 'Mixed';
        const notes = [];
        const popChg = cleanValue(results.population_change_pct_17_23);
        if (popChg != null) notes.push(`Population ${popChg >= 0 ? 'up' : 'down'} ${formatPercent(popChg, 1)} since 2017`);
        return { score, verdict, notes };
      })()
    : null;

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:64, height:64, border:'2px solid #e2e8f0', borderTop:'2px solid #06b6d4', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
          <h2 style={{ color:'#333', fontSize:'1.25rem', fontWeight:600 }}>Loading Market Data...</h2>
          <div style={{ color:'#666', marginTop:8 }}>Analyzing market data for your location</div>
        </div>
      </div>
    );
  }

  return (
    <div id="market-analysis-content" style={{ minHeight:'100vh', background:'#ffffff', color:'#333', padding:40 }}>
      <div style={{ maxWidth:1400, margin:'0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={() => (setCurrentPage ? setCurrentPage('home') : window.history.back())}
              style={{
                background:'none', border:'1px solid #e5e7eb', color:'#06b6d4', display:'flex',
                alignItems:'center', gap:8, cursor:'pointer',
                fontSize:16, fontWeight:500, padding:'8px 12px', borderRadius:8, transition:'all .2s'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f0f4f8'; e.target.style.color = '#0891b2'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#06b6d4'; }}
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
            
            {/* Export to PDF Button */}
            {Object.keys(results).length > 0 && (
              <button
                onClick={exportToPDF}
                style={{
                  background:'linear-gradient(135deg,#10b981,#06b6d4)', 
                  color:'white', 
                  display:'flex',
                  alignItems:'center', 
                  gap:8, 
                  cursor:'pointer',
                  fontSize:16, 
                  fontWeight:600, 
                  padding:'10px 20px', 
                  borderRadius:8, 
                  border:'none',
                  boxShadow:'0 2px 4px rgba(0,0,0,.1)',
                  transition:'all .2s'
                }}
                onMouseEnter={(e) => { 
                  e.target.style.transform = 'translateY(-2px)'; 
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,.15)'; 
                }}
                onMouseLeave={(e) => { 
                  e.target.style.transform = 'translateY(0)'; 
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,.1)'; 
                }}
              >
                <Download size={20} /> Export as PDF
              </button>
            )}
          </div>

          <div style={{ textAlign:'center' }}>
            <h1 style={{ fontSize:'3rem', fontWeight:'bold', marginBottom:16, color:'#333' }}>Market Analysis</h1>
            <p style={{ color:'#666', fontSize:'1.125rem', maxWidth:600, margin:'0 auto' }}>
              Enter a ZIP code or city to analyze the market.
            </p>
          </div>
        </div>

        {/* search */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:32, marginBottom:32, boxShadow:'0 2px 4px rgba(0,0,0,.06)' }}>
          <div style={{ maxWidth:800, margin:'0 auto' }}>
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <div style={{ position:'relative', flex:1 }}>
                <MapPin size={20} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#666' }} />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="Enter ZIP code or city (e.g., 92054, Oceanside)"
                  style={{
                    width:'100%', paddingLeft:48, paddingRight:16, paddingTop:16, paddingBottom:16,
                    background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, color:'#333', fontSize:16, outline:'none'
                  }}
                />
              </div>
              <button onClick={handleSubmit} style={{
                padding:'16px 32px', background:'linear-gradient(135deg,#06b6d4,#3b82f6)', color:'#fff',
                border:'none', borderRadius:12, cursor:'pointer', fontSize:16, fontWeight:600,
                display:'flex', alignItems:'center', gap:8, boxShadow:'0 2px 4px rgba(0,0,0,.1)'
              }}>
                <Search size={20} /> Analyze Market
              </button>
            </div>
            {error && (
              <div style={{ marginTop:16, padding:16, background:'#fee2e2', border:'1px solid #fecaca', borderRadius:8, color:'#dc2626' }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'minmax(320px,420px) 1fr', gap:24 }}>
            {/* LEFT COLUMN */}
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {/* Location Data Attribute for PDF filename */}
              <div data-location={results.zip || results.city || 'market'} style={{ display: 'none' }}></div>
              
              {/* Total Units */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24, boxShadow:'0 2px 4px rgba(0,0,0,.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                  <Home style={{ color:'#10b981' }} size={24} />
                  <h3 style={{ fontSize:'1.25rem', fontWeight:600, color:'#333' }}>Total Units</h3>
                </div>
                <div style={{ fontSize:'2.4rem', fontWeight:800, color:'#10b981' }}>
                  {fmt(results.total_units ?? results.occupiedUnits ?? results.totalHousingUnits)}
                </div>
                <div style={{ color:'#64748b', marginTop:4 }}>From renter/owner dataset (fallback to occupied/ACS if missing)</div>
              </div>

              {/* Detailed Breakdown */}
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24, boxShadow:'0 2px 4px rgba(0,0,0,.06)' }}>
                <h3 style={{ fontSize:'1.5rem', fontWeight:600, color:'#333', marginBottom:16 }}>Detailed Breakdown</h3>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding:12, textAlign:'left', borderBottom:'1px solid #e5e7eb', color:'#64748b' }}>Metric</th>
                        <th style={{ padding:12, textAlign:'right', borderBottom:'1px solid #e5e7eb', color:'#64748b' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Location', results.zip || (results.city ? `${results.city}, ${results.state}` : '—')],
                        ['Population', fmt(results.population)],
                        ['Population (prev)', fmt(results.population_2017)],
                        ['Pop. Change', results.population_change_pct_17_23 != null ? formatPercent(results.population_change_pct_17_23) : 'N/A'],
                        ['Density', results.density_sqmi ? `${Number(results.density_sqmi).toFixed(1)}/sq mi` : 'N/A'],
                        ['Household Income', formatCurrency(results.medianHouseholdIncome)],
                        ['Employment Rate', formatPercent(results.employmentRate)],
                        ['Median Rent (ACS)', formatCurrency(results.medianGrossRent)],
                        ['Total Housing Units', fmt(results.totalHousingUnits)],
                        ['Vacant Units', fmt(results.vacantUnits)],
                        ['Occupied Units', fmt(results.occupiedUnits)],
                        ['Vacancy Rate', formatPercent(results.vacancyRate)],
                        ['Total Units', fmt(results.total_units)],
                        ['Owner Units', fmt(results.owner_units)],
                        ['Renter Units', fmt(results.renter_units)],
                        ['Owner %', formatPercent(results.pct_owner)],
                        ['Renter %', formatPercent(results.pct_renter)],
                        ['Home Value (ZHVI)', results.zhvi != null ? formatCurrency(results.zhvi) : 'N/A'],
                        ['5yr Value Growth', results.zhvi_5y_growth_pct != null ? formatPercent(results.zhvi_5y_growth_pct) : 'N/A'],
                        ['1yr Value Growth', results.zhvi_1y_growth_pct != null ? formatPercent(results.zhvi_1y_growth_pct) : 'N/A'],
                        ['1yr Forecast', results.zhvf_1y != null ? formatPercent(results.zhvf_1y) : 'N/A'],
                        ['3m Forecast', results.zhvf_forecast_3m != null ? formatPercent(results.zhvf_forecast_3m) : 'N/A'],
                        ['12m Forecast', results.zhvf_forecast_12m != null ? formatPercent(results.zhvf_forecast_12m) : 'N/A'],
                        ['FMR 2BR', results.fmr_2br != null ? formatCurrency(results.fmr_2br) : 'N/A'],
                        ['Landlord-Friendly', results.landlord_friendly_score != null
                          ? `${(Number(results.landlord_friendly_score) > 1 ? Number(results.landlord_friendly_score).toFixed(1) : (Number(results.landlord_friendly_score)*5).toFixed(1))}/5${results.landlord_friendly_note ? ` (${results.landlord_friendly_note})` : ''}`
                          : 'N/A'],
                      ].map(([k, v]) => (
                        <tr key={k}>
                          <td style={{ padding:12, borderBottom:'1px solid #e5e7eb', color:'#0f172a' }}>{k}</td>
                          <td style={{ padding:12, textAlign:'right', borderBottom:'1px solid #e5e7eb', color:'#0f172a' }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Market Score (short) */}
              {ai && (
                <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:20, padding:24, boxShadow:'0 2px 4px rgba(0,0,0,.06)' }}>
                  <h3 style={{ fontSize:'1.5rem', fontWeight:800, color:'#0f172a', marginBottom:8 }}>
                    AI Market Score: {ai.score}/100 <span style={{ fontSize:'1rem', color:'#64748b', fontWeight:600 }}>({ai.verdict})</span>
                  </h3>
                  <div style={{ height:10, background:'#e5e7eb', borderRadius:999, overflow:'hidden', margin:'12px 0 8px' }}>
                    <div style={{
                      width: `${ai.score}%`,
                      height: '100%',
                      background: ai.score >= 75 ? '#10b981' : ai.score >= 60 ? '#06b6d4' : ai.score >= 45 ? '#f59e0b' : '#ef4444'
                    }} />
                  </div>
                  <ul style={{ margin:0, paddingLeft:18, color:'#334155', lineHeight:1.5 }}>
                    {ai.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </div>
              )}

              {/* Investment Analysis - Simplified and Always Shows */}
              <div style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                borderRadius: 20, 
                padding: 24, 
                boxShadow: '0 4px 6px rgba(0,0,0,.1)',
                color: '#fff'
              }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 16 }}>
                  Multifamily Investment Analysis
                </h3>
                
                {(() => {
                  // Calculate investment score inline
                  const renterPct = cleanValue(results.pct_renter) || 0;
                  const vacancy = cleanValue(results.vacancyRate) || 0;
                  const popGrowth = cleanValue(results.population_change_pct_17_23) || 0;
                  const employment = cleanValue(results.employmentRate) || 0;
                  const income = cleanValue(results.medianHouseholdIncome) || 0;
                  
                  let score = 0;
                  let factors = [];
                  
                  // Renter percentage (most important for multifamily)
                  if (renterPct >= 40) {
                    score += 35;
                    factors.push(`Excellent renter base (${renterPct.toFixed(1)}%)`);
                  } else if (renterPct >= 30) {
                    score += 25;
                    factors.push(`Good renter base (${renterPct.toFixed(1)}%)`);
                  } else if (renterPct >= 20) {
                    score += 15;
                    factors.push(`Below average renter base (${renterPct.toFixed(1)}%)`);
                  } else {
                    score += 5;
                    factors.push(`Very low renter base (${renterPct.toFixed(1)}%)`);
                  }
                  
                  // Vacancy rate
                  if (vacancy >= 3 && vacancy <= 8) {
                    score += 20;
                    factors.push(`Healthy vacancy (${vacancy.toFixed(1)}%)`);
                  } else if (vacancy < 3) {
                    score += 10;
                    factors.push(`Very tight market (${vacancy.toFixed(1)}% vacancy)`);
                  } else {
                    score += 5;
                    factors.push(`High vacancy risk (${vacancy.toFixed(1)}%)`);
                  }
                  
                  // Population growth
                  if (popGrowth >= 10) {
                    score += 20;
                    factors.push(`Strong population growth (${popGrowth.toFixed(1)}%)`);
                  } else if (popGrowth >= 2) {
                    score += 15;
                    factors.push(`Positive growth (${popGrowth.toFixed(1)}%)`);
                  } else if (popGrowth >= 0) {
                    score += 10;
                    factors.push(`Flat growth (${popGrowth.toFixed(1)}%)`);
                  } else {
                    score += 0;
                    factors.push(`Declining population (${popGrowth.toFixed(1)}%)`);
                  }
                  
                  // Employment
                  if (employment >= 60) {
                    score += 15;
                    factors.push(`Strong employment (${employment.toFixed(1)}%)`);
                  } else if (employment >= 50) {
                    score += 10;
                  }
                  
                  // Income levels
                  if (income >= 50000 && income <= 90000) {
                    score += 10;
                    factors.push(`Good income range for rentals (${(income/1000).toFixed(0)}k)`);
                  }
                  
                  let recommendation = '';
                  let bgColor = '';
                  
                  if (score >= 75) {
                    recommendation = 'STRONG BUY';
                    bgColor = '#10b981';
                  } else if (score >= 60) {
                    recommendation = 'BUY';
                    bgColor = '#06b6d4';
                  } else if (score >= 45) {
                    recommendation = 'RESEARCH MORE';
                    bgColor = '#f59e0b';
                  } else if (score >= 30) {
                    recommendation = 'PROCEED WITH CAUTION';
                    bgColor = '#f97316';
                  } else {
                    recommendation = 'NOT RECOMMENDED';
                    bgColor = '#ef4444';
                  }
                  
                  return (
                    <>
                      <div style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 900, 
                        marginBottom: 8,
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {recommendation}
                      </div>
                      
                      <div style={{ 
                        fontSize: '1.25rem', 
                        marginBottom: 20,
                        opacity: 0.95
                      }}>
                        Investment Score: {score}/100
                      </div>
                      
                      <div style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        borderRadius: 12, 
                        padding: 16 
                      }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 12 }}>
                          Key Investment Factors:
                        </h4>
                        <div style={{ fontSize: '1rem', lineHeight: 1.8 }}>
                          {factors.map((factor, i) => (
                            <div key={i} style={{ marginBottom: 8 }}>{factor}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ 
                        marginTop: 16, 
                        padding: 12, 
                        background: 'rgba(255,255,255,0.15)', 
                        borderRadius: 8,
                        fontSize: '0.95rem'
                      }}>
                        <strong>Bottom Line:</strong> This market is{' '}
                        {renterPct < 25 ? 'heavily owner-occupied and not ideal for multifamily investment.' :
                         renterPct < 35 ? 'moderately suitable for multifamily with careful property selection.' :
                         'well-suited for multifamily investment with strong rental demand.'}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div ref={chartsRef} style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <LineChart
                title="Population Trend"
                width={chartsWidth - 16}
                points={[
                  { xLabel: '2017', y: results.population_2017 != null ? Number(results.population_2017) : null },
                  { xLabel: '2023', y: results.population != null ? Number(results.population) : null }
                ]}
              />
              <FMRChart
                title="HUD Fair Market Rents"
                width={chartsWidth - 16}
                fmrs={{
                  fmr_0br: results.fmr_0br,
                  fmr_1br: results.fmr_1br,
                  fmr_2br: results.fmr_2br,
                  fmr_3br: results.fmr_3br,
                  fmr_4br: results.fmr_4br
                }}
              />
              {results.liveRentStats && Object.keys(results.liveRentStats).length > 0 && (
                <>
                  <BarChart data={results} dataKey="avgRent" title="Average Live Rent by Bedroom" width={chartsWidth - 16} slim />
                  <DonutChart data={results} title="Bedroom Distribution" width={Math.min(chartsWidth - 16, 420)} height={Math.min(chartsWidth - 16, 420)} totalListings={totalListings} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysisPage;