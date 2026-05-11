// connect to socket.io
const socket = io();
const user = getUser();

if (user) {
  // join personal room so server can send us notifications
  socket.emit('join', user.id);
}

// load unread count on page load
async function loadUnreadCount() {
  const res = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const notifications = await res.json();
  const unread = notifications.filter(n => !n.is_read).length;
  updateBell(unread);
}

function updateBell(count) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// listen for real-time notifications
socket.on('notification', (data) => {
  // show a small toast
  showToast(data.message);

  // bump the badge count
  const badge = document.getElementById('notif-badge');
  if (badge) {
    const current = parseInt(badge.textContent) || 0;
    badge.textContent = current + 1;
    badge.style.display = 'flex';
  }
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

loadUnreadCount();