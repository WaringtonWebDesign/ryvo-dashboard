// ─────────────────────────────────────────────────────────────
// RYVO Dashboard — placeholder data.
// Everything the dashboard shows lives in this one file.
// Swap any export for real data (API call, JSON import, etc.)
// and the views will pick it up as long as the shape matches.
// ─────────────────────────────────────────────────────────────

export const user = {
  name: 'Oliver',
  initials: 'OP',
}

// ── Overview ────────────────────────────────────────────────
export const overviewStats = [
  { id: 'users', label: 'Total app users', value: '12,486', change: 8.4, icon: 'Users' },
  { id: 'prints', label: 'Prints this month', value: '47', change: 12.0, icon: 'Printer' },
  { id: 'visits', label: 'Roblox visits', value: '184.2K', change: 23.6, icon: 'Gamepad2', accent: true },
  { id: 'revenue', label: 'Product revenue', value: '£3,912', change: -4.2, icon: 'PoundSterling' },
]

// Weekly activity — "events" across all sections, split in two series
export const weeklyActivity = [
  { day: 'Mon', builds: 14, ops: 9 },
  { day: 'Tue', builds: 22, ops: 12 },
  { day: 'Wed', builds: 18, ops: 16 },
  { day: 'Thu', builds: 27, ops: 11 },
  { day: 'Fri', builds: 31, ops: 19 },
  { day: 'Sat', builds: 12, ops: 22 },
  { day: 'Sun', builds: 9, ops: 14 },
]

export const recentActivity = [
  { id: 1, event: 'Sparesy v1.4.2 released to TestFlight', section: 'Apps', time: '12 min ago', minsAgo: 12, status: 'Completed' },
  { id: 2, event: 'Order #1048 — Desk Cable Tidy ×3', section: 'Products', time: '38 min ago', minsAgo: 38, status: 'Pending' },
  { id: 3, event: 'Print "gpu_bracket_v3.gcode" finished', section: '3D Printing', time: '1 hr ago', minsAgo: 60, status: 'Completed' },
  { id: 5, event: 'Print "headphone_hook.gcode" — layer shift', section: '3D Printing', time: '5 hrs ago', minsAgo: 300, status: 'Failed' },
  { id: 6, event: 'Intofy onboarding A/B test started', section: 'Apps', time: 'Yesterday', minsAgo: 1440, status: 'Pending' },
]

