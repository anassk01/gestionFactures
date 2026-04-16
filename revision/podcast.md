# Podcast Révision — Smart Invoice & Payment Tracking
### *À lire à voix haute, seul*

---

## INTRO

[direct, pas de chichis] :
Bienvenue sur **Dev or Die**. Le jury c'est demain. On va réviser tout le projet maintenant. Architecture, auth, modèles, paiements, mise en situation, culture web. Tout. On commence.

---

## PARTIE 1 — C'est quoi ce projet ?

[confiant] :
Le projet s'appelle Smart Invoice and Payment Tracking. C'est une API backend sécurisée qui permet à des entreprises ou des freelances de gérer leurs fournisseurs, leurs factures, et leurs paiements.

Le problème qu'on résout : gérer des dizaines de factures manuellement c'est chaotique. On sait pas quelles factures sont en retard. On a pas de vision claire des montants restants. Et les erreurs coûtent de l'argent.

La solution : une API centralisée. Statut mis à jour automatiquement après chaque paiement. Paiements partiels ou complets supportés. Et isolation totale des données — chaque client voit uniquement ses propres données.

---

## PARTIE 2 — L'Architecture

[formel] :
Architecture du projet : MVC. Model View Controller. Mais sans View parce que c'est une API — pas de frontend.

- `models/` : structure des données
- `controllers/` : logique métier
- `routes/` : les URLs disponibles
- `middlewares/` : vérification du token avant chaque requête protégée
- `config/` : connexion à MongoDB
- `server.js` : point d'entrée — démarre le serveur, connecte la base, branche toutes les routes

Pourquoi séparer routes et controllers ? La route reçoit la requête et appelle le bon controller. C'est tout son job. La logique métier appartient au controller. Si tu mélanges les deux, le code devient illisible et impossible à maintenir.

---

## PARTIE 3 — Les Modèles Mongoose

[technique] :
Quatre modèles dans ce projet.

**User** : `name`, `email`, `password` hashé, `role` — client ou admin.

**Supplier** : `userId` qui référence le User propriétaire. `name` obligatoire. `contact`, `email`, `phone`, `address` optionnels.

**Invoice** : `userId`, `supplierId`, `amount`, `dueDate`, `details` optionnel, et `status` — unpaid, partially_paid, ou paid. Default : unpaid.

**Payment** : `invoiceId`, `amount`, `paymentDate`, `mode_paiement` optionnel, `note` optionnel.

