// script.js – CRUD for simple inventory page
// Uses localStorage to store an array of items
// Each item: { id, nombre, cantidad, descripcion }

const STORAGE_KEY = 'inventory_items';

function getItems() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderTable() {
  const tbody = document.querySelector('#itemsTable tbody');
  tbody.innerHTML = '';
  const items = getItems();
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>${item.descripcion || ''}</td>
      <td>
        <button class="editBtn" data-id="${item.id}">Editar</button>
        <button class="delBtn" data-id="${item.id}">Eliminar</button>
      </td>`;
    tbody.appendChild(tr);
  });

  // Attach event listeners for edit/delete
  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', () => editItem(btn.dataset.id));
  });
  document.querySelectorAll('.delBtn').forEach(btn => {
    btn.addEventListener('click', () => deleteItem(btn.dataset.id));
  });
}

function resetForm() {
  document.getElementById('itemId').value = '';
  document.getElementById('nombre').value = '';
  document.getElementById('cantidad').value = '';
  document.getElementById('descripcion').value = '';
  document.getElementById('cancelBtn').style.display = 'none';
}

function editItem(id) {
  const items = getItems();
  const item = items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('itemId').value = item.id;
  document.getElementById('nombre').value = item.nombre;
  document.getElementById('cantidad').value = item.cantidad;
  document.getElementById('descripcion').value = item.descripcion || '';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

function deleteItem(id) {
  let items = getItems();
  items = items.filter(i => i.id !== id);
  saveItems(items);
  renderTable();
}

function generateId() {
  // Simple UUID v4 like generator
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
}

document.getElementById('itemForm').addEventListener('submit', e => {
  e.preventDefault();
  const idField = document.getElementById('itemId');
  const nombre = document.getElementById('nombre').value.trim();
  const cantidad = parseInt(document.getElementById('cantidad').value, 10);
  const descripcion = document.getElementById('descripcion').value.trim();

  const items = getItems();
  if (idField.value) {
    // Update existing
    const idx = items.findIndex(i => i.id === idField.value);
    if (idx >= 0) {
      items[idx] = { id: idField.value, nombre, cantidad, descripcion };
    }
  } else {
    // Create new
    const newItem = { id: generateId(), nombre, cantidad, descripcion };
    items.push(newItem);
  }
  saveItems(items);
  resetForm();
  renderTable();
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  resetForm();
});

// Initial render on page load
renderTable();