// ── Apps ────────────────────────────────────────────────────
// Name, status, version, icon, tagline, pricing, features, stack and roadmap
// come from the real project files (RYVO apps.js, READMEs, docs). `users`,
// `sparkline` and everything under `metrics` are PLACEHOLDERS until connected.
export const apps = [
  {
    id: 'intofy',
    name: 'Intofy',
    initial: 'I',
    icon: '/apps/intofy.png',
    brand: '#1b74e4',
    color: 'from-blue-400 to-blue-600',
    status: 'In development',
    version: 'v0.1.0 (MVP)',
    users: 7842,
    sparkline: [32, 36, 35, 41, 44, 49, 53, 58],
    nextUp: 'Going-live checklist: legal review, hosting + HTTPS, backups',
    tagline: "Everything you're into.",
    category: 'Social',
    audience: '13+ on the RYVO site · MVP build enforces 16+',
    platforms: ['Web', 'Installable on iPhone & Android'],
    folder: 'C:\\Fussed\\MAIN',
    summary: 'A social network built around hobbies and interests, not follower counts.',
    stack: ['React + TypeScript + Vite', 'Python + FastAPI', 'PostgreSQL', 'Expo mobile shell'],
    features: [
      'A feed shaped by your interests (For You, Friends, Following)',
      'Posts, questions, projects, stories and progress logs',
      'Communities and local events (aggregated, never exact locations)',
      'Friends = mutual follow, unlocks direct messages',
      'Reporting, blocking and extra protections for under-18s',
    ],
    pricing: {
      model: 'One Business subscription, sold three ways',
      plans: [
        { name: 'Business (website)', via: 'Stripe', price: null },
        { name: 'Business (iPhone)', via: 'Apple in-app purchase', price: null },
        { name: 'Business (Android)', via: 'Google Play Billing', price: null },
      ],
      note: "The price lives in Stripe / App Store Connect / Play Console, not in code. Revenue below assumes £4.99/mo.",
      assumedMonthly: 4.99,
    },
    roadmap: [
      { task: 'Server + website billing (Stripe), Apple & Google verification', done: true },
      { task: 'Legal review of Terms, Privacy, Cookie & Copyright pages', done: false },
      { task: 'Hosting + HTTPS, production secrets', done: false },
      { task: 'Daily database backups + uploads to object storage', done: false },
      { task: 'Email from own domain (SPF / DKIM / DMARC)', done: false },
      { task: 'ffmpeg on server for video checks', done: false },
      { task: 'Two moderator accounts with two-step sign-in', done: false },
      { task: 'Native app shell + real store testing', done: false },
    ],
    metrics: {
      subscribers: [
        { plan: 'Business · web', count: 46, monthly: 4.99 },
        { plan: 'Business · iPhone', count: 31, monthly: 4.99 },
        { plan: 'Business · Android', count: 12, monthly: 4.99 },
      ],
      trials: 0,
      churnPct: 3.1,
      revenueTrend: [212, 258, 301, 342, 395, 444],
    },
  },
  {
    id: 'sparesy',
    name: 'Sparesy',
    initial: 'S',
    icon: '/apps/sparesy.svg',
    brand: '#236b50',
    color: 'from-emerald-500 to-emerald-800',
    status: 'In development',
    version: 'v0.1.0',
    users: 3916,
    sparkline: [8, 12, 15, 14, 21, 26, 31, 37],
    nextUp: 'Stripe Connect: embedded host onboarding + transfer checks',
    tagline: 'Find a plan. Take a space. Show up.',
    category: 'Local plans',
    audience: '18+',
    platforms: ['Web (installable PWA)', 'iPhone & Android app'],
    folder: 'C:\\Spare Seat',
    summary: 'Last-minute plans near you with spare places: tickets, teams, tables and seats.',
    stack: ['Next.js 15 + React 19', 'PostgreSQL + Prisma 6', 'Better Auth', 'Stripe Connect', 'Web Push', 'Leaflet + OSM'],
    features: [
      'Discover plans nearby on a map or list',
      'Space counts never overbook, with a waitlist',
      'Hosts choose instant join or approval',
      'Exact locations only shared with confirmed people',
      'In-app payment for paid plans (platform keeps 10%)',
    ],
    pricing: {
      model: 'Sparesy Plus subscription + 10% commission on paid plans',
      plans: [
        { name: 'Sparesy Plus · monthly', via: 'Stripe Checkout', price: 6.99, per: 'month' },
        { name: 'Sparesy Plus · yearly', via: 'Stripe Checkout', price: 67.1, per: 'year' },
        { name: 'Paid plans commission', via: 'Stripe Connect', price: null, label: '10% of each booking' },
      ],
      note: 'Guests pay the platform; hosts get 90% the day after the plan ends.',
    },
    roadmap: [
      { task: 'Checkout + hold-and-release transfers (90% to host)', done: true },
      { task: 'Sparesy Plus subscription checkout', done: true },
      { task: 'Check stripe_transfers status before each transfer', done: false },
      { task: 'Embedded onboarding + notification banner for hosts', done: false },
      { task: 'Radar for Platforms + accept loss liability', done: false },
      { task: 'Mutual connections UI', done: false },
      { task: 'Object storage driver for images', done: false },
      { task: 'Moderator tooling: assignment, appeals, audit export', done: false },
    ],
    metrics: {
      subscribers: [
        { plan: 'Plus · monthly', count: 58, monthly: 6.99 },
        { plan: 'Plus · yearly', count: 17, monthly: 67.1 / 12 },
      ],
      trials: 0,
      churnPct: 4.6,
      commission: { bookings: 214, gmv: 3870 },
      revenueTrend: [210, 330, 455, 590, 720, 887],
    },
  },
  {
    id: 'selvo',
    name: 'Selvo',
    initial: 'S',
    icon: '/apps/selvo.svg',
    brand: '#3a3a42',
    color: 'from-zinc-500 to-zinc-800',
    status: 'In development',
    version: 'v1.0.0',
    users: 728,
    sparkline: [2, 3, 3, 5, 6, 6, 8, 9],
    nextUp: 'Create store products + RevenueCat, then an EAS build',
    tagline: 'Smarter business. Less stress.',
    category: 'Business tools',
    audience: '18+',
    platforms: ['iPhone & Android', 'Web & desktop'],
    folder: 'C:\\Websites\\SoloBiz',
    summary: 'Invoices, income, expenses and reports for freelancers and sole traders.',
    stack: ['Expo SDK 58 + TypeScript', 'Expo Router', 'RevenueCat', 'Supabase (sign-in)', 'Stripe Checkout (web)'],
    features: [
      'Invoices with VAT worked out, part payments and credit notes',
      'Income, expenses and repeating payments',
      'Reports, tax year view and year-end pack (Pro)',
      'Quotes, recurring invoices and due-date reminders (Pro)',
      'Mileage log with HMRC rates (Pro)',
      'Data stays on your device',
    ],
    pricing: {
      model: 'Free + Selvo Pro (14-day free trial)',
      plans: [
        { name: 'Selvo Free', via: '-', price: 0, per: 'month', label: 'Up to 3 repeating payments' },
        { name: 'Selvo Pro · monthly', via: 'App Store / Play / Stripe', price: 5.99, per: 'month' },
        { name: 'Selvo Pro · yearly', via: 'App Store / Play / Stripe', price: 57.5, per: 'year', label: '≈ £4.79/mo, 20% less' },
      ],
      note: 'Products selvo_pro_monthly and selvo_pro_yearly, entitlement "pro" in RevenueCat.',
    },
    roadmap: [
      { task: 'Invoicing, money tracking and reports', done: true },
      { task: 'Selvo Pro subscription + Expo SDK 58', done: true },
      { task: 'Create selvo_pro_monthly / yearly in App Store Connect & Play', done: false },
      { task: 'RevenueCat entitlement + offering', done: false },
      { task: 'Set RevenueCat keys, build with EAS', done: false },
      { task: 'Domain for the website + sitemap.xml', done: false },
    ],
    metrics: {
      subscribers: [
        { plan: 'Pro · monthly', count: 24, monthly: 5.99 },
        { plan: 'Pro · yearly', count: 9, monthly: 57.5 / 12 },
        { plan: 'On free trial', count: 13, monthly: 0 },
      ],
      freeUsers: 682,
      trials: 13,
      churnPct: 2.4,
      revenueTrend: [0, 0, 31, 88, 142, 187],
    },
  },
]

