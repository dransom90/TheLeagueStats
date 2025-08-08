
# 🏈 ESPN Fantasy Football Optimal Lineup Analyzer

A TypeScript + React project for analyzing ESPN Fantasy Football teams, calculating the **optimal lineup** for any week, and comparing it to the **actual points scored**.

Built with:
- ⚡ **Vite + React**
- 🎨 **shadcn/ui** for UI components
- 📡 ESPN Fantasy API (unofficial)
- 📊 TypeScript for type safety

---

## 📌 Features

- **Optimal Lineup Calculation**
  Finds the highest-scoring possible lineup for a given week, including a FLEX position.

- **Actual vs. Optimal Comparison**
  Displays the points you scored versus what you *could have* scored.

- **Tabbed Stats View**
  Quickly switch between different stat features without leaving the page.

- **ESPN Fantasy API Integration**
  Fetches real-time league, team, and player data directly from ESPN's fantasy football API.

---

## 📂 Project Structure

\`\`\`
src/
  components/       # UI components
  hooks/            # Custom React hooks
  utils/            # Helper functions (API calls, lineup logic, etc.)
  types/            # TypeScript interfaces
  App.tsx           # Main application
  main.tsx          # App entry point
\`\`\`

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

\`\`\`bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
\`\`\`

### 2️⃣ Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3️⃣ Set Up Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
VITE_ESPN_LEAGUE_ID=your_league_id
VITE_ESPN_SEASON_ID=2025
\`\`\`

---

## 🖥 Running the App

### Development

\`\`\`bash
npm run dev
\`\`\`

Open your browser at [http://localhost:5173](http://localhost:5173).

### Production Build

\`\`\`bash
npm run build
\`\`\`

Serve the \`dist/\` folder using any static server.

---

## 📜 Example Usage

Once the app is running:

1. Select your **team** from the dropdown.
2. Choose the **week** you want to analyze.
3. View:
   - **Optimal Lineup**: Best scoring possible roster.
   - **Actual Points**: Points scored by your actual lineup.
   - Difference between the two.

---

## 🔧 Key Utility Functions

- **\`getOptimalLineup(players: Player[], week: number)\`**
  Returns the best possible starting lineup for a given week.

- **\`getWeekTotal(players: Player[], week: number)\`**
  Calculates total points for a given set of players.

- **\`fetchLeagueData()\`**
  Retrieves all schedule, roster, and scoring data from ESPN.

---

## 📊 Data Flow Diagram

```mermaid
flowchart TD
    A[ESPN Fantasy API] -->|fetchLeagueData()| B[League Data]
    B --> C[Schedule & Matchups]
    B --> D[Team Rosters]
    D --> E[Player Stats]
    C --> F[getOptimalLineup()]
    E --> F
    F --> G[Optimal Lineup Points]
    E --> H[Actual Lineup Points]
    G --> I[UI Display - Optimal vs Actual]
    H --> I
```

---

## 🏗 Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Language**: TypeScript
- **API**: ESPN Fantasy Football API

---

## 📌 TODO / Future Features

- ✅ Multiple team comparison
- 📊 Advanced stat breakdowns (by position, by opponent)
- 📱 Mobile-friendly optimizations
- 📈 Historical season analysis

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
