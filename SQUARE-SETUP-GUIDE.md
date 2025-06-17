# Guide de Configuration Square pour ForNap

## 🚀 Migration HelloAsso → Square

Ce guide vous explique comment configurer et utiliser le nouveau système de paiement Square qui remplace HelloAsso.

## 📋 Prérequis

### 1. Compte Square
- Créer un compte Square sur [squareup.com](https://squareup.com/fr)
- Accéder au Square Developer Dashboard

### 2. Obtenir les Credentials Square

#### Sandbox (Tests)
1. Connectez-vous au [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Créez une nouvelle application ou sélectionnez une application existante
3. Dans l'onglet "Credentials", récupérez :
   - **Sandbox Application ID** (commence par `sandbox-sq0idb-`)
   - **Sandbox Access Token** (commence par `EAAAl`)
   - **Sandbox Location ID**

#### Production
1. Dans le même dashboard, allez dans l'onglet "Production"
2. Récupérez les mêmes informations pour la production

## ⚡ Configuration Rapide

### 1. Configuration Frontend (JavaScript uniquement)

Dans `member-signup.js`, remplacez les valeurs dans le constructor :

```javascript
// Configuration Square - Mode Sandbox
this.squareConfig = {
    applicationId: 'sandbox-sq0idb-VOTRE_APP_ID', // Remplacez par votre Application ID
    locationId: 'VOTRE_LOCATION_ID', // Remplacez par votre Location ID
    environment: 'sandbox' // 'sandbox' pour les tests, 'production' pour la production
};
```

### 2. Cartes de Test (Sandbox)

Utilisez ces cartes de test dans le formulaire :

| Type de carte | Numéro | CVV | Code postal |
|---------------|--------|-----|-------------|
| Visa | 4111 1111 1111 1111 | 111 | Valide |
| Mastercard | 5105 1051 0510 5100 | 111 | Valide |
| Declined | 4000 0000 0000 0002 | 111 | Valide |

**Date d'expiration :** N'importe quelle date future

## 🔧 Configuration Avancée (Serveur Optionnel)

Si vous voulez un backend sécurisé pour la production :

### 1. Installation des Dépendances

```bash
# Copier le nouveau package.json
cp square-package.json package.json

# Installer les dépendances
npm install
```

### 2. Configuration Environment

```bash
# Copier le fichier d'exemple
cp square-env-example.txt .env

# Éditer le fichier .env avec vos vraies credentials
```

### 3. Démarrage du Serveur

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🧪 Tests et Validation

### Tests Frontend

1. Ouvrez `member-signup.html`
2. Choisissez "j'adhère direct"
3. Remplissez le formulaire
4. Utilisez une carte de test
5. Vérifiez que le paiement est simulé avec succès

### Tests Serveur (si utilisé)

```bash
# Test de base
curl http://localhost:3000/api/test

# Test configuration Square
curl http://localhost:3000/api/square/test
```

## 🎯 Avantages de Square vs HelloAsso

### ✅ Avantages Square
- **Pas de serveur obligatoire** : Tout peut fonctionner en JavaScript
- **Interface moderne** : Formulaire de carte intégré et sécurisé
- **Tests faciles** : Sandbox avec cartes de test
- **International** : Support multi-devises
- **Moins de frais** : Tarification compétitive
- **Intégration simple** : SDK JavaScript moderne

### ❌ Limitations HelloAsso (supprimées)
- Serveur proxy obligatoire
- Problèmes CORS
- Interface moins moderne
- Limité à la France

## 🔒 Sécurité

### Frontend Only (Mode Actuel)
- ✅ Les tokens sont sécurisés côté Square
- ✅ Aucune donnée de carte stockée
- ⚠️ Simulation de paiement pour la démo
- 🚨 **Production**: Implémenter le serveur backend

### Avec Serveur Backend
- ✅ Paiements réels traités côté serveur
- ✅ Access tokens sécurisés
- ✅ Validation server-side
- ✅ Logs et monitoring

## 🚀 Déploiement

### Frontend Seul
1. Remplacez les credentials sandbox par ceux de production
2. Changez `environment: 'sandbox'` vers `environment: 'production'`
3. Déployez sur GitHub Pages (déjà fait)

### Avec Serveur
1. Configurez les variables d'environnement de production
2. Déployez sur votre VPS/Heroku/etc.
3. Mettez à jour l'URL du serveur dans le frontend

## 🆘 Dépannage

### Erreur "Square non défini"
- Vérifiez que le SDK Square est chargé : `<script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>`

### Erreur de tokenisation
- Vérifiez votre Application ID et Location ID
- Utilisez les bonnes cartes de test
- Vérifiez les détails de billing

### Paiement refusé
- En sandbox, utilisez uniquement les cartes de test officielles
- Vérifiez que le montant est correct (12.00 €)

## 📞 Support

### Documentation Square
- [Web Payments SDK](https://developer.squareup.com/docs/web-payments/overview)
- [Cartes de test](https://developer.squareup.com/docs/devtools/sandbox/payments)

### Support Square
- [Developer Forums](https://developer.squareup.com/forums)
- [Contact Support](https://squareup.com/help)

## 🎉 Notes Importantes

### Migration Complète
- ✅ HelloAsso complètement supprimé
- ✅ Serveur Node.js HelloAsso non nécessaire
- ✅ Interface moderne avec Square
- ✅ Configuration en mode sandbox pour tests

### Prochaines Étapes
1. **Testez** avec les cartes sandbox
2. **Configurez** vos vraies credentials
3. **Implémentez** le serveur backend pour la production
4. **Déployez** en production

---

**🔥 Le système est maintenant prêt pour les tests !** 