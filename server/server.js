const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('docs'));

// Base de données SQLite
const db = new sqlite3.Database(':memory:');

// Créer une table et insérer des utilisateurs
db.serialize(() => {
    db.run("CREATE TABLE users (username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
    db.run("INSERT INTO users (username, password) VALUES ('user1', 'password1')");
});

// Serve index.html at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Endpoint de connexion (vulnérable à l'injection SQL)
app.post('/SQL_Injection.github.io/login', (req, res) => {
    const { username, password } = req.body;

    // Requête SQL vulnérable
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.get(query, (err, row) => {
        // Gestion d'erreur pour la requête SQL
        if (err) {
            console.error(err.message);
            return res.status(500).send('<h1>Erreur de SQL cmd</h1>'); // Réponse d'erreur pour le serveur
        }
        console.log(query);

        // Vérifier si l'utilisateur a été trouvé
        if (row) {
            res.sendFile(path.join(__dirname, '../docs', 'admin.html'), (err) => {
                if (err) {
                    console.error(err); // Afficher l'erreur dans la console
                    return res.status(500).send('Erreur de serveur.'); // Envoyer une réponse d'erreur
                }
            });
            // res.status(200).send({ row });

        } else {
            res.sendFile(path.join(__dirname, '../docs', 'login-failed.html'));
        }
    });
});

// Serveur web
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
