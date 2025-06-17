# 🏗️ Déploiement VPS - ForNap HelloAsso Proxy

## 🎯 Pourquoi le VPS est meilleur pour vous

✅ **Performance** - Pas de cold start, réponse instantanée  
✅ **Coût** - Fixe et prévisible  
✅ **Contrôle** - Vous maîtrisez tout  
✅ **Sécurité** - Vos clés API en sécurité  
✅ **Évolutivité** - Autres projets sur le même serveur  

## 🚀 Déploiement automatique

### 1. Préparation

```bash
# Sur votre machine locale
chmod +x deploy-vps.sh

# Copier les fichiers sur le VPS
scp -r server.js package.json deploy-vps.sh user@votre-vps:~/
```

### 2. Exécution sur le VPS

```bash
# Connexion SSH à votre VPS
ssh user@votre-vps

# Exécuter le script de déploiement
./deploy-vps.sh
```

## 🛠️ Configuration manuelle (si vous préférez)

### 1. Installation Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Installation PM2

```bash
sudo npm install -g pm2
```

### 3. Déploiement de l'app

```bash
# Créer le répertoire
sudo mkdir -p /var/www/fornap-proxy
sudo chown $USER:$USER /var/www/fornap-proxy
cd /var/www/fornap-proxy

# Copier vos fichiers
# server.js, package.json

# Installer les dépendances
npm install --production

# Démarrer avec PM2
pm2 start server.js --name "fornap-proxy"
pm2 save
pm2 startup
```

### 4. Configuration Nginx

```bash
sudo apt install nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/fornap-proxy
```

Contenu du fichier :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;  # Remplacez par votre domaine

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/fornap-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL avec Let's Encrypt (Recommandé)

```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Génération du certificat
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## ⚙️ Configuration finale

### 1. Mettre à jour member-signup.js

```javascript
// Dans le constructeur, remplacez :
this.proxyServerUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://votre-domaine.com'; // ⬅️ Votre vraie URL VPS
```

### 2. Tests

```bash
# Test du serveur
curl http://votre-domaine.com/api/test

# Test HelloAsso
curl http://votre-domaine.com/api/helloasso/test
```

## 🛡️ Sécurité & Maintenance

### Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Monitoring

```bash
# Statut de l'application
pm2 status

# Logs en temps réel
pm2 logs

# Redémarrage
pm2 restart fornap-proxy

# Monitoring système
htop
```

### Sauvegardes

```bash
# Backup de la configuration
tar -czf fornap-backup-$(date +%Y%m%d).tar.gz /var/www/fornap-proxy /etc/nginx/sites-available/fornap-proxy
```

## 💡 Avantages de cette setup

- **🚀 Performance** - Serveur dédié, pas de latence
- **💰 Économique** - Un seul VPS pour tout
- **🔒 Sécurisé** - Firewall + SSL + isolation
- **📊 Monitoring** - PM2 + logs complets
- **🔄 Backup** - Facile à sauvegarder
- **📈 Scalable** - Facile d'ajouter d'autres projets

## 🎯 Résultat final

Votre formulaire ForNap → Votre VPS → HelloAsso ✅

Plus de problème CORS, performance optimale !

---

**🎉 Cette solution VPS est parfaite pour ForNap !** 