const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS pour votre domaine GitHub Pages
app.use(cors({
    origin: [
        'https://noagiannone03.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
}));

app.use(express.json());

// Configuration HelloAsso
const HELLOASSO_CONFIG = {
    clientId: 'b113d06d07884da39d0a6b52482b40bd',
    clientSecret: 'NMFwtSG1Bt63HkJ2Xn/vqarfTbUJBWsP',
    organizationSlug: 'no-id-lab',
    baseUrl: 'https://api.helloasso.com/v5',
    oauthUrl: 'https://api.helloasso.com/oauth2'
};

// Cache pour le token (en mémoire, simple)
let tokenCache = {
    token: null,
    expires: 0
};

// Route pour obtenir un token HelloAsso
async function getHelloAssoToken() {
    // Vérifier si le token en cache est encore valide
    if (tokenCache.token && Date.now() < tokenCache.expires) {
        return tokenCache.token;
    }

    try {
        const response = await fetch(`${HELLOASSO_CONFIG.oauthUrl}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: HELLOASSO_CONFIG.clientId,
                client_secret: HELLOASSO_CONFIG.clientSecret,
                grant_type: 'client_credentials'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HelloAsso token: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Mettre en cache le token (expire dans 1 heure par défaut)
        tokenCache.token = data.access_token;
        tokenCache.expires = Date.now() + (data.expires_in ? data.expires_in * 1000 : 3600000);
        
        return data.access_token;
    } catch (error) {
        console.error('Erreur lors de l\'obtention du token HelloAsso:', error);
        throw error;
    }
}

// Route proxy pour créer un checkout intent HelloAsso
app.post('/api/helloasso/checkout-intent', async (req, res) => {
    try {
        console.log('=== REQUÊTE CHECKOUT INTENT ===');
        console.log('Body reçu:', JSON.stringify(req.body, null, 2));

        // Obtenir le token HelloAsso
        const accessToken = await getHelloAssoToken();
        console.log('Token HelloAsso obtenu');

        // Transférer la requête vers HelloAsso
        const response = await fetch(
            `${HELLOASSO_CONFIG.baseUrl}/organizations/${HELLOASSO_CONFIG.organizationSlug}/checkout-intents`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(req.body)
            }
        );

        console.log('Statut réponse HelloAsso:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur HelloAsso:', errorText);
            return res.status(response.status).json({
                error: 'Erreur HelloAsso',
                details: errorText,
                status: response.status
            });
        }

        const result = await response.json();
        console.log('Succès HelloAsso:', result);

        res.json(result);
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(500).json({
            error: 'Erreur serveur interne',
            message: error.message
        });
    }
});

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Serveur ForNap proxy HelloAsso opérationnel',
        timestamp: new Date().toISOString()
    });
});

// Route pour vérifier la configuration HelloAsso
app.get('/api/helloasso/test', async (req, res) => {
    try {
        const token = await getHelloAssoToken();
        res.json({
            message: 'Configuration HelloAsso valide',
            hasToken: !!token,
            organizationSlug: HELLOASSO_CONFIG.organizationSlug
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur configuration HelloAsso',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur ForNap démarré sur le port ${PORT}`);
    console.log(`📍 Test: http://localhost:${PORT}/api/test`);
    console.log(`🔧 HelloAsso test: http://localhost:${PORT}/api/helloasso/test`);
});

module.exports = app; 