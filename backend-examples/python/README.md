# BanglaLeaks Status Checker - Python/Flask Backend

This is a Python Flask backend service that checks the status of your .onion submission portal through the Tor network and exposes it via a REST API.

## Prerequisites

1. **Python 3.8+** installed on your system
2. **Tor service** running on your system (default port: 9050)
3. Your **.onion domain** configured

## Installation

1. Navigate to this directory:
   ```bash
   cd backend-examples/python
   ```

2. Create a virtual environment (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your .onion URL (choose one method):
   
   **Method A: Environment variables**
   ```bash
   export ONION_URL="http://your-actual-domain.onion"
   export PORT=5000
   export CORS_ORIGIN="*"
   ```
   
   **Method B: Edit status_checker.py**
   Update the `CONFIG` dictionary at the top of `status_checker.py`:
   ```python
   CONFIG = {
       'onion_url': 'http://your-actual-domain.onion',
       'tor_proxy': {
           'http': 'socks5h://127.0.0.1:9050',
           'https': 'socks5h://127.0.0.1:9050'
       },
       'port': 5000,
       'timeout': 10,
       'cors_origin': '*'
   }
   ```

## Running the Service

### Development Mode
```bash
python status_checker.py
```

### Production Mode (with Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 status_checker:app
```

The server will start on `http://localhost:5000` by default.

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
| `PORT` | `5000` | Server port |
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

### Using systemd (Linux)
Create `/etc/systemd/system/banglaleaks-status.service`:
```ini
[Unit]
Description=BanglaLeaks Status Checker
After=network.target tor.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend-examples/python
Environment="ONION_URL=http://your-domain.onion"
Environment="PATH=/path/to/venv/bin:/usr/bin"
ExecStart=/path/to/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 status_checker:app
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
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY status_checker.py ./
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "status_checker:app"]
```

Build and run:
```bash
docker build -t banglaleaks-status .
docker run -d -p 5000:5000 \
  -e ONION_URL="http://your-domain.onion" \
  --name banglaleaks-status \
  banglaleaks-status
```

### Using Nginx as Reverse Proxy
Add to your Nginx configuration:
```nginx
location /api/status {
    proxy_pass http://127.0.0.1:5000/api/status;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## Security Considerations

1. **Rate Limiting**: Built-in rate limiting prevents abuse (10 req/min per IP)
2. **CORS**: Configure `CORS_ORIGIN` to your specific domain in production
3. **No Sensitive Data**: Never expose Tor proxy details in API responses
4. **HTTPS**: Use HTTPS/TLS for the API in production (use nginx/caddy as reverse proxy)
5. **Firewall**: Only expose necessary ports (5000 for API, not 9050 for Tor)

## Troubleshooting

### "Connection refused" error
- Ensure Tor is running: `sudo systemctl status tor`
- Check Tor is listening on port 9050: `netstat -tuln | grep 9050`

### Always shows "offline"
- Verify your .onion URL is correct and accessible
- Test Tor connection: `curl --socks5-hostname 127.0.0.1:9050 http://your-domain.onion`
- Check application logs for error messages

### Import errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check you're using the correct Python version: `python --version`

### Rate limiting issues
- Increase `RATE_LIMIT_MAX_REQUESTS` in status_checker.py if needed
- Clear rate limit cache by restarting the application

## Performance Tips

- Use Gunicorn with multiple workers for production
- Consider using Redis for shared cache/rate limiting across workers
- Monitor Tor connection health
- Set up proper logging and monitoring

## License

MIT License - See LICENSE file for details
