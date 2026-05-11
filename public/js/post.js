console.log('post.js loaded');
let selectedType = 'lost';
let uploadedPhotoUrl = null;
let selectedLat = null;
let selectedLng = null;
let locationMap = null;
let locationMarker = null;

function setType(type) {
  selectedType = type;
  document.getElementById('btn-lost').classList.toggle('active', type === 'lost');
  document.getElementById('btn-found').classList.toggle('active', type === 'found');
}

// show preview when user picks a photo
document.getElementById('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById('photo-preview');
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
    uploadedPhotoUrl = data.url;
    preview.innerHTML = `<img src="${data.url}" alt="preview" />`;
  } else {
    preview.innerHTML = '<p style="color:red">Upload failed</p>';
  }
});
async function initLocationMap() {
  const tokenRes = await fetch('/api/map-token');
  const { token } = await tokenRes.json();

  mapboxgl.accessToken = token;

  locationMap = new mapboxgl.Map({
    container: 'location-map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.2776, 40.8398],
    zoom: 15
  });

  locationMap.on('click', (e) => {
    selectedLat = e.lngLat.lat.toFixed(6);
    selectedLng = e.lngLat.lng.toFixed(6);

    document.getElementById('coords-label').textContent = 
      `Pinned: ${selectedLat}, ${selectedLng}`;

    if (locationMarker) locationMarker.remove();

    locationMarker = new mapboxgl.Marker({ color: '#4f46e5' })
      .setLngLat([selectedLng, selectedLat])
      .addTo(locationMap);
  });
}

initLocationMap();

async function submitPost() {
  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value.trim();
  const location_name = document.getElementById('location_name').value.trim();
  const errorEl = document.getElementById('error');
  const successEl = document.getElementById('success');

  errorEl.style.display = 'none';
  successEl.style.display = 'none';

  if (!title || !category) {
    errorEl.textContent = 'Title and category are required';
    errorEl.style.display = 'block';
    return;
  }

  const res = await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      type: selectedType,
      title,
      description,
      category,
      photo_url: uploadedPhotoUrl,
      location_name,
      lat: selectedLat,
      lng: selectedLng
    })
  });

  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.error;
    errorEl.style.display = 'block';
    return;
  }

  successEl.textContent = 'Item posted successfully!';
  successEl.style.display = 'block';

  setTimeout(() => {
    window.location.href = `/item.html?id=${data.id}`;
  }, 1000);
}