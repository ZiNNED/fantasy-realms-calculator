// ============================================
// Fantasy Realms Calculator — App Logic
// ============================================

// ===== Suit Definitions =====
const SUIT_ORDER = ['wizard', 'leader', 'beast', 'land', 'weather', 'flood', 'flame'];
const SUIT_LABELS = {
    wizard: 'Wizards',
    leader: 'Leaders',
    beast: 'Beasts',
    land: 'Lands',
    weather: 'Weather',
    flood: 'Floods',
    flame: 'Flames',
};
const SUIT_COLORS = {
    wizard: '#7c3aed',
    leader: '#e67e22',
    beast: '#10b981',
    land: '#22a6b3',
    weather: '#3498db',
    flood: '#2980b9',
    flame: '#e74c3c',
};

// ===== Player Colors =====
const PLAYER_COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

// ===== Localization =====
let LANG = 'en';

const I18N = {
    en: {
        total: 'Total',
        score: 'Score',
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
        leaderboard: 'Leaderboard',
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
    if (lang !== 'en') return;
    LANG = lang;
    translateUI();
    updateLangButtons();
    buildCardSections();
    updateAllScores();
}

function updateLangButtons() {
    document.getElementById('langEn').classList.toggle('active', LANG === 'en');
}

function defaultPlayerName(index) {
    return t('player') + ' ' + (index + 1);
}

// ===== State =====
let state = {
    currentPlayer: 0,
    players: [{ name: defaultPlayerName(0), hand: [] }],
};

// ===== Helpers =====
function getCard(id) {
    return CARDS.find(c => c.id === id);
}

function isCardTaken(cardId, excludePlayerIdx) {
    return state.players.some((p, i) => {
        if (excludePlayerIdx !== undefined && i === excludePlayerIdx) return false;
        return p.hand.includes(cardId);
    });
}

// ===== Player Management =====
function addPlayer() {
    if (state.players.length >= 6) return;
    state.players.push({ name: defaultPlayerName(state.players.length), hand: [] });
    rebuildPlayerList();
    buildCardSections();
    updateAllScores();
}

function removePlayer(index) {
    if (state.players.length <= 1) return;
    state.players.splice(index, 1);
    if (state.currentPlayer >= state.players.length) {
        state.currentPlayer = state.players.length - 1;
    }
    rebuildPlayerList();
    buildCardSections();
    updateAllScores();
}

function selectPlayer(index) {
    state.currentPlayer = index;
    rebuildPlayerList();
    updateActivePlayerName();
    buildCardSections();
    updateAllScores();
}

function rebuildPlayerList() {
    const list = document.getElementById('settingsPlayerList');
    list.innerHTML = '';
    state.players.forEach((p, i) => {
        const pIdx = i;
        const row = document.createElement('div');
        row.className = 'settings-player-row' + (i === state.currentPlayer ? ' active' : '');

        const color = document.createElement('span');
        color.className = 'settings-player-color';
        color.style.background = PLAYER_COLORS[i % PLAYER_COLORS.length];
        row.appendChild(color);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'settings-player-name';
        nameSpan.textContent = p.name;
        nameSpan.onclick = function(e) {
            e.stopPropagation();
            editPlayerName(pIdx);
        };
        row.appendChild(nameSpan);

        if (i > 0) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'settings-player-remove';
            removeBtn.textContent = '✕';
            removeBtn.onclick = function(e) { e.stopPropagation(); removePlayer(pIdx); };
            row.appendChild(removeBtn);
        }

        row.onclick = function() { selectPlayer(pIdx); closeSettings(); };
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
    const hand = state.players[playerIdx].hand.map(id => getCard(id)).filter(Boolean);
    let total = 0;
    const cardScores = {};

    const clearedSuits = new Set();
    hand.forEach(card => {
        (card.effects || []).forEach(effect => {
            if (effect.type === 'clears' && effect.suit) {
                clearedSuits.add(effect.suit);
            }
        });
    });

    hand.forEach(card => {
        let cardScore = card.points || 0;
        const isCleared = clearedSuits.has(card.suit);

        if (card.scoring && card.scoring.length > 0) {
            const rulePointsList = [];

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

                rulePointsList.push(rulePoints);
            });

            if (card.scoringMode === 'best') {
                cardScore += Math.max(...rulePointsList);
            } else {
                rulePointsList.forEach(rp => { cardScore += rp; });
            }
        }

        total += cardScore;
        cardScores[card.id] = cardScore;
    });

    return { total, cardScores };
}

// ===== Toggle Card Selection =====
function toggleCard(cardId) {
    const player = state.players[state.currentPlayer];
    const idx = player.hand.indexOf(cardId);

    if (idx !== -1) {
        // Deselect
        player.hand.splice(idx, 1);
    } else {
        // Select
        if (player.hand.length >= 7) return;
        if (isCardTaken(cardId)) return;
        player.hand.push(cardId);
    }

    buildCardSections();
    updateAllScores();
}