export const appUsersTrend = [
  { month: 'Jun', Intofy: 4210, Sparesy: 820, Selvo: 0 },
  { month: 'Jul', Intofy: 4890, Sparesy: 1240, Selvo: 0 },
  { month: 'Aug', Intofy: 5530, Sparesy: 1710, Selvo: 110 },
  { month: 'Sep', Intofy: 6240, Sparesy: 2380, Selvo: 260 },
  { month: 'Oct', Intofy: 7050, Sparesy: 3120, Selvo: 480 },
  { month: 'Nov', Intofy: 7842, Sparesy: 3916, Selvo: 728 },
]

export const recentReleases = [
  { id: 1, app: 'Sparesy', version: 'v1.4.2', date: '05 Nov 2026', notes: 'Barcode scan fixes', status: 'Completed' },
  { id: 2, app: 'Intofy', version: 'v2.3.0', date: '29 Oct 2026', notes: 'New insights tab', status: 'Completed' },
  { id: 3, app: 'Intofy', version: 'v2.3.1', date: '12 Nov 2026', notes: 'Widget refresh', status: 'Pending' },
  { id: 4, app: 'Sparesy', version: 'v1.4.1', date: '21 Oct 2026', notes: 'Rejected — metadata', status: 'Failed' },
  { id: 5, app: 'Selvo', version: 'v0.1.0', date: '14 Oct 2026', notes: 'Internal prototype', status: 'Completed' },
]

// ── 3D Printing ─────────────────────────────────────────────
export const printer = {
  name: 'Bambu P1S',
  status: 'Printing',
  currentJob: 'psu_shroud_v2.gcode',
  progress: 64,
  timeLeft: '1h 22m',
  nozzleTemp: 220,
  nozzleTarget: 220,
  bedTemp: 58,
  bedTarget: 60,
  layer: '142 / 221',
}

