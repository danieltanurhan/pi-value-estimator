/**
 * api-services.js
 * Handles all external API calls and data fetching services
 * including Pi value from CoinGecko and mock Pi balance.
 */

/**
 * Fetch user's Pi balance
 * Note: This is a mock function. In a real app, this would be an API call to your backend
 * @returns {Promise<number>} The user's Pi balance
 */
async function fetchPiBalance() {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Mock balance (100 Pi)
            const balance = 100;
            resolve(balance);
        }, 1000);
    });
}

/**
 * Fetch current Pi value from CoinGecko API
 * @param {string} currency The currency code (usd, eur, etc.)
 * @returns {Promise<number>} The current Pi value in the specified currency
 */
async function fetchPiValue(currency) {
    try {
        // In production, you should make this request from your backend
        // to avoid CORS issues and protect your API keys
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=${currency}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // For demo purposes, if Pi Network isn't listed yet, use a mock value
        if (!data['pi-network'] || !data['pi-network'][currency]) {
            // Use mock value if real data not available
            return getMockPiValue(currency);
        } else {
            return data['pi-network'][currency];
        }
    } catch (error) {
        console.error("Error fetching Pi value:", error);
        // Use mock value on error
        return getMockPiValue(currency);
    }
}

/**
 * Generate mock Pi value for demonstration purposes
 * @param {string} currency The currency code
 * @returns {number} A mock Pi value
 */
function getMockPiValue(currency) {
    // Using fixed mock values for demonstration
    const mockValues = {
        usd: 0.42,
        eur: 0.39,
        gbp: 0.33,
        jpy: 46.8,
        cny: 2.89
    };
    
    return mockValues[currency] || 0.42;
}

/**
 * Format a currency value based on the currency type
 * @param {number} value The value to format
 * @param {string} currency The currency code
 * @returns {string} Formatted currency string
 */
function formatCurrencyValue(value, currency) {
    const currencySymbols = {
        usd: '$',
        eur: '€',
        gbp: '£',
        jpy: '¥',
        cny: '¥'
    };
    
    const symbol = currencySymbols[currency] || '';
    
    // Format based on currency
    if (currency === 'jpy') {
        // JPY typically doesn't use decimal places
        return `${symbol}${Math.round(value)}`;
    } else {
        return `${symbol}${value.toFixed(2)}`;
    }
}

// Export functions for use in other modules
window.ApiServices = {
    fetchPiBalance,
    fetchPiValue,
    formatCurrencyValue
};