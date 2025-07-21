# Architecture Overview

```
+---------------+        +---------------+       +-------------+
| Data Sources  |  -->   |  Node.js API  |  -->  |  Firestore  |
| (APIs/PDFs)   |        | (Cloud Run)   |       |  Database   |
+---------------+        +---------------+       +-------------+
        |                        |                         |
        v                        v                         v
     Scrapers             REST Endpoints             React Web App
```

This high-level diagram shows automated scrapers fetching data from OpenSpending, Transparency International, World Bank, and UNESCO. A Node.js API hosted on Cloud Run stores normalized results in Firestore. The React frontend consumes the API to display charts and insights.

## Sprint Plan
1. **Discovery & Planning** – finalize data sources and schema.
2. **MVP Build** – implement ingestion scripts, API, and basic React UI.
3. **Beta Launch** – deploy to Cloud Run and gather feedback.
4. **Iteration** – refine UI/UX and expand documentation.

