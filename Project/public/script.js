async function fetchUsers() {
  const response = await fetch('http://localhost:3000/users'); // Cambia aquí la URL
  const users = await response.json();
  const tableBody = document.querySelector('#usersTable tbody');
  tableBody.innerHTML = '';
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
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const email = document.getElementById('email').value;
  await fetch('http://localhost:3000/user', { // Cambia aquí la URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age, email })
  });
  fetchUsers();
});

async function deleteUser(id) {
  await fetch(`http://localhost:3000/user/${id}`, { method: 'DELETE' }); // Cambia aquí la URL
  fetchUsers();
}

fetchUsers();
