# 🔮 Fantasy Realms Calculator

An interactive scoring calculator for the card game [Fantasy Realms](https://boardgamegeek.com/boardgame/223040/fantasy-realms) and its expansions.

🌐 **[fantasy.boardbuddy.games](https://fantasy.boardbuddy.games)** *(coming soon)*

## About Fantasy Realms

Fantasy Realms is a fast-paced card game where players build a 7-card hand from a shared deck, combining kingdoms, artifacts, leaders, and creatures to create the most powerful realm. Scoring relies on complex card synergies — each card scores based on the other cards in your hand, with bonuses, penalties, and special conditions.

## Features

- **Real-time Scoring** — Add cards to your hand and see your score update instantly
- **Supported Supertypes** — Kingdoms, Leaders, Artifacts, Creatures, and more
- **Multi-player** — Track scores for up to 6 players
- **Bilingual** — Supports English and Dutch (Nederlands)
- **Mobile Friendly** — Works on phones and tablets
- **Installable PWA** — Add it to your home screen for an app-like experience
- **Works Offline** — Service worker caching lets you use it without an internet connection

## Supported Sets

| Set | Type | Status |
|---|---|---|
| Fantasy Realms (base) | base | ✅ Planned |
| Cursed Lands | expansion | ✅ Planned |
| Mystic Realms | expansion | ✅ Planned |

## How to Use

1. Open the app in your browser
2. Select a set
3. Add players
4. Click cards to add them to a player's hand
5. Score updates automatically as you build your hand

## Development

This is a static web app with no build step required. To run it locally:

```bash
# Clone the repo
git clone https://github.com/ZiNNED/fantasy-realms-calculator.git
cd fantasy-realms-calculator

# Serve with any static file server
python3 -m http.server 8000
# or
npx serve .
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Project Structure

```
├── index.html          — Main entry point
├── app.js              — Scoring engine and UI logic
├── cards.js            — Card definitions
├── style.css           — Styles
├── sw.js               — Service worker for offline PWA support
├── manifest.json       — PWA manifest
└── assets/             — Icons and images
```

## Card Data

Card definitions are data-driven JSON objects. Each card specifies:

- **Supertypes and subtypes** — scoring context
- **Scoring rules** — the conditions under which it scores points
- **Synergies** — how it interacts with other cards (bonuses, penalties, special effects)
- **Expansion origin** — which set the card belongs to

See `cards.js` for the complete card data.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit changes.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Credits

Inspired by [Fantasy Realms](https://boardgamegeek.com/boardgame/223040/fantasy-realms) by Bruce Glassco — a Board Buddy app.