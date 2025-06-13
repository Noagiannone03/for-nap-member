class MemberSignup {
    constructor() {
        this.currentMode = null;
        this.currentFormData = null;
        this.memberDocumentId = null; // Stocker l'ID du document Firebase
        this.helloAssoClientId = 'b113d06d07884da39d0a6b52482b40bd';
        this.helloAssoClientSecret = 'NMFwtSG1Bt63HkJ2Xn/vqarfTbUJBWsP';
        this.organizationSlug = 'no-id-lab';
        this.baseUrl = 'https://api.helloasso.com/v5';
        this.oauthUrl = 'https://api.helloasso.com/oauth2';
        
        // URL de retour pour les tests locaux (à changer en production)
        this.testReturnUrl = 'https://noagiannone03.github.io/for-nap-member/member-signup.html';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleUrlParams(); // Pour gérer les retours de paiement
    }

    setupEventListeners() {
        // Choice cards
        const choiceCards = document.querySelectorAll('.choice-card');
        choiceCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on a button
                if (e.target.closest('.choice-btn')) return;
                
                const option = card.dataset.option;
                this.handleChoiceSelection(option);
            });
        });

        // Choice buttons
        const interestedBtn = document.querySelector('.interested-btn');
        const memberBtn = document.querySelector('.member-btn');

        if (interestedBtn) {
            interestedBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleChoiceSelection('interested');
            });
        }

        if (memberBtn) {
            memberBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleChoiceSelection('member');
            });
        }

        // Forms
        const interestedForm = document.getElementById('interested-signup');
        const memberForm = document.getElementById('member-signup');

        if (interestedForm) {
            interestedForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleInterestedSubmit();
            });
        }

        if (memberForm) {
            memberForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMemberSubmit();
            });
        }

        // Back button
        const backBtn = document.getElementById('back-to-choice');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.backToChoice();
            });
        }

        // Download member card button
        const downloadBtn = document.getElementById('download-member-card');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadMemberCard();
            });
        }

        // Modal close buttons
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeUpgradeModal();
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('upgrade-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeUpgradeModal();
                }
            });
        }
    }

    handleChoiceSelection(mode) {
        this.currentMode = mode;
        
        if (mode === 'interested') {
            // Afficher la modal d'incitation avant de continuer
            this.showUpgradeModal();
            return;
        }
        
        // Pour le mode member, continuer normalement
        this.showForm(mode);
    }

    showForm(mode) {
        // Hide choice container and show form
        const choiceContainer = document.querySelector('.choice-container');
        choiceContainer.classList.add('form-active');
        
        // Show appropriate form and back button
        this.hideAllForms();
        
        setTimeout(() => {
            if (mode === 'interested') {
                document.getElementById('interested-form').classList.remove('hidden');
            } else if (mode === 'member') {
                document.getElementById('member-form').classList.remove('hidden');
            }
            document.getElementById('back-button-container').classList.remove('hidden');
        }, 100);
    }

    backToChoice() {
        // Hide forms and back button
        this.hideAllForms();
        document.getElementById('back-button-container').classList.add('hidden');
        
        // Restore choice container
        const choiceContainer = document.querySelector('.choice-container');
        choiceContainer.classList.remove('form-active');
        
        // Clear selection
        document.querySelectorAll('.choice-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.currentMode = null;
    }

    hideAllForms() {
        const forms = ['interested-form', 'member-form'];
        const successes = ['success-interested', 'success-member'];
        const others = ['helloasso-checkout', 'payment-loading'];
        
        forms.concat(successes).concat(others).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    async handleInterestedSubmit() {
        const formData = {
            type: 'interested',
            firstname: document.getElementById('interested-firstname').value,
            email: document.getElementById('interested-email').value,
            phone: document.getElementById('interested-phone').value,
            timestamp: new Date().toISOString()
        };

        try {
            // Validation
            if (!this.validateEmail(formData.email)) {
                this.showError('Veuillez saisir un email valide');
                return;
            }

            // Sauvegarde en base
            await this.saveToFirebase('interested_users', formData);
            
            // Affichage du succès
            this.hideAllForms();
            setTimeout(() => {
                document.getElementById('success-interested').classList.remove('hidden');
            }, 300);

        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            this.showError('Une erreur est survenue. Veuillez réessayer.');
        }
    }

    async handleMemberSubmit() {
        const formData = {
            type: 'member',
            lastname: document.getElementById('member-lastname').value,
            firstname: document.getElementById('member-firstname').value,
            age: parseInt(document.getElementById('member-age').value),
            zipcode: document.getElementById('member-zipcode').value,
            email: document.getElementById('member-email').value,
            phone: document.getElementById('member-phone').value,
            amount: 0, // Gratuit pour les tests
            timestamp: new Date().toISOString()
        };

        try {
            // Validation
            if (!this.validateEmail(formData.email)) {
                this.showError('Veuillez saisir un email valide');
                return;
            }

            if (!this.validateZipCode(formData.zipcode)) {
                this.showError('Veuillez saisir un code postal valide');
                return;
            }

            if (formData.age < 16) {
                this.showError('Vous devez avoir au moins 16 ans pour adhérer');
                return;
            }

            // Sauvegarder les données temporairement
            this.currentFormData = formData;
            
            // Initier le paiement HelloAsso
            await this.initializeHelloAssoPayment(formData);

        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            this.showError('Une erreur est survenue. Veuillez réessayer.');
        }
    }

    async initializeHelloAssoPayment(formData) {
        try {
            console.log('Début du processus de paiement HelloAsso');
            
            // Afficher l'état de chargement
            this.showLoadingState();
            
            // Créer la commande HelloAsso
            const checkoutIntent = await this.createCheckoutIntent(formData);
            console.log('Checkout intent reçu:', checkoutIntent);
            
            if (checkoutIntent && checkoutIntent.redirectUrl) {
                console.log('Redirection vers:', checkoutIntent.redirectUrl);
                // Rediriger vers HelloAsso
                window.location.href = checkoutIntent.redirectUrl;
            } else {
                console.error('Pas d\'URL de redirection dans la réponse:', checkoutIntent);
                throw new Error('Impossible de créer la session de paiement - pas d\'URL de redirection');
            }
            
        } catch (error) {
            console.error('Erreur paiement HelloAsso:', error);
            this.hideLoadingState();
            this.showError(`Erreur lors de l'initialisation du paiement: ${error.message}`);
        }
    }

    async createCheckoutIntent(formData) {
        try {
            // 1. Obtenir un token d'accès
            const accessToken = await this.getAccessToken();
            
            // 2. Créer l'intent de checkout
            // Construction des URLs de retour sécurisées
            const currentUrl = window.location.href.split('?')[0]; // Enlever les paramètres existants
            const isLocal = currentUrl.includes('localhost') || currentUrl.includes('file://') || currentUrl.includes('127.0.0.1');
            
            // Utiliser l'URL GitHub Pages pour tous les environnements
            const baseReturnUrl = isLocal ? this.testReturnUrl : 'https://noagiannone03.github.io/for-nap-member/member-signup.html';

            const checkoutData = {
                totalAmount: formData.amount,
                initialAmount: formData.amount,
                itemName: 'Adhésion Early Member - ForNap',
                backUrl: baseReturnUrl + '?status=cancelled',
                errorUrl: baseReturnUrl + '?status=error', 
                returnUrl: baseReturnUrl + '?status=success',
                containsDonation: false,
                payer: {
                    firstName: formData.firstname,
                    lastName: formData.lastname,
                    email: formData.email,
                    address: '',
                    city: '',
                    zipCode: formData.zipcode,
                    country: 'FRA'
                },
                metadata: {
                    userId: formData.email,
                    membershipType: 'early-member',
                    age: formData.age.toString(),
                    phone: formData.phone
                }
            };

            console.log('URLs de retour configurées:', {
                backUrl: checkoutData.backUrl,
                errorUrl: checkoutData.errorUrl,
                returnUrl: checkoutData.returnUrl,
                baseReturnUrl: baseReturnUrl,
                currentUrl: currentUrl
            });

            const response = await fetch(`${this.baseUrl}/organizations/${this.organizationSlug}/checkout-intents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(checkoutData)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Erreur API HelloAsso:', response.status, errorData);
                throw new Error(`Erreur API: ${response.status}`);
            }

            const result = await response.json();
            console.log('Checkout intent créé:', result);
            
            return result;
            
        } catch (error) {
            console.error('Erreur lors de la création du checkout intent:', error);
            throw error;
        }
    }

    async getAccessToken() {
        try {
            const response = await fetch(`${this.oauthUrl}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: this.helloAssoClientId,
                    client_secret: this.helloAssoClientSecret,
                    grant_type: 'client_credentials'
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Erreur authentification HelloAsso:', response.status, errorData);
                throw new Error(`Erreur authentification: ${response.status}`);
            }

            const data = await response.json();
            return data.access_token;
            
        } catch (error) {
            console.error('Erreur lors de l\'obtention du token:', error);
            throw error;
        }
    }

    showLoadingState() {
        this.hideAllForms();
        
        // Créer ou afficher l'état de chargement
        let loadingElement = document.getElementById('payment-loading');
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'payment-loading';
            loadingElement.className = 'payment-section hidden';
            loadingElement.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h3>Préparation du paiement...</h3>
                    <p>Vous allez être redirigé vers HelloAsso pour finaliser votre adhésion.</p>
            </div>
        `;
            document.querySelector('.content-wrapper').appendChild(loadingElement);
        }
        
        setTimeout(() => {
            loadingElement.classList.remove('hidden');
        }, 100);
    }

    hideLoadingState() {
        const loadingElement = document.getElementById('payment-loading');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
    }

    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const sessionId = urlParams.get('session_id');
        
        if (status) {
            switch (status) {
                case 'success':
                    this.handlePaymentSuccess(sessionId);
                    break;
                case 'cancelled':
                    this.handlePaymentCancelled();
                    break;
                case 'error':
                    this.handlePaymentError();
                    break;
            }
            
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

        async handlePaymentSuccess(sessionId) {
        console.log('Paiement réussi, session:', sessionId);
        
        try {
            // Si on a des données de formulaire temporaires, les sauvegarder
            if (this.currentFormData) {
                this.currentFormData.paymentStatus = 'completed';
                this.currentFormData.sessionId = sessionId;
                
                // Sauvegarder en Firebase et récupérer l'ID du document
                this.memberDocumentId = await this.saveToFirebase('members', this.currentFormData);
                console.log('Membre sauvegardé avec ID:', this.memberDocumentId);
                
                this.currentFormData = null;
            }
            
            // Afficher le succès
            this.hideAllForms();
            setTimeout(() => {
                document.getElementById('success-member').classList.remove('hidden');
                // Générer le QR code après l'affichage
                this.generateMemberQRCode();
            }, 300);

        } catch (error) {
            console.error('Erreur lors de la sauvegarde après paiement:', error);
            // Même en cas d'erreur de sauvegarde, afficher le succès car le paiement a été effectué
            this.hideAllForms();
            setTimeout(() => {
                document.getElementById('success-member').classList.remove('hidden');
                // Générer un QR code avec session ID en fallback
                this.memberDocumentId = sessionId || 'temp-' + Date.now();
                this.generateMemberQRCode();
            }, 300);
        }
    }

    handlePaymentCancelled() {
        console.log('Paiement annulé');
        this.hideLoadingState();
        this.showError('Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.');
        
        // Revenir au formulaire member
        if (this.currentMode === 'member') {
        setTimeout(() => {
                this.showForm('member');
            }, 2000);
        }
    }

    handlePaymentError() {
        console.log('Erreur de paiement');
        this.hideLoadingState();
        this.showError('Une erreur est survenue lors du paiement. Veuillez réessayer.');
        
        // Revenir au formulaire member
        if (this.currentMode === 'member') {
            setTimeout(() => {
                this.showForm('member');
            }, 2000);
        }
    }

    // Modal upgrade functionality
    showUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    continueAsInterested() {
        this.closeUpgradeModal();
        this.showForm('interested');
    }

    upgradeToMember() {
        this.closeUpgradeModal();
        this.currentMode = 'member';
        this.showForm('member');
    }

    async generateMemberQRCode() {
        if (!this.memberDocumentId) {
            console.error('Pas d\'ID de document pour générer le QR code');
            return;
        }

        try {
            const qrContainer = document.getElementById('member-qr-code');
            if (!qrContainer) return;

            // Afficher un état de chargement
            qrContainer.innerHTML = `
                <div class="qr-loading">
                    <div class="qr-loading-spinner"></div>
                    <span>Génération de votre QR code...</span>
                </div>
            `;

            // Générer le QR code avec l'ID du document
            const qrCodeData = `FORNAP-MEMBER:${this.memberDocumentId}`;
            
            // Créer le canvas pour le QR code
            const canvas = document.createElement('canvas');
            await QRCode.toCanvas(canvas, qrCodeData, {
                width: 250,
                margin: 2,
                color: {
                    dark: '#1a1a1a',
                    light: '#ffffff'
                }
            });

            // Remplacer le contenu de chargement par le QR code
            qrContainer.innerHTML = '';
            qrContainer.appendChild(canvas);

            console.log('QR Code généré pour le membre:', this.memberDocumentId);

        } catch (error) {
            console.error('Erreur lors de la génération du QR code:', error);
            const qrContainer = document.getElementById('member-qr-code');
            if (qrContainer) {
                qrContainer.innerHTML = `
                    <p style="color: #ff6b6b;">Erreur lors de la génération du QR code</p>
                `;
            }
        }
    }

    async downloadMemberCard() {
        if (!this.memberDocumentId) {
            this.showError('Erreur: Aucune donnée de membre disponible');
            return;
        }

        try {
            const downloadBtn = document.getElementById('download-member-card');
            if (downloadBtn) {
                downloadBtn.textContent = '📄 Génération en cours...';
                downloadBtn.disabled = true;
            }

            // Créer le PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('portrait', 'mm', 'a4');
            
            // Couleurs
            const goldColor = [255, 215, 0];
            const darkColor = [26, 26, 26];

            // Background
            pdf.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.rect(0, 0, 210, 297, 'F');

            // Titre
            pdf.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
            pdf.setFontSize(28);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CARTE MEMBRE', 105, 30, { align: 'center' });
            
            pdf.setFontSize(20);
            pdf.text('ForNap - Early Member', 105, 45, { align: 'center' });

            // Logo ForNap (texte stylisé en or)
            pdf.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('🔥 ForNap', 105, 70, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Tiers Lieu Culturel', 105, 85, { align: 'center' });

            // QR Code (prend le maximum de place)
            const qrCodeData = `FORNAP-MEMBER:${this.memberDocumentId}`;
            
            // Créer un grand QR code
            const qrCanvas = document.createElement('canvas');
            await QRCode.toCanvas(qrCanvas, qrCodeData, {
                width: 600,
                margin: 4,
                color: {
                    dark: '#1a1a1a',
                    light: '#ffffff'
                }
            });

            const qrDataUrl = qrCanvas.toDataURL('image/png');
            
            // Ajouter le QR code au centre de la page (grande taille)
            const qrSize = 140; // Taille du QR code en mm
            const qrX = (210 - qrSize) / 2; // Centrer horizontalement
            const qrY = 110; // Position verticale
            
            pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

            // Informations en bas
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Scannez ce code pour accéder à vos avantages membres', 105, 270, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.text(`ID Membre: ${this.memberDocumentId}`, 105, 280, { align: 'center' });
            pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 290, { align: 'center' });

            // Télécharger le PDF
            pdf.save(`ForNap-Carte-Membre-${this.memberDocumentId}.pdf`);

            // Restaurer le bouton
            if (downloadBtn) {
                downloadBtn.textContent = '📄 Télécharger ma carte membre (PDF)';
                downloadBtn.disabled = false;
            }

            console.log('Carte membre PDF générée avec succès');

        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            this.showError('Erreur lors de la génération de la carte membre');
            
            // Restaurer le bouton en cas d'erreur
            const downloadBtn = document.getElementById('download-member-card');
            if (downloadBtn) {
                downloadBtn.textContent = '📄 Télécharger ma carte membre (PDF)';
                downloadBtn.disabled = false;
            }
        }
    }

    async saveToFirebase(collectionName, data) {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            console.log('Document ajouté avec ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Erreur Firebase:', error);
            throw error;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateZipCode(zipcode) {
        const zipcodeRegex = /^[0-9]{5}$/;
        return zipcodeRegex.test(zipcode);
    }

    showError(message) {
        // Créer ou mettre à jour le message d'erreur
        let errorElement = document.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            document.querySelector('.content-wrapper').prepend(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Masquer après 5 secondes
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemberSignup();
});

// Expose methods for modal buttons
window.continueAsInterested = function() {
    if (window.memberSignupInstance) {
        window.memberSignupInstance.continueAsInterested();
    }
};

window.upgradeToMember = function() {
    if (window.memberSignupInstance) {
        window.memberSignupInstance.upgradeToMember();
    }
};

// Store instance globally for modal access
document.addEventListener('DOMContentLoaded', () => {
    window.memberSignupInstance = new MemberSignup();
}); 