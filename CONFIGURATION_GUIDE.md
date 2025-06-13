# Guide de Configuration - Inscription Adhérents ForNap

## 🎯 Vue d'ensemble

Ce système d'inscription utilise l'**API HelloAsso Checkout officielle** pour traiter les paiements d'adhésion de manière sécurisée et conforme.

### ⚡ Points clés de l'implémentation
- ✅ **API HelloAsso Checkout officielle** (pas d'iframe bloquée)
- ✅ **Redirections sécurisées** vers HelloAsso
- ✅ **Gestion automatique des retours** de paiement
- ✅ **Intégration Firebase** pour la sauvegarde des données
- ✅ **Design responsive** avec theme sombre

## 🔧 Configuration Firebase

### 1. Configuration de base

Le fichier utilise la configuration Firebase existante :

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyALz161yfiLaOeHU82DQNJV4PkzAXO1wzM",
    authDomain: "nap-7aa80.firebaseapp.com",
    projectId: "nap-7aa80",
    storageBucket: "nap-7aa80.firebasestorage.app",
    messagingSenderId: "434731738248",
    appId: "1:434731738248:web:481644f3a6e809c06d2b3d",
    measurementId: "G-3HVC6HNG02"
};
```

### 2. Collections utilisées

- **`interested_users`** : Utilisateurs intéressés (inscription gratuite)
- **`members`** : Membres ayant payé leur adhésion

## 🏪 Configuration HelloAsso

### 1. Identifiants API (déjà configurés)

```javascript
this.helloAssoClientId = 'b113d06d07884da39d0a6b52482b40bd';
this.helloAssoClientSecret = 'NMFwtSG1Bt63HkJ2Xn/vqarfTbUJBWsP';
this.organizationSlug = 'no-id-lab';
```

### 2. URLs API

- **Production** : `https://api.helloasso.com/v5`
- **OAuth** : `https://api.helloasso.com/oauth2`

## 🚀 Fonctionnement du Checkout

### 1. Flux de paiement

Le système fonctionne avec des redirections sécurisées :

1. **Utilisateur remplit le formulaire** d'adhésion
2. **Création d'un Checkout Intent** via l'API HelloAsso
3. **Redirection automatique** vers la page de paiement HelloAsso
4. **Traitement du paiement** sur les serveurs HelloAsso sécurisés
5. **Retour sur le site** avec le statut du paiement
6. **Sauvegarde des données** en cas de succès

### 2. Endpoints utilisés

#### Authentification OAuth2
```http
POST https://api.helloasso.com/oauth2/token
Content-Type: application/x-www-form-urlencoded

client_id={clientId}&client_secret={clientSecret}&grant_type=client_credentials
```

#### Création du Checkout Intent
```http
POST https://api.helloasso.com/v5/organizations/{organizationSlug}/checkout-intents
Authorization: Bearer {accessToken}
Content-Type: application/json

{
    "totalAmount": 1200,
    "initialAmount": 1200,
    "itemName": "Adhésion Early Member - ForNap",
    "backUrl": "{baseUrl}?status=cancelled",
    "errorUrl": "{baseUrl}?status=error", 
    "returnUrl": "{baseUrl}?status=success",
    "containsDonation": false,
    "payer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "zipCode": "75001",
        "country": "FRA"
    },
    "metadata": {
        "userId": "john@example.com",
        "membershipType": "early-member",
        "age": "25",
        "phone": "+33123456789"
  }
}
```

## 📱 Interface Utilisateur

### 1. Modes d'inscription

#### Mode "Intéressé" (Gratuit)
- Formulaire simple : prénom, email, téléphone
- Sauvegarde directe en Firebase
- Modal d'incitation vers l'adhésion payante

#### Mode "Early Member" (12€)
- Formulaire complet : nom, prénom, âge, code postal, email, téléphone  
- Validation des données
- Redirection vers HelloAsso pour le paiement
- Gestion automatique du retour

### 2. États de l'interface

1. **Choix initial** : Cartes interactives pour choisir le mode
2. **Formulaire** : Saisie des informations utilisateur
3. **Chargement** : État transitoire avant redirection HelloAsso
4. **Succès** : Confirmation d'inscription
5. **Erreur** : Gestion des cas d'échec

## 🛠️ Personnalisation

### 1. Montants et produits

Dans `member-signup.js` :

```javascript
// Changer le montant de l'adhésion (en centimes)
amount: 1200, // 12€

// Modifier le nom du produit
itemName: 'Adhésion Early Member - ForNap',
```

### 2. URLs de retour

