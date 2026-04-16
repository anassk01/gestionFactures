# Authentification — JWT & Bcrypt

## Le flux complet

### Register (`POST /api/auth/register`)

```
1. Reçoit : name, email, password, password_confirmation
2. Valide : tous les champs présents, passwords matchent, password >= 8 chars
3. Vérifie : email pas déjà en base
4. Hash le password avec bcrypt (10 rounds)
5. Crée le user en base avec role = "client"
6. Retourne le user SANS le password (select("-password"))
```

### Login (`POST /api/auth/login`)

```
1. Reçoit : email, password
2. Cherche le user par email
3. Compare le password avec bcrypt.compare()
4. Crée un JWT avec payload { id, role }, expire dans 7 jours
5. Retourne le token + infos user
```

### Me (`GET /api/auth/me`)

```
1. Middleware authenticate vérifie le token
2. req.user contient { id, role } (le payload du token)
3. Cherche le user par req.user.id
4. Retourne le user sans password
```

## Comment fonctionne bcrypt ?

```js
const hashedpassword = await bcrypt.hash(password, 10);
```

- `10` = nombre de "rounds" de salage
- Même password → hash différent à chaque fois (grâce au salt)
- On ne peut pas "décrypter" — on compare seulement avec `bcrypt.compare()`

**Pourquoi ne pas stocker le password en clair ?**
> Si la base est compromise, les vrais mots de passe ne sont pas exposés.

## Comment fonctionne JWT ?

Un JWT a 3 parties séparées par `.` :

```
HEADER.PAYLOAD.SIGNATURE
```

- **Header** : algorithme utilisé (HS256)
- **Payload** : données (id, role) — lisible par tous, ne pas mettre de données sensibles
- **Signature** : créée avec `JWT_SECRET` — garantit que le token n'a pas été modifié

```js
const token = jwt.sign({ id: matchUser._id, role: matchUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
```

Le client envoie ensuite ce token dans chaque requête :
```
Authorization: Bearer eyJhbGciOi...
```

## Le middleware authenticate

```js
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "no token was provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifyToken;  // { id, role, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ message: "token is wrong" });
  }
}
```

- `jwt.verify()` : vérifie la signature ET l'expiration
- Si valide → attache le payload à `req.user` et appelle `next()`
- Si invalide ou expiré → 401

## Questions possibles

**Q : Pourquoi JWT et pas les sessions ?**
> JWT est stateless — le serveur ne stocke rien. Avec les sessions, le serveur doit garder en mémoire l'état de chaque utilisateur. JWT est plus adapté aux APIs REST.

**Q : Qu'est-ce qui se passe si quelqu'un modifie le payload du token ?**
> La signature devient invalide. `jwt.verify()` va lancer une erreur et on retourne 401. C'est l'intérêt de la signature avec le `JWT_SECRET`.

**Q : Pourquoi `expiresIn: "7d"` ?**
> Pour que le token ne soit pas valide indéfiniment. Si le token est volé, il expire au bout de 7 jours. C'est un compromis entre sécurité et confort utilisateur.

**Q : C'est quoi `select("-password")` ?**
> C'est Mongoose qui exclut le champ `password` de la réponse. Le `-` signifie "exclure". On ne renvoie jamais le hash du password au client.

**Q : Pourquoi 10 rounds pour bcrypt ?**
> C'est le standard recommandé. Plus de rounds = plus sécurisé mais plus lent. 10 rounds = ~100ms de calcul, assez lent pour décourager le brute force mais assez rapide pour l'UX.
