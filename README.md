# ✨ GitPulse — Next-Gen GitHub Activity Visualizer & Profile Duel Dashboard

GitPulse is a developer-native, dark-themed dashboard that tracks, visualizes, and compares any public GitHub user's profile statistics, repository portfolios, language breakdowns, and public events history. 

Built using **React**, **Vite**, and **Recharts**, it features a stunning, premium **glassmorphic design system** with customizable color accents, breathing radial glows, shimmering skeleton loaders, and local storage integrations.

---

## 🚀 Key Visual & Interactive Features

### ⚔️ 1. Developer VS Mode (Profile Duels)
- Side-by-side split comparison dashboard.
- Dual-profile statistic summaries (Stars, Followers, Public Repos).
- Comparative verdict highlights identifying the winner in each metric with a crown emoji.
- Recharts double bar graph visualizing comparative statistics side-by-side with accent coloring.

### 🌈 2. Live Theme Customizer & Custom Accents
- Choose between five custom accent colors: **Cyan**, **GitHub Green**, **Electric Purple**, **Hot Pink**, and **Amber**.
- Instantly updates all visual styling, input focus borders, Recharts gradient fills, status badges, and breathing radial glows.
- Theme accent is persisted securely in the user's browser `localStorage`.

### 📦 3. Repository Explorer & Inspector Drawer
- Full-text repository searching, dynamic language filtering, and sorting by Stars, Forks, Repo Size, and last Updated Date.
- Clicking any repository card opens a sliding inspect drawer showing detailed metadata (default branch, open issues, creation date, watchers).
- Copyable **HTTPS** and **SSH** git clone commands with interactive clip-to-copy button feedback.

### 💡 4. Pulse Account Analytics Insights
- **Account Age**: Dynamically formatted in years.
- **Average Stars**: Calculates average stars across all repositories.
- **Peak Activity Times**: Parses public event history timestamps to pinpoint the user's most active day of the week and peak hour of the day.

### ⚡ 5. Connected Git Timeline Event Feed
- Recent public activities are formatted as a vertical branch timeline.
- Custom status dots colored by activity type (Commits, Pull Requests, Issues, Stars, Forks) with dynamic neon shadows.
- Integrates inline commit message snippets (`📝 message`) directly into PushEvents.

### 🔑 6. API Rate Tracker & PAT Configuration
- Dynamic header badge showing live GitHub API usage (e.g., `API: 49/60`).
- A settings gear dropdown allowing developers to input a Personal Access Token (PAT).
- Credentials are saved locally to `localStorage` to boost rate limits up to **5,000 requests/hour**.

### 🧭 7. Pulse History Bookmarks
- Automatically caches up to 6 successfully searched profiles.
- Displays history bookmark chips in empty states (Recent Pulses) for quick switching.
- Keeps a breadcrumb trail of recent bookmarks active at the top of the loaded dashboard.

---

## 🎨 Premium Aesthetics System

The dashboard strictly utilizes inline CSS injection for maximum flexibility and performance:

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| **bg-base** | `#0D1117` | Main dark background |
| **bg-surface** | `rgba(22, 27, 34, 0.75)` | Translucent glass cards |
| **border-base** | `rgba(255, 255, 255, 0.05)` | Card and layout borders |
| **accent-glow** | `radial-gradient` | Breathing avatar backlight |
| **shimmer** | `gradient-shimmer` | Pulsing content skeleton loader |

- **Glassmorphism:** Subtly transparent cards (`backdrop-filter: blur(16px)`) that float over the background.
- **Shimmer Placeholders:** Skeleton screens that pulse during query loading states, offering a smooth layout transition instead of a generic loading spinner.
- **Breathing Glows:** Avatar profiles are backlit by slow-pulsing radial gradients corresponding to the active accent color.

---

## 🛠️ Technological Stack

- **React 19** (Functional hooks, `useCallback`, `useEffect`, `useState`)
- **Vite** (Next-generation build tool)
- **Recharts 3** (SVG graphs with custom gradient overlays)
- **Zero-Dependency Styling:** Pure inline styling with animations and input focus shadows injected dynamically at runtime.

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iam-neo/GitPulse.git
   cd GitPulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```
   *The optimized static assets will be output in the `dist` directory.*

---

## 📝 GitHub API Policy

Unauthenticated requests are rate-limited to **60 requests per hour** per IP address. If rate limits are reached, the app displays a helpful warning card. Enter a GitHub Personal Access Token (PAT) inside the Settings popover to raise limits immediately. All token operations are run entirely client-side.
