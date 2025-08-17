// Lightweight admin route script (separate from legacy admin.js if needed)
// Requirements: Only allow specific email; fetch users; plan change & usage reset.

// Determine API base dynamically. Precedence:
// 1. window.__API_BASE__ (injected at build/deploy)
// 2. environment-like globals (VITE_API_BASE_URL / NEXT_PUBLIC_API_URL)
// 3. Same-origin /api proxy if host not replit
// 4. Fallback to Replit production backend
const RPL_BACKEND = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api';
const host = (typeof window !== 'undefined' && window.location && window.location.host) ? window.location.host : '';
let API_BASE = (typeof window !== 'undefined' && (window.__API_BASE__ || window.VITE_API_BASE_URL || window.NEXT_PUBLIC_API_URL)) || '';
if(!API_BASE){
  if(/localhost|127\./.test(host)){ // dev
    API_BASE = RPL_BACKEND; // dev hitting prod backend (adjust if running local backend)
  } else if(/trustboost/i.test(host) && !/replit/i.test(host)) {
    // Deployed marketing site domain -> assume proxy route configured
    API_BASE = '/api';
  } else {
    API_BASE = RPL_BACKEND;
  }
}
const AUTH_LOGIN_PATH = '/auth/login';
const AUTH_ME_PATH = '/auth/me';
const AUTH_WHOAMI_PATH = '/auth/whoami';
// Cookie-only auth mode (no bearer token persisted)
let adminToken = null; // unused placeholder

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
  if(!email || !pass) return;

  btn.disabled = true;
  btn.textContent = 'Logging in...';
  try {
    const resp = await fetch(`${API_BASE}${AUTH_LOGIN_PATH}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials: 'include', // allow cookie-based sessions
      body: JSON.stringify({ username: email, password: pass })
    });
    let data = null;
    if(!resp.ok){
      // Attempt to parse JSON error payload
      try { data = await resp.json(); } catch { /* swallow parse error */ }
      const rawReason = data?.reason || data?.error || data?.message;
      const reasonCode = (rawReason || '').toString().trim().toUpperCase();
      showDevReason(rawReason);
      // Display exact server-provided reason code if present
      let displayReason = reasonCode || `HTTP_${resp.status}`;
      throw new Error(displayReason);
    }
    data = await resp.json();
  // Ignore any token field (cookie-based session)
    // Validate session via server (no client allowlist)
    const profile = await fetchCurrentUser();
    if(!profile || !profile.email){
      throw new Error('Unauthorized account');
    }
    // If current path isn't /admin, redirect (central route)
    if(window.location.pathname !== '/admin'){ 
      hide(qs('login-panel')); // prevent flash
      window.location.href = '/admin';
      return; // after redirect
    }
    hide(qs('login-panel'));
    show(qs('dashboard'));
    loadUsers();
  } catch(ex){
    if(ex instanceof TypeError){
      err.textContent = 'NETWORK/CORS';
    } else {
      err.textContent = (ex.message || '').toUpperCase();
    }
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
    // Pre-auth validation
    const who = await fetchWhoAmI();
    if(!who || !who.email || !who.isAdmin || (who.email||'').toLowerCase() !== 'jyehezkel10@gmail.com') {
      return handleAuthFailure('You are not authorized to access the admin portal.');
    }
    updateAuthedEmail(who.email);
    const resp = await fetch(`${API_BASE}/admin/users`,{
      method:'GET',
      credentials: 'include'
    });
    if(resp.status === 401){
      return handleAuthFailure('Session expired. Please log in again.');
    }
    if(resp.status === 403){
      return handleAuthFailure('You are not authorized to access the admin dashboard.');
    }
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
      credentials: 'include',
      headers: { 'Content-Type':'application/json' },
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
  validateSessionOnRestore();
}

function logout(){
  adminToken = null;
  show(qs('login-panel'));
  hide(qs('dashboard'));
}

document.addEventListener('DOMContentLoaded', () => {
  qs('login-form').addEventListener('submit', login);
  qs('logout-btn').addEventListener('click', logout);
  const emailInput = qs('admin-email');
  const hint = qs('email-normalized-hint');
  // Deployment checklist: record resolved API base immediately
  setChecklistStatus('chk-api-base', 'success', API_BASE + (API_BASE === '/api' ? ' (proxy)' : ''));
  // Dev-only show computed production API base resolution
  const isDev = /localhost|127\./.test(window.location.host);
  // Predict production value for trustboostai.com (non-Replit) => '/api', else fallback value
  let predictedProdBase = /trustboostai\.com$/i.test(window.location.host) ? '/api' : (API_BASE === '/api' ? '/api' : RPL_BACKEND);
  const devBaseEl = document.createElement('div');
  devBaseEl.style.marginTop = '6px';
  devBaseEl.style.fontSize = '10px';
  devBaseEl.style.color = 'var(--text-muted, #64748b)';
  devBaseEl.id = 'api-base-display';
  devBaseEl.textContent = `API Base (prod): ${predictedProdBase}`;
  if(isDev){
    const form = qs('login-form');
    form?.parentNode?.insertBefore(devBaseEl, form.nextSibling);
  }
  function updateHint(){
    if(!emailInput) return;
    const normalized = emailInput.value.trim().toLowerCase();
    if(normalized){
      hint.textContent = `Submitting as: ${normalized}`;
      hint.classList.remove('hidden');
    } else {
      hint.classList.add('hidden');
    }
  }
  if(emailInput){
    ['input','blur','change'].forEach(evt => emailInput.addEventListener(evt, () => {
      // force trim & lowercase in-place
      const normalized = emailInput.value.trim().toLowerCase();
      if(emailInput.value !== normalized) emailInput.value = normalized;
      updateHint();
    }));
    updateHint();
  }
  restoreSession();
});

// Session validation helpers
async function fetchCurrentUser(){
  if(!adminToken) return null;
  try {
    const resp = await fetch(`${API_BASE}${AUTH_ME_PATH}`,{
      method:'GET',
      credentials: 'include'
    });
    if(!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

async function validateSessionOnRestore(){
  const profile = await fetchCurrentUser();
  if(!profile || !profile.email){
    return logoutWithMessage('Session invalid or expired. Please log in.');
  }
  // Additional whoami enforcement
  const who = await fetchWhoAmI();
  if(!who || !who.email || !who.isAdmin || (who.email||'').toLowerCase() !== 'jyehezkel10@gmail.com') {
    return logoutWithMessage('You are not authorized to access the admin portal.');
  }
  updateAuthedEmail(who.email);
  if(window.location.pathname !== '/admin'){
    window.location.href = '/admin';
    return;
  }
  hide(qs('login-panel'));
  show(qs('dashboard'));
  loadUsers();
}

// getAuthHeaders removed in cookie-only mode

function handleAuthFailure(message){
  logoutWithMessage(message);
}

function logoutWithMessage(message){
  adminToken = null;
  show(qs('login-panel'));
  hide(qs('dashboard'));
  const err = qs('login-error');
  err.textContent = message || 'Please log in';
  err.classList.remove('hidden');
}

// Dev helper: display backend failure reason (only if reason present & not production)
function showDevReason(reason){
  const el = qs('dev-reason');
  if(!el) return;
  if(!reason){ el.classList.add('hidden'); return; }
  // Basic heuristic: treat location host containing 'localhost' or '127.' as dev
  const isDev = /localhost|127\./.test(window.location.host);
  if(!isDev) return;
  el.textContent = `Debug reason: ${reason}`;
  el.classList.remove('hidden');
}

// Map backend reason codes to friendly messages
function mapReason(reason, status){
  const code = String(reason).toUpperCase();
  switch(code){
    case 'USER_NOT_FOUND': return 'Incorrect email or password';
    case 'PASSWORD_MISMATCH': return 'Incorrect email or password';
    case 'NOT_ADMIN': return 'You are not authorized';
    case 'ACCOUNT_DISABLED': return 'Account disabled – contact support';
    default:
      if(status === 401) return 'Authentication failed';
      if(status === 403) return 'You are not authorized';
      return reason;
  }
}

async function fetchWhoAmI(){
  if(!document.cookie) return null;
  try {
    const resp = await fetch(`${API_BASE}${AUTH_WHOAMI_PATH}`, {
      method:'GET',
      credentials:'include'
    });
    if(!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

function updateAuthedEmail(email){
  const el = qs('authed-email');
  if(el) el.textContent = `Logged in as: ${email} (Admin)`;
}

// ---------------- Deployment Checklist Helpers ----------------
function setChecklistStatus(id, state, text){
  const li = qs(id);
  if(!li) return;
  li.dataset.status = state;
  const span = li.querySelector('.value');
  if(span && text) span.textContent = text;
  // simple color heuristics (inline to avoid extra CSS edits)
  let color = '';
  if(state === 'success') color = '#059669'; // green
  else if(state === 'error') color = '#dc2626'; // red
  else color = '#64748b'; // slate
  li.style.color = color;
}

// Patch login() to update checklist (wrap original logic)
const __origLogin = login;
login = async function(e){
  try {
    await __origLogin(e);
    // If dashboard visible we assume login success (session validated separately)
    if(!qs('login-panel').classList.contains('hidden')) return; // still on login -> no success
    setChecklistStatus('chk-login','success','OK');
    // whoami + users will be updated inside loadUsers()/validateSessionOnRestore
  } catch(err){
    setChecklistStatus('chk-login','error', (err && err.message) ? err.message.toUpperCase() : 'ERROR');
    throw err; // rethrow so original UI handling still applies if needed
  }
};

// Wrap loadUsers to set whoami/users statuses
const __origLoadUsers = loadUsers;
loadUsers = async function(){
  try {
    const tbody = qs('users-tbody');
    if(tbody) setChecklistStatus('chk-users','pending','loading...');
    // Perform original logic up to fetching whoami manually so we can intercept
    const who = await fetchWhoAmI();
    if(!who || !who.email || !who.isAdmin || (who.email||'').toLowerCase() !== 'jyehezkel10@gmail.com') {
      setChecklistStatus('chk-whoami','error','unauthorized');
      return handleAuthFailure('You are not authorized to access the admin portal.');
    }
    setChecklistStatus('chk-whoami','success', who.email.toLowerCase());
    updateAuthedEmail(who.email);
    const resp = await fetch(`${API_BASE}/admin/users`,{ method:'GET', credentials:'include' });
    if(resp.status === 401){
      setChecklistStatus('chk-users','error','401');
      return handleAuthFailure('Session expired. Please log in again.');
    }
    if(resp.status === 403){
      setChecklistStatus('chk-users','error','403');
      return handleAuthFailure('You are not authorized to access the admin dashboard.');
    }
    if(!resp.ok){
      setChecklistStatus('chk-users','error',`HTTP_${resp.status}`);
      throw new Error('Failed fetching users');
    }
    const users = await resp.json();
    renderUsers(users);
    const status = qs('table-status');
    if(status) status.textContent = `${users.length} users`;
    setChecklistStatus('chk-users','success', `${users.length} users`);
  } catch(ex){
    setChecklistStatus('chk-users','error', (ex && ex.message) ? ex.message.toUpperCase() : 'ERROR');
    const tbody = qs('users-tbody');
    if(tbody) tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-rose-600">${ex.message}</td></tr>`;
  }
};

// Wrap validateSessionOnRestore to mark login status implicitly if valid
const __origValidate = validateSessionOnRestore;
validateSessionOnRestore = async function(){
  try {
    await __origValidate();
    if(!qs('login-panel').classList.contains('hidden')) return; // still logging in / failed
    setChecklistStatus('chk-login','success','session restored');
  } catch(err){
    setChecklistStatus('chk-login','error','RESTORE_FAIL');
    throw err;
  }
};

// When logging out or auth failure ensure dependent checklist items revert
const __origLogoutWithMessage = logoutWithMessage;
logoutWithMessage = function(message){
  setChecklistStatus('chk-login','error','not logged in');
  setChecklistStatus('chk-whoami','error','n/a');
  setChecklistStatus('chk-users','error','n/a');
  return __origLogoutWithMessage(message);
};

