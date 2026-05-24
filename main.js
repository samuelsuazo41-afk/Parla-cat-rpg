// main.js - Lógica de Parla Cat RPG
let musicaActivada = true;

const LANGS = {
  es: {
    app_titol: "Parla Cat RPG - Crónicas de Cataluña",
    monedes: "Monedas",
    tab_mapa: "Mundo",
    tab_missio: "Misión",
    tab_gremi: "Gremio",
    tab_botiga: "Tienda",
    text_mon: "🗺️ Mapa de Catalunya",
    text_botiga: "🛒 Tienda",
    entrar: "Entrar",
    bloquejat: "Bloqueado",
    completat: "Completado",
    repetir: "Repetir",
    volver_mapa: "Volver al mapa",
    mision_completada: "¡Misión completada!",
    item_desbloquejat: "¡Item desbloqueado!",
    ruta_secreta: "Ruta secreta desbloquejada!",
    repas_rapido: "Repàs Ràpid",
    repas_titulo: "Repàs Ràpid - 5 Preguntes",
    tria_personatge: "Tria el teu personatge",
    nom_personatge: "Com et dius?",
    canviar_personatge: "Canviar Personatge",
    biblioteca: "Biblioteca",
    biblioteca_desc: "Tots els personatges disponibles per les teves històries",
    minijoc_titol: "Arma la frase",
    minijoc_desc: "Tria 2-3 emojis per formar la frase",
    comprovar: "Comprovar",
    correcte: "Correcte!",
    incorrecte: "No és així. Era:",
    no_prou_monedes: "No tens prou monedes!",
    comprat: "Comprat",
    desbloqueja_ruta: "Amb 3 ítems del capítol {n} desbloqueges la ruta secreta de {ciutat}"
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
    repas_titulo: "Repàs Ràpid - 5 Preguntes",
    tria_personatge: "Tria el teu personatge",
    nom_personatge: "Com et dius?",
    canviar_personatge: "Canviar Personatge",
    biblioteca: "Biblioteca",
    biblioteca_desc: "Tots els personatges disponibles per les teves històries",
    minijoc_titol: "Arma la frase",
    minijoc_desc: "Tria 2-3 emojis per formar la frase",
    comprovar: "Comprovar",
    correcte: "Correcte!",
    incorrecte: "No és així. Era:",
    no_prou_monedes: "No tens prou monedes!",
    comprat: "Comprat",
    desbloqueja_ruta: "Amb 3 ítems del capítol {n} desbloqueges la ruta secreta de {ciutat}"
  }
};

let idioma = localStorage.getItem('cat_idioma') || 'es';
let LANG = LANGS[idioma];

// Personatges jugador
const PERSONATGES_JUGADOR = [
  {id: 'noi', emoji: '👦', nom: 'Noi'},
  {id: 'noia', emoji: '👧', nom: 'Noia'},
  {id: 'home', emoji: '👨', nom: 'Home'},
  {id: 'dona', emoji: '👩', nom: 'Dona'}
];

// Cargar biblioteca de emojis
fetch('./data/biblioteca_emojis.json')
  .then(res => res.json())
  .then(data => { 
    BIBLIOTECA_EMOJIS_BASE = data; 
    console.log('Biblioteca cargada:', data.length, 'emojis');
  })
  .catch(err => { 
    console.error('Error cargando biblioteca_emojis.json:', err); 
    BIBLIOTECA_EMOJIS_BASE = [];
  });

