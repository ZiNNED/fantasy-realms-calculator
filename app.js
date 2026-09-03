// app.js — Fantasy Realms Calculator
// Full path: /home/dennis/fantasy-realms-calculator/app.js

// SUIT_ORDER, SUIT_COLORS, and getCard were historically imported from cards.js
// but are now self-contained in app.js. CARDS is loaded as a global via <script src="cards.js">.
const SUIT_ORDER = ['army', 'artifact', 'beast', 'flame', 'flood', 'land', 'leader', 'weapon', 'weather', 'wild', 'wizard'];
const SUIT_COLORS = {
    wizard: '#E75594', flood: '#4D4775', army: '#524239', weather: '#9DC6EF',
    land: '#633E28', flame: '#C54F3F', weapon: '#918A7D', artifact: '#F8743E',
    leader: '#82529B', beast: '#60A362', wild: '#D4D4D3',
};
function getCard(id) {
    if (typeof CARDS === 'undefined') return null;
    try { return CARDS.find(c => c.id === id); } catch (e) { return null; }
}

// ===== Localization =====
const LANG = 'en';
const strings = {
    en: {
        appTitle: 'Fantasy Realms Calculator',
        player: 'Player',
        addPlayer: '+ Add Player',
        removePlayer: 'Remove',
        handLimit: 'Hand limit',
        newGame: 'New Game',
        total: 'Total',
        settings: 'Settings',
        promoSection: 'Promo Cards',
        confirmNewGame: 'Start a new game? All current scores will be lost.',
        removePlayerConfirm: 'Remove this player?',
        jester: 'Jester',
        phoenix: 'Phoenix',
        blanked: 'BLANKED',
        zeroBase: '0 BASE',
    },
};

function t(key) { return (strings[LANG] && strings[LANG][key]) || key; }

// ===== State =====
let state = {
    currentPlayer: 0,
    players: [{ name: defaultPlayerName(0), hand: [] }],
    expansions: {},
};

function defaultPlayerName(idx) { return t('player') + ' ' + (idx + 1); }

// ===== Persistence =====
function saveSettings() {
    try {
        localStorage.setItem('fantasySettings', JSON.stringify({
            expansions: state.expansions,
        }));
    } catch (e) { /* ignore */ }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('fantasySettings');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.expansions) state.expansions = data.expansions;
        }
    } catch (e) { /* ignore */ }
}
loadSettings();

// Cards filtered by expansions
function getAvailableCards() {
    return CARDS.filter(card => {
        const exp = card.set || 'base';
        return exp === 'base' || state.expansions[exp];
    });
}

// ===== Suit ordering for display =====
const SUIT_DISPLAY_ORDER = ['wizard', 'flood', 'army', 'weather', 'land', 'flame', 'weapon', 'artifact', 'leader', 'beast', 'wild'];

// ===== DOM =====
const cardSectionsEl = document.getElementById('cardSections');

function buildCardSections() {
    // Remove old sections
    document.querySelectorAll('.suit-section').forEach(el => el.remove());

    const bySuit = {};
    getAvailableCards().forEach(card => {
        if (!bySuit[card.suit]) bySuit[card.suit] = [];
        bySuit[card.suit].push(card);
    });

    SUIT_DISPLAY_ORDER.forEach(suit => {
        const cardsInSuit = bySuit[suit] || [];
        if (cardsInSuit.length === 0) return;

        const section = document.createElement('div');
        section.className = 'suit-section';

        const summary = document.createElement('div');
        summary.className = 'suit-summary';
        summary.textContent = suit.charAt(0).toUpperCase() + suit.slice(1);
        summary.style.background = SUIT_COLORS[suit] || '#888';
        summary.style.color = suit === 'wild' ? '#333' : '#fff';
        summary.addEventListener('click', () => {
            section.classList.toggle('collapsed');
        });
        section.appendChild(summary);

        const grid = document.createElement('div');
        grid.className = 'card-grid';
        cardsInSuit.forEach(card => {
            const row = document.createElement('div');
            row.className = 'card-row';
            row.id = 'row-' + card.id;
            row.style.borderLeft = '3px solid ' + (SUIT_COLORS[card.suit] || '#888');

            // Indicator
            const indicator = document.createElement('span');
            indicator.className = 'card-indicator';
            indicator.id = 'ind-' + card.id;
            row.appendChild(indicator);

            // Name
            const name = document.createElement('span');
            name.className = 'card-name';
            name.textContent = card.name.en + ((card.set && card.set !== 'base') ? ' [P]' : '');
            row.appendChild(name);

            // Base points
            const base = document.createElement('span');
            base.className = 'card-base';
            base.id = 'base-' + card.id;
            base.textContent = '...';
            base.style.display = 'none';
            row.appendChild(base);

            // Net bonus
            const net = document.createElement('span');
            net.className = 'card-net';
            net.id = 'net-' + card.id;
            net.textContent = '';
            row.appendChild(net);

            // Score
            const score = document.createElement('span');
            score.className = 'card-score';
            score.id = 'score-' + card.id;
            score.textContent = '...';
            row.appendChild(score);

            row.addEventListener('click', () => toggleCard(card.id));
            grid.appendChild(row);
        });
        section.appendChild(grid);
        cardSectionsEl.appendChild(section);
    });
}

function toggleCard(cardId) {
    const player = state.players[state.currentPlayer];
    const idx = player.hand.indexOf(cardId);
    if (idx >= 0) {
        player.hand.splice(idx, 1);
    } else {
        const limit = handCapacity(player);
        if (player.hand.length >= limit) {
            player.hand.shift();
        }
        player.hand.push(cardId);
    }
    saveSettings();
    updateAllScores();
}

