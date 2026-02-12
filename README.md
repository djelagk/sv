# Saint Valentin – 7 jours, 7 jeux

Mini application web pour la Saint Valentin, avec 7 jeux debloques jour par jour.

## Lancer le projet

```bash
npm start
```

Puis ouvre : `http://localhost:3005`

## Mode dev (tout debloquer)

- URL : `http://localhost:3005/?unlock=petitchat`
- Ou version persistante : `http://localhost:3005/unlock?token=petitchat`

Pour changer le code secret :

```bash
set UNLOCK_TOKEN=ton-code
npm start
```

## Contenu

- `index.html` : structure de la page
- `styles.css` : styles
- `app.js` : logique des jeux
- `server.js` : serveur Node
- `watchdog.sh` : relance auto + tunnel

## Partage public (LocalTunnel)

```bash
npx localtunnel --port 3000
```

Sous-domaine personnalise :

```bash
npx localtunnel --port 3000 --subdomain ton-nom
```

## Acces exterieur avec ngrok

Pour exposer l’app sur Internet avec **ngrok** (backend et frontend sur des URLs ngrok distinctes) :

1. Installer ngrok : https://ngrok.com/download

2. Lancer avec ngrok (2 tunnels) :
```bash
npm run start:ngrok
```

Le script demarre backend (port 3005), frontend (port 3000), ngrok, recupere les URLs et redemarre les serveurs avec la bonne config.

**Note :** ngrok gratuit = 1 tunnel. Pour 2 tunnels, il faut un compte ngrok payant. Alternative : `npm start` + `ngrok http 3005` pour un seul tunnel (mode serveur unique).

### URLs obtenues

- **Frontend** : `https://xxx.ngrok-free.app` (ou similaire)
- **Backend** : `https://yyy.ngrok-free.app`
- **Unlock** : `https://yyy.ngrok-free.app/unlock?token=petitchat`
- **Interface ngrok** : http://127.0.0.1:4040

### Demarrage manuel (2 terminaux)

```bash
# Terminal 1 – Backend (remplace par ton URL frontend ngrok)
FRONTEND_URL=https://xxx.ngrok-free.app node backend.js

# Terminal 2 – Frontend (remplace par ton URL backend ngrok)
BACKEND_URL=https://yyy.ngrok-free.app node frontend.js
```

## Logs

Toutes les tentatives sont journalisees dans `access.log`.

Consulter via URL :
- Mode serveur unique : `http://localhost:3005/logs?token=petitchatlogs`
- Mode ngrok : `https://[ton-backend-ngrok]/logs?token=petitchatlogs`

Changer le token :

```bash
set LOGS_TOKEN=ton-token
npm start
```

## Watchdog (auto-relance + tunnel)

```bash
npm run watch
```

Variables utiles :
- `TUNNEL_SUBDOMAIN` (defaut: `petitchat`)
- `CHECK_INTERVAL_MS` (defaut: `15000`)