let estat = {
  monedes: parseInt(localStorage.getItem('cat_monedes')) || 0,
  capitolsCompletats: JSON.parse(localStorage.getItem('cat_completats')) || [],
  objectes: JSON.parse(localStorage.getItem('cat_objectes')) || [],
  rutesDesbloquejades: JSON.parse(localStorage.getItem('cat_rutes')) || [],
  capitols100Counts: JSON.parse(localStorage.getItem('cat_capitols100')) || {},
  stats: {
    seny: parseInt(localStorage.getItem('cat_seny')) || 0,
    rauxa: parseInt(localStorage.getItem('cat_rauxa')) || 0,
    arrel: parseInt(localStorage.getItem('cat_arrel')) || 0,
    obert: parseInt(localStorage.getItem('cat_obert')) || 0
  },
  totem: localStorage.getItem('cat_totem') || 'neutral',
  personatge: JSON.parse(localStorage.getItem('cat_personatge')) || null,
  capitolActual: null,
  pasActual: 0,
  fallades: JSON.parse(localStorage.getItem('cat_fallades')) || [],
  falladesCapitol: 0,
  bloquejat: false,
  compres: JSON.parse(localStorage.getItem('cat_compres')) || [],
  emojisDesbloquejats: JSON.parse(localStorage.getItem('cat_emojis')) || [],
  minijoc: {
    fraseObjectiu: null,
    emojisTriats: [],
    emojisDisponibles: []
  }
};

const CAPITOLS = [
  {
    id: "capitol1_bcn_born",
    nom: "Barcelona - El Born",
    icona: "🏛️",
    desbloquejat: true,
    desc: `Arribes al Born. Si parles bé,\net conviden a vermut 🍷`,
    archivo: "capitol1_bcn_born.json",
    recompensa_100: {item_id: "camisa_cenguera_barca", ruta: "ruta_rave_port_olympic"}
  },
  {
    id: "capitol_02_girona",
    nom: "Girona - Temps de Flors",
    icona: "⚜️",
    desbloquejat: false,
    desc: "Flors als carrers. Català més lent, més de poble.",
    archivo: "capitol_02_girona.json",
    requereix: "capitol1_bcn_born",
    recompensa_100: {item_id: "flor_suprema_temps_flors", ruta: "ruta_girona_muralla_viva"}
  },
  {
    id: "capitol_03_fires_valencia",
    nom: "València - Fira de Falles",
    icona: "🔥",
    desbloquejat: false,
    desc: "La fira està encesa. Parla amb la gent i guanya el Fuet del Foc.",
    archivo: "capitol_03_fires_valencia.json",
    requereix: "capitol_02_girona",
    recompensa_100: {item_id: "clau_de_la_lonja", ruta: "ruta_valencia_ciutat_vella"}
  }
];

let ITEMS = {};
let AUDIO_ENCERT = null;
let AUDIO_FALLADA = null;

// --- MÚSICA ---
let audioCtx = false;
let musicaLoop = false;
let melodiaActual = false;

const MELODIAS = {
  gremi: [{freq: 196, dur: 1.5}, {freq: 220, dur: 1.5}, {freq: 196, dur: 3.0}],
  estudio: [{freq: 174, dur: 2.0}, {freq: 196, dur: 2.0}, {freq: 220, dur: 4.0}],
  calma: [{freq: 147, dur: 3.0}, {freq: 165, dur: 3.0}]
};

function vibrar() {
  if (navigator.vibrate) navigator.vibrate(20);
}

function iniciarMusicaChiptune(nombreMelodia = 'estudio') {
  if (!musicaActivada) return;
  if (melodiaActual === nombreMelodia && musicaLoop) return;
  pararMusica();
  melodiaActual = nombreMelodia;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notas = MELODIAS[nombreMelodia];
  let tiempo = audioCtx.currentTime;

  function tocarNota(nota) {
    if (nota.freq === 0) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = nota.freq;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(tiempo);
    osc.stop(tiempo + nota.dur);
  }

  function loop() {
    tiempo = audioCtx.currentTime;
    notas.forEach(nota => {
      tocarNota(nota);
      tiempo += nota.dur;
    });
    musicaLoop = setTimeout(loop, notas.reduce((a, b) => a + b.dur, 0) * 1000);
  }
  loop();
}

function pararMusica() {
  if (musicaLoop) clearTimeout(musicaLoop);
  if (audioCtx) audioCtx.close();
  musicaLoop = null;
  melodiaActual = null;
}

