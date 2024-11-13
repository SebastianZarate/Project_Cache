const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function loadData() {
  const users = Array.from({ length: 10000 }, (_, i) => [
    `User${i}`,
    Math.floor(Math.random() * 50) + 18,
    `user${i}@example.com`
  ]);

  const [rows] = await pool.query('INSERT INTO users (name, age, email) VALUES ?', [users]);
  console.log(`Inserted ${rows.affectedRows} users`);
}

async function findUserByName(name) {
  const [rows] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
  return rows[0] || null;
}

module.exports = { loadData, findUserByName };
