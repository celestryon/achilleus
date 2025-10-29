# BanglaLeaks Status Checker - Static Fallback

This is a static JSON file approach for checking .onion portal status. This method is suitable for static hosting environments where you cannot run a backend server (e.g., GitHub Pages, Netlify, Vercel).

## How It Works

Instead of checking the .onion status in real-time, this approach uses a static `status.json` file that you update manually or via a cron job/scheduled task.

The frontend JavaScript will fetch this JSON file to display the portal status.

## Setup

1. Copy `status.json` to your web server's root directory or a publicly accessible location.

2. Update your `config.js` to point to this file:
   ```javascript
   const CONFIG = {
       statusApiEndpoint: '/status.json',  // or full URL
       // ... other config
   };
   ```

3. Set up a method to update the status regularly (see options below).

## Status File Format

The `status.json` file should contain:

```json
{
  "status": "online",
  "timestamp": "2024-10-29T22:30:00.000Z",
  "cached": false
}
```

- `status`: Either `"online"` or `"offline"`
- `timestamp`: ISO 8601 timestamp of when this status was last updated
- `cached`: Set to `false` for manual updates

## Updating Status

### Option 1: Manual Update via Script

Create a simple script to check status and update the JSON file.

**Bash Script (check-status.sh):**
```bash
#!/bin/bash

# Configuration
ONION_URL="http://your-domain.onion"
STATUS_FILE="/path/to/status.json"

# Check status through Tor
if curl --socks5-hostname 127.0.0.1:9050 \
        --max-time 10 \
        --silent \
        --head \
        "$ONION_URL" > /dev/null 2>&1; then
    STATUS="online"
else
    STATUS="offline"
fi

# Update JSON file
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
cat > "$STATUS_FILE" <<EOF
{
  "status": "$STATUS",
  "timestamp": "$TIMESTAMP",
  "cached": false
}
EOF

echo "Status updated: $STATUS at $TIMESTAMP"
```

Make it executable:
```bash
chmod +x check-status.sh
```

### Option 2: Cron Job (Linux/macOS)

Set up a cron job to run the script every 5 minutes:

```bash
crontab -e
```

Add this line:
```cron
*/5 * * * * /path/to/check-status.sh >> /var/log/banglaleaks-status.log 2>&1
```

### Option 3: Windows Task Scheduler

**PowerShell Script (check-status.ps1):**
```powershell
$ONION_URL = "http://your-domain.onion"
$STATUS_FILE = "C:\path\to\status.json"

# Check status through Tor (requires curl.exe on Windows)
$result = & curl.exe --socks5-hostname 127.0.0.1:9050 `
                     --max-time 10 `
                     --silent `
                     --head `
                     $ONION_URL 2>&1

if ($LASTEXITCODE -eq 0) {
    $status = "online"
} else {
    $status = "offline"
}

# Update JSON file
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.000Z")
$json = @{
    status = $status
    timestamp = $timestamp
    cached = $false
} | ConvertTo-Json

Set-Content -Path $STATUS_FILE -Value $json

Write-Host "Status updated: $status at $timestamp"
```

Create a scheduled task:
```powershell
# Run every 5 minutes
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' `
    -Argument '-File C:\path\to\check-status.ps1'
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -Action $action -Trigger $trigger `
    -TaskName "BanglaLeaks Status Check" `
    -Description "Check .onion portal status every 5 minutes"
```

### Option 4: GitHub Actions (for GitHub Pages)

Create `.github/workflows/check-status.yml`:

```yaml
name: Check .onion Status

on:
  schedule:
    # Run every 5 minutes
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  check-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Tor
        run: |
          sudo apt-get update
          sudo apt-get install -y tor
          sudo systemctl start tor
          sleep 10
      
      - name: Check Status
        run: |
          if curl --socks5-hostname 127.0.0.1:9050 \
                  --max-time 10 \
                  --silent \
                  --head \
                  "${{ secrets.ONION_URL }}" > /dev/null 2>&1; then
            STATUS="online"
          else
            STATUS="offline"
          fi
          
          TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
          
          cat > status.json <<EOF
          {
            "status": "$STATUS",
            "timestamp": "$TIMESTAMP",
            "cached": false
          }
          EOF
          
          echo "Status: $STATUS"
      
      - name: Commit and Push
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add status.json
          git diff --quiet && git diff --staged --quiet || git commit -m "Update status: $(date)"
          git push
```

**Note:** Add your .onion URL as a secret in GitHub repository settings (Settings → Secrets → Actions → New repository secret).

### Option 5: Netlify/Vercel Build Hook

For platforms like Netlify or Vercel, you can trigger rebuilds with updated status:

1. Set up a build hook in your hosting platform
2. Create a serverless function or external service to check status
3. Trigger the build hook when status changes

## CORS Considerations

For static hosting, ensure your web server sends proper CORS headers for `status.json`:

**Nginx:**
```nginx
location /status.json {
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

**Apache (.htaccess):**
```apache
<Files "status.json">
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>
```

## Advantages

- ✅ Works with static hosting (no backend required)
- ✅ Simple and lightweight
- ✅ No additional server resources needed
- ✅ Easy to cache and distribute via CDN

## Disadvantages

- ❌ Not real-time (depends on update frequency)
- ❌ Requires external process to update status
- ❌ Less accurate than real-time checking
- ❌ Can be outdated between updates

## Recommendations

- Update status every 2-5 minutes for good balance
- Consider using real-time backend for production if possible
- Monitor your update script to ensure it's running
- Set up alerts if status file isn't being updated

## Troubleshooting

### Status not updating
- Check if your cron job/scheduled task is running
- Verify Tor is installed and running
- Check script permissions and paths
- Look at script logs for errors

### Frontend shows old status
- Check browser caching (disable cache in config.js)
- Verify CORS headers are set correctly
- Check timestamp in status.json file

## License

MIT License - See LICENSE file for details
