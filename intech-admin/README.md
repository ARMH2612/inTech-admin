# InTech Admin — React + TypeScript dashboard prototype

A French-language React dashboard for InTech. It opens on the admin authentication screen and connects to the documented Laravel admin API. After sign-in it loads permission-aware, live **read views**. It does not include a backend or database.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

In PowerShell:

```powershell
cd "C:\Users\HP\Documents\New project\intech-admin"
npm.cmd install
npm.cmd run dev
```

Open the localhost address Vite prints (usually `http://127.0.0.1:5173`). Keep the terminal open; press Ctrl+C to stop.

The app source, components, API helpers, and Vite configuration use TypeScript. Run `npm.cmd run typecheck` to check types independently; `npm.cmd run build` runs the type check before creating the production bundle.

The source follows a feature-oriented structure like Digipay Admin: `src/components/Router` owns route protection, `src/components/Layout` owns the authenticated shell, and every screen has its own folder in `src/pages` with a screen file and barrel export. Each page defines its own columns, presentation, and empty state; the reusable generic table control is `src/components/CustomTable`. UI used only by requests, such as request details, lives in `src/pages/Requests/components`. Redux Toolkit state lives in `src/state`: `auth` handles session restore/login/logout, `pageData` stores loaded screen data, and `store` configures reducers and typed hooks. The Redux-backed data hook is in `src/hooks`; search and transient interface state stay local to the relevant page. App-wide UI remains in `src/components`, and API/environment and navigation definitions live in `src/config`.

## Connect to the InTech API

The local `.env.local` sets `VITE_API_BASE_URL` to the server URL from the supplied API guide. Edit that environment variable to switch environments, then restart Vite. `.env.example` is the template for another checkout. During local development, Vite proxies `/api` requests to this configured server, so browser CORS does not block local sign-in. In a production deployment, configure the web server to reverse-proxy `/api` or allow the deployed dashboard origin in the API's CORS settings.

1. Start the dashboard; the API URL is read from `.env.local`, not entered in the UI.
2. Sign in with an admin account. The app calls `POST /api/admin/login`, then `GET /api/admin/me`.
3. The navigation is filtered using `admin_role` and `admin_permissions`. Lists load from the documented endpoints; request rows open the request detail endpoint.
4. Use **Déconnexion** to revoke the API token and return to sign-in.

The API token is kept in `sessionStorage` for the current browser tab; the password is never stored. The API server must allow the dashboard origin through CORS. The guide’s documented server uses HTTP and notes that HTTPS is planned. The sign-in screen warns that HTTP does not encrypt credentials or tokens; use it only for a protected test environment until HTTPS is enabled.

Live mode is read-only apart from login/logout and notification read state. Create/update/delete, approvals, blocking, assignment, package payment confirmation, order status changes, and websocket updates are not enabled yet. The API reference describes those operations, but they should be added and tested deliberately before operational use.

## Production build

```powershell
npm.cmd run build
npm.cmd run preview
```

The former presentation-only sample dashboard is no longer the startup experience. The application requires a successful API login before showing operational pages.