export const filament = [
  { id: 1, name: 'PLA Matte Black', material: 'PLA', remaining: 72, color: '#1f1f1f' },
  { id: 2, name: 'PLA Ivory White', material: 'PLA', remaining: 41, color: '#f5f0e6' },
  { id: 3, name: 'PETG Emerald', material: 'PETG', remaining: 88, color: '#10b981' },
  { id: 4, name: 'TPU Coral', material: 'TPU', remaining: 18, color: '#fb7185' },
  { id: 5, name: 'ABS Slate Grey', material: 'ABS', remaining: 55, color: '#64748b' },
]

export const printQueue = [
  { id: 1, file: 'psu_shroud_v2.gcode', material: 'PETG', time: '3h 45m', status: 'Printing' },
  { id: 2, file: 'cable_tidy_x3.gcode', material: 'PLA', time: '1h 10m', status: 'Queued' },
  { id: 3, file: 'fan_duct_120mm.gcode', material: 'ABS', time: '2h 05m', status: 'Queued' },
  { id: 4, file: 'phone_stand_flex.gcode', material: 'TPU', time: '0h 55m', status: 'Queued' },
  { id: 5, file: 'gpu_bracket_v3.gcode', material: 'PLA', time: '1h 32m', status: 'Completed' },
  { id: 6, file: 'headphone_hook.gcode', material: 'PLA', time: '0h 48m', status: 'Failed' },
]

export const filamentUsage = [
  { name: 'PLA', value: 2140, color: '#f8fafc' },
  { name: 'PETG', value: 1260, color: '#10b981' },
  { name: 'ABS', value: 610, color: '#1f2937' },
  { name: 'TPU', value: 290, color: '#fb7185' },
]

// ── Roblox ──────────────────────────────────────────────────
// Game stats (visits, players, favourites, likes) are LIVE — see robloxFeed.jsx.
// Roadmap and update log aren't available from Roblox's public API, so edit them here.
export const robloxRoadmap = [
  { id: 1, task: 'Mid-air refuelling hose', done: true },
  { id: 2, task: 'CHAOS difficulty + bee swarms', done: true },
  { id: 3, task: 'Second airport + new routes', done: false },
  { id: 4, task: 'Co-pilot seat & cabin crew roles', done: false },
  { id: 5, task: 'Seasonal event: holiday cargo rush', done: false },
]

export const robloxUpdates = [
  { id: 1, version: '0.4', title: 'Storms, turbulence & power cuts', date: '03 Nov 2026', status: 'Completed' },
  { id: 2, version: '0.3.1', title: 'Hotfix — autoload button', date: '01 Nov 2026', status: 'Completed' },
  { id: 3, version: '0.3', title: 'Shop: caps & trails', date: '30 Oct 2026', status: 'Completed' },
  { id: 4, version: '0.5', title: 'Second airport', date: 'Dec 2026', status: 'Pending' },
]

// ── Products ────────────────────────────────────────────────
export const productStats = [
  { id: 'revenue', label: 'Revenue', value: '£3,912', change: -4.2, icon: 'PoundSterling', accent: true },
  { id: 'orders', label: 'Orders', value: '186', change: 6.1, icon: 'ShoppingBag' },
  { id: 'units', label: 'Units sold', value: '412', change: 9.8, icon: 'Boxes' },
  { id: 'conversion', label: 'Conversion', value: '3.4%', change: 0.6, icon: 'Percent' },
]

export const products = [
  { id: 1, name: 'Desk Cable Tidy', price: 9.99, stock: 64, status: 'Active', hue: 'from-stone-200/40 to-stone-500/30' },
  { id: 2, name: 'GPU Support Bracket', price: 14.5, stock: 22, status: 'Active', hue: 'from-emerald-200/40 to-emerald-600/30' },
  { id: 3, name: 'Headphone Hook', price: 7.0, stock: 6, status: 'Low stock', hue: 'from-rose-200/40 to-rose-500/30' },
  { id: 4, name: 'Controller Stand', price: 12.0, stock: 0, status: 'Sold out', hue: 'from-slate-200/40 to-slate-600/30' },
  { id: 5, name: 'Mini PC Case Feet', price: 5.5, stock: 140, status: 'Active', hue: 'from-amber-200/40 to-amber-600/30' },
  { id: 6, name: 'Monitor Light Clip', price: 18.0, stock: 0, status: 'Draft', hue: 'from-indigo-200/40 to-indigo-500/30' },
]

