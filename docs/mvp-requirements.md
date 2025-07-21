# MVP Requirements

This document outlines the minimal scope for the Global Transparency Dashboard before coding begins.

## Countries Covered
- Botswana
- South Africa
- Kenya
- Nigeria
- United States

## Key Metrics Per Country
- **Government Budget Transparency**
  - Total annual budget
  - Breakdown by sector (health, education, defense, etc.)
- **Corruption Perception**
  - Annual CPI score from Transparency International
- **Social Indicators**
  - Health expenditure per capita
  - Education expenditure per capita

## Data-Source Inventory
| Metric Category | Data Source | Access Method | Update Frequency |
| --- | --- | --- | --- |
| Government Budget | OpenSpending / national treasury portals | REST API / JSON download | Monthly / Quarterly |
| Budget Breakdown by Sector | National budget PDFs or APIs | Web-scrape + ETL | Annual |
| Corruption Perception Index | Transparency International API | REST API (JSON) | Annual |
| Health Expenditure per Capita | World Bank HNP API | REST API | Annual |
| Education Expenditure per Capita | UNESCO UIS API | REST API | Annual |

## Firestore Data Model
```
countries/{code}/budgets/{year}
countries/{code}/budgetBreakdowns/{year}
countries/{code}/cpi/{year}
countries/{code}/health/{year}
countries/{code}/education/{year}
```
Each document should include fields for `value`, `currency`, `source`, and `timestamp`.

## UI Overview
- **Landing Page** with a country selector and summary cards for each metric.
- **Detail Page** with time-series charts and an insight banner (e.g., "Budget ↑ 8% YoY").
- **Filters**: date range slider and metric toggles.

## Next Steps Before Coding
1. Validate sample API requests for each source and note auth keys or limits.
2. Finalize the data model and document required fields.
3. Create an architecture diagram (see `architecture.md`).
4. Sketch UI wireframes.
5. Prepare CI/CD configuration using GitHub Actions.

