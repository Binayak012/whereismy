const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');

async function loadClaims() {
  const [itemRes, claimsRes] = await Promise.all([
    fetch(`/api/items/${itemId}`),
    fetch(`/api/claims/${itemId}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
  ]);

  const item = await itemRes.json();
  const claims = await claimsRes.json();

  if (itemRes.ok) {
    document.getElementById('item-title').textContent = `Claims for: ${item.title}`;
  }

  const list = document.getElementById('claims-list');

  if (!claimsRes.ok) {
    list.innerHTML = `<p class="error" style="display:block">${claims.error}</p>`;
    return;
  }

  if (claims.length === 0) {
    list.innerHTML = '<p class="empty">No claims yet.</p>';
    return;
  }

  list.innerHTML = claims.map(claim => `
    <div class="claim-card">
      <div class="claim-header">
        <strong>${claim.claimant_name}</strong>
        <span class="badge badge-${claim.status}">${claim.status}</span>
      </div>
      <p class="claim-email">${claim.claimant_email}</p>
      <p class="claim-proof">${claim.proof_text}</p>
      ${claim.proof_photo_url ? `<img src="${claim.proof_photo_url}" class="claim-photo" />` : ''}
      ${claim.status === 'pending' ? `
        <div class="claim-actions">
          <button onclick="approve('${claim.id}')" class="btn-approve">Approve</button>
          <button onclick="reject('${claim.id}')" class="btn-secondary">Reject</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

async function approve(claimId) {
  const res = await fetch(`/api/claims/${claimId}/approve`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (res.ok) loadClaims();
}

async function reject(claimId) {
  const res = await fetch(`/api/claims/${claimId}/reject`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (res.ok) loadClaims();
}

loadClaims();