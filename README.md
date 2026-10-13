# AI Project

## Run the frontend and backend

Requirements: Node.js, npm, and a MongoDB server.

1. Create the backend environment file:

   ```sh
   cp server/.env.example server/.env
   cp react/my-react-app/.env.example react/my-react-app/.env
   ```

   Set `GOOGLE_CLIENT_ID` to your Google OAuth web client ID and replace
   `JWT_SECRET` with a long, private value. Use the same Google client ID in
   both environment files. In Google Cloud Console, authorize the frontend
   origin printed by Vite as a JavaScript origin (normally
   `http://localhost:5173`; Vite selects another port if that one is occupied).
   Email/password sign-up requires a password of at least 8 characters with
   uppercase, lowercase, and a number.

2. Install dependencies and start both apps from the project root:

   ```sh
   npm install
   npm --prefix server install
   npm --prefix react/my-react-app install
   npm run dev
   ```

   The frontend is available at <http://localhost:5173> and the API at
   <http://localhost:4000>. MongoDB must be running at the URI in
   `server/.env`.

The apps can also be started separately with `npm run dev:backend` and
`npm run dev:frontend`. Build the frontend with `npm run build`.

The API provides `POST /api/auth/signup`, `POST /api/auth/login`, and
`POST /api/auth/google`.
