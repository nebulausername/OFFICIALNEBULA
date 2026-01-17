# Deployment Guide - Nebula Shop

## VPS Setup

### Voraussetzungen
- Ubuntu 20.04+ oder Debian 11+
- Root-Zugriff oder sudo-Berechtigung
- Domain (optional, z.B. nebula.supply)

### 1. System Updates
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Node.js Installation
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 3. PostgreSQL Installation
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database erstellen
sudo -u postgres psql
CREATE DATABASE nebula_shop;
CREATE USER nebula_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nebula_shop TO nebula_user;
\q
```

### 4. Nginx Installation & Konfiguration
```bash
sudo apt install -y nginx

# Nginx Config erstellen
sudo nano /etc/nginx/sites-available/nebula-shop
```

Nginx Konfiguration:
```nginx
server {
    listen 80;
    server_name nebula.supply www.nebula.supply;

    # Frontend
    location / {
        root /var/www/nebula-shop/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # File Uploads
    location /uploads {
        alias /var/www/nebula-shop/backend/uploads;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nebula-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL mit Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nebula.supply -d www.nebula.supply
```

### 6. PM2 Installation (Process Manager)
```bash
sudo npm install -g pm2
```

### 7. Application Deployment

#### Frontend Build
```bash
cd /var/www/nebula-shop/frontend
npm install
npm run build
```

#### Backend Setup
```bash
cd /var/www/nebula-shop/backend
npm install
cp .env.example .env
# .env bearbeiten mit echten Werten
npx prisma generate
npx prisma migrate deploy
```

#### PM2 Start
```bash
cd /var/www/nebula-shop/backend
pm2 start src/server.js --name nebula-backend
pm2 save
pm2 startup
```

### 8. Firewall Konfiguration
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9. Backup Script
```bash
#!/bin/bash
# /var/www/nebula-shop/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/nebula-shop"
mkdir -p $BACKUP_DIR

# Database Backup
pg_dump -U nebula_user nebula_shop > $BACKUP_DIR/db_$DATE.sql

# Files Backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/nebula-shop/backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
chmod +x /var/www/nebula-shop/backup.sh
# Crontab: 0 2 * * * /var/www/nebula-shop/backup.sh
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://nebula.supply/api
```

### Backend (.env)
```
PORT=8000
NODE_ENV=production
DATABASE_URL=postgresql://nebula_user:password@localhost:5432/nebula_shop
JWT_SECRET=your-super-secret-production-key
CORS_ORIGIN=https://nebula.supply
# ... weitere Variablen
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs nebula-backend
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Updates

### Frontend Update
```bash
cd /var/www/nebula-shop/frontend
git pull
npm install
npm run build
sudo systemctl reload nginx
```

### Backend Update
```bash
cd /var/www/nebula-shop/backend
git pull
npm install
npx prisma migrate deploy
pm2 restart nebula-backend
```

## Troubleshooting

### Backend startet nicht
```bash
pm2 logs nebula-backend
# Prüfe .env Datei
# Prüfe Database Connection
```

### Database Connection Error
```bash
sudo -u postgres psql -c "SELECT version();"
# Prüfe DATABASE_URL in .env
```

### Nginx 502 Error
```bash
# Prüfe ob Backend läuft
pm2 status
# Prüfe Backend Logs
pm2 logs nebula-backend
```

