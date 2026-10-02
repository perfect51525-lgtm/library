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

## Deploy to Render

The root `render.yaml` deploys the library app as two Render services: a static frontend and a Node.js API. It does not deploy a separate documentation site. The existing app download links remain available.

1. Create a MongoDB Atlas database and database user. In Atlas **Network Access**, allow connections from `0.0.0.0/0` so Render can reach the cluster; Render's outbound IPs can vary. Use a strong password and grant the database user access only to this app's database.
2. In Render, create a **Blueprint** from this GitHub repository and apply the `render.yaml` configuration.
3. In the `library-api` service's environment settings, set `MONGODB_URI` to the Atlas connection string (including the database name, `library_management`) and `CLIENT_URL` to the deployed `library-web` URL, with no trailing slash. Set `JWT_SECRET` to a long, random secret if Render did not generate one.
4. In the `library-web` service's environment settings, set `VITE_API_URL` to the deployed `library-api` URL followed by `/api` (for example, `https://library-api.example.onrender.com/api`). Save the setting to trigger a new frontend build.
5. Open the `library-api` URL plus `/api/health` and confirm it returns `{"status":"ok"}`. Then open the `library-web` URL and choose **Set up administrator**.

Set secrets only in Render's environment settings, not in GitHub or this repository. Atlas IP access set to `0.0.0.0/0` permits network connections from any address, so protect the database with a unique, strong credential and least-privilege database permissions.

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