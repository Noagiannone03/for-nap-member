#!/bin/bash

# 🚀 Script de déploiement ForNap HelloAsso Proxy sur VPS
# Usage: chmod +x deploy-vps.sh && ./deploy-vps.sh

echo "🚀 Déploiement ForNap HelloAsso Proxy sur VPS"
echo "=============================================="

# 1. Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation de Node.js (via NodeSource)
echo "📦 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installation de PM2 pour la gestion des processus
echo "📦 Installation de PM2..."
sudo npm install -g pm2

# 4. Création du répertoire d'application
echo "📁 Création du répertoire..."
sudo mkdir -p /var/www/fornap-proxy
sudo chown $USER:$USER /var/www/fornap-proxy
cd /var/www/fornap-proxy

# 5. Copie des fichiers (à adapter selon votre méthode)
echo "📄 Copie des fichiers de l'application..."
# Option A: Si vous avez git
# git clone https://github.com/votre-repo/fornap.git .

# Option B: Copie manuelle (vous devrez copier server.js et package.json)
echo "⚠️  Copiez maintenant vos fichiers server.js et package.json dans /var/www/fornap-proxy"
echo "💡 Astuce: scp -r ./for-nap/* user@votre-vps:/var/www/fornap-proxy/"

# 6. Installation des dépendances
echo "📦 Installation des dépendances npm..."
npm install --production

# 7. Configuration PM2
echo "⚙️  Configuration PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'fornap-helloasso-proxy',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 8. Configuration Nginx (proxy reverse)
echo "🌐 Configuration Nginx..."
sudo apt install -y nginx

cat > /tmp/fornap-proxy << EOF
server {
    listen 80;
    server_name votre-domaine.com;  # À remplacer par votre domaine

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo mv /tmp/fornap-proxy /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/fornap-proxy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 9. Configuration du firewall
echo "🔒 Configuration du firewall..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

# 10. Démarrage de l'application
echo "🚀 Démarrage de l'application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "✅ Déploiement terminé !"
echo "========================"
echo ""
echo "🔗 URLs importantes :"
echo "   • Test serveur: http://votre-domaine.com/api/test"
echo "   • Test HelloAsso: http://votre-domaine.com/api/helloasso/test"
echo ""
echo "🛠  Commandes utiles :"
echo "   • pm2 status              # État de l'app"
echo "   • pm2 logs                # Voir les logs"
echo "   • pm2 restart all         # Redémarrer"
echo "   • pm2 stop all            # Arrêter"
echo ""
echo "⚙️  Configuration à faire :"
echo "   1. Remplacez 'votre-domaine.com' dans /etc/nginx/sites-available/fornap-proxy"
echo "   2. Mettez à jour l'URL dans member-signup.js"
echo "   3. Optionnel: Configurez SSL avec certbot"
echo ""
echo "🎉 Votre serveur proxy HelloAsso est prêt !" 