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
});
