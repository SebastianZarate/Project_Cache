async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:3000/users');
    if (!response.ok) throw new Error('Error al obtener los usuarios');

    const { data: users } = await response.json();
    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.age}</td>
        <td>${user.email}</td>
        <td>
          <button onclick="deleteUser(${user.id})">Eliminar</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  }
}

async function fetchTopSearched() {
  try {
    const topSearchedTableBody = document.querySelector('#topSearchedTable tbody');
    topSearchedTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

    const response = await fetch('http://localhost:3000/top-searched');
    if (!response.ok) throw new Error('Error al obtener los usuarios más buscados');

    const topSearched = await response.json();
    topSearched.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.age}</td>
        <td>${user.email}</td>
        <td>${user.searchCount}</td>
      `;
      topSearchedTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error al obtener los usuarios más buscados:', error);
  }
}




document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const email = document.getElementById('email').value;

  try {
    const response = await fetch('http://localhost:3000/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, email })
    });

    if (!response.ok) throw new Error('Error al añadir usuario');
    fetchUsers(); // Refresca la lista de usuarios
  } catch (error) {
    console.error('Error al añadir usuario:', error);
  }
});

async function deleteUser(id) {
  try {
    const response = await fetch(`http://localhost:3000/user/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar usuario');
    fetchUsers(); // Refresca la lista de usuarios
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
  }
}

// Buscar usuario por ID al hacer clic en el botón de búsqueda
document.getElementById('searchButton').addEventListener('click', async () => {
  const searchInput = document.getElementById('searchId');
  const id = searchInput.value;

  if (id) {
    try {
      const response = await fetch(`http://localhost:3000/user/id/${id}`);
      if (!response.ok) throw new Error('Usuario no encontrado');
      
      const { data: user } = await response.json();
      const tableBody = document.querySelector('#usersTable tbody');
      tableBody.innerHTML = ''; // Limpiar la tabla antes de mostrar el resultado

      // Mostrar solo el usuario encontrado
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.age}</td>
        <td>${user.email}</td>
        <td>
          <button onclick="deleteUser(${user.id})">Eliminar</button>
        </td>
      `;
      tableBody.appendChild(row);

      fetchTopSearched(); // Refresca la lista de usuarios más buscados
    } catch (error) {
      console.error('Error al buscar usuario:', error);
    }
  } else {
    fetchUsers(); // Carga todos los usuarios si el campo de búsqueda está vacío
  }
});

fetchUsers(); // Cargar todos los usuarios al iniciar