[question difficile, j'anticipe] :
Pourquoi Invoice a `userId` ET `supplierId` ? Le `userId` est redondant — on peut le récupérer via le supplier non ?

[répond direct] :
Techniquement oui. Mais avec `userId` directement sur la facture on fait un seul filtre MongoDB au lieu de deux requêtes. C'est plus efficace.

`timestamps: true` — Mongoose ajoute automatiquement `createdAt` et `updatedAt` sur chaque document. Pratique pour le suivi.

`mongoose.Types.ObjectId.isValid()` avant chaque findOne — si l'ID n'est pas au format ObjectId, la requête crash. Cette vérification retourne un 400 propre au lieu d'une erreur serveur.

---

## PARTIE 4 — Auth JWT & bcrypt

[inspire] :
Authentification. Le sujet préféré de tous les jurys. On y va.

**Register** : on reçoit `name`, `email`, `password`, `password_confirmation`. On valide que tout est là, que les passwords matchent, que le password fait au moins 8 caractères. On vérifie que l'email n'existe pas déjà. On hashe le password avec bcrypt 10 rounds. On crée le user. On retourne le user sans le password — `select("-password")`, le `-` exclut ce champ de la réponse.

**Login** : on cherche le user par email. Si pas trouvé : 401 credentials invalides. Si trouvé, on compare avec `bcrypt.compare()`. Si ça match, on génère un JWT avec le payload `{ id, role }`, expiré dans 7 jours. On retourne le token.

Pourquoi "invalid credentials" et pas "email not found" ? Sécurité. Si on dit "email not found", un attaquant sait que l'email n'existe pas en base. Message générique = on donne aucune info utile à quelqu'un de malveillant.

**JWT — comment ça fonctionne** : trois parties séparées par des points. Header — algorithme utilisé. Payload — les données, ici `id` et `role`. Signature — créée avec `JWT_SECRET`, garantit que le token n'a pas été modifié.

Si quelqu'un modifie le payload : la signature devient invalide. `jwt.verify()` lance une erreur. On retourne 401.

Pourquoi 10 rounds bcrypt ? C'est le standard recommandé. Assez lent pour décourager le brute force — environ 100ms de calcul. Assez rapide pour que l'UX reste acceptable.

---

## PARTIE 5 — Le Middleware

[posé] :
C'est quoi un middleware Express ? Une fonction qui s'exécute entre la réception de la requête et l'envoi de la réponse. Elle reçoit `req`, `res`, et `next`. Elle peut modifier la requête, bloquer avec une réponse, ou appeler `next()` pour passer au controller suivant.

La logique de mon middleware `authenticate` :
On lit le header Authorization. S'il est absent ou ne commence pas par "Bearer", on retourne 401. On extrait le token avec `split(" ")[1]`. On vérifie avec `jwt.verify()`. Si valide, on attache le payload à `req.user` et on appelle `next()`. Si invalide, 401.

Pourquoi `req.user` ? Pour que le controller qui suit puisse accéder à `req.user.id` et `req.user.role` sans refaire une requête à la base de données.

---

## PARTIE 6 — Logique Paiements

[grande inspiration] :
Le flux complet d'ajout d'un paiement. C'est la partie la plus complexe. `POST /api/invoices/:id/payments`.

Un. On vérifie que l'ID est un ObjectId valide.
Deux. On vérifie que `amount` et `paymentDate` sont présents.
Trois. On vérifie que `paymentDate` n'est pas dans le futur.
Quatre. On cherche la facture avec `_id` et `userId` — ownership check.
Cinq. Si pas trouvée, 404.
Six. Si statut est `paid`, refus — facture déjà soldée.
Sept. On récupère tous les paiements existants de cette facture.
Huit. On calcule la somme avec `reduce()`.
Neuf. Si somme existante + nouveau montant dépasse le montant de la facture, 400.
Dix. Si somme + nouveau = montant total, statut devient `paid`.
Onze. Si somme + nouveau est inférieur, statut devient `partially_paid`.
Douze. On crée le paiement. On sauvegarde la facture. On retourne les deux.

`reduce()` : parcourt un tableau et accumule une valeur. `acc` c'est l'accumulateur, `curr` c'est l'élément courant. On commence à 0 et on additionne tous les `amount`. Résultat : la somme totale des paiements.

---

## PARTIE 7 — Mise en Situation LIVE

[ton qui change, mode jury] :
Mise en situation. On simule le jury. Je pose la question, je réponds directement.

---

**Ajoute un champ `category` optionnel à la facture.**

`models/Invoice.js` — j'ajoute `category: { type: String }` dans le schéma. Dans `createInvoice`, j'ajoute `if (req.body.category) invoice.category = req.body.category`. Pareil dans `updateInvoice`.

---

**Le token doit expirer en 2 heures.**

`controllers/auth.controller.js`, ligne du `jwt.sign()`. Je change `"7d"` en `"2h"`.

---

**Un client ne peut pas avoir plus de 5 fournisseurs.**

Dans `createSupplier`, avant la création :
`const count = await Supplier.countDocuments({ userId: req.user.id });`
`if (count >= 5) return res.status(400).json({ message: "maximum 5 fournisseurs atteint" });`

---

**Filtre par statut sur GET /invoices.**

Dans `getInvoices`, je crée un objet `filter = { userId: req.user.id }`. Si `req.query.status` existe, j'ajoute `filter.status = req.query.status`. Ensuite `Invoice.find(filter)`. Utilisation : `GET /api/invoices?status=unpaid`.

---

**Trier les factures de la plus récente à la plus ancienne.**

Sur le `Invoice.find()`, j'ajoute `.sort({ createdAt: -1 })`. Le `-1` c'est décroissant.

---

**Empêcher la suppression d'un fournisseur s'il a des factures.**

Dans `deleteSupplier`, avant de supprimer :
`const hasInvoices = await Invoice.exists({ supplierId: req.params.id });`
`if (hasInvoices) return res.status(400).json({ message: "ce fournisseur a des factures" });`
Et j'importe `Invoice` en haut du fichier.

---

**Ajouter une route pour changer le mot de passe.**

Nouvelle route `PUT /api/auth/password`. Dans le controller : on récupère `oldPassword` et `newPassword` du body. On cherche le user. On compare l'ancien password avec `bcrypt.compare()`. Si incorrect, 400. Si correct, on hashe le nouveau avec `bcrypt.hash()` et on sauvegarde.

---

## PARTIE 8 — Culture Web Rapide

[rythmé] :
Status HTTP. Vite.

200 — OK. Requête réussie.
201 — Created. Ressource créée.
400 — Bad Request. Données invalides.
401 — Unauthorized. Pas authentifié, token absent ou invalide.
403 — Forbidden. Authentifié mais pas les droits.
404 — Not Found. Ressource introuvable.
500 — Internal Server Error. Bug serveur.

Différence 401 et 403 : 401 tu n'es pas identifié. 403 tu es identifié mais t'as pas la permission.

C'est quoi REST ? Style d'architecture pour les APIs. Stateless — chaque requête contient tout ce qu'il faut. Ressources identifiées par des URLs. Méthodes HTTP pour les actions : GET lire, POST créer, PUT modifier, DELETE supprimer. Réponses en JSON.

C'est quoi stateless ? Le serveur ne garde aucun état entre les requêtes. Chaque requête est indépendante — d'où le token JWT envoyé à chaque fois.

Différence SQL et NoSQL ? SQL : tables avec schéma fixe, relations avec JOIN. NoSQL MongoDB : collections de documents JSON flexibles, relations avec `populate()`.

---

## PARTIE 9 — Stats, Dashboard & Règles Métier

[technique] :
Stats fournisseur. `GET /api/suppliers/:id/stats`. On cherche le supplier, on vérifie qu'il appartient au user. On récupère toutes ses factures. On récupère tous les paiements liés à ces factures avec `$in` — on passe un tableau d'IDs de factures.

Ensuite on calcule :
- `totalAmount` — somme de tous les montants des factures avec `reduce()`
- `totalPaid` — somme de tous les paiements avec `reduce()`
- `totalRemaining` — `totalAmount - totalPaid`
- `percentPaid` — `Math.round((totalPaid / totalAmount) * 100)`. Si `totalAmount` vaut 0 on retourne 0 pour éviter une division par zéro.
- `overdue` — factures dont `status !== "paid"` ET `dueDate < Date.now()`. C'est un filtre JS sur le tableau, pas une requête MongoDB.
- `overdueAmount` — somme des montants des factures overdue avec `reduce()`

Dashboard. `GET /api/dashboard`. Même logique mais pour TOUS les fournisseurs et TOUTES les factures du user. En plus : top 3 fournisseurs par montant total de factures.

Comment le top 3 est calculé : on fait un `reduce()` sur les factures pour grouper par `supplierId` et additionner les montants. On obtient un objet. On le transforme en tableau avec `Object.entries()`. On trie par montant décroissant avec `.sort((a, b) => b[1] - a[1])`. On prend les 3 premiers avec `.slice(0, 3)`. On mappe pour ajouter le nom du supplier.

---

Règles DELETE facture. `DELETE /api/invoices/:id`. On vérifie l'ownership. Ensuite `Payment.exists({ invoiceId: req.params.id })`. Si des paiements existent, on retourne 400. Sinon on supprime. Pourquoi `exists()` et pas `findOne()` ? On a pas besoin des données du paiement — juste savoir s'il en existe un. `exists()` est plus léger, retourne juste un boolean.

Règles UPDATE facture. `PUT /api/invoices/:id`. On vérifie l'ownership. Si `invoice.status === "paid"`, on retourne 400 — facture soldée, on ne peut plus rien changer. Sinon on met à jour `amount`, `dueDate`, `details` seulement — pas le `supplierId`, pas le `status` directement.

---

## PARTIE 10 — Questions Techniques Piégées

[concentré] :
`req.body` vs `req.params` vs `req.query` — différence.

`req.body` : données envoyées dans le corps de la requête. Utilisé avec POST et PUT. Exemple : `{ amount: 500, paymentDate: "2026-04-10" }`.

`req.params` : variables dans l'URL. Exemple : `/api/invoices/:id` — `req.params.id` contient l'ID passé dans l'URL.

`req.query` : paramètres après le `?` dans l'URL. Exemple : `/api/invoices?status=unpaid` — `req.query.status` vaut `"unpaid"`.

---

`findOneAndUpdate()` vs `findOne()` + `save()` — quand choisir quoi.

`findOneAndUpdate()` : une seule requête MongoDB. Plus efficace. Utilisé dans `updateSupplier` où on met à jour directement.

`findOne()` + `save()` : deux requêtes. Mais nécessaire quand on a de la logique conditionnelle avant de sauvegarder. Utilisé dans `updateInvoice` — on vérifie le statut avant de modifier. Et dans `addPayment` — on calcule la somme, on décide du nouveau statut, puis on sauvegarde.

---

`populate()` — comment ça fonctionne.

`Invoice.find({ userId: req.user.id }).populate("supplierId", "name email")` — Mongoose fait une deuxième requête en base pour récupérer le document Supplier lié et l'injecter dans la réponse à la place de l'ID. Le deuxième argument `"name email"` spécifie quels champs récupérer. Sans ça, on aurait juste l'ObjectId.

---

`async/await` — pourquoi on l'utilise.

Les opérations MongoDB sont asynchrones — elles prennent du temps. Sans `async/await`, le code continue à s'exécuter sans attendre le résultat. `await` pause l'exécution jusqu'à ce que la Promise soit résolue. `async` est obligatoire sur la fonction qui utilise `await`.

---

`next()` dans un middleware — que se passe-t-il si on ne l'appelle pas.

La requête reste bloquée. Le controller n'est jamais appelé. Le client n'obtient jamais de réponse. C'est pour ça que dans le middleware `authenticate`, si le token est valide on appelle absolument `next()`. Si on oublie, l'API freeze.

---

`.env` et `.gitignore` — pourquoi c'est critique.

`.env` contient les secrets : `JWT_SECRET`, `MONGO_URI`. Si ces valeurs sont dans le code et que le repo est public sur GitHub, n'importe qui peut forger des tokens JWT valides ou accéder à la base de données. `.gitignore` exclut `.env` des commits pour qu'il ne soit jamais pushé.

---

## PARTIE 11 — UML & Culture Web Avancée

[posé] :
Les trois diagrammes UML du projet.

**Diagramme de cas d'utilisation** : montre les acteurs et leurs actions. Deux acteurs — Client et Admin. Le Client peut s'inscrire, se connecter, gérer ses fournisseurs, ses factures, ses paiements, consulter ses stats. L'Admin peut lister tous les clients et voir leurs données. Chaque rôle a des droits distincts.

**Diagramme de classes** : montre les 4 entités et leurs relations. User possède Supplier — relation 1 vers N. Supplier est lié à Invoice — relation 1 vers N. Invoice a des Payments — relation 1 vers N. Chaque classe montre ses attributs et leurs types.

**Diagramme de séquence** : montre le flux d'enregistrement d'un paiement étape par étape — requête client, vérification JWT par le middleware, recherche en base, calcul du statut, création du paiement, réponse. Les blocs `alt` représentent les cas alternatifs — invoice not found, already paid, montant dépassé.

---

Idempotence des méthodes HTTP.

Une méthode est idempotente si appeler la même requête plusieurs fois donne le même résultat. GET, PUT, DELETE sont idempotents. POST ne l'est pas — deux POST créent deux ressources différentes.

---

PUT vs PATCH.

PUT remplace la ressource entière — tous les champs doivent être envoyés. PATCH modifie partiellement — on envoie seulement les champs à changer. Dans ce projet j'utilise PUT mais je n'accepte que les champs envoyés — comportement proche de PATCH.

---

C'est quoi CORS.

Cross-Origin Resource Sharing. Mécanisme de sécurité du navigateur qui bloque les requêtes vers un domaine différent de celui de la page. Si un frontend sur `localhost:3000` appelle l'API sur `localhost:4001`, le navigateur bloque par défaut. On configure CORS côté serveur avec le package `cors` dans Express pour autoriser les origines voulues.

---

## OUTRO

[sérieux] :
Si le jury pose une question et je sais pas — je dis "Je ne suis pas sûr à 100% mais selon ma compréhension..." et j'explique ce que je sais. Je montre que je raisonne. Je bloque pas, je mens pas.

Si je connais pas du tout — "Je n'ai pas implémenté ça mais voilà comment j'aurais approché le problème."

Et je rappelle la règle d'or de ce projet :

[fort] :
`userId: req.user.id` sur chaque requête.

---

*Durée estimée à voix haute : 35 minutes*
*Lire debout, à voix haute, pas dans ta tête*
