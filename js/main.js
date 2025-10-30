// BanglaLeaks - Main JavaScript File

// Language toggle functionality
let currentLang = 'en';

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'bn' : 'en';
  
  // Toggle body class for language switching
  if (currentLang === 'bn') {
    document.body.classList.add('lang-bn');
  } else {
    document.body.classList.remove('lang-bn');
  }
  
  // Update button text
  const langButton = document.getElementById('lang-toggle');
  if (langButton) {
    langButton.textContent = currentLang === 'en' ? 'বাংলা' : 'English';
  }
  
  // Save preference
  localStorage.setItem('preferredLanguage', currentLang);
}

// Initialize language on page load
function initLanguage() {
  const savedLang = localStorage.getItem('preferredLanguage');
  if (savedLang && savedLang !== currentLang) {
    toggleLanguage();
  }
  // If no saved preference or saved is 'en', body doesn't have lang-bn class (default state)
  // The inline CSS will handle hiding Bengali content by default
}

// Copy onion address to clipboard
function copyOnion() {
  const onionUrl = document.getElementById('onion-url');
  if (!onionUrl) return;
  
  const text = onionUrl.textContent;
  
  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback('Copied!');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

// Fallback copy method for older browsers
function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyFeedback('Copied!');
  } catch (err) {
    showCopyFeedback('Failed to copy');
  }
  
  document.body.removeChild(textArea);
}

// Show copy feedback
function showCopyFeedback(message) {
  const copyBtn = event.target;
  const originalText = copyBtn.textContent;
  copyBtn.textContent = message;
  copyBtn.disabled = true;
  
  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.disabled = false;
  }, 2000);
}

// Highlight active navigation link
function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Security warning for external links
function addSecurityToExternalLinks() {
  const links = document.querySelectorAll('a[href^="http"]');
  links.forEach(link => {
    // Add security attributes
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('target', '_blank');
  });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Initialize everything on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  highlightActiveNav();
  addSecurityToExternalLinks();
  initSmoothScroll();
  
  // Add event listener to language toggle button
  const langButton = document.getElementById('lang-toggle');
  if (langButton) {
    langButton.addEventListener('click', toggleLanguage);
  }
});

// Prevent tracking - disable common tracking methods
(function() {
  // Disable some common tracking methods
  if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      originalPushState.apply(window.history, arguments);
    };
  }
})();