// ===== Hand Capacity =====
function handCapacity(player) {
    return (player.hand.includes('necromancer') ? 8 : 7);
}

// ===== UI Updates =====
function updateAllScores() {
    document.querySelectorAll('.card-row').forEach(row => {
        const id = row.id.replace('row-', '');
        // Remove existing badges
        row.querySelectorAll('.card-blanked-badge, .card-change-badge, .clears-best-badge').forEach(b => b.remove());
        // Show base/net by default
        const baseEl = document.getElementById('base-' + id);
        const netEl = document.getElementById('net-' + id);
        const scoreEl = document.getElementById('score-' + id);
        const indicator = document.getElementById('ind-' + id);
        if (baseEl) { baseEl.textContent = ''; baseEl.style.display = 'none'; }
        if (netEl) netEl.textContent = '';
        if (scoreEl) scoreEl.textContent = '';
        if (indicator) indicator.className = 'card-indicator';
    });

    const players = state.players;
    if (players.length === 0) return;

    for (let pi = 0; pi < players.length; pi++) {
        const result = calculateScore(pi);
        if (!result) continue;

        // Check if it's the currently displayed player
        const isCurrent = (pi === state.currentPlayer);

        if (isCurrent) {
            // Update per-card scores
            document.querySelectorAll('.card-row').forEach(row => {
                const cid = row.id.replace('row-', '');
                const card = getCard(cid);
                if (!card) return;

                // Determine if this card is in the current player's hand
                const inHand = players[pi].hand.includes(cid);
                const blankedIds = result.blanked || [];
                const zeroedIds = result.zeroedPoints || [];
                const isBlanked = blankedIds.includes(cid);
                const isZeroed = zeroedIds.includes(cid);

                // Base points
                const base = result.cardBase && result.cardBase[cid] !== undefined ? result.cardBase[cid] : (card.points || 0);
                const baseEl = document.getElementById('base-' + cid);
                if (baseEl) {
                    if (inHand) {
                        baseEl.textContent = '(' + base + ')';
                        baseEl.style.display = '';
                    } else {
                        baseEl.textContent = '';
                        baseEl.style.display = 'none';
                    }
                }

                // Net bonus
                const net = result.cardNetBonus && result.cardNetBonus[cid] !== undefined ? result.cardNetBonus[cid] : 0;
                const netEl = document.getElementById('net-' + cid);
                if (netEl) {
                    if (inHand && net !== 0) {
                        netEl.textContent = (net > 0 ? '+' : '') + net;
                    } else {
                        netEl.textContent = '';
                    }
                }

                // Score
                const score = (inHand && result.cardScores && result.cardScores[cid] !== undefined) ? result.cardScores[cid] : 0;
                const scoreEl = document.getElementById('score-' + cid);
                if (scoreEl) scoreEl.textContent = inHand ? score : '';

                // Indicator + badges
                const indicator = document.getElementById('ind-' + cid);
                if (indicator) {
                    if (inHand) {
                        indicator.className = 'card-indicator selected';
                    } else {
                        indicator.className = 'card-indicator';
                    }
                }

                // Blank badges
                if (isBlanked) {
                    const badge = document.createElement('span');
                    badge.className = 'card-blanked-badge';
                    badge.textContent = t('blanked');
                    row.querySelector('.card-name').after(badge);
                } else if (isZeroed) {
                    const badge = document.createElement('span');
                    badge.className = 'card-blanked-badge zeroed';
                    badge.textContent = t('zeroBase');
                    row.querySelector('.card-name').after(badge);
                }

                // Change badges
                const badgeTexts = [];
                if (result.suitOverrides && result.suitOverrides[cid] !== undefined) {
                    badgeTexts.push(result.suitOverrides[cid].toUpperCase());
                }
                if (result.copySuits) {
                    const cs = result.copySuits.find(x => x.cardId === cid);
                    if (cs) badgeTexts.push(cs.to.toUpperCase());
                }
                if (badgeTexts.length > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'card-change-badge';
                    badge.textContent = badgeTexts.join(', ');
                    row.querySelector('.card-name').after(badge);
                }

                // clearsBest display
                if (result.clearsBestResults && result.clearsBestResults[cid]) {
                    const target = getCard(result.clearsBestResults[cid]);
                    if (target) {
                        const badge = document.createElement('span');
                        badge.className = 'card-change-badge clears-best-badge';
                        badge.textContent = '→ clears: ' + target.name.en;
                        row.querySelector('.card-name').after(badge);
                    }
                }

                // copyCard display
                if (result.copyCards) {
                    const cc = result.copyCards.find(x => x.cardId === cid);
                    if (cc) {
                        const target = getCard(cc.targetId);
                        if (target) {
                            const badge = document.createElement('span');
                            badge.className = 'card-change-badge';
                            badge.textContent = '↻ ' + target.name.en + ' (' + (cc.to || '').toUpperCase() + ', ' + cc.points + 'pts)';
                            row.querySelector('.card-name').after(badge);
                        }
                    }
                }

                // copyNameSuit display
                if (result.copyNameSuits) {
                    const ns = result.copyNameSuits.find(x => x.cardId === cid);
                    if (ns) {
                        const target = getCard(ns.targetId);
                        if (target) {
                            const badge = document.createElement('span');
                            badge.className = 'card-change-badge';
                            badge.textContent = '↻ ' + target.name.en;
                            row.querySelector('.card-name').after(badge);
                        }
                    }
                }
            });
        }
    }

    // ===== Summary =====
    const summaryDiv = document.getElementById('summary');
    if (!summaryDiv) return;
    summaryDiv.innerHTML = '';

    const currentPlayer = players[state.currentPlayer];
    if (!currentPlayer) return;
    const curResult = calculateScore(state.currentPlayer);

    // Player label
    const playerLabel = document.createElement('div');
    playerLabel.className = 'summary-player';
    playerLabel.textContent = currentPlayer.name;
    summaryDiv.appendChild(playerLabel);

    // Total
    const totalEl = document.createElement('div');
    totalEl.className = 'summary-total';
    totalEl.textContent = t('total') + ': ' + (curResult ? curResult.total : 0);
    summaryDiv.appendChild(totalEl);

    // Change info
    const changeInfo = document.getElementById('changeSuitInfo');
    if (changeInfo) {
        let infoLines = [];
        if (curResult && curResult.changeSuit) {
            const cs = curResult.changeSuit;
            infoLines.push(cs.targetId + ': ' + cs.from + ' → ' + cs.to);
        }
        if (curResult && curResult.copySuits) {
            curResult.copySuits.forEach(cs => {
                infoLines.push(cs.cardId + ': ' + cs.from + ' → ' + cs.to);
            });
        }
        if (curResult && curResult.copyCards) {
            curResult.copyCards.forEach(cc => {
                infoLines.push(cc.cardId + ': copies ' + cc.targetId + ' (' + cc.to + ')');
            });
        }
        if (curResult && curResult.copyNameSuits) {
            curResult.copyNameSuits.forEach(ns => {
                infoLines.push(ns.cardId + ': copies name+suit ' + ns.targetId + ' (' + ns.to + ')');
            });
        }
        if (curResult && curResult.clearsBestResults) {
            Object.entries(curResult.clearsBestResults).forEach(([cardId, targetId]) => {
                const card = getCard(cardId);
                const target = getCard(targetId);
                if (card && target) {
                    infoLines.push(card.name.en + ' → clears: ' + target.name.en);
                }
            });
        }
        if (infoLines.length > 0) {
            changeInfo.innerHTML = infoLines.map(l => '<div class="change-line">' + l + '</div>').join('');
        } else {
            changeInfo.innerHTML = '';
        }
    }

    // Suit breakdown
    const suitBreakdown = document.getElementById('suitBreakdown');
    if (!suitBreakdown) return;
    suitBreakdown.innerHTML = '';

    if (curResult) {
        let suitTotals = {};
        currentPlayer.hand.forEach(cid => {
            const card = getCard(cid);
            if (!card) return;
            const blankedIds = curResult.blanked || [];
            if (blankedIds.includes(cid)) return;
            const score = curResult.cardScores && curResult.cardScores[cid] !== undefined ? curResult.cardScores[cid] : 0;
            suitTotals[card.suit] = (suitTotals[card.suit] || 0) + score;
        });

        SUIT_DISPLAY_ORDER.forEach(suit => {
            if (!suitTotals[suit]) return;
            const line = document.createElement('div');
            line.className = 'suit-line';
            const color = SUIT_COLORS[suit] || '#888';
            line.innerHTML = '<span class="suit-dot" style="background:' + color + '"></span> ' +
                suit.charAt(0).toUpperCase() + suit.slice(1) + ': ' + suitTotals[suit];
            suitBreakdown.appendChild(line);
        });
    }
}

