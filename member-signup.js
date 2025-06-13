class MemberSignup {
    constructor() {
        this.currentMode = null;
        this.currentFormData = null;
        this.currentMemberId = null;
        this.memberData = null;
        
        // Configuration Sandbox HelloAsso
        this.helloAssoClientId = '28eba7759dce4f0aaeb80b1e7e264f72';
        this.helloAssoClientSecret = 'qWWRz7Dcbsi1nMxzCL8jHpRSlEXrvu0g';
        this.organizationSlug = 'no-id-lab';
        this.baseUrl = 'https://api.helloasso-sandbox.com/v5';
        this.oauthUrl = 'https://api.helloasso-sandbox.com/oauth2';
        
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
            amount: 10, // 10 centimes pour test
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
                
                // Sauvegarder en Firebase et récupérer l'ID
                const memberId = await this.saveToFirebase('members', this.currentFormData);
                this.currentMemberId = memberId;
                
                // Sauvegarder une copie des données pour le PDF
                this.memberData = { ...this.currentFormData };
                
                // Générer et afficher le QR code
                await this.generateMemberQRCode(memberId);
                this.currentFormData = null;
            }
            
            // Afficher le succès avec QR code
            this.hideAllForms();
            setTimeout(() => {
                document.getElementById('success-member').classList.remove('hidden');
            }, 300);
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde après paiement:', error);
            // Même en cas d'erreur de sauvegarde, afficher le succès car le paiement a été effectué
            this.hideAllForms();
            setTimeout(() => {
                document.getElementById('success-member').classList.remove('hidden');
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

    async generateMemberQRCode(memberId) {
        try {
            // Créer le QR code avec l'ID du membre
            const qrContainer = document.getElementById('qr-code-container');
            if (qrContainer) {
                qrContainer.innerHTML = '<div class="qr-loading">Génération du QR code...</div>';
                
                // Générer le QR code
                const qr = qrcode(0, 'M');
                qr.addData(memberId);
                qr.make();
                
                // Créer l'image du QR code
                const qrImage = qr.createImgTag(4);
                qrContainer.innerHTML = qrImage;
                qrContainer.classList.add('loaded');
                
                // Mettre à jour l'ID membre affiché
                const memberIdElement = document.getElementById('member-id-display');
                if (memberIdElement) {
                    memberIdElement.textContent = memberId;
                }
                
                console.log('QR Code généré pour le membre:', memberId);
            }
        } catch (error) {
            console.error('Erreur lors de la génération du QR code:', error);
            const qrContainer = document.getElementById('qr-code-container');
            if (qrContainer) {
                qrContainer.innerHTML = '<div style="color: #ff6b6b;">Erreur de génération du QR code</div>';
            }
        }
    }

    async generateMembershipPDF() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configuration
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Récupérer le QR code
            const qrContainer = document.querySelector('#qr-code-container img');
            
            if (qrContainer) {
                // Convertir l'image QR en canvas puis en image pour le PDF
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const qrImg = new Image();
                
                qrImg.onload = () => {
                    canvas.width = qrImg.width;
                    canvas.height = qrImg.height;
                    ctx.drawImage(qrImg, 0, 0);
                    
                    const qrData = canvas.toDataURL('image/png');
                    
                    // Tentative de chargement du logo ForNap
                    const logoImg = new Image();
                    logoImg.crossOrigin = 'anonymous';
                    
                    logoImg.onload = () => {
                        // Ajouter le logo en haut
                        const logoSize = 40;
                        const logoX = (pageWidth - logoSize) / 2;
                        
                        const logoCanvas = document.createElement('canvas');
                        const logoCtx = logoCanvas.getContext('2d');
                        logoCanvas.width = logoImg.width;
                        logoCanvas.height = logoImg.height;
                        logoCtx.drawImage(logoImg, 0, 0);
                        
                        const logoData = logoCanvas.toDataURL('image/png');
                        doc.addImage(logoData, 'PNG', logoX, 15, logoSize, logoSize);
                        
                        this.finalizePDF(doc, qrData, pageWidth, pageHeight);
                    };
                    
                    logoImg.onerror = () => {
                        // Si le logo ne charge pas, continuer sans logo
                        console.log('Logo non trouvé, génération du PDF sans logo');
                        this.finalizePDF(doc, qrData, pageWidth, pageHeight);
                    };
                    
                    // Tenter de charger le logo
                    logoImg.src = './logo.png';
                };
                
                qrImg.src = qrContainer.src;
            } else {
                this.showError('QR code non trouvé');
            }
            
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            this.showError('Erreur lors de la génération du PDF');
        }
    }

    finalizePDF(doc, qrData, pageWidth, pageHeight) {
        // Titre
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('ForNap - Carte de Membre', pageWidth / 2, 75, { align: 'center' });
        
        // Sous-titre
        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.text('Early Member', pageWidth / 2, 90, { align: 'center' });
        
        // Informations membre
        if (this.memberData && this.currentMemberId) {
            doc.setFontSize(12);
            doc.text(`Nom: ${this.memberData.firstname} ${this.memberData.lastname}`, 20, 115);
            doc.text(`Email: ${this.memberData.email}`, 20, 130);
            doc.text(`ID Membre: ${this.currentMemberId}`, 20, 145);
            doc.text(`Date d'adhésion: ${new Date().toLocaleDateString('fr-FR')}`, 20, 160);
        }
        
        // QR Code (plus grand et centré)
        const qrSize = 80;
        const qrX = (pageWidth - qrSize) / 2;
        const qrY = 180;
        
        doc.addImage(qrData, 'PNG', qrX, qrY, qrSize, qrSize);
        
        // Instructions
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Présentez ce QR code lors de vos visites au ForNap', pageWidth / 2, qrY + qrSize + 20, { align: 'center' });
        
        // Footer
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Généré automatiquement - ForNap Tiers Lieu Culturel', pageWidth / 2, pageHeight - 15, { align: 'center' });
        doc.text(`ID: ${this.currentMemberId}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        
        // Télécharger le PDF
        const filename = `ForNap-Carte-Membre-${this.currentMemberId || 'temp'}.pdf`;
        doc.save(filename);
        
        console.log('PDF généré:', filename);
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

window.downloadMembershipPDF = function() {
    if (window.memberSignupInstance) {
        window.memberSignupInstance.generateMembershipPDF();
    }
};

// Store instance globally for modal access
document.addEventListener('DOMContentLoaded', () => {
    window.memberSignupInstance = new MemberSignup();
}); 