# Frontend Start Script
Write-Host "🎨 Starting Nebula Shop Frontend..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:8000/api
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ .env created!" -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "✅ Frontend ready! Starting dev server..." -ForegroundColor Green
Write-Host "🌐 Frontend will run on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
npm run dev