// ===== Calculation of clearsBest returns from Phase 4b =====
// Extended to handle blanking from cards with blanks penalties

// ===== Scoring Engine =====
// ===== Global extra suits map (set per scoreCards call) =====
let _extraSuitsMap = null;

function matchesFilter(card, filter) {
    if (filter.oddPoints && card.points % 2 !== 0) return true;
    if (filter.suit) {
        if (card.suit === filter.suit) return true;
        if (_extraSuitsMap && _extraSuitsMap[card.id] && _extraSuitsMap[card.id].includes(filter.suit)) return true;
    }
    if (filter.suits && Array.isArray(filter.suits)) {
        if (filter.suits.includes(card.suit)) return true;
        if (_extraSuitsMap && _extraSuitsMap[card.id] && filter.suits.some(s => _extraSuitsMap[card.id].includes(s))) return true;
    }
    if (filter.id && card.id === filter.id) return true;
    if (filter.ids && Array.isArray(filter.ids) && filter.ids.includes(card.id)) return true;
    if (filter.subtypes) {
        if (!card.subtypes) return false;
        return filter.subtypes.some(s => (card.subtypes || []).includes(s));
    }
    if (!filter.oddPoints && !filter.suit && !filter.suits && !filter.id && !filter.ids && !filter.subtypes) return true;
    return false;
}

/**
 * Phase 2–3: Compute blanked set, zeroedPoints, and active hand given the full cards array
 * and the cleared suits/cards sets. extraClearedCards are additional card IDs that should be
 * treated as cleared beyond those already in clearedCards (used by clearsBest trials).
 */
