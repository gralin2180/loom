# LOOM clothing — shipping + CS automation + low returns

Your free clothing storefront: **`clothing/index.html`** (brand **LOOM**).

This doc answers: how shipping can run without you babysitting packages, how customer service can stay “always on,” and how to **not bleed money** on fashion returns.

---

## The hard truth about clothing dropshipping

| Risk | Why it kills stores | What we designed instead |
|------|---------------------|---------------------------|
| **Wrong size** (~#1 return reason) | Full refund + re-ship + you pay postage twice | Size charts, fit finder, fit confirmation at checkout |
| **Slow China post + silence** | Chargebacks & bad reviews | Clear windows + tracking page + auto status emails |
| **Structured fashion** (heels, tailored suits) | High defect + fit variance | Core: tees, hoodies, relaxed trousers, accessories |
| **Too many SKUs** | Inventory logic + wrong variants ship | Start with 6–12 SKUs; unisex where possible |

**Goal:** fewer packages coming back = less loss for merchant **and** customer.

---

## How shipping automation works (production)

```
Customer pays on LOOM
    → Order JSON / store webhook
    → Your fulfillment partner (AliExpress+DSers, Trendsi, agent, or your bulk stock)
    → Partner packs + prints label
    → Tracking number created
    → AfterShip / 17TRACK watches scans
    → Customer gets auto emails: shipped → in transit → out for delivery → delivered
    → (Optional) Assist chat can pull the same tracking
```

### Tools that automate shipping

| Layer | Tools | Free / paid |
|-------|--------|-------------|
| Supplier | AliExpress + DSers, Trendsi, Zendrop, Spocket, private agent / factory | Product + shipping |
| Order push | DSers or your partner’s sync | Free–paid tiers |
| **Tracking & notifications** | **AfterShip**, **17TRACK**, **TrackingMore** | Free tiers then paid by volume |
| Email when statuses change | AfterShip templates or **Brevo** free | Free tier exists |
| Faster lanes | US/EU warehouse stock when available | Slightly higher cost, fewer tickets |

### Practical low-cost setup

1. Source only products you sampled and can re-order from a **stable** supplier URL  
2. Fulfill manually from order JSON at first, then automate  
3. Connect **AfterShip free tier** to carrier tracking → email customer  
4. Put tracking link on your site (`track.html`)

### Regional strategy to reduce “where is my package?”

| Destination | Prefer | Why |
|-------------|--------|-----|
| US / EU / UK volume | Local warehouse SKUs | 5–10 day feel, fewer tickets |
| Rest of world | ePacket / YunExpress / preferential lines | Cost-efficient |
| High-return SKUs | Don’t run globally first | Pilot one region |

---

## How customer service automation works

### Already built into the free LOOM store

| Feature | Job |
|---------|-----|
| **Loom Assist chat** (every page, bottom-right) | Instant FAQ: size, shipping, track, returns, payments |
| **Fit Finder** | Cuts size tickets before order |
| **Track Order** | Self-serve status → less “any update?” spam |
| **Care / FAQ page** | SEO + pre-sales trust |
| **Fit confirmation** at checkout | Forces measure intent |

### Production bots (when you scale)

| Need | Tool ideas | Notes |
|------|------------|--------|
| Site chat AI | **Tidio**, **Crisp**, **Tawk.to** (free), Gorgias AI | Start free Tawk/Crisp |
| Email helpdesk | **Gmail filters** + templates → later **Gorgias** / **Zendesk** | Auto-tag “size” “tracking” |
| WhatsApp | **ManyChat** / WhatsApp Business + catalog | Great for markets that live on WA |
| Order status macros | “Reply with order ID” → bot looks up tracking | Same API as AfterShip |

**Rule of automation:**  
Bot handles **80%** (size, ETA, tracking, policy). Human handles **20%** (damaged item, refund exception).

Suggested macros:

1. Size help → link Fit Finder + product chart  
2. Where is package → Track page + paste ETA  
3. Want cancel → if not shipped, cancel via supplier dashboard  
4. Defect → ask for 2 photos → approve exchange path  

---

## Low-return product playbook (stock what LOOM stocks)

**Lean into**

- Oversized tees, hoodies, relaxed shirts  
- Mid-rise wide trousers (waist-first chart)  
- Belts, totes, caps (one-size AOV boosters)  
- Few colors × clear size runs (not 30 SKUs)

**Avoid early**

- Vanity sizing with no chart  
- Super skinny denim / full suits  
- Delicate heels  
- “Influencer only” brands you can’t source consistently  

Each product in `clothing/js/products.js` has:

- `returnRisk`: low | medium  
- `sizeChart`  
- `fit` note  
- `sourceHint` for suppliers  

---

## Unit economics (example)

| Item | Sell | Cost ≈ | Room for ship + ads + fees |
|------|------|--------|----------------------------|
| Cloud Tee | $28 | $7 | Strong |
| Nova Hoodie | $48 | $13 | Strong |
| Forge Jacket | $68 | $18 | OK if returns low |
| Orbit Belt | $22 | $4 | Best for “no size drama” |

If return rate on a SKU climbs above ~**10–15%**, kill or rechart that SKU.

---

## Launch checklist

1. Open `clothing/index.html`  
2. Host folder free (Netlify Drop / Cloudflare Pages)  
3. Edit `clothing/js/config.js` → email, WhatsApp, paymentLink  
4. Order **1 sample** of hero SKUs and update photos  
5. Set up supplier fulfillment + AfterShip free  
6. Market with Reels: “mid-range fit without department-store prices” + screen record Fit Finder  
7. Use chat to collect real questions → add to FAQ  

---

## LOOM vs SOLA

| | **SOLA** (`store/`) | **LOOM** (`clothing/`) |
|--|---------------------|-------------------------|
| Category | Home ambient | Fashion |
| Main risk | Product flop | Size returns |
| Superpower | Visual content | Fit tools + CS automation |

Run both if you want, but market **one** hard until cashflow. Clothing needs more trust ops; home gadgets convert easier on short video — fashion needs the fit system you just built.
