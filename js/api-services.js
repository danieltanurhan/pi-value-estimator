/**
 * api-services.js
 * Handles all external API calls and data fetching services
 * including Pi value from CoinGecko and Pi Network wallet integration.
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

// Store auth tokens
let authData = {
    accessToken: null,
    expiresAt: null
};

// Backend API URL - replace with your actual backend URL
const BACKEND_API_URL = 'https://pi-value-est-backend.onrender.com';

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
 * Check if the authentication token is valid
 * @returns {boolean} True if token is valid, false otherwise
 */
function isAuthTokenValid() {
    if (!authData.accessToken || !authData.expiresAt) {
        return false;
    }
    
    // Check if token is expired (with 5 minutes buffer)
    const now = Date.now();
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    return now < authData.expiresAt - bufferMs;
}

/**
 * Refreshes the authentication token if needed
 * @returns {Promise<string>} The valid access token
 * @throws {Error} If unable to authenticate
 */
async function ensureValidAuthToken() {
    // If token is still valid, return it
    if (isAuthTokenValid()) {
        return authData.accessToken;
    }
    
    // Check if user is authenticated with Pi Network
    const user = window.PiIntegration.getAuthenticatedUser();
    if (!user) {
        throw new Error("User not authenticated with Pi Network");
    }
    
    try {
        // Authenticate with Pi again to get a fresh token
        const authResult = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        
        if (!authResult || !authResult.accessToken) {
            throw new Error("Failed to get access token");
        }
        
        // Store new token with expiration
        authData.accessToken = authResult.accessToken;
        
        // Calculate expiration (typically 1 hour from now, but this depends on Pi's token policy)
        const expiresInMs = authResult.expiresIn * 1000 || 3600 * 1000; // Default to 1 hour if not specified
        authData.expiresAt = Date.now() + expiresInMs;
        
        return authData.accessToken;
    } catch (error) {
        console.error("Error refreshing auth token:", error);
        throw new Error("Authentication failed. Please try signing in again.");
    }
}

/**
 * Make a secure API call to our backend
 * @param {string} endpoint - The API endpoint path
 * @param {Object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>} The API response data
 * @throws {Error} If the API call fails
 */
async function callSecureBackend(endpoint, options = {}) {
    try {
        // Ensure we have a valid auth token
        const accessToken = await ensureValidAuthToken();
        
        // Set up default options
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        };
        
        // Merge with user options
        const fetchOptions = { ...defaultOptions, ...options };
        
        // Convert body to JSON string if it's an object
        if (fetchOptions.body && typeof fetchOptions.body === 'object') {
            fetchOptions.body = JSON.stringify(fetchOptions.body);
        }
        
        // Make the API call
        const response = await fetch(`${BACKEND_API_URL}${endpoint}`, fetchOptions);
        
        // Check if response is ok
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API error: ${response.status}`);
        }
        
        // Parse and return the response data
        return await response.json();
    } catch (error) {
        console.error("Backend API call failed:", error);
        throw new Error(`API request failed: ${error.message}`);
    }
}

/**
 * Called by Pi SDK when incomplete payments are found
 * @param {Object} payment - The incomplete payment
 */
function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
    // Implementation depends on your payment flow
    // Typically, you would verify the payment with your backend
}

/**
 * Fetch user's Pi balance from Pi Network
 * @returns {Promise<number>} The user's Pi balance
 * @throws {Error} If fetching balance fails
 */
async function fetchPiBalance() {
    try {
        // First check if user is authenticated
        const user = window.PiIntegration.getAuthenticatedUser();
        if (!user) {
            throw new Error("User not authenticated");
        }
        
        // Option 1: Direct call to Pi Payments API (if available)
        // Note: This is conceptual as Pi may not expose balance API directly
        // We would use our backend as a proxy in a real implementation
        
        // Get a valid access token
        await ensureValidAuthToken();
        
        // Call our backend which will proxy to Pi Network's API
        const walletData = await callSecureBackend('/wallet/balance');
        
        if (!walletData || typeof walletData.balance !== 'number') {
            throw new Error("Invalid balance data received");
        }
        
        return walletData.balance;
    } catch (error) {
        console.error("Error fetching Pi balance:", error);
        
        // If in development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
            console.warn("Using mock Pi balance due to API error");
            return 100; // Mock balance
        }
        
        // In production, propagate the error
        throw new Error(`Failed to fetch Pi balance: ${error.message}`);
    }
}

/**
 * Fetch user's transaction history from Pi Network
 * @param {Object} options - Pagination and filtering options
 * @param {number} options.limit - Maximum number of transactions to return (default: 10)
 * @param {number} options.offset - Number of transactions to skip (default: 0)
 * @param {string} options.type - Transaction type filter (optional)
 * @returns {Promise<Array>} Array of transaction objects
 * @throws {Error} If fetching transactions fails
 */
async function fetchTransactionHistory(options = {}) {
    try {
        // Default options
        const defaultOptions = {
            limit: 10,
            offset: 0
        };
        
        // Merge with user options
        const queryOptions = { ...defaultOptions, ...options };
        
        // Build query string
        const queryParams = new URLSearchParams();
        Object.entries(queryOptions).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value);
            }
        });
        
        // Call our backend endpoint with query parameters
        const transactions = await callSecureBackend(`/wallet/transactions?${queryParams.toString()}`);
        
        if (!Array.isArray(transactions)) {
            throw new Error("Invalid transaction data received");
        }
        
        return transactions;
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        
        // If in development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
            console.warn("Using mock transaction history due to API error");
            return [
                {
                    id: "tx123456",
                    type: "payment",
                    amount: 5,
                    timestamp: Date.now() - 86400000, // 1 day ago
                    status: "completed",
                    memo: "Purchase"
                },
                {
                    id: "tx123457",
                    type: "transfer",
                    amount: 2.5,
                    timestamp: Date.now() - 172800000, // 2 days ago
                    status: "completed",
                    memo: "Friend payment"
                }
            ];
        }
        
        // In production, propagate the error
        throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }
}

/**
 * Validate a Pi payment with our backend
 * @param {string} paymentId - The Pi payment ID to validate
 * @returns {Promise<Object>} Payment validation result
 * @throws {Error} If validation fails
 */
async function validatePiPayment(paymentId) {
    if (!paymentId) {
        throw new Error("Payment ID is required");
    }
    
    try {
        const validationResult = await callSecureBackend('/payments/validate', {
            method: 'POST',
            body: { paymentId }
        });
        
        return validationResult;
    } catch (error) {
        console.error("Payment validation error:", error);
        throw new Error(`Payment validation failed: ${error.message}`);
    }
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
    fetchTransactionHistory,
    validatePiPayment,
    formatCurrencyValue,
    getCurrentPiValue,
    getLastUpdateTime
};