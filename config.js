// BanglaLeaks Configuration
// Update this file with your actual .onion URL

const CONFIG = {
  // Replace this with your actual .onion submission portal URL
  onionUrl: 'your-domain-here.onion/submit',
  
  // Status check configuration
  statusCheck: {
    enabled: true,
    autoRefreshInterval: 300000, // 5 minutes in milliseconds
    checkTimeout: 10000, // 10 seconds timeout for status checks
  },
  
  // Site information
  siteName: 'BanglaLeaks',
  currentYear: new Date().getFullYear()
};
