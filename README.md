# BanglaLeaks

A secure whistleblowing platform for exposing corruption in Bangladesh. Built with SecureDrop technology to protect source anonymity.

## Features

- **Bilingual Support**: Full English and Bengali language support with working toggle
- **Complete Anonymity**: Submissions through Tor Browser and SecureDrop
- **Professional Design**: Clean, WikiLeaks-inspired aesthetic with Times New Roman typography
- **Mobile Responsive**: Works on all devices
- **Security First**: No tracking, no analytics, no cookies

## Pages

- **index.html** - Homepage with mission and features
- **submit.html** - Secure submission instructions
- **about.html** - Mission, vision, and editorial standards
- **security.html** - Comprehensive security guide
- **faq.html** - Frequently asked questions

## Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (no frameworks)
- **Fonts**: Times New Roman for headings, Arial for body, Noto Sans Bengali for Bengali text
- **Security**: Designed for SecureDrop integration via Tor hidden service

## Language Toggle

The site features a fully functional Bengali/English language toggle that:
- Remembers user preference via localStorage
- Persists across page navigation
- Uses inline CSS for immediate language switching
- Works on all pages

## Design Principles

- Pure white background (#ffffff)
- Times New Roman typography for elegant, professional look
- Generous whitespace
- Subtle borders and minimal colors
- No fancy animations or effects
- Professional newspaper-style layout

## File Structure

```
/
├── index.html          # Homepage
├── submit.html         # Submission page
├── about.html          # About page
├── security.html       # Security guide
├── faq.html            # FAQ page
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # Language toggle and interactions
├── config.js           # Configuration (onion URL placeholder)
└── README.md           # This file
```

## Local Development

Simply open any HTML file in a web browser. No build process required.

```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## SecureDrop Integration

This is the public-facing website. For actual secure submissions, you need to:

1. Set up a SecureDrop instance (see https://securedrop.org)
2. Update the .onion URL in `config.js`
3. Host the SecureDrop instance as a Tor hidden service
4. Update the .onion URL displayed on submit.html

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Tor Browser (for SecureDrop access)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Features

- No external dependencies (except Google Fonts for Bengali)
- No tracking scripts
- No analytics
- No cookies
- Designed for Tor Browser compatibility

## Contributing

This is a whistleblowing platform. Security and anonymity are paramount. Any contributions must maintain these principles.

## License

This project is dedicated to transparency and accountability in Bangladesh.

## Disclaimer

This is the public website only. Actual secure submissions require a properly configured SecureDrop instance accessible via Tor Browser.
