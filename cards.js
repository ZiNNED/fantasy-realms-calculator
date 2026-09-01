// Fantasy Realms Calculator — Card Definitions
// ===== Card Data Structure =====
// {
//     id: 'warlockLord',
//     name: { en: 'Warlock Lord', nl: 'Tovenaar Heer' },
//     set: 'base',
//     suit: 'wizard',
//     points: 25,
//     scoring: [
//         { points: -10, per: 'each', of: { suit: 'leader', other: true } },
//         { points: -10, per: 'each', of: { suit: 'wizard', other: true } }
//     ],
//     effects: [
//         { type: 'clears', suit: 'beast' }
//     ]
//     // per: 'each'  – count matching cards, multiply by points
//     // per: 'flat'  – boolean check, award points once
//     // per: 'tiered' – find highest tier with count >= min, award those points
//     // per: 'threshold' – if count >= min, award points
//     // scoringMode: 'best' – only the HIGHEST-scoring rule in scoring[] applies (mutually exclusive OR)
//     // of.other: true – exclude the card itself from the count
//     // of.all: true  – every card in hand must match (boolean check)
//     // of.oddPoints: true – computed: card.points % 2 !== 0
//     // of.suit: 'same' – match cards with the same suit as this card
//     // of.suit: '...' – match by suit name
//     // of.id: '...'   – match a specific card by id
//     // effects.type: 'clears' – cards of this suit have their negative scoring ignored
// }

const CARDS = [
    // ===== Wizards =====
    {
        id: 'warlockLord',
        name: { en: 'Warlock Lord', nl: 'Tovenaar Heer' },
        set: 'base',
        suit: 'wizard',
        points: 25,
        scoring: [
            { points: -10, per: 'each', of: { suit: 'leader', other: true } },
            { points: -10, per: 'each', of: { suit: 'wizard', other: true } },
        ],
        effects: [],
    },
    {
        id: 'necromancer',
        name: { en: 'Necromancer', nl: 'Necromancer' },
        set: 'base',
        suit: 'wizard',
        points: 3,
        scoring: [],
        effects: [],
    },
    {
        id: 'jester',
        name: { en: 'Jester', nl: 'Nar' },
        set: 'promo',
        suit: 'wizard',
        points: 3,
        scoringMode: 'best',
        scoring: [
            { points: 3, per: 'each', of: { oddPoints: true, other: true } },
            { points: 47, per: 'flat', of: { oddPoints: true, all: true } },
        ],
        effects: [],
    },
    {
        id: 'beastmaster',
        name: { en: 'Beastmaster', nl: 'Beestenmeester' },
        set: 'base',
        suit: 'wizard',
        points: 9,
        scoring: [
            { points: 9, per: 'each', of: { suit: 'beast', other: true } },
        ],
        effects: [
            { type: 'clears', suit: 'beast' },
        ],
    },
    {
        id: 'enchantress',
        name: { en: 'Enchantress', nl: 'Enchantress' },
        set: 'base',
        suit: 'wizard',
        points: 5,
        scoring: [
            { points: 5, per: 'each', of: { suit: 'land', other: true } },
            { points: 5, per: 'each', of: { suit: 'weather', other: true } },
            { points: 5, per: 'each', of: { suit: 'flood', other: true } },
            { points: 5, per: 'each', of: { suit: 'flame', other: true } },
        ],
        effects: [],
    },
    {
        id: 'collector',
        name: { en: 'Collector', nl: 'Collector' },
        set: 'base',
        suit: 'wizard',
        points: 7,
        scoring: [
            { per: 'tiered', of: { suit: 'same' }, tiers: [
                { min: 5, points: 100 },
                { min: 4, points: 40 },
                { min: 3, points: 10 },
            ]},
        ],
        effects: [],
    },
];