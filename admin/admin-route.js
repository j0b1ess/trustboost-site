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
const AUTH_LOGIN_PATH = '/admin/login';
const AUTH_ME_PATH = '/auth/me';
const AUTH_WHOAMI_PATH = '/auth/whoami';
const ADMIN_EMAIL = 'jyehezkel10@gmail.com';
// --- Token auth setup (pure token mode) ---
let adminToken = null;
const LOCAL_TOKEN_KEY = 'adminToken';
try { const saved = localStorage.getItem(LOCAL_TOKEN_KEY); if(saved) adminToken = saved; } catch {}

function setAdminToken(tok){
  adminToken = tok || null;
  try { if(tok) localStorage.setItem(LOCAL_TOKEN_KEY, tok); else localStorage.removeItem(LOCAL_TOKEN_KEY); } catch {}
}

function clearAuthAndLogout(msg){
  setAdminToken(null);
  logoutWithMessage(msg || 'Session expired. Please log in.');
}

async function authFetch(url, options = {}){
  const final = { ...options };
  final.headers = { ...(final.headers||{}) };
  if(adminToken) final.headers['Authorization'] = `Bearer ${adminToken}`;
  const resp = await fetch(url, final);
  if(resp.status === 401 || resp.status === 403){
    // Treat all 401/403 on protected admin/auth endpoints as session expiration
    if(/\/admin(\/|$)/.test(url) || /\/auth\/whoami/.test(url) || /\/auth\/me/.test(url)){
      clearAuthAndLogout('Session expired. Please log in as the authorized admin.');
    }
  }
  return resp;
}
function detectAuthMode(){
  return adminToken ? 'token' : 'none';
}

// -------- Central Admin Guard --------
function failGuard(){
  clearAuthAndLogout('Not authenticated/authorized. Please log in as the authorized admin.');
  return null;
}

async function enforceAdminGuard(){
  if(!adminToken) return failGuard();
  try {
    const resp = await authFetch(`${API_BASE}${AUTH_WHOAMI_PATH}`, { method:'GET' });
    if(resp.status === 401 || resp.status === 403) return failGuard();
    if(!resp.ok) return failGuard();
    let data = null;
    if(resp.headers.get('content-type')?.includes('application/json')){
      try { data = await resp.json(); } catch {}
    }
    if(!data || data.isAdmin !== true || (data.email||'').toLowerCase() !== ADMIN_EMAIL) return failGuard();
    return data;
  } catch { return failGuard(); }
}

