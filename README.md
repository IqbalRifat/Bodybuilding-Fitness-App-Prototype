# Bodybuilding Fitness App — Prototype

A cross-platform fitness app prototype for logging workouts and tracking progress, built with React Native and Expo. Runs on iOS, Android, and web from a single codebase.

## Status

Prototype. Built to validate the core user flows — onboarding, workout logging, and progress tracking — before committing to a full build.

## Tech stack

- **React Native + Expo** — cross-platform mobile and web
- **TypeScript** — type safety across the app
- **Supabase** — authentication and Postgres database
- **Zustand** — client state management

## Running it

```bash
cd expo
bun install
cp .env.example .env    # add your Supabase credentials
bun start
```

## Project layout

expo/
├── app/          # screens and routing
├── components/   # shared UI components
├── store/        # state management
├── lib/          # Supabase client and helpers
└── types/        # TypeScript definitions

##Team
Built by Iqbal Rifat and Washieu Anan.
My role: product definition and scope — user flows, feature prioritization, and MVP requirements.
Portions of the codebase were scaffolded using Rork, an AI app builder.
