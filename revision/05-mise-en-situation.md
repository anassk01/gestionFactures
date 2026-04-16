# Mise en Situation

Ces scénarios sont typiques d'un jury. Pour chaque cas : comprendre ce qui change et où modifier le code.

---

## Scénario 1 — "Ajoute un champ `description` à la facture"

**Où changer :**
1. `models/Invoice.js` → ajouter `description: { type: String }` dans le schéma
2. `controllers/invoice.controller.js` → dans `createInvoice`, ajouter :
   ```js
   if (req.body.description) invoice.description = req.body.description;
   ```
   Et dans `updateInvoice`, même chose.

**Ce qui ne change pas :** routes, middleware, models des autres collections.

---

## Scénario 2 — "Un client ne peut pas avoir plus de 10 fournisseurs"

**Où changer :** `controllers/suppliers.controller.js` dans `createSupplier` :

```js
const count = await Supplier.countDocuments({ userId: req.user.id });
if (count >= 10) {
  return res.status(400).json({ message: "maximum 10 fournisseurs atteint" });
}
```

---

## Scénario 3 — "Ajoute une route pour modifier le mot de passe"

**Nouvelle route :** `PUT /api/auth/password`

**Controller :**
```js
async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "ancien mot de passe incorrect" });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.status(200).json({ message: "mot de passe modifié" });
}
```

**Où ajouter :** `routes/auth.routes.js` + `controllers/auth.controller.js`

---

## Scénario 4 — "Le token doit expirer en 1 heure au lieu de 7 jours"

**Où changer :** `controllers/auth.controller.js` ligne 51 :
```js
// avant
{ expiresIn: "7d" }
// après
{ expiresIn: "1h" }
```

---

## Scénario 5 — "Ajoute un filtre par statut sur GET /api/invoices"

**Où changer :** `controllers/invoice.controller.js` dans `getInvoices` :

```js
async function getInvoices(req, res) {
  const filter = { userId: req.user.id };
  if (req.query.status) filter.status = req.query.status;

  const invoices = await Invoice.find(filter).populate("supplierId", "name email");
  res.status(200).json(invoices);
}
```

**Usage :** `GET /api/invoices?status=unpaid`

---

## Scénario 6 — "Empêche la suppression d'un fournisseur s'il a des factures"

**Où changer :** `controllers/suppliers.controller.js` dans `deleteSupplier` :

```js
const hasInvoices = await Invoice.exists({ supplierId: req.params.id });
if (hasInvoices) {
  return res.status(400).json({ message: "impossible de supprimer, des factures existent" });
}
```
Il faut aussi importer `Invoice` en haut du fichier.

---

## Scénario 7 — "Le montant d'une facture ne peut pas être négatif ou zéro"

**Deux endroits :**

1. **Modèle** `models/Invoice.js` : `amount: { type: Number, min: 0.1, required: true }` — déjà fait !
2. **Controller** `controllers/invoice.controller.js` dans `createInvoice` : ajouter une validation manuelle :
   ```js
   if (req.body.amount <= 0) {
     return res.status(400).json({ message: "le montant doit être positif" });
   }
   ```

---

## Scénario 8 — "Ajoute une pagination sur GET /api/invoices"

**Où changer :** `controllers/invoice.controller.js` dans `getInvoices` :

```js
async function getInvoices(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const invoices = await Invoice.find({ userId: req.user.id })
    .populate("supplierId", "name email")
    .skip(skip)
    .limit(limit);

  const total = await Invoice.countDocuments({ userId: req.user.id });

  res.status(200).json({ invoices, total, page, totalPages: Math.ceil(total / limit) });
}
```

**Usage :** `GET /api/invoices?page=2&limit=5`

---

## Scénario 9 — "Ajoute un champ `email` obligatoire au fournisseur"

**Où changer :**
1. `models/Suppliers.js` : `email: { type: String, required: true }`
2. `controllers/suppliers.controller.js` dans `createSupplier` : ajouter validation
   ```js
   if (!req.body.email) {
     return res.status(400).json({ message: "email est obligatoire" });
   }
   ```

---

## Scénario 10 — "Un admin doit pouvoir voir toutes les factures de tous les clients"

**Créer un middleware `isAdmin` :**

```js
function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "accès refusé" });
  }
  next();
}
```

**Nouvelle route :** `GET /api/admin/invoices` → controller qui fait `Invoice.find()` sans filtre `userId`.

---

## Scénario 11 — "Que se passe-t-il si la base de données est hors ligne ?"

Actuellement : le serveur crashe car aucun try/catch dans les controllers.

**Fix simple :** wrapper global ou try/catch dans chaque controller :
```js
async function createInvoice(req, res) {
  try {
    // ... code existant
  } catch (err) {
    res.status(500).json({ message: "erreur serveur" });
  }
}
```

---

## Scénario 12 — "Trie les factures par date d'échéance"

```js
const invoices = await Invoice.find({ userId: req.user.id })
  .populate("supplierId", "name email")
  .sort({ dueDate: 1 }); // 1 = croissant, -1 = décroissant
```
