# Will'sView API (NestJS)

NestJS backend for auth, checkout, article engagement, and member activity.

## Local development

```bash
npm install
npm run start:dev
```

API runs at `http://localhost:4000`.

## Railway deployment

1. Create a Railway project from the `backend/` directory.
2. Add a **Volume** mounted at `/data` (for SQLite persistence).
3. Set environment variables:

| Variable | Example |
|----------|---------|
| `JWT_SECRET` | Same value as frontend |
| `FRONTEND_URL` | `https://wills-view.vercel.app` |
| `DATA_DIR` | `/data` |

4. Start command: `npm run start:prod`
5. Build command: `npm run build`

Health check: `GET /health`

## Frontend connection

In the Next.js app `.env.local`:

```bash
API_URL=https://your-service.up.railway.app
JWT_SECRET=your-shared-secret
```

When `API_URL` is set, the frontend proxies all `/api/*` requests to Railway while keeping cookies on the same domain.
