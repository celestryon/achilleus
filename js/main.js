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

// Copy .onion URL to clipboard
function copyOnion() {
  const url = document.getElementById('onion-url').textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('copy-btn');
    const originalText = btn.textContent;
    
    // Show feedback
    if (document.body.classList.contains('lang-bn')) {
      btn.textContent = 'কপি হয়েছে!';
    } else {
      btn.textContent = 'Copied!';
    }
    
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
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
  
  // Attach copy button handler if exists
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyOnion);
  }
});
