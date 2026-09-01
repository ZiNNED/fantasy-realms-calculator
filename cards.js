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
//             // Scoped target clear: removes a suit from penalty rules on cards of a specific suit only
//             { type: 'clearsTarget', suit: 'army', on: { suit: 'flood' } },
//             // Suit change: auto-optimises changing one other card's suit (brute-force)
//             { type: 'changeSuit' },
//         ]
//     },
//     penalty: [
//         // Numerical penalty: negative points per matching cards
//         { points: -10, per: 'each', of: { suit: 'leader', other: true } },
//         // Blank effects: removes all bonuses, penalties and base points from cards
//         { type: 'blanks', of: { suits: ['army'] } },
//         // allExcept mode: blanks everything EXCEPT the listed suits and IDs
//         { type: 'blanks', mode: 'allExcept', of: { suits: ['flame', 'wizard', 'weather', 'weapon', 'artifact'], ids: ['mountain', 'greatFlood', 'island', 'unicorn', 'dragon'] } },
//         { type: 'blanks', of: { suits: ['land'], except: ['mountain'] } },
//     ]
//     // penalty type: 'selfBlank' – card blanks itself unless matching cards are present
//     //   when: 'present' – blanks itself when matching cards ARE present (inverse)
//     // per: 'each'  – count matching cards, multiply by points
//     // per: 'flat'  – boolean check, award points once
//     // per: 'flatAllIds' – award points when ALL specified card IDs (+ optional suits) are present
//     // per: 'flatIfNone' – award points when NO matching cards exist (count === 0)
//     // per: 'tiered' – find highest tier with count >= min, award those points
//     // per: 'threshold' – if count >= min, award points
//     // per: 'manyOf' – count how many distinct suits have at least min cards, award points per qualifying suit
//     // per: 'runs' – find consecutive sequences of unique base point values (+1 steps). tiers: [{min, points}] — score each run independently, sum across runs
//     // per: 'baseBest' – add the highest base points (card.points) among matching cards
//     // per: 'baseSum' – add the sum of all base points (card.points) among matching cards
//     // of.other: true – exclude the card itself from the count
//     // of.all: true  – every card in hand must match (boolean check)
//     // of.oddPoints: true – computed: card.points % 2 !== 0
//     // of.suit: '...' – match by suit name (single)
//     // of.suits: ['...', '...'] – match ANY of these suits (array, OR logic)
//     // of.id: '...'   – match a specific card by id
//     // of.ids: ['...', '...'] – match ANY of these card IDs (array, OR logic)
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
                { points: 10, per: 'manyOf', min: 3 },
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

    // ===== Armies =====
    {
        id: 'elvenArchers',
        name: { en: 'Elven Archers' },
        set: 'base',
        suit: 'army',
        points: 10,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 5, per: 'flatIfNone', of: { suit: 'weather' } },
            ],
        },
        penalty: [],
    },
    {
        id: 'knights',
        name: { en: 'Knights' },
        set: 'base',
        suit: 'army',
        points: 20,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { points: -8, per: 'flatIfNone', of: { suit: 'leader' } },
        ],
    },
    {
        id: 'rangers',
        name: { en: 'Rangers' },
        set: 'base',
        suit: 'army',
        points: 5,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 10, per: 'each', of: { suit: 'land' } },
                { type: 'clearsTarget', suit: 'army' },
            ],
        },
        penalty: [],
    },
    {
        id: 'dwarvishInfantry',
        name: { en: 'Dwarvish Infantry' },
        set: 'base',
        suit: 'army',
        points: 15,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { points: -2, per: 'each', of: { suit: 'army', other: true } },
        ],
    },
    {
        id: 'lightCavalry',
        name: { en: 'Light Cavalry' },
        set: 'base',
        suit: 'army',
        points: 17,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { points: -2, per: 'each', of: { suit: 'land' } },
        ],
    },

    // ===== Lands =====
    {
        id: 'cavern',
        name: { en: 'Cavern' },
        set: 'base',
        suit: 'land',
        points: 6,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 25, per: 'flat', of: { ids: ['dwarvishInfantry', 'dragon'] } },
                { type: 'clears', suit: 'weather' },
            ],
        },
        penalty: [],
    },
    {
        id: 'bellTower',
        name: { en: 'Bell Tower' },
        set: 'base',
        suit: 'land',
        points: 8,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 15, per: 'flat', of: { suit: 'wizard' } },
            ],
        },
        penalty: [],
    },
    {
        id: 'earthElemental',
        name: { en: 'Earth Elemental' },
        set: 'base',
        suit: 'land',
        points: 4,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 15, per: 'each', of: { suit: 'land', other: true } },
            ],
        },
        penalty: [],
    },
    {
        id: 'mountain',
        name: { en: 'Mountain' },
        set: 'base',
        suit: 'land',
        points: 9,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 50, per: 'flatAllIds', of: { ids: ['smoke', 'wildfire'] } },
                { type: 'clears', suit: 'flood' },
            ],
        },
        penalty: [],
    },
    {
        id: 'forest',
        name: { en: 'Forest' },
        set: 'base',
        suit: 'land',
        points: 7,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 12, per: 'each', of: { suit: 'beast' } },
                { points: 12, per: 'flat', of: { id: 'elvenArchers' } },
            ],
        },
        penalty: [],
    },

    // ===== Weathers =====
    {
        id: 'blizzard',
        name: { en: 'Blizzard' },
        set: 'base',
        suit: 'weather',
        points: 30,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { type: 'blanks', of: { suits: ['flood'] } },
            { points: -5, per: 'each', of: { suits: ['army', 'leader', 'beast', 'flame'] } },
        ],
    },
    {
        id: 'rainstorm',
        name: { en: 'Rainstorm' },
        set: 'base',
        suit: 'weather',
        points: 8,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 10, per: 'each', of: { suit: 'flood' } },
            ],
        },
        penalty: [
            { type: 'blanks', of: { suits: ['flame'], except: ['lightning'] } },
        ],
    },
    {
        id: 'whirlwind',
        name: { en: 'Whirlwind' },
        set: 'base',
        suit: 'weather',
        points: 13,
        bonus: {
            mode: 'best',
            rules: [
                { points: 40, per: 'flatAllIds', of: { ids: ['rainstorm', 'blizzard'] } },
                { points: 40, per: 'flatAllIds', of: { ids: ['rainstorm', 'greatFlood'] } },
            ],
        },
        penalty: [],
    },
    {
        id: 'airElemental',
        name: { en: 'Air Elemental' },
        set: 'base',
        suit: 'weather',
        points: 4,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 15, per: 'each', of: { suit: 'weather', other: true } },
            ],
        },
        penalty: [],
    },
    {
        id: 'smoke',
        name: { en: 'Smoke' },
        set: 'base',
        suit: 'weather',
        points: 27,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { type: 'selfBlank', of: { suit: 'flame' } },
        ],
    },
    {
        id: 'forge',
        name: { en: 'Forge' },
        set: 'base',
        suit: 'flame',
        points: 9,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 9, per: 'each', of: { suit: 'weapon' } },
                { points: 9, per: 'each', of: { suit: 'artifact' } },
            ],
        },
        penalty: [],
    },
    {
        id: 'lightning',
        name: { en: 'Lightning' },
        set: 'base',
        suit: 'flame',
        points: 11,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 30, per: 'flat', of: { id: 'rainstorm' } },
            ],
        },
        penalty: [],
    },
    {
        id: 'fireElemental',
        name: { en: 'Fire Elemental' },
        set: 'base',
        suit: 'flame',
        points: 4,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 15, per: 'each', of: { suit: 'flame', other: true } },
            ],
        },
        penalty: [],
    },
    {
        id: 'candle',
        name: { en: 'Candle' },
        set: 'base',
        suit: 'flame',
        points: 2,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 100, per: 'flatAllIds', of: { ids: ['bookOfChanges', 'bellTower'], suits: ['wizard'] } },
            ],
        },
        penalty: [],
    },
    {
        id: 'wildfire',
        name: { en: 'Wildfire' },
        set: 'base',
        suit: 'flame',
        points: 40,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { type: 'blanks', mode: 'allExcept', of: {
                suits: ['flame', 'wizard', 'weather', 'weapon', 'artifact'],
                ids: ['mountain', 'greatFlood', 'island', 'unicorn', 'dragon'],
            } },
        ],
    },
    {
        id: 'elvenLongbow',
        name: { en: 'Elven Longbow' },
        set: 'base',
        suit: 'weapon',
        points: 3,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 30, per: 'flat', of: { ids: ['elvenArchers', 'warlord', 'beastmaster'] } },
            ],
        },
        penalty: [],
    },
    {
        id: 'magicWand',
        name: { en: 'Magic Wand' },
        set: 'base',
        suit: 'weapon',
        points: 1,
        bonus: {
            mode: 'sum',
            rules: [
                { points: 25, per: 'flat', of: { suit: 'wizard' } },
            ],
        },
        penalty: [],
    },
    {
        id: 'warship',
        name: { en: 'Warship' },
        set: 'base',
        suit: 'weapon',
        points: 23,
        bonus: {
            mode: 'sum',
            rules: [
                { type: 'clearsTarget', suit: 'army', on: { suit: 'flood' } },
            ],
        },
        penalty: [
            { type: 'selfBlank', of: { suit: 'flood' } },
        ],
    },
    {
        id: 'swordOfKeth',
        name: { en: 'Sword of Keth' },
        set: 'base',
        suit: 'weapon',
        points: 7,
        bonus: {
            mode: 'best',
            rules: [
                { points: 10, per: 'flat', of: { suit: 'leader' } },
                { points: 40, per: 'flatAllIds', of: { suits: ['leader'], ids: ['shieldOfKeth'] } },
            ],
        },
        penalty: [],
    },
    {
        id: 'warDirigible',
        name: { en: 'War Dirigible' },
        set: 'base',
        suit: 'weapon',
        points: 35,
        bonus: { mode: 'sum', rules: [] },
        penalty: [
            { type: 'selfBlank', of: { suit: 'army' } },
            { type: 'selfBlank', of: { suit: 'weather' }, when: 'present' },
        ],
    },

    // ===== Artifacts =====
    {
        id: 'gemOfOrder',
        name: { en: 'Gem of Order' },
        set: 'base',
        suit: 'artifact',
        points: 5,
        bonus: {
            mode: 'sum',
            rules: [
                { per: 'runs', tiers: [
                    { min: 3, points: 10 },
                    { min: 4, points: 30 },
                    { min: 5, points: 60 },
                    { min: 6, points: 100 },
                    { min: 7, points: 150 },
                ] },
            ],
        },
        penalty: [],
    },
    {
        id: 'shieldOfKeth',
        name: { en: 'Shield of Keth' },
        set: 'base',
        suit: 'artifact',
        points: 4,
        bonus: { mode: 'best', rules: [
            { points: 15, per: 'flat', of: { suit: 'leader' } },
            { points: 40, per: 'flatAllIds', of: { suits: ['leader'], ids: ['swordOfKeth'] } },
        ] },
        penalty: [],
    },
    {
        id: 'bookOfChanges',
        name: { en: 'Book of Changes' },
        set: 'base',
        suit: 'artifact',
        points: 3,
        bonus: { mode: 'sum', rules: [
            { type: 'changeSuit' },
        ] },
        penalty: [],
    },
    {
        id: 'worldTree',
        name: { en: 'World Tree' },
        set: 'base',
        suit: 'artifact',
        points: 2,
        bonus: { mode: 'sum', rules: [
            { points: 50, per: 'flat', condition: 'allDifferentSuits' },
        ] },
        penalty: [],
    },
    {
        id: 'protectionRune',
        name: { en: 'Protection Rune' },
        set: 'base',
        suit: 'artifact',
        points: 1,
        bonus: { mode: 'sum', rules: [
            { type: 'clears', suit: 'all' },
        ] },
        penalty: [],
    },
];