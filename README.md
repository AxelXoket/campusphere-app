<p align="center">
  <h1 align="center">campusphere-app</h1>
  <p align="center">
    <strong>Digital campus network for Istanbul University</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/typescript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/license-GPL--3.0-blue?style=flat-square" alt="License">
    <img src="https://img.shields.io/badge/Next.js-16.1-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/Supabase-Auth_%26_DB-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/Mapbox-GL-4264FB?style=flat-square&logo=mapbox&logoColor=white" alt="Mapbox">
  </p>
</p>

---

An interactive campus map and social platform for Istanbul University students. Features real-time event mapping, student discovery, chat, calendar integration, and university verification — all rendered on a Mapbox GL map with cluster markers.

## Features

- **Interactive Campus Map** — Mapbox GL with cluster markers, event pins, and user locations
- **Event System** — Create, browse, and filter campus events with category-based markers
- **Real-Time Chat** — Direct messaging between verified students
- **Calendar Integration** — Event scheduling with date-based filtering
- **Student Profiles** — Faculty-based discovery with verification overlay
- **Search & Filter** — Full-text search across events, users, and locations
- **Announcements** — Campus-wide announcement panel
- **Cinematic Auth** — Glassmorphism login/register with video background and progressive registration

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| Animation | Motion (Framer Motion) |
| Map | Mapbox GL + react-map-gl + Supercluster |
| Backend | Supabase (Auth, Database, SSR) |
| Icons | Lucide React |

## Getting Started

```bash
git clone https://github.com/AxelXoket/campusphere-app.git
cd campusphere-app

npm install

# Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_MAPBOX_TOKEN, NEXT_PUBLIC_SUPABASE_URL,
#          NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
  app/               Next.js App Router pages
    api/             API routes
    map/             Map page
  components/
    auth/            Login, register, verification, progressive onboarding
    hud/             Map HUD: search, chat, calendar, events, filters, panels
    map/             MapView, ClusterMarker, EventMarker, UserMarker
    ui/              Shared UI primitives
  data/              Mock data (faculties, events, messages, users)
  lib/               Supabase client, utilities
  stores/            Client-side state management
supabase/
  migrations/        Database migration files
```

## Environment Variables

| Variable | Scope | Description |
|:---------|:------|:------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Client | Mapbox public access token |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase anonymous key |
| `OPENAI_API_KEY` | Server | OpenAI API key (server-side only) |

## License

This project is licensed under the GNU General Public License v3.0 — see the [LICENSE](LICENSE) file for details.
