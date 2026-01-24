# 🚀 Quick Start Script

Write-Host "🔥 NEBULA E-Commerce Bot - Quick Start" -ForegroundColor Cyan
Write-Host ""

# Check if in backend directory
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the backend directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Green
npm install

Write-Host ""
Write-Host "🗄️  Generating Prisma Client..." -ForegroundColor Green
npm run db:generate

Write-Host ""
Write-Host "📋 Running database migrations..." -ForegroundColor Green
npm run db:migrate

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your .env file with TELEGRAM_BOT_TOKEN" -ForegroundColor White
Write-Host "2. Set ADMIN_USERNAME and ADMIN_PASSWORD for dashboard" -ForegroundColor White
Write-Host "3. Run 'npm start' to start the server" -ForegroundColor White
Write-Host ""
Write-Host "🤖 Bot Commands:" -ForegroundColor Cyan
Write-Host "   /shop - Browse products" -ForegroundColor White
Write-Host "   /cart - View cart" -ForegroundColor White
Write-Host ""
Write-Host "💻 Dashboard:" -ForegroundColor Cyan
Write-Host "   http://localhost:8000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Ready to start? Run: npm start" -ForegroundColor Green
