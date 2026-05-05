# miles-portfolio

Personal portfolio + contracting site. Vite + React, MDX blog, Docker deploy.

## Stack

- **Framework**: Vite + React 18
- **Routing**: React Router v6
- **Blog**: MDX files in `src/posts/` (frontmatter via remark-mdx-frontmatter)
- **Styling**: CSS Modules + CSS custom properties
- **Deploy**: Docker → nginx, served from home server at volc.uk

---

## Local dev

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Adding a blog post

Create a new `.mdx` file in `src/posts/`:

```mdx
---
title: Your post title
date: 2025-02-01
summary: One-sentence description shown on the listing page.
tags: [fintech, python]
---

## Section heading

Your content here. Supports standard markdown + JSX components.
```

That's it. It'll appear automatically on `/writing`.

---

## Adding / editing projects

Edit `src/lib/projects.js`. Each object maps to a card on the homepage
and a case study page at `/projects/:slug`.

Add detailed case study content in `src/pages/ProjectPage.jsx` — the
placeholder sections are clearly marked with comments.

---

## Deploy (Docker)

```bash
# Build and run
docker compose up -d --build

# View logs
docker compose logs -f portfolio

# Rebuild after changes
docker compose up -d --build --no-deps portfolio
```

Container serves on port **3000** by default. Change to `80:80` in
`docker-compose.yml` once DNS is pointed at the box.

### SSL

Terminate SSL at the host level. Options:
- **Caddy** (easiest): `reverse_proxy localhost:3000` with automatic HTTPS
- **Host nginx** + Certbot: proxy_pass to `localhost:3000`
- **Traefik**: uncomment the label in docker-compose.yml and configure

---

## File map

```
src/
  components/     # Nav, Footer, ProjectCard
  pages/          # Home, Writing, PostPage, ProjectPage
  posts/          # MDX blog posts — add new ones here
  lib/
    projects.js   # Project data — edit this to update cards
  styles/
    global.css    # Design tokens + reset
```
