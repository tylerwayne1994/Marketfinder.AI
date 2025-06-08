// popup.js - Chrome Extension Popup Script

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Buy Box Scanner popup loaded');
  
  // Load stats when popup opens
  loadStats();
  
  // Set up event listeners
  document.getElementById('view-dashboard').addEventListener('click', function() {
    // Open the main web app
    chrome.tabs.create({ 
      url: 'https://probable-guide-97x7r747w79p2p5qx-3000.app.github.dev' 
    });
  });
  
  document.getElementById('refresh-stats').addEventListener('click', function() {
    loadStats();
  });
});

async function loadStats() {
  try {
    showLoading(true);
    hideError();
    
    console.log('📊 Loading stats from API...');
    
    // Get stats from background script
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
      if (response && response.success) {
        displayStats(response.stats);
        showLoading(false);
        console.log('✅ Stats loaded successfully:', response.stats);
      } else {
        console.error('❌ Failed to load stats:', response?.error);
        showError(response?.error || 'Failed to load statistics');
        showLoading(false);
      }
    });
    
  } catch (error) {
    console.error('💥 Error loading stats:', error);
    showError(error.message);
    showLoading(false);
  }
}

function displayStats(stats) {
  try {
    // Update total properties
    const totalElement = document.getElementById('total-properties');
    totalElement.textContent = stats.totalProperties || 0;
    
    // Update today's count
    const todayElement = document.getElementById('today-count');
    todayElement.textContent = stats.todayCount || 0;
    
    // Update average cap rate
    const capRateElement = document.getElementById('avg-cap-rate');
    const avgCapRate = stats.avgCapRate || 0;
    capRateElement.textContent = avgCapRate > 0 ? `${avgCapRate}%` : '-';
    
    // Update status text based on activity
    const statusElement = document.getElementById('status-text');
    if (stats.todayCount > 0) {
      statusElement.textContent = 'Active - Scraping Properties';
    } else {
      statusElement.textContent = 'Ready - Visit LoopNet/Crexi';
    }
    
    console.log('📈 Stats displayed successfully');
    
  } catch (error) {
    console.error('❌ Error displaying stats:', error);
    showError('Error displaying statistics');
  }
}

function showLoading(show) {
  const loadingElement = document.getElementById('loading');
  const statsElement = document.querySelector('.stats');
  const buttonsElement = document.querySelector('.buttons');
  
  if (show) {
    loadingElement.style.display = 'block';
    statsElement.style.opacity = '0.5';
    buttonsElement.style.opacity = '0.5';
  } else {
    loadingElement.style.display = 'none';
    statsElement.style.opacity = '1';
    buttonsElement.style.opacity = '1';
  }
}

function showError(message) {
  const errorElement = document.getElementById('error');
  const errorMessageElement = document.getElementById('error-message');
  
  errorMessageElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide error after 5 seconds
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  const errorElement = document.getElementById('error');
  errorElement.style.display = 'none';
}