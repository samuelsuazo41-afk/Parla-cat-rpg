// main.js - Lógica de Parla Cat RPG
// Carga este archivo en index.html con <script src="./main.js"></script>
// Y borra el <script> interno del HTML para no duplicar

const LANGS = {
  es: {
    app_titol: "Parla Cat RPG - Crónicas de   Cataluña",
    monedes: "Monedas",
    tab_mapa: "Mundo",
    tab_missio: "Misión",
    tab_gremi: "Gremio",
    tab_botiga: "Tienda",
    text_mon: "🗺️ Mapa de Cataluña",
    text_botiga: "🛒 Tienda",
    entrar: "Entrar",
    bloquejat: "Bloqueado",
    completat: "Completado",
    repetir: "Repetir",
    volver_mapa: "Volver al mapa",
    mision_completada: "¡Misión completada!",
    item_desbloquejat: "¡Item desbloqueado!",
    ruta_secreta: "Ruta secreta desbloqueada!",
    repas_rapido: "Repàs Ràpid",
    repas_titulo: "Repàs Ràpid - 5 Preguntes"
  },
  ca: {
    app_titol: "Parla Cat RPG - Cròniques de Catalunya",
    monedes: "Monedes",
    tab_mapa: "Món",
    tab_missio: "Missió",
    tab_gremi: "Gremi",
    tab_botiga: "Botiga",
    text_mon: "🗺️ Mapa de Catalunya",
    text_botiga: "🛒 Botiga",
    entrar: "Entrar",
    bloquejat: "Bloquejat",
    completat: "Completat",
    repetir: "Repetir",
    volver_mapa: "Tornar al mapa",
    mision_completada: "Missió completada!",
    item_desbloquejat: "Item desbloquejat!",
    ruta_secreta: "Ruta secreta desbloquejada!",
    repas_rapido: "Repàs Ràpid",
    repas_titulo: "Repàs Ràpid - 5 Preguntes"
  }
};

let idioma = localStorage.getItem('cat_idioma') || 'es';
let LANG = LANGS[idioma];

let estat = {
  monedes: parseInt(localStorage.getItem('cat_monedes')) || 0,
  capitolsCompletats: JSON.parse(localStorage.getItem('cat_completats')) || [],
  objectes: JSON.parse(localStorage.getItem('cat_objectes')) || [],
  rutesDesbloquejades: JSON.parse(localStorage.getItem('cat_rutes')) || [],
  stats: {
    seny: parseInt(localStorage.getItem('cat_seny')) || 0,
    rauxa: parseInt(localStorage.getItem('cat_rauxa')) || 0,
    arrel: parseInt(localStorage.getItem('cat_arrel')) || 0,
    obert: parseInt(localStorage.getItem('cat_obert')) || 0
  },
  totem: localStorage.getItem('cat_totem') || 'neutral',
  capitolActual: null,
  pasActual: 0,
  fallades: JSON.parse(localStorage.getItem('cat_fallades')) || [],
  falladesCapitol: 0,
  bloquejat: false
};

const CAPITOLS = [
  {
    id: "bcn_01",
    nom: "Barcelona - El Born",
    icona: "🧢",
    desbloquejat: true,
    desc: `Arribes al Born. Si parles bé,
et conviden a vermut 🍷 `,
    archivo: "capitol1_bcn_born.json",
    recompensa_100: {
      item_id: "camisa_cenguera_barca",
      ruta: "ruta_rave_port_olympic"
    }
  },
  {
    id: "gir_01",
    nom: "Girona - Temps de Flors",
    icona: "🌸",
    desbloquejat: false,
    desc: "Flors als carrers. Català més lent, més de poble.",
    archivo: "capitol2_girona.json",
    requereix: "bcn_01",
    recompensa_100: {
      item_id: "corona_flors_vives",
      ruta: "ruta_flors_nit"
    }
  }
];

let ITEMS = {};
let AUDIO_ENCERT = null;
let AUDIO_FALLADA = null;

// INIT
document.addEventListener('DOMContentLoaded', () => {
  aplicarIdioma();
  carregarItems().then(() => {
    actualitzarUI();
    actualitzarTotem();
    carregarMapa();
  });

  AUDIO_ENCERT = new Audio('data:audio/wav;base64,UklGRiZDAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQIAAAAAAAA=');
  AUDIO_FALLADA = new Audio('data:audio/wav;base64,UklGRiZDAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQIAAAAAAAAA');
});

