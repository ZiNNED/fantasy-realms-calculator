// Fantasy Realms Calculator — App Logic

// ===== State =====
let state = {
    currentPlayer: 0,
    players: [{ name: 'Player 1', hand: [] }],
};

// ===== Player Colors =====
const PLAYER_COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

// ===== i18n =====
let LANG = localStorage.getItem('fantasyRealmLang') || 'en';

const I18N = {
    en: {
        total: 'Total',
        score: 'Score',
        cards: 'Cards',
        suit: 'Suit',
        points: 'Points',
        hand: 'Hand',
        clickToAdd: 'Tap a card to add it to your hand',
        tapToRemove: 'Tap card to remove',
        base: 'Base',
        confirmNewGame: 'Start a new game? This will reset all scores.',
        player: 'Player',
        addPlayer: 'Add Player',
        newGame: 'New Game',
        players: 'Players',
        language: 'Language',
        search: 'Search cards...',
        taken: 'Taken',
    },
};

function t(key) { return I18N[LANG][key] || key; }

function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
}

function setLanguage(lang) {
    if (lang !== 'en') return; // Only English supported
    LANG = lang;
    localStorage.setItem('fantasyRealmLang', lang);
    translateUI();
    updateLangButtons();
    renderHand();
    renderCardGrid();
}

function updateLangButtons() {
    document.getElementById('langEn').classList.toggle('active', LANG === 'en');
}

function defaultPlayerName(index) {
    return t('player') + ' ' + (index + 1);
}

// ===== Helpers =====
function isCardTaken(cardId, excludePlayerIdx) {
    return state.players.some((p, i) => {
        if (excludePlayerIdx !== undefined && i === excludePlayerIdx) return false;
        return p.hand.some(c => c.id === cardId);
    });
}

// ===== Player Management =====
function addPlayer() {
    if (state.players.length >= 6) return;
    state.players.push({ name: defaultPlayerName(state.players.length), hand: [] });
    rebuildPlayerList();
    renderHand();
    renderCardGrid();
    saveSettings();
}

function removePlayer(index) {
    if (state.players.length <= 1) return;
    state.players.splice(index, 1);
    if (state.currentPlayer >= state.players.length) {
        state.currentPlayer = state.players.length - 1;
    }
    rebuildPlayerList();
    renderHand();
    renderCardGrid();
    saveSettings();
}

function selectPlayer(index) {
    state.currentPlayer = index;
    rebuildPlayerList();
    updateActivePlayerName();
    renderHand();
    renderCardGrid();
}

function rebuildPlayerList() {
    const list = document.getElementById('settingsPlayerList');
    list.innerHTML = '';
    state.players.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'settings-player-row' + (i === state.currentPlayer ? ' active' : '');
        row.dataset.player = i + 1;

        const color = document.createElement('span');
        color.className = 'settings-player-color';
        color.style.background = PLAYER_COLORS[i % PLAYER_COLORS.length];
        row.appendChild(color);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'settings-player-name';
        nameSpan.textContent = p.name;
        nameSpan.onclick = function(e) {
            e.stopPropagation();
            editPlayerName(i);
        };
        row.appendChild(nameSpan);

        if (i > 0) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'settings-player-remove';
            removeBtn.textContent = '✕';
            removeBtn.onclick = function(e) {
                e.stopPropagation();
                removePlayer(i);
            };
            row.appendChild(removeBtn);
        }

        row.onclick = () => { selectPlayer(i); closeSettings(); };
        list.appendChild(row);
    });
    updateActivePlayerName();
}

function editPlayerName(idx) {
    const rows = document.querySelectorAll('.settings-player-row');
    if (idx >= rows.length) return;
    const row = rows[idx];
    const nameSpan = row.querySelector('.settings-player-name');
    if (!nameSpan) return;

    const current = nameSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.style.cssText = 'width:100%;background:white;color:#1a1a2e;border:1px solid #7c3aed;border-radius:4px;padding:2px 6px;font-size:0.85rem;font-family:inherit;outline:none;';

    nameSpan.style.display = 'none';
    nameSpan.parentNode.insertBefore(input, nameSpan.nextSibling);
    input.focus();
    input.select();

    function save() {
        const val = input.value.trim() || defaultPlayerName(idx);
        nameSpan.textContent = val;
        state.players[idx].name = val;
        input.remove();
        nameSpan.style.display = '';
        updateActivePlayerName();
    }

    input.onblur = save;
    input.onkeydown = function(e) {
        if (e.key === 'Enter') { save(); }
        if (e.key === 'Escape') { nameSpan.style.display = ''; input.remove(); }
    };
}

