# Guide Présentation Jury — Slide par Slide

---

## Slide 1 — Titre

**Ce que tu dis :**
> "Bonjour, je m'appelle Anass Kabil. Mon projet s'appelle Smart Invoice & Payment Tracking. C'est une API backend qui permet aux entreprises et freelances de gérer leurs factures fournisseurs. Elle est construite avec Node.js, Express, MongoDB et JWT."

**Durée : 20 secondes max. Ne pas s'étaler.**

---

## Slide 2 — Le Projet en Un Coup d'Oeil

**Ce que tu dis :**
> "Le problème de départ : gérer des dizaines de factures manuellement est complexe. On ne sait pas quelles factures sont en retard, on n'a pas de vision claire des montants restants, et les erreurs sont fréquentes.
>
> Notre solution : une API centralisée et sécurisée. Elle suit automatiquement le statut de chaque facture, enregistre les paiements partiels ou complets, et garantit que chaque client voit uniquement ses propres données."

**Questions possibles ici :**
- **Q : Pourquoi une API et pas une application web complète ?**
  > Une API est la brique de base. Elle peut être consommée ensuite par une app web, mobile, ou n'importe quel frontend. Le brief demandait un backend uniquement.

---

## Slide 3 — Technologies Utilisées

**Ce que tu dis pour chaque techno :**

- **Node.js** : "Environnement d'exécution JavaScript côté serveur. Il fait tourner mon API en dehors du navigateur."
- **Express.js** : "Framework qui me permet de créer les routes de l'API facilement — les adresses auxquelles on envoie les requêtes."
- **MongoDB** : "Base de données NoSQL. Elle stocke les données sous forme de documents JSON — utilisateurs, fournisseurs, factures, paiements."
- **Mongoose** : "Couche au-dessus de MongoDB. Elle définit la structure et les règles de validation des données avant de les sauvegarder."
- **JWT** : "JSON Web Token — c'est le badge numérique délivré à la connexion. Il prouve l'identité de l'utilisateur sur chaque requête."
- **bcrypt** : "Transforme le mot de passe en empreinte numérique illisible avant de le stocker. Même moi je ne peux pas lire le mot de passe en base."

**Questions possibles ici :**
- **Q : Pourquoi MongoDB et pas MySQL ?**
  > MongoDB est NoSQL, les données sont stockées en JSON — ce qui correspond directement au format des réponses de l'API. Pas besoin de schéma rigide à l'avance, c'est plus flexible pour ce type de projet.
- **Q : Quelle est la différence entre MongoDB et Mongoose ?**
  > MongoDB est la base de données. Mongoose est la bibliothèque Node.js qui permet de définir des schémas, des validations, et d'interagir avec MongoDB plus facilement.

---

## Slide 4 — Structure du Projet

**Ce que tu dis :**
> "J'ai utilisé une architecture MVC — Model, View, Controller — sans View puisqu'il n'y a pas de frontend.
>
> - `server.js` : point d'entrée, démarre le serveur et connecte toutes les pièces.
> - `config/` : connexion à la base de données MongoDB.
> - `models/` : structure des données — User, Supplier, Invoice, Payment.
> - `controllers/` : la logique métier — ce qui se passe quand une requête arrive.
> - `routes/` : les adresses URL disponibles et quel controller les traite.
> - `middlewares/` : vérification du token JWT avant chaque requête protégée."

**Questions possibles ici :**
- **Q : Pourquoi séparer routes et controllers ?**
  > Les routes font le routage — elles reçoivent la requête et appellent le bon controller. Les controllers contiennent la logique. Si on mélange les deux, le code devient illisible et difficile à maintenir.
- **Q : C'est quoi `server.js` exactement ?**
  > C'est le point d'entrée de l'application. Il initialise Express, branche tous les middlewares et toutes les routes, connecte la base de données, puis démarre le serveur sur le port défini.

---

## Slide 5 — Comment ça Fonctionne ?

