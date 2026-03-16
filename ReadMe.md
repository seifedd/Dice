# 🎲 Pig Game — FullStack Demo

> A two-player dice strategy game rebuilt as a **FullStack web application** to showcase real-world software engineering skills.

🌐 Live Demo → [Deploying to Netlify...](eager-ride-dab.netlify.app)

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Vanilla HTML5 · CSS3 · JavaScript   |
| Backend    | Node.js · Express.js · Serverless HTTP |
| Database   | SQLite (Ephemeral for Serverless)   |
| Security   | Helmet · CORS · Input Validation    |

---

## How to Play

Roll the dice each turn to accumulate points. **First player to reach 100 points wins.**

- **Roll** — Roll the dice. Non-1 results add to your current score.
- **Hold** — Bank your current score. Turn passes to opponent.
- **Roll a 1** — Lose your current score. Turn passes immediately.

After winning, enter your name to appear on the **live leaderboard** 🏆

---

## Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/seifedd/Dice.git
cd Dice

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open in browser
open http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | `/api/leaderboard` | Fetch top 10 high scores |
| POST   | `/api/leaderboard` | Submit a new score       |

**POST payload:**
```json
{
  "name":  "Alice",
  "score": 100,
  "rolls": 14
}
```

---

## Security Measures

- **Helmet** — Sets secure HTTP headers (CSP, X-Frame-Options, etc.)
- **CORS** — Restricts cross-origin requests
- **Parameterized SQL queries** — Prevents SQL injection attacks
- **Input validation & sanitization** — Server rejects invalid/oversized payloads
- **XSS-safe rendering** — Leaderboard names rendered via `textContent` (never `innerHTML`)
- **Payload size limit** — Express body parser capped at 10 KB

---

## Project Structure

```
Dice/
├── public/          # Static frontend
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── dice-*.png
├── netlify/
│   └── functions/
│       └── api.js   # Serverless wrapper for Express
├── server.js        # Express app
├── netlify.toml     # Netlify configuration
├── package.json
└── README.md
```

---

## Skills Demonstrated

- Serverless API design (Netlify Functions + Express via `serverless-http`)
- Database integration (SQLite, parameterized queries)
- Security best practices (Helmet, CORS, input sanitization)
- Vanilla JS DOM manipulation and `async/await` fetch calls
- Responsive, accessible frontend UI

---

*Built by [Seif](https://github.com/seifedd)*
