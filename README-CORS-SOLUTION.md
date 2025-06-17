# 🚀 Solution CORS HelloAsso - ForNap

## 🔴 Problème rencontré

HelloAsso a durci ses politiques CORS en 2024/2025, rendant impossible les appels directs depuis un navigateur web vers leur API `checkout-intents`. 

**Erreur typique :**
```
Access to fetch at 'https://api.helloasso.com/v5/organizations/no-id-lab/checkout-intents' 
from origin 'https://noagiannone03.github.io' has been blocked by CORS policy
```

## ✅ Solution mise en place

Selon la documentation officielle HelloAsso, la solution recommandée est d'utiliser un **serveur backend** qui fait le proxy vers leur API.

### 📁 Fichiers créés

1. **`server.js`** - Serveur Node.js proxy pour HelloAsso
2. **`package.json`** - Dépendances du serveur
3. **`member-signup.js`** (modifié) - Client utilisant maintenant le proxy

### 🛠 Installation locale

1. **Installer Node.js** (version 14+ recommandée)

2. **Installer les dépendances :**
   ```bash
   cd for-nap
   npm install
   ```

3. **Démarrer le serveur :**
   ```bash
   npm start
   # ou pour le développement :
   npm run dev
   ```

4. **Tester :**
   - Serveur : http://localhost:3000/api/test
   - HelloAsso : http://localhost:3000/api/helloasso/test

## 🌐 Déploiement (Options recommandées)

### Option 1 : Heroku (Gratuit)
```bash
# 1. Créer une app Heroku
heroku create fornap-helloasso-proxy

# 2. Déployer
git add .
git commit -m "Add HelloAsso proxy server"
git push heroku main

# 3. Mettre à jour l'URL dans member-signup.js
```

### Option 2 : Vercel
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel --prod

# 3. Mettre à jour l'URL dans member-signup.js
```

### Option 3 : Railway
```bash
# 1. Se connecter à railway.app
# 2. Connecter ce repo GitHub
# 3. Déployer automatiquement
```

## 🔧 Configuration

Après déploiement, mettre à jour dans `member-signup.js` :

```javascript
// Remplacer cette ligne :
: 'https://your-proxy-server.com'; 

// Par votre vraie URL, exemple :
: 'https://fornap-helloasso-proxy.herokuapp.com';
```

## 🎯 Avantages de cette solution

✅ **Conforme** aux recommandations HelloAsso  
✅ **Sécurisé** - tokens gérés côté serveur  
✅ **Fiable** - pas de limitation des proxies publics  
✅ **Fallback** - solution alternative si le serveur est indisponible  
✅ **Cache** - tokens mis en cache pour les performances  

## 🔄 Solution alternative automatique

Si le serveur proxy n'est pas disponible, le système affiche automatiquement :

1. **Lien direct HelloAsso** - Formulaire sur leur site
2. **Informations virement** - Paiement manuel
3. **Bouton retry** - Nouvelle tentative automatique

## 📝 Notes importantes

- Les clés API HelloAsso sont dans le serveur (sécurisé)
- Les données membres sont toujours sauvées dans Firebase
- Le système fonctionne avec ou sans serveur proxy
- Compatible avec votre configuration GitHub Pages actuelle

## 🆘 Support

Si vous avez des questions ou problèmes :

1. **Vérifier les logs** du serveur
2. **Tester l'endpoint** `/api/helloasso/test`
3. **Vérifier la configuration** CORS dans server.js

---

**Solution créée selon la documentation officielle HelloAsso 2024/2025** 🎯 