function computeBlankedAndActive(cards, clearedSuits, clearedCards, extraClearedCards) {
    const allClearedCards = new Set([...clearedCards, ...(extraClearedCards || [])]);
    const blanked = new Set();

    // Phase 2a: General blanks
    cards.forEach(card => {
        if (clearedSuits.has(card.suit) || allClearedCards.has(card.id)) return;
        (card.penalty || []).forEach(rule => {
            if (rule.type === 'blanks' && rule.of) {
                if (rule.mode === 'allExcept') {
                    cards.forEach(candidate => {
                        const matchesSuit = rule.of.suits && rule.of.suits.includes(candidate.suit);
                        const matchesIds = rule.of.ids && rule.of.ids.includes(candidate.id);
                        if (matchesSuit || matchesIds) return;
                        blanked.add(candidate.id);
                    });
                } else {
                    let targetSuits = [];
                    if (rule.of.suits) targetSuits = rule.of.suits;
                    else if (rule.of.suit) targetSuits = [rule.of.suit];

                    if (targetSuits.length > 0) {
                        cards.forEach(candidate => {
                            if (rule.of.other && candidate.id === card.id) return;
                            if (targetSuits.includes(candidate.suit)) {
                                if (rule.of.except && rule.of.except.includes(candidate.id)) return;
                                blanked.add(candidate.id);
                            }
                        });
                    }
                }
            }
        });
    });

    // Phase 2b: Self-blank — evaluate against the hand AFTER general blanks
    const postBlankHand = cards.filter(c => !blanked.has(c.id));
    cards.forEach(card => {
        if (clearedSuits.has(card.suit) || allClearedCards.has(card.id)) return;
        (card.penalty || []).forEach(rule => {
            if (rule.type === 'selfBlank' && rule.of) {
                const resolvedFilter = { ...rule.of };
                let count = postBlankHand.filter(c => matchesFilter(c, resolvedFilter)).length;
                if (resolvedFilter.other && matchesFilter(card, resolvedFilter)) count--;
                if (rule.when === 'present') {
                    if (count > 0) blanked.add(card.id);
                } else {
                    if (count === 0) blanked.add(card.id);
                }
            }
        });
    });

    // Partial blank rescue
    const zeroedPoints = new Set();
    for (const id of blanked) {
        const card = cards.find(c => c.id === id);
        if (card && (card.penalty || []).some(r => r.type === 'partialBlank')) {
            blanked.delete(id);
            zeroedPoints.add(id);
        }
    }

    // Phase 3: Active hand
    const activeHand = cards.filter(c => !blanked.has(c.id));

    return { blanked, zeroedPoints, activeHand };
}

/**
 * Phase 4a: Recompute clears from a given hand. extraClearedCards are added to the resulting
 * clearedCards set (used by clearsBest evaluations).
 */
function recomputeClears(hand, extraClearedCards) {
    const suits = new Set();
    const ids = new Set([...(extraClearedCards || [])]);
    const targets = new Map();
    targets.set('*', new Set());

    hand.forEach(card => {
        const bonusRules = (card.bonus && card.bonus.rules) || [];
        bonusRules.forEach(rule => {
            if (rule.type === 'clears' && rule.suit) {
                if (rule.suit === 'all') {
                    SUIT_ORDER.forEach(s => suits.add(s));
                } else {
                    suits.add(rule.suit);
                }
            }
            if (rule.type === 'clearsTarget' && rule.suit) {
                if (rule.on && rule.on.suit) {
                    if (!targets.has(rule.on.suit)) targets.set(rule.on.suit, new Set());
                    targets.get(rule.on.suit).add(rule.suit);
                } else {
                    targets.get('*').add(rule.suit);
                }
            }
        });
    });

    return { suits, ids, targets };
}

