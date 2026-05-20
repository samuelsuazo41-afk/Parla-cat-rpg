// main.js - Lógica de Parla Cat RPG
const LANGS = {
  es: {
    app_titol: "Parla Cat RPG - Crónicas de Cataluña",
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
    id: "capitol1_bcn_born",
    nom: "Barcelona - El Born",
    icona: "🏛️",
    desbloquejat: true,
    desc: `Arribes al Born. Si parles bé,\net conviden a vermut 🍷`,
    archivo: "capitol1_bcn_born.json",
    recompensa_100: {
      item_id: "camisa_cenguera_barca",
      ruta: "ruta_rave_port_olympic"
    }
  },
  {
    id: "capitol_02_girona",
    nom: "Girona - Temps de Flors",
    icona: "🌸",
    desbloquejat: false,
    desc: "Flors als carrers. Català més lent, més de poble.",
    archivo: "capitol_02_girona.json",
    requereix: "capitol1_bcn_born",
    recompensa_100: {
      item_id: "flor_suprema_temps_flors",
      ruta: "ruta_flors_nit"
    }
  },
  {
    id: "capitol_03_fires_valencia",
    nom: "València - Fira de Falles",
    icona: "🔥",
    desbloquejat: false,
    desc: "La fira està encesa. Parla amb la gent i guanya el Fuet del Foc.",
    archivo: "capitol_03_fires_valencia.json",
    requereix: "capitol_02_girona",
    recompensa_100: {
      item_id: "fuet_del_foc",
      ruta: "./fuet_fires.png"
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
    const arr = await res.json();
    ITEMS = {};
    arr.forEach(i => ITEMS[i.id] = i);
  } catch(e) {
    console.log('No s\'ha pogut carregar items.json');
    ITEMS = {};
  }
}

async function carregarCapitol(nombreArchivo) {
  try {
    const res = await fetch(`./data/${nombreArchivo}`);
    if (!res.ok) throw new Error('Archivo no encontrado: ' + nombreArchivo + ' - Status: ' + res.status);

    const data = await res.json();
    const capitolInfo = CAPITOLS.find(c => c.archivo === nombreArchivo);

    estat.capitolActual = {
      id: capitolInfo.id,
      passos: data,
      recompensa_100: capitolInfo.recompensa_100
    };

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
      <div class="capitol-icona">${capitol.icona}</div>
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
  document.getElementById('npc-nom').textContent = pas.escena?.split(' - ')[0] || 'NPC';
  document.getElementById('npc-text').innerHTML = `
    ${pas.dialog || ''}
    <span style="cursor:pointer; margin-left:8px;"
          onclick="parlar('${(pas.dialog || '').replace(/'/g, "\\'")}')">🔊</span>
  `;

  document.getElementById('missio-titol').textContent = pas.pregunta;
  document.getElementById('missio-escenari').textContent = '';

  const opcionsDiv = document.getElementById('missio-opcions');
  opcionsDiv.innerHTML = '';

  pas.opcions.forEach((opcio, i) => {
    const div = document.createElement('div');
    div.className = 'opcio';

    div.innerHTML = `
      ${opcio.text}
      <span style="cursor:pointer; margin-left:8px; float:right;"
            onclick="event.stopPropagation(); parlar('${opcio.text.replace(/'/g, "\\'")}')">🔊</span>
    `;

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

  const tempsLectura = 6000;
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

  const seguent = CAPITOLS.find(c => c.requereix === estat.capitolActual.id);
  if (seguent) seguent.desbloquejat = true;

  document.getElementById('npc-box').style.display = 'none';

  const es100 = (estat.falladesCapitol || 0) === 0;
  const fallades = estat.falladesCapitol || 0;
  let htmlPremi = '';

  if(es100 && estat.capitolActual.recompensa_100) {
    const item = ITEMS[estat.capitolActual.recompensa_100.item_id];
    if(item) {
      if(!estat.objectes.includes(estat.capitolActual.recompensa_100.item_id)) {
        estat.objectes.push(estat.capitolActual.recompensa_100.item_id);
      }
      if(estat.capitolActual.recompensa_100.ruta) {
        estat.rutesDesbloquejades.push(estat.capitolActual.recompensa_100.ruta);
      }

      htmlPremi = `
        <div class="item-desbloquejat">
          <img src="${item.imatge}" alt="${item.nom}">
          <h3>${item.nom}</h3>
          <p>${item.descripcio}</p>
          <p style="color:#FFD700; font-weight:bold;">100% Perfect!</p>
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
          Fes 0 fallos per guanyar l'item especial. Torna a intentar-ho!
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

// GREMI CORREGIDO
function mostrarGremi(tab, e) {
  document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
  if(e) e.target.classList.add('active');

  const cont = document.getElementById('gremi-contenidor');
  cont.innerHTML = '';

  // 1. PERSONATGES
  if(tab === 'personatges') {
    const emojis = { seny: '🦉', rauxa: '🔥', arrel: '🌳', obert: '🌍', neutral: '😐' };
    const titols = {
      seny: 'Estratèg',
      rauxa: 'Impulsiu',
      arrel: 'Arrelat',
      obert: 'Cosmopolita',
      neutral: 'Novell'
    };
    const desc = {
      seny: 'Penses abans d\'actuar. La gent confia en el teu seny.',
      rauxa: 'Actues amb passió. La teva energia contagia tothom.',
      arrel: 'Estimes la terra i la tradició. Ets la memòria del poble.',
      obert: 'Obert al món. Aprens de totes les cultures.',
      neutral: 'Acabes de començar el teu viatge per Catalunya.'
    };

    const totalStats = estat.stats.seny + estat.stats.rauxa + estat.stats.arrel + estat.stats.obert;
    const rang = totalStats < 20? 'Novell' : totalStats < 50? 'Viatjant' : totalStats < 100? 'Mestre' : 'Llegendari';

    cont.innerHTML = `
      <div class="gremi-item" style="grid-column:1/-1; text-align:center;">
        <h2 style="font-size:48px;">${emojis[estat.totem]}</h2>
        <h3 style="margin:10px 0;">Tòtem: ${estat.totem.toUpperCase()}</h3>
        <p style="color:#888; margin-bottom:15px;">${desc[estat.totem]}</p>
        <hr style="border-color:#333; margin:15px 0;">
        <p><b>Rang:</b> ${rang}</p>
        <p><b>Títol:</b> ${titols[estat.totem]}</p>
        <p><b>Capítols 100%:</b> ${estat.capitolsCompletats.length}/${CAPITOLS.length}</p>
        <p><b>Monedes:</b> 🪙 ${estat.monedes}</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; text-align:left;">
          <div>Seny: ${estat.stats.seny}</div>
          <div>Rauxa: ${estat.stats.rauxa}</div>
          <div>Arrel: ${estat.stats.arrel}</div>
          <div>Obert: ${estat.stats.obert}</div>
        </div>
      </div>
    `;
  }

  // 2. OBJECTES
  else if(tab === 'objectes') {
    if(estat.objectes.length === 0) {
      cont.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#888;">Encara no tens objectes</div>`;
    } else {
      estat.objectes.forEach(id => {
        const item = ITEMS[id];
        if(item) {
          cont.innerHTML += `
            <div class="gremi-item">
              <img src="${item.imatge}" style="width:80px; height:80px;">
              <div>${item.nom}</div>
              <div style="font-size:12px; color:#888;">${item.descripcio}</div>
            </div>
          `;
        }
      });
    }
  }

  // 3. LLEGENDES
  else if(tab === 'llegendes') {
    const llegendes = [
      {
        id: 'capitol1_bcn_born',
        nom: 'El Born, Barcelona',
        icona: '🏛️',
        desbloquejada: estat.capitolsCompletats.includes('capitol1_bcn_born'),
        text: 'El Born és el barri gòtic més viu. Aquí els comerciants parlaven català mentre venien espècies. Si parles bé, encara et conviden a vermut.'
      },
      {
        id: 'capitol_02_girona',
        nom: 'Temps de Flors, Girona',
        icona: '🌸',
        desbloquejada: estat.capitolsCompletats.includes('capitol_02_girona'),
        text: 'Cada maig, Girona s\'omple de flors. Els gironins parlen més a poc a poc, amb orgull de poble. La llegenda diu que les flors entenen el català.'
      },
      {
        id: 'capitol_03_fires_valencia',
        nom: 'Falles, València',
        icona: '🔥',
        desbloquejada: estat.capitolsCompletats.includes('capitol_03_fires_valencia'),
        text: 'El foc purifica tot. Durant les Falles, València crema el vell per deixar espai al nou. Els fallers diuen: "Si parles amb el cor, el foc t\'escolta".'
      }
    ];

    llegendes.forEach(l => {
      if(l.desbloquejada) {
        cont.innerHTML += `
          <div class="gremi-item" style="grid-column:1/-1;">
            <div style="font-size:36px;">${l.icona}</div>
            <h3 style="margin:10px 0;">${l.nom}</h3>
            <p style="font-size:14px; color:#ccc;">${l.text}</p>
            <div style="color:#4CAF50; font-size:12px; margin-top:10px;">✓ Desbloquejada</div>
          </div>
        `;
      } else {
        cont.innerHTML += `
          <div class="gremi-item" style="grid-column:1/-1; opacity:0.4;">
            <div style="font-size:36px;">🔒</div>
            <h3 style="margin:10px 0;">???</h3>
            <p style="font-size:14px; color:#666;">Completa el capítol per desbloquejar aquesta llegenda</p>
          </div>
        `;
      }
    });
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