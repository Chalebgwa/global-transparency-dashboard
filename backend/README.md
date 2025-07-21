# Backend

Simple Express server for the Global Transparency Dashboard.

Run locally:
```bash
npm install
npm run dev
```

Run tests:
```bash
npm test
```

### Sample API Endpoints

- `GET /api/v1/health` – basic health check.
- `GET /api/v1/countries` – list available countries.
- `GET /api/v1/countries/:code` – detailed metrics for a country.