// ===== Build Card Sections =====
function buildCardSections() {
    const container = document.getElementById('cardSections');
    container.innerHTML = '';

    // Group cards by suit
    const bySuit = {};
    CARDS.forEach(card => {
        if (!bySuit[card.suit]) bySuit[card.suit] = [];
        bySuit[card.suit].push(card);
    });

    const player = state.players[state.currentPlayer];
    const playerHand = player ? player.hand : [];
    const fullHand = playerHand.length >= 7;

    SUIT_ORDER.forEach(suit => {
        const cards = bySuit[suit];
        if (!cards || cards.length === 0) return;

        const suitColor = SUIT_COLORS[suit] || '#999';
        const cardsInSuit = cards.sort((a, b) => a.name.en.localeCompare(b.name.en));

        const details = document.createElement('details');
        details.className = 'suit-details';
        details.setAttribute('open', '');

        const summary = document.createElement('summary');
        summary.className = 'suit-summary';

        const icon = document.createElement('span');
        icon.className = 'suit-icon';
        icon.style.background = suitColor;
        summary.appendChild(icon);

        const label = document.createElement('span');
        label.className = 'suit-label';
        label.textContent = SUIT_LABELS[suit] || suit.toUpperCase();
        summary.appendChild(label);

        const suitScore = document.createElement('span');
        suitScore.className = 'suit-score';
        suitScore.id = 'suitScore-' + suit;
        suitScore.textContent = '0';
        suitScore.style.cssText = 'font-size:0.95rem;font-weight:600;color:var(--text-secondary);';
        summary.appendChild(suitScore);

        details.appendChild(summary);

        cardsInSuit.forEach(card => {
            const row = document.createElement('div');
            row.className = 'card-row';
            row.id = 'cardRow-' + card.id;

            const inHand = playerHand.includes(card.id);
            const taken = isCardTaken(card.id);
            const canSelect = !taken && !fullHand;

            if (inHand) {
                row.classList.add('selected');
            } else if (taken) {
                row.classList.add('taken');
            } else if (fullHand) {
                row.classList.add('disabled');
            }

            // Indicator (empty circle or check)
            const indicator = document.createElement('span');
            indicator.className = 'card-indicator';
            indicator.textContent = inHand ? '✓' : '○';
            row.appendChild(indicator);

            // Card name
            const name = document.createElement('span');
            name.className = 'card-name';
            name.textContent = card.name.en;
            row.appendChild(name);

            // Score display
            const score = document.createElement('span');
            score.className = 'card-score';
            score.id = 'pts-' + card.id;
            score.textContent = '0';
            row.appendChild(score);

            row.onclick = function() { toggleCard(card.id); };
            details.appendChild(row);
        });

        container.appendChild(details);
    });
}

// ===== Update Scores =====
function updateAllScores() {
    const result = calculateScore(state.currentPlayer);
    const suitScores = {};

    // Initialize all suits to 0
    SUIT_ORDER.forEach(suit => { suitScores[suit] = 0; });

    // Update per-card displays and accumulate suit totals
    CARDS.forEach(card => {
        const pts = result.cardScores[card.id] || 0;
        const ptsEl = document.getElementById('pts-' + card.id);
        if (ptsEl) ptsEl.textContent = pts;

        // Accumulate suit score (only if card is in hand)
        const player = state.players[state.currentPlayer];
        if (player && player.hand.includes(card.id)) {
            suitScores[card.suit] = (suitScores[card.suit] || 0) + pts;
        }
    });

    // Update suit-level score displays
    SUIT_ORDER.forEach(suit => {
        const el = document.getElementById('suitScore-' + suit);
        if (el) el.textContent = suitScores[suit] || 0;
    });

    // Update summary
    document.getElementById('totalPoints').textContent = result.total;

    // Build suit breakdown in summary
    const breakdownContainer = document.getElementById('suitBreakdown');
    breakdownContainer.innerHTML = '';
    SUIT_ORDER.forEach(suit => {
        const score = suitScores[suit] || 0;
        const hasCards = state.players[state.currentPlayer].hand.some(cid => {
            const c = getCard(cid);
            return c && c.suit === suit;
        });
        if (!hasCards) return;

        const row = document.createElement('div');
        row.className = 'suit-breakdown-row';

        const icon = document.createElement('span');
        icon.className = 'suit-breakdown-icon';
        icon.style.background = SUIT_COLORS[suit] || '#999';
        row.appendChild(icon);

        const label = document.createElement('span');
        label.className = 'suit-breakdown-label';
        label.textContent = SUIT_LABELS[suit] || suit;
        row.appendChild(label);

        const val = document.createElement('span');
        val.className = 'suit-breakdown-value';
        val.textContent = score;
        row.appendChild(val);

        breakdownContainer.appendChild(row);
    });
}

// ===== Leaderboard =====
function computePlayerTotal(playerIdx) {
    const savedPlayer = state.currentPlayer;
    state.currentPlayer = playerIdx;
    const result = calculateScore(playerIdx);
    state.currentPlayer = savedPlayer;
    return result.total;
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    container.innerHTML = '';
    // Sort by total descending
    const totals = state.players.map((p, i) => ({ idx: i, total: computePlayerTotal(i) }));
    totals.sort((a, b) => b.total - a.total);

    totals.forEach(entry => {
        const p = state.players[entry.idx];
        const row = document.createElement('div');
        row.className = 'leader-row' + (entry.idx === state.currentPlayer ? ' active' : '');

        const color = document.createElement('span');
        color.className = 'leader-color';
        color.style.background = PLAYER_COLORS[entry.idx % PLAYER_COLORS.length];
        row.appendChild(color);

        const name = document.createElement('span');
        name.className = 'leader-name';
        name.textContent = p.name;
        row.appendChild(name);

        const pts = document.createElement('span');
        pts.className = 'leader-points';
        pts.textContent = entry.total;
        row.appendChild(pts);

        container.appendChild(row);
    });
}

// ===== Settings Panel =====
function openSettings() {
    rebuildPlayerList();
    renderLeaderboard();
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
    buildCardSections();
    updateAllScores();
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', function() {
    // Clean up any persisted state from previous versions
    try {
        localStorage.removeItem('fantasyRealmSettings');
        localStorage.removeItem('fantasyRealmLang');
    } catch (e) { /* ignore */ }

    translateUI();
    updateLangButtons();
    rebuildPlayerList();
    buildCardSections();
    updateAllScores();
});