function aplicarIdioma() {
  document.getElementById('app-titol').textContent = LANG.app_titol;
  document.getElementById('text-monedes').textContent = LANG.monedes;
  document.getElementById('tab-mapa-txt').textContent = LANG.tab_mapa;
  document.getElementById('tab-missio-txt').textContent = LANG.tab_missio;
  document.getElementById('tab-gremi-txt').textContent = LANG.tab_gremi;
  document.getElementById('tab-botiga-txt').textContent = LANG.tab_botiga;
  document.getElementById('text-mon').textContent = LANG.text_mon;
  document.getElementById('text-botiga').textContent = LANG.text_botiga;
}

function canviarTab(tab, e) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  if(e && e.target) e.target.closest('.tab-btn').classList.add('active');
  if(tab === 'mapa') carregarMapa();
  if(tab === 'gremi') mostrarGremi('personatges', e);
  if(tab === 'botiga') carregarBotiga();
  if(tab === 'missio') carregarMissioTab();
}

async function carregarItems() {
  try {
    const res = await fetch('./data/items.json');
    ITEMS = await res.json();
  } catch(e) {
    console.log('No s\'ha pogut carregar items.json');
    ITEMS = {};
  }
}

async function carregarCapitol(nombreArchivo) {
  try {
    const res = await fetch(`./data/${nombreArchivo}`);
    if (!res.ok) throw new Error('Archivo no encontrado: ' + nombreArchivo + ' - Status: ' + res.status);

    estat.capitolActual = await res.json();
    estat.pasActual = 0;
    estat.falladesCapitol = 0;

    document.getElementById('missio-card').innerHTML = `
      <h3 id="missio-titol">Selecciona una missió al mapa</h3>
      <div id="missio-escenari"></div>
      <div id="missio-opcions"></div>
      <div id="missio-feedback"></div>
    `;

    canviarTab('missio', null);
    setTimeout(() => carregarPas(), 100);

  } catch(e) {
    alert('Error carregant capítol: ' + e.message);
    console.error(e);
  }
}

function carregarMapa() {
  const mapaDiv = document.getElementById('mapa');
  mapaDiv.innerHTML = '';

  CAPITOLS.forEach(capitol => {
    const completat = estat.capitolsCompletats.includes(capitol.id);
    const desbloquejat = capitol.desbloquejat || estat.capitolsCompletats.includes(capitol.requereix);

    const card = document.createElement('div');
    card.className = 'capitol-card' + (completat? ' completat' : '') + (!desbloquejat? ' bloquejat' : '');

    let html = `
      <span class="icona">${capitol.icona}</span>
      <h3>${capitol.nom}</h3>
      <p>${capitol.desc}</p>
    `;

    if (completat) {
      html += `✓ ${LANG.completat} <button class="btn btn-sec" style="margin-top:10px;" onclick="repetirCapitol('${capitol.id}'); event.stopPropagation()">${LANG.repetir}</button>`;
    } else if (desbloquejat) {
      html += `<button class="btn" onclick="entrarCapitol('${capitol.id}')">${LANG.entrar}</button>`;
    } else {
      html += `<p style="color:#888; margin-top:10px;">${LANG.bloquejat}</p>`;
    }

    card.innerHTML = html;
    mapaDiv.appendChild(card);
  });
}

function entrarCapitol(id) {
  const capitol = CAPITOLS.find(c => c.id === id);
  if (capitol && capitol.archivo) carregarCapitol(capitol.archivo);
}

function repetirCapitol(id) {
  const capitol = CAPITOLS.find(c => c.id === id);
  if (!capitol) return;
  if(confirm(idioma === 'ca'? 'Vols repetir aquesta missió?' : '¿Quieres repetir esta misión?')) {
    estat.capitolsCompletats = estat.capitolsCompletats.filter(c => c!== id);
    guardarEstat();
    carregarCapitol(capitol.archivo);
  }
}

