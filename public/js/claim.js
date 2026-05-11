const params = new URLSearchParams(window.location.search);
const itemId = params.get('id');
let proofPhotoUrl = null;

document.getElementById('back-link').href = `/item.html?id=${itemId}`;

// load item title
async function loadItem() {
  const res = await fetch(`/api/items/${itemId}`);
  const item = await res.json();
  if (res.ok) {
    document.getElementById('item-title').textContent = `Claiming: ${item.title}`;
  }
}

// optional proof photo upload
document.getElementById('proof_photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById('proof-preview');
  preview.innerHTML = '<p style="color:#666;font-size:0.875rem">Uploading...</p>';

  const formData = new FormData();
  formData.append('photo', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  });

  const data = await res.json();
  if (res.ok) {
    proofPhotoUrl = data.url;
    preview.innerHTML = `<img src="${data.url}" style="max-width:200px;margin-top:0.5rem;border-radius:8px" />`;
  } else {
    preview.innerHTML = '<p style="color:red">Upload failed</p>';
  }
});

async function submitClaim() {
  const proof_text = document.getElementById('proof_text').value.trim();
  const errorEl = document.getElementById('error');
  const successEl = document.getElementById('success');

  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!proof_text) {
    errorEl.textContent = 'Please describe why this item is yours';
    errorEl.style.display = 'block';
    return;
  }

  const res = await fetch(`/api/claims/${itemId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ proof_text, proof_photo_url: proofPhotoUrl })
  });

  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.error;
    errorEl.style.display = 'block';
    return;
  }

  successEl.textContent = 'Claim submitted! The owner will review it.';
  successEl.style.display = 'block';

  setTimeout(() => {
    window.location.href = `/item.html?id=${itemId}`;
  }, 2000);
}

loadItem();