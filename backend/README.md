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
- `GET /api/v1/countries/:code/budget` – budget information.
- `GET /api/v1/countries/:code/cpi` – corruption perception index.
- `GET /api/v1/countries/:code/health` – health expenditure per capita.
- `GET /api/v1/countries/:code/education` – education expenditure per capita.
