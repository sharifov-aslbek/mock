# MilliyMock frontend — project map

Vue 3.5 SPA (Vite 7, vue-router 4, Pinia, Tailwind 4, vue-i18n, naive-ui).
Backend is a separate .NET solution in `../backend`. Deployed via `Dockerfile`
(`serve -s dist -l 3000`) + `docker-compose.yml` — not Vercel.

## The wall: marketing vs platform

MilliyMock has two faces, and registration is the door between them.

- **Shop window** — anyone can see it. Landing page and marketing pages.
- **Workshop** — only registered users. Tests, results, essay checking.

The split is expressed as four **layout groups** in `src/router/index.js`, each
with a layout component in `src/layouts/`. (Next.js route groups have no
vue-router equivalent; nested layout routes are the idiomatic translation.)

| Group | Layout | Auth | Contains |
|---|---|---|---|
| marketing | `MarketingLayout.vue` | none — **no auth store, no session request** | `/`, `/natijalar`, `/platforma`, `/ai-tekshiruv` |
| public (legacy) | `PublicLayout.vue` | none (pages may be auth-*aware*) | `/narxlar`, subject pages, demos |
| platform | `PlatformLayout.vue` | **guarded** | `/test`, `/result-exam`, `/profile`, `/explanation` |
| auth | `BareLayout.vue` | none | `/login`, `/register`, `/verify-phone` |

`App.vue` is now only global providers (`NMessageProvider`,
`NetworkStatusAlert`) + `<RouterView>`. The old `layoutlessRoutes` /
`supportlessRoutes` path arrays are gone; layouts read `meta.chrome` and
`meta.support` instead.

### Why two public groups

The subject pages stay public and indexed, but `SubjectPage.vue` /
`OnaTiliPage.vue` / `PricingPage.vue` are auth-*aware* (free vs premium state,
`AuthRequiredModal`, `PricingPaymentModal`) and keep the chrome they have today.
Only newly designed marketing pages get the new marketing shell. Moving them
into `MarketingLayout` would silently redesign them.

## Routes

### marketing — `MarketingLayout`
| Path | Component | Notes |
|---|---|---|
| `/` | `views/HomaPage.vue` | landing; replaced by the designed page in the next step |
| `/natijalar` | `views/marketing/NatijalarPage.vue` | **placeholder.** Public success stories — *not* `/result-exam` |
| `/platforma` | `views/marketing/PlatformaPage.vue` | placeholder |
| `/ai-tekshiruv` | `views/marketing/AiTekshiruvPage.vue` | placeholder |

### public (legacy chrome) — `PublicLayout`
| Path | Component | Notes |
|---|---|---|
| `/narxlar` | `views/PricingPage.vue` | was `/pricing` |
| `/pricing` | → `/narxlar` | client redirect; real 301 in `public/serve.json` |
| `/math` | `views/SubjectPage.vue` | `subjectKey: 'math'` |
| `/tarix` | `views/SubjectPage.vue` | `subjectKey: 'history'` |
| `/fizika` | `views/SubjectPage.vue` | `subjectKey: 'physics'` |
| `/biologiya` | `views/BiologySubjectPage.vue` | |
| `/biologiya/test` | `views/BiologyDemoPage.vue` | `chrome: false`, `support: false`, noindex |
| `/ona-tili` | `views/OnaTiliPage.vue` | |
| `/ona-tili-demo` | → `/ona-tili` | |
| `/ona-tili-demo-natija` | `views/OnaTiliDemoResultPage.vue` | **DEV only**; prod → `/ona-tili` |
| `/mashq` | `views/MashqPage.vue` | **DEV only**; prod → `/` |

### platform — `PlatformLayout` (guarded)
| Path | Component | Notes |
|---|---|---|
| `/test` | `views/TestPage.vue` | `chrome: false`, `support: false` |
| `/result-exam` | `views/ResultExamPage.vue` | |
| `/result-exam/essay/:id` | `views/EssayResultPage.vue` | client-persisted essay analysis |
| `/profile` | `views/ProfilePage.vue` | |
| `/explanation` | `views/ExplanationPage.vue` | `chrome: false`, `support: false` |

All carry `meta.requiresAuth: true` and `robots: noindex, nofollow`.

### auth — `BareLayout`
`/login`, `/register`, `/verify-phone` — all noindex.

## The guard

Enforced in **three** places; a router-only check is not a boundary.

1. `router.beforeEach` — global, on `meta.requiresAuth`.
2. `beforeEnter` on the platform group's parent route.
3. `PlatformLayout.vue` — re-checks on mount and watches the auth state, so a
   token cleared mid-session ejects the user.

All three redirect to `{ name: 'register', query: { redirect: to.fullPath } }`.
Registration — not login — is the existing door; that is unchanged.

Auth state is `Boolean(localStorage['milliymock_token'])`
(`stores/auth.js`) — a synchronous read, no session request on load.
`utils/authToken.js` exposes a network-free peek at the same key so the
marketing shell can swap its CTA without importing the auth store.

## Redirects

| From | To | Where |
|---|---|---|
| `/pricing` | `/narxlar` | `public/serve.json` (301, crawlers) + router (client) + `public/_redirects` |
| `/ona-tili-demo` | `/ona-tili` | router |
| `/mashq` (prod) | `/` | router |
| `/ona-tili-demo-natija` (prod) | `/ona-tili` | router |

## SEO

`utils/seo.js` (`applySeo`, wired to `router.afterEach`) rewrites title,
description, robots, canonical and OG/Twitter tags from each route's `meta.seo`.
Static defaults live in `index.html`. `public/sitemap.xml` lists the public URLs.

Known limitation: meta is client-rendered, so non-JS crawlers see only the
static `index.html` tags.

## Known pre-existing issues

- `components/Navbar.vue` binds `:href="item.href"` on `<router-link>` elements
  where `item.href` is always `undefined`. The falsthrough attribute overwrites
  the generated `href`, so platform nav links render as `<a>` with no `href`:
  clicks still work, but middle-click / open-in-new-tab / crawling do not.
  Predates the marketing split; not fixed here to keep this change scoped.