export const recentOrders = [
  { id: '#1048', customer: 'J. Patel', items: 'Desk Cable Tidy ×3', total: '£29.97', status: 'Pending' },
  { id: '#1047', customer: 'M. Okafor', items: 'GPU Support Bracket', total: '£14.50', status: 'Completed' },
  { id: '#1046', customer: 'S. Lindqvist', items: 'Headphone Hook ×2', total: '£14.00', status: 'Completed' },
  { id: '#1045', customer: 'A. Romero', items: 'Mini PC Case Feet', total: '£5.50', status: 'Failed' },
  { id: '#1044', customer: 'K. Nguyen', items: 'Controller Stand', total: '£12.00', status: 'Completed' },
]

// ── Detail panels (click a card / row) ──────────────────────
// All PLACEHOLDER figures — swap for real data later.

// Products, keyed by product id
export const productDetails = {
  1: { material: 'PLA Matte Black', printTime: '0h 23m', grams: 18, costPerUnit: 0.62, unitsSold: 214, salesTrend: [22, 28, 31, 36, 44, 53], description: 'Clip-on under-desk cable tray, fits 18–30 mm desk edges.' },
  2: { material: 'PETG Emerald', printTime: '1h 32m', grams: 46, costPerUnit: 1.48, unitsSold: 96, salesTrend: [9, 12, 14, 16, 20, 25], description: 'Adjustable anti-sag bracket for heavy GPUs, 3 height presets.' },
  3: { material: 'PLA Ivory White', printTime: '0h 48m', grams: 27, costPerUnit: 0.81, unitsSold: 61, salesTrend: [4, 7, 9, 11, 13, 17], description: 'Screw-in or adhesive hook for headphones, holds 2 sets.' },
  4: { material: 'ABS Slate Grey', printTime: '1h 05m', grams: 38, costPerUnit: 1.12, unitsSold: 33, salesTrend: [3, 5, 6, 6, 7, 6], description: 'Weighted stand for Xbox / PlayStation controllers.' },
  5: { material: 'TPU Coral', printTime: '0h 31m', grams: 12, costPerUnit: 0.74, unitsSold: 128, salesTrend: [12, 15, 19, 22, 27, 33], description: 'Set of 4 anti-vibration feet for mini PCs and NAS boxes.' },
  6: { material: 'PETG Emerald', printTime: '2h 10m', grams: 64, costPerUnit: 2.05, unitsSold: 0, salesTrend: [0, 0, 0, 0, 0, 0], description: 'Monitor-top light bar clip. Draft, not listed yet.' },
}

// Filament spools, keyed by spool id
export const spoolDetails = {
  1: { brand: 'Bambu Lab', weightG: 1000, costPerKg: 19.99, nozzle: '220°C', bed: '60°C', openedOn: '12 Oct 2026', usedFor: ['Desk Cable Tidy', 'GPU Support Bracket'] },
  2: { brand: 'Polymaker', weightG: 1000, costPerKg: 21.5, nozzle: '215°C', bed: '60°C', openedOn: '28 Sep 2026', usedFor: ['Headphone Hook'] },
  3: { brand: 'Sunlu', weightG: 1000, costPerKg: 18.0, nozzle: '240°C', bed: '75°C', openedOn: '30 Oct 2026', usedFor: ['GPU Support Bracket', 'Monitor Light Clip'] },
  4: { brand: 'eSun', weightG: 500, costPerKg: 29.0, nozzle: '225°C', bed: '45°C', openedOn: '04 Sep 2026', usedFor: ['Mini PC Case Feet', 'Phone stand'] },
  5: { brand: 'Bambu Lab', weightG: 1000, costPerKg: 22.99, nozzle: '255°C', bed: '100°C', openedOn: '19 Oct 2026', usedFor: ['Controller Stand', 'Fan duct'] },
}