function computeScore(activeHand, effectivePoints, clearedSuits, clearedCards, clearedTargets, extraSuitsMap) {
    let total = 0;
    const cardScores = {};
    const cardBase = {};
    const cardNetBonus = {};

    activeHand.forEach(card => {
        let cardScore = effectivePoints[card.id];
        cardBase[card.id] = effectivePoints[card.id];
        const isCleared = clearedSuits.has(card.suit) || clearedCards.has(card.id);

        // ----- Bonuses -----
        const bonusObj = card.bonus || {};
        const bonusRules = bonusObj.rules || [];
        const bonusMode = bonusObj.mode || 'sum';

        if (bonusRules.length > 0) {
            const bonusPointsList = [];

            bonusRules.forEach(rule => {
                if (rule.type) return;

                const resolvedFilter = { ...rule.of };
                if (resolvedFilter.suit === 'same') {
                    resolvedFilter.suit = card.suit;
                }

                let count = activeHand.filter(c => matchesFilter(c, resolvedFilter)).length;
                if (resolvedFilter.other && matchesFilter(card, resolvedFilter)) count--;

                let rulePoints = 0;

                if (rule.per === 'flat') {
                    if (resolvedFilter.all) {
                        const allMatch = activeHand.every(c => matchesFilter(c, resolvedFilter));
                        if (allMatch && (!resolvedFilter.other || activeHand.length > 0)) {
                            rulePoints = rule.points;
                        }
                    } else if (resolvedFilter.other) {
                        if (count > 0) rulePoints = rule.points;
                    } else {
                        if (count > 0) rulePoints = rule.points;
                    }
                } else if (rule.per === 'flatAllIds') {
                    let allMet = true;
                    if (resolvedFilter.ids && Array.isArray(resolvedFilter.ids)) {
                        const handIds = activeHand.map(c => c.id);
                        if (!resolvedFilter.ids.every(id => handIds.includes(id))) allMet = false;
                    }
                    if (resolvedFilter.suits && Array.isArray(resolvedFilter.suits)) {
                        const handSuits = new Set();
                        activeHand.forEach(c => {
                            handSuits.add(c.suit);
                            if (extraSuitsMap && extraSuitsMap[c.id]) {
                                extraSuitsMap[c.id].forEach(s => handSuits.add(s));
                            }
                        });
                        if (!resolvedFilter.suits.every(s => handSuits.has(s))) allMet = false;
                    }
                    if (resolvedFilter.suit) {
                        const hasSuit = activeHand.some(c => {
                            if (c.suit === resolvedFilter.suit) return true;
                            if (extraSuitsMap && extraSuitsMap[c.id] && extraSuitsMap[c.id].includes(resolvedFilter.suit)) return true;
                            return false;
                        });
                        if (!hasSuit) allMet = false;
                    }
                    if (allMet) rulePoints = rule.points;
                } else if (rule.per === 'flatIfNone') {
                    if (count === 0) rulePoints = rule.points;
                } else if (rule.per === 'each') {
                    rulePoints = Math.max(0, count) * rule.points;
                } else if (rule.per === 'threshold') {
                    if (count >= (rule.min || 1)) rulePoints = rule.points;
                } else if (rule.per === 'tiered') {
                    if (rule.tiers) {
                        for (const tier of rule.tiers) {
                            if (count >= tier.min) { rulePoints = tier.points; break; }
                        }
                    }
                } else if (rule.per === 'manyOf') {
                    const suitCounts = {};
                    activeHand.forEach(c => {
                        const counted = new Set();
                        if (!counted.has(c.suit)) { suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; counted.add(c.suit); }
                        if (extraSuitsMap && extraSuitsMap[c.id]) {
                            extraSuitsMap[c.id].forEach(s => {
                                if (!counted.has(s)) { suitCounts[s] = (suitCounts[s] || 0) + 1; counted.add(s); }
                            });
                        }
                    });
                    const min = rule.min || 1;
                    rulePoints = Object.values(suitCounts).filter(cnt => cnt >= min).length * (rule.points || 0);
                } else if (rule.per === 'runs') {
                    const uniquePoints = [...new Set(activeHand.map(c => effectivePoints[c.id]))].sort((a, b) => a - b);
                    const tiers = (rule.tiers || []).sort((a, b) => b.min - a.min);
                    let runLen = 0;
                    for (let i = 0; i < uniquePoints.length; i++) {
                        if (i > 0 && uniquePoints[i] === uniquePoints[i - 1] + 1) { runLen++; } else { runLen = 1; }
                        const nextExists = i + 1 < uniquePoints.length && uniquePoints[i + 1] === uniquePoints[i] + 1;
                        if (!nextExists && runLen >= 3) {
                            for (const tier of tiers) { if (runLen >= tier.min) { rulePoints += tier.points; break; } }
                        }
                    }
                } else if (rule.per === 'baseBest') {
                    const matching = activeHand.filter(c => matchesFilter(c, resolvedFilter));
                    if (matching.length > 0) {
                        rulePoints = Math.max(...matching.map(c => effectivePoints[c.id]));
                    }
                } else if (rule.per === 'baseSum') {
                    let matching = activeHand.filter(c => matchesFilter(c, resolvedFilter));
                    if (resolvedFilter.other) {
                        matching = matching.filter(c => c.id !== card.id);
                    }
                    rulePoints = matching.reduce((sum, c) => sum + effectivePoints[c.id], 0);
                }

                // ----- Condition check (if the rule has a condition, validate it) -----
                if (rulePoints > 0 && rule.condition) {
                    if (typeof rule.condition === 'string') {
                        if (rule.condition === 'allDifferentSuits') {
                            const suits = activeHand.map(c => c.suit);
                            if (new Set(suits).size !== suits.length) rulePoints = 0;
                        }
                    } else if (rule.condition && rule.condition.type === 'hasCard') {
                        const hasIt = activeHand.some(c => c.id === rule.condition.id || c.name?.en?.toLowerCase() === rule.condition.id);
                        if (!hasIt) rulePoints = 0;
                    }
                }

                bonusPointsList.push(rulePoints);
            });

            if (bonusMode === 'best') {
                cardScore += Math.max(...bonusPointsList);
            } else {
                bonusPointsList.forEach(rp => { cardScore += rp; });
            }
        }

        // ----- Penalties -----
        if (card.penalty && !isCleared) {
            card.penalty.forEach(rule => {
                if (rule.type) return;
                if (penaltyTargetsCleared(rule, clearedTargets, card.suit)) return;

                const resolvedFilter = { ...rule.of };
                if (resolvedFilter.suit === 'same') {
                    resolvedFilter.suit = card.suit;
                }

                let count = activeHand.filter(c => matchesFilter(c, resolvedFilter)).length;
                if (resolvedFilter.other && matchesFilter(card, resolvedFilter)) count--;

                if (rule.per === 'each') {
                    cardScore += Math.max(0, count) * rule.points;
                } else if (rule.per === 'flat' || rule.per === 'threshold') {
                    if (count >= (rule.min || 1)) cardScore += rule.points;
                } else if (rule.per === 'flatIfNone') {
                    if (count === 0) cardScore += rule.points;
                } else if (rule.per === 'tiered' && rule.tiers) {
                    for (const tier of rule.tiers) {
                        if (count >= tier.min) { cardScore += tier.points; break; }
                    }
                }
            });
        }

        total += cardScore;
        cardScores[card.id] = cardScore;
        cardNetBonus[card.id] = cardScore - cardBase[card.id];
    });

    return { total, cardScores, cardBase, cardNetBonus };
}

