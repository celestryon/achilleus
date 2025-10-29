/**
 * BanglaLeaks Configuration Example
 * 
 * Copy this file to js/config.js and update the values according to your deployment.
 * 
 * This file contains all configuration options for the BanglaLeaks status checker.
 */

const CONFIG = {
    // ==========================================
    // MAIN CONFIGURATION
    // ==========================================
    
    /**
     * Your .onion submission portal URL
     * Replace this with your actual .onion domain
     * Example: 'http://abc123xyz456.onion/submit'
     */
    onionUrl: 'http://your-domain-here.onion/submit',
    
    /**
     * API endpoint for status checking
     * 
     * Options:
     * 1. Backend Proxy Checker (Recommended for production):
     *    - '/api/status' - Use Node.js/Python backend (see backend-examples/)
     *    - 'https://your-api-domain.com/api/status' - Use external API
     * 
     * 2. Static Fallback (For static hosting like GitHub Pages):
     *    - '/status.json' - Use static JSON file updated via cron job
     *    - 'https://your-cdn.com/status.json' - Use CDN-hosted status file
     */
    statusApiEndpoint: '/api/status',
    
    /**
     * Check interval in milliseconds
     * Default: 30000 (30 seconds)
     * 
     * Recommended ranges:
     * - Real-time backend: 30000-60000 (30-60 seconds)
     * - Static fallback: 60000-300000 (1-5 minutes)
     */
    checkInterval: 30000,
    
    /**
     * Request timeout in milliseconds
     * Default: 15000 (15 seconds)
     * 
     * Maximum time to wait for status API response before treating as offline
     */
    requestTimeout: 15000,
    
    /**
     * Enable/disable automatic status checking
     * Set to false to disable automatic checks (useful for testing/development)
     */
    enableStatusCheck: true,
    
    // ==========================================
    // BILINGUAL MESSAGES
    // ==========================================
    
    /**
     * Status messages in English and Bengali
     * Add more languages by extending this object
     */
    messages: {
        // English messages
        en: {
            online: 'Submission portal is online and accepting leaks',
            offline: 'Submission portal is temporarily offline. Please try again later.',
            checking: 'Checking submission portal status...',
            error: 'Unable to check status. Please refresh the page.'
        },
        
        // Bengali messages (বাংলা বার্তা)
        bn: {
            online: 'সাবমিশন পোর্টাল অনলাইন এবং লিক গ্রহণ করছে',
            offline: 'সাবমিশন পোর্টাল সাময়িকভাবে অফলাইন। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
            checking: 'সাবমিশন পোর্টাল স্ট্যাটাস চেক করা হচ্ছে...',
            error: 'স্ট্যাটাস চেক করতে অক্ষম। অনুগ্রহ করে পেজ রিফ্রেশ করুন।'
        }
    },
    
    /**
     * Current language
     * Options: 'en' (English) or 'bn' (Bengali)
     * 
     * You can extend this to support more languages by:
     * 1. Adding messages for the new language in the messages object above
     * 2. Setting this to the language code (e.g., 'es', 'fr', 'ar')
     */
    currentLanguage: 'en'
};

// ==========================================
// DEPLOYMENT EXAMPLES
// ==========================================

/*
// Example 1: Backend Proxy Checker with Node.js
const CONFIG = {
    onionUrl: 'http://abc123xyz456.onion/submit',
    statusApiEndpoint: '/api/status',
    checkInterval: 30000,
    requestTimeout: 15000,
    enableStatusCheck: true,
    currentLanguage: 'en'
};

// Example 2: Backend Proxy Checker with External API
const CONFIG = {
    onionUrl: 'http://abc123xyz456.onion/submit',
    statusApiEndpoint: 'https://api.yoursite.com/api/status',
    checkInterval: 30000,
    requestTimeout: 15000,
    enableStatusCheck: true,
    currentLanguage: 'en'
};

// Example 3: Static Fallback with GitHub Pages
const CONFIG = {
    onionUrl: 'http://abc123xyz456.onion/submit',
    statusApiEndpoint: '/status.json',
    checkInterval: 120000, // 2 minutes (since it's static)
    requestTimeout: 15000,
    enableStatusCheck: true,
    currentLanguage: 'en'
};

// Example 4: Bengali Interface
const CONFIG = {
    onionUrl: 'http://abc123xyz456.onion/submit',
    statusApiEndpoint: '/api/status',
    checkInterval: 30000,
    requestTimeout: 15000,
    enableStatusCheck: true,
    currentLanguage: 'bn'
};

// Example 5: Disabled Status Checking (Development)
const CONFIG = {
    onionUrl: 'http://abc123xyz456.onion/submit',
    statusApiEndpoint: '/api/status',
    checkInterval: 30000,
    requestTimeout: 15000,
    enableStatusCheck: false, // Disabled for development
    currentLanguage: 'en'
};
*/

// ==========================================
// DO NOT MODIFY BELOW THIS LINE
// ==========================================

// Make CONFIG globally available
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

// Export for Node.js environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
