# 🔑 Guide Rapide : Obtenir vos Credentials Square

## ⚡ Étapes Rapides (5 minutes)

### 1. Créer un compte Square (gratuit)
1. Allez sur → [squareup.com](https://squareup.com/fr)
2. Cliquez "S'inscrire"
3. Créez votre compte (gratuit)

### 2. Accéder au Developer Dashboard
1. Allez sur → [developer.squareup.com](https://developer.squareup.com/apps)
2. Connectez-vous avec votre compte Square
3. Cliquez "Create an App" (Créer une app)

### 3. Créer votre Application
1. **App Name** : "ForNap Payment"
2. **Description** : "Système de paiement pour adhésions ForNap"
3. Cliquez "Create App"

### 4. Récupérer vos Credentials Sandbox
1. Dans votre app, cliquez sur l'onglet **"Sandbox"**
2. Notez ces 2 valeurs :

```
📋 COPIEZ CES VALEURS :

Application ID: sandbox-sq0idb-xxxxxxx
Location ID: LTxxxxxxxxxxxxx
```

### 5. Configurer dans le Code

Ouvrez `member-signup.js` et trouvez ligne ~6 :

```javascript
// AVANT (ne marche pas)
this.squareConfig = {
    applicationId: 'sandbox-sq0idb-YOUR_SANDBOX_APP_ID', // ❌
    locationId: 'YOUR_SANDBOX_LOCATION_ID', // ❌
    environment: 'sandbox'
};

// APRÈS (remplacer par vos vraies valeurs)
this.squareConfig = {
    applicationId: 'sandbox-sq0idb-xxxxxxx', // ✅ Votre vraie valeur
    locationId: 'LTxxxxxxxxxxxxx', // ✅ Votre vraie valeur
    environment: 'sandbox'
};
```

## 🧪 Test Immédiat

### Cartes de Test Square
| Carte | Numéro | CVV | Résultat |
|-------|--------|-----|----------|
| ✅ Visa | 4111 1111 1111 1111 | 111 | Succès |
| ❌ Declined | 4000 0000 0000 0002 | 111 | Refusée |

### Test Complet
1. Sauvegardez `member-signup.js` avec vos credentials
2. Rechargez la page
3. Choisissez "j'adhère direct"
4. Remplissez le formulaire
5. Utilisez la carte Visa de test
6. Vérifiez que le paiement fonctionne !

## 🚨 Erreurs Courantes

### "401 Unauthorized"
❌ **Cause** : Credentials invalides  
✅ **Solution** : Vérifiez Application ID et Location ID

### "Square is not defined"
❌ **Cause** : SDK non chargé  
✅ **Solution** : Vérifiez la balise script dans le HTML

### "An unexpected error occurred"
❌ **Cause** : Mauvais credentials ou problème réseau  
✅ **Solution** : Doublez-vérifiez vos credentials

## 📱 Captures d'Écran Utiles

### Dashboard Square
```
developer.squareup.com/apps
├── Vos Apps
│   └── ForNap Payment
│       ├── 📍 Sandbox (onglet à cliquer)
│       │   ├── Application ID: sandbox-sq0idb-xxxxx
│       │   └── Location ID: LTxxxxxxxxxxxxx
│       └── Production (pour plus tard)
```

## ⏰ En 5 Minutes Chrono

1. **0-2 min** : Créer compte Square
2. **2-3 min** : Créer app dans dashboard
3. **3-4 min** : Copier credentials
4. **4-5 min** : Configurer dans le code
5. **5 min** : Test avec carte de démo

## 🎯 Résultat Attendu

Après configuration, vous devriez voir :
- ✅ Pas d'erreur 401 dans la console
- ✅ Formulaire de carte Square qui s'affiche
- ✅ Paiement test qui fonctionne

---

**🔥 Une fois configuré, tout fonctionnera parfaitement !** 