# BanglaLeaks - Secure Whistleblowing Platform

BanglaLeaks is a secure, anonymous whistleblowing platform designed to help individuals safely expose corruption, government misconduct, and wrongdoing. This repository contains the complete website with comprehensive security features and bilingual support (English and Bengali).

## Features

- **Security-First Design**: No tracking, no analytics, no cookies
- **Tor Integration**: Clear instructions for anonymous submission via Tor Browser
- **Bilingual Support**: Full content in English and Bengali (বাংলা)
- **Responsive Design**: Works on all devices
- **Professional Design**: WikiLeaks-inspired clean aesthetic with white background
- **Automated Status Checking**: Client-side portal status indicator
- **Accessible**: WCAG compliant design
- **Security Headers**: CSP, X-Frame-Options, and more

## Website Structure

```
/
├── index.html          # Home page with mission statement
├── submit.html         # Tor Browser instructions & .onion domain info
├── about.html          # About BanglaLeaks, mission, legal disclaimer
├── security.html       # Comprehensive security guide for whistleblowers
├── faq.html           # Frequently asked questions
├── robots.txt         # Search engine directives (blocks sensitive pages)
├── css/
│   └── style.css      # Main stylesheet (dark theme)
├── js/
│   └── main.js        # Language toggle, copy functionality
└── README.md          # This file
```

## Key Pages

### 1. Home Page (index.html)
- Professional landing page
- Mission statement and features
- Call-to-action buttons
- Overview of accepted leak types

### 2. Submission Page (submit.html)
- **Tor Browser Instructions**: Step-by-step download and installation guide
- **Onion Domain Section**: Prominent display of .onion URL with copy button
- Security warnings and best practices
- Links to official Tor Project website

### 3. About Page (about.html)
- Mission and values
- Types of leaks accepted
- Source protection commitment
- Verification process
- Legal disclaimer

### 4. Security Guide (security.html)
- Essential security rules
- Best practices for anonymity
- Document preparation instructions
- Common mistakes to avoid
- Advanced security measures (Tails OS, etc.)

### 5. FAQ Page (faq.html)
- General questions
- Submission process
- Security and privacy
- After submission
- Technical questions

## Deployment Instructions

### Quick Start (Static Hosting)

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd achilleus
   ```

2. **Update the .onion address** (IMPORTANT!)
   - Open `config.js`
   - Find the line: `onionUrl: 'your-domain-here.onion/submit',`
   - Replace `your-domain-here.onion/submit` with your actual .onion address

3. **Test locally**
   ```bash
   # Using Python's built-in HTTP server
   python3 -m http.server 8000
   # Visit http://localhost:8000 in your browser
   ```

4. **Deploy to your web server**
   - Upload all files to your web server
   - Ensure proper permissions (files: 644, directories: 755)
   - Configure your web server (see below)

### Web Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Root directory
    root /var/www/banglaleaks;
    index index.html;
    
    # Security headers (additional to HTML meta tags)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Main location
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/banglaleaks
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/ssl/certificate.crt
    SSLCertificateKeyFile /path/to/ssl/private.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite HIGH:!aNULL:!MD5
    
    # Security headers
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "no-referrer"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Directory configuration
    <Directory /var/www/banglaleaks>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Deny access to hidden files
    <FilesMatch "^\.">
        Require all denied
    </FilesMatch>
</VirtualHost>
```

### Customization

#### Update the .onion Address

The most important customization is updating the .onion address in `submit.html`:

```html
<!-- Find this section in submit.html -->
<div class="onion-address">
  <code id="onion-url">your-domain-here.onion/submit</code>
  <button class="copy-btn" onclick="copyOnion()">📋 Copy Address</button>
</div>
```

Replace `your-domain-here.onion/submit` with your actual Tor hidden service address.

#### Branding

- **Logo**: Add your logo image to the repository and update the logo section in each HTML file
- **Colors**: Modify CSS variables in `css/style.css`:
  ```css
  :root {
    --accent-primary: #00d9a3;    /* Change primary color */
    --accent-secondary: #00b386;  /* Change secondary color */
  }
  ```
- **Footer**: Update copyright year and organization info in each HTML file

#### Content Localization

All content is already provided in English and Bengali. To modify translations:
1. Find elements with `lang="en"` and `lang="bn"` attributes
2. Update the text while maintaining the structure
3. Ensure both language versions have matching structure

## Security Considerations

### What This Website Does

✅ **Includes:**
- No tracking scripts or analytics
- No cookies
- No external dependencies
- Security-focused meta tags
- robots.txt to prevent indexing of sensitive pages
- Clear security guidance for users

### What You Need to Provide

🔧 **You Must Setup:**
1. **SSL/TLS Certificate**: Use Let's Encrypt or purchase certificate
2. **Tor Hidden Service**: Setup actual .onion site for submissions
3. **Secure Submission Backend**: This is just the frontend; you need a secure backend
4. **Web Server Hardening**: Follow security best practices
5. **Regular Updates**: Keep server software updated

### Additional Security Steps

1. **Enable HSTS**: Configure HTTP Strict Transport Security
2. **Configure Firewall**: Only allow necessary ports (80, 443)
3. **Regular Backups**: Backup website files regularly
4. **Monitor Logs**: Review access logs for suspicious activity
5. **Update Content**: Keep security guidance up to date

## Testing

### Manual Testing Checklist

- [ ] All pages load correctly
- [ ] Language toggle works on all pages
- [ ] Copy button works on submit.html
- [ ] All links work correctly
- [ ] Responsive design works on mobile devices
- [ ] No console errors in browser developer tools
- [ ] External links open in new tab with security attributes
- [ ] Navigation highlights active page

### Browser Compatibility

Tested and compatible with:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Tor Browser (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Privacy Notice

This website is designed with privacy as the top priority:
- No analytics or tracking
- No cookies
- No third-party scripts
- No IP logging (configure on server level)
- All external links have `rel="noopener noreferrer"`

## License

[Specify your license here]

## Support

For questions about deployment or customization, please refer to:
- Security best practices: https://www.torproject.org/
- Web server documentation: Nginx/Apache official docs
- SSL/TLS setup: https://letsencrypt.org/

## Contributing

[Add contribution guidelines if accepting contributions]

---

**Important**: This is a frontend website only. You must set up a secure backend system for actually receiving and processing submissions. Never accept submissions through regular web forms without proper Tor hidden service infrastructure.
