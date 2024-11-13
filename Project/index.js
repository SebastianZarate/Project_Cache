const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { loadData, findUserByName, addUser, updateUser, deleteUser, getAllUsers } = require('./database');
const { cacheData, getCachedData } = require('./cache');

dotenv.config();
const app = express();
app.use(cors()); // Agregar esta línea para habilitar CORS
app.use(express.json());
app.use(express.static('public'));

app.use(cors({
  origin: 'http://127.0.0.1:3000'
}));

// Cargar datos masivos
app.post('/loadData', async (req, res) => {
  try {
    await loadData();
    res.send('Datos cargados exitosamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar los datos');
  }
});

// Obtener todos los usuarios
app.get('/users', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// Buscar usuario por nombre
app.get('/user/:name', async (req, res) => {
  const { name } = req.params;
  const cachedData = await getCachedData(name);
  if (cachedData) {
    return res.json({ source: 'cache', data: cachedData });
  }
  const user = await findUserByName(name);
  if (!user) return res.status(404).send('Usuario no encontrado');
  await cacheData(name, user);
  res.json({ source: 'database', data: user });
});

// Crear un nuevo usuario
app.post('/user', async (req, res) => {
  const { name, age, email } = req.body;
  await addUser(name, age, email);
  res.send('Usuario añadido');
});

// Actualizar un usuario
app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  await updateUser(id, name, age, email);
  res.send('Usuario actualizado');
});

// Eliminar un usuario
app.delete('/user/:id', async (req, res) => {
  const { id } = req.params;
  await deleteUser(id);
  res.send('Usuario eliminado');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
