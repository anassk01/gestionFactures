# Logique Métier — Factures & Paiements

## Création d'une facture

Vérifications dans l'ordre :
1. Champs obligatoires présents (`supplierId`, `amount`, `dueDate`)
2. `supplierId` est un ObjectId valide
3. Le supplier existe ET appartient au user connecté
4. Création de la facture avec `status: "unpaid"` par défaut

```js
// Ownership check du supplier
const supplier = await Supplier.findOne({
  _id: req.body.supplierId,
  userId: req.user.id,  // le supplier doit appartenir au user
});
```

## Mise à jour d'une facture

Règle : **ne peut pas modifier une facture payée**

```js
if (invoice.status === "paid") {
  return res.status(400).json({ message: "u cannot update a paid invoice" });
}
```

Seuls les champs `amount`, `dueDate`, `details` sont modifiables.

## Suppression d'une facture

Règle : **ne peut pas supprimer si des paiements existent**

```js
const payment = await Payment.exists({ invoiceId: req.params.id });
if (payment) {
  return res.status(400).json({ message: "invoice cannot deleted since it contain Payments" });
}
```

## Ajout d'un paiement

C'est la logique la plus complexe. Vérifications dans l'ordre :

```
1. ID invoice valide
2. Champs amount + paymentDate présents
3. paymentDate pas dans le futur
4. L'invoice existe ET appartient au user
5. L'invoice n'est pas déjà "paid"
6. Calculer la somme des paiements existants
7. Vérifier que nouveau paiement ne dépasse pas le montant total
8. Mettre à jour le statut de la facture
9. Créer le paiement
10. Sauvegarder la facture
```

### Calcul du statut après paiement

```js
const sumInvoicePayments = payments.reduce((acc, curr) => acc + curr.amount, 0);

if (sumInvoicePayments + req.body.amount > invoice.amount) {
  return res.status(400).json({ message: "payements exceed the invoice amount" });
}
if (sumInvoicePayments + req.body.amount === invoice.amount) {
  invoice.status = "paid";
}
if (sumInvoicePayments + req.body.amount < invoice.amount) {
  invoice.status = "partially_paid";
}
```

**Exemple concret :**
- Facture : 1000€
- Paiement 1 : 300€ → status = `partially_paid` (300 < 1000)
- Paiement 2 : 700€ → status = `paid` (300+700 = 1000)
- Paiement 3 : 1€ → refusé (1001 > 1000)

## Calcul des statistiques fournisseur

```js
const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0);
const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
const totalRemaining = totalAmount - totalPaid;
const percentPaid = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

// Overdue = non payée ET date dépassée
const overdue = invoices.filter(
  (f) => f.status !== "paid" && new Date(f.dueDate) < new Date(Date.now())
);
```

## Dashboard — Top 3 Fournisseurs

```js
// Grouper les factures par fournisseur et sommer les montants
const suppliersInvoices = invoices.reduce((acc, curr) => {
  const total = acc[curr.supplierId] || 0;
  return { ...acc, [curr.supplierId]: total + curr.amount };
}, {});

// Trier par montant décroissant, prendre les 3 premiers
const top3 = Object.entries(suppliersInvoices)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);
```

## Questions possibles

**Q : Pourquoi recalculer la somme des paiements à chaque fois au lieu de stocker un champ `paidAmount` ?**
> Pour garantir la cohérence. Si on stockait `paidAmount`, il faudrait le maintenir synchronisé à chaque paiement. En recalculant depuis les vrais paiements, on est toujours exact.

**Q : Pourquoi vérifier `paymentDate` dans le futur ?**
> Un paiement est une transaction réelle. On ne peut pas enregistrer un paiement qui n'a pas encore eu lieu.

**Q : Que se passe-t-il si on supprime un fournisseur qui a des factures ?**
> Rien ne l'empêche actuellement — c'est un manque dans le code. Idéalement il faudrait vérifier qu'aucune facture n'est liée avant de supprimer.

**Q : Comment fonctionne `reduce()` ?**
> `reduce()` parcourt un tableau et accumule une valeur. `acc` = accumulateur, `curr` = élément courant. Ici on additionne tous les `amount` pour obtenir le total.
