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
//     // If no scoring array, card only scores its base points.
//     // per: 'each'  – count matching cards, multiply by points
//     // per: 'flat'  – if condition is met, award points once
//     // per: 'threshold' – if count >= min, award points
//     // of.other: true – exclude the card itself from the count
//     // of.all: true  – every card in hand must match (boolean check)
//     // of.oddPoints: true – computed: card.points % 2 !== 0
//     // of.suit: '...' – match by suit
//     // of.id: '...'   – match a specific card by id
//     // effects.type: 'clears' – cards of this suit have their negative scoring ignored
// }

const CARDS = [
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
        scoring: [
            { points: 3, per: 'each', of: { oddPoints: true, other: true } },
            { points: 50, per: 'flat', of: { oddPoints: true, all: true } },
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
];