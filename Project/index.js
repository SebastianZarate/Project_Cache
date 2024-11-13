const express = require('express');
const dotenv = require('dotenv');
const { loadData, findUserByName } = require('./database');
const { cacheData, getCachedData } = require('./cache');

dotenv.config();
const app = express();
app.use(express.json());

// Ruta para cargar datos masivos
app.post('/loadData', async (req, res) => {
  try {
    await loadData();
    res.send('Data loaded successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load data');
  }
});

// Ruta para buscar por nombre
app.get('/user/:name', async (req, res) => {
  const { name } = req.params;

  // Intentar obtener datos de la caché
  const cachedData = await getCachedData(name);
  if (cachedData) {
    return res.json({ source: 'cache', data: cachedData });
  }

  // Buscar en la base de datos si no está en la caché
  const user = await findUserByName(name);
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Almacenar en la caché
  await cacheData(name, user);
  res.json({ source: 'database', data: user });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
