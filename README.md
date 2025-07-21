# Global Transparency Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  
[![Coverage Status](https://img.shields.io/codecov/c/github/chalebgwa/global-transparency-dashboard)](https://codecov.io/gh/chalebgwa/global-transparency-dashboard)

A web-based, open‑source platform that aggregates and visualizes key public‑sector metrics—budgets, corruption perception, health and education spending—across countries. The interactive UI is built with **React**, enabling journalists, NGOs, researchers, and citizens to explore trends, compare nations, and gain data‑driven insights into government transparency.

---
For planning and data model details see [docs/mvp-requirements.md](docs/mvp-requirements.md).


## 🚀 Features

- **React UI**: Modern interface built entirely with React.
- **Multi‑Country Coverage**: Select from 5 inaugural countries (Botswana, South Africa, Kenya, Nigeria, USA).
- **Key Metrics Cards**: Quick‑glance overview of annual budget, CPI score, health & education spend.
- **Interactive Charts**: Time‑series visualizations (5–10 years) with hover tooltips.
- **Insight Banner**: Auto‑generated commentary (“Budget up 8% YoY”).
- **Date‑Range Filter**: Zoom into specific periods with a slider.
- **REST API**: Consume raw country‑year data in JSON; Swagger‑documented.
- **CI/CD**: Automated builds, tests, and deployments via GitHub Actions → Google Cloud.

---

## 📅 Project Timeline

| Phase                    | Dates             | Goals & Deliverables                                           |
|--------------------------|-------------------|----------------------------------------------------------------|
| **1. Discovery & Planning** | Weeks 1–4 (Jul 21–Aug 17 ’25) | • Finalize MVP scope & data sources<br>• Validate APIs & sample data<br>• Architecture diagram & sprint plan |
| **2. MVP Development**     | Weeks 5–16 (Aug 18–Oct 30 ’25) | • Data ingestion scripts (Node.js)<br>• Firestore schema & automated jobs<br>• REST API (Swagger)<br>• Frontend MVP (React)<br>• Unit tests & accessibility review |
| **3. Beta Launch**         | Weeks 17–20 (Oct 31–Nov 27 ’25) | • Private beta release to NGOs, researchers<br>• Collect feedback & bug reports<br>• v0.1 public release |
| **4. Iteration & Polish**  | Weeks 21–24 (Nov 28–Dec 25 ’25) | • UX/UI refinements<br>• Expanded documentation & demos<br>• Launch blog post & social outreach |

---

## 🏗️ Technical Architecture
For a simplified diagram see [docs/architecture.md](docs/architecture.md).


```text
┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
|  Scheduler   | ──▶  |  Cloud Function  | ──▶ |   Firestore   |
| (GitHub Job) |      |  / Cloud Run     |      |  (Data Store) |
└──────────────┘      └─────────────────┘      └──────────────┘
       │                     │                      │
       ▼                     ▼                      ▼

   Data Fetch            Node.js API            React Web
(API + Scrapers)       (Express + Swagger)      (Frontend)

````

* **Data Ingestion**

  * Automated daily jobs fetch and normalize from:

    * OpenSpending/national portals
    * Transparency International CPI API
    * World Bank & UNESCO APIs
    * PDF budgets via parser scripts

* **Backend & API**

  * Node.js microservices expose `/api/v1/countries/{code}/{metric}`
  * Swagger UI available at `/docs`

* **Frontend**

  * Interactive UI built in  React (JavaScript)
  * Responsive, accessible components and charts

* **CI/CD & Hosting**

  * GitHub Actions:

    * Lint, test, build on each PR
    * Deploy backend to Google Cloud Run
    * Deploy frontend build to Cloud Storage + CDN

---

## ⚙️ Getting Started

### Prerequisites

* [Node.js ≥16.x](https://nodejs.org/) and `npm` or `yarn`
* Google Cloud project with Firestore enabled
* Service account JSON with permissions for Firestore & Cloud Run

### Clone & Configure

```bash
git clone https://github.com/chalebgwa/global-transparency-dashboard.git
cd global-transparency-dashboard

# Project layout
#
# ```text
# global-transparency-dashboard/
# ├── backend/   # Node.js/Express API
# └── frontend/  # React or Flutter Web client
# ```

cp .env.example .env
# Update .env with your project IDs, API keys, etc.
```

### Install & Run Locally

#### Backend

```bash
cd backend
npm install
npm run dev          # start local Express server
```

#### Frontend


**React**

```bash
cd frontend
npm install
npm start
```

---

## 📖 API Documentation

After starting the backend, visit:

```
http://localhost:8080/docs
```

to explore Swagger‑UI and test endpoints.

---

## 🤝 Contributing

1. ⭐️ **Fork** the repo
2. 🔀 **Create** a feature branch (`git checkout -b feature/xyz`)
3. 🔧 **Work** and **commit** (`git commit -m "Add xyz"`)
4. 📤 **Push** and **open a PR**
5. ✅ CI will run tests—once green, we’ll review and merge

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style, commit messages, and branch naming.

---

## 📜 License

This project is MIT‑licensed. See [LICENSE](LICENSE) for details.

---

## 🙋‍♂️ Contact

Maintained by **Pako Chalebgwa**

* Twitter: [@soundninja0401](https://twitter.com/soundNinja0401)
* Email: [chalebgwa.bc@gmail.com](mailto:chalebgwa.bc@gmail.com)
* GitHub: [chalebgwa](https://github.com/chalebgwa)

Happy transparency! 🌍✨
