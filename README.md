<div align="center">
  
  # ✨ GitPulse
  
  ### **Next-Generation GitHub Activity Visualizer & Profile Duel Dashboard**
  
  A developer-native, glassmorphic analytics dashboard built in React + Vite + Recharts.
  
  [![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vite.dev)
  [![Recharts](https://img.shields.io/badge/Recharts-3.8-22B5BF?style=for-the-badge)](https://recharts.org)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

GitPulse visualizes any public GitHub user's profile statistics, repository portfolios, language breakdowns, and public events history in a beautiful, dark-themed dashboard. 

It is designed with **glassmorphism**, dynamic custom accent themes, breathing radial backglows, pulsing shimmer skeleton loaders, and a side-by-side split screen comparison mode.

---

## ⚡ Key Highlights & Features

### ⚔️ Profile Comparison Duel Mode
Toggle **VS Compare** mode to query two GitHub users side-by-side. 
* Displays dual statistic profile summaries.
* Awards a **winner's crown** 👑 to the user leading in public repositories, followers, or stars.
* Shows a side-by-side double bar chart matching user color codes.

### 🌈 Runtime Theme Accent Customizer
Switch the color accents of the entire dashboard dynamically in the Settings popover:
* **Accent Themes:** Cyan (Default), GitHub Green, Electric Purple, Hot Pink, and Solarized Amber.
* Smoothly transitions input borders, focus outlines, button active scales, SVG backdrops, and charts.
* Theme selection is persisted across page loads using `localStorage`.

### 📦 Interactive Repository Explorer & Inspector Drawer
* Includes **live text matching**, dynamic **language filter** dropdown, and sort tags (**Stars**, **Forks**, **Size**, and **Last Updated**).
* Clicking any repository opens a glassmorphic Inspector Drawer showing watchers, open issues count, license info, and creation date.
* Features copyable HTTPS and SSH clone command bars with click-to-copy feedback.

### 💡 Pulse Analytics Insights
Calculates profile constraints dynamically:
* **Account Age:** Displays age formatted in years.
* **Average Stars:** Average stars across the repository portfolio.
- **Peak Activity Hours:** Parses events timestamp logs to reveal the user's peak coding day of the week and hour of the day.

### 📊 Git Branch Timeline Event Feed
- Formats recent activities into a connected vertical git branch timeline.
- Dynamic color-coded circles with neon shadows representing event types (Commits, Pull Requests, Issues, Stars, Forks).
- Integrates commit message snippets (`📝 message`) inside PushEvents.

---

## 🎨 Design System & CSS Tokens

The interface leverages glassmorphism and breathing transitions built purely on inline CSS injection:

```css
/* Custom properties mapping dynamically on selected accent theme */
--accent: #00D4FF;         /* Cyan, Green, Purple, Pink, or Amber */
--accent-fade: #00D4FF26;    /* 15% opacity focus shadow */
```

> [!NOTE]
> All styles are injected dynamically at runtime via a custom CSS generator, avoiding bloated external stylesheets and utility class loaders.

---

## 🛠️ Installation & Setup

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
   *Optimized static assets will output to the `dist` directory.*

---

## 🔑 GitHub API Policy & Rate Limits

Public GitHub REST API endpoints limit unauthenticated requests to **60 requests per hour** per IP address. 

> [!IMPORTANT]
> If you hit this limit, click **Settings (⚙️)** in the header and paste a Personal Access Token (PAT). This raises your API capacity to **5,000 requests/hour**. Tokens are processed entirely client-side and saved securely in your browser's local storage.

<details>
<summary><b>💡 How to create a GitHub Personal Access Token (PAT)</b></summary>

1. Go to your GitHub profile and navigate to **Settings** > **Developer Settings** > **Personal Access Tokens** > **Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Add a description (e.g., "GitPulse Dashboard") and select the expiration.
4. *Optional:* Select the `repo` scope if you wish to query your own private repositories.
5. Click **Generate token** and copy the code. Paste it inside the Settings popup on the GitPulse site.
</details>
