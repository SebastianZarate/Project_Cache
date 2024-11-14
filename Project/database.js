const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

async function loadData() {
  const users = Array.from({ length: 10000 }, (_, i) => [
    `User${i}`,
    Math.floor(Math.random() * 50) + 18,
    `user${i}@example.com`
  ]);
  await pool.query('INSERT INTO users (name, age, email) VALUES ?', [users]);
}

async function getAllUsers() {
  const [rows] = await pool.query('SELECT id_users AS id, name, age, email FROM users');
  return rows;
}

async function findUserByName(name) {
  const [rows] = await pool.query('SELECT * FROM users WHERE name = ?', [name]);
  return rows[0] || null;
}

async function addUser(name, age, email) {
  await pool.query('INSERT INTO users (name, age, email) VALUES (?, ?, ?)', [name, age, email]);
}

async function updateUser(id, name, age, email) {
  await pool.query('UPDATE users SET name = ?, age = ?, email = ? WHERE id = ?', [name, age, email, id]);
}

async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id_users = ?', [id]);
}

async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id_users = ?', [id]);
  return rows[0] || null;
}
// database.js
module.exports = { 
  loadData, 
  getAllUsers, 
  findUserById, 
  findUserByName, 
  addUser, 
  updateUser, 
  deleteUser 
};