function scoreCards(cards) {
    _extraSuitsMap = null;

    // ===== Phase 1: Compute clear effects from ALL cards =====
    const clearedSuits = new Set();
    const clearedCards = new Set();
    const clearedTargets = new Map();
    clearedTargets.set('*', new Set());
    cards.forEach(card => {
        const bonusRules = (card.bonus && card.bonus.rules) || [];
        bonusRules.forEach(rule => {
            if (rule.type === 'clears' && rule.suit) {
                if (rule.suit === 'all') {
                    SUIT_ORDER.forEach(s => clearedSuits.add(s));
                } else {
                    clearedSuits.add(rule.suit);
                }
            }
            if (rule.type === 'clearsTarget' && rule.suit) {
                if (rule.on && rule.on.suit) {
                    if (!clearedTargets.has(rule.on.suit)) clearedTargets.set(rule.on.suit, new Set());
                    clearedTargets.get(rule.on.suit).add(rule.suit);
                } else {
                    clearedTargets.get('*').add(rule.suit);
                }
            }
            if (rule.type === 'extraSuits' && rule.suits) {
                if (!_extraSuitsMap) _extraSuitsMap = {};
                _extraSuitsMap[card.id] = [...new Set([...(_extraSuitsMap[card.id] || []), ...rule.suits])];
            }
        });
    });

    // ===== Phases 2–3: Compute blanked set and active hand =====
    let { blanked, zeroedPoints, activeHand } = computeBlankedAndActive(cards, clearedSuits, clearedCards);

    // ===== Phase 4a: Recompute clears from active cards only =====
    let ac = recomputeClears(activeHand);
    let activeClearedSuits = ac.suits;
    let activeClearedCards = ac.ids;
    let activeClearedTargets = ac.targets;

    // ===== Phase 4b: clearsBest brute-force =====
    // Try each possible target, computing full score with blanking re-evaluated
    // as if that target's blanks were suppressed.
    const clearsBestResults = {};
    // Snapshot the initial active hand so candidate filtering is consistent
    const initialActiveHand = activeHand;
    // Collect all clearsBest choices so we can recompute the final blanking state
    const allClearsBestChoices = new Set();

    initialActiveHand.forEach(card => {
        const bonusRules = (card.bonus && card.bonus.rules) || [];
        bonusRules.forEach(rule => {
            if (rule.type === 'clearsBest' && rule.of && rule.of.suits) {
                const candidates = initialActiveHand.filter(c => (c.id !== card.id) && rule.of.suits.includes(c.suit));
                if (candidates.length === 0) return;

                let bestTotal = -Infinity;
                let bestCard = null;

                candidates.forEach(candidate => {
                    // Recompute blanking as if this candidate's blanks were suppressed
                    const trialClearedCards = new Set([...allClearsBestChoices, candidate.id]);
                    const trial = computeBlankedAndActive(cards, clearedSuits, clearedCards, trialClearedCards);
                    const trialHand = trial.activeHand;
                    const trialClears = recomputeClears(trialHand, trialClearedCards);
                    const trialEP = {};
                    trialHand.forEach(c => { trialEP[c.id] = trial.zeroedPoints.has(c.id) ? 0 : (c.points || 0); });

                    const trialResult = computeScore(trialHand, trialEP, trialClears.suits, trialClears.ids, trialClears.targets, _extraSuitsMap);
                    if (trialResult.total > bestTotal) {
                        bestTotal = trialResult.total;
                        bestCard = candidate;
                    }
                });

                if (bestCard) {
                    allClearsBestChoices.add(bestCard.id);
                    clearsBestResults[card.id] = bestCard.id;
                }
            }
        });
    });

    // ===== Recompute final blanking state with all clearsBest choices applied =====
    if (allClearsBestChoices.size > 0) {
        const final = computeBlankedAndActive(cards, clearedSuits, clearedCards, allClearsBestChoices);
        blanked = final.blanked;
        zeroedPoints = final.zeroedPoints;
        activeHand = final.activeHand;

        const finalClears = recomputeClears(activeHand, allClearsBestChoices);
        activeClearedSuits = finalClears.suits;
        activeClearedCards = finalClears.ids;
        activeClearedTargets = finalClears.targets;
    }

    // ===== Build effectivePoints from final state =====
    const effectivePoints = {};
    activeHand.forEach(c => { effectivePoints[c.id] = zeroedPoints.has(c.id) ? 0 : (c.points || 0); });

    // ===== Phase 5: Score active cards =====
    const finalResult = computeScore(activeHand, effectivePoints, activeClearedSuits, activeClearedCards, activeClearedTargets, _extraSuitsMap);
    let { total, cardScores, cardBase, cardNetBonus } = finalResult;

    blanked.forEach(cid => { cardScores[cid] = 0; cardBase[cid] = 0; cardNetBonus[cid] = 0; });

    return { total, cardScores, cardBase, cardNetBonus, blanked: [...blanked], zeroedPoints: [...zeroedPoints], clearsBestResults };
}

