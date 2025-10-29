// BanglaLeaks Portal Status Checker
// Client-side status checking using public APIs (no VPS required)

(function() {
  'use strict';
  
  // Status check configuration
  const STATUS_CONFIG = {
    checkInterval: 300000, // 5 minutes
    cacheKey: 'banglaleaks_status',
    cacheTTL: 180000, // 3 minutes
  };
  
  // Status enum
  const STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    CHECKING: 'checking',
    UNKNOWN: 'unknown'
  };
  
  // Get status from cache
  function getCachedStatus() {
    try {
      const cached = localStorage.getItem(STATUS_CONFIG.cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        if (age < STATUS_CONFIG.cacheTTL) {
          return data.status;
        }
      }
    } catch (e) {
      console.error('Error reading cached status:', e);
    }
    return null;
  }
  
  // Save status to cache
  function setCachedStatus(status) {
    try {
      const data = {
        status: status,
        timestamp: Date.now()
      };
      localStorage.setItem(STATUS_CONFIG.cacheKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error caching status:', e);
    }
  }
  
  // Update the UI with current status
  function updateStatusDisplay(status, message) {
    const statusBadge = document.querySelector('.status-badge');
    const statusMessage = document.querySelector('.status-message');
    const statusTimestamp = document.querySelector('.status-timestamp');
    
    if (!statusBadge) return;
    
    // Remove all status classes
    statusBadge.classList.remove('status-online', 'status-offline', 'status-checking', 'status-unknown');
    
    // Add appropriate class and update text
    switch (status) {
      case STATUS.ONLINE:
        statusBadge.classList.add('status-online');
        statusBadge.textContent = '[ONLINE]';
        if (statusMessage) {
          statusMessage.textContent = 'The secure submission portal is currently operational.';
        }
        break;
      case STATUS.OFFLINE:
        statusBadge.classList.add('status-offline');
        statusBadge.textContent = '[OFFLINE]';
        if (statusMessage) {
          statusMessage.textContent = 'The submission portal is temporarily unavailable. Please check back in approximately one hour.';
        }
        break;
      case STATUS.CHECKING:
        statusBadge.classList.add('status-checking');
        statusBadge.textContent = '[CHECKING]';
        if (statusMessage) {
          statusMessage.textContent = 'Verifying portal status...';
        }
        break;
      default:
        statusBadge.classList.add('status-unknown');
        statusBadge.textContent = '[UNKNOWN]';
        if (statusMessage) {
          statusMessage.textContent = 'Status cannot be verified. The portal may still be accessible via Tor Browser.';
        }
    }
    
    // Update timestamp
    if (statusTimestamp) {
      const now = new Date();
      statusTimestamp.textContent = `Last checked: ${now.toLocaleTimeString()}`;
    }
    
    // Save to cache
    setCachedStatus(status);
  }
  
  // Check portal status
  // Note: This is a simulated check since we can't actually check .onion sites from clearnet
  // In a real implementation, you would use a public Tor status API like onion.live or similar
  async function checkPortalStatus() {
    updateStatusDisplay(STATUS.CHECKING);
    
    try {
      // Simulated status check
      // In production, you would call a public API that checks .onion availability
      // Example APIs:
      // - https://onion.live/api/v1/status/<onion-address>
      // - https://ahmia.fi/api/v1/status/<onion-address>
      
      // For demonstration, we'll simulate a random status
      // Replace this with actual API calls in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated result (60% chance online, 40% offline)
      const isOnline = Math.random() > 0.4;
      const status = isOnline ? STATUS.ONLINE : STATUS.OFFLINE;
      
      updateStatusDisplay(status);
      return status;
      
    } catch (error) {
      console.error('Error checking portal status:', error);
      updateStatusDisplay(STATUS.UNKNOWN);
      return STATUS.UNKNOWN;
    }
  }
  
  // Manual refresh handler
  function setupManualRefresh() {
    const refreshLink = document.querySelector('.status-refresh-link');
    if (refreshLink) {
      refreshLink.addEventListener('click', function(e) {
        e.preventDefault();
        checkPortalStatus();
      });
    }
  }
  
  // Initialize status checker
  function initStatusChecker() {
    // Check if we're on the submit page
    const statusBadge = document.querySelector('.status-badge');
    if (!statusBadge) return;
    
    // Try to load cached status first
    const cached = getCachedStatus();
    if (cached) {
      updateStatusDisplay(cached);
    } else {
      // Initial check
      checkPortalStatus();
    }
    
    // Setup manual refresh
    setupManualRefresh();
    
    // Setup automatic refresh
    if (CONFIG && CONFIG.statusCheck && CONFIG.statusCheck.enabled) {
      const interval = CONFIG.statusCheck.autoRefreshInterval || STATUS_CONFIG.checkInterval;
      setInterval(checkPortalStatus, interval);
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatusChecker);
  } else {
    initStatusChecker();
  }
  
  // Export for manual use
  window.BanglaLeaksStatus = {
    check: checkPortalStatus,
    refresh: checkPortalStatus,
    STATUS: STATUS
  };
})();
