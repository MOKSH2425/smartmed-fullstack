# SmartMed Deployment Guide

This repo is set up for:

- Frontend: Vercel
- Backend: Render

## Local Development

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Frontend on Vercel

Create a Vercel project connected to this GitHub repo and set:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

- `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

The SPA rewrite is already configured in [frontend/vercel.json](c:\Users\Moksh\Desktop\SmartMed-FullStack\frontend\vercel.json).

## Backend on Render

Create a Render Web Service connected to this GitHub repo and set:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:

- `NODE_ENV=production`
- `TOKEN_SECRET=<your-long-random-secret>`
- `FRONTEND_URLS=https://your-vercel-domain.vercel.app`

You can also use the included [render.yaml](c:\Users\Moksh\Desktop\SmartMed-FullStack\render.yaml).

## Verification

Backend verification:

```powershell
cd backend
npm run verify
```

Frontend quality checks:

```powershell
cd frontend
npm run lint
npm run build
```

## Notes

- The backend currently uses JSON file storage in `backend/data`.
- This is fine for demos and single-instance hosting, but for long-term production you should move to a database such as Postgres or MongoDB.
