async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');

  errorEl.style.display = 'none';

  if (!email || !password) {
    errorEl.textContent = 'Email and password are required';
    errorEl.style.display = 'block';
    return;
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    errorEl.textContent = data.error;
    errorEl.style.display = 'block';
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  window.location.href = '/items.html';
}