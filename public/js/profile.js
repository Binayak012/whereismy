const currentuser = getUser();
let allMyItems = [];

document.getElementById('profile-name').textContent = `${user.name}'s posts`;
document.getElementById('profile-email').textContent = user.email;

async function loadMyItems() {
  const res = await fetch('/api/items');
  const items = await res.json();
  allMyItems = items.filter(i => i.user_id === user.id);
  renderItems(allMyItems);
}

function renderItems(items) {
  const grid = document.getElementById('my-items');

  if (items.length === 0) {
    grid.innerHTML = '<p class="empty">No posts yet. <a href="/post.html" style="color:#4f46e5">Post your first item →</a></p>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <a href="/item.html?id=${item.id}" class="item-card">
      ${item.photo_url 
        ? `<img src="${item.photo_url}" alt="${item.title}" />` 
        : `<div class="no-photo">📦</div>`
      }
      <div class="item-card-body">
        <div>
          <span class="badge badge-${item.type}">${item.type}</span>
          <span class="badge badge-${item.status}">${item.status}</span>
        </div>
        <div class="item-card-title">${item.title}</div>
        <div class="item-card-meta">${item.category} · ${item.location_name || 'No location'}</div>
      </div>
    </a>
  `).join('');
}

function setTab(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (filter === 'all') return renderItems(allMyItems);
  if (filter === 'lost' || filter === 'found') {
    return renderItems(allMyItems.filter(i => i.type === filter));
  }
  renderItems(allMyItems.filter(i => i.status === filter));
}

loadMyItems();