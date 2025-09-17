const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true
}));

// Création de la table users si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Page de connexion - POST
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      req.session.username = username;
      res.redirect('/user.html');
    } else {
      res.send('Identifiants incorrects. <a href="login.html">Réessayer</a>');
    }
  });
});

// Page d'inscription - POST
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
    if (err) {
      res.send('Nom d’utilisateur déjà pris. <a href="register.html">Réessayer</a>');
    } else {
      res.redirect('/login.html');
    }
  });
});

// Page utilisateur - GET
app.get('/user', (req, res) => {
  if (req.session.username) {
    res.send(`Bonjour ${req.session.username} <br><a href="/logout">Se déconnecter</a>`);
  } else {
    res.redirect('/login.html');
  }
});

// Déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});