function calculateScore(playerIdx) {
    const hand = state.players[playerIdx].hand.map(id => getCard(id)).filter(Boolean);
    const SUITS = ['wizard', 'leader', 'beast', 'land', 'weather', 'flood', 'flame', 'weapon', 'army', 'artifact', 'wild'];

    // Check if any card has a suit-changing bonus
    const changeSuitCards = hand.filter(c =>
        (c.bonus && c.bonus.rules || []).some(r => r.type === 'changeSuit')
    );

    // Check if any card has a copy-suit bonus
    const copySuitCards = hand.filter(c =>
        (c.bonus && c.bonus.rules || []).some(r => r.type === 'copySuit')
    );

    // Check if any card has a copy-card bonus (duplicate name, suit, points, penalty — but not bonus)
    const copyCardCards = hand.filter(c =>
        (c.bonus && c.bonus.rules || []).some(r => r.type === 'copyCard')
    );

    // Check if any card has a copy-name-suit bonus (duplicate name and suit only — no points/penalty)
    const copyNameSuitCards = hand.filter(c =>
        (c.bonus && c.bonus.rules || []).some(r => r.type === 'copyNameSuit')
    );

    if (changeSuitCards.length > 0 || copySuitCards.length > 0 || copyCardCards.length > 0 || copyNameSuitCards.length > 0) {
        let bestResult = null;
        let bestScore = -Infinity;
        const allOverrides = {};

        // Handle changeSuit (change another card's suit) — single best permutation
        for (const changer of changeSuitCards) {
            for (const target of hand) {
                if (target.id === changer.id) continue;
                for (const newSuit of SUITS) {
                    if (newSuit === target.suit) continue;
                    const trialHand = hand.map(c =>
                        c.id === target.id ? { ...c, suit: newSuit } :
                        allOverrides[c.id] ? { ...c, suit: allOverrides[c.id] } : c
                    );
                    const result = scoreCards(trialHand);
                    if (result.total > bestScore) {
                        bestScore = result.total;
                        result.changeSuit = { targetId: target.id, from: target.suit, to: newSuit };
                        bestResult = result;
                    }
                }
            }
        }

        // Collect change overrides from best changeSuit result
        if (bestResult && bestResult.changeSuit) {
            allOverrides[bestResult.changeSuit.targetId] = bestResult.changeSuit.to;
        }

        // Handle copySuit — independently optimize each copier
        const copySuits = [];
        for (const copier of copySuitCards) {
            const copyRule = (copier.bonus && copier.bonus.rules || []).find(r => r.type === 'copySuit');
            const candidateSuits = (copyRule && copyRule.of && copyRule.of.suits) || SUITS;
            let bestSuit = copier.suit;
            let bestSuitScore = -Infinity;

            for (const newSuit of candidateSuits) {
                if (newSuit === copier.suit) continue;
                const trialHand = hand.map(c =>
                    c.id === copier.id ? { ...c, suit: newSuit } :
                    allOverrides[c.id] ? { ...c, suit: allOverrides[c.id] } : c
                );
                const result = scoreCards(trialHand);
                if (result.total > bestSuitScore) {
                    bestSuitScore = result.total;
                    bestSuit = newSuit;
                }
            }

            if (bestSuit !== copier.suit) {
                copySuits.push({ cardId: copier.id, from: copier.suit, to: bestSuit });
                allOverrides[copier.id] = bestSuit;
            }
        }

        // Handle copyCard — independently optimize each copier
        const copyCards = [];
        for (const copier of copyCardCards) {
            const copyRule = (copier.bonus && copier.bonus.rules || []).find(r => r.type === 'copyCard');
            const allowedSuits = (copyRule && copyRule.of && copyRule.of.suits) || null;
            let bestTarget = null;
            let bestCopyScore = -Infinity;

            for (const target of hand) {
                if (target.id === copier.id) continue;
                if (allowedSuits && !allowedSuits.includes(target.suit)) continue;
                const trialHand = hand.map(c =>
                    c.id === copier.id ? {
                        ...c,
                        name: { en: '↻ ' + (target.name?.en || target.id) },
                        suit: target.suit,
                        points: target.points,
                        bonus: { mode: 'sum', rules: [] },
                        penalty: JSON.parse(JSON.stringify(target.penalty || [])),
                    } :
                    allOverrides[c.id] ? { ...c, suit: allOverrides[c.id] } : c
                );
                const result = scoreCards(trialHand);
                if (result.total > bestCopyScore) {
                    bestCopyScore = result.total;
                    bestTarget = target;
                }
            }

            if (bestTarget && bestTarget.id !== copier.id) {
                copyCards.push({ cardId: copier.id, targetId: bestTarget.id, from: copier.suit, to: bestTarget.suit, points: bestTarget.points });
                allOverrides[copier.id] = bestTarget.suit;
            }
        }

        // Handle copyNameSuit — independently optimize each copier (name + suit only, no points/penalty)
        const copyNameSuits = [];
        for (const copier of copyNameSuitCards) {
            const copyRule = (copier.bonus && copier.bonus.rules || []).find(r => r.type === 'copyNameSuit');
            const allowedSuits = (copyRule && copyRule.of && copyRule.of.suits) || SUITS;
            let bestTarget = null;
            let bestCopyScore = -Infinity;

            for (const target of CARDS) {
                if (target.id === copier.id) continue;
                if (allowedSuits && !allowedSuits.includes(target.suit)) continue;
                const trialHand = hand.map(c =>
                    c.id === copier.id ? {
                        ...c,
                        name: { en: target.name?.en || target.id },
                        suit: target.suit,
                    } :
                    allOverrides[c.id] ? { ...c, suit: allOverrides[c.id] } : c
                );
                const result = scoreCards(trialHand);
                if (result.total > bestCopyScore) {
                    bestCopyScore = result.total;
                    bestTarget = target;
                }
            }

            if (bestTarget && bestTarget.id !== copier.id) {
                copyNameSuits.push({ cardId: copier.id, targetId: bestTarget.id, from: copier.suit, to: bestTarget.suit });
                allOverrides[copier.id] = bestTarget.suit;
            }
        }

        // Score the final hand with all overrides applied
        const finalHand = hand.map(c =>
            allOverrides[c.id] ? { ...c, suit: allOverrides[c.id] } : c
        );

        // If we have copyCards, apply their full transformation
        let fullyTransformedHand = finalHand;
        for (const cc of copyCards) {
            const target = getCard(cc.targetId);
            if (target) {
                fullyTransformedHand = fullyTransformedHand.map(c =>
                    c.id === cc.cardId ? {
                        ...c,
                        name: { en: '↻ ' + (target.name?.en || target.id) },
                        suit: target.suit,
                        points: target.points,
                        bonus: { mode: 'sum', rules: [] },
                        penalty: JSON.parse(JSON.stringify(target.penalty || [])),
                    } : c
                );
            }
        }

        // If we have copyNameSuits, apply name + suit transformation
        for (const ns of copyNameSuits) {
            const target = getCard(ns.targetId);
            if (target) {
                fullyTransformedHand = fullyTransformedHand.map(c =>
                    c.id === ns.cardId ? {
                        ...c,
                        name: { en: target.name?.en || target.id },
                        suit: target.suit,
                    } : c
                );
            }
        }

        const finalResult = scoreCards(fullyTransformedHand);
        finalResult.suitOverrides = allOverrides;
        if (copySuits.length > 0) finalResult.copySuits = copySuits;
        if (copyCards.length > 0) finalResult.copyCards = copyCards;
        if (copyNameSuits.length > 0) finalResult.copyNameSuits = copyNameSuits;
        if (bestResult && bestResult.changeSuit) {
            finalResult.changeSuit = bestResult.changeSuit;
        }

        return finalResult;
    }

    return scoreCards(hand);
}

