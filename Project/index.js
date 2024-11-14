const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { loadData, findUserById, findUserByName, addUser, updateUser, deleteUser, getAllUsers } = require('./database');
const { redis, cacheData, getCachedData, getTopSearchedUsers} = require('./cache');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(cors({
  origin: 'http://127.0.0.1:3000'
}))

app.post('/loadData', async (req, res) => {
  try {
    await loadData();
    res.send('Datos cargados exitosamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar los datos');
  }
});

app.get('/users', async (req, res) => {
  const users = await getAllUsers();
  res.json({ data: users });
});

app.get('/user/:name', async (req, res) => {
  const { name } = req.params;
  const cachedData = await getCachedData(name);
  if (cachedData) return res.json({ source: 'cache', data: cachedData });
  
  const user = await findUserByName(name);
  if (!user) return res.status(404).send('Usuario no encontrado');
  
  await cacheData(name, user);
  res.json({ source: 'database', data: user });
});

app.get('/user/id/:id', async (req, res) => {
  const { id } = req.params;
  let user = await getCachedData(id);
  
  if (!user) {
    user = await findUserById(id);
    if (!user) return res.status(404).send('Usuario no encontrado');
    await cacheData(id, user); // Cachea el usuario si no estaba en la caché
  }
  
  res.json({ source: user.source || 'database', data: user });
});


app.post('/user', async (req, res) => {
  const { name, age, email } = req.body;
  await addUser(name, age, email);
  res.send('Usuario añadido');
});

app.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  await updateUser(id, name, age, email);
  res.send('Usuario actualizado');
});

app.delete('/user/:id', async (req, res) => {
  const { id } = req.params;
  await deleteUser(id);
  res.send('Usuario eliminado');
});

app.get('/top-searched', async (req, res) => {
  try {
    const topSearched = await getTopSearchedUsers();
    res.json(topSearched);
  } catch (err) {
    console.error('Error al obtener los usuarios más buscados:', err);
    res.status(500).send('Error al obtener los usuarios más buscados');
  }
});

async function resetCacheOnStartup() {
  try {
    await redis.del('cache');
    await redis.del('cacheAccess');
    console.log('Caché de Redis limpiada al iniciar el servidor');
  } catch (error) {
    console.error('Error al limpiar el caché de Redis:', error);
  }
}

resetCacheOnStartup();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
