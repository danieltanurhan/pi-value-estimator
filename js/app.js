/**
 * app.js
 * Main application logic that handles UI updates, event binding,
 * and coordination between Pi integration and API services.
 */

// Initialize app variables
let piBalance = 0;
let piValue = 0;
let currentCurrency = 'usd';

// DOM elements
const authSection = document.getElementById('auth-section');
const userInfoSection = document.getElementById('user-info');
const loadingSection = document.getElementById('loading');
const errorSection = document.getElementById('error-section');
const signInButton = document.getElementById('sign-in');
const authMessage = document.getElementById('auth-message');
const usernameElement = document.getElementById('username');
const piBalanceElement = document.getElementById('pi-balance');
const piValueElement = document.getElementById('pi-value');
const totalValueElement = document.getElementById('total-value');
const currencySelector = document.getElementById('currency');
const refreshButton = document.getElementById('refresh-btn');
const lastUpdatedElement = document.getElementById('last-updated');
const errorMessageElement = document.getElementById('error-message');
const retryButton = document.getElementById('retry-btn');

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners
    setupEventListeners();
});

/**
 * Setup event listeners for the app
 */
function setupEventListeners() {
    // Sign in button
    signInButton.addEventListener('click', handleSignIn);
    
    // Currency selector
    currencySelector.addEventListener('change', function() {
        currentCurrency = this.value;
        calculateAndDisplayValues();
    });
    
    // Refresh button
    refreshButton.addEventListener('click', refreshData);
    
    // Retry button
    retryButton.addEventListener('click', function() {
        hideError();
        refreshData();
    });
}

/**
 * Handle the sign in process
 */
async function handleSignIn() {
    showLoading();
    hideError();
    
    try {
        // Authenticate with Pi Network
        const user = await window.PiIntegration.authenticateWithPi();
        
        // Update UI with user info
        usernameElement.textContent = user.username;
        
        // Get Pi balance
        piBalance = await window.ApiServices.fetchPiBalance();
        piBalanceElement.textContent = `${piBalance} π`;
        
        // Get Pi value
        piValue = await window.ApiServices.fetchPiValue(currentCurrency);
        
        // Calculate and display total value
        calculateAndDisplayValues();
        
        // Update last updated time
        updateLastUpdatedTime();
        
        // Show user info section
        hideLoading();
        hideAuthSection();
        showUserInfo();
        
    } catch (error) {
        hideLoading();
        showAuthSection();
        showError(`Authentication error: ${error.message || 'Unknown error'}`);
    }
}

/**
 * Calculate and display values in the UI
 */
function calculateAndDisplayValues() {
    // Format Pi value based on currency
    const formattedPiValue = window.ApiServices.formatCurrencyValue(piValue, currentCurrency);
    piValueElement.textContent = formattedPiValue;
    
    // Calculate total value
    const totalValue = piBalance * piValue;
    const formattedTotalValue = window.ApiServices.formatCurrencyValue(totalValue, currentCurrency);
    totalValueElement.textContent = formattedTotalValue;
}

/**
 * Update the last updated time
 */
function updateLastUpdatedTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    lastUpdatedElement.textContent = `Last updated: ${formattedTime}`;
}

/**
 * Refresh data
 */
async function refreshData() {
    showLoading();
    hideError();
    hideUserInfo();
    
    try {
        // Check if user is authenticated
        const user = window.PiIntegration.getAuthenticatedUser();
        if (!user) {
            throw new Error("User not authenticated");
        }
        
        // Fetch Pi balance
        piBalance = await window.ApiServices.fetchPiBalance();
        piBalanceElement.textContent = `${piBalance} π`;
        
        // Fetch Pi value
        piValue = await window.ApiServices.fetchPiValue(currentCurrency);
        
        // Calculate and display total value
        calculateAndDisplayValues();
        
        // Update last updated time
        updateLastUpdatedTime();
        
        hideLoading();
        showUserInfo();
    } catch (error) {
        hideLoading();
        showError(`Error refreshing data: ${error.message || 'Unknown error'}`);
    }
}

/**
 * UI Helper Functions
 */

function showLoading() {
    loadingSection.classList.remove('hidden');
}

function hideLoading() {
    loadingSection.classList.add('hidden');
}

function showUserInfo() {
    userInfoSection.classList.remove('hidden');
}

function hideUserInfo() {
    userInfoSection.classList.add('hidden');
}

function showAuthSection() {
    authSection.classList.remove('hidden');
}

function hideAuthSection() {
    authSection.classList.add('hidden');
}

function showError(message) {
    errorSection.classList.remove('hidden');
    errorMessageElement.textContent = message;
}

function hideError() {
    errorSection.classList.add('hidden');
}

// Make helper functions available globally
window.showError = showError;
window.hideError = hideError;