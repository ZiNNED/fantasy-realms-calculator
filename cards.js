// Fantasy Realms Calculator — Card Definitions
// ===== Card Data Structure =====
// {
//     id: 'warlockLord',
//     name: { en: 'Warlock Lord', nl: 'Tovenaar Heer' },
//     set: 'base',
//     suit: 'wizard',
//     subtypes: ['leader'],
//     points: 25,
//     scoring: [
//         { points: -10, per: 'each', of: { suit: 'leader', other: true } },
//         { points: -10, per: 'each', of: { suit: 'wizard', other: true } }
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
// }

const CARDS = [
    // Example: Warlock Lord (base set, wizard suit, leader subtype)
    // 25 base points, -10 per other leader, -10 per other wizard
    {
        id: 'warlockLord',
        name: { en: 'Warlock Lord', nl: 'Tovenaar Heer' },
        set: 'base',
        suit: 'wizard',
        subtypes: ['leader'],
        points: 25,
        scoring: [
            { points: -10, per: 'each', of: { suit: 'leader', other: true } },
            { points: -10, per: 'each', of: { suit: 'wizard', other: true } },
        ],
    },

    // Placeholder — cards to be added
    {
        id: 'exampleOdd',
        name: { en: 'Example Card (odd)', nl: 'Voorbeeld (oneven)' },
        set: 'base',
        suit: 'kingdom',
        subtypes: [],
        points: 7,
        scoring: [
            { points: 3, per: 'each', of: { oddPoints: true, other: true } },
            { points: 50, per: 'flat', of: { oddPoints: true, all: true } },
        ],
    },
];