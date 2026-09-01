// Fantasy Realms Calculator — App Logic
// ===== State =====
let state = {
    currentPlayer: 0,
    players: [{ name: 'Player 1', cards: [] }],
};

// ===== i18n =====
let LANG = localStorage.getItem('fantasyRealmLang') || 'en';

const I18N = {
    en: {
        total: 'Total',
        confirmNewGame: 'Start a new game? This will reset all scores.',
        player: 'Player',
    },
    nl: {
        total: 'Totaal',
        confirmNewGame: 'Nieuw spel starten? Dit reset alle scores.',
        player: 'Speler',
    },
};

function t(key) {
    return I18N[LANG][key] || key;
}

function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
}

function setLanguage(lang) {
    LANG = lang;
    localStorage.setItem('fantasyRealmLang', lang);
    translateUI();
    updateLangButtons();
}

function updateLangButtons() {
    document.getElementById('langEn').classList.toggle('active', LANG === 'en');
    document.getElementById('langNl').classList.toggle('active', LANG === 'nl');
}

function defaultPlayerName(index) {
    return t('player') + ' ' + (index + 1);
}

// ===== Player Management =====
function addPlayer() {
    if (state.players.length >= 6) return;
    state.players.push({ name: defaultPlayerName(state.players.length), cards: [] });
    rebuildPlayerList();
    saveSettings();
}

function removePlayer(index) {
    if (state.players.length <= 1) return;
    state.players.splice(index, 1);
    if (state.currentPlayer >= state.players.length) {
        state.currentPlayer = state.players.length - 1;
    }
    rebuildPlayerList();
    saveSettings();
}

function selectPlayer(index) {
    state.currentPlayer = index;
    rebuildPlayerList();
    updateActivePlayerName();
}

function rebuildPlayerList() {
    const list = document.getElementById('settingsPlayerList');
    list.innerHTML = '';
    state.players.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'settings-player-row' + (i === state.currentPlayer ? ' active' : '');
        row.innerHTML = `
            <span class="settings-player-color" style="background:${['#7c3aed','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'][i]}"></span>
            <span class="settings-player-name">${p.name}</span>
            <button class="settings-player-remove" onclick="event.stopPropagation(); removePlayer(${i})">✕</button>
        `;
        row.onclick = () => { selectPlayer(i); closeSettings(); };
        list.appendChild(row);
    });
    updateActivePlayerName();
}

function updateActivePlayerName() {
    const el = document.getElementById('currentPlayerName');
    if (el) el.textContent = state.players[state.currentPlayer].name;
}

// ===== Settings Persistence =====
function saveSettings() {
    try {
        localStorage.setItem('fantasyRealmSettings', JSON.stringify({
            lang: LANG,
        }));
    } catch (e) { /* ignore */ }
}

// ===== Settings Panel =====
function openSettings() {
    rebuildPlayerList();
    document.getElementById('settingsOverlay').classList.add('open');
    document.getElementById('settingsPanel').classList.add('open');
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.remove('open');
    document.getElementById('settingsPanel').classList.remove('open');
}

// ===== New Game =====
function newGame() {
    if (!confirm(t('confirmNewGame'))) return;
    state.players.forEach(p => { p.cards = []; });
    closeSettings();
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', function() {
    // Load persisted settings
    try {
        const saved = JSON.parse(localStorage.getItem('fantasyRealmSettings'));
        if (saved && saved.lang) {
            LANG = saved.lang;
            localStorage.setItem('fantasyRealmLang', saved.lang);
        }
    } catch (e) { /* ignore */ }

    translateUI();
    updateLangButtons();
    rebuildPlayerList();

    // Credit line
    const credit = document.getElementById('settingsCredit');
    if (credit) {
        credit.innerHTML = 'inspired by <a href="https://boardgamegeek.com/boardgame/223040/fantasy-realms">Fantasy Realms</a>';
    }
});