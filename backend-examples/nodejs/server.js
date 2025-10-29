/**
 * BanglaLeaks Status Checker - Node.js Backend
 * 
 * This server provides a REST API endpoint to check the status of
 * the .onion submission portal through the Tor network.
 * 
 * Prerequisites:
 * - Node.js 16+ installed
 * - Tor service running (default: localhost:9050)
 * - Dependencies installed: npm install
 * 
 * Usage:
 * node server.js
 */

const express = require('express');
const cors = require('cors');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fetch = require('node-fetch');

const app = express();

// Configuration
const CONFIG = {
    onionUrl: process.env.ONION_URL || 'http://your-domain-here.onion',
    torProxy: process.env.TOR_PROXY || 'socks5h://127.0.0.1:9050',
    port: process.env.PORT || 3000,
    timeout: 10000, // 10 seconds
    corsOrigin: process.env.CORS_ORIGIN || '*'
};

// Middleware
app.use(cors({
    origin: CONFIG.corsOrigin,
    methods: ['GET'],
    credentials: false
}));

app.use(express.json());

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function rateLimit(req, res, next) {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientIp)) {
        rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const clientData = rateLimitMap.get(clientIp);
    
    if (now > clientData.resetTime) {
        // Reset window
        clientData.count = 1;
        clientData.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }
    
    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
    }
    
    clientData.count++;
    next();
}

// Cache for status (to reduce load on Tor network)
let statusCache = {
    status: 'unknown',
    lastCheck: 0,
    cacheDuration: 30000 // 30 seconds
};

/**
 * Check .onion portal status through Tor
 */
async function checkOnionStatus() {
    const now = Date.now();
    
    // Return cached status if fresh
    if (statusCache.lastCheck && (now - statusCache.lastCheck) < statusCache.cacheDuration) {
        return statusCache.status;
    }
    
    try {
        console.log(`Checking ${CONFIG.onionUrl} through Tor...`);
        
        const agent = new SocksProxyAgent(CONFIG.torProxy);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
        
        const response = await fetch(CONFIG.onionUrl, {
            agent,
            signal: controller.signal,
            method: 'HEAD', // Use HEAD to minimize bandwidth
            headers: {
                'User-Agent': 'BanglaLeaks-StatusChecker/1.0'
            }
        });
        
        clearTimeout(timeoutId);
        
        // Update cache
        statusCache.status = response.ok ? 'online' : 'offline';
        statusCache.lastCheck = now;
        
        console.log(`Status: ${statusCache.status}`);
        
        return statusCache.status;
        
    } catch (error) {
        console.error('Status check failed:', error.message);
        
        // Update cache with offline status
        statusCache.status = 'offline';
        statusCache.lastCheck = now;
        
        return 'offline';
    }
}

/**
 * API endpoint: GET /api/status
 */
app.get('/api/status', rateLimit, async (req, res) => {
    try {
        const status = await checkOnionStatus();
        
        res.json({
            status: status,
            timestamp: new Date().toISOString(),
            cached: (Date.now() - statusCache.lastCheck) < 5000 // Was it from cache?
        });
        
    } catch (error) {
        console.error('Error in /api/status:', error);
        
        res.status(500).json({
            status: 'offline',
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'BanglaLeaks Status Checker',
        version: '1.0.0',
        uptime: process.uptime()
    });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({
        service: 'BanglaLeaks Status Checker API',
        version: '1.0.0',
        endpoints: {
            '/api/status': 'Check .onion portal status',
            '/health': 'Health check'
        }
    });
});

// Clean up rate limit map periodically
setInterval(() => {
    const now = Date.now();
    for (const [clientIp, data] of rateLimitMap.entries()) {
        if (now > data.resetTime) {
            rateLimitMap.delete(clientIp);
        }
    }
}, 60000); // Clean up every minute

// Start server
app.listen(CONFIG.port, () => {
    console.log(`BanglaLeaks Status Checker running on port ${CONFIG.port}`);
    console.log(`Monitoring: ${CONFIG.onionUrl}`);
    console.log(`Tor proxy: ${CONFIG.torProxy}`);
    console.log(`CORS origin: ${CONFIG.corsOrigin}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});