**Ce que tu dis :**
> "Le flux utilisateur est simple en 5 étapes :
> 1. **Inscription** : l'utilisateur crée un compte avec email et mot de passe. Le mot de passe est haché avec bcrypt avant d'être sauvegardé.
> 2. **Connexion** : l'API vérifie les identifiants et délivre un token JWT valable 7 jours. Ce token est requis pour toute action.
> 3. **Fournisseurs** : le client enregistre ses fournisseurs — les entreprises chez qui il achète.
> 4. **Factures** : pour chaque achat, il crée une facture avec un montant, une date d'échéance et un fournisseur lié.
> 5. **Paiements** : il paie en une ou plusieurs fois. Le système met à jour le statut automatiquement."

**Questions possibles ici :**
- **Q : Comment le token JWT est-il envoyé ?**
  > Dans le header HTTP de chaque requête : `Authorization: Bearer {token}`. Le middleware l'extrait et vérifie sa validité.

---

## Slide 6 — Sécurité & Contrôle d'Accès

**Ce que tu dis :**
> "Quatre mécanismes de sécurité :
> 1. **bcrypt** : le mot de passe n'est jamais stocké en clair. Même l'admin ne peut pas le lire.
> 2. **JWT** : après connexion, l'utilisateur reçoit un token. Il doit le présenter à chaque requête dans le header Authorization.
> 3. **Middleware d'authentification** : avant chaque action protégée, le serveur vérifie la validité du token. Si absent ou invalide, la requête est bloquée avec un 401.
> 4. **Isolation des données** : chaque donnée est liée à son propriétaire via un `userId`. Un utilisateur ne peut jamais lire ou modifier les données d'un autre."

**Questions possibles ici :**
- **Q : Que se passe-t-il si quelqu'un modifie le payload du JWT ?**
  > La signature devient invalide. `jwt.verify()` lance une erreur et on retourne 401. C'est le principe de la signature avec le `JWT_SECRET` — seul le serveur connaît ce secret.
- **Q : Comment tu garantis l'isolation des données concrètement ?**
  > Chaque requête MongoDB filtre sur `userId: req.user.id`. Par exemple `Invoice.find({ userId: req.user.id })`. Si un utilisateur essaie d'accéder à une ressource qui ne lui appartient pas, le résultat est `null` et on retourne 404.

---

## Slide 7 — Diagramme de Cas d'Utilisation

**Ce que tu dis :**
> "Ce diagramme montre les deux acteurs du système et leurs actions.
>
> Le **Client** peut : s'inscrire, se connecter, gérer ses fournisseurs, créer et suivre ses factures, enregistrer des paiements, et consulter ses statistiques.
>
> L'**Admin** peut : lister tous les clients inscrits et consulter les données de n'importe quel client — c'est la partie bonus.
>
> Chaque rôle a des droits distincts. Le client ne voit que ses propres données. L'admin a une vue globale en lecture seule."

---

## Slide 8 — Diagramme de Classes

**Ce que tu dis :**
> "Ce diagramme montre les 4 entités du système et leurs relations.
>
> - **User** : l'utilisateur, client ou admin. Toutes les données lui appartiennent.
> - **Supplier** : créé par un client. Un supplier appartient à un seul client et peut avoir plusieurs factures.
> - **Invoice** : liée à un supplier et à un user. Elle a un montant, une date limite, et un statut mis à jour automatiquement.
> - **Payment** : lié à une facture. Plusieurs paiements partiels peuvent exister pour une même facture.
>
> Les relations : User possède Supplier, Supplier est lié à Invoice, Invoice a des Payments."

**Questions possibles ici :**
- **Q : Pourquoi Invoice a à la fois `userId` et `supplierId` ?**
  > `supplierId` lie la facture au fournisseur concerné. `userId` est redondant en théorie (on pourrait le récupérer via le supplier), mais il permet de filtrer directement les factures d'un user sans faire de jointure supplémentaire — plus efficace.

---

## Slide 9 — Diagramme de Séquence