function updateActivePlayerName() {
    const el = document.getElementById('currentPlayerName');
    if (el) el.textContent = state.players[state.currentPlayer].name;
}

// ===== Scoring Engine =====
function matchesFilter(card, filter) {
    if (filter.oddPoints && card.points % 2 !== 0) return true;
    if (filter.suit && card.suit === filter.suit) return true;
    if (filter.id && card.id === filter.id) return true;
    if (filter.subtypes) {
        if (!card.subtypes) return false;
        return filter.subtypes.some(s => (card.subtypes || []).includes(s));
    }
    if (!filter.oddPoints && !filter.suit && !filter.id && !filter.subtypes) return true;
    return false;
}

function calculateScore(playerIdx) {
    const hand = state.players[playerIdx].hand;
    let total = 0;
    const breakdown = [];

    const clearedSuits = new Set();
    hand.forEach(c => {
        (c.effects || []).forEach(effect => {
            if (effect.type === 'clears' && effect.suit) {
                clearedSuits.add(effect.suit);
            }
        });
    });

    hand.forEach(card => {
        let cardScore = card.points || 0;
        const isCleared = clearedSuits.has(card.suit);

        if (card.scoring && card.scoring.length > 0) {
            card.scoring.forEach(rule => {
                if (isCleared && rule.points < 0) return;

                const resolvedFilter = { ...rule.of };
                if (resolvedFilter.suit === 'same') {
                    resolvedFilter.suit = card.suit;
                }

                let count = hand.filter(c => matchesFilter(c, resolvedFilter)).length;
                if (resolvedFilter.other && matchesFilter(card, resolvedFilter)) count--;

                let rulePoints = 0;

                if (rule.per === 'flat') {
                    if (resolvedFilter.all) {
                        const allMatch = hand.every(c => matchesFilter(c, resolvedFilter));
                        if (allMatch && (!resolvedFilter.other || hand.length > 0)) {
                            rulePoints = rule.points;
                        }
                    } else if (resolvedFilter.other) {
                        if (count > 0) rulePoints = rule.points;
                    } else {
                        if (count > 0) rulePoints = rule.points;
                    }
                } else if (rule.per === 'each') {
                    rulePoints = Math.max(0, count) * rule.points;
                } else if (rule.per === 'threshold') {
                    if (count >= (rule.min || 1)) {
                        rulePoints = rule.points;
                    }
                } else if (rule.per === 'tiered') {
                    if (rule.tiers) {
                        for (const tier of rule.tiers) {
                            if (count >= tier.min) {
                                rulePoints = tier.points;
                                break;
                            }
                        }
                    }
                }

                if (rulePoints !== 0) {
                    breakdown.push({
                        card: card.id,
                        rule: rule,
                        count: count,
                        points: rulePoints,
                    });
                }
                cardScore += rulePoints;
            });
        }

        total += cardScore;
        breakdown.push({
            card: card.id,
            points: cardScore,
            isBase: true,
        });
    });

    return { total, breakdown };
}

// ===== Card Management (shared pool) =====
function addCardToHand(cardId) {
    const player = state.players[state.currentPlayer];
    if (player.hand.length >= 7) return;
    if (isCardTaken(cardId)) return; // Already in someone's hand
    const card = CARDS.find(c => c.id === cardId);
    if (!card) return;
    player.hand.push({ ...card });
    renderHand();
    renderCardGrid();
    saveSettings();
}

function removeCardFromHand(cardId) {
    const player = state.players[state.currentPlayer];
    const idx = player.hand.findIndex(c => c.id === cardId);
    if (idx === -1) return;
    player.hand.splice(idx, 1);
    renderHand();
    renderCardGrid();
    saveSettings();
}

