# 🏰 Le Fort - Diagrammes Techniques Exportables

## 📋 Guide d'Export des Diagrammes

### 🔧 **Méthodes d'Export Recommandées**

#### 1. **Mermaid Live Editor** ⭐ (Recommandé)
- **URL** : https://mermaid.live/
- **Étapes** :
  1. Copier le code Mermaid ci-dessous
  2. Le coller dans l'éditeur
  3. Cliquer "Export" → Choisir le format
  4. **PNG** (présentations) ou **SVG** (qualité vectorielle)

#### 2. **Extensions VS Code**
- Installer : `Mermaid Markdown Syntax Highlighting`
- Installer : `Markdown Preview Mermaid Support` 
- Ouvrir ce fichier → `Ctrl+Shift+V` pour prévisualiser

#### 3. **Outils en Ligne**
- **Draw.io** : Peut importer du Mermaid
- **GitHub/GitLab** : Rendu natif dans README
- **Notion** : Blocs Mermaid supportés

---

## 🗺️ **Diagramme 1 : Vue d'Ensemble Système**

```mermaid
graph TD
    subgraph "Frontend"
        A[Site Web] --> A1[Login/Signup]
        A --> A2[Dashboard]
        A --> A3[Shop]
        A --> A4[Booking]
        A --> A5[Profile]
    end

    subgraph "Backend Services"
        B[API Gateway] --> B1[Auth Service]
        B --> B2[User Service] 
        B --> B3[Payment Service]
        B --> B4[Loyalty Service]
        B --> B5[Event Service]
        B --> B6[Analytics]
    end

    subgraph "Database"
        C[(PostgreSQL)] --> C1[users]
        C --> C2[memberships]
        C --> C3[loyalty_points]
        C --> C4[orders]
        C --> C5[events]
        C --> C6[analytics]
    end

    subgraph "Membership Levels"
        D[Visitor] --> D1[Monthly 2€]
        D1 --> D2[Annual 12€]
        D2 --> D3[Active Member]
        D2 --> D4[Benefactor]
        D3 --> D5[Honor Member]
        D4 --> D5
    end

    A1 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B5
    B1 --> C1
    B2 --> C2
    B4 --> C3

    classDef frontend fill:#e3f2fd,stroke:#1976d2
    classDef backend fill:#f3e5f5,stroke:#7b1fa2  
    classDef database fill:#e8f5e8,stroke:#388e3c
    classDef membership fill:#fff3e0,stroke:#f57c00

    class A,A1,A2,A3,A4,A5 frontend
    class B,B1,B2,B3,B4,B5,B6 backend
    class C,C1,C2,C3,C4,C5,C6 database
    class D,D1,D2,D3,D4,D5 membership
```

---

## ⚙️ **Diagramme 2 : Architecture Microservices**

```mermaid
flowchart TB
    subgraph "Client Apps"
        WEB[Web App<br/>React/Vue]
        MOBILE[Mobile App<br/>React Native]
    end

    subgraph "API Layer"
        GATEWAY[API Gateway<br/>Auth & Routing]
    end

    subgraph "Core Services"
        AUTH[🔐 Authentication<br/>JWT + OAuth]
        USER[👤 User Management<br/>Profiles & Preferences]
        MEMBER[🎫 Membership<br/>Subscriptions & Tiers]
        LOYALTY[⭐ Loyalty System<br/>Points & Rewards]
        ORDER[🛒 Order Management<br/>Purchases & History]
        EVENT[📅 Event Booking<br/>Reservations & Calendar]
        NOTIF[📱 Notifications<br/>Email & Push]
        ANALYTICS[📊 Analytics<br/>Tracking & Insights]
    end

    subgraph "Data Layer"
        MAIN[(Main DB<br/>PostgreSQL)]
        CACHE[(Redis Cache<br/>Sessions)]
        FILES[(File Storage<br/>Images)]
    end

    subgraph "External APIs"
        PAYMENT[💳 Stripe<br/>Payments]
        EMAIL[📧 SendGrid<br/>Emails]
        STORAGE[☁️ Cloudinary<br/>Media]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> USER  
    GATEWAY --> MEMBER
    GATEWAY --> LOYALTY
    GATEWAY --> ORDER
    GATEWAY --> EVENT
    GATEWAY --> ANALYTICS

    AUTH --> MAIN
    USER --> MAIN
    MEMBER --> MAIN
    LOYALTY --> MAIN
    ORDER --> MAIN
    EVENT --> MAIN

    USER --> CACHE
    LOYALTY --> CACHE

    ORDER --> PAYMENT
    NOTIF --> EMAIL
    USER --> STORAGE

    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef api fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef service fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class WEB,MOBILE client
    class GATEWAY api
    class AUTH,USER,MEMBER,LOYALTY,ORDER,EVENT,NOTIF,ANALYTICS service
    class MAIN,CACHE,FILES data
    class PAYMENT,EMAIL,STORAGE external
```

---

