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
        // Boutons de l'interface d'accueil
        const interestButton = document.querySelector('.interest-button');
        const membershipButton = document.querySelector('.membership-button');

        if (interestButton) {
            interestButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleChoiceSelection('interested');
            });
        }

        if (membershipButton) {
            membershipButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleChoiceSelection('member');
            });
        }

        // Les anciens sélecteurs ne sont plus nécessaires car remplacés par les nouveaux boutons

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
    }

    handleChoiceSelection(mode) {
        this.currentMode = mode;
        
        if (mode === 'interested') {
            // Rediriger directement vers la phase de contact
            this.showContactFormPhase();
            return;
        }
        
        if (mode === 'member') {
            // Activer la nouvelle phase du formulaire d'adhésion
            this.showAdhesionFormPhase();
            return;
        }
        
        // Pour les autres modes, continuer normalement
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
            amount: 55, // 55 centimes (minimum HelloAsso)
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
            console.log('=== DEBUT initializeHelloAssoPayment ===');
            console.log('Données reçues:', formData);
            
            // Afficher l'état de chargement
            console.log('Affichage de l\'état de chargement...');
            this.showLoadingState();
            
            // Créer la commande HelloAsso
            console.log('Création du checkout intent...');
            const checkoutIntent = await this.createCheckoutIntent(formData);
            console.log('Checkout intent reçu:', checkoutIntent);
            
            if (checkoutIntent && checkoutIntent.redirectUrl) {
                console.log('URL de redirection trouvée:', checkoutIntent.redirectUrl);
                console.log('Redirection vers HelloAsso en cours...');
                // Rediriger vers HelloAsso
                window.location.href = checkoutIntent.redirectUrl;
            } else {
                console.error('Pas d\'URL de redirection dans la réponse:', checkoutIntent);
                throw new Error('Impossible de créer la session de paiement - pas d\'URL de redirection');
            }
            
        } catch (error) {
            console.error('ERREUR dans initializeHelloAssoPayment:', error);
            console.error('Stack trace complet:', error.stack);
            this.hideLoadingState();
            this.showError(`Erreur lors de l'initialisation du paiement: ${error.message}`);
        }
        
        console.log('=== FIN initializeHelloAssoPayment ===');
    }

    async createCheckoutIntent(formData) {
        try {
            console.log('=== DEBUT createCheckoutIntent ===');
            console.log('FormData reçu:', formData);
            
            // 1. Obtenir un token d'accès
            console.log('1. Obtention du token d\'accès...');
            const accessToken = await this.getAccessToken();
            console.log('Token obtenu:', accessToken ? 'OUI' : 'NON');
            
            // 2. Créer l'intent de checkout
            // Construction des URLs de retour sécurisées
            const currentUrl = window.location.href.split('?')[0]; // Enlever les paramètres existants
            const isLocal = currentUrl.includes('localhost') || currentUrl.includes('file://') || currentUrl.includes('127.0.0.1');
            
            // Utiliser l'URL GitHub Pages pour tous les environnements
            const baseReturnUrl = isLocal ? this.testReturnUrl : 'https://noagiannone03.github.io/for-nap-member/member-signup.html';
            console.log('URLs configurées:', { currentUrl, isLocal, baseReturnUrl });

            // Sauvegarder d'abord en Firebase pour avoir un ID
            console.log('2. Sauvegarde en Firebase...');
            const memberDocId = await this.saveToFirebase('members', {
                ...formData,
                paymentStatus: 'pending'
            });
            
            this.memberDocumentId = memberDocId;
            console.log('Membre pré-enregistré avec ID:', memberDocId);

            // RETOUR À LA STRUCTURE SIMPLE QUI FONCTIONNAIT
            const checkoutData = {
                totalAmount: 1200, // 12€ en centimes (au lieu de 55)
                initialAmount: 1200, // 12€ en centimes (au lieu de 55)
                itemName: 'Adhésion Early Member - ForNap',
                backUrl: baseReturnUrl + '?status=cancelled&memberid=' + memberDocId,
                errorUrl: baseReturnUrl + '?status=error&memberid=' + memberDocId, 
                returnUrl: baseReturnUrl + '?status=success&memberid=' + memberDocId,
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
                    phone: formData.phone,
                    memberDocumentId: memberDocId
                }
            };

            console.log('3. Données de checkout préparées (structure simple):', checkoutData);
            console.log('3b. JSON stringifié:', JSON.stringify(checkoutData, null, 2));

            console.log('4. Tentative avec proxy CORS pour contourner le blocage HelloAsso...');
            
            // Utilisation d'un service proxy CORS public
            const response = await fetch('https://cors-anywhere.herokuapp.com/' + `${this.baseUrl}/organizations/${this.organizationSlug}/checkout-intents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(checkoutData)
            });

            console.log('Statut de la réponse:', response.status);
            console.log('Headers de la réponse:', [...response.headers.entries()]);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Erreur API HelloAsso:', response.status, errorData);
                throw new Error(`Erreur API: ${response.status} - ${errorData}`);
            }

            const result = await response.json();
            console.log('5. Checkout intent créé avec succès:', result);
            
            return result;
            
        } catch (error) {
            console.error('ERREUR dans createCheckoutIntent:', error);
            console.error('Stack trace:', error.stack);
            
            // Si le proxy échoue, essayons une approche différente
            console.log('Tentative de solution alternative...');
            this.showAlternativePaymentSolution();
            throw error;
        }
        
        console.log('=== FIN createCheckoutIntent ===');
    }

    async getAccessToken() {
        try {
            const response = await fetch('https://cors-anywhere.herokuapp.com/' + `${this.oauthUrl}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
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
        const memberId = urlParams.get('memberid');
        
        if (status) {
            switch (status) {
                case 'success':
                    this.handlePaymentSuccess(sessionId, memberId);
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

    async handlePaymentSuccess(sessionId, memberId) {
        console.log('Paiement réussi, session:', sessionId, 'memberId:', memberId);
        
        try {
            // Utiliser l'ID du membre passé en paramètre
            this.memberDocumentId = memberId || this.memberDocumentId || 'member-' + Date.now();
            
            // Rediriger vers la page de succès dédiée
            const successData = {
                id: this.memberDocumentId,
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            };
            
            const successUrl = `success.html?data=${encodeURIComponent(JSON.stringify(successData))}`;
            window.location.href = successUrl;

        } catch (error) {
            console.error('Erreur lors de la redirection:', error);
            // Fallback vers l'affichage local
            this.memberDocumentId = memberId || sessionId || 'member-' + Date.now();
            this.hideAllForms();
            setTimeout(() => {
                document.getElementById('success-member').classList.remove('hidden');
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
            
            // Couleurs - RETOUR AU ROSE SAUMON original
            const primaryColor = [32, 178, 170]; // Cyan #20B2AA
            const pinkBackground = [255, 204, 204]; // Rose saumon #ffcccc
            const darkColor = [0, 0, 0]; // Noir pour le texte

            // Background ROSE SAUMON comme avant
            pdf.setFillColor(pinkBackground[0], pinkBackground[1], pinkBackground[2]);
            pdf.rect(0, 0, 210, 297, 'F');

            // Titre
            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(28);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CARTE MEMBRE', 105, 30, { align: 'center' });
            
            pdf.setFontSize(20);
            pdf.text('ForNap - Early Member', 105, 45, { align: 'center' });

            // Logo ForNap (texte stylisé en cyan)
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
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
            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Scannez ce code pour accéder à vos avantages membres', 105, 270, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.text(`ID Membre: ${this.memberDocumentId}`, 105, 280, { align: 'center' });
            pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 290, { align: 'center' });

            // Statut Early Member (avec rectangle cyan)
            pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.roundedRect(20, 100, 170, 20, 3, 3, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('🔥 EARLY MEMBER STATUS', 105, 113, { align: 'center' });

            // Informations simplifiées (sans référence à memberData)
            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ID Membre:', 30, 150);
            pdf.text('Adhésion:', 30, 170);
            pdf.text('Statut:', 30, 190);

            // Valeurs simplifiées
            pdf.setFont('helvetica', 'normal');
            pdf.text(this.memberDocumentId, 75, 150);
            pdf.text('Jusqu\'à fin 2025', 75, 170);
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.text('ACTIF', 75, 190);

            // Avantages
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Vos avantages Early Member:', 30, 220);

            pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('• Place festival gratuite (valeur 15€)', 35, 235);
            pdf.text('• Accès exclusif ForNap', 35, 245);
            pdf.text('• Droit de vote sur les décisions', 35, 255);
            pdf.text('• Programme fidélité exclusif', 35, 265);
            pdf.text('• Statut d\'Early Member à vie', 35, 275);

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

    showAdhesionFormPhase() {
        // Ajouter la classe pour masquer le contenu principal
        document.body.classList.add('adhesion-phase-active');
        
        // Afficher la phase d'adhésion avec animation
        const adhesionPhase = document.getElementById('adhesion-form-phase');
        adhesionPhase.classList.add('active');
        
        // Configurer l'événement de soumission du formulaire d'adhésion
        const adhesionForm = document.getElementById('adhesion-signup-form');
        if (adhesionForm && !adhesionForm.hasAttribute('data-listener-added')) {
            adhesionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdhesionSubmit();
            });
            adhesionForm.setAttribute('data-listener-added', 'true');
        }
    }

    showContactFormPhase() {
        // Ajouter la classe pour masquer le contenu principal
        document.body.classList.add('contact-phase-active');
        
        // Afficher la phase de contact avec animation
        const contactPhase = document.getElementById('contact-form-phase');
        contactPhase.classList.add('active');
        
        // Configurer l'événement de soumission du formulaire de contact
        const contactForm = document.getElementById('contact-signup-form');
        if (contactForm && !contactForm.hasAttribute('data-listener-added')) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmit();
            });
            contactForm.setAttribute('data-listener-added', 'true');
        }
    }

    // Fonction pour calculer l'âge à partir de la date de naissance
    calculateAge(birthdate) {
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    async handleAdhesionSubmit() {
        console.log('=== DEBUT handleAdhesionSubmit ===');
        
        const form = document.getElementById('adhesion-signup-form');
        if (!form) {
            console.error('Formulaire adhesion-signup-form non trouvé !');
            this.showError('Erreur: formulaire non trouvé');
            return;
        }
        
        const formData = new FormData(form);
        console.log('FormData récupéré:', {
            lastname: formData.get('lastname'),
            firstname: formData.get('firstname'),
            birthdate: formData.get('birthdate'),
            zipcode: formData.get('zipcode'),
            email: formData.get('email'),
            phone: formData.get('phone')
        });
        
        const birthdate = formData.get('birthdate');
        const age = this.calculateAge(birthdate);
        console.log('Âge calculé:', age);
        
        const memberData = {
            type: 'member',
            lastname: formData.get('lastname'),
            firstname: formData.get('firstname'),
            birthdate: birthdate,
            age: age, // Ajouter l'âge calculé
            zipcode: formData.get('zipcode'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            amount: 1200, // 12€ en centimes (au lieu de 55)
            timestamp: new Date().toISOString()
        };

        console.log('Données membre préparées:', memberData);

        try {
            console.log('Début des validations...');
            
            // Validation
            if (!this.validateEmail(memberData.email)) {
                console.log('Email invalide:', memberData.email);
                this.showError('Veuillez saisir un email valide');
                return;
            }
            console.log('Email valide');

            if (!this.validateZipCode(memberData.zipcode)) {
                console.log('Code postal invalide:', memberData.zipcode);
                this.showError('Veuillez saisir un code postal valide (5 chiffres)');
                return;
            }
            console.log('Code postal valide');

            if (age < 16) {
                console.log('Âge insuffisant:', age);
                this.showError('Vous devez avoir au moins 16 ans pour adhérer');
                return;
            }
            console.log('Âge valide');

            console.log('Toutes les validations passées, sauvegarde des données...');
            
            // Sauvegarder les données temporairement
            this.currentFormData = memberData;
            
            console.log('Initialisation du paiement HelloAsso...');
            // Initialiser le paiement HelloAsso
            await this.initializeHelloAssoPayment(memberData);

        } catch (error) {
            console.error('ERREUR dans handleAdhesionSubmit:', error);
            console.error('Stack trace:', error.stack);
            this.showError('Une erreur est survenue. Veuillez réessayer.');
        }
        
        console.log('=== FIN handleAdhesionSubmit ===');
    }

    async handleContactSubmit() {
        const form = document.getElementById('contact-signup-form');
        const formData = new FormData(form);
        
        const contactData = {
            type: 'interested',
            firstname: formData.get('firstname'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            timestamp: new Date().toISOString()
        };

        try {
            // Validation
            if (!this.validateEmail(contactData.email)) {
                this.showError('Veuillez saisir un email valide');
                return;
            }

            // Sauvegarde en base
            await this.saveToFirebase('interested_users', contactData);
            
            // Afficher l'écran de succès stylé
            this.showContactSuccessPhase();

        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            this.showError('Une erreur est survenue. Veuillez réessayer.');
        }
    }

    showContactSuccessPhase() {
        // Masquer la phase de contact
        document.body.classList.remove('contact-phase-active');
        const contactPhase = document.getElementById('contact-form-phase');
        contactPhase.classList.remove('active');
        
        // Afficher la phase de succès
        document.body.classList.add('success-phase-active');
        const successPhase = document.getElementById('contact-success-phase');
        successPhase.classList.add('active');
    }

    // Fonction pour revenir au choix depuis n'importe quelle phase
    goBackToChoice() {
        // Nettoyer toutes les phases actives
        document.body.classList.remove('adhesion-phase-active', 'contact-phase-active', 'success-phase-active');
        
        const adhesionPhase = document.getElementById('adhesion-form-phase');
        const contactPhase = document.getElementById('contact-form-phase');
        const successPhase = document.getElementById('contact-success-phase');
        
        if (adhesionPhase) adhesionPhase.classList.remove('active');
        if (contactPhase) contactPhase.classList.remove('active');
        if (successPhase) successPhase.classList.remove('active');
        
        // Plus besoin de clear selection car les nouveaux boutons n'ont pas d'état sélectionné
        
        this.currentMode = null;
    }

    showAlternativePaymentSolution() {
        this.hideLoadingState();
        
        // Créer un message d'information avec lien direct HelloAsso
        const alternativeElement = document.createElement('div');
        alternativeElement.className = 'alternative-payment';
        alternativeElement.innerHTML = `
            <div class="alternative-content">
                <h3>🔄 Solution alternative</h3>
                <p>En raison d'une mise à jour de sécurité de HelloAsso, voici deux options :</p>
                
                <div class="payment-options">
                    <div class="payment-option">
                        <h4>Option 1 : Paiement direct</h4>
                        <p>Cliquez sur le bouton ci-dessous pour aller directement sur HelloAsso :</p>
                        <a href="https://www.helloasso.com/associations/no-id-lab/formulaires/1" 
                           target="_blank" 
                           class="direct-payment-btn">
                            💳 Payer sur HelloAsso
                        </a>
                    </div>
                    
                    <div class="payment-option">
                        <h4>Option 2 : Virement bancaire</h4>
                        <p>Envoyez 12€ par virement à :</p>
                        <div class="bank-details">
                            <strong>IBAN :</strong> FR76 XXXX XXXX XXXX XXXX XXXX XXX<br>
                            <strong>BIC :</strong> XXXXXXXXX<br>
                            <strong>Libellé :</strong> Adhésion ForNap - ${this.memberDocumentId || 'votre nom'}
                        </div>
                    </div>
                </div>
                
                <button class="back-btn" onclick="this.parentElement.parentElement.remove()">
                    ← Retour au formulaire
                </button>
            </div>
        `;
        
        document.querySelector('.content-wrapper').appendChild(alternativeElement);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.memberSignupInstance = new MemberSignup();
    
    // Expose methods for navigation
    window.goBackToChoice = () => window.memberSignupInstance.goBackToChoice();
}); 