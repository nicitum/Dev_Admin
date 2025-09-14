export async function login(username, password, role) {
  const response = await fetch('http://147.93.110.150:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}

export async function logout(username) {
  const response = await fetch('http://147.93.110.150:3001/api/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) throw new Error('Logout failed');
  return response.json();
} 