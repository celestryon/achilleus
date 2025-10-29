# BanglaLeaks Status Checker - Node.js Backend

This is a Node.js backend service that checks the status of your .onion submission portal through the Tor network and exposes it via a REST API.

## Prerequisites

1. **Node.js 16+** installed on your system
2. **Tor service** running on your system (default port: 9050)
3. Your **.onion domain** configured

## Installation

1. Navigate to this directory:
   ```bash
   cd backend-examples/nodejs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your .onion URL (choose one method):
   
   **Method A: Environment variables**
   ```bash
   export ONION_URL="http://your-actual-domain.onion"
   export PORT=3000
   export CORS_ORIGIN="*"
   ```
   
   **Method B: Edit server.js**
   Update the `CONFIG` object at the top of `server.js`:
   ```javascript
   const CONFIG = {
       onionUrl: 'http://your-actual-domain.onion',
       torProxy: 'socks5h://127.0.0.1:9050',
       port: 3000,
       timeout: 10000,
       corsOrigin: '*'
   };
   ```

## Running the Service

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### GET /api/status
Check the status of the .onion portal.

**Response:**
```json
{
  "status": "online",
  "timestamp": "2024-10-29T22:30:00.000Z",
  "cached": false
}
```

- `status`: Either "online" or "offline"
- `timestamp`: ISO timestamp of the check
- `cached`: Whether this result was from cache (to reduce Tor load)

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "BanglaLeaks Status Checker",
  "version": "1.0.0",
  "uptime": 123.45
}
```

## Features

- ✅ **Tor Integration**: Checks .onion sites through SOCKS5 proxy
- ✅ **Rate Limiting**: 10 requests per minute per IP
- ✅ **Caching**: 30-second cache to reduce Tor network load
- ✅ **CORS Support**: Configurable CORS headers
- ✅ **Timeout Handling**: 10-second timeout for Tor requests
- ✅ **Error Handling**: Graceful error handling and logging

## Configuration Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `ONION_URL` | `http://your-domain-here.onion` | Your .onion portal URL |
| `TOR_PROXY` | `socks5h://127.0.0.1:9050` | Tor SOCKS5 proxy address |
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

## Tor Setup

### Install Tor

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tor
sudo systemctl start tor
sudo systemctl enable tor
```

**macOS:**
```bash
brew install tor
brew services start tor
```

### Verify Tor is Running
```bash
curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org
```

## Deployment

### Using PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name banglaleaks-status
pm2 save
pm2 startup
```

### Using systemd (Linux)
Create `/etc/systemd/system/banglaleaks-status.service`:
```ini
[Unit]
Description=BanglaLeaks Status Checker
After=network.target tor.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend-examples/nodejs
Environment="ONION_URL=http://your-domain.onion"
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable banglaleaks-status
sudo systemctl start banglaleaks-status
```

### Using Docker
Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t banglaleaks-status .
docker run -d -p 3000:3000 \
  -e ONION_URL="http://your-domain.onion" \
  --name banglaleaks-status \
  banglaleaks-status
```

## Security Considerations

1. **Rate Limiting**: Built-in rate limiting prevents abuse (10 req/min per IP)
2. **CORS**: Configure `CORS_ORIGIN` to your specific domain in production
3. **No Sensitive Data**: Never expose Tor proxy details in API responses
4. **HTTPS**: Use HTTPS/TLS for the API in production (use nginx/caddy as reverse proxy)
5. **Firewall**: Only expose necessary ports (3000 for API, not 9050 for Tor)

## Troubleshooting

### "Connection refused" error
- Ensure Tor is running: `sudo systemctl status tor`
- Check Tor is listening on port 9050: `netstat -tuln | grep 9050`

### Always shows "offline"
- Verify your .onion URL is correct and accessible
- Test Tor connection: `curl --socks5-hostname 127.0.0.1:9050 http://your-domain.onion`
- Check server logs for error messages

### Rate limiting issues
- Increase `RATE_LIMIT_MAX_REQUESTS` in server.js if needed
- Clear rate limit cache by restarting the server

## License

MIT License - See LICENSE file for details