// Print jobs, keyed by queue id
export const printJobDetails = {
  1: { grams: 112, layers: 221, layerHeight: '0.2 mm', infill: '20% gyroid', plate: 'Textured PEI', product: null, started: 'Today 17:14', notes: 'PSU shroud for the workshop PC build.' },
  2: { grams: 54, layers: 96, layerHeight: '0.2 mm', infill: '15% grid', plate: 'Smooth PEI', product: 'Desk Cable Tidy', started: null, notes: 'Order #1048 (×3).' },
  3: { grams: 71, layers: 168, layerHeight: '0.16 mm', infill: '25% gyroid', plate: 'Textured PEI', product: null, started: null, notes: 'Needs enclosure closed (ABS).' },
  4: { grams: 33, layers: 74, layerHeight: '0.2 mm', infill: '30% gyroid', plate: 'Smooth PEI', product: null, started: null, notes: 'Slow outer walls for TPU.' },
  5: { grams: 46, layers: 140, layerHeight: '0.2 mm', infill: '20% gyroid', plate: 'Textured PEI', product: 'GPU Support Bracket', started: 'Today 13:02', notes: 'Finished OK.' },
  6: { grams: 27, layers: 0, layerHeight: '0.2 mm', infill: '20% gyroid', plate: 'Smooth PEI', product: 'Headphone Hook', started: 'Today 11:40', notes: 'Layer shift at 62%. Check belt tension.' },
}

// SOS Airlines store — items, types and Robux prices are REAL (from the
// Obsidian project note). `sold` counts are PLACEHOLDERS.
export const robloxStore = [
  { id: 'captain', name: "Captain's Pass", type: 'Game pass', robux: 149, effect: 'Gold cap, CAPTAIN title, gold laser (cosmetic)', sold: 6 },
  { id: 'golden', name: 'Golden Pistol', type: 'Game pass', robux: 199, effect: 'Gold pistol once per round, fires 2× faster', sold: 3 },
  { id: 'arms', name: 'Strong Arms', type: 'Game pass', robux: 99, effect: 'No slowdown carrying heavy things, 1.6× throws', sold: 4 },
  { id: 'coins-s', name: 'Pocket of Coins', type: 'Product', robux: 25, effect: '500 coins', sold: 11 },
  { id: 'coins-m', name: 'Bag of Coins', type: 'Product', robux: 65, effect: '1,500 coins', sold: 5 },
  { id: 'coins-l', name: 'Vault of Coins', type: 'Product', robux: 199, effect: '5,000 coins', sold: 1 },
  { id: 'xp', name: 'XP Pack', type: 'Product', robux: 35, effect: '1,000 XP', sold: 4 },
  { id: 'dxp', name: 'Double XP', type: 'Product', robux: 49, effect: 'All XP ×2 for 30 minutes', sold: 3 },
  { id: 'second', name: 'Second Chance', type: 'Product', robux: 49, effect: 'Recover the flight during a MAYDAY', sold: 9 },
  { id: 'rescue', name: 'Passenger Rescue', type: 'Product', robux: 35, effect: 'Replace passengers who fell or jumped', sold: 2 },
  { id: 'calm', name: 'Calm Skies', type: 'Product', robux: 29, effect: 'Ends the emergency, none for 2 min', sold: 5 },
  { id: 'supply', name: 'Supply Drop', type: 'Product', robux: 25, effect: '2 repair kits + 3 water + 3 burgers', sold: 6 },
  { id: 'refuel', name: 'Instant Refuel', type: 'Product', robux: 19, effect: 'Tanks full, in flight', sold: 7 },
]

export const robloxProject = {
  // REAL (from C:\Obsidian\Roblox\Projects\SOS Airlines.md)
  genre: 'Co-op physics party game: airport loading + chaotic flight',
  loop: 'Load passengers, bags & cargo → key + throttle → survive the flight → land → deliver → results',
  difficulties: ['Easy', 'Normal', 'Hard', 'CHAOS'],
  systems: [
    { name: 'Round flow (boarding → result)', status: 'Completed' },
    { name: 'Carrying, throwing, cockpit controls', status: 'Completed' },
    { name: 'Flight events: birds, storms, bees, hijackers', status: 'Completed' },
    { name: 'Lobby, crews of 4, difficulty', status: 'Completed' },
    { name: 'Progression: coins, XP, daily challenges', status: 'Completed' },
    { name: 'Coin shop + plane liveries', status: 'Completed' },
    { name: 'Robux store (IDs set in Creator Hub)', status: 'Pending' },
    { name: 'Controller support (real pad test)', status: 'Pending' },
    { name: 'Saving across rejoin (live test)', status: 'Pending' },
  ],
  notePath: 'C:\Obsidian\Roblox\Projects\SOS Airlines.md',
}
