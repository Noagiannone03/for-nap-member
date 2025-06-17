// 🧪 CREDENTIALS DE TEST TEMPORAIRES
// Utilisez ces credentials pour tester immédiatement

// ⚠️ ATTENTION: Ces credentials sont publics et ne doivent être utilisés que pour les tests
// Pour la production, vous DEVEZ créer votre propre compte Square

const DEMO_SQUARE_CONFIG = {
    // Credentials de démonstration publics Square
    applicationId: 'sandbox-sq0idb-6_ygUrZy2_TBQgBZrW_1VQ', // Démo publique
    locationId: 'L1HN1ZKQK1FT7', // Démo publique
    environment: 'sandbox'
};

// 📝 COMMENT UTILISER :
// 1. Copiez ces valeurs dans member-signup.js
// 2. Remplacez la section squareConfig dans le constructor
// 3. Testez avec les cartes de test Square

console.log('🧪 Credentials de test Square:');
console.log('Application ID:', DEMO_SQUARE_CONFIG.applicationId);
console.log('Location ID:', DEMO_SQUARE_CONFIG.locationId);
console.log('Environment:', DEMO_SQUARE_CONFIG.environment);

// 🃏 CARTES DE TEST À UTILISER :
console.log('\n🃏 Cartes de test:');
console.log('✅ Visa: 4111 1111 1111 1111 | CVV: 111');
console.log('❌ Declined: 4000 0000 0000 0002 | CVV: 111');
console.log('📅 Date: N\'importe quelle date future');

// 🚨 IMPORTANT :
console.log('\n🚨 IMPORTANT:');
console.log('- Ces credentials sont TEMPORAIRES et PUBLICS');
console.log('- Créez votre propre compte Square pour la production');
console.log('- Suivez CREDENTIALS-SETUP.md pour vos vrais credentials'); 