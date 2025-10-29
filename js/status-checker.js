/**
 * OnionStatusChecker - Real-time .onion portal status monitoring
 * 
 * This class handles checking the status of the .onion submission portal
 * and updating the UI accordingly with proper bilingual support.
 */

class OnionStatusChecker {
    constructor(apiEndpoint, checkInterval = 30000) {
        this.apiEndpoint = apiEndpoint;
        this.checkInterval = checkInterval;
        this.checkTimer = null;
        this.lastCheckedTime = null;
        
        // DOM elements
        this.statusIndicator = document.querySelector('.status-indicator');
        this.statusBadge = document.getElementById('onion-status');
        this.statusMessage = document.getElementById('status-message');
        this.lastCheckedEl = document.getElementById('last-checked');
        this.refreshBtn = document.getElementById('refresh-status');
        this.onionUrlEl = document.getElementById('onion-url');
        this.copyBtn = document.getElementById('copy-url');
        
        // Get messages from config
        this.messages = CONFIG.messages[CONFIG.currentLanguage];
        
        this.init();
    }
    
    init() {
        // Set onion URL from config
        if (this.onionUrlEl && CONFIG.onionUrl) {
            this.onionUrlEl.textContent = CONFIG.onionUrl;
        }
        
        // Setup event listeners
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.checkStatus();
            });
        }
        
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => {
                this.copyOnionUrl();
            });
        }
        
        // Start monitoring if enabled
        if (CONFIG.enableStatusCheck) {
            this.startMonitoring();
        } else {
            this.updateUI('offline', 'Status checking is disabled');
        }
    }
    
    /**
     * Start automatic status monitoring
     */
    startMonitoring() {
        // Initial check
        this.checkStatus();
        
        // Set up interval for periodic checks
        this.checkTimer = setInterval(() => {
            this.checkStatus();
        }, this.checkInterval);
    }
    
    /**
     * Stop automatic status monitoring
     */
    stopMonitoring() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
    }
    
    /**
     * Check the status of the .onion portal
     */
    async checkStatus() {
        this.updateUI('checking');
        
        try {
            const controller = new AbortController();
            const timeout = CONFIG.requestTimeout || 15000;
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'online') {
                this.updateUI('online');
            } else {
                this.updateUI('offline');
            }
            
        } catch (error) {
            console.error('Status check failed:', error);
            
            // If it's a timeout or network error, show offline
            if (error.name === 'AbortError') {
                this.updateUI('offline', 'Status check timed out');
            } else {
                this.updateUI('offline', error.message);
            }
        }
        
        // Update last checked time
        this.updateLastChecked();
    }
    
    /**
     * Update the UI based on status
     * @param {string} status - 'online', 'offline', or 'checking'
     * @param {string} customMessage - Optional custom message
     */
    updateUI(status, customMessage = null) {
        // Remove all status classes
        this.statusIndicator.classList.remove('online', 'offline', 'checking');
        
        // Add current status class
        this.statusIndicator.classList.add(status);
        
        // Update status text
        const statusTextEl = this.statusBadge.querySelector('.status-text');
        if (statusTextEl) {
            statusTextEl.textContent = status.toUpperCase();
        }
        
        // Update status message
        if (this.statusMessage) {
            const message = customMessage || this.messages[status] || this.messages.checking;
            this.statusMessage.textContent = message;
        }
        
        // Update aria-label for accessibility
        this.statusIndicator.setAttribute('aria-label', `Portal status: ${status}`);
    }
    
    /**
     * Update the last checked timestamp
     */
    updateLastChecked() {
        if (!this.lastCheckedEl) return;
        
        this.lastCheckedTime = new Date();
        const timeString = this.lastCheckedTime.toLocaleTimeString();
        
        this.lastCheckedEl.textContent = `Last checked: ${timeString}`;
    }
    
    /**
     * Copy the .onion URL to clipboard
     */
    async copyOnionUrl() {
        if (!this.onionUrlEl) return;
        
        const url = this.onionUrlEl.textContent;
        
        try {
            await navigator.clipboard.writeText(url);
            
            // Visual feedback
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = '✓ Copied!';
            this.copyBtn.style.backgroundColor = 'var(--status-online)';
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.style.backgroundColor = '';
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy:', error);
            
            // Fallback: select the text
            const range = document.createRange();
            range.selectNode(this.onionUrlEl);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    }
    
    /**
     * Get the current status from indicator classes
     * @returns {string} Current status ('online', 'offline', or 'checking')
     */
    getCurrentStatus() {
        if (this.statusIndicator.classList.contains('online')) return 'online';
        if (this.statusIndicator.classList.contains('offline')) return 'offline';
        return 'checking';
    }
    
    /**
     * Change the language of status messages
     * @param {string} lang - 'en' or 'bn'
     */
    changeLanguage(lang) {
        if (CONFIG.messages[lang]) {
            CONFIG.currentLanguage = lang;
            this.messages = CONFIG.messages[lang];
            
            // Refresh current status message
            const currentStatus = this.getCurrentStatus();
            
            if (this.statusMessage) {
                this.statusMessage.textContent = this.messages[currentStatus];
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with the status indicator
    if (document.getElementById('onion-status')) {
        const checker = new OnionStatusChecker(
            CONFIG.statusApiEndpoint,
            CONFIG.checkInterval
        );
        
        // Make checker globally available for debugging/manual control
        window.statusChecker = checker;
    }
});

// Handle page visibility changes (pause checking when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (window.statusChecker) {
        if (document.hidden) {
            window.statusChecker.stopMonitoring();
        } else {
            window.statusChecker.startMonitoring();
        }
    }
});
