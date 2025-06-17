# 🎯 Récupérer votre Location ID Square

## ✅ Vous avez déjà :
- **Application ID** : `sandbox-sq0idb-emB5qLjloYgpPbdIpBWftw`
- **Access Token** : `EAAAlzuHgjzG7LGRCH4apGYT3sZRUJs9IpbPtbzbcR_QE2qtwxSJtElkVxDCSXTT`

## 🎯 Il manque : Location ID

### 📍 Comment récupérer votre Location ID :

1. **Allez sur** → [developer.squareup.com/apps](https://developer.squareup.com/apps)
2. **Cliquez** sur votre application
3. **Onglet "Sandbox"** (déjà ouvert)
4. **Cherchez** la section **"Locations"** ou **"Location ID"**
5. **Copiez** le Location ID (format : `LXXXxxxxxxxxx`)

### 🔍 Où trouver exactement :

Dans le dashboard Square, section Sandbox :
```
📍 Locations
└── Default Test Location
    └── Location ID: LXXXxxxxxxxxx  ← COPIEZ ÇA
```

### ⚡ Une fois récupéré :

Remplacez dans `member-signup.js` ligne ~8 :
```javascript
locationId: 'VOTRE_LOCATION_ID', // ← Remplacez par LXXXxxxxxxxxx
```

Par exemple :
```javascript
locationId: 'L1234567890ABC', // ✅ Votre vraie valeur
```

## 🚀 Configuration finale attendue :

```javascript
this.squareConfig = {
    applicationId: 'sandbox-sq0idb-emB5qLjloYgpPbdIpBWftw', // ✅ OK
    locationId: 'LXXXxxxxxxxxx', // ← À compléter
    environment: 'sandbox' // ✅ OK
};
```

## 🧪 Test immédiat après configuration :

1. **Sauvegardez** le fichier avec votre Location ID
2. **Rechargez** la page
3. **Testez** avec la carte : 4111 1111 1111 1111
4. **Plus d'erreur 401** dans la console !

---

**⏰ Il ne manque que cette dernière étape !** 