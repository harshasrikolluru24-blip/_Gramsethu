# 🌾 GramSetu — Smart Rural Problem-to-Solution Network
### Smart India Hackathon (SIH) / College Course Project

**GramSetu** (గ్రామసేతు) is an AI-powered rural civic problem reporting and resolution platform designed for Gram Panchayats and rural citizens. It empowers villagers to report civic infrastructure issues (broken streetlights, water pipeline bursts, overflowing drainage, and road hazards) using regional voice input in **Telugu, Hindi, and English** with photo attachments and GPS geotagging.

---

## 🚀 Live Demo & Deployed Sites

- **Live Deployment on Render:** [https://gramsetu-hj3c.onrender.com](https://gramsetu-hj3c.onrender.com)
- **GitHub Pages Ready:** This repository is structured to run directly on **GitHub Pages** with zero backend configuration needed.

---

## 📁 Repository Structure

```
gramsetu/
├── index.html                   # Main HTML5 application entrypoint (GitHub Pages ready at root)
├── .nojekyll                    # Disables Jekyll processing on GitHub Pages
├── css/
│   └── styles.css               # Custom styles, animations, radar pulses & glassmorphism
├── js/
│   ├── app.js                   # Client-side AI NLP, Leaflet GIS, and LocalStorage data layer
│   └── initial-data.js          # Pre-loaded village complaints, hotspots, and departments
├── images/
│   ├── streetlight.jpg          # Sample broken streetlight photo (JPG)
│   ├── water_leak.jpg           # Sample pipeline burst photo (JPG)
│   ├── drainage.jpg             # Sample clogged drainage photo (JPG)
│   ├── pothole.jpg              # Sample road damage photo (JPG)
│   ├── garbage.jpg              # Sample illegal waste dump photo (JPG)
│   ├── handpump.jpg             # Sample community handpump fault (JPG)
│   └── village_banner.jpg       # Gram Panchayat village header photo (JPG)
├── render-build/                # Exact compiled build from the live Render deployment
│   ├── index.html
│   └── assets/
│       ├── index-K2vAmWzx.js
│       ├── index-DDVLTjMB.css
│       └── images/
│           └── streetlight_sample.jpg
└── README.md                    # Project documentation & GitHub deployment guide
```

---

## 🌟 Key Features

1. **🎙️ Multilingual Spoken Grievance & Voice-to-Text:**
   - Villagers can speak their complaints naturally in **Telugu (తెలుగు)**, **Hindi (हिंदी)**, or **English**.
   - Built-in speech recognition with automatic fallback simulator.

2. **🤖 Real-time AI Categorization & Urgency Scoring:**
   - Automatically detects the category: *Water Supply*, *Electricity*, *Sanitation*, *Roads*, or *Health & Education*.
   - Generates an **AI Urgency Score (0 - 100)** based on safety keywords (e.g., live wires, school zones, contaminated water).
   - Translates regional Telugu speech into standardized English action summaries for district officers.

3. **🗺️ Interactive Leaflet GIS Problem Map & Hotspot Radar:**
   - Renders interactive map pins across village wards.
   - Highlights high-density problem clusters (e.g., Ward 3 Tank Bund Water Crisis) with pulsing radar rings.
   - 1-click **Generate Panchayat Emergency Action Order** for fast resolution.

4. **📊 Panchayat Authority Dashboard:**
   - Real-time KPI statistics: Total Grievances, Resolution Rate %, Active Hotspots, In-Progress count.
   - Chart.js interactive category breakdown donut chart.
   - Status updates (*Open* ➔ *In-Progress* ➔ *Resolved*), officer assignment, and simulated citizen SMS dispatch.

5. **⚡ 1-Click SIH Live Demo Presets:**
   - Instant testing chips for jury evaluation: Broken Streetlight, Pipeline Burst, Overflowing Drain, and Hanging Live Wire.

6. **💾 Offline & GitHub Pages First (Hybrid Architecture):**
   - Automatically stores complaints in browser `localStorage`.
   - All sample images (JPG/JPEG) are bundled locally in `images/` so they never fail to load.

---

## 🛠️ Step-by-Step Guide: Deploying to GitHub & GitHub Pages

### Method 1: Deploying via GitHub Web Browser (No Git installation needed)

1. Go to [GitHub.com](https://github.com) and log in.
2. Click the **`+`** icon in the top right corner and select **`New repository`**.
3. Name your repository (e.g., `gramsetu` or `gramsetu-platform`).
4. Keep it **Public** and do not add a README (we already have one). Click **Create repository**.
5. On the empty repository page, click **`uploading an existing file`**.
6. Drag and drop all the files and folders from this folder:
   - `index.html`
   - `.nojekyll`
   - `css/`
   - `js/`
   - `images/`
   - `README.md`
7. Type a commit message (e.g., `Initial GramSetu project files`) and click **Commit changes**.

#### 🌐 Enabling GitHub Pages (To get your live website link):
1. In your GitHub repository, click on **Settings** (gear icon at the top).
2. On the left sidebar, click on **Pages**.
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main` (or `master`)
   - **Folder**: Select `/ (root)`
4. Click **Save**.
5. Wait 1-2 minutes. Refresh the page, and GitHub will provide your live URL:
   > `https://<your-username>.github.io/<your-repo-name>/`

---

### Method 2: Deploying via Git Terminal / Command Line

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit files
git commit -m "feat: initial commit of GramSetu project files"

# 4. Set main branch
git branch -M main

# 5. Connect your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/gramsetu.git

# 6. Push to GitHub
git push -u origin main
```

After pushing, follow the **Enabling GitHub Pages** steps above in repository settings.

---

## 💻 How to Test Locally on Your Computer

You can test the website locally in any of the following ways:

### Option A: Double-Click
Simply double-click `index.html` in your file explorer to open it directly in Chrome, Edge, or Firefox.

### Option B: Python Simple Server
Open PowerShell / Command Prompt inside this folder and run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

### Option C: VS Code Live Server
Right-click `index.html` inside VS Code and choose **"Open with Live Server"**.

---

## 👥 Credits & Hackathon Presentation
- **Project:** GramSetu (గ్రామసేతు) — Smart Rural Problem-to-Solution Network
- **Event:** Smart India Hackathon (SIH)
- **Target Panchayat:** Annavaram Gram Panchayat
- **Tech Stack:** HTML5, Tailwind CSS, JavaScript (ES6+), Leaflet GIS, Chart.js, Lucide Icons, LocalStorage