// Advanced diagnostics (echo, login-diagnose, token-diagnose)
async function runAdvancedDiagnostics(email, password){
  const echoReqEl = qs('echo-req');
  const echoEmailEl = qs('echo-email');
  const echoStatusEl = qs('echo-status');
  const echoNormEl = qs('echo-normalized');
  const echoErrEl = qs('echo-error');
  const diagStatusEl = qs('diag-status');
  const diagUserFoundEl = qs('diag-userFound');
  const diagHashEl = qs('diag-hash');
  const diagPassMatchEl = qs('diag-passmatch');
  const diagIsAdminEl = qs('diag-isadmin');
  const diagReason2El = qs('diag-reason2');
  const diagBackendPathEl = qs('diag-backendpath');
  const diagOriginEl = qs('diag-origin');
  const diagAllowCredsEl = qs('diag-allowcreds');
  const diagModeEl = qs('diag-mode');
  const diagErrorEl = qs('diag-error');
  const tokenStatusEl = qs('token-status');
  const tokenPresentEl = qs('token-present');
  const tokenValidEl = qs('token-valid');
  const tokenEmailEl = qs('token-email');
  const tokenIsAdminEl = qs('token-isadmin');
  const tokenErrorEl = qs('token-error');

  // reset
  [echoStatusEl, echoNormEl, diagStatusEl, tokenStatusEl].forEach(el=>{ if(el) el.textContent=''; });
  [echoErrEl, diagErrorEl, tokenErrorEl].forEach(el=>{ if(el) el.textContent=''; });
  if(tokenPresentEl) tokenPresentEl.textContent = adminToken ? 'true' : 'false';

  // 1) login-echo
  try {
    if(echoReqEl) echoReqEl.textContent = `${API_BASE}/auth/login-echo`;
    if(echoEmailEl) echoEmailEl.textContent = maskEmail(email||'');
    const resp = await fetch(`${API_BASE}/auth/login-echo`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    if(echoStatusEl) echoStatusEl.textContent = resp.status;
    if(resp.headers.get('content-type')?.includes('application/json')){
      try {
        const js = await resp.clone().json();
        if(echoNormEl) echoNormEl.textContent = js.normalizedEmail || '';
      } catch {}
    }
    if(!resp.ok){
      try { const e = await resp.json(); if(echoErrEl) echoErrEl.textContent = e.reason || e.error || e.message || ''; } catch{}
    }
  } catch(err){ if(echoErrEl) echoErrEl.textContent = err.message || 'network'; }

  // 2) login-diagnose
  try {
    const resp = await fetch(`${API_BASE}/auth/login-diagnose`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    if(diagStatusEl) diagStatusEl.textContent = resp.status;
    let js = null; if(resp.headers.get('content-type')?.includes('application/json')){ try { js = await resp.clone().json(); } catch{} }
    if(js){
      if(diagUserFoundEl) diagUserFoundEl.textContent = js.userFound;
      if(diagHashEl) diagHashEl.textContent = js.hasHash;
      if(diagPassMatchEl) diagPassMatchEl.textContent = js.passwordMatch;
      if(diagIsAdminEl) diagIsAdminEl.textContent = js.isAdmin;
      if(diagReason2El) diagReason2El.textContent = js.reason || '';
      if(diagBackendPathEl) diagBackendPathEl.textContent = js.backendPath || '';
      if(diagOriginEl) diagOriginEl.textContent = js.cors?.originSeen || '';
      if(diagAllowCredsEl) diagAllowCredsEl.textContent = js.cors?.allowCredentials || '';
      if(diagModeEl) diagModeEl.textContent = js.mode || '';
      if(!resp.ok && diagErrorEl) diagErrorEl.textContent = js.reason || js.error || js.message || '';
    } else if(!resp.ok && diagErrorEl){
      diagErrorEl.textContent = `HTTP_${resp.status}`;
    }
  } catch(err){ if(diagErrorEl) diagErrorEl.textContent = err.message || 'network'; }

  // 3) token-diagnose (pre-login; may not have token yet)
  await updateTokenDiagnostics();
}

async function updateTokenDiagnostics(){
  const tokenStatusEl = qs('token-status');
  const tokenPresentEl = qs('token-present');
  const tokenValidEl = qs('token-valid');
  const tokenEmailEl = qs('token-email');
  const tokenIsAdminEl = qs('token-isadmin');
  const tokenErrorEl = qs('token-error');
  if(tokenPresentEl) tokenPresentEl.textContent = adminToken ? 'true' : 'false';
  if(!adminToken){
    if(tokenStatusEl) tokenStatusEl.textContent = 'no token';
    if(tokenValidEl) tokenValidEl.textContent = 'false';
    return;
  }
  try {
    const resp = await authFetch(`${API_BASE}/auth/token-diagnose`, { method:'GET' });
    if(tokenStatusEl) tokenStatusEl.textContent = resp.status;
    let js = null; if(resp.headers.get('content-type')?.includes('application/json')){ try { js = await resp.json(); } catch{} }
    if(!resp.ok){
      if(tokenErrorEl) tokenErrorEl.textContent = js?.reason || js?.error || js?.message || `HTTP_${resp.status}`;
      if(tokenValidEl) tokenValidEl.textContent = 'false';
      return;
    }
    if(tokenValidEl) tokenValidEl.textContent = js?.tokenValid === undefined ? 'true' : String(js.tokenValid);
    if(tokenEmailEl) tokenEmailEl.textContent = js?.email || '';
    if(tokenIsAdminEl) tokenIsAdminEl.textContent = js?.isAdmin || '';
  } catch(err){
    if(tokenErrorEl) tokenErrorEl.textContent = err.message || 'network';
  }
}
function loginCleanup(){}

async function login(e){
  e.preventDefault();
  const email = qs('admin-email').value.trim().toLowerCase();
  const pass = qs('admin-password').value.trim();
  const btn = qs('login-btn');
  const unauth = qs('unauthorized-msg');
  const err = qs('login-error');
  const diagBox = qs('login-diagnostics');
  const diagApi = qs('diag-api-base');
  const diagStatus = qs('diag-http-status');
  const diagReason = qs('diag-reason');
  const diagReqId = qs('diag-reqid');
  unauth.classList.add('hidden');
  err.classList.add('hidden');
  if(diagBox) diagBox.classList.add('hidden');
  if(!email || !pass) return;
  btn.disabled = true;
  btn.textContent = 'Logging in...';
  const requestId = Date.now().toString();
  await runAdvancedDiagnostics(email, pass);
  const loginBody = { email: email, password: pass };
  const loginInit = { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(loginBody) };
  try {
  const resp = await authFetch(`${API_BASE}${AUTH_LOGIN_PATH}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(loginBody) });
    let data = null;
    if(!resp.ok){
      try { data = await resp.json(); } catch {}
      const rawReason = data?.reason || data?.error || data?.message || '';
      showDevReason(rawReason);
      if(diagBox){
        if(diagApi) diagApi.textContent = API_BASE;
        if(diagStatus) diagStatus.textContent = resp.status;
        if(diagReason) diagReason.textContent = rawReason || `HTTP_${resp.status}`;
        if(diagReqId) diagReqId.textContent = requestId;
        diagBox.classList.remove('hidden');
      }
      throw new Error(rawReason || `HTTP_${resp.status}`);
    }
    data = await resp.json();
    const token = data.token || data.accessToken || data.jwt;
    if(token) setAdminToken(token);
  const whoResp = await authFetch(`${API_BASE}${AUTH_WHOAMI_PATH}`, { method:'GET' });
    let whoJson = null; if(whoResp.headers.get('content-type')?.includes('application/json')){ try { whoJson = await whoResp.json(); } catch {} }
    if(!whoResp.ok || !whoJson || !whoJson.email){
      const failReason = whoJson?.reason || whoJson?.error || whoJson?.message || `HTTP_${whoResp.status}`;
      throw new Error(failReason);
    }
    if(whoJson.isAdmin !== true || (whoJson.email||'').toLowerCase() !== ADMIN_EMAIL){
      clearAuthAndLogout('Not authenticated/authorized. Please log in as the authorized admin.');
      return;
    }
    if(window.location.pathname !== '/admin'){
      hide(qs('login-panel'));
      window.location.href = '/admin';
      return;
    }
    hide(qs('login-panel'));
    show(qs('dashboard'));
    updateAuthedEmail(whoJson.email, whoJson.isAdmin);
    loadUsers();
  updateTokenDiagnostics();
    if(diagBox){
      if(diagApi) diagApi.textContent = API_BASE;
      if(diagStatus) diagStatus.textContent = '200';
      if(diagReason) diagReason.textContent = 'OK';
      if(diagReqId) diagReqId.textContent = requestId;
      const diagAuth = qs('diag-auth-mode');
      if(diagAuth) diagAuth.textContent = detectAuthMode();
      diagBox.classList.remove('hidden');
    }
  } catch(ex){
    if(ex instanceof TypeError){
      err.textContent = 'Network/Proxy error';
      if(diagBox){
        if(diagApi) diagApi.textContent = API_BASE;
        if(diagStatus) diagStatus.textContent = '—';
        if(diagReason) diagReason.textContent = 'Network/Proxy error';
        if(diagReqId) diagReqId.textContent = requestId;
        const diagAuth = qs('diag-auth-mode');
        if(diagAuth) diagAuth.textContent = detectAuthMode();
        diagBox.classList.remove('hidden');
      }
    } else {
      // ex.message is expected in format rawReason || HTTP_<code>
      // Display HTTP status & backend reason if present.
      let msg = ex.message || '';
      if(!msg.startsWith('HTTP_') && !/\d{3}/.test(msg)){
        // Keep raw message (backend reason) as-is.
      }
      err.textContent = msg || 'Network/Proxy error';
      if(diagBox){
        if(diagApi) diagApi.textContent = API_BASE;
        if(diagStatus) diagStatus.textContent = diagStatus.textContent || '—';
        if(diagReason) diagReason.textContent = ex.message || '';
        if(diagReqId) diagReqId.textContent = requestId;
        const diagAuth = qs('diag-auth-mode');
        if(diagAuth) diagAuth.textContent = detectAuthMode();
        diagBox.classList.remove('hidden');
      }
    }
    err.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

// Toggle advanced diagnostics panel
document.addEventListener('DOMContentLoaded', () => {
  const toggle = qs('adv-diag-toggle');
  const body = qs('adv-diag-body');
  const caret = qs('adv-diag-caret');
  if(toggle && body){
    toggle.addEventListener('click', () => {
      const hidden = body.classList.toggle('hidden');
      if(caret) caret.textContent = hidden ? '▸' : '▾';
    });
  }
});

async function loadUsers(){
  const tbody = qs('users-tbody');
  const status = qs('table-status');
  tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-6 text-center text-slate-500">Loading...</td></tr>';
  try {
  const who = await enforceAdminGuard();
  if(!who) return; // guard handled message
  updateAuthedEmail(who.email, who.isAdmin);
    const resp = await authFetch(`${API_BASE}/admin/users`,{ method:'GET' });
    if(resp.status === 401 || resp.status === 403){
      return; // authFetch already cleared & messaged
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
    const resp = await authFetch(`${API_BASE}${path}`,{
      method:'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    if(resp.status === 401 || resp.status === 403){
      return; // session already cleared & message shown
    }
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
  const authTestBtn = qs('run-auth-test-btn');
  if(authTestBtn){
    authTestBtn.addEventListener('click', runAdminAuthTest);
  }
  const emailInput = qs('admin-email');
  const hint = qs('email-normalized-hint');
  // Deployment checklist: record resolved API base immediately
  setChecklistStatus('chk-api-base', 'success', API_BASE + (API_BASE === '/api' ? ' (proxy)' : ''));
  // Initial whoami status strip population
  initWhoAmIStrip();
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
    const resp = await authFetch(`${API_BASE}${AUTH_ME_PATH}`,{ method:'GET' });
    if(!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

// whoami strip logic
async function initWhoAmIStrip(){
  const strip = qs('whoami-strip');
  if(!strip) return;
  strip.textContent = 'whoami: loading...';
  try {
  const resp = await authFetch(`${API_BASE}${AUTH_WHOAMI_PATH}`, { method:'GET' });
    let payload = null;
    if(resp.headers.get('content-type')?.includes('application/json')){
      try { payload = await resp.json(); } catch { /* ignore */ }
    }
    if(resp.status === 401 || resp.status === 403){
      const reason = (payload?.reason || payload?.error || payload?.message || '').toString();
      // Show reason and return to login
      logoutWithMessage(reason ? `${resp.status} ${reason}` : `${resp.status} Unauthorized`);
      strip.textContent = `whoami: ${resp.status}${reason? ' ' + reason:''}`;
      strip.style.background = '#fef2f2';
      strip.style.color = '#b91c1c';
      return;
    }
    if(!resp.ok){
      strip.textContent = `whoami: HTTP_${resp.status}`;
      strip.style.background = '#fef2f2';
      strip.style.color = '#b91c1c';
      return;
    }
    const email = payload?.email || 'n/a';
    const isAdmin = payload?.isAdmin === true;
    strip.textContent = `Logged in as ${email}${isAdmin ? ' (Admin)' : ''}`;
    strip.style.background = '#e0f2fe';
    strip.style.color = '#0369a1';
    // Also update authed-email area if dashboard visible later
    updateAuthedEmail(email);
  } catch(ex){
    strip.textContent = 'whoami: network error';
    strip.style.background = '#fef2f2';
    strip.style.color = '#b91c1c';
  }
}

async function validateSessionOnRestore(){
  const who = await enforceAdminGuard();
  if(!who) return; // guard handled
  updateAuthedEmail(who.email, who.isAdmin);
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
  return enforceAdminGuard();
}

function updateAuthedEmail(email, isAdmin){
  const el = qs('authed-email');
  if(el) el.textContent = `Logged in as: ${email}${isAdmin? ' (Admin)':''}`;
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
    const who = await enforceAdminGuard();
    if(!who){
      setChecklistStatus('chk-whoami','error','unauthorized');
      return; // guard displayed message
    }
    setChecklistStatus('chk-whoami','success', who.email.toLowerCase());
    updateAuthedEmail(who.email, who.isAdmin);
  const resp = await authFetch(`${API_BASE}/admin/users`,{ method:'GET' });
    if(resp.status === 401 || resp.status === 403){
      setChecklistStatus('chk-users','error', String(resp.status));
      return; // already handled by authFetch
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

// -------- Admin Auth Test Pipeline --------
async function runAdminAuthTest(){
  const btn = qs('run-auth-test-btn');
  const out = qs('auth-test-output');
  if(!btn || !out) return;
  const email = qs('admin-email')?.value.trim().toLowerCase();
  const password = qs('admin-password')?.value;
  out.classList.remove('hidden');
  out.textContent = 'Running auth test...';
  btn.disabled = true;
  let lines = [];
  function log(line){ lines.push(line); out.textContent = lines.join('\n'); }
  try {
    log(`[1] POST /admin/login as ${email || '(missing email)'} ...`);
    const resp = await fetch(`${API_BASE}${AUTH_LOGIN_PATH}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    let body = null; if(resp.headers.get('content-type')?.includes('application/json')){ try { body = await resp.clone().json(); } catch{} }
    const reason = body?.reason || body?.error || body?.message || '';
    log(`    -> status ${resp.status}${reason? ' reason:'+reason:''}`);
    if(resp.ok){
      const token = body?.token || body?.accessToken || body?.jwt;
      if(token){ setAdminToken(token); log('    -> token stored'); }
      // whoami
      log(`[2] GET /auth/whoami`);
      const whoResp = await authFetch(`${API_BASE}${AUTH_WHOAMI_PATH}`, { method:'GET' });
      let who = null; if(whoResp.headers.get('content-type')?.includes('application/json')){ try { who = await whoResp.clone().json(); } catch{} }
      log(`    -> status ${whoResp.status} email:${who?.email||'n/a'} isAdmin:${who?.isAdmin}`);
      // users
      log(`[3] GET /admin/users`);
      const usersResp = await authFetch(`${API_BASE}/admin/users`, { method:'GET' });
      log(`    -> status ${usersResp.status}`);
      if(usersResp.ok){
        try { const arr = await usersResp.clone().json(); log(`    -> users count: ${Array.isArray(arr)? arr.length : 'n/a'}`); } catch{}
      }
    }
  } catch(err){
    log(`ERROR: ${err.message || err}`);
  } finally {
    btn.disabled = false;
  }
}

