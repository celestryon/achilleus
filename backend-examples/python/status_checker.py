"""
BanglaLeaks Status Checker - Python/Flask Backend

This Flask application provides a REST API endpoint to check the status of
the .onion submission portal through the Tor network.

Prerequisites:
- Python 3.8+ installed
- Tor service running (default: localhost:9050)
- Dependencies installed: pip install -r requirements.txt

Usage:
python status_checker.py
"""

import os
import time
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from collections import defaultdict
from threading import Lock

app = Flask(__name__)

# Configuration
CONFIG = {
    'onion_url': os.getenv('ONION_URL', 'http://your-domain-here.onion'),
    'tor_proxy': {
        'http': os.getenv('TOR_PROXY', 'socks5h://127.0.0.1:9050'),
        'https': os.getenv('TOR_PROXY', 'socks5h://127.0.0.1:9050')
    },
    'port': int(os.getenv('PORT', 5000)),
    'timeout': 10,  # 10 seconds
    'cors_origin': os.getenv('CORS_ORIGIN', '*')
}

# Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": CONFIG['cors_origin'],
        "methods": ["GET"],
        "allow_headers": ["Content-Type"]
    }
})

# Rate limiting (simple in-memory implementation)
rate_limit_data = defaultdict(lambda: {'count': 0, 'reset_time': 0})
rate_limit_lock = Lock()
RATE_LIMIT_WINDOW = 60  # 1 minute
RATE_LIMIT_MAX_REQUESTS = 10

def check_rate_limit(client_ip):
    """Check if client has exceeded rate limit"""
    now = time.time()
    
    with rate_limit_lock:
        client_data = rate_limit_data[client_ip]
        
        # Reset window if expired
        if now > client_data['reset_time']:
            client_data['count'] = 1
            client_data['reset_time'] = now + RATE_LIMIT_WINDOW
            return True
        
        # Check if limit exceeded
        if client_data['count'] >= RATE_LIMIT_MAX_REQUESTS:
            return False
        
        client_data['count'] += 1
        return True

# Cache for status (to reduce load on Tor network)
status_cache = {
    'status': 'unknown',
    'last_check': 0,
    'cache_duration': 30  # 30 seconds
}
cache_lock = Lock()

def check_onion_status():
    """Check .onion portal status through Tor"""
    now = time.time()
    
    # Return cached status if fresh
    with cache_lock:
        if status_cache['last_check'] and (now - status_cache['last_check']) < status_cache['cache_duration']:
            return status_cache['status'], True
    
    try:
        print(f"Checking {CONFIG['onion_url']} through Tor...")
        
        # Use HEAD request to minimize bandwidth
        response = requests.head(
            CONFIG['onion_url'],
            proxies=CONFIG['tor_proxy'],
            timeout=CONFIG['timeout'],
            headers={'User-Agent': 'BanglaLeaks-StatusChecker/1.0'}
        )
        
        status = 'online' if response.ok else 'offline'
        
        # Update cache
        with cache_lock:
            status_cache['status'] = status
            status_cache['last_check'] = now
        
        print(f"Status: {status}")
        return status, False
        
    except requests.exceptions.RequestException as e:
        print(f"Status check failed: {str(e)}")
        
        # Update cache with offline status
        with cache_lock:
            status_cache['status'] = 'offline'
            status_cache['last_check'] = now
        
        return 'offline', False

@app.route('/api/status', methods=['GET'])
def api_status():
    """API endpoint: GET /api/status"""
    client_ip = request.remote_addr
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        with rate_limit_lock:
            retry_after = int(rate_limit_data[client_ip]['reset_time'] - time.time())
        
        return jsonify({
            'error': 'Too many requests',
            'retryAfter': max(retry_after, 0)
        }), 429
    
    try:
        status, from_cache = check_onion_status()
        
        return jsonify({
            'status': status,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'cached': from_cache
        })
        
    except Exception as e:
        print(f"Error in /api/status: {str(e)}")
        
        return jsonify({
            'status': 'offline',
            'error': 'Internal server error',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'BanglaLeaks Status Checker',
        'version': '1.0.0',
        'uptime': time.process_time()
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'service': 'BanglaLeaks Status Checker API',
        'version': '1.0.0',
        'endpoints': {
            '/api/status': 'Check .onion portal status',
            '/health': 'Health check'
        }
    })

def cleanup_rate_limits():
    """Clean up expired rate limit entries"""
    now = time.time()
    with rate_limit_lock:
        expired = [ip for ip, data in rate_limit_data.items() if now > data['reset_time']]
        for ip in expired:
            del rate_limit_data[ip]

# Periodic cleanup (called every minute)
from threading import Timer

def periodic_cleanup():
    cleanup_rate_limits()
    Timer(60, periodic_cleanup).start()

if __name__ == '__main__':
    print(f"BanglaLeaks Status Checker starting on port {CONFIG['port']}")
    print(f"Monitoring: {CONFIG['onion_url']}")
    print(f"Tor proxy: {CONFIG['tor_proxy']['http']}")
    print(f"CORS origin: {CONFIG['cors_origin']}")
    
    # Start periodic cleanup
    Timer(60, periodic_cleanup).start()
    
    # Start Flask app
    app.run(
        host='0.0.0.0',
        port=CONFIG['port'],
        debug=False
    )
