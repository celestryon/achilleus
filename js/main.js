// Language toggle functionality
function toggleLanguage() {
  const body = document.body;
  const btn = document.getElementById('lang-toggle');
  
  // Toggle class on body
  body.classList.toggle('lang-bn');
  
  // Update button text and save preference
  if (body.classList.contains('lang-bn')) {
    btn.textContent = 'English';
    localStorage.setItem('lang', 'bn');
  } else {
    btn.textContent = 'বাংলা';
    localStorage.setItem('lang', 'en');
  }
}

// Check .onion status
async function checkOnionStatus() {
  try {
    const response = await fetch('/status.json?t=' + Date.now());
    const data = await response.json();
    updateStatusDisplay(data.online);
  } catch (error) {
    console.error('Failed to fetch status:', error);
    updateStatusDisplay(false);
  }
}

// Update status display based on online/offline state
function updateStatusDisplay(isOnline) {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const statusTextBn = document.getElementById('status-text-bn');
  const statusMessage = document.getElementById('status-message');
  const statusMessageBn = document.getElementById('status-message-bn');
  const statusUpdateNote = document.getElementById('status-update-note');
  const statusUpdateNoteBn = document.getElementById('status-update-note-bn');
  
  if (!statusDot) return;
  
  // Remove existing status classes
  statusDot.classList.remove('online', 'offline');
  
  if (isOnline) {
    // Online state
    statusDot.classList.add('online');
    statusText.textContent = '🟢 ONLINE';
    statusTextBn.textContent = '🟢 অনলাইন';
    statusMessage.textContent = 'Our .onion site is available. You can submit securely now.';
    statusMessageBn.textContent = 'আমাদের .onion সাইট উপলব্ধ। আপনি এখন নিরাপদে জমা দিতে পারেন।';
    statusUpdateNote.textContent = 'Status updates every minute. Refresh this page to see the latest status.';
    statusUpdateNoteBn.textContent = 'প্রতি মিনিটে স্ট্যাটাস আপডেট হয়। সর্বশেষ স্ট্যাটাস দেখতে এই পৃষ্ঠাটি রিফ্রেশ করুন।';
  } else {
    // Offline state
    statusDot.classList.add('offline');
    statusText.textContent = '🔴 OFFLINE';
    statusTextBn.textContent = '🔴 অফলাইন';
    statusMessage.textContent = 'Our .onion site is temporarily unavailable. Please check back in an hour.';
    statusMessageBn.textContent = 'আমাদের .onion সাইট সাময়িকভাবে অনুপলব্ধ। এক ঘন্টা পরে আবার চেক করুন।';
    statusUpdateNote.textContent = 'Refresh this page in a minute to see if the site is back online.';
    statusUpdateNoteBn.textContent = 'সাইট আবার অনলাইন কিনা দেখতে এক মিনিটের মধ্যে এই পৃষ্ঠাটি রিফ্রেশ করুন।';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedLang = localStorage.getItem('lang');
  const btn = document.getElementById('lang-toggle');
  
  // Apply saved language
  if (savedLang === 'bn') {
    document.body.classList.add('lang-bn');
    if (btn) {
      btn.textContent = 'English';
    }
  }
  
  // Attach click handler
  if (btn) {
    btn.addEventListener('click', toggleLanguage);
  }
  
  // Highlight current page in navigation
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
  
  // Check onion status if we're on the submit page
  const statusBox = document.getElementById('onion-status-box');
  if (statusBox) {
    checkOnionStatus();
    // Update status every 60 seconds
    setInterval(checkOnionStatus, 60000);
  }
});
