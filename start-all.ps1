# Start All Script - Frontend + Backend mit pnpm
Write-Host "🚀 Starting Nebula Shop (Frontend + Backend)..." -ForegroundColor Cyan
Write-Host ""

# Prüfe ob pnpm installiert ist
try {
    $pnpmVersion = pnpm --version 2>$null
    Write-Host "✅ pnpm gefunden (Version: $pnpmVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm nicht gefunden! Installiere es mit: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

# Frontend .env prüfen/erstellen
if (-not (Test-Path ".env")) {
    Write-Host "📝 Erstelle Frontend .env..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:8000/api" | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Frontend .env erstellt!" -ForegroundColor Green
}

# Backend .env prüfen/erstellen
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Erstelle Backend .env..." -ForegroundColor Yellow
    
    # Standard PostgreSQL URL (Benutzer muss anpassen)
    $envContent = @'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nebula_shop?schema=public"
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
CORS_ORIGIN=http://localhost:3000
'@
    $envContent | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "✅ Backend .env erstellt!" -ForegroundColor Green
    Write-Host "⚠️  WICHTIG: Passe DATABASE_URL in backend\.env an!" -ForegroundColor Yellow
    Write-Host "   Format: postgresql://username:password@localhost:5432/nebula_shop" -ForegroundColor Yellow
    Write-Host ""
}

# Frontend Dependencies installieren
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installiere Frontend Dependencies mit pnpm..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend Installation fehlgeschlagen!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend Dependencies installiert!" -ForegroundColor Green
}

# Backend Dependencies installieren
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Installiere Backend Dependencies mit pnpm..." -ForegroundColor Yellow
    Push-Location backend
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend Installation fehlgeschlagen!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✅ Backend Dependencies installiert!" -ForegroundColor Green
}

# Prisma Client generieren
Write-Host "🔧 Generiere Prisma Client..." -ForegroundColor Yellow
Push-Location backend
pnpm exec prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma Generate fehlgeschlagen!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Prisma Client generiert!" -ForegroundColor Green

# Database Migrationen (nur wenn noch nicht vorhanden)
Write-Host "🗄️  Prüfe Database Migrationen..." -ForegroundColor Yellow
Push-Location backend
pnpm exec prisma migrate deploy 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Versuche dev migration..." -ForegroundColor Yellow
    pnpm exec prisma migrate dev --name init 2>&1 | Out-Null
}
Pop-Location
Write-Host "✅ Database Migrationen abgeschlossen!" -ForegroundColor Green

# Database Seeding
Write-Host "🌱 Seede Database..." -ForegroundColor Yellow
Push-Location backend
$seedOutput = pnpm run db:seed 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database gesät!" -ForegroundColor Green
} else {
    if ($seedOutput -match "already exists" -or $seedOutput -match "Unique constraint") {
        Write-Host "⚠️  Daten bereits vorhanden (überspringe Seeding)" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Seeding Fehler (kann ignoriert werden wenn DB bereits gesät ist)" -ForegroundColor Yellow
        Write-Host "   Fehler: $($seedOutput -join ' ')" -ForegroundColor Gray
    }
}
Pop-Location

Write-Host ""
Write-Host "✅ Alles bereit! Starte Frontend und Backend..." -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Drücke Ctrl+C um beide zu stoppen" -ForegroundColor Yellow
Write-Host ""

# Starte Backend und Frontend in separaten PowerShell-Fenstern
$scriptPath = $PSScriptRoot
if (-not $scriptPath) { $scriptPath = Get-Location }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; pnpm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; pnpm run dev" -WindowStyle Normal

Write-Host "✅ Frontend und Backend gestartet in separaten Fenstern!" -ForegroundColor Green