## 🔄 **Diagramme 3 : Flux Utilisateur Complet**

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant API as API Gateway
    participant AUTH as Auth Service
    participant USER as User Service
    participant MEMBER as Membership
    participant LOYALTY as Loyalty System
    participant DB as Database

    Note over U,DB: 1. Registration Flow
    U->>W: Visit website
    W->>API: Request signup
    API->>AUTH: Create account
    AUTH->>DB: Save user data
    AUTH-->>API: Return JWT token
    API-->>W: Confirmation + token
    W-->>U: Account created

    Note over U,DB: 2. Profile Completion
    U->>W: Complete detailed profile
    W->>API: Submit profile data
    API->>USER: Update user profile
    USER->>DB: Store profile info
    USER->>LOYALTY: Award completion bonus
    LOYALTY->>DB: Add 50 points
    LOYALTY-->>USER: Points added
    USER-->>API: Profile updated
    API-->>W: Success confirmation
    W-->>U: Profile complete + bonus points

    Note over U,DB: 3. Membership Subscription
    U->>W: Subscribe to annual plan (12€)
    W->>API: Process subscription
    API->>MEMBER: Create membership
    MEMBER->>DB: Save membership data
    MEMBER->>LOYALTY: Award welcome bonus
    LOYALTY->>DB: Add 100 points
    MEMBER-->>API: Membership active
    API-->>W: Subscription confirmed
    W-->>U: Welcome to Le Fort!

    Note over U,DB: 4. Purchase with Points
    U->>W: Order coffee (5€)
    W->>API: Submit order
    API->>LOYALTY: Check available points
    LOYALTY->>DB: Query point balance
    DB-->>LOYALTY: 150 points available
    LOYALTY->>API: Apply 100 points discount (-1€)
    API->>U: Order confirmed (4€ + points earned)
    LOYALTY->>DB: Update point balance
```

---

## 🎯 **Diagramme 4 : Gamification & Engagement**

```mermaid
mindmap
  root)Point System(
    Earning Points
      Purchases
        Café 1pt/€
        Restaurant 2pts/€
        Shop 1pt/€
        Events 3pts/€
      Profile Actions
        Complete profile +50pts
        Add skills +25pts
        Preferences +15pts
      Social Actions
        Referral +100pts
        Survey response +10pts
        Event attendance +25pts
        Review/feedback +20pts
      Membership Bonuses
        Monthly signup +25pts
        Annual signup +100pts
        Active status +200pts
        Benefactor +500pts
    
    Spending Points
      Instant Rewards
        100pts Free coffee
        250pts 10% discount
        500pts Exclusive event
        1000pts Free meal
      Membership Perks
        Active 20% permanent discount
        Benefactor VIP events
        Honor lifetime access
      Exclusive Access
        Early event booking
        New product previews
        Programming consultation
        Private member events
    
    Automated Tiers
      Bronze 0-499pts
        Basic rewards
        Standard communication
      Silver 500-1999pts
        Enhanced rewards
        Event invitations
        Priority support
      Gold 2000+ pts
        Premium rewards
        Early access
        Consultation rights
        Exclusive experiences
```

---

## 🗄️ **Diagramme 5 : Structure Base de Données Détaillée**

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        date date_of_birth
        text address
        string profession
        string company
        boolean is_entrepreneur
        json interests
        json skills
        json dietary_preferences
        int profile_completion
        timestamp created_at
        timestamp updated_at
    }

    MEMBERSHIPS {
        uuid id PK
        uuid user_id FK
        enum type
        enum status
        date start_date
        date end_date
        decimal amount_paid
        string payment_method
        boolean auto_renewal
        string special_status
        timestamp created_at
    }

    LOYALTY_POINTS {
        uuid id PK
        uuid user_id FK
        int points
        enum transaction_type
        string source
        uuid reference_id
        text description
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid user_id FK
        string order_number UK
        decimal total_amount
        decimal discount_amount
        int points_used
        int points_earned
        enum order_type
        enum status
        timestamp created_at
    }

    EVENTS {
        uuid id PK
        string title
        text description
        timestamp start_date
        timestamp end_date
        int max_participants
        decimal price
        decimal member_price
        boolean requires_membership
        string category
        enum status
        timestamp created_at
    }

    USER_INTERACTIONS {
        uuid id PK
        uuid user_id FK
        string interaction_type
        string page_visited
        int duration
        string device_type
        json metadata
        timestamp created_at
    }

    RESERVATIONS {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        enum status
        timestamp created_at
    }

    PRODUCTS {
        uuid id PK
        string name
        text description
        decimal price
        decimal member_price
        string category
        boolean available
        timestamp created_at
    }

    USERS ||--o{ MEMBERSHIPS : has
    USERS ||--o{ LOYALTY_POINTS : earns
    USERS ||--o{ ORDERS : places
    USERS ||--o{ USER_INTERACTIONS : generates
    USERS ||--o{ RESERVATIONS : makes
    EVENTS ||--o{ RESERVATIONS : receives
    ORDERS }o--o{ PRODUCTS : contains
```

---

## 📊 **Instructions d'Export**

### 🖼️ **Pour Export PNG/SVG (Recommandé)**
1. Aller sur https://mermaid.live/
2. Copier un diagramme ci-dessus
3. Coller dans l'éditeur
4. Cliquer "Export" → PNG (1080p) ou SVG
5. Télécharger et utiliser dans présentations

### 📄 **Pour Documents**
- **Word/PowerPoint** : Utiliser PNG haute résolution
- **Figma/Adobe** : Utiliser SVG pour édition
- **Web** : SVG pour qualité responsive

### 🔄 **Pour Mise à Jour**
- Modifier le code Mermaid ici
- Re-exporter depuis Mermaid Live
- Garder ce fichier comme source de vérité

---

*Diagrammes créés pour Le Fort - Architecture Technique*  
*Dernière mise à jour : $(date)* 