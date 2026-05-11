let filters = { type: '', category: '' };

async function loadItems() {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.category) params.append('category', filters.category);

  const res = await fetch(`/api/items?${params}`);
  const items = await res.json();

  const grid = document.getElementById('items-grid');

  if (items.length === 0) {
    grid.innerHTML = '<p class="empty">No items found.</p>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <a href="/item.html?id=${item.id}" class="item-card">
      ${item.photo_url ? `<img src="${item.photo_url}" alt="${item.title}" />` : ''}
      <div class="item-card-body">
        <div>
          <span class="badge badge-${item.type}">${item.type}</span>
          <span class="badge badge-${item.status}">${item.status}</span>
        </div>
        <div class="item-card-title">${item.title}</div>
        <div class="item-card-meta">
          ${item.category} · ${item.location_name || 'No location'}<br>
          Posted by ${item.poster_name}
        </div>
      </div>
    </a>
  `).join('');
}

function setFilter(key, value) {
  filters[key] = value;

  if (key === 'type') {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
  }

  loadItems();
}

loadItems();