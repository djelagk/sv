# Saint Valentin – 7 jours, 7 jeux

Mini application web pour la Saint Valentin, avec 7 jeux debloques jour par jour.

## Lancer le projet

```bash
npm start
```

Puis ouvre : `http://localhost:3000`

## Mode dev (tout debloquer)

- URL : `http://localhost:3000/?dev=1`
- Ou via la console navigateur :

```js
localStorage.setItem("sv_dev_unlock", "1");
```

Pour desactiver :

```js
localStorage.removeItem("sv_dev_unlock");
```

## Contenu

- `index.html` : structure de la page
- `styles.css` : styles
- `app.js` : logique des jeux
- `server.js` : serveur Node

## Partage public (LocalTunnel)

```bash
npx localtunnel --port 3000
```

Sous-domaine personnalise :

```bash
npx localtunnel --port 3000 --subdomain ton-nom
```