Les URLs sont automatiquement générées :
- Succès : `{currentUrl}?status=success`
- Annulé : `{currentUrl}?status=cancelled`  
- Erreur : `{currentUrl}?status=error`

### 3. Design et contenu

#### Avantages Early Member
Dans `member-signup.html`, section `.premium-benefits` :
```html
<li class="highlight">🎫 <strong>Place festival au Fort</strong> à venir... (valeur 15€)</li>
<li>🏢 <strong>Accès exclusif au ForNap</strong> (espace membres)</li>
<li>🗳️ Droit de vote pour les décisions du Fort</li>
<li>🎯 Programme fidélité exclusif</li>
<li>🏆 Statut d'Early Member</li>
```

#### Couleurs et thème
Dans `member-signup.css`, variables CSS principales :
```css
--primary-gold: #FFD700;
--accent-purple: #9D4EDD;
--gradient-primary: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
--glass-bg: rgba(255, 255, 255, 0.1);
```

## 🔐 Sécurité

### 1. Validation côté client
- Validation email avec regex
- Validation code postal français (5 chiffres)
- Vérification âge minimum (16 ans)

### 2. Authentification API
- Token Bearer temporaire via OAuth2
- Clés API sécurisées HelloAsso
- Communication HTTPS uniquement

### 3. Protection des données
- Conformité RGPD native avec HelloAsso
- Données bancaires jamais stockées localement
- Chiffrement end-to-end HelloAsso

## 📊 Suivi et Analytics

### 1. Données collectées

#### Utilisateurs intéressés
```javascript
{
    type: 'interested',
    firstname: 'John',
    email: 'john@example.com', 
    phone: '+33123456789',
    timestamp: '2024-01-15T10:30:00.000Z'
}
```

#### Membres payants
```javascript
{
    type: 'member',
    lastname: 'Doe',
    firstname: 'John',
    age: 25,
    zipcode: '75001',
    email: 'john@example.com',
    phone: '+33123456789',
    amount: 1200,
    paymentStatus: 'completed',
    sessionId: 'checkout_session_123',
    timestamp: '2024-01-15T10:30:00.000Z'
}
```

### 2. Événements trackés
- Sélection du mode d'inscription
- Soumission des formulaires
- Redirections vers HelloAsso
- Retours de paiement (succès/échec/annulation)
- Erreurs de validation

## 🚨 Dépannage

### 1. Erreurs fréquentes

#### "Erreur API: 401"
- Vérifier les identifiants HelloAsso
- Vérifier que l'organisation existe
- S'assurer que les API keys sont actives

#### "Erreur API: 400"  
- Vérifier le format des données envoyées
- Contrôler que l'email est valide
- Vérifier que le montant est en centimes

#### "Impossible de créer la session de paiement"
- Vérifier la connexion internet
- Contrôler les URLs de retour
- Vérifier que l'organisation HelloAsso est configurée pour le checkout

### 2. Tests et validation

#### Test de l'inscription gratuite
1. Choisir "Je veux rester informé"
2. Remplir le formulaire
3. Vérifier l'apparition dans Firebase `interested_users`

#### Test de l'adhésion payante
1. Choisir "Je veux faire partie du projet"  
2. Remplir le formulaire complet
3. Vérifier la redirection vers HelloAsso
4. Effectuer un paiement test
5. Vérifier le retour et l'apparition dans Firebase `members`

## 📈 Métriques de performance

### 1. Indicateurs clés
- **Taux de conversion** : Intéressés → Early Members
- **Abandon de panier** : Formulaires non finalisés
- **Succès de paiement** : % de paiements réussis
- **Temps de chargement** : Performance des redirections

### 2. Optimisations possibles
- Pré-remplissage des formulaires
- Sauvegarde progressive des données
- Optimisation des transitions CSS
- Cache des tokens d'authentification

## 🔄 Évolutions futures

### 1. Fonctionnalités planifiées
- [ ] Système de codes promo
- [ ] Paiement en plusieurs fois
- [ ] Notifications email automatiques
- [ ] Dashboard admin temps réel
- [ ] Export des données membres

### 2. Intégrations possibles
- [ ] MailChimp pour newsletters
- [ ] Discord pour la communauté
- [ ] Calendly pour les événements
- [ ] Stripe comme alternative de paiement

---

## 📞 Support

Pour toute question technique :
- 📧 Email : support@for-nap.com
- 🐛 Issues : Repository GitHub
- 📖 Doc HelloAsso : https://dev.helloasso.com/

**Configuration validée le** : Décembre 2024
**Version** : 2.0 (API Checkout HelloAsso) 