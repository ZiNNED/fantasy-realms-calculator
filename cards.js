// Fantasy Realms Calculator — Card Definitions
// ===== Card Data Structure =====
// {
//     id: 'warlockLord',
//     name: { en: 'Warlock Lord' },
//     set: 'base',
//     suit: 'wizard',
//     points: 25,
//     bonus: {
//         mode: 'sum' | 'best',     // 'sum' (default) — all rules add; 'best' — only highest rule counts
//         rules: [
//             // Numerical bonus: positive points per matching cards
//             { points: 9, per: 'each', of: { suit: 'beast', other: true } },
//             { per: 'tiered', of: { suit: 'same' }, tiers: [ { min: 3, points: 10 } ] },
//             { per: 'baseBest', of: { suits: ['flood', 'flame'] } },
//             // Clear effects: nullifies penalties on certain cards
//             { type: 'clears', suit: 'beast' },
//             { type: 'clearsBest', of: { suits: ['flood', 'flame'] } },
//             // Target clear: removes a suit from ALL penalty rules (no penalty mentions this suit)
//             { type: 'clearsTarget', suit: 'army' },
//         ]
//     },
//     penalty: [
//         // Numerical penalty: negative points per matching cards
//         { points: -10, per: 'each', of: { suit: 'leader', other: true } },
//         // Blank effects: removes all bonuses, penalties and base points from cards
//         { type: 'blanks', of: { suits: ['army'] } },
//         { type: 'blanks', of: { suits: ['land'], except: ['mountain'] } },
//     ]
//     // per: 'each'  – count matching cards, multiply by points
//     // per: 'flat'  – boolean check, award points once
//     // per: 'flatIfNone' – award points when NO matching cards exist (count === 0)
//     // per: 'tiered' – find highest tier with count >= min, award those points
//     // per: 'threshold' – if count >= min, award points
//     // per: 'baseBest' – add the highest base points (card.points) among matching cards
//     // of.other: true – exclude the card itself from the count
//     // of.all: true  – every card in hand must match (boolean check)
//     // of.oddPoints: true – computed: card.points % 2 !== 0
//     // of.suit: '...' – match by suit name (single)
//     // of.suits: ['...', '...'] – match ANY of these suits (array, OR logic)
//     // of.id: '...'   – match a specific card by id
//     // effects.type: 'clears' – cards of this suit have their negative scoring ignored
//     // effects.type: 'clearsBest' – single card among matching suits with highest negative penalty is cleared
//     // effects.type: 'blanks' – cards of these suits are blanked (no name, no points, no bonuses/penalties/effects)
//     // effects.of.suits: ['...', '...'] – candidate suits for clearsBest or blanks
//     // effects.of.except: ['cardId', '...'] – exclude these specific card IDs from the effect
// }

const CARDS = [
    // ===== Wizards =====
    {
        id: 'warlockLord',
        name: { en: 'Warlock Lord' },
        set: 'base',
        suit: 'wizard',
        points: 25,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { points: -10, per: 'each', of: { suit: 'leader', other: true } },
            { points: -10, per: 'each', of: { suit: 'wizard', other: true } },
        ],
    },
    {
        id: 'necromancer',
        name: { en: 'Necromancer' },
        set: 'base',
        suit: 'wizard',
        points: 3,
        bonus: { mode: 'sum', rules: [] },
        penalty: [],
    },
    {
        id: 'jester',
        name: { en: 'Jester' },
        set: 'promo',
        suit: 'wizard',
        points: 3,
        bonus: {
            mode: 'best',
            rules: [
                { points: 3, per: 'each', of: { oddPoints: true, other: true } },
                { points: 47, per: 'flat', of: { oddPoints: true, all: true } },
            ],
        },
        penalty: [],
    },
    {
        id: 'beastmaster',
        name: { en: 'Beastmaster' },
        set: 'base',
        suit: 'wizard',
        points: 9,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 9, per: 'each', of: { suit: 'beast', other: true } },
                { type: 'clears', suit: 'beast' },
            ],
        },
        penalty: [],
    },
    {
        id: 'enchantress',
        name: { en: 'Enchantress' },
        set: 'base',
        suit: 'wizard',
        points: 5,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 5, per: 'each', of: { suit: 'land', other: true } },
                { points: 5, per: 'each', of: { suit: 'weather', other: true } },
                { points: 5, per: 'each', of: { suit: 'flood', other: true } },
                { points: 5, per: 'each', of: { suit: 'flame', other: true } },
            ],
        },
        penalty: [],
    },
    {
        id: 'collector',
        name: { en: 'Collector' },
        set: 'base',
        suit: 'wizard',
        points: 7,
        bonus: {
            mode: 'sum',
            rules: [
                { per: 'tiered', of: { suit: 'same' }, tiers: [
                    { min: 5, points: 100 },
                    { min: 4, points: 40 },
                    { min: 3, points: 10 },
                ]},
            ],
        },
        penalty: [],
    },

    // ===== Floods =====
    {
        id: 'fountainOfLife',
        name: { en: 'Fountain of Life' },
        set: 'base',
        suit: 'flood',
        points: 1,
        bonus: {
            mode: 'sum',
            rules: [
                { per: 'baseBest', of: { suits: ['flood', 'flame', 'land', 'weather', 'weapon'] } },
            ],
        },
        penalty: [],
    },
    {
        id: 'waterElemental',
        name: { en: 'Water Elemental' },
        set: 'base',
        suit: 'flood',
        points: 4,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 15, per: 'each', of: { suit: 'flood', other: true } },
            ],
        },
        penalty: [],
    },
    {
        id: 'swamp',
        name: { en: 'Swamp' },
        set: 'base',
        suit: 'flood',
        points: 18,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { points: -3, per: 'each', of: { suit: 'army' } },
            { points: -3, per: 'each', of: { suit: 'flame' } },
        ],
    },
    {
        id: 'island',
        name: { en: 'Island' },
        set: 'base',
        suit: 'flood',
        points: 14,
        bonus: {
            mode: 'sum',
            rules: [
                { type: 'clearsBest', of: { suits: ['flood', 'flame'] } },
            ],
        },
        penalty: [],
    },
    {
        id: 'greatFlood',
        name: { en: 'Great Flood' },
        set: 'base',
        suit: 'flood',
        points: 32,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { type: 'blanks', of: { suits: ['army'] } },
            { type: 'blanks', of: { suits: ['land'], except: ['mountain'] } },
            { type: 'blanks', of: { suits: ['flame'], except: ['lightning'] } },
        ],
    },
];