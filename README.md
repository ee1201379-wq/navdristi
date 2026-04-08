# CivicPulse AI

CivicPulse AI is a hackathon-ready civic grievance platform prototype built as a zero-dependency browser app.

## Included

- Citizen login and registration
- Admin login
- Complaint submission with text and image upload
- Voice-based complaint intake for local languages
- AI-style complaint classification, sentiment analysis, priority scoring, and duplicate detection
- Emotion-driven urgency detection and delay-based auto-escalation
- Predictive issue monitoring, live complaint heatmaps, and auto-assignment with suggested solutions
- Image verification layer to flag potentially fake complaint evidence
- Citizen and admin dashboards
- Complaint detail page with timeline and chat
- Analytics page with status, category, trend, and ward heatmap views
- Dedicated AI features showcase page

## How To Run

1. Open [index.html](./index.html) in a browser.
2. Use the seeded demo accounts on [auth.html](./auth.html), or register a new citizen account.
3. Open the citizen and admin dashboards in separate tabs to see real-time style sync using browser storage and `BroadcastChannel`.

## Demo Credentials

- Citizen: `citizen@civicpulse.demo` / `demo123`
- Admin: `admin@civicpulse.demo` / `demo123`

## Notes

- The project is intentionally self-contained because this environment does not currently have Node, npm, or Python installed.
- Chat and dashboard updates sync across tabs through browser-native storage events and `BroadcastChannel`.
- The data layer is organized so it can be upgraded later to a real backend and Socket.IO server.
