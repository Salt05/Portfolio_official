# Portfolio Official

A single-page portfolio website built with React, Vite, Tailwind CSS v4, and Motion.

The site is designed as a narrative scroll experience with:

- A preloader intro sequence
- Custom smooth scroll stepping powered by Lenis
- Layered atmospheric backgrounds and grain effects
- Animated story and project sections
- Contact CTA with interactive magnetic motion

## Tech Stack

- React 18
- Vite 6
- Tailwind CSS v4
- Motion (Framer Motion package namespace)
- Lenis (smooth scrolling)
- Radix UI + shadcn/ui component files (available in `src/app/components/ui`)
- Lucide icons

## Project Structure

```text
.
|- public/
|  |- CV_GameDeveloperIntern_PhamMinhPhat.pdf
|- src/
|  |- app/
|  |  |- App.tsx
|  |  |- components/
|  |  |  |- hero.tsx
|  |  |  |- intro.tsx
|  |  |  |- story.tsx
|  |  |  |- work.tsx
|  |  |  |- skills.tsx
|  |  |  |- contact.tsx
|  |  |  |- atmosphere.tsx
|  |  |  |- smooth-scroll.tsx
|  |  |  |- preloader.tsx
|  |- styles/
|  |  |- index.css
|  |  |- tailwind.css
|  |  |- theme.css
|  |- main.tsx
|- index.html
|- vite.config.ts
|- package.json
```

## Getting Started

### 1) Install dependencies

Using npm:

```bash
npm install
```

Or using pnpm:

```bash
pnpm install
```

### 2) Run development server

Using npm:

```bash
npm run dev
```

Using pnpm:

```bash
pnpm dev
```

The app starts on the URL printed by Vite (usually `http://localhost:5173`).

## Build for Production

Using npm:

```bash
npm run build
```

Using pnpm:

```bash
pnpm build
```

The production output is generated in the `dist/` folder.

## Main Sections in the App

The page is composed in `src/app/App.tsx` and currently renders sections in this order:

1. Hero
2. Intro
3. Story
4. Work
5. Skills
6. Contact

Global visual systems used across sections:

- `Preloader` for initial loading experience
- `SmoothScroll` for custom scroll behavior
- `SunsetOrbs`, `Atmosphere`, and `GrainOverlay` for ambient visuals
- `Nav` with progress line and anchor navigation

## How to Customize Content

Update the following files to personalize your portfolio quickly:

- Hero headline and intro text: `src/app/components/hero.tsx`
- About paragraph: `src/app/components/intro.tsx`
- Timeline chapters: `src/app/components/story.tsx`
- Project cards and links: `src/app/components/work.tsx`
- Skills data: `src/app/components/skills.tsx`
- Contact links and email CTA: `src/app/components/contact.tsx`
- Preloader text: `src/app/components/preloader.tsx`

## Notes

- `vite.config.ts` includes a `figma-asset-resolver` plugin and the `@` alias to `src`.
- Tailwind and React plugins are required in Vite config for this project setup.
- There are many pre-generated UI components in `src/app/components/ui` (not all are currently used by the page).

## Attribution

This project originated from a Figma Make export. Original design reference:

https://www.figma.com/design/vJ5SgzMbgasF3mRoRkLNXg/Portfolio-Website-Evaluation

Additional attribution details are listed in `ATTRIBUTIONS.md`.

## License

See `LICENSE` for licensing details.
