# Stacks Library Management

A MERN library operations app with administrator authentication, a searchable book catalog, member records, circulation workflows, and live dashboard totals.

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

1. Install the root development tool and app dependencies:

   ```sh
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Copy `backend/.env.example` to `backend/.env`. Set `MONGODB_URI` and replace `JWT_SECRET` with a long random secret.
3. Start both servers:

   ```sh
   npm run dev
   ```

4. Open the Vite URL printed in the terminal (usually `http://localhost:5173`). Choose **Set up administrator** to create the first admin account. Later administrators can add member accounts from the Members page.

To add eight starter titles to an empty catalog, run `npm --prefix backend run seed:catalog`. The seed is safe to rerun; existing ISBNs are left unchanged.

To regenerate the editable frontend walkthrough and PDF with a complete file-by-file source appendix, run `npm run documentation:build`. The outputs are saved in `documentation/`.

The API listens on port 5000 by default. Set `VITE_API_URL` in `frontend/.env` to override `http://localhost:5000/api`, and set `CLIENT_URL` in the backend environment to a comma-separated list if the frontend origin differs from the default local Vite origins.

## Deploy to Vercel

The root `vercel.json` deploys the frontend and API together. It does not deploy a separate documentation site. The app's existing PDF and PowerPoint downloads remain available.

1. Create a MongoDB Atlas database and database user. In Atlas **Network Access**, allow `0.0.0.0/0` so Vercel serverless functions can reach the cluster. Use a unique, strong password and grant the database user access only to this app's database.
2. In Vercel, import `perfect51525-lgtm/library` as a project. Keep the **Root Directory** set to the repository root; `vercel.json` supplies the frontend build and output settings.
3. In the Vercel project settings, add `MONGODB_URI` with the Atlas connection string and database name `library_management`, and add `JWT_SECRET` with a long, random secret. Keep both variables private.
4. Deploy the project. Open `/api/health` on the deployed site and confirm it returns `{"status":"ok"}`. Then open the site and choose **Set up administrator**.

Atlas access from `0.0.0.0/0` allows connections from any address. Protect the database with a unique, strong credential and least-privilege database permissions. Never put database credentials or the JWT secret in source code or GitHub.

## API

All endpoints except health and authentication require an administrator bearer token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| POST | `/api/auth/signup` | Create the first administrator only |
| POST | `/api/auth/login` | Administrator sign-in |
| GET, POST | `/api/books` | Search/list and add books |
| PUT, DELETE | `/api/books/:id` | Edit or remove a book |
| GET, POST | `/api/members` | List and add members |
| PUT, DELETE | `/api/members/:id` | Edit or remove a member (no open loans to remove) |
| GET, POST | `/api/issues` | List loans and check out a book |
| PATCH | `/api/issues/:id/return` | Check in a book |
| GET | `/api/dashboard` | Collection and circulation totals |

Book search accepts `search`, `category`, and `availability=available|unavailable` query parameters. Circulation accepts `status=issued|returned`.