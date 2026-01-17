# Backend Start Script
Write-Host "🚀 Starting Nebula Shop Backend..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✅ .env created. Please configure DATABASE_URL!" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exists
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
Set-Location backend
npx prisma generate
Set-Location ..

Write-Host "✅ Backend ready! Starting server..." -ForegroundColor Green
Write-Host "📡 Backend will run on http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Set-Location backend
npm run dev

