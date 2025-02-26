/**
 * pi-integration.js
 * Handles all Pi Network SDK interactions including authentication
 * and payment functionalities.
 */

// Global variable to store authenticated user
let authenticatedUser = null;

/**
 * Initialize the Pi SDK when the page loads
 */
document.addEventListener('DOMContentLoaded', async function() {
    initializePiSDK();
});

/**
 * Initialize the Pi Network SDK
 */
function initializePiSDK() {
    try {
        const Pi = window.Pi;
        Pi.init({ 
            version: "2.0",
            sandbox: true // Set to false in production
        });
        
        console.log("Pi SDK initialized successfully");
    } catch (error) {
        console.error("Pi SDK initialization error:", error);
        // We'll let the main app handle displaying the error
        if (typeof showError === 'function') {
            showError("Failed to initialize Pi SDK. Please make sure you're using the Pi Browser.");
        }
    }
}

/**
 * Authenticate user with Pi Network
 * @returns {Promise<Object>} User information if authentication successful
 */
async function authenticateWithPi() {
    try {
        // Access the Pi object from the window
        const Pi = window.Pi;
        
        // Authenticate user and get access token
        const scopes = ['username', 'payments'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);
        
        // Store authenticated user
        authenticatedUser = authResult.user;
        
        return authenticatedUser;
    } catch (error) {
        console.error("Pi authentication error:", error);
        throw error; // Rethrow to let the main app handle it
    }
}

/**
 * Get the current authenticated user
 * @returns {Object|null} User information or null if not authenticated
 */
function getAuthenticatedUser() {
    return authenticatedUser;
}

/**
 * Handle incomplete payments (required by Pi SDK)
 * @param {Object} payment The incomplete payment object
 */
function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment found:", payment);
    // In a real app, implement proper payment completion logic
    return;
}

/**
 * Reset authentication state (useful for logout functionality)
 */
function resetAuthentication() {
    authenticatedUser = null;
}

/**
 * Check if the app is running in Pi Browser
 * @returns {boolean} True if running in Pi Browser
 */
function isRunningInPiBrowser() {
    // Simple check for Pi Browser
    return typeof window.Pi !== 'undefined';
}

// Export functions for use in other modules
window.PiIntegration = {
    authenticateWithPi,
    getAuthenticatedUser,
    resetAuthentication,
    isRunningInPiBrowser
};