const express = require('express');
const cors = require('cors');
const { Client, Environment } = require('squareup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS
app.use(cors({
    origin: [
        'https://noagiannone03.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
}));

app.use(express.json());

// Configuration Square
const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? Environment.Production 
        : Environment.Sandbox
});

const { paymentsApi } = squareClient;

// Route pour traiter les paiements Square
app.post('/api/square/payment', async (req, res) => {
    try {
        console.log('=== TRAITEMENT PAIEMENT SQUARE ===');
        console.log('Body reçu:', JSON.stringify(req.body, null, 2));

        const { sourceId, amount, currency, idempotencyKey, memberData } = req.body;

        // Validation des données requises
        if (!sourceId || !amount || !currency || !idempotencyKey) {
            return res.status(400).json({
                error: 'Données manquantes',
                required: ['sourceId', 'amount', 'currency', 'idempotencyKey']
            });
        }

        // Préparer la requête de paiement Square
        const paymentRequest = {
            sourceId: sourceId,
            amountMoney: {
                amount: Math.round(parseFloat(amount) * 100), // Convertir en centimes
                currency: currency
            },
            idempotencyKey: idempotencyKey,
            note: 'Adhésion ForNap 2025',
            locationId: process.env.SQUARE_LOCATION_ID
        };

        // Ajouter les informations du membre si disponibles
        if (memberData) {
            paymentRequest.buyerEmailAddress = memberData.email;
            paymentRequest.note += ` - ${memberData.firstname} ${memberData.lastname}`;
        }

        console.log('Requête de paiement préparée:', paymentRequest);

        // Traiter le paiement avec Square
        const response = await paymentsApi.createPayment(paymentRequest);
        console.log('Réponse Square:', response.result);

        if (response.result && response.result.payment) {
            const payment = response.result.payment;
            
            res.json({
                success: true,
                payment: {
                    id: payment.id,
                    status: payment.status,
                    amount: payment.amountMoney,
                    createdAt: payment.createdAt,
                    receiptUrl: payment.receiptUrl
                }
            });
        } else {
            throw new Error('Réponse de paiement invalide');
        }

    } catch (error) {
        console.error('Erreur lors du traitement du paiement:', error);
        
        // Gérer les erreurs spécifiques de Square
        if (error.errors && error.errors.length > 0) {
            const squareError = error.errors[0];
            return res.status(400).json({
                error: 'Erreur Square',
                code: squareError.code,
                detail: squareError.detail,
                field: squareError.field
            });
        }

        res.status(500).json({
            error: 'Erreur serveur interne',
            message: error.message
        });
    }
});

// Route de test pour vérifier la configuration Square
app.get('/api/square/test', async (req, res) => {
    try {
        const { locationsApi } = squareClient;
        const response = await locationsApi.listLocations();
        
        res.json({
            message: 'Configuration Square valide',
            environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
            locationsCount: response.result.locations ? response.result.locations.length : 0
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erreur configuration Square',
            message: error.message
        });
    }
});

// Route de test générale
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Serveur Square ForNap opérationnel',
        timestamp: new Date().toISOString(),
        environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur Square ForNap démarré sur le port ${PORT}`);
    console.log(`📍 Environment: ${process.env.SQUARE_ENVIRONMENT || 'sandbox'}`);
    console.log(`🔧 Test: http://localhost:${PORT}/api/test`);
    console.log(`💳 Square test: http://localhost:${PORT}/api/square/test`);
});

module.exports = app; 