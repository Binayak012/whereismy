let map;
let allItems = [];
let activeFilter = 'all';

async function initMap() {
  // fetch token from our backend
  const tokenRes = await fetch('/api/map-token');
  const { token } = await tokenRes.json();

  mapboxgl.accessToken = token;

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-74.2734, 40.8341], // this is caldwell university
    zoom: 16.5
  });

  map.addControl(new mapboxgl.NavigationControl());

  map.on('load', () => {
    loadItems();
  });
}

async function loadItems() {
  const res = await fetch('/api/items');
  allItems = await res.json();
  renderMarkers(allItems);
}

function renderMarkers(items) {
  // remove existing markers
  document.querySelectorAll('.marker').forEach(m => m.remove());

  items.forEach(item => {
    // skip items with no coordinates
    if (!item.lat || !item.lng) return;

    // pin color — red for lost, green for found
    const color = item.type === 'lost' ? '#dc2626' : '#16a34a';

    const el = document.createElement('div');
    el.className = 'marker';
    el.style.cssText = `
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    `;

    const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(`
      <div class="popup-title">${item.title}</div>
      <div class="popup-meta">
        ${item.type} · ${item.category}<br>
        ${item.location_name || ''}<br>
        Posted by ${item.poster_name}
      </div>
      <a href="/item.html?id=${item.id}" class="popup-link">View details →</a>
    `);

    new mapboxgl.Marker(el)
      .setLngLat([item.lng, item.lat])
      .setPopup(popup)
      .addTo(map);
  });
}

function setFilter(type, btn) {
  activeFilter = type;

  // update button styles
  document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.add('inactive'));
  btn.classList.remove('inactive');

  if (type === 'all') {
    renderMarkers(allItems);
  } else {
    renderMarkers(allItems.filter(i => i.type === type));
  }
}

initMap();