// ===== Rendering =====
function renderHand() {
    const player = state.players[state.currentPlayer];
    const container = document.getElementById('handDisplay');
    const scoreContainer = document.getElementById('scoreDisplay');
    const countEl = document.getElementById('handCount');

    if (countEl) countEl.textContent = player ? player.hand.length : 0;

    if (!player || player.hand.length === 0) {
        container.innerHTML = `<div class="hand-empty">${t('clickToAdd')}</div>`;
        if (scoreContainer) scoreContainer.innerHTML = '';
        return;
    }

    container.innerHTML = player.hand.map(card => `
        <div class="hand-card" onclick="removeCardFromHand('${card.id}')" title="${t('tapToRemove')}">
            <div class="hand-card-name">${card.name.en}</div>
            <div class="hand-card-suit">${card.suit}</div>
            <div class="hand-card-points">${card.points}</div>
        </div>
    `).join('');

    const result = calculateScore(state.currentPlayer);
    if (scoreContainer) {
        scoreContainer.innerHTML = `
            <div class="score-total">${t('total')}: <strong>${result.total}</strong></div>
            <div class="score-breakdown">
                ${result.breakdown.filter(b => b.isBase).map(b => {
                    const card = CARDS.find(c => c.id === b.card);
                    return `<div class="score-row">
                        <span class="score-card-name">${card ? card.name.en : b.card}</span>
                        <span class="score-value">${b.points}</span>
                    </div>`;
                }).join('')}
            </div>
        `;
    }
}

function renderCardGrid() {
    const player = state.players[state.currentPlayer];
    const container = document.getElementById('cardGrid');
    const search = (document.getElementById('cardSearch')?.value || '').toLowerCase();

    let filtered = CARDS;
    if (search) {
        filtered = CARDS.filter(c =>
            c.name.en.toLowerCase().includes(search) ||
            c.suit.toLowerCase().includes(search) ||
            c.id.toLowerCase().includes(search)
        );
    }

    const playerHandIds = player ? new Set(player.hand.map(c => c.id)) : new Set();
    const full = player && player.hand.length >= 7;
    const otherPlayerHandIds = new Set();
    state.players.forEach((p, i) => {
        if (i !== state.currentPlayer) {
            p.hand.forEach(c => otherPlayerHandIds.add(c.id));
        }
    });

    container.innerHTML = filtered.map(card => {
        const inHand = playerHandIds.has(card.id);
        const taken = otherPlayerHandIds.has(card.id);
        let cls = 'card-grid-item';
        if (inHand) cls += ' in-hand';
        else if (taken) cls += ' taken';

        let onclick = '';
        if (inHand) {
            onclick = `removeCardFromHand('${card.id}')`;
        } else if (!taken && !full) {
            onclick = `addCardToHand('${card.id}')`;
        }

        const check = inHand ? '<div class="card-grid-check">✓</div>' : '';
        const takenLabel = taken ? '' : ''; // Visual opacity handles it

        return `
            <div class="${cls}" onclick="${onclick}">
                <div class="card-grid-name">${card.name.en}</div>
                ${check}
            </div>
        `;
    }).join('');
}

// ===== Settings Persistence =====
function saveSettings() {
    try {
        const data = {
            lang: LANG,
            players: state.players.map(p => ({
                name: p.name,
                hand: p.hand.map(c => ({ id: c.id })),
            })),
        };
        localStorage.setItem('fantasyRealmSettings', JSON.stringify(data));
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
    state.players.forEach(p => { p.hand = []; });
    closeSettings();
    renderHand();
    renderCardGrid();
    saveSettings();
}

// ===== Card Search =====
function onCardSearch() {
    renderCardGrid();
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', function() {
    try {
        const saved = JSON.parse(localStorage.getItem('fantasyRealmSettings'));
        if (saved) {
            if (saved.lang) {
                LANG = 'en'; // Only English supported
                localStorage.setItem('fantasyRealmLang', 'en');
            }
            if (saved.players) {
                state.players = saved.players.map(p => ({
                    name: p.name,
                    hand: p.hand ? p.hand.map(h => {
                        const card = CARDS.find(c => c.id === h.id);
                        return card ? { ...card } : null;
                    }).filter(Boolean) : [],
                }));
            }
        }
    } catch (e) { /* ignore */ }

    translateUI();
    updateLangButtons();
    rebuildPlayerList();
    renderHand();
    renderCardGrid();
});