function carregarPas() {
  if (!estat.capitolActual) return;
  const pas = estat.capitolActual.passos[estat.pasActual];
  if (!pas) { completarCapitol(); return; }

  document.getElementById('npc-box').style.display = 'block';
  document.getElementById('npc-nom').textContent = pas.escena.split('.')[0];
  document.getElementById('npc-text').innerHTML = `${pas.dialog} <span style="cursor:pointer; margin-left:8px;" onclick="parlar('${pas.dialog.replace(/'/g, "\\'")}')">🔊</span>`;
  document.getElementById('missio-titol').textContent = pas.pregunta;
  document.getElementById('missio-escenari').textContent = '';

  const opcionsDiv = document.getElementById('missio-opcions');
  opcionsDiv.innerHTML = '';
  pas.opcions.forEach((opcio, i) => {
    const div = document.createElement('div');
    div.className = 'opcio';
    div.textContent = opcio.text;
    div.onclick = () => seleccionarOpcio(i);
    opcionsDiv.appendChild(div);
  });
  document.getElementById('missio-feedback').innerHTML = '';
}

function parlar(text) {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ca-ES';
    utter.rate = 0.9;
    speechSynthesis.speak(utter);
  }
}

function seleccionarOpcio(idx) {
  if(estat.bloquejat) return;

  const pas = estat.capitolActual.passos[estat.pasActual];
  const opcio = pas.opcions[idx];
  const feedback = opcio.feedback;

  estat.bloquejat = true;
  document.querySelectorAll('.opcio').forEach(o => o.classList.add('disabled'));

  const tempsLectura = Math.max(6000, feedback.length * 50);
  mostrarFeedback(feedback, tempsLectura);

  if(opcio.correcte && AUDIO_ENCERT) AUDIO_ENCERT.play();
  if(!opcio.correcte && AUDIO_FALLADA) AUDIO_FALLADA.play();

  if (opcio.correcte) {
    estat.monedes += opcio.guany?.monedes || 0;
    estat.stats.seny += opcio.guany?.seny || 0;
    estat.stats.rauxa += opcio.guany?.rauxa || 0;
    estat.stats.arrel += opcio.guany?.arrel || 0;
    estat.stats.obert += opcio.guany?.obert || 0;

    if(opcio.stats) {
      Object.keys(opcio.stats).forEach(k => {
        estat.stats[k] += opcio.stats[k];
      });
    }
  } else {
    estat.falladesCapitol = (estat.falladesCapitol || 0) + 1;
    estat.fallades.push({capitol: estat.capitolActual.id, pas: estat.pasActual});
  }

  actualitzarTotem();
  guardarEstat();
  actualitzarUI();

  setTimeout(() => {
    estat.bloquejat = false;
    estat.pasActual++;
    carregarPas();
  }, tempsLectura);
}

function mostrarFeedback(text, duracio) {
  const feedbackDiv = document.getElementById('missio-feedback');
  feedbackDiv.innerHTML = `
    <div id="feedback-box">
      <p>${text}</p>
      <div id="feedback-barra" style="animation-duration: ${duracio}ms;"></div>
    </div>
  `;
}

function completarCapitol() {
  if (!estat.capitolsCompletats.includes(estat.capitolActual.id)) {
    estat.capitolsCompletats.push(estat.capitolActual.id);
  }

  document.getElementById('npc-box').style.display = 'none';

  const es100 = (estat.falladesCapitol || 0) === 0;
  const fallades = estat.falladesCapitol || 0;
  let htmlPremi = '';

  if(es100 && estat.capitolActual.recompensa_100) {
    const item = ITEMS[estat.capitolActual.recompensa_100.item_id];
    if(item) {
      estat.objectes.push(estat.capitolActual.recompensa_100.item_id);
      estat.rutesDesbloquejades.push(estat.capitolActual.recompensa_100.ruta);

      htmlPremi = `
        <div class="item-desbloquejat" style="border: 2px solid #004D98; background: linear-gradient(135deg, #004D98, #A50044);">
          <img src="${item.imatge}" alt="${item.nom}" style="width:80px;">
          <h2>🔵🔴 Camisa cenguera del Barça desbloquejada!</h2>
          <h3>${item.emoji} ${item.nom}</h3>
          <p>${item.descripcio}</p>
          <p style="color:#FFD700; font-weight:bold;">100% Perfect! Visca el Barça i el català!</p>
        </div>
      `;
    }
  } else {
    htmlPremi = `
      <div style="text-align:center; margin-top:20px;">
        <p style="color:#ff6b6b; font-size:18px; font-weight:bold;">
          Has fallat ${fallades} pregunta${fallades > 1? 's' : ''}
        </p>
        <p style="color:#888; margin-top:10px;">
          Fes 0 fallos per guanyar la camisa del Barça. Torna a intentar-ho!
        </p>
      </div>
    `;
  }

  document.getElementById('missio-card').innerHTML = `
    <div class="completion-screen">
      <h2>✅ ${LANG.mision_completada}</h2>
      ${htmlPremi}
      <div class="completion-buttons">
        <button class="btn btn-sec" onclick="tornarMapa()">${LANG.volver_mapa}</button>
        <button class="btn" onclick="repetirCapitolActual()">${LANG.repetir}</button>
      </div>
    </div>
  `;

  guardarEstat();
  carregarMapa();
}

