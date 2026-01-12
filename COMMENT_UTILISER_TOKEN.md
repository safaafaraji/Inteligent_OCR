# 🔐 Guide : Comment utiliser le Token dans Swagger

## ❌ ERREUR COMMUNE
Vous copiez juste le token, mais **ÇA NE MARCHE PAS** !

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb3VsYWltYW5lIiwiZXhwIjoxNzY4MTgzNTY3fQ.PUNQYLGI8lNlduPEiwFaICNJ6V5FsWev2ATAyBtD94w
```

## ✅ SOLUTION CORRECTE

### Étape 1 : Obtenir le token
```bash
curl -X 'POST' \
  'http://0.0.0.0:8000/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "soulaimane",
  "password": "1234"
}'
```

Réponse :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb3VsYWltYW5lIiwiZXhwIjoxNzY4MTgzNTY3fQ.PUNQYLGI8lNlduPEiwFaICNJ6V5FsWev2ATAyBtD94w",
  "token_type": "bearer"
}
```

### Étape 2 : Dans Swagger (http://localhost:8000/docs)

1. **Cliquez sur le bouton vert "Authorize" en haut à droite** (icône de cadenas 🔒)

2. **Dans le champ "Value", tapez EXACTEMENT :**
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb3VsYWltYW5lIiwiZXhwIjoxNzY4MTgzNTY3fQ.PUNQYLGI8lNlduPEiwFaICNJ6V5FsWev2ATAyBtD94w
   ```

   ⚠️ **IMPORTANT :** 
   - Il faut écrire "Bearer" (avec B majuscule)
   - Ensuite UN ESPACE
   - Puis le token

3. **Cliquez sur "Authorize"**

4. **Cliquez sur "Close"**

5. **Maintenant tous les endpoints fonctionnent !**

---

## 🧪 Test avec CURL

Si vous voulez tester avec curl :

```bash
# ❌ MAUVAIS (ne marche pas)
curl -X 'GET' \
  'http://0.0.0.0:8000/api/auth/me' \
  -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# ✅ BON (fonctionne)
curl -X 'GET' \
  'http://0.0.0.0:8000/api/auth/me' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb3VsYWltYW5lIiwiZXhwIjoxNzY4MTgzNTY3fQ.PUNQYLGI8lNlduPEiwFaICNJ6V5FsWev2ATAyBtD94w'
```

---

## 📸 Capture d'écran Visuelle

```
┌─────────────────────────────────────────┐
│     Authorize                           │
├─────────────────────────────────────────┤
│  bearerAuth (http, Bearer)              │
│                                         │
│  Value:                                 │
│  ┌───────────────────────────────────┐  │
│  │ Bearer eyJhbGciOiJIUzI1NiIsInR... │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Authorize]  [Close]                   │
└─────────────────────────────────────────┘
```

---

## 🎯 Format EXACT

```
Bearer [ESPACE] [VOTRE_TOKEN]
```

Exemple complet :
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb3VsYWltYW5lIiwiZXhwIjoxNzY4MTgzNTY3fQ.PUNQYLGI8lNlduPEiwFaICNJ6V5FsWev2ATAyBtD94w
```

---

## ⏰ Expiration

Le token expire après **60 minutes** (3600 secondes).

Si vous obtenez "401 Unauthorized", votre token a probablement expiré. 
→ Reconnectez-vous pour obtenir un nouveau token.

---

## 🔍 Vérifier que ça marche

Après avoir cliqué sur "Authorize", testez l'endpoint :
**GET /api/auth/me**

Si vous voyez vos informations utilisateur, c'est bon ! ✅

Si vous voyez "401 Unauthorized", vérifiez :
- Avez-vous bien écrit "Bearer" avec un espace ?
- Le token est-il complet (pas coupé) ?
- Le token n'a-t-il pas expiré ?
