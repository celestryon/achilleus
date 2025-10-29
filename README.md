# 🔒 BanglaLeaks - Secure Anonymous Whistleblowing Platform

BanglaLeaks is a secure, anonymous whistleblowing platform with real-time .onion portal status monitoring. This project provides a complete frontend website with bilingual support (English/Bengali) and backend status checking examples.

## ✨ Features

- 🛡️ **Real-time Status Monitoring**: Live status indicator showing whether the .onion submission portal is online/offline
- 🌐 **Bilingual Support**: Full English and Bengali language support
- 🎨 **Dark Theme UI**: Professional dark theme design with responsive layout
- 🔄 **Auto-refresh**: Automatic status checks every 30 seconds
- 📱 **Responsive Design**: Mobile-friendly interface
- 🔐 **Multiple Backend Options**: Node.js, Python, or static fallback implementations
- ⚡ **Rate Limiting**: Built-in protection against API abuse
- 💾 **Status Caching**: Reduces load on Tor network with intelligent caching

## 📁 Project Structure

```
/
├── index.html                    # Homepage
├── submit.html                   # Submission page with status indicator
├── css/
│   └── style.css                # Dark theme styling
├── js/
│   ├── config.js                # Configuration (copy from config.example.js)
│   └── status-checker.js        # Status checking logic
├── backend-examples/
│   ├── nodejs/                  # Node.js/Express backend
│   │   ├── server.js
│   │   ├── package.json
│   │   └── README.md
│   ├── python/                  # Python/Flask backend
│   │   ├── status_checker.py
│   │   ├── requirements.txt
│   │   └── README.md
│   └── static-fallback/         # Static JSON approach
│       ├── status.json
│       └── README.md
├── config.example.js            # Configuration template
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/celestryon/achilleus.git
cd achilleus

# Copy and configure the config file
cp config.example.js js/config.js
```

### 2. Edit Configuration

Open `js/config.js` and update the following:

```javascript
const CONFIG = {
    onionUrl: 'your-actual-domain.onion/submit',  // Your .onion URL
    statusApiEndpoint: '/api/status',              // Your status API endpoint
    checkInterval: 30000,                          // 30 seconds
    enableStatusCheck: true,
    currentLanguage: 'en'                          // 'en' or 'bn'
};
```

### 3. Choose Your Backend

You have three options for status checking:

#### Option A: Node.js Backend (Recommended)

```bash
cd backend-examples/nodejs
npm install

# Set your .onion URL
export ONION_URL="http://your-domain.onion"

# Start the server
npm start
```

The API will be available at `http://localhost:3000/api/status`

See [backend-examples/nodejs/README.md](backend-examples/nodejs/README.md) for details.

#### Option B: Python/Flask Backend

```bash
cd backend-examples/python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set your .onion URL
export ONION_URL="http://your-domain.onion"

# Start the server
python status_checker.py
```

The API will be available at `http://localhost:5000/api/status`

See [backend-examples/python/README.md](backend-examples/python/README.md) for details.

#### Option C: Static Fallback (GitHub Pages, Netlify, etc.)

For static hosting without backend:

1. Use `backend-examples/static-fallback/status.json`
2. Set up a cron job to update the JSON file (see README in that folder)
3. Configure `js/config.js` to use `/status.json` as the endpoint

See [backend-examples/static-fallback/README.md](backend-examples/static-fallback/README.md) for details.

### 4. Deploy the Website

#### Simple HTTP Server (Testing)
```bash
# Python 3
python3 -m http.server 8000

# Node.js (requires http-server: npm install -g http-server)
http-server -p 8000
```

Visit: `http://localhost:8000`

#### Production Deployment

**Nginx:**
```nginx
server {
    listen 80;
    server_name banglaleaks.example.com;
    root /var/www/banglaleaks;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Proxy to backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Apache:**
```apache
<VirtualHost *:80>
    ServerName banglaleaks.example.com
    DocumentRoot /var/www/banglaleaks

    <Directory /var/www/banglaleaks>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Proxy to backend API
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
</VirtualHost>
```

## 🔧 Configuration Options

### Main Configuration (`js/config.js`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onionUrl` | string | `'your-domain-here.onion/submit'` | Your .onion submission portal URL |
| `statusApiEndpoint` | string | `'/api/status'` | Status API endpoint (backend or static JSON) |
| `checkInterval` | number | `30000` | Status check interval in milliseconds |
| `enableStatusCheck` | boolean | `true` | Enable/disable automatic status checking |
| `currentLanguage` | string | `'en'` | Current language ('en' or 'bn') |

### Status API Response Format

Your backend should return JSON in this format:

```json
{
  "status": "online",
  "timestamp": "2024-10-29T22:30:00.000Z",
  "cached": false
}
```

- `status`: Either `"online"` or `"offline"`
- `timestamp`: ISO 8601 timestamp
- `cached`: Whether the result is from cache (optional)

## 🎨 Status Indicator States

The status indicator has three visual states:

### 🟢 ONLINE
- **Display**: Green dot + "ONLINE" text
- **Message**: "Submission portal is online and accepting leaks"
- **Meaning**: The .onion portal is reachable and functioning

### 🔴 OFFLINE
- **Display**: Red dot + "OFFLINE" text
- **Message**: "Submission portal is temporarily offline. Please try again later."
- **Meaning**: The .onion portal is unreachable or not responding

### 🟡 CHECKING...
- **Display**: Pulsing orange dot + "CHECKING..." text
- **Message**: "Checking submission portal status..."
- **Meaning**: Currently checking the portal status

## 🌍 Bilingual Support

The system supports both English and Bengali:

