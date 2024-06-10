import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(':memory:'); // For production, use a file-based database

db.serialize(() => {
    db.run(`CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        price REAL,
        last_updated TEXT
    )`);
});

export const addProduct = (name, url) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO products (name, url) VALUES (?, ?)");
        stmt.run(name, url, function (err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
        stmt.finalize();
    });
};

export const getProducts = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM products", (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};

export const updatePrice = (id, price) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare("UPDATE products SET price = ?, last_updated = ? WHERE id = ?");
        stmt.run(price, new Date().toISOString(), id, (err) => {
            if (err) reject(err);
            resolve();
        });
        stmt.finalize();
    });
};
