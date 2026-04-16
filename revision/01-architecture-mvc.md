# Architecture & MVC

## C'est quoi MVC ?

MVC = **Model / View / Controller**

Dans ce projet il n'y a pas de View (pas de frontend), donc c'est MVC sans V.

| Couche | Rôle | Fichiers dans le projet |
|---|---|---|
| **Model** | Structure des données en base | `models/User.js`, `models/Invoice.js`... |
| **Controller** | Logique métier, traitement des requêtes | `controllers/auth.controller.js`... |
| **Route** | Reçoit la requête, appelle le bon controller | `routes/auth.routes.js`... |
| **Middleware** | S'exécute entre la requête et le controller | `middlewares/auth.middleware.js` |

## Flux d'une requête

```
Client → Route → Middleware → Controller → Model → MongoDB
                                                  ↓
Client ←              Réponse JSON               ←
```

**Exemple concret : `POST /api/invoices`**

1. La requête arrive sur `routes/invoices.routes.js`
2. Le middleware `authenticate` vérifie le token JWT
3. Le controller `createInvoice` valide les données, appelle `Invoice.create()`
4. MongoDB sauvegarde le document
5. Le controller renvoie `res.status(201).json(invoice)`

## Pourquoi cette structure ?

- **Séparation des responsabilités** : chaque fichier fait une seule chose
- **Maintenabilité** : si la logique change, on touche que le controller
- **Lisibilité** : on sait où chercher quoi

## Questions possibles

**Q : Pourquoi tu n'as pas mis la logique directement dans les routes ?**
> Parce que les routes doivent juste diriger le trafic. La logique métier appartient au controller. Si on mélange tout, le code devient illisible et impossible à maintenir.

**Q : C'est quoi le rôle exact du middleware dans ton projet ?**
> Le middleware `authenticate` s'exécute AVANT le controller. Il vérifie que le token JWT est valide. Si non, il bloque la requête avec 401. Si oui, il attache `req.user` et appelle `next()` pour passer au controller.

**Q : Pourquoi tu as un dossier `config/` ?**
> Pour isoler la configuration de la base de données. `connectDb()` est appelée une seule fois au démarrage du serveur dans `startServer()`.
