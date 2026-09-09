// ============ Supabase-config ============
// TODO: vul in zodra het Supabase-project is aangemaakt (zie supabase_schema.sql
// voor de tabellen). Project-instellingen -> API -> Project URL / anon public key.
const SUPABASE_URL = 'VUL_HIER_JE_SUPABASE_PROJECT_URL_IN';
const ANON_KEY = 'VUL_HIER_JE_SUPABASE_ANON_KEY_IN';
const HEADERS = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' };

const IS_CONFIGURED = !SUPABASE_URL.startsWith('VUL_HIER');

// ============ Spelers (vaste lijst voor het inlogformulier) ============
const SPELERS_NAMEN = ['Sam', 'Milas', 'Giani', 'Luuk', 'Bas', 'Imran', 'Effe', 'Joshua'];

// ============ Sessie / login ============
// Simpel, laagdrempelig "wie ben jij"-slotje: gebruikersnaam én wachtwoord moeten
// allebei letterlijk "<Naam>JO85" zijn. Geen echte beveiliging (bewust — zie plan),
// gebruikt alleen om te bepalen wiens profiel bewerkt mag worden en wie teambeheerder is.
function normaliseer(x) { return (x || '').trim().toLowerCase(); }

async function inloggen(gebruikersnaam, wachtwoord) {
  const gebruikersnaamNorm = normaliseer(gebruikersnaam);
  const wachtwoordNorm = normaliseer(wachtwoord);
  if (!gebruikersnaamNorm || gebruikersnaamNorm !== wachtwoordNorm) return null;

  const speler = SPELERS_NAMEN.find(naam => `${naam}jo85`.toLowerCase() === gebruikersnaamNorm);
  if (!speler) return null;

  // Haal id + beheerder-status op uit de database, zodat rechten altijd kloppen
  // met wat er in Supabase staat (ook als je is_beheerder daar later aanpast).
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/spelers?naam=eq.${encodeURIComponent(speler)}&select=id,naam,is_beheerder`, { headers: HEADERS });
    const data = await resp.json();
    if (!data || data.length === 0) return null;
    const sessie = { id: data[0].id, naam: data[0].naam, isBeheerder: !!data[0].is_beheerder };
    localStorage.setItem('jo85_sessie', JSON.stringify(sessie));
    return sessie;
  } catch (e) {
    return null;
  }
}

function huidigeSessie() {
  try {
    const raw = localStorage.getItem('jo85_sessie');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function uitloggen() {
  localStorage.removeItem('jo85_sessie');
  window.location.reload();
}

// ============ Gedeelde header/nav ============
function renderHeader(actievePagina) {
  const sessie = huidigeSessie();
  const links = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'spelers.html', label: 'Team', key: 'spelers' },
    { href: 'programma.html', label: 'Programma', key: 'programma' },
    { href: 'uitslagen.html', label: 'Uitslagen', key: 'uitslagen' },
    { href: 'opstelling.html', label: 'Opstelling', key: 'opstelling' },
  ];

  const navHtml = links.map(l =>
    `<a href="${l.href}" class="${l.key === actievePagina ? 'actief' : ''}">${l.label}</a>`
  ).join('');

  const loginHtml = sessie
    ? `<div class="login-status">
         <span class="naam">👋 ${sessie.naam}</span>
         ${sessie.isBeheerder ? '<span class="beheerder-badge">Beheerder</span>' : ''}
         <button class="btn-uitloggen" onclick="uitloggen()">Uitloggen</button>
       </div>`
    : `<div class="login-status"><a href="spelers.html" style="color:rgba(255,255,255,0.9);text-decoration:underline;font-size:0.82rem">Inloggen via je profiel</a></div>`;

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="site-header">
      <div class="header-inner">
        <a href="index.html" class="logo"><span class="bal">⚽</span> JO8-5</a>
        <nav class="main-nav">${navHtml}</nav>
        ${loginHtml}
      </div>
    </header>
  `);
}

function renderFooter() {
  document.body.insertAdjacentHTML('beforeend', `
    <footer class="site-footer">JO8-5 &nbsp;·&nbsp; gemaakt met ⚽ voor het team</footer>
  `);
}

// ============ Kleine helpers ============
function formatDatum(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s == null ? '' : String(s);
  return div.innerHTML;
}

if (!IS_CONFIGURED) {
  console.warn('JO8-5 site: Supabase is nog niet geconfigureerd — vul SUPABASE_URL en ANON_KEY in shared.js in.');
}