function tocarJingleCompletado() {
  if (!musicaActivada) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notas = [{freq: 523, dur: 0.15}, {freq: 659, dur: 0.15}, {freq: 784, dur: 0.15}, {freq: 1047, dur: 0.4}];
  let tiempo = audioCtx.currentTime;
  notas.forEach(nota => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = nota.freq;
    gain.gain.value = 0.00;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(tiempo);
    osc.stop(tiempo + nota.dur);
    tiempo += nota.dur;
  });
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
  aplicarIdioma();

  // Carga los emojis base para el minijoc y diccionari
  fetch('./data/biblioteca_emojis.json')
   .then(res => res.json())
   .then(data => { BIBLIOTECA_EMOJIS_BASE = data; })
   .catch(err => {
      BIBLIOTECA_EMOJIS_BASE = [];
      console.error('No s\'ha pogut carregar biblioteca_emojis.json', err);
    });

  carregarItems().then(() => {
    actualitzarUI();
    actualitzarTotem();
    carregarMapa();
    verificarRutesDesbloquejades();
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
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  if(e && e.target) e.target.closest('.nav-item').classList.add('active');
  if(tab === 'mapa') {pararMusica(); carregarMapa();}
  if(tab === 'missio') {pararMusica(); carregarMissioTab();}
  if(tab === 'gremi') {iniciarMusicaChiptune('gremi'); mostrarGremi('personatges', e);}
  if(tab === 'botiga') {iniciarMusicaChiptune('estudio'); carregarBotiga();}
}

async function carregarItems() {
  try {
    const res = await fetch('./data/items.json');
    const arr = await res.json();
    ITEMS = {};
    arr.forEach(i => ITEMS[i.id] = i);
  } catch(e) {
    ITEMS = {};
  }
}

async function carregarCapitol(nombreArchivo) {
  pararMusica();
  try {
    const res = await fetch(`./data/${nombreArchivo}`);
    if (!res.ok) throw new Error('Archivo no encontrado: ' + nombreArchivo);
    const data = await res.json();

    let capitolInfo = CAPITOLS.find(c => c.archivo === nombreArchivo);
    if (!capitolInfo) {
      const resCap = await fetch('./data/capitols.json');
      const capitolsData = await resCap.json();
      capitolInfo = capitolsData.find(c => c.arxiu === `./data/${nombreArchivo}`);
    }
    if (!capitolInfo) throw new Error('Capítol no trobat');

    estat.capitolActual = {id: capitolInfo.id, passos: data, recompensa_100: capitolInfo.recompensa_100 || null};
    estat.pasActual = 0;
    estat.falladesCapitol = 0;

    document.getElementById('missio-card').innerHTML = `
      <h3 id="missio-titol">Selecciona una missió al mapa</h3>

      <div id="npc-box" style="display:none;">
        <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:12px;">
          <span id="npc-emoji" style="font-size:42px; line-height:1;"></span>
          <div style="flex:1;">
            <strong id="npc-nom" style="font-size:16px; display:block; margin-bottom:4px;"></strong>
            <p id="npc-dialog" style="margin:0; line-height:1.4;"></p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; margin-top:15px; padding-top:12px; border-top:1px solid #333; opacity:0.8;">
          <span id="jugador-emoji" style="font-size:32px;"></span>
          <span id="jugador-nom" style="font-size:14px; color:#aaa;"></span>
        </div>
      </div>

      <div id="missio-escenari"></div>
      <div id="missio-opcions"></div>
      <div id="missio-feedback"></div>
    `;

    canviarTab('missio', null);
    setTimeout(() => carregarPas(), 100);
  } catch(e) {
    alert('Error carregant capítol: ' + e.message);
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
    let html = `<div class="capitol-icona">${capitol.icona}</div><h3>${capitol.nom}</h3><p>${capitol.desc}</p>`;
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

  estat.rutesDesbloquejades.forEach(rutaId => {
    const card = document.createElement('div');
    card.className = 'capitol-card ruta-secreta';
    card.innerHTML = `
      <div class="capitol-icona">🗝️</div>
      <h3>Ruta Secreta</h3>
      <p>Contingut ocult desbloquejat!</p>
      <button class="btn" onclick="carregarCapitol('${rutaId}.json')">Entrar</button>
    `;
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

  const npcEmoji = pas.npc_emoji || '👤';
  const npcNom = pas.npc_nom || 'NPC';
  const jugadorEmoji = estat.personatge?.emoji || '🧑';
  const jugadorNom = estat.personatge?.nom || 'Tu';

  document.getElementById('npc-box').style.display = 'block';
  document.getElementById('npc-emoji').textContent = npcEmoji;
  document.getElementById('npc-nom').textContent = npcNom;
  document.getElementById('npc-dialog').textContent = pas.dialog || '';
  document.getElementById('jugador-emoji').textContent = jugadorEmoji;
  document.getElementById('jugador-nom').textContent = jugadorNom;

  document.getElementById('missio-titol').textContent = pas.pregunta;
  const opcionsDiv = document.getElementById('missio-opcions');
  opcionsDiv.innerHTML = '';
  pas.opcions.forEach((opcio, i) => {
    const div = document.createElement('div');
    div.className = 'opcio';
    div.innerHTML = `<span class="opcio-text">${opcio.text}</span>`;
    div.onclick = () => seleccionarOpcio(i);
    opcionsDiv.appendChild(div);
  });
  document.getElementById('missio-feedback').innerHTML = '';
}

function seleccionarOpcio(idx) {
  if(estat.bloquejat) return;
  vibrar();
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
    if(opcio.stats) Object.keys(opcio.stats).forEach(k => {estat.stats[k] += opcio.stats[k];});
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
  feedbackDiv.innerHTML = `<div id="feedback-box"><p>${text}</p><div id="feedback-barra" style="animation-duration: ${duracio}ms;"></div></div>`;
}

function completarCapitol() {
  tocarJingleCompletado();
  if (!estat.capitolsCompletats.includes(estat.capitolActual.id)) {
    estat.capitolsCompletats.push(estat.capitolActual.id);
  }
  const seguent = CAPITOLS.find(c => c.requereix === estat.capitolActual.id);
  if (seguent) seguent.desbloquejat = true;

  document.getElementById('npc-box').style.display = 'none';
  const es100 = (estat.falladesCapitol || 0) === 0;
  const fallades = estat.falladesCapitol || 0;
  let htmlPremi = '';
  const vecesNecesarias = 3;

  if(es100 && estat.capitolActual.recompensa_100) {
    estat.capitols100Counts[estat.capitolActual.id] = (estat.capitols100Counts[estat.capitolActual.id] || 0) + 1;
    const veces100 = estat.capitols100Counts[estat.capitolActual.id];
    const item = ITEMS[estat.capitolActual.recompensa_100.item_id];
    if(item &&!estat.objectes.includes(estat.capitolActual.recompensa_100.item_id)) {
      estat.objectes.push(estat.capitolActual.recompensa_100.item_id);
    }
    if(veces100 >= vecesNecesarias && estat.capitolActual.recompensa_100.ruta) {
      if(!estat.rutesDesbloquejades.includes(estat.capitolActual.recompensa_100.ruta)) {
        estat.rutesDesbloquejades.push(estat.capitolActual.recompensa_100.ruta);
      }
    }
    const imgHtmlPremi = item?.emoji? `<div style="font-size: 80px; margin-bottom: 15px;">${item.emoji}</div>` : `<img src="${item?.imatge}" style="width:100px; height:100px; object-fit:contain;">`;
    htmlPremi = `<div class="item-desbloquejat">${imgHtmlPremi}<h3>${item?.nom || 'Premi'}</h3><p>${item?.descripcio || ''}</p><p style="color:#FFD700; font-weight:bold;">${veces100 >= vecesNecesarias? '<p style="color:#4CAF50;">Ruta secreta desbloquejada!</p>' : `Falten ${vecesNecesarias - veces100} cops per la ruta secreta`}</p></div>`;
  } else {
    htmlPremi = `<div style="text-align:center; margin-top:20px;"><p style="color:#ff6b6b; font-size:18px; font-weight:bold;">Has fallat ${fallades} pregunta${fallades > 1? 's' : ''}</p><p style="color:#888; margin-top:10px;">Fes 0 fallos per guanyar l'item especial.</p></div>`;
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
  verificarRutesDesbloquejades();
}

function verificarRutesDesbloquejades() {
  const rutes = document.getElementById('rutes-secretes');
  if (!rutes) return;

  const itemsCap1 = estat.objectes.filter(id => id.includes('capitol1')).length;
  const itemsCap2 = estat.objectes.filter(id => id.includes('capitol_02')).length;
  const itemsCap3 = estat.objectes.filter(id => id.includes('capitol_03')).length;

  if (itemsCap1 >= 3) {
    document.getElementById('ruta-valencia').style.opacity = '1';
    document.getElementById('ruta-valencia').querySelector('.capitol-icona').textContent = '🔓';
  }
  if (itemsCap2 >= 3) {
    document.getElementById('ruta-girona').style.opacity = '1';
    document.getElementById('ruta-girona').querySelector('.capitol-icona').textContent = '🔓';
  }
  if (itemsCap3 >= 3) {
    document.getElementById('ruta-tarragona').style.opacity = '1';
    document.getElementById('ruta-tarragona').querySelector('.capitol-icona').textContent = '🔓';
  }
}

function actualitzarTotem() {
  const stats = estat.stats;
  let maxStat = 'neutral';
  let maxVal = 0;
  Object.keys(stats).forEach(k => {
    if(stats[k] > maxVal) {maxVal = stats[k]; maxStat = k;}
  });
  estat.totem = maxVal >= 20? maxStat : 'neutral';
  document.documentElement.setAttribute('data-totem', estat.totem);
  const emojis = { seny: '🦉', rauxa: '🔥', arrel: '🌳', obert: '🌍', neutral: '' };
  document.getElementById('totem-display').textContent = estat.totem!== 'neutral'? `Tòtem: ${emojis[estat.totem]} ${estat.totem.toUpperCase()}` : '';
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
  document.getElementById('missio-card').innerHTML = `<h3 id="missio-titol">Selecciona una missió al mapa</h3><div id="missio-escenari"></div><div id="missio-opcions"></div><div id="missio-feedback"></div>`;
  canviarTab('mapa', null);
}

function carregarMissioTab() {
  if (!estat.capitolActual) {
    document.getElementById('rutes-secretes').style.display = 'block';
  } else {
    document.getElementById('rutes-secretes').style.display = 'none';
  }
}

function guardarEstat() {
  localStorage.setItem('cat_monedes', estat.monedes);
  localStorage.setItem('cat_completats', JSON.stringify(estat.capitolsCompletats));
  localStorage.setItem('cat_objectes', JSON.stringify(estat.objectes));
  localStorage.setItem('cat_rutes', JSON.stringify(estat.rutesDesbloquejades));
  localStorage.setItem('cat_capitols100', JSON.stringify(estat.capitols100Counts));
  localStorage.setItem('cat_seny', estat.stats.seny);
  localStorage.setItem('cat_rauxa', estat.stats.rauxa);
  localStorage.setItem('cat_arrel', estat.stats.arrel);
  localStorage.setItem('cat_obert', estat.stats.obert);
  localStorage.setItem('cat_totem', estat.totem);
  localStorage.setItem('cat_fallades', JSON.stringify(estat.fallades));
  localStorage.setItem('cat_personatge', JSON.stringify(estat.personatge));
  localStorage.setItem('cat_compres', JSON.stringify(estat.compres));
  localStorage.setItem('cat_emojis', JSON.stringify(estat.emojisDesbloquejats));
}

function actualitzarUI() {
  document.getElementById('coins').innerHTML = `🪙 ${estat.monedes} <span id="text-monedes">${LANG.monedes}</span>`;
  document.getElementById('stats').textContent = `Seny: ${estat.stats.seny} | Rauxa: ${estat.stats.rauxa} | Arrel: ${estat.stats.arrel} | Obert: ${estat.stats.obert}`;
}

function mostrarGremi(tab, e) {
  document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
  if(e) e.target.classList.add('active');
  const cont = document.getElementById('gremi-contenidor');
  const bibSubtabs = document.getElementById('biblioteca-subtabs');
  cont.innerHTML = '';

  if (tab === 'biblioteca') {
    bibSubtabs.style.display = 'flex';
    mostrarBibliotecaTab('diccionari');
    return;
  } else {
    bibSubtabs.style.display = 'none';
  }

  if(tab === 'personatges') {
    if(!estat.personatge) {
      let html = `<h3 style="text-align:center; margin-bottom:20px;">${LANG.tria_personatge}</h3>`;
      html += `<div style="display:grid; grid-template-columns:repeat(2,1fr); gap:15px; max-width:300px; margin:0 auto;">`;
      PERSONATGES_JUGADOR.forEach(p => {
        html += `<button class="btn" style="font-size:48px; padding:20px;" onclick="seleccionarPersonatge('${p.id}')">${p.emoji}<div style="font-size:14px; margin-top:5px;">${p.nom}</div></button>`;
      });
      html += `</div><div style="margin-top:20px; text-align:center;">
        <input type="text" id="nom-jugador" placeholder="${LANG.nom_personatge}" style="padding:10px; width:80%; border-radius:8px; border:none; background:#2a2a2a; color:#fff;">
      </div>`;
      cont.innerHTML = html;
    } else {
      const emojis = { seny: '🦉', rauxa: '🔥', arrel: '🌳', obert: '🌍', neutral: '😐' };
      const titols = { seny: 'Estratèg', rauxa: 'Impulsiu', arrel: 'Arrelat', obert: 'Cosmopolita', neutral: 'Novell' };
      const totalStats = estat.stats.seny + estat.stats.rauxa + estat.stats.arrel + estat.stats.obert;
      const rang = totalStats < 20? 'Novell' : totalStats < 50? 'Viatjant' : totalStats < 100? 'Mestre' : 'Llegendari';

      cont.innerHTML = `
        <div class="gremi-item" style="grid-column:1/-1; text-align:center;">
          <div style="font-size:64px;">${estat.personatge.emoji}</div>
          <h3 style="margin:10px 0;">${estat.personatge.nom}</h3>
          <p style="color:#888;">${estat.personatge.nom_cat}</p>
          <hr style="border-color:#333; margin:15px 0;">
          <p><b>Rang:</b> ${rang}</p>
          <p><b>Títol:</b> ${titols[estat.totem]}</p>
          <p><b>Capítols 100%:</b> ${estat.capitolsCompletats.length}/${CAPITOLS.length}</p>
          <button class="btn btn-sec" style="margin-top:15px;" onclick="canviarPersonatge()">${LANG.canviar_personatge}</button>
        </div>
      `;
    }
  }

  if(tab === 'objectes') {
    if(estat.objectes.length === 0) {
      cont.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#888;">Encara no tens objectes</div>`;
    } else {
      estat.objectes.forEach(id => {
        const item = ITEMS[id];
        if(item) {
          const esEmoji = item.imatge?.length <= 2 &&!item.imatge.startsWith('./');
          const imgHtml = esEmoji? `<div style="font-size: 60px; margin-bottom: 10px;">${item.imatge}</div>` : `<img src="${item.imatge}" style="width:80px; height:80px; object-fit:contain;">`;
          cont.innerHTML += `<div class="gremi-item">${imgHtml}<div>${item.nom}</div><div style="font-size:12px; color:#888;">${item.descripcio}</div></div>`;
        }
      });
    }
  }

  if(tab === 'llegendes') {
    const llegendes = [
      { id: 'capitol1_bcn_born', nom: 'El Born, Barcelona', icona: '🏛️', desbloquejada: estat.capitolsCompletats.includes('capitol1_bcn_born'), text: 'El Born és el barri gòtic més viu.' },
      { id: 'capitol_02_girona', nom: 'Temps de Flors, Girona', icona: '🏰', desbloquejada: estat.capitolsCompletats.includes('capitol_02_girona'), text: 'Cada maig, Girona s\'omple de flors.' },
      { id: 'capitol_03_fires_valencia', nom: 'Falles, València', icona: '🔥', desbloquejada: estat.capitolsCompletats.includes('capitol_03_fires_valencia'), text: 'El foc purifica tot.' }
    ];
    llegendes.forEach(l => {
      if(l.desbloquejada) {
        cont.innerHTML += `<div class="gremi-item" style="grid-column:1/-1;"><div style="font-size:36px;">${l.icona}</div><h3 style="margin:10px 0;">${l.nom}</h3><p style="font-size:14px; color:#ccc;">${l.text}</p><div style="color:#4CAF50; font-size:12px; margin-top:10px;">✓ Desbloquejada</div></div>`;
      } else {
        cont.innerHTML += `<div class="gremi-item" style="grid-column:1/-1; opacity:0.4;"><div style="font-size:36px;">🔒</div><h3 style="margin:10px 0;">???</h3><p style="font-size:14px; color:#666;">Completa el capítol per desbloquejar aquesta llegenda</p></div>`;
      }
    });
  }

function mostrarBibliotecaTab(tab, e) {
  document.querySelectorAll('#biblioteca-subtabs .sub-tab-btn').forEach(btn => btn.classList.remove('active'));
  if(e) e.target.classList.add('active');

  const cont = document.getElementById('gremi-contenidor');

  if(tab === 'diccionari') {
    let html = `<h3 style="text-align:center; margin-bottom:10px;">${LANG.biblioteca}</h3>`;
    html += `<p style="text-align:center; color:#888; margin-bottom:20px; font-size:14px;">${LANG.biblioteca_desc}</p>`;
    html += `<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; max-height:500px; overflow-y:auto; padding:10px;">`;

    const totsEmojis = [...BIBLIOTECA_EMOJIS_BASE,...estat.emojisDesbloquejats];
    totsEmojis.forEach(p => {
      html += `
        <div class="gremi-item" style="text-align:center; padding:15px 8px;">
          <div style="font-size:42px; margin-bottom:8px;">${p.emoji}</div>
          <div style="font-size:13px; font-weight:600; line-height:1.2;">${p.nom_cat}</div>
        </div>
      `;
    });
    html += `</div>`;
    cont.innerHTML = html;
  }

  if(tab === 'minijocs') {
    cont.innerHTML = `
      <h3>${LANG.minijoc_titol}</h3>
      <p style="color:var(--text-sec); margin:12px 0;">${LANG.minijoc_desc}</p>
      <div id="minijoc-frase" style="background:#222; padding:15px; border-radius:12px; min-height:50px; margin-bottom:15px; text-align:center; font-size:18px;">
        Prem "Nova frase" per començar
      </div>
      <button class="btn btn-sec" onclick="novaFraseMinijoc()" style="margin-bottom:15px;">Nova frase</button>
      <div id="minijoc-emojis" class="emoji-grid"></div>
      <div id="minijoc-triats" style="background:#222; padding:15px; border-radius:12px; min-height:50px; margin:15px 0; text-align:center; font-size:24px;"></div>
      <button class="btn" onclick="comprovarMinijoc()">${LANG.comprovar}</button>
      <div id="minijoc-feedback" style="margin-top:15px;"></div>
    `;
    novaFraseMinijoc();
  }
}

function novaFraseMinijoc() {
  const frases = [
    {frase: "El gat està content", emojis: ["🐱", "😊"]},
    {frase: "El gos està trist", emojis: ["🐶", "😢"]},
    {frase: "Jo tinc una poma", emojis: ["jo", "🍎"]},
    {frase: "Tu tens un plàtan", emojis: ["tu", "🍌"]},
    {frase: "La casa és gran", emojis: ["🏠", "😊"]},
    {frase: "El cotxe és ràpid", emojis: ["🚗", "😊"]},
    {frase: "Llegeixo un llibre", emojis: ["jo", "📚"]},
    {frase: "Bebem cafè", emojis: ["nosaltres", "☕"]}
  ];

  const random = frases[Math.floor(Math.random() * frases.length)];
  estat.minijoc.fraseObjectiu = random;
  estat.minijoc.emojisTriats = [];

  document.getElementById('minijoc-frase').textContent = random.frase;
  document.getElementById('minijoc-triats').textContent = '';
  document.getElementById('minijoc-feedback').innerHTML = '';

  const totsEmojis = [...BIBLIOTECA_EMOJIS_BASE,...estat.emojisDesbloquejats];
  const emojisBarreja = totsEmojis.sort(() => 0.5 - Math.random()).slice(0, 15);
  estat.minijoc.emojisDisponibles = emojisBarreja;

  let html = '';
  emojisBarreja.forEach((e, i) => {
    html += `
      <div class="emoji-item" onclick="triarEmojiMinijoc(${i})" style="cursor:pointer;">
        <div class="emoji-large">${e.emoji}</div>
        <div class="emoji-name">${e.nom_cat}</div>
      </div>
    `;
  });
  document.getElementById('minijoc-emojis').innerHTML = html;
}

function triarEmojiMinijoc(index) {
  vibrar();
  const emoji = estat.minijoc.emojisDisponibles[index];
  if (estat.minijoc.emojisTriats.length < 3) {
    estat.minijoc.emojisTriats.push(emoji);
    actualitzarTriatsMinijoc();
  }
}

function actualitzarTriatsMinijoc() {
  const div = document.getElementById('minijoc-triats');
  div.textContent = estat.minijoc.emojisTriats.map(e => e.emoji).join(' ');
}

function comprovarMinijoc() {
  vibrar();
  const objectiu = estat.minijoc.fraseObjectiu.emojis.join('');
  const triats = estat.minijoc.emojisTriats.map(e => e.emoji).join('');
  const feedback = document.getElementById('minijoc-feedback');

  if (objectiu === triats) {
    feedback.innerHTML = `<p style="color:#4CAF50; font-weight:bold;">${LANG.correcte}</p>`;
    estat.monedes += 50;
    estat.stats.arrel += 5;
    actualitzarUI();
    guardarEstat();
  } else {
    feedback.innerHTML = `<p style="color:#f44336; font-weight:bold;">${LANG.incorrecte} ${estat.minijoc.fraseObjectiu.emojis.join(' ')}</p>`;
  }

  setTimeout(() => novaFraseMinijoc(), 2000);
}

function seleccionarPersonatge(id) {
  const p = PERSONATGES_JUGADOR.find(x => x.id === id);
  const nomInput = document.getElementById('nom-jugador')?.value.trim();
  estat.personatge = {
    id: p.id,
    emoji: p.emoji,
    nom: nomInput || 'Jugador',
    nom_cat: p.nom
  };
  guardarEstat();
  mostrarGremi('personatges', null);
}

function canviarPersonatge() {
  estat.personatge = null;
  guardarEstat();
  mostrarGremi('personatges', null);
}

async function carregarBotiga() {
  const cont = document.getElementById('botiga-contenidor');
  try {
    const res = await fetch('./data/botiga_emojis.json');
    const data = await res.json();
    estat.packs_botiga = data.packs;
    cont.innerHTML = '';

    data.packs.forEach(pack => {
      const comprat = estat.compres.includes(pack.id);
      const card = document.createElement('div');
      card.className = 'capitol-card';
      card.innerHTML = `
        <div class="capitol-icona">🎁</div>
        <h3>${pack.nom}</h3>
        <p style="color:var(--text-sec); margin:8px 0;">${pack.descripcio}</p>
        <p style="font-size:24px;">${pack.emojis.map(e => e.emoji).join(' ')}</p>
        <button class="btn ${comprat? 'btn-sec' : ''}"
                onclick="comprarPack('${pack.id}', ${pack.preu})"
                ${comprat? 'disabled' : ''}>
          ${comprat? LANG.comprat : `🪙 ${pack.preu}`}
        </button>
      `;
      cont.appendChild(card);
    });
  } catch(e) {
    cont.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#888;">Pròximament</div>';
  }
}

function comprarPack(id, preu) {
  if (estat.monedes < preu) {
    alert(LANG.no_prou_monedes);
    return;
  }

  vibrar();
  estat.monedes -= preu;
  estat.compres.push(id);

  const pack = estat.packs_botiga.find(p => p.id === id);
  estat.emojisDesbloquejats.push(...pack.emojis);

  guardarEstat();
  actualitzarUI();
  carregarBotiga();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
  }
