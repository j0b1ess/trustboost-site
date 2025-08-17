// Lightweight admin route script (separate from legacy admin.js if needed)
// Requirements: Only allow specific email; fetch users; plan change & usage reset.

const ALLOWED_EMAIL = 'jyehezkel10@gmail.com';
const API_BASE = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api';
const AUTH_LOGIN_PATH = '/auth/login';
const AUTH_ME_PATH = '/auth/me';
let adminToken = null;

function qs(id){ return document.getElementById(id); }

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

async function login(e){
  e.preventDefault();
  const email = qs('admin-email').value.trim().toLowerCase();
  const pass = qs('admin-password').value.trim();
  const btn = qs('login-btn');
  const unauth = qs('unauthorized-msg');
  const err = qs('login-error');
  unauth.classList.add('hidden');
  err.classList.add('hidden');

  if(email !== ALLOWED_EMAIL){
    unauth.textContent = 'Unauthorized email.';
    unauth.classList.remove('hidden');
    return;
  }
  if(!email || !pass) return;

  btn.disabled = true;
  btn.textContent = 'Logging in...';
  try {
    const resp = await fetch(`${API_BASE}${AUTH_LOGIN_PATH}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username: email, password: pass })
    });
    if(!resp.ok){ throw new Error('Login failed'); }
    const data = await resp.json();
    if(!data.token) throw new Error('No token');
    adminToken = data.token;
    localStorage.setItem('adminToken', adminToken);
    // Validate session to ensure allowed email
    const profile = await fetchCurrentUser();
    if(!profile || (profile.email||'').toLowerCase() !== ALLOWED_EMAIL){
      throw new Error('Unauthorized account');
    }
    hide(qs('login-panel'));
    show(qs('dashboard'));
    loadUsers();
  } catch(ex){
    err.textContent = ex.message || 'Login error';
    err.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

async function loadUsers(){
  const tbody = qs('users-tbody');
  const status = qs('table-status');
  tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-slate-500">Loading...</td></tr>';
  try {
    const resp = await fetch(`${API_BASE}/admin/users`,{
      headers:{ 'Authorization': `Bearer ${adminToken}` }
    });
    if(!resp.ok) throw new Error('Failed fetching users');
    const users = await resp.json();
    renderUsers(users);
    status.textContent = `${users.length} users`;
  } catch(ex){
    tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-rose-600">${ex.message}</td></tr>`;
  }
}

function renderUsers(users){
  const tbody = qs('users-tbody');
  tbody.innerHTML = users.map(u => userRow(u)).join('');
  // Bind buttons
  tbody.querySelectorAll('button[data-action]')
    .forEach(btn => btn.addEventListener('click', handleRowAction));
}

function userRow(u){
  const used = (u.usage && u.usage.used) || 0;
  const limit = (u.usage && u.usage.limit) || 0;
  const percent = limit ? Math.min(100, (used/limit)*100).toFixed(1) : 0;
  return `<tr data-id="${escapeHtml(u.id||'')}" data-email="${escapeHtml(u.email||'')}">
    <td class="px-4 py-2 align-top">
      <div class="font-medium">${escapeHtml(u.email||u.id||'Unknown')}</div>
      <div class="text-[10px] text-slate-500">ID: ${escapeHtml(u.id||'N/A')}</div>
    </td>
    <td class="px-4 py-2 align-top">
      <span class="badge badge-plan-${(u.plan||'starter').toLowerCase()}">${escapeHtml(u.plan||'Starter')}</span>
    </td>
    <td class="px-4 py-2 align-top w-48">
      <div class="usage-bar mb-1"><div class="usage-fill" style="width:${percent}%"></div></div>
      <div class="text-[11px] text-slate-500">${used}/${limit||'∞'} (${percent}%)</div>
    </td>
    <td class="px-4 py-2 align-top space-y-1">
      <div class="flex flex-wrap gap-1">
        ${['Starter','Pro','Enterprise'].map(p => `<button class="action-btn plan" data-action="plan" data-plan="${p}" ${p===u.plan?'disabled':''}>${p}</button>`).join('')}
        <button class="action-btn reset" data-action="reset">Reset</button>
      </div>
    </td>
  </tr>`;
}

async function handleRowAction(e){
  const btn = e.currentTarget;
  const tr = btn.closest('tr');
  const userId = tr.getAttribute('data-id');
  const email = tr.getAttribute('data-email');
  const action = btn.getAttribute('data-action');
  if(action==='plan'){
    const newPlan = btn.getAttribute('data-plan');
    if(!confirm(`Change plan for ${email||userId} to ${newPlan}?`)) return;
    await mutate('/admin/update-plan', { userId, plan: newPlan }, btn);
  } else if(action==='reset') {
    if(!confirm(`Reset usage for ${email||userId}?`)) return;
    await mutate('/admin/reset-usage', { userId }, btn);
  }
}

async function mutate(path, payload, btn){
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = '...';
  try {
    const resp = await fetch(`${API_BASE}${path}`,{
      method:'POST',
      headers:{
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify(payload)
    });
    if(!resp.ok) throw new Error('Request failed');
    await loadUsers();
  } catch(ex){
    alert(ex.message || 'Error');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function restoreSession(){
  const token = localStorage.getItem('adminToken');
  if(token){
    adminToken = token;
  validateSessionOnRestore();
  }
}

function logout(){
  adminToken = null;
  localStorage.removeItem('adminToken');
  show(qs('login-panel'));
  hide(qs('dashboard'));
}

document.addEventListener('DOMContentLoaded', () => {
  qs('login-form').addEventListener('submit', login);
  qs('logout-btn').addEventListener('click', logout);
  restoreSession();
});

// Session validation helpers
async function fetchCurrentUser(){
  if(!adminToken) return null;
  try {
    const resp = await fetch(`${API_BASE}${AUTH_ME_PATH}`,{
      headers:{ 'Authorization': `Bearer ${adminToken}` }
    });
    if(!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

async function validateSessionOnRestore(){
  const profile = await fetchCurrentUser();
  if(profile && (profile.email||'').toLowerCase() === ALLOWED_EMAIL){
    hide(qs('login-panel'));
    show(qs('dashboard'));
    loadUsers();
  } else {
    logout();
  }
}
