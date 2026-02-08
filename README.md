# Saint Valentin – 7 jours, 7 jeux

Mini application web pour la Saint Valentin, avec 7 jeux debloques jour par jour.

## Lancer le projet

```bash
npm start
```

Puis ouvre : `http://localhost:3000`

## Mode dev (tout debloquer)

- URL : `http://localhost:3000/?unlock=petitchat`
- Ou version persistante : `http://localhost:3000/unlock?token=petitchat`

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

## Logs

Toutes les tentatives sont journalisees dans `access.log`.

Consulter via URL :

```
http://localhost:3000/logs?token=petitchatlogs
```

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
