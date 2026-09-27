# Binomi

AI-powered roommate matching for Tunisia. Built with FastAPI, React, and Groq LLM.

## Features

- **No signup/login** - Just enter your name and start
- **Questionnaire** - 7 sections covering living preferences, finances, routines, social life, work/lifestyle, personality, and dealbreakers
- **AI Agent Matching** - Your preferences create an AI "clone" that negotiates with other users' clones using the ACP/1.0 protocol
- **Phased Conversations** - 4 phases: Introduction, Exploration, Negotiation, Conclusion (~13 turns max)
- **Match Results** - Strong Match, Conditional Match, or Incompatible with detailed scores
- **Negotiation Logs** - Full conversation between clones saved and viewable anytime
- **Tunisia Localized** - TND currency, Tunisian cities/neighborhoods, halal/prayer dealbreakers

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion |
| Backend | FastAPI + WebSockets (uvicorn) |
| Database | Local JSON files (users.json, questionnaires.json, matches.json, negotiation_logs.json) |
| LLM | Groq API (llama-3.3-70b-versatile) |

## Project Structure

```
Binomi/
├── backend/
│   └── server.py          # FastAPI backend with WebSocket support
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages (Entry, Questionnaire, Home, SetupMatch, MyClone, MyMatches, NegotiationLog)
│   │   ├── components/    # UI components (shadcn/ui + custom)
│   │   ├── contexts/      # EntryContext (user session via localStorage)
│   │   ├── lib/           # API client
│   │   └── hooks/         # WebSocket hook
│   └── package.json
├── shared/
│   ├── config.py          # Configuration & Tunisia constants
│   ├── storage.py         # JSON file storage with atomic writes & locking
│   ├── database.py        # Data access layer (users, matches, interactions, logs)
│   ├── questionnaire.py   # 7-section questionnaire schema (50+ fields)
│   ├── clone.py           # Clone prompt generator (ACP/1.0)
│   ├── module_registry.py # ACP/1.0 modular context system
│   └── groq_client.py     # Groq LLM client
├── data/                  # JSON data files
│   ├── users.json
│   ├── questionnaires.json
│   ├── matches.json
│   └── negotiation_logs.json
├── uploads/               # User uploaded photos
└── requirements.txt       # Python dependencies
```

## ACP/1.0 — Agent Compatibility Protocol

Custom protocol for AI agent conversations that reduces token usage by 85-97%:

- **CORE module** (~150 tokens) — always loaded: identity, hard constraints, budget rules, non-negotiables, ACP schema
- **LIVING module** (~80 tokens) — auto-loaded: location, lease, room type, occupation
- **Lazy modules** — injected on-demand via `<<MOD:NAME>>` signals:
  - FINANCIAL, ROUTINES, SOCIAL, LIFESTYLE, DEALBREAKERS

### Message Types

| Type | Purpose | Example |
|------|---------|---------|
| `HI` | Introduction | `HI:[loc:Tunis/La Marsa|bd:400-800|rm:Private]` |
| `PFR` | Share preference | `PFR:[slp:night_owl,cln:4(tidy)]` |
| `CNF` | Flag conflict | `CNF:[cln:gap_3pts(I'm 5, you're 2)]` |
| `FLX` | Offer flexibility | `FLX:[bd:can_stretch_to_900|condition:great_fit]` |
| `VRD` | Final verdict | `VRD:[STRONG]|r=aligned|open=none` |

### Conversation Phases

| Phase | Turns | Focus |
|-------|-------|-------|
| Introduction | 3 | Location, budget, top priorities |
| Exploration | 4 | Sleep, cleanliness, guests, WFH, routines |
| Negotiation | 4 | Address conflicts, propose compromises |
| Conclusion | 2 | Reach verdict: Strong/Conditional/Incompatible |

## Setup

### 1. Backend

```bash
cd AI-Roommate-Finder
pip install -r requirements.txt
```

Create `.env`:
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
BACKEND_HOST=localhost
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:8080
DATA_DIR=./data
DEBUG=false
```

Run:
```bash
python backend/server.py
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:8080`

## Data Storage

All data stored in local JSON files under `data/`:

- **users.json** — User profiles with questionnaires and photos
- **questionnaires.json** — (Reserved for future separation)
- **matches.json** — Match results with analysis scores
- **negotiation_logs.json** — Full ACP conversations between clones

Atomic write-then-rename with file locking prevents corruption.

## API Endpoints

### Entry
- `POST /entry` — Create user entry (name + optional questionnaire)
- `GET /entry/{user_id}` — Get user profile
- `PUT /entry/{user_id}` — Update profile

### Questionnaire
- `GET /questionnaire/schema` — Get full questionnaire schema

### Matches
- `POST /matches/like/{user_id}` — Like a profile (triggers background negotiation)
- `POST /matches/pass/{user_id}` — Pass on a profile
- `GET /matches/{user_id}` — List matches for user
- `GET /matches/counts/{user_id}` — Get match counts
- `GET /matches/detail/{match_id}` — Get match with negotiation log

### Candidates
- `GET /users/candidates/{user_id}` — Browse compatible profiles

### Clone Chat
- `GET /clone/intro/{user_id}` — Get clone greeting
- `POST /clone/chat/{user_id}` — Chat with your clone

### Negotiation Logs
- `GET /negotiation-log/{match_id}` — View full agent conversation

### Photos
- `POST /entry/{user_id}/photos` — Upload photos (max 2)

### WebSocket
- `WS /ws/{room_id}` — Real-time agent conversation streaming

## Tunisia Localization

- **Currency**: TND (Tunisian Dinar) — د.ت
- **Cities**: Tunis, Sfax, Sousse, Kairouan, Bizerte, Gabes, Ariana, Gafsa, Monastir, Ben Arous, Kasserine, Medenine, Nabeul, Jendouba, Kef, Siliana, Mahdia, Tataouine, Tozeur, Zaghouan
- **Neighborhoods**: Per-city neighborhoods (e.g., Tunis: La Marsa, Carthage, Sidi Bou Said, El Menzah...)
- **Dealbreakers**: Halal kitchen required, Prayer space needed

## License

MIT