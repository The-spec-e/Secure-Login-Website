const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.db");

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: "Missing fields" });

    try {
        const hash = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
        db.run(query, [username, hash], (err) => {
            if (err) return res.status(400).json({ message: "User already exists" });
            res.json({ message: "Registered successfully" });
        });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: "Missing fields" });

    const query = "SELECT password_hash FROM users WHERE username = ?";
    db.get(query, [username], async (err, row) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!row) return res.status(400).json({ message: "Invalid username or password" });

        const match = await bcrypt.compare(password, row.password_hash);
        if (!match) return res.status(400).json({ message: "Invalid username or password" });

        res.json({ message: "Success" });
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
