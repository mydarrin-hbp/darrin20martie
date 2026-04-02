$env:PORT = "3002"
$env:HOSTNAME = "127.0.0.1"
$env:NODE_ENV = "production"

Write-Host "Starting frontend standalone server on http://127.0.0.1:3002" -ForegroundColor Cyan
node .next\standalone\server.js
