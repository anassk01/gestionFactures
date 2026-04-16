# Culture Web — Questions & Réponses

## HTTP & REST

**Q : C'est quoi une API REST ?**
> REST (Representational State Transfer) est un style d'architecture pour les APIs. Les règles principales :
> - Utilise HTTP (GET, POST, PUT, DELETE)
> - Stateless : chaque requête contient tout ce qu'il faut, le serveur ne garde pas de session
> - Ressources identifiées par des URLs (`/invoices`, `/suppliers/:id`)
> - Réponses en JSON

**Q : Différence entre GET, POST, PUT, DELETE ?**
| Méthode | Usage | Idempotent |
|---|---|---|
| GET | Lire des données | Oui |
| POST | Créer une ressource | Non |
| PUT | Modifier une ressource | Oui |
| DELETE | Supprimer une ressource | Oui |

> **Idempotent** = appeler la même requête plusieurs fois donne le même résultat.

**Q : C'est quoi les status HTTP importants ?**
| Code | Signification | Utilisé dans le projet |
|---|---|---|
| 200 | OK | GET réussi |
| 201 | Created | POST réussi (create) |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Pas de token / token invalide |
| 403 | Forbidden | Token valide mais pas les droits |
| 404 | Not Found | Ressource introuvable |
| 422 | Unprocessable Entity | Email déjà utilisé |
| 500 | Internal Server Error | Erreur serveur |

**Q : Différence entre 401 et 403 ?**
> - **401** : tu n'es pas authentifié (pas de token ou token invalide)
> - **403** : tu es authentifié mais tu n'as pas la permission (ex: essayer d'accéder aux données d'un autre user)

---

## Node.js & Express

**Q : C'est quoi Node.js ?**
> Environnement d'exécution JavaScript côté serveur, basé sur le moteur V8 de Chrome. Permet d'écrire du JavaScript hors du navigateur.

**Q : C'est quoi Express ?**
> Framework web minimaliste pour Node.js. Il facilite la création de routes, la gestion des middlewares et les réponses HTTP.

**Q : C'est quoi un middleware Express ?**
> Une fonction qui s'exécute entre la réception d'une requête et l'envoi de la réponse. Signature : `(req, res, next)`. Elle peut :
> - Modifier `req` ou `res`
> - Terminer la requête (`res.json()`)
> - Passer au suivant (`next()`)

**Q : C'est quoi `async/await` ?**
> Syntaxe pour gérer les opérations asynchrones (appels DB, appels réseau) de façon lisible. `await` attend la résolution d'une Promise avant de continuer. Évite le "callback hell".

```js
// Avec callback (old)
User.findById(id, function(err, user) { ... })

// Avec async/await (modern)
const user = await User.findById(id);
```

**Q : C'est quoi `dotenv` et `.env` ?**
> `dotenv` charge les variables d'environnement depuis un fichier `.env` dans `process.env`. Permet de ne pas mettre les secrets (JWT_SECRET, MONGO_URI) directement dans le code.

---

## MongoDB & Mongoose

**Q : Différence SQL vs NoSQL ?**
| SQL | NoSQL (MongoDB) |
|---|---|
| Tables avec schéma fixe | Collections de documents JSON flexibles |
| Relations avec JOIN | Relations avec populate() |
| Transactions ACID | Moins de garanties transactionnelles |
| MySQL, PostgreSQL | MongoDB, Redis |

**Q : C'est quoi un schéma Mongoose ?**
> Mongoose ajoute une couche de schéma sur MongoDB. Il définit la structure des documents, les types, les validations, et les valeurs par défaut. MongoDB seul n'impose rien.

**Q : C'est quoi `ref` dans un schéma Mongoose ?**
> Indique qu'un champ est une référence vers un autre modèle (comme une clé étrangère en SQL). Permet d'utiliser `populate()` pour charger les données liées.

---

## Sécurité

**Q : C'est quoi une injection NoSQL ?**
> Attaque où un utilisateur malveillant envoie un objet JSON au lieu d'une string pour manipuler les requêtes MongoDB. Exemple : `{ email: { $gt: "" } }` pour bypasser l'authentification. Mongoose protège en partie grâce aux schémas typés.

**Q : Pourquoi mettre `JWT_SECRET` dans `.env` et pas dans le code ?**
> Si le secret est dans le code et que le repo est public (GitHub), n'importe qui peut forger des tokens JWT valides. Le `.env` est dans `.gitignore` et n'est jamais committé.

**Q : C'est quoi le principe du moindre privilège ?**
> Un utilisateur ne doit avoir accès qu'aux données dont il a besoin. Dans ce projet : chaque query filtre sur `userId: req.user.id`, donc un client ne peut jamais voir les données d'un autre client.

---

## Git

**Q : C'est quoi un commit conventionnel ?**
> Format standard : `type: description`
> - `feat:` nouvelle fonctionnalité
> - `fix:` correction de bug
> - `docs:` documentation
> - `refactor:` refactoring sans changement fonctionnel

**Q : Pourquoi faire des commits réguliers ?**
> Pour avoir un historique lisible, pouvoir revenir en arrière, et montrer la progression du travail. Le jury regarde le journal de commits.
