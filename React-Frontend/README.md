# Bank of CLI — Part 2 (Frontend Dashboard)

A modern, responsive Single Page Application (SPA) that serves as the web dashboard for the Bank of CLI system. This is the "dashboard" front end for the banking engine built in Part 1.

This phase focuses on building a high-quality, **API-ready** web UI. The backend is simulated with mock data, so that when the real API is ready, the UI can plug in with minimal changes.

---

## Status

In Progress — currently in the design and setup phase.

- [x] Team roles assigned
- [x] Figma design in progress
- [x] Project setup (framework, TypeScript, styling)
- [x] Component layer
- [x] Service layer (mock data)
- [x] Data contracts (TypeScript interfaces)
- [x] Login / Registration
- [ ] Dashboard
- [ ] Transaction center (Deposit / Withdraw / Transfer)
- [ ] Loading states & feedback (toasts/modals)
- [ ] Responsive styling

---

## Features (Planned)

- **Secure access** — polished Login and Registration pages, handling both success and error states with simulated responses
- **Dashboard** — view current balance and recent transactions
- **Transaction center** — interactive Deposit, Withdraw, and Transfer forms with client-side validation (no negative amounts, no empty fields)
- **Professional UX**
    - Loading states — spinners / skeleton loaders to simulate waiting for a server
    - Feedback — toast notifications or modals to confirm actions and show errors
- **Responsive design** — works on desktop and mobile

---

## Architecture

The app follows a **service-based architecture** so the UI can connect to a real backend later without rewrites. Data is never hardcoded inside UI components.

| Layer               | Responsibility                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| **Component Layer** | Reusable UI building blocks (buttons, inputs, cards). Never fetch data directly — they ask a service. |
| **Service Layer**   | The "mock engine." Handles all data logic; for now returns hardcoded JSON from local files.           |
| **Contract Layer**  | TypeScript interfaces documenting the exact JSON structure, so the real API can match it later.       |

---

## Tech Stack

- **Framework:** React _(update if Angular)_
- **Language:** TypeScript
- **Styling:** _(Tailwind / Bootstrap / CSS — update with your choice)_
- **Data simulation:** JSON mock files
- **Design:** Figma
- **Version control:** Git & GitHub

---

## Team

| Member           | Responsibility        |
| ---------------- | --------------------- |
| _Dennis Keithly_ | _Transaction History_ |
| _Gian Opbenita_  | _Withdraw_            |
| _Patrik Guinn_   | _Login/Register_      |
| _Sohan Shrestha_ | _Deposit_             |
| _Yashvi Bhagat_  | _Transfer_            |

---

## Design

Figma design: _(add your Figma link here)_

**Color palette:**

- Primary (teal): `#009B77`
- Accent (orange): `#F47920`
- Highlight (coral): `#FF8A80`
- Error (red): `#E8202A`

**Fonts:** _(e.g. Inter)_

---

## Git Workflow

- `main` — stable, released code
- `develop` — integration branch (features merge here first)
- `feature/xxx` — individual feature branches