function actualitzarTotem() {
  const stats = estat.stats;
  let maxStat = 'neutral';
  let maxVal = 0;

  Object.keys(stats).forEach(k => {
    if(stats[k] > maxVal) {
      maxVal = stats[k];
      maxStat = k;
    }
  });

  estat.totem = maxVal >= 20? maxStat : 'neutral';
  document.documentElement.setAttribute('data-totem', estat.totem);

  const emojis = { seny: '🦉', rauxa: '🔥', arrel: '🌳', obert: '🌍', neutral: '' };
  document.getElementById('totem-display').textContent =
    estat.totem!== 'neutral'? `Tòtem: ${emojis[estat.totem]} ${estat.totem.toUpperCase()}` : '';
}

function repetirCapitolActual() {
  if (!estat.capitolActual) return;
  repetirCapitol(estat.capitolActual.id);
}

function tornarMapa() {
  estat.capitolActual = null;
  estat.pasActual = 0;
  estat.bloquejat = false;

  document.getElementById('npc-box').style.display = 'none';
  document.getElementById('missio-card').innerHTML = `
    <h3 id="missio-titol">Selecciona una missió al mapa</h3>
    <div id="missio-escenari"></div>
    <div id="missio-opcions"></div>
    <div id="missio-feedback"></div>
  `;
  canviarTab('mapa', null);
}

function carregarMissioTab() {
  if (!estat.capitolActual) {
    document.getElementById('missio-card').innerHTML = `
      <button class="btn" onclick="iniciarRepas()">${LANG.repas_rapido}</button>
      <h3 style="margin-top:20px;">${LANG.repas_titulo}</h3>
      <div id="repas-contenidor"></div>
    `;
  }
}

function iniciarRepas() {
  document.getElementById('repas-contenidor').innerHTML =
    '<p style="text-align:center; color:#888;">Completa un capítol primer</p>';
}

function guardarEstat() {
  localStorage.setItem('cat_monedes', estat.monedes);
  localStorage.setItem('cat_completats', JSON.stringify(estat.capitolsCompletats));
  localStorage.setItem('cat_objectes', JSON.stringify(estat.objectes));
  localStorage.setItem('cat_rutes', JSON.stringify(estat.rutesDesbloquejades));
  localStorage.setItem('cat_seny', estat.stats.seny);
  localStorage.setItem('cat_rauxa', estat.stats.rauxa);
  localStorage.setItem('cat_arrel', estat.stats.arrel);
  localStorage.setItem('cat_obert', estat.stats.obert);
  localStorage.setItem('cat_totem', estat.totem);
  localStorage.setItem('cat_fallades', JSON.stringify(estat.fallades));
}

function actualitzarUI() {
  document.getElementById('coins').innerHTML = `🪙 ${estat.monedes} <span id="text-monedes">${LANG.monedes}</span>`;
  document.getElementById('stats').textContent =
    `Seny: ${estat.stats.seny} | Rauxa: ${estat.stats.rauxa} | Arrel: ${estat.stats.arrel} | Obert: ${estat.stats.obert}`;
}

function mostrarGremi(tab, e) {
  document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
  if(e) e.target.classList.add('active');

  const cont = document.getElementById('gremi-contenidor');
  cont.innerHTML = '';

  if(tab === 'objectes') {
    estat.objectes.forEach(id => {
      const item = ITEMS[id];
      if(item) {
        cont.innerHTML += `
          <div class="gremi-item">
            <img src="${item.imatge}" style="width:64px; height:64px;">
            <div>${item.emoji} ${item.nom}</div>
            <div style="font-size:12px; color:#888;">${item.descripcio}</div>
          </div>
        `;
      }
    });
    if(estat.objectes.length === 0) {
      cont.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#888;">Encara no tens objectes</div>`;
    }
  } else {
    cont.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#888;">Pròximament</div>`;
  }
}

function carregarBotiga() {
  const cont = document.getElementById('botiga-contenidor');
  cont.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#888;">Pròximament</div>';
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
}