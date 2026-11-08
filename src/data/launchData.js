// ─────────────────────────────────────────────────────────────
// Launch checklists — REAL, copied from the Obsidian launch plans:
//   RYVO HQ vault › 02 Products › <App> › Launch Plan.md
// The vault stays the source of truth: when you tick something off
// there, update `done` here too (or ask Claude to re-sync).
//
// `shared` links items that are really the same job across apps, so
// the dashboard can show "do once, unblocks several launches".
// No target dates are set in the plans; you pick them in the dashboard.
// ─────────────────────────────────────────────────────────────

const VAULT = 'Ryvo-HQ-Obsidian-Vault'
const obsidianUri = (path) => `obsidian://open?vault=${encodeURIComponent(VAULT)}&file=${encodeURIComponent(path)}`

export const sharedJobs = {
  solicitor: 'Solicitor review of Terms & Privacy',
  hosting: 'Hosting + HTTPS + production database',
  backups: 'Backups with a test restore',
  email: 'Email provider on your own domain',
  appleDev: 'Apple Developer account ($99/yr, ≈ £78)',
  stripeLive: 'Stripe live mode: keys, prices, webhook',
  git: 'Commit everything to git with a backup',
  domain: 'Domain + website hosting',
}

export const launches = [
  {
    appId: 'intofy',
    source: '02 Products/Intofy/Launch Plan.md',
    updated: '2026-11-02',
    gate: 'No public launch with critical security issues, broken account recovery, missing reporting/blocking, unclear privacy or nobody on support and moderation.',
    groups: [
      {
        title: 'Built in code',
        items: [
          { text: 'Sign-up, sign-in and recovery (automated tests, not tried live)', done: true },
          { text: 'Core journeys tested at desktop and phone sizes (fake server)', done: true },
          { text: 'Reporting, blocking and moderation queue', done: true },
          { text: 'Guidelines, Terms, Privacy and parents\' guide written', done: true },
          { text: 'Minimum age 13 in the app and Terms', done: true },
          { text: 'Onboarding and empty states', done: true },
        ],
      },
      {
        title: 'Before inviting users',
        blocking: true,
        items: [
          { text: 'Hosting and HTTPS with production settings', done: false, shared: 'hosting' },
          { text: 'Daily database + uploads backups, one test restore', done: false, shared: 'backups' },
          { text: 'Email from your own domain', done: false, shared: 'email' },
          { text: 'Rotate any secret that has been shared', done: false },
          { text: 'ffmpeg on the server', done: false },
          { text: 'Live push keys and a real contact address', done: false },
          { text: 'Server error monitoring', done: false },
          { text: 'Legal review: fill Terms/Privacy placeholders (incl. meetups)', done: false, shared: 'solicitor' },
          { text: 'Two moderator accounts with two-step sign-in', done: false },
          { text: 'Confirm product name, domain and branding', done: false, shared: 'domain' },
          { text: 'Privacy, security and data-retention review', done: false },
        ],
      },
      {
        title: 'Controlled beta',
        items: [
          { text: 'Invite a small group from a few hobby communities', done: false },
          { text: 'Track activation, repeat use, reports and support issues', done: false },
          { text: 'Fix critical issues before widening access', done: false },
        ],
      },
    ],
  },
  {
    appId: 'sparesy',
    source: '02 Products/Sparesy/Launch Plan.md',
    updated: '2026-11-02',
    gate: 'Nothing is moderated until the Anthropic key is added and the moderation check passes.',
    groups: [
      {
        title: 'Done',
        items: [
          { text: 'Product promise: last-minute spare places, UK, 18+', done: true },
          { text: 'Full journey works: post, discover, join, chat, show up', done: true },
          { text: 'Reporting, blocking, safety guidance, moderation queue', done: true },
          { text: 'Exact addresses hidden until someone has a place', done: true },
          { text: 'Terms, privacy, cookies, community guidelines (drafts)', done: true },
          { text: 'Stripe payments and Plus working in test mode', done: true },
        ],
      },
      {
        title: 'Before launch',
        blocking: true,
        items: [
          { text: 'Add the Anthropic API key, run npm run moderation:check', done: false },
          { text: 'Solicitor checks terms, privacy and cookie notices', done: false, shared: 'solicitor' },
          { text: 'Hosting with HTTPS, production DB, backups, cron scheduler', done: false, shared: 'hosting' },
          { text: 'Email provider (Resend or SMTP)', done: false, shared: 'email' },
          { text: 'Stripe live mode: activate, live keys, live webhook', done: false, shared: 'stripeLive' },
          { text: 'Real Plus test purchase; check cancel + dispute webhooks', done: false },
          { text: 'Confirm Google sign-in works for real', done: false },
          { text: 'Put the code in git with a backup', done: false, shared: 'git' },
        ],
      },
      {
        title: 'App stores',
        blocking: true,
        items: [
          { text: 'Android: eas init, Firebase for push, EAS build', done: false },
          { text: 'iPhone: Apple Developer account', done: false, shared: 'appleDev' },
        ],
      },
    ],
  },
  {
    appId: 'selvo',
    target: '2026-11-30', // set by Pidge on 2026-11-06
    source: '02 Products/Selvo/Launch Plan.md',
    updated: '2026-11-05',
    gate: "Don't release while totals are unreliable, data can be exposed, invoices can be corrupted, or users can't get their data or support.",
    groups: [
      {
        title: 'Before beta',
        items: [
          { text: 'Audience and scope: UK sole traders and freelancers', done: true },
          { text: 'Transactions: create, edit, delete tested', done: true },
          { text: 'Invoices: create, export, status (browser only)', done: true },
          { text: 'Totals, dates, currency and rounding (unit tests)', done: true },
          { text: 'Data export and account deletion built', done: true },
          { text: 'Empty states, invalid inputs, time zones on real devices', done: false },
          { text: 'Privacy, security and backup review', done: false },
          { text: 'Accurate limitations and support guidance', done: false },
          { text: 'Confirm payment and subscription behaviour', done: false },
        ],
      },
      {
        title: 'Blockers to launch',
        blocking: true,
        items: [
          { text: 'Phone testing: Android EAS preview build', done: false },
          { text: 'iPhone testing: Apple Developer account', done: false, shared: 'appleDev' },
          { text: 'Store subscriptions + RevenueCat', done: false },
          { text: 'Supabase project (UK/EU) + Google login client', done: false },
          { text: 'Web payments: Stripe sandbox, then live £5.99 / £57.50', done: false, shared: 'stripeLive' },
          { text: 'Website hosting and a domain', done: false, shared: 'domain' },
          { text: 'Fill company details in src/legal/company.ts', done: false },
          { text: 'Solicitor checks Terms and Privacy', done: false, shared: 'solicitor' },
          { text: 'Accountant checks tax estimates, CIS, VAT, SA103S', done: false },
          { text: 'Decide whether RYVO is VAT registered', done: false },
          { text: 'Trademark check on the name Selvo', done: false },
          { text: 'Commit the work in git', done: false, shared: 'git' },
        ],
      },
    ],
  },
].map((l) => ({ ...l, obsidian: obsidianUri(l.source) }))

export function launchStats(launch) {
  const all = launch.groups.flatMap((g) => g.items)
  const blockers = launch.groups.filter((g) => g.blocking).flatMap((g) => g.items).filter((i) => !i.done)
  const done = all.filter((i) => i.done).length
  return { total: all.length, done, blockers: blockers.length, pct: Math.round((done / all.length) * 100) }
}
