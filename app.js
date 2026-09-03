// ============================================
// Fantasy Realms Calculator — App Logic
// ============================================

// ===== Suit Definitions =====
const SUIT_ORDER = ['army', 'artifact', 'beast', 'flame', 'flood', 'land', 'leader', 'weapon', 'weather', 'wild', 'wizard'];
const SUIT_LABELS = {
    wizard: 'Wizards',
    leader: 'Leaders',
    beast: 'Beasts',
    land: 'Lands',
    weather: 'Weather',
    flood: 'Floods',
    flame: 'Flames',
    weapon: 'Weapons',
    army: 'Armies',
    artifact: 'Artifacts',
    wild: 'Wild',
};
const SUIT_COLORS = {
    wizard: '#E75594',
    flood: '#4D4775',
    army: '#524239',
    weather: '#9DC6EF',
    land: '#633E28',
    flame: '#C54F3F',
    weapon: '#918A7D',
    artifact: '#F8743E',
    leader: '#82529B',
    beast: '#60A362',
    wild: '#D4D4D3',
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
    expansions: { 'promo-jester': false, 'promo-phoenix': false },
};

// ===== Load saved settings =====
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

function scoreCards(cards) {
    // Take an array of card objects, compute full scoring (blanks → clears → bonus → penalty)
    //
    _extraSuitsMap = null;

    // ===== Phase 1: Compute clear effects from ALL cards =====
    // Clears must be evaluated before blanking so that cards like Protection Rune
    // (clears: all) can cancel blanking penalties before they're applied.
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

    // ===== Phase 2: Compute blanked cards =====
    // Skip blanking penalties from cards whose suit is cleared (e.g. Protection Rune)
    const blanked = new Set();
    cards.forEach(card => {
        if (clearedSuits.has(card.suit) || clearedCards.has(card.id)) return;
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
                    // Collect candidate suits from rule.of.suit (single) or rule.of.suits (array)
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

    // ===== Phase 2b: Self-blank — evaluate against the hand AFTER general blanks =====
    // A blanked card does not exist for counting purposes, so selfBlank checks
    // must look at the remaining (non-blanked) hand only.
    // Also skip selfBlank from cards whose suit is cleared.
    const postBlankHand = cards.filter(c => !blanked.has(c.id));
    cards.forEach(card => {
        if (clearedSuits.has(card.suit) || clearedCards.has(card.id)) return;
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

    // ----- Partial blank cards: when blanked, keep suits active but zero their base points -----
    const zeroedPoints = new Set();
    for (const id of blanked) {
        const card = cards.find(c => c.id === id);
        if (card && (card.penalty || []).some(r => r.type === 'partialBlank')) {
            blanked.delete(id);
            zeroedPoints.add(id);
        }
    }

    // ===== Phase 3: Active hand = non-blanked cards only =====
    const activeHand = cards.filter(c => !blanked.has(c.id));

    // ===== Phase 4: Recompute clears from active cards only =====
    // If a card with a clears effect was blanked, its clears should not apply.
    // We rebuild the cleared sets from the active hand only.
    const activeClearedSuits = new Set();
    const activeClearedCards = new Set();
    const activeClearedTargets = new Map();
    activeClearedTargets.set('*', new Set());
    activeHand.forEach(card => {
        const bonusRules = (card.bonus && card.bonus.rules) || [];
        bonusRules.forEach(rule => {
            if (rule.type === 'clears' && rule.suit) {
                if (rule.suit === 'all') {
                    SUIT_ORDER.forEach(s => activeClearedSuits.add(s));
                } else {
                    activeClearedSuits.add(rule.suit);
                }
            }
            if (rule.type === 'clearsTarget' && rule.suit) {
                if (rule.on && rule.on.suit) {
                    if (!activeClearedTargets.has(rule.on.suit)) activeClearedTargets.set(rule.on.suit, new Set());
                    activeClearedTargets.get(rule.on.suit).add(rule.suit);
                } else {
                    activeClearedTargets.get('*').add(rule.suit);
                }
            }
        });
    });

    // ===== Phase 4b: clearsBest brute-force =====
    // Try each possible target, compute full score, and pick the one that gives the highest total
    const effectivePoints = {};
    activeHand.forEach(c => { effectivePoints[c.id] = zeroedPoints.has(c.id) ? 0 : (c.points || 0); });

    const clearsBestResults = {};
    activeHand.forEach(card => {
        const bonusRules = (card.bonus && card.bonus.rules) || [];
        bonusRules.forEach(rule => {
            if (rule.type === 'clearsBest' && rule.of && rule.of.suits) {
                const candidates = activeHand.filter(c => (c.id !== card.id) && rule.of.suits.includes(c.suit));
                let bestTotal = -Infinity;
                let bestCard = null;
                candidates.forEach(candidate => {
                    const testCleared = new Set([...activeClearedCards, candidate.id]);
                    const result = computeScore(activeHand, effectivePoints, activeClearedSuits, testCleared, activeClearedTargets, _extraSuitsMap);
                    if (result.total > bestTotal) {
                        bestTotal = result.total;
                        bestCard = candidate;
                    }
                });
                if (bestCard) {
                    activeClearedCards.add(bestCard.id);
                    clearsBestResults[card.id] = bestCard.id;
                }
            }
        });
    });

    // ===== Phase 5: Score active cards =====
    const finalResult = computeScore(activeHand, effectivePoints, activeClearedSuits, activeClearedCards, activeClearedTargets, _extraSuitsMap);
    let { total, cardScores, cardBase, cardNetBonus } = finalResult;

    blanked.forEach(cid => { cardScores[cid] = 0; cardBase[cid] = 0; cardNetBonus[cid] = 0; });

    return { total, cardScores, cardBase, cardNetBonus, blanked: [...blanked], zeroedPoints: [...zeroedPoints], clearsBestResults };
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
        // Searches the full card pool, not just the hand — the copier can take any card's name/suit
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

function handCapacity(player) {
    return (player.hand.includes('necromancer') ? 8 : 7);
}

function penaltyTargetsCleared(rule, clearedTargets, cardSuit) {
    // Check if this penalty rule targets a suit that's been cleared
    const targets = [];
    if (rule.of && rule.of.suit) targets.push(rule.of.suit);
    if (rule.of && rule.of.suits) targets.push(...rule.of.suits);
    if (targets.length === 0) return false;
    const globalSet = clearedTargets.get('*') || new Set();
    const scopedSet = clearedTargets.get(cardSuit) || new Set();
    return targets.some(t => globalSet.has(t) || scopedSet.has(t));
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
        const cap = handCapacity(player);
        if (player.hand.length >= cap) return;
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

    // Group cards by suit, filtering by expansion
    const bySuit = {};
    CARDS.forEach(card => {
        const exp = card.set || 'base';
        if (exp !== 'base' && !state.expansions[exp]) return;
        if (!bySuit[card.suit]) bySuit[card.suit] = [];
        bySuit[card.suit].push(card);
    });

    const player = state.players[state.currentPlayer];
    const playerHand = player ? player.hand : [];
    const fullHand = playerHand.length >= handCapacity(player);

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
        summary.style.background = suitColor;
        summary.style.color = suit === 'wild' ? '#333' : '#fff';

        const label = document.createElement('span');
        label.className = 'suit-label';
        label.textContent = SUIT_LABELS[suit] || suit.toUpperCase();
        summary.appendChild(label);

        const suitScore = document.createElement('span');
        suitScore.className = 'suit-score';
        suitScore.id = 'suitScore-' + suit;
        suitScore.textContent = '0';
        suitScore.style.cssText = 'font-size:0.95rem;font-weight:600;';
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
            // Suit accent: left border in suit color
            row.style.borderLeft = '3px solid ' + suitColor;

            // Indicator (empty circle or check)
            const indicator = document.createElement('span');
            indicator.className = 'card-indicator';
            indicator.textContent = inHand ? '✓' : '○';
            row.appendChild(indicator);

            // Card name
            const name = document.createElement('span');
            name.className = 'card-name';
            name.textContent = card.name.en + ((card.set && card.set !== 'base') ? ' [P]' : '');
            row.appendChild(name);

            // Base points
            const baseEl = document.createElement('span');
            baseEl.className = 'card-base';
            baseEl.id = 'base-' + card.id;
            baseEl.textContent = '0';
            row.appendChild(baseEl);

            // Net bonus/penalty
            const netEl = document.createElement('span');
            netEl.className = 'card-net';
            netEl.id = 'net-' + card.id;
            netEl.textContent = '';
            row.appendChild(netEl);

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

        // Update base points and net bonus display
        const base = result.cardBase[card.id] !== undefined ? result.cardBase[card.id] : (card.points || 0);
        const net = result.cardNetBonus[card.id] !== undefined ? result.cardNetBonus[card.id] : 0;
        const baseEl = document.getElementById('base-' + card.id);
        if (baseEl) baseEl.textContent = '(' + base + ')';
        const netEl = document.getElementById('net-' + card.id);
        if (netEl) {
            if (net > 0) netEl.textContent = '+' + net;
            else if (net < 0) netEl.textContent = '' + net;
            else netEl.textContent = '';
        }

        // Show change badge on card row if this card has a suit/copy override
        const row = document.getElementById('cardRow-' + card.id);
        if (row) {
            // Remove existing badges
            const oldBadge = row.querySelector('.card-change-badge');
            if (oldBadge) oldBadge.remove();
            const oldBlankBadge = row.querySelector('.card-blanked-badge');
            if (oldBlankBadge) oldBlankBadge.remove();

            const override = result.suitOverrides && result.suitOverrides[card.id];
            if (override) {
                const badge = document.createElement('span');
                badge.className = 'card-change-badge';
                badge.textContent = override;
                const nameEl = row.querySelector('.card-name');
                if (nameEl) {
                    nameEl.after(badge);
                }

                // For copyCard: update the name to show what's being copied
                if (result.copyCards) {
                    const match = result.copyCards.find(cc => cc.cardId === card.id);
                    if (match) {
                        const target = getCard(match.targetId);
                        if (target) {
                            const nameEl = row.querySelector('.card-name');
                            if (nameEl) nameEl.textContent = nameEl.textContent.replace(/ → .*$/, '') + ' → ' + target.name.en;
                        }
                    }
                }

                // For copyNameSuit: update name to show target
                if (result.copyNameSuits) {
                    const match = result.copyNameSuits.find(ns => ns.cardId === card.id);
                    if (match) {
                        const target = getCard(match.targetId);
                        if (target) {
                            const nameEl = row.querySelector('.card-name');
                            if (nameEl) nameEl.textContent = nameEl.textContent.replace(/ → .*$/, '') + ' → ' + target.name.en;
                        }
                    }
                }
            }

            // For clearsBest: show which card was cleared
            if (result.clearsBestResults && result.clearsBestResults[card.id]) {
                const target = getCard(result.clearsBestResults[card.id]);
                if (target) {
                    const nameEl = row.querySelector('.card-name');
                    if (nameEl) nameEl.textContent = nameEl.textContent.replace(/ → clears: .*$/, '') + ' → clears: ' + target.name.en;
                }
            }

            // Show blanked/zeroed badge if this card is blanked
            if (result.blanked && result.blanked.includes(card.id)) {
                const blankBadge = document.createElement('span');
                blankBadge.className = 'card-blanked-badge';
                blankBadge.textContent = 'BLANKED';
                const nameEl = row.querySelector('.card-name');
                if (nameEl) nameEl.after(blankBadge);
            } else if (result.zeroedPoints && result.zeroedPoints.includes(card.id)) {
                const zeroBadge = document.createElement('span');
                zeroBadge.className = 'card-blanked-badge zeroed';
                zeroBadge.textContent = '0 BASE';
                const nameEl = row.querySelector('.card-name');
                if (nameEl) nameEl.after(zeroBadge);
            }
        }

        // Accumulate suit score (only if card is in hand)
        const player = state.players[state.currentPlayer];
        if (player && player.hand.includes(card.id)) {
            const effectiveSuit = result.suitOverrides && result.suitOverrides[card.id] || card.suit;
            suitScores[effectiveSuit] = (suitScores[effectiveSuit] || 0) + pts;
        }
    });

    // Update suit-level score displays
    SUIT_ORDER.forEach(suit => {
        const el = document.getElementById('suitScore-' + suit);
        if (el) el.textContent = suitScores[suit] || 0;
    });

    // Update summary
    document.getElementById('totalPoints').textContent = result.total;

    // Show suit/card change info if applicable
    const changeInfo = document.getElementById('changeSuitInfo');
    if (changeInfo) {
        const changes = [];

        if (result.changeSuit) {
            const target = getCard(result.changeSuit.targetId);
            const name = target ? target.name.en : result.changeSuit.targetId;
            changes.push(`♻ ${name}: ${result.changeSuit.from} → ${result.changeSuit.to}`);
        }

        if (result.copySuits) {
            result.copySuits.forEach(cs => {
                const copier = getCard(cs.cardId);
                const name = copier ? copier.name.en : cs.cardId;
                changes.push(`♻ ${name}: ${cs.from} → ${cs.to}`);
            });
        }

        if (result.copyCards) {
            result.copyCards.forEach(cc => {
                const copier = getCard(cc.cardId);
                const target = getCard(cc.targetId);
                const cName = copier ? copier.name.en : cc.cardId;
                const tName = target ? target.name.en : cc.targetId;
                changes.push(`↻ ${cName} → ${tName} (${cc.to}, ${cc.points}pts)`);
            });
        }

        if (result.copyNameSuits) {
            result.copyNameSuits.forEach(ns => {
                const copier = getCard(ns.cardId);
                const target = getCard(ns.targetId);
                const cName = copier ? copier.name.en : ns.cardId;
                const tName = target ? target.name.en : ns.targetId;
                changes.push(`♻ ${cName} → ${tName} (${ns.to})`);
            });
        }

        if (changes.length > 0) {
            changeInfo.innerHTML = changes.map(c => `<div>${c}</div>`).join('');
            changeInfo.style.display = 'block';
        } else {
            changeInfo.style.display = 'none';
        }
    }

    // Build suit breakdown in summary
    const breakdownContainer = document.getElementById('suitBreakdown');
    breakdownContainer.innerHTML = '';
    SUIT_ORDER.forEach(suit => {
        const score = suitScores[suit] || 0;
        const hasCards = state.players[state.currentPlayer].hand.some(cid => {
            const c = getCard(cid);
            const effectiveSuit = result.suitOverrides && result.suitOverrides[cid] || (c && c.suit);
            return effectiveSuit === suit;
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
    // Sync toggle UIs with state
    Object.keys(state.expansions).forEach(key => {
        const row = document.getElementById(expansionRowId(key));
        if (row) row.querySelector('.toggle').classList.toggle('on', state.expansions[key]);
    });
    rebuildPlayerList();
    renderLeaderboard();
    document.getElementById('settingsOverlay').classList.add('open');
    document.getElementById('settingsPanel').classList.add('open');
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.remove('open');
    document.getElementById('settingsPanel').classList.remove('open');
}

// ===== Expansion Toggle =====
function expansionRowId(key) {
    return 'exp' + key.charAt(0).toUpperCase() + key.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function toggleExpansion(key) {
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
}

// ===== Persist Settings =====
function saveSettings() {
    try {
        localStorage.setItem('fantasySettings', JSON.stringify({
            expansions: state.expansions,
        }));
    } catch (e) { /* ignore */ }
}

// ===== New Game =====
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