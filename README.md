# QuickFix Garage 🔧🚗

QuickFix Garage is a real-time garage finder application. It helps users quickly locate nearby garages, view their services, and request assistance — especially during emergencies. The platform connects customers who need immediate vehicle assistance with reliable, professional mechanics nearby.

## Live Demo 🚀
[Live Demo Link (add after deployment)](#)

## Features 🛠️
- **Real-Time Mapping**: Interactive map to discover garages near your current location.
- **Secure Authentication**: Robust user authentication (Customers & Garage Owners) using OTP verification.
- **Role-based Dashboards**: Dedicated interfaces tailored for standard users and garage managers.
- **SOS Functionality**: Quick emergency requests directly connecting to available mechanics.

## Tech Stack 💻
- **Frontend Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: PostgreSQL (works well with [Neon](https://neon.tech/))
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Auth.js)
- **Email/OTP Service**: Gmail via Nodemailer
- **Mapping**: [Leaflet](https://leafletjs.com/) via `react-leaflet`
- **Runtime**: Node.js

## Getting Started Locally 🏁

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd quickfix-garage
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in your own values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — generate with `npx auth secret`
   - `GMAIL_EMAIL` / `GMAIL_APP_PASSWORD` — used to send OTP emails

4. **Push the database schema:**
   ```bash
   npx drizzle-kit push
   ```

5. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deployment 🌐
This is a standard Next.js app, so it deploys cleanly to [Vercel](https://vercel.com/) (recommended, same team as Next.js) — just import the GitHub repo and add the environment variables from `.env.example` in the project settings. A managed Postgres database (e.g. [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)) works well since this app doesn't need a persistent filesystem.

## License 📄
Released under the [MIT License](./LICENSE).

---
Built by **Er. Pankaj Kumar**.