### English Messages
- **ONLINE**: "Submission portal is online and accepting leaks"
- **OFFLINE**: "Submission portal is temporarily offline. Please try again later."
- **CHECKING**: "Checking submission portal status..."

### Bengali Messages (বাংলা)
- **ONLINE**: "সাবমিশন পোর্টাল অনলাইন এবং লিক গ্রহণ করছে"
- **OFFLINE**: "সাবমিশন পোর্টাল সাময়িকভাবে অফলাইন। অনুগ্রহ করে পরে আবার চেষ্টা করুন।"
- **CHECKING**: "সাবমিশন পোর্টাল স্ট্যাটাস চেক করা হচ্ছে..."

To change language, update `currentLanguage` in `js/config.js` or use the API:

```javascript
// Change to Bengali
window.statusChecker.changeLanguage('bn');

// Change to English
window.statusChecker.changeLanguage('en');
```

## 🔐 Security Considerations

### Backend Security

1. **Rate Limiting**: All backend examples include rate limiting (10 requests/min per IP)
2. **CORS Configuration**: Set `CORS_ORIGIN` to your specific domain in production
3. **No Sensitive Data**: Never expose Tor proxy details or server information
4. **Timeout Handling**: 10-15 second timeout for Tor requests prevents hanging
5. **HTTPS/TLS**: Always use HTTPS in production (use reverse proxy like Nginx)

### Tor Setup Security

1. **Isolate Tor**: Run Tor service on a separate server if possible
2. **Firewall Rules**: Only expose necessary ports (not Tor's SOCKS proxy)
3. **Monitor Tor**: Set up monitoring for Tor service availability
4. **Update Regularly**: Keep Tor and all dependencies updated

### Frontend Security

1. **Content Security Policy**: Implement CSP headers
2. **No Inline Scripts**: All JavaScript is in external files
3. **XSS Protection**: Proper escaping of user-visible content
4. **HTTPS Only**: Serve website over HTTPS with HSTS enabled

## 📊 Deployment Scenarios

### Scenario 1: Full Stack (Recommended)

**Setup**: Website + Node.js/Python backend + Tor proxy

**Pros**:
- Real-time status checking
- Most accurate
- Best user experience

**Cons**:
- Requires backend server
- More complex to set up

### Scenario 2: Static + External API

**Setup**: Static website + separate status API server

**Pros**:
- Separate concerns
- Can use CDN for website
- Scale independently

**Cons**:
- Two services to maintain
- CORS configuration needed

### Scenario 3: Static Only

**Setup**: Static website + status.json updated via cron

**Pros**:
- No backend needed
- Works on GitHub Pages, Netlify
- Simple deployment

**Cons**:
- Not real-time
- Less accurate
- Requires external update mechanism

## 🛠️ Advanced Features

### Manual Status Refresh

Users can manually trigger a status check:

```javascript
// Programmatically trigger a check
window.statusChecker.checkStatus();
```

The refresh button in the UI automatically does this.

### Pause/Resume Monitoring

The status checker automatically pauses when the tab is hidden and resumes when visible:

```javascript
// Manually stop monitoring
window.statusChecker.stopMonitoring();

// Manually start monitoring
window.statusChecker.startMonitoring();
```

### Copy .onion URL

Users can copy the .onion URL to clipboard with the copy button. This uses the modern Clipboard API with fallback to text selection.

## 🧪 Testing

### Test Backend Locally

```bash
# Test Node.js backend
curl http://localhost:3000/api/status

# Test Python backend
curl http://localhost:5000/api/status
```

Expected response:
```json
{
  "status": "online",
  "timestamp": "2024-10-29T22:30:00.000Z",
  "cached": false
}
```

### Test Tor Connection

```bash
# Check if Tor is running
sudo systemctl status tor

# Test Tor SOCKS proxy
curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org

# Test your .onion site
curl --socks5-hostname 127.0.0.1:9050 http://your-domain.onion
```

### Test Frontend

1. Open `submit.html` in a browser
2. Open browser console (F12)
3. Check for JavaScript errors
4. Verify status indicator updates
5. Test copy button functionality

## 🐛 Troubleshooting

### Status Always Shows "OFFLINE"

1. **Check Tor Service**:
   ```bash
   sudo systemctl status tor
   netstat -tuln | grep 9050
   ```

2. **Verify .onion URL**: Test manually with curl
   ```bash
   curl --socks5-hostname 127.0.0.1:9050 http://your-domain.onion
   ```

3. **Check Backend Logs**: Look for error messages
   ```bash
   # Node.js
   npm start
   
   # Python
   python status_checker.py
   ```

4. **CORS Issues**: Check browser console for CORS errors

### Status Not Updating

1. **Check API Endpoint**: Verify `statusApiEndpoint` in config.js
2. **Browser Cache**: Clear cache or use incognito mode
3. **Network Issues**: Check browser network tab (F12)
4. **JavaScript Errors**: Check browser console for errors

### Rate Limit Errors

1. **Increase Limit**: Modify `RATE_LIMIT_MAX_REQUESTS` in backend
2. **Wait**: Rate limits reset after 1 minute
3. **Check IP**: Ensure reverse proxy passes correct client IP

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check backend-specific READMEs for detailed troubleshooting
- Review the configuration examples

## 🙏 Acknowledgments

- Built with modern web standards
- Tor Project for anonymity infrastructure
- Open source community

---

**⚠️ Important Security Notice**: This is a template/example implementation. Before using in production:
1. Replace all placeholder URLs with actual domains
2. Implement proper security measures
3. Use HTTPS everywhere
4. Regularly update dependencies
5. Monitor for security vulnerabilities
6. Consider professional security audit
