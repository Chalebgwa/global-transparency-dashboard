# 🇧🇼 National Delivery Dashboard (NDD) for NDP 12

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  
[![Coverage Status](https://img.shields.io/codecov/c/github/chalebgwa/global-transparency-dashboard)](https://codecov.io/gh/chalebgwa/global-transparency-dashboard)

**Proponent:** **Pako Chalebgwa — Independent GovTech Consultant**  
**Email:** [chalebgwa.bc@gmail.com](mailto:chalebgwa.bc@gmail.com)  
**Focus:** Data systems, digital transformation, and performance analytics for government modernization.

A unified, real-time performance and accountability platform designed to digitize Botswana's **NDP 12 monitoring and evaluation system**. Built with modern technology (React, Node.js, Supabase), the NDD gives the National Planning Commission (NPC) and ministries actionable insights into every project, budget, and KPI — reducing bottlenecks and enhancing public trust.

> "An Executive Delivery Dashboard for real-time monitoring, transparency, and accountability." — NDP 12 Executive Summary

---

## 🎯 Executive Summary

The **National Delivery Dashboard (NDD)** is a unified, real-time performance and accountability platform designed to digitize Botswana's **NDP 12 monitoring and evaluation system**.

It supports Government's commitment to:
- Real-time monitoring of national development priorities
- Transparent accountability to citizens
- Evidence-based decision making
- Performance tracking across all ministries and sectors

---

## 🚀 Key Features

- **KPI Tracker**: Monitor GDP growth, jobs created, renewable MW, and other NDP 12 targets
- **Project Performance Cards**: Track milestones, budget vs actual spending, and evidence
- **Geospatial View**: Interactive map of NDP projects by region across Botswana
- **Fiscal Module**: Real-time budget tracking and spend analytics
- **Open Botswana Portal**: Public-facing transparency dashboard for citizens and media
- **Automated Reporting**: Generate quarterly M&E reports instantly
- **React Frontend**: Modern, responsive interface with real-time data visualization
- **Supabase Backend**: Scalable, secure data storage and real-time capabilities
- **REST API**: Swagger-documented API for data access and integration
- **CI/CD**: Automated builds, tests, and deployments via GitHub Actions

---

## 📋 NDP 12 Alignment

| NDP 12 Pillar | Dashboard Impact |
|---------------|------------------|
| **Governance & Transparency** | Real-time accountability portal |
| **Digitalisation Sector** | Locally built data system |
| **Youth Employment & Skills** | Creates training pipeline for devs & analysts |
| **Fiscal Discipline** | Live budget analytics & audit trail |

---

## 📅 Implementation Roadmap

| Phase | Duration | Outcome |
|-------|----------|---------|
| **I – Design & Pilot (Prototype)** | 3 months | Live demo for NPC + 2 ministries |
| **II – Deployment (Scale-Up)** | 9 months | Full rollout to 10+ ministries + SOEs |
| **III – Open Data Launch** | 3 months | Citizen transparency portal |
| **IV – Capacity Building** | ongoing | Train 50 officers & local devs |

---

## 🏗️ Technical Architecture

```text
┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
|  Data Entry  | ───▶ |   Node.js API    | ───▶ |   Supabase   |
|  (Ministries)|      |   (Express)      |      | (PostgreSQL) |
└──────────────┘      └─────────────────┘      └──────────────┘
                             │                        │
                             ▼                        ▼
                      ┌──────────────┐         ┌──────────────┐
                      | React Web UI |         | Mobile App   |
                      | (Dashboard)  |         | (Flutter)    |
                      └──────────────┘         └──────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web Dashboard** | React + Tailwind + Next.js | Executive & sector views |
| **Mobile App** | Flutter + Riverpod | Field data capture, photo, GPS |
| **Backend** | Node.js + Express | Unified API & analytics |
| **Database** | Supabase (PostgreSQL) | Data storage & real-time sync |
| **AI & Predictive** | TensorFlow | Delay & budget overrun alerts |
| **Security & Compliance** | OAuth 2.0 + Row Level Security | Data protection & audit logs |

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js ≥16.x](https://nodejs.org/) and `npm` or `yarn`
- Supabase account and project
- Service account credentials for external integrations

### Clone & Configure

```bash
git clone https://github.com/chalebgwa/global-transparency-dashboard.git
cd global-transparency-dashboard

# Copy environment template
cp .env.example .env
# Update .env with your Supabase URL, API keys, etc.
```

### Install & Run Locally

#### Backend

```bash
cd backend
npm install
npm run dev          # start local Express server
```

#### Frontend

```bash
cd frontend
npm install
npm start           # start React development server
```

---

## 📖 API Documentation

After starting the backend, visit:

```
http://localhost:8080/docs
```

to explore Swagger UI and test endpoints.

---

## 🧪 Testing

The project includes comprehensive test coverage for both backend and frontend components.

### Backend Tests

```bash
cd backend
npm test              # run all tests
npm test -- --coverage  # run with coverage report
```

**Test Coverage:**
- **Overall: 92.6%** code coverage
- 81 tests covering all API endpoints
- Edge cases, error handling, and data validation
- Tests for corruption tracking, contracts, NDP12 projects, KPIs, and more

**Test Suites:**
- Countries API tests
- NDP12 (projects, KPIs, dashboard) tests
- Corruption cases tests
- Government contracts tests
- World leader meetings tests
- Health check tests
- Edge cases and error handling tests
- API documentation tests

### Frontend Tests

```bash
cd frontend
npm test              # run all tests
```

**Test Coverage:**
- Utility function tests
- Project structure validation
- 5 tests ensuring code quality

---

## 🎯 Value Proposition

| Stakeholder | Benefit |
|-------------|---------|
| **NPC / Cabinet** | Evidence-based decisions within hours, not quarters |
| **Line Ministries** | Streamlined reporting & budget tracking |
| **Development Partners** | Live impact metrics for donor alignment |
| **Citizens & Media** | Transparent access to project progress |

---

## 💰 Sustainability & Business Model

- **Implementation Contract**: Fixed-term delivery with local hosting
- **SaaS Licensing**: Annual maintenance & support per ministry
- **Capacity Transfer**: Train-to-own model ensuring local ownership
- **Data Analytics Services**: Optional insight packages for donors

---

## 📊 Expected Outcomes by 2030

- 100% of NDP 12 projects digitally tracked
- 30% fewer implementation delays
- Full transparency portal accessible to citizens
- 50+ local digital jobs created
- Enhanced public trust in government delivery

---

## 🤝 Contributing

1. ⭐️ **Browse issues** on our [Project Board](https://github.com/users/Chalebgwa/projects/1)
2. 🏗️ **Pick an issue** from the "Ready" column and assign yourself
3. 🔀 **Create** a feature branch (`git checkout -b feature/xyz`)
4. 🔧 **Work** and **commit** (`git commit -m "Add xyz"`)
5. 📤 **Push** and **open a PR** that references the issue (`Closes #123`)
6. ✅ CI will run tests—once green, we'll review and merge

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style, commit messages, and branch naming.

---

## 📜 License

This project is MIT-licensed. See [LICENSE](LICENSE) for details.

---

## 🙋‍♂️ Contact

**Pako Chalebgwa** — Independent GovTech Consultant

* Twitter: [@soundninja0401](https://twitter.com/soundNinja0401)
* Email: [chalebgwa.bc@gmail.com](mailto:chalebgwa.bc@gmail.com)
* GitHub: [chalebgwa](https://github.com/chalebgwa)

---

**Building Botswana's most transparent government together.** 🇧🇼✨