**Ce que tu dis :**
> "Ce diagramme montre le flux complet d'enregistrement d'un paiement — la logique la plus complexe de l'API.
>
> 1. Le client envoie `POST /api/invoices/:id/payments` avec le montant et la date.
> 2. Le middleware vérifie le JWT. Si invalide, accès refusé.
> 3. L'API cherche la facture en base. Si introuvable, erreur 404.
> 4. Si la facture est déjà `paid`, refus immédiat.
> 5. L'API calcule la somme des paiements existants + le nouveau montant.
> 6. Si ça dépasse le montant de la facture → erreur 400. Si égal → statut `paid`. Si inférieur → statut `partially_paid`.
> 7. Le paiement est créé, la facture sauvegardée, et les deux sont retournés en réponse."

---

## Slide 10 — Les Routes de l'API

**Ce que tu dis :**
> "L'API expose 4 groupes de routes.
>
> **Authentification** : register, login, et voir son profil.
>
> **Fournisseurs** : CRUD complet — créer, lister, consulter, modifier, supprimer.
>
> **Factures** : CRUD avec des règles métier — on ne peut modifier qu'une facture non payée, et supprimer uniquement si aucun paiement n'existe.
>
> **Paiements** : enregistrer un paiement sur une facture, et lister les paiements d'une facture."

**Questions possibles ici :**
- **Q : Pourquoi `DELETE /api/invoices/:id` est bloqué si des paiements existent ?**
  > Un paiement est une trace financière réelle. Supprimer la facture effacerait cette trace. C'est une règle métier pour garder la cohérence des données.
- **Q : Pourquoi on ne peut pas modifier une facture payée ?**
  > Si la facture est payée, le montant est soldé. Modifier le montant après coup créerait une incohérence — les paiements enregistrés ne correspondraient plus au nouveau montant.

---

## Slide 11 — Suivi Automatique du Statut

**Ce que tu dis :**
> "Le statut d'une facture est mis à jour automatiquement à chaque paiement. Trois états possibles :
>
> - **UNPAID** : aucun paiement enregistré. C'est le statut par défaut à la création.
> - **PARTIALLY_PAID** : un ou plusieurs paiements ont été reçus, mais le total n'atteint pas encore le montant de la facture. Exemple : facture 1000 MAD, on a payé 600 MAD.
> - **PAID** : la somme de tous les paiements est égale au montant total. Une fois atteint, la facture ne peut plus être modifiée ni payée davantage."

---

## Slide 12 — Ce qui a été Réalisé

**Ce que tu dis :**
> "Pour résumer ce qui a été livré :
> - Authentification complète sécurisée avec JWT et bcrypt
> - CRUD fournisseurs avec isolation par client
> - CRUD factures avec contrôles métier
> - Système de paiements partiels avec mise à jour automatique du statut
> - Isolation totale des données
> - Health check et codes HTTP cohérents
> - Diagrammes UML : cas d'utilisation, classes, séquence
>
> Stack technique : Node.js + Express, MongoDB + Mongoose, JWT + bcrypt, architecture MVC, REST API."

**Pour finir :**
> "Je suis disponible pour vos questions."

---

## Timing recommandé (10 min)

| Slides | Temps |
|---|---|
| 1 — Titre | 20s |
| 2 — Problème / Solution | 1 min |
| 3 — Technologies | 1 min 30s |
| 4 — Structure | 1 min |
| 5 — Comment ça fonctionne | 1 min |
| 6 — Sécurité | 1 min |
| 7-8-9 — UML | 2 min |
| 10-11 — Routes + Statuts | 1 min |
| 12 — Réalisé | 30s |

---

## Checklist avant de monter

- [ ] Serveur démarre sans erreur (`node server.js`)
- [ ] MongoDB connecté
- [ ] Postman/Thunder Client prêt avec requêtes préparées
- [ ] Token JWT copié pour les requêtes protégées
- [ ] `git log --oneline` propre et lisible
- [ ] Trello ouvert sur le bon tableau
- [ ] Présentation ouverte sur le bon slide
