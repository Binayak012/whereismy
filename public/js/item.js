const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');
const currentUser = getUser();

async function loadItem() {
  const res = await fetch(`/api/items/${itemId}`);
  const item = await res.json();

  if (!res.ok) {
    document.getElementById('item-detail').innerHTML = '<p>Item not found.</p>';
    return;
  }

  const isOwner = currentUser && currentUser.id === item.user_id;
  const date = new Date(item.created_at).toLocaleDateString();

  document.getElementById('item-detail').innerHTML = `
    ${item.photo_url ? `<img src="${item.photo_url}" class="item-detail-img" alt="${item.title}" />` : ''}
    <div>
      <span class="badge badge-${item.type}">${item.type}</span>
      <span class="badge badge-${item.status}">${item.status}</span>
    </div>
    <h1 class="item-detail-title">${item.title}</h1>
    <div class="item-detail-meta">
      ${item.category} · ${item.location_name || 'No location specified'} · Posted by ${item.poster_name} on ${date}
    </div>
    <p class="item-detail-description">${item.description || 'No description provided.'}</p>

    <div class="item-actions">
      ${!isOwner ? `<button onclick="claimItem()" class="btn-secondary">Claim this item</button>` : ''}
      ${isOwner ? `<button onclick="deleteItem()" class="btn-danger">Delete post</button>` : ''}
      <a href="/items.html" class="btn-secondary" style="text-decoration:none;padding:0.7rem 1.25rem">Back to browse</a>
    </div>
  `;
}

async function deleteItem() {
  if (!confirm('Are you sure you want to delete this post?')) return;

  const res = await fetch(`/api/items/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  if (res.ok) {
    window.location.href = '/items.html';
  }
}

function claimItem() {
  window.location.href = `/claim.html?id=${itemId}`;
}

loadItem();