function penaltyTargetsCleared(rule, clearedTargets, cardSuit) {
    // Check if this penalty rule targets a suit that's been cleared
    const targets = [];

    // Extract target suit(s) from the rule's `of` filter
    if (rule.of) {
        if (rule.of.suit) targets.push(rule.of.suit);
        if (rule.of.suits) targets.push(...rule.of.suits);
    }

    // Check global cleared targets (any card)
    const globalTargets = clearedTargets.get('*');
    for (const t of targets) {
        if (globalTargets && globalTargets.has(t)) return true;
    }

    // Check scoped cleared targets (only on this card's suit)
    const scopedTargets = clearedTargets.get(cardSuit);
    for (const t of targets) {
        if (scopedTargets && scopedTargets.has(t)) return true;
    }

    return false;
}

// ===== UI: Settings Panel =====
// HTML uses onclick attributes; no id="settingsBtn"/"newGameBtn" elements

function openSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('open');

    // Sync toggle states
    Object.keys(state.expansions).forEach(key => {
        const row = document.getElementById(expansionRowId(key));
        if (row) row.querySelector('.toggle').classList.toggle('on', state.expansions[key]);
    });

    // Rebuild player list and leaderboard
    rebuildPlayerList();
    renderLeaderboard();
}

function closeSettings() {
    document.getElementById('settingsPanel').classList.remove('open');
}

function expansionRowId(key) {
    return 'exp' + key.charAt(0).toUpperCase() + key.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

window.toggleExpansion = function(key) {
    state.expansions[key] = !state.expansions[key];
    const row = document.getElementById(expansionRowId(key));
    if (row) {
        row.querySelector('.toggle').classList.toggle('on', state.expansions[key]);
    }
    // Remove cards from all hands if expansion is being disabled
    if (!state.expansions[key]) {
        const disabledIds = new Set(CARDS.filter(c => (c.set || 'base') !== 'base' && c.set === key).map(c => c.id));
        state.players.forEach(p => {
            p.hand = p.hand.filter(id => !disabledIds.has(id));
        });
    }
    saveSettings();
    buildCardSections();
    updateAllScores();
};

function rebuildPlayerList() {
    const container = document.getElementById('playerList');
    if (!container) return;
    container.innerHTML = '';
    state.players.forEach((p, idx) => {
        const row = document.createElement('div');
        row.className = 'settings-row player-row';
        row.innerHTML = '<span class="settings-label">' + p.name + '</span>';
        if (state.players.length > 1) {
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = t('removePlayer');
            removeBtn.addEventListener('click', () => removePlayer(idx));
            row.appendChild(removeBtn);
        }
        container.appendChild(row);
    });
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    container.innerHTML = '';
    const entries = state.players.map((p, idx) => {
        const result = calculateScore(idx);
        return { name: p.name, score: result ? result.total : 0, idx };
    });
    entries.sort((a, b) => b.score - a.score);
    entries.forEach(e => {
        const row = document.createElement('div');
        row.className = 'lb-row' + (e.idx === state.currentPlayer ? ' active' : '');
        row.innerHTML = '<span>' + e.name + '</span><span>' + e.score + '</span>';
        row.addEventListener('click', () => {
            state.currentPlayer = e.idx;
            closeSettings();
            updateActivePlayerName();
            buildCardSections();
            updateAllScores();
        });
        container.appendChild(row);
    });
}

function removePlayer(idx) {
    if (!confirm(t('removePlayerConfirm'))) return;
    state.players.splice(idx, 1);
    if (state.currentPlayer >= state.players.length) {
        state.currentPlayer = state.players.length - 1;
    }
    rebuildPlayerList();
    renderLeaderboard();
    updateActivePlayerName();
    buildCardSections();
    updateAllScores();
}

window.addPlayer = function() {
    const newIdx = state.players.length;
    state.players.push({ name: defaultPlayerName(newIdx), hand: [] });
    rebuildPlayerList();
    renderLeaderboard();
    closeSettings();
};

function newGame() {
    if (!confirm(t('confirmNewGame'))) return;
    state.players = [{ name: defaultPlayerName(0), hand: [] }];
    state.currentPlayer = 0;
    closeSettings();
    rebuildPlayerList();
    renderLeaderboard();
    updateActivePlayerName();
    buildCardSections();
    updateAllScores();
}

function updateActivePlayerName() {
    const el = document.getElementById('currentPlayerName');
    if (el) el.textContent = state.players[state.currentPlayer]?.name || '';
}

// ===== Init =====
buildCardSections();
updateAllScores();