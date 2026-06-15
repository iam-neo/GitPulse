# GitPulse — GitHub Activity Tracker & Visualizer

GitPulse is a modern, developer-native, dark-themed dashboard that tracks and visualizes any public GitHub user's profile statistics, repository details, language breakdown, and public event history. It is built using **React**, **Vite**, and **Recharts**, querying the public GitHub REST API with no authentication required.

---

## Features

### 1. Unified Search Header
- Type any public GitHub username and hit `Enter` or click **SEARCH**.
- Persistent navigation bar featuring the signature `<gh·track />` logo.

### 2. Rich User Profile Card
- Displays user avatar (with primary cyan accent border), full name, username, bio, and location (📍).
- Key stat metrics presented in custom pills:
  - **Public Repositories**
  - **Followers**
  - **Following**
  - **Total Stars** (aggregated across all repositories)

### 3. Interactive Activity Heatmap
- Visualizes public contribution events from the **last 6 months** (26 weeks × 7 days).
- Custom logic aligns starting dates to Sunday and walks forward day-by-day.
- Grid cells are dynamically colored based on event intensity:
  - `0 events` → Sunken Base (`#161B22`)
  - `1–2 events` → Dark Green (`#0E4429`)
  - `3–5 events` → Mid Green (`#006D32`)
  - `6–9 events` → Bright Green (`#26A641`)
  - `10+ events` → Vivid Green (`#39D353`)
- Interactive hover transitions (scaling effect) and native HTML tooltips showing raw date and event count.
- Complete color legend matches the GitHub style.

### 4. Data-Dense Charting
- **Stars by Repository**: Recharts Bar Chart showcasing the top 8 repositories sorted by star count, featuring angled X-axis labels and a custom dark-themed tooltip.
- **Language Breakdown**: Recharts Pie Chart showing the distribution of programming languages across the top 10 updated repositories, featuring direct percentage labels on segments and a responsive color legend.

### 5. Repository & Activity Feed
- **Top Repositories**: Lists the top 5 repositories sorted by star count. Features:
  - Custom hover micro-animations (card translate/lift).
  - Language pills.
  - Star & fork counts.
  - Click-through navigation to open the repository in a new tab.
- **Recent Activity**: Stream of the last 8 public events (commits, pull requests, issues, forks, stars, and creations) with parsed descriptive copy and relative timestamps (e.g., `Xm ago`, `Xh ago`, `Xd ago`).

---

## Design System

The application strictly implements a custom color palette tailored for developers:

| Token | Value | Usage |
| :--- | :--- | :--- |
| **bg-base** | `#0D1117` | App background |
| **bg-surface** | `#161B22` | Cards, Header background |
| **bg-sunken** | `#0D1117` | Nested elements, stat pills |
| **border** | `#21262D` | Cards, element borders |
| **border-hover**| `#30363D` | Hover states |
| **accent** | `#00D4FF` | Primary cyan accent |
| **text-primary**| `#F0F6FC` | Headings, primary content |
| **text-secondary**|`#8B949E` | Labels, descriptions |
| **text-muted** | `#6E7681` | Timestamps, minor info |
| **green-dark** | `#0E4429` | Heatmap low / badge background |
| **green-mid** | `#006D32` | Heatmap low-mid |
| **green-bright**| `#26A641` | Heatmap mid-high |
| **green-vivid** | `#39D353` | Heatmap max / badge text |

---

## Technical Stack & Architecture

- **React 19** (Functional Components, `useState`, `useEffect`, `useCallback`)
- **Vite** (Next-generation frontend toolchain)
- **Recharts 3** (SVG Charts)
- **Inline Styling**: Zero external CSS stylesheets, CSS modules, or Utility classes. Custom CSS styling rules (such as Webkit scrollbars, keyframe animations, and input focus rings) are injected at runtime via an inline `<style>` element.

---

## Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed.

### Steps

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

4. **Build the production bundle:**
   ```bash
   npm run build
   ```
   *The built site will be generated in the `dist` directory.*

---

## API Limits & Usage

This app queries public API endpoints:
- `https://api.github.com/users/{username}`
- `https://api.github.com/users/{username}/repos`
- `https://api.github.com/users/{username}/events/public`

> [!NOTE]
> GitHub rate-limits unauthenticated API requests to **60 requests per hour** per IP address. If the application stops returning data or shows a "GitHub API error", you may have hit the public rate limit.
