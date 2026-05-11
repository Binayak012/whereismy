async function loadNotifications() {
  // mark all as read when page opens
  await fetch('/api/notifications/read', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const res = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  const notifications = await res.json();
  const list = document.getElementById('notif-list');

  if (notifications.length === 0) {
    list.innerHTML = '<p class="empty">No notifications yet.</p>';
    return;
  }

  list.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.is_read ? '' : 'unread'}">
      <div>${n.message}</div>
      <div class="notif-time">${new Date(n.created_at).toLocaleString()}</div>
      ${n.item_id ? `<a href="/item.html?id=${n.item_id}" style="font-size:0.8rem;color:#4f46e5">View item →</a>` : ''}
    </div>
  `).join('');

  // reset badge
  updateBell(0);
}

loadNotifications();