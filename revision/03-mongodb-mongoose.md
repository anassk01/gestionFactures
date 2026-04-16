# MongoDB & Mongoose

## C'est quoi MongoDB ?

Base de données **NoSQL** orientée documents. Au lieu de tables avec des lignes (SQL), on a des **collections** avec des **documents** JSON.

| SQL | MongoDB |
|---|---|
| Table | Collection |
| Ligne | Document |
| Colonne | Champ |
| JOIN | populate() / $lookup |

## Les 4 modèles du projet

### User
```js
{ name, email, password, role: "client"|"admin", timestamps }
```

### Supplier
```js
{ userId (ref User), name, contact?, email?, phone?, address?, timestamps }
```
`userId` → lien vers le propriétaire. Un supplier appartient à un seul client.

### Invoice
```js
{ userId (ref User), supplierId (ref Supplier), amount, dueDate, details?, status, timestamps }
status: "unpaid" | "partially_paid" | "paid"
```

### Payment
```js
{ invoiceId (ref Invoice), amount, paymentDate, mode_paiement?, note?, timestamps }
```

## Les relations entre collections

```
User (1) ──────< Supplier (N)
User (1) ──────< Invoice  (N)
Supplier (1) ──< Invoice  (N)
Invoice (1) ───< Payment  (N)
```

Pas de JOIN en MongoDB — on utilise `populate()` :

```js
// Récupère la facture ET les infos du fournisseur en un appel
Invoice.findOne({ _id: id }).populate("supplierId", "name email");
```

## L'isolation des données

Chaque requête filtre sur `userId: req.user.id` :

```js
// Un client ne voit QUE ses factures
Invoice.find({ userId: req.user.id })

// Un client ne peut modifier QUE son fournisseur
Supplier.findOneAndUpdate({ _id: id, userId: req.user.id }, ...)
```

Si `userId` ne correspond pas → `null` retourné → 404.

## Opérations Mongoose utilisées

| Méthode | Usage dans le projet |
|---|---|
| `Model.create()` | Créer un document |
| `Model.find()` | Lister tous les documents |
| `Model.findOne()` | Trouver un document précis |
| `Model.findOneAndUpdate()` | Modifier et retourner |
| `Model.findOneAndDelete()` | Supprimer et retourner |
| `Model.exists()` | Vérifier existence (boolean) |
| `Model.updateMany()` | Mettre à jour plusieurs |
| `instance.save()` | Sauvegarder après modification manuelle |
| `instance.deleteOne()` | Supprimer l'instance |
| `instance.populate()` | Charger une référence après coup |

## Questions possibles

**Q : Pourquoi MongoDB et pas MySQL/PostgreSQL ?**
> MongoDB est flexible, pas besoin de définir un schéma rigide à l'avance. Pour une API JSON, les documents MongoDB correspondent directement au format de réponse. C'est aussi ce qui était demandé dans le brief.

**Q : C'est quoi `timestamps: true` dans le schéma ?**
> Mongoose ajoute automatiquement `createdAt` et `updatedAt` à chaque document. Très utile pour le suivi.

**Q : Pourquoi `mongoose.Types.ObjectId.isValid(id)` avant chaque findOne ?**
> MongoDB lance une erreur si on lui passe un ID invalide (pas au format ObjectId). Cette vérification évite un crash serveur et retourne un 400 propre.

**Q : Différence entre `findOneAndUpdate()` et `findOne()` + `save()` ?**
> `findOneAndUpdate()` = une seule requête DB, plus efficace. `findOne()` + `save()` = deux requêtes, mais permet de modifier des champs conditionnellement avant de sauvegarder (utilisé dans `updateInvoice` et `addPayment`).

**Q : Pourquoi `Payment.exists()` dans deleteInvoice au lieu de `Payment.findOne()` ?**
> `exists()` retourne juste un boolean, plus léger — on n'a pas besoin des données du paiement, juste savoir s'il en existe un.
