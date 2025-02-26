/**
 * api-services.js
 * Handles all external API calls and data fetching services
 * including Pi value from CoinGecko and mock Pi balance.
 */

// Store the latest Pi values for different currencies
let cachedPiValues = {
    usd: null,
    eur: null,
    gbp: null,
    jpy: null,
    cny: null,
    lastUpdated: null
};

/**
 * Initialize API services and fetch initial Pi value
 */
document.addEventListener('DOMContentLoaded', function() {
    // Fetch initial Pi value in USD
    fetchAndCachePiValues();
    
    // Set up a refresh interval (every 5 minutes)
    setInterval(fetchAndCachePiValues, 5 * 60 * 1000);
});

/**
 * Fetch Pi values for all supported currencies and cache them
 * @returns {Promise<Object>} Object containing Pi values for each currency
 */
async function fetchAndCachePiValues() {
    try {
        // We'll fetch values for all currencies at once to minimize API calls
        const currencies = ['usd', 'eur', 'gbp', 'jpy', 'cny'].join(',');
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=${currencies}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we have actual data
        if (data['pi-network']) {
            // Update our cache with real values
            Object.keys(data['pi-network']).forEach(currency => {
                cachedPiValues[currency] = data['pi-network'][currency];
            });
        } else {
            // Use mock values if real data isn't available
            cachedPiValues = {
                usd: 1.42,
                eur: 0.39,
                gbp: 0.33,
                jpy: 46.8,
                cny: 2.89
            };
        }
        
        // Update timestamp
        cachedPiValues.lastUpdated = new Date();
        
        // Trigger an event that the values have been updated
        const event = new CustomEvent('piValueUpdated', { detail: cachedPiValues });
        document.dispatchEvent(event);
        
        return cachedPiValues;
    } catch (error) {
        console.error("Error fetching Pi values:", error);
        
        // If we don't have any cached values yet, use mock values
        if (!cachedPiValues.usd) {
            cachedPiValues = {
                usd: 0.42,
                eur: 0.39,
                gbp: 0.33,
                jpy: 46.8,
                cny: 2.89,
                lastUpdated: new Date()
            };
            
            // Trigger the event even with mock data
            const event = new CustomEvent('piValueUpdated', { detail: cachedPiValues });
            document.dispatchEvent(event);
        }
        
        return cachedPiValues;
    }
}

/**
 * Get the current Pi value for a specific currency
 * @param {string} currency The currency code (usd, eur, etc.)
 * @returns {number} The current Pi value
 */
function getCurrentPiValue(currency) {
    return cachedPiValues[currency] || getMockPiValue(currency);
}

/**
 * Get the timestamp of the last Pi value update
 * @returns {Date|null} The date of the last update or null if never updated
 */
function getLastUpdateTime() {
    return cachedPiValues.lastUpdated;
}

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
    // First check if we have a cached value that's recent (less than 5 minutes old)
    const now = new Date();
    if (cachedPiValues[currency] && cachedPiValues.lastUpdated &&
        (now - cachedPiValues.lastUpdated) < 5 * 60 * 1000) {
        return cachedPiValues[currency];
    }
    
    // Otherwise fetch a new value
    await fetchAndCachePiValues();
    return cachedPiValues[currency] || getMockPiValue(currency);
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
    formatCurrencyValue,
    getCurrentPiValue,
    getLastUpdateTime
};