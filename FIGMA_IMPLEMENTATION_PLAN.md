# AERIS® Mountain Retreat — Figma implementation plan

**Current status: the 19 fully documented desktop/mobile frames are implemented, with the functional demonstration booking journey. The six missing contexts have behavior where documented and remain pending visual verification. TypeScript, production build, nine domain tests, and six browser tests pass.**

Last checked: 2026-10-28 (Europe/Kiev).

## Verified source and connection

- Exact source: https://www.figma.com/design/CeXZr739yekML1zYXJnSCw/Untitled?node-id=0-1&p=f&t=9UZ8bxc1UjlGazVx-0
- File key: `CeXZr739yekML1zYXJnSCw`.
- Connected MCP identity: **Даша Сіміоненко**, `6pinkmoon9@gmail.com`, user ID `1036794526083093471`.
- `whoami` reports one Full seat on the Starter team `Даша Сіміоненко's team`, key `team::1036794530723436446`.
- `create_session`, document-wide `get_metadata`, and page metadata retrieval all succeeded. Session: `9f09a3f1-d4aa-4579-8111-f57869e88683`.
- Local `C:/Users/6pink/.codex/config.toml` enables the manual `figma` MCP at `https://mcp.figma.com/mcp`. The installed `figma@openai-curated` plugin is also enabled and specifies the same official endpoint.
- No static bearer-token override, custom request headers, or tool filters are configured on the manual entry. Configuration was inspected without exposing credential contents; no connection settings were changed.
- The manual entry and plugin declaration are both present. Successful native reads establish a working connection. How the runtime resolves those two declarations was not verified; a duplicate-declaration conflict has not been demonstrated.
- Plugin Management's directory reports its Figma connector as not installed, while the local Codex plugin and native Figma MCP are available. These are different registration surfaces; this is not evidence that the working MCP is disconnected. No duplicate plugin was installed.
- Token expiry, effective OAuth scopes, and refresh-token state are not exposed by the Figma tools. File reads succeeded after the user's reauthorization; another reconnect is not currently indicated.
- The owning team is not included in the retrieved metadata. Its identity and owning-plan membership remain unverified. The quota response links to team `1697344716940705375`; the link alone does not establish file ownership.
- Previous access failures are retained in [the authorization history](design/AUTHORIZATION_HISTORY.md). The precise reason those earlier calls failed is unconfirmed. The successful current state supersedes the old diagnosis.

## Historical quota limit and current authorized scope

After 19 full frame contexts, `get_design_context` returned this exact error for `3:18473` and `3:18772`:

> You've reached the Figma MCP tool call limit on the Starter plan. Upgrade your plan for more tool calls: https://www.figma.com/files/team/1697344716940705375/all-projects?upgrade=mcp_rate_limit_paywall Use the whoami tool for more plan details. Learn more: https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/

This is an explicit quota failure following successful authorization. No further file requests were issued after this error. No reset timestamp or remaining-call count was returned.

**Latest user instruction:** proceed using the local references and assets, make no more Figma MCP requests, and implement behavior for the six missing contexts without claiming their exact appearance. This overrides the earlier inspection gate. No Figma MCP calls were made during implementation; additional quota is not required to use the current website. The six contexts can be visually verified later when the user authorizes that work.

Figma's [official access documentation](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) says plan/seat affect read quotas and permission checks include membership in the plan owning the file. It documents a Starter monthly limit; the live tool error establishes the present blocker. The [remote setup documentation](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) matches the inspected endpoint. [Official OpenAI documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli) documents direct MCP configuration and plugin-bundled servers.

## Document coverage and saved evidence

- **1 Figma page:** `Page 1`, ID `0:1`.
- **25 top-level frames**, with **3,000 nodes below the page** (3,001 including the page root).
- **19 full design contexts and 19 original screenshots** saved; six frame contexts remain blocked.
- **106 exact exported assets** downloaded: 57 photographs and 49 SVG exports, containing 62 unique byte hashes.
- Raster export URLs end in `.png` but serve JPEG bytes. Local photographs use `.jpg`; no image conversion was performed.
- All 106 hashes, raster files, and saved screenshots passed integrity checks. This does not constitute website visual validation.

| Evidence | Location |
| --- | --- |
| Complete original XML hierarchy | [design/figma-metadata.xml](design/figma-metadata.xml) |
| Structured hierarchy, context coverage, and asset mappings | [design/inventory.json](design/inventory.json) |
| Every node's exact name, ID, hierarchy, and dimensions | [design/FRAME_INVENTORY.md](design/FRAME_INVENTORY.md) |
| Original reference code/styles, retained as evidence | `design/references/<node_id_with_underscores>.txt` |
| Original returned screenshots | `design/screenshots/<node_id_with_underscores>.png` |
| Exact downloaded photographs and SVGs | `public/assets/figma/` |
| Source URLs, local paths, byte sizes, and SHA-256 | [design/asset-download-report.json](design/asset-download-report.json) |

## Per-frame checklist

Route paths are proposed implementation choices; names/IDs/dimensions are Figma facts. Each full descendant hierarchy is in the linked inventory. A checked structure column does not mean styles/content were retrieved.

| Exact frame name | Node ID | Dimensions | Website route / shared state | Structure | Context and screenshot | Implemented | Visual comparison |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home · Desktop | `3:15867` | 1440 × 6794 | `/` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Home · Mobile | `3:16043` | 390 × 8758 | `/` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Rooms · Desktop | `3:16209` | 1440 × 3917 | `/rooms` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Rooms · Mobile | `3:16359` | 390 × 5133 | `/rooms` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Forest Suite · Desktop | `3:16501` | 1440 × 3706 | `/rooms/forest-suite` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Forest Suite · Mobile | `3:16651` | 390 × 5148 | `/rooms/forest-suite` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Experiences · Desktop | `3:16790` | 1440 × 4794 | `/experiences` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Experiences · Mobile | `3:16904` | 390 × 5852 | `/experiences` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| About · Desktop | `3:17010` | 1440 × 4552 | `/about` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| About · Mobile | `3:17110` | 390 × 5434 | `/about` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Contact · Desktop | `3:17202` | 1440 × 2892 | `/contact` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Contact · Mobile | `3:17321` | 390 × 4489 | `/contact` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Booking · Your stay · Desktop | `3:17432` | 1440 × 2337 | `/booking` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Booking · Your stay · Mobile | `3:17771` | 390 × 3917 | `/booking` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Booking · Your details · Desktop | `3:18103` | 1440 × 1902 | `/booking/details` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Booking · Your details · Mobile | `3:18231` | 390 × 3309 | `/booking/details` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Booking · Review · Desktop | `3:18352` | 1440 × 1947 | `/booking/review` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Booking · Review · Mobile | `3:18473` | 390 × 3294 | `/booking/review` | [x] | [ ] Missing context | [x] Behavior only | [ ] Pending visual verification |
| Confirmation · Desktop | `3:18587` | 1440 × 2067 | `/booking/confirmation` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| Confirmation · Mobile | `3:18683` | 390 × 3336 | `/booking/confirmation` | [x] | [x] Saved | [x] | [x] Compared saved reference |
| 404 · Desktop | `3:18772` | 1440 × 1050 | `unmatched routes` | [x] | [ ] Missing context | [x] Behavior only | [ ] Pending visual verification |
| 404 · Mobile | `3:18802` | 390 × 900 | `unmatched routes` | [x] | [ ] Missing context | [x] Behavior only | [ ] Pending visual verification |
| Navigation · Mobile open | `3:18825` | 390 × 900 | `shared navigation state` | [x] | [ ] Missing context | [x] Behavior only | [ ] Pending visual verification |
| Navigation · Desktop scrolled | `3:18857` | 1440 × 500 | `shared navigation state` | [x] | [ ] Missing context | [x] Behavior only | [ ] Pending visual verification |
| Navigation · Mobile scrolled | `3:18878` | 390 × 479 | `shared navigation state` | [x] | [ ] Missing context | [x] Behavior only | [ ] Pending visual verification |

## Exact section order by frame

Direct children follow the Figma layer order; all nested sections/frames are documented in the complete inventory. Photographs outside section containers are included.

### Home · Desktop — `3:15867`

1. **Arrival** (`3:15868`, frame) — x 0, y 0, 1440 × 950.
2. **Where the world slows down** (`3:15911`, frame) — x 0, y 950, 1440 × 506.
3. **Rooms to retreat to** (`3:15921`, frame) — x 0, y 1456, 1440 × 1355.
4. **Architecture and nature** (`3:15958`, frame) — x 0, y 2811, 1440 × 730.
5. **A different rhythm** (`3:15968`, frame) — x 0, y 3541, 1440 × 1021.
6. **Somewhere between earth and sky** (`3:15998`, frame) — x 0, y 4562, 1440 × 840.
7. **Seasonal field notes** (`3:16004`, frame) — x 0, y 5402, 1440 × 622.
8. **Stay invitation** (`3:16013`, frame) — x 0, y 6024, 1440 × 446.
9. **Footer** (`3:16020`, frame) — x 0, y 6470, 1440 × 324.

### Home · Mobile — `3:16043`

1. **Arrival** (`3:16044`, frame) — x 0, y 0, 390 × 946.
2. **Where the world slows down** (`3:16080`, frame) — x 0, y 946, 390 × 648.
3. **Rooms to retreat to** (`3:16090`, frame) — x 0, y 1594, 390 × 1632.
4. **Architecture and nature** (`3:16124`, frame) — x 0, y 3226, 390 × 931.
5. **A different rhythm** (`3:16134`, frame) — x 0, y 4157, 390 × 2049.
6. **Somewhere between earth and sky** (`3:16164`, frame) — x 0, y 6206, 390 × 650.
7. **Seasonal field notes** (`3:16170`, frame) — x 0, y 6856, 390 × 787.
8. **Stay invitation** (`3:16179`, frame) — x 0, y 7643, 390 × 425.
9. **Footer** (`3:16186`, frame) — x 0, y 8068, 390 × 690.

### Rooms · Desktop — `3:16209`

1. **Solid navigation** (`3:16210`, frame) — x 0, y 0, 1440 × 108.
2. **Page introduction** (`3:16225`, frame) — x 0, y 108, 1440 × 375.
3. **Room collection** (`3:16230`, frame) — x 0, y 483, 1440 × 2240.
4. **Included with every stay** (`3:16315`, frame) — x 0, y 2723, 1440 × 424.
5. **Stay invitation** (`3:16329`, frame) — x 0, y 3147, 1440 × 446.
6. **Footer** (`3:16336`, frame) — x 0, y 3593, 1440 × 324.

### Rooms · Mobile — `3:16359`

1. **Solid navigation** (`3:16360`, frame) — x 0, y 0, 390 × 82.
2. **Page introduction** (`3:16367`, frame) — x 0, y 82, 390 × 353.
3. **Room collection** (`3:16372`, frame) — x 0, y 435, 390 × 2973.
4. **Included with every stay** (`3:16457`, frame) — x 0, y 3408, 390 × 610.
5. **Stay invitation** (`3:16471`, frame) — x 0, y 4018, 390 × 425.
6. **Footer** (`3:16478`, frame) — x 0, y 4443, 390 × 690.

### Forest Suite · Desktop — `3:16501`

1. **Solid navigation** (`3:16502`, frame) — x 0, y 0, 1440 × 108.
2. **Room introduction** (`3:16517`, frame) — x 0, y 108, 1440 × 301.
3. **Suite photo gallery** (`3:16523`, frame) — x 0, y 409, 1440 × 640.
4. **Gallery caption** (`3:16528`, frame) — x 0, y 1049, 1440 × 80.
5. **Suite overview and booking** (`3:16533`, frame) — x 0, y 1129, 1440 × 989.
6. **Bathing ritual** (`3:16599`, frame) — x 0, y 2118, 1440 × 620.
7. **Before you arrive** (`3:16608`, frame) — x 0, y 2738, 1440 × 644.
8. **Footer** (`3:16628`, frame) — x 0, y 3382, 1440 × 324.

### Forest Suite · Mobile — `3:16651`

1. **Solid navigation** (`3:16652`, frame) — x 0, y 0, 390 × 82.
2. **Room introduction** (`3:16659`, frame) — x 0, y 82, 390 × 296.
3. **Suite photo gallery** (`3:16665`, frame) — x 0, y 378, 390 × 480.
4. **Gallery caption** (`3:16667`, frame) — x 0, y 858, 390 × 80.
5. **Suite overview and booking** (`3:16672`, frame) — x 0, y 938, 390 × 1903.
6. **Bathing ritual** (`3:16738`, frame) — x 0, y 2841, 390 × 851.
7. **Before you arrive** (`3:16747`, frame) — x 0, y 3692, 390 × 766.
8. **Footer** (`3:16767`, frame) — x 0, y 4458, 390 × 690.

### Experiences · Desktop — `3:16790`

1. **Solid navigation** (`3:16791`, frame) — x 0, y 0, 1440 × 108.
2. **Page introduction** (`3:16806`, frame) — x 0, y 108, 1440 × 375.
3. **Editorial photograph** (`3:16811`, rounded-rectangle) — x 0, y 483, 1440 × 650.
4. **Experience index** (`3:16812`, frame) — x 0, y 1133, 1440 × 74.
5. **Experiences collection** (`3:16816`, frame) — x 0, y 1207, 1440 × 2278.
6. **A day without a plan** (`3:16853`, frame) — x 0, y 3485, 1440 × 539.
7. **Stay invitation** (`3:16874`, frame) — x 0, y 4024, 1440 × 446.
8. **Footer** (`3:16881`, frame) — x 0, y 4470, 1440 × 324.

### Experiences · Mobile — `3:16904`

1. **Solid navigation** (`3:16905`, frame) — x 0, y 0, 390 × 82.
2. **Page introduction** (`3:16912`, frame) — x 0, y 82, 390 × 353.
3. **Editorial photograph** (`3:16917`, rounded-rectangle) — x 0, y 435, 390 × 460.
4. **Experience index** (`3:16918`, frame) — x 0, y 895, 390 × 71.
5. **Experiences collection** (`3:16922`, frame) — x 0, y 966, 390 × 2820.
6. **A day without a plan** (`3:16959`, frame) — x 0, y 3786, 390 × 951.
7. **Stay invitation** (`3:16980`, frame) — x 0, y 4737, 390 × 425.
8. **Footer** (`3:16987`, frame) — x 0, y 5162, 390 × 690.

### About · Desktop — `3:17010`

1. **Solid navigation** (`3:17011`, frame) — x 0, y 0, 1440 × 108.
2. **Page introduction** (`3:17026`, frame) — x 0, y 108, 1440 × 375.
3. **Editorial photograph** (`3:17031`, rounded-rectangle) — x 0, y 483, 1440 × 720.
4. **Founding idea** (`3:17032`, frame) — x 0, y 1203, 1440 × 470.
5. **Material philosophy** (`3:17040`, frame) — x 0, y 1673, 1440 × 720.
6. **Our principles** (`3:17048`, frame) — x 0, y 2393, 1440 × 697.
7. **People of AERIS** (`3:17072`, frame) — x 0, y 3090, 1440 × 692.
8. **Stay invitation** (`3:17080`, frame) — x 0, y 3782, 1440 × 446.
9. **Footer** (`3:17087`, frame) — x 0, y 4228, 1440 × 324.

### About · Mobile — `3:17110`

1. **Solid navigation** (`3:17111`, frame) — x 0, y 0, 390 × 82.
2. **Page introduction** (`3:17118`, frame) — x 0, y 82, 390 × 353.
3. **Editorial photograph** (`3:17123`, rounded-rectangle) — x 0, y 435, 390 × 480.
4. **Founding idea** (`3:17124`, frame) — x 0, y 915, 390 × 628.
5. **Material philosophy** (`3:17132`, frame) — x 0, y 1543, 390 × 928.
6. **Our principles** (`3:17140`, frame) — x 0, y 2471, 390 × 958.
7. **People of AERIS** (`3:17164`, frame) — x 0, y 3429, 390 × 890.
8. **Stay invitation** (`3:17172`, frame) — x 0, y 4319, 390 × 425.
9. **Footer** (`3:17179`, frame) — x 0, y 4744, 390 × 690.

### Contact · Desktop — `3:17202`

1. **Solid navigation** (`3:17203`, frame) — x 0, y 0, 1440 × 108.
2. **Page introduction** (`3:17218`, frame) — x 0, y 108, 1440 × 375.
3. **Contact information and enquiry** (`3:17223`, frame) — x 0, y 483, 1440 × 871.
4. **The journey here** (`3:17268`, frame) — x 0, y 1354, 1440 × 577.
5. **Frequently asked questions** (`3:17284`, frame) — x 0, y 1931, 1440 × 637.
6. **Footer** (`3:17298`, frame) — x 0, y 2568, 1440 × 324.

### Contact · Mobile — `3:17321`

1. **Solid navigation** (`3:17322`, frame) — x 0, y 0, 390 × 82.
2. **Page introduction** (`3:17329`, frame) — x 0, y 82, 390 × 353.
3. **Contact information and enquiry** (`3:17334`, frame) — x 0, y 435, 390 × 1714.
4. **The journey here** (`3:17379`, frame) — x 0, y 2149, 390 × 923.
5. **Frequently asked questions** (`3:17395`, frame) — x 0, y 3072, 390 × 727.
6. **Footer** (`3:17409`, frame) — x 0, y 3799, 390 × 690.

### Booking · Your stay · Desktop — `3:17432`

1. **Solid navigation** (`3:17433`, frame) — x 0, y 0, 1440 × 108.
2. **Booking introduction** (`3:17447`, frame) — x 0, y 108, 1440 × 292.
3. **Booking body** (`3:17460`, frame) — x 0, y 400, 1440 × 1613.
4. **Footer** (`3:17748`, frame) — x 0, y 2013, 1440 × 324.

### Booking · Your stay · Mobile — `3:17771`

1. **Solid navigation** (`3:17772`, frame) — x 0, y 0, 390 × 82.
2. **Booking introduction** (`3:17779`, frame) — x 0, y 82, 390 × 274.
3. **Booking body** (`3:17792`, frame) — x 0, y 356, 390 × 2871.
4. **Footer** (`3:18080`, frame) — x 0, y 3227, 390 × 690.

### Booking · Your details · Desktop — `3:18103`

1. **Solid navigation** (`3:18104`, frame) — x 0, y 0, 1440 × 108.
2. **Booking introduction** (`3:18118`, frame) — x 0, y 108, 1440 × 292.
3. **Booking body** (`3:18131`, frame) — x 0, y 400, 1440 × 1178.
4. **Footer** (`3:18208`, frame) — x 0, y 1578, 1440 × 324.

### Booking · Your details · Mobile — `3:18231`

1. **Solid navigation** (`3:18232`, frame) — x 0, y 0, 390 × 82.
2. **Booking introduction** (`3:18239`, frame) — x 0, y 82, 390 × 274.
3. **Booking body** (`3:18252`, frame) — x 0, y 356, 390 × 2263.
4. **Footer** (`3:18329`, frame) — x 0, y 2619, 390 × 690.

### Booking · Review · Desktop — `3:18352`

1. **Solid navigation** (`3:18353`, frame) — x 0, y 0, 1440 × 108.
2. **Booking introduction** (`3:18367`, frame) — x 0, y 108, 1440 × 292.
3. **Booking body** (`3:18380`, frame) — x 0, y 400, 1440 × 1223.
4. **Footer** (`3:18450`, frame) — x 0, y 1623, 1440 × 324.

### Booking · Review · Mobile — `3:18473`

1. **Solid navigation** (`3:18474`, frame) — x 0, y 0, 390 × 82.
2. **Booking introduction** (`3:18481`, frame) — x 0, y 82, 390 × 274.
3. **Booking body** (`3:18494`, frame) — x 0, y 356, 390 × 2248.
4. **Footer** (`3:18564`, frame) — x 0, y 2604, 390 × 690.

### Confirmation · Desktop — `3:18587`

1. **Solid navigation** (`3:18588`, frame) — x 0, y 0, 1440 × 108.
2. **Demo confirmation notice** (`3:18602`, frame) — x 0, y 108, 1440 × 86.
3. **Confirmation receipt** (`3:18605`, frame) — x 0, y 194, 1440 × 1193.
4. **Arrival essentials** (`3:18648`, frame) — x 0, y 1387, 1440 × 356.
5. **Footer** (`3:18660`, frame) — x 0, y 1743, 1440 × 324.

### Confirmation · Mobile — `3:18683`

1. **Solid navigation** (`3:18684`, frame) — x 0, y 0, 390 × 82.
2. **Demo confirmation notice** (`3:18691`, frame) — x 0, y 82, 390 × 106.
3. **Confirmation receipt** (`3:18694`, frame) — x 0, y 188, 390 × 1875.
4. **Arrival essentials** (`3:18737`, frame) — x 0, y 2063, 390 × 583.
5. **Footer** (`3:18749`, frame) — x 0, y 2646, 390 × 690.

### 404 · Desktop — `3:18772`

1. **Lost in the mountains** (`3:18773`, rounded-rectangle) — x 0, y 0, 1440 × 1050.
2. **Photographic shade** (`3:18774`, rounded-rectangle) — x 0, y 0, 1440 × 1050.
3. **Transparent navigation** (`3:18775`, frame) — x 0, y 0, 1440 × 108.
4. **A gentle wrong turn** (`3:18789`, frame) — x 0, y 168.5, 1440 × 751.
5. **Page colophon** (`3:18798`, frame) — x 0, y 980, 1440 × 70.

### 404 · Mobile — `3:18802`

1. **Lost in the mountains** (`3:18803`, rounded-rectangle) — x 0, y 0, 390 × 900.
2. **Photographic shade** (`3:18804`, rounded-rectangle) — x 0, y 0, 390 × 900.
3. **Transparent navigation** (`3:18805`, frame) — x 0, y 0, 390 × 82.
4. **A gentle wrong turn** (`3:18812`, frame) — x 0, y 153.5, 390 × 605.
5. **Page colophon** (`3:18821`, frame) — x 0, y 830, 390 × 70.

### Navigation · Mobile open — `3:18825`

1. **Menu header** (`3:18826`, frame) — x 24, y 22, 342 × 44.
2. **Mobile menu links** (`3:18830`, frame) — x 24, y 106, 342 × 356.
3. **Action** (`3:18847`, frame) — x 24, y 502, 342 × 54.
4. **Menu contact** (`3:18850`, frame) — x 24, y 596, 342 × 131.
5. **Menu tagline** (`3:18855`, text) — x 24, y 767, 342 × 62.

### Navigation · Desktop scrolled — `3:18857`

1. **Solid navigation** (`3:18858`, frame) — x 0, y 0, 1440 × 108.
2. **Divider** (`3:18872`, rounded-rectangle) — x 0, y 108, 1440 × 1.
3. **Home scrolled excerpt** (`3:18873`, frame) — x 0, y 109, 1440 × 391.

### Navigation · Mobile scrolled — `3:18878`

1. **Solid navigation** (`3:18879`, frame) — x 0, y 0, 390 × 82.
2. **Divider** (`3:18886`, rounded-rectangle) — x 0, y 82, 390 × 1.
3. **Home scrolled excerpt** (`3:18887`, frame) — x 0, y 83, 390 × 396.

## Shared components and responsive variants

- Transparent Home/404 header; solid interior-page header; desktop links and mobile Book/menu actions. Separate mobile menu and scrolled states await full context.
- Footer with brand promise, Explore links, contact/address, legal links, and portfolio disclosure. Desktop height: 324px; mobile: 690px.
- Shared `Stay invitation` with centered heading/copy/action and muted background.
- Editorial split sections, numbered introductions, room cards, photographic captions, outlined/filled actions, and underlined links.
- Booking introduction/progress, date calendar, room radios, counters, stay summary, guest form, review, and demo notices.
- Desktop variants: 1440px. Mobile: 390px. **No separate tablet frames were found.** Adapt faithfully for 1024px, 768px, and 375px.
- Common gutters: 72px desktop, 24px mobile. Navigation: 108px desktop, 82px mobile. Main actions: 54px tall. Per-section differences are retained in the context files.

## Retrieved fonts and styles

- **Cormorant Garamond Regular**: brand and editorial headings. **Italic**: selected room subtitles and About quotation.
- **Manrope Regular, Medium, and SemiBold**: body, navigation, controls, eyebrows, booking details, and validation.
- Home desktop hero heading: 120px with 1.04 line height. Other observed editorial sizes include 104px, 76px, 64px, 60px, 40px, and 38px. Body commonly uses 1.7 line height; eyebrows commonly use 10px / 1.5.
- Exact classes, fonts, sizes, and mobile changes are in each saved reference. The actual Cormorant Garamond Regular/Italic and Manrope Regular/Medium/SemiBold font binaries are downloaded locally under `public/fonts`, with both OFL licenses. Browser font loading is verified.
- These observations apply to the 19 retrieved contexts, not as verified details of the six pending frames.

| Color | Observed role |
| --- | --- |
| `#f3f0e8` | Warm page background and reversed text |
| `#35463f` | Forest-green accents, actions, dark sections, footer |
| `#252824` | Main text |
| `#686e63` | Secondary text |
| `#cfcfc2` | Borders/dividers |
| `#e8e8dd` | Muted sections and notices |
| `#b7b9a6` | Secondary text on dark surfaces |
| `#964c3d` | Form validation errors |
| `#b9bbb2` | Illustrative map |

Home photograph shading uses `rgba(23,37,29,0.3)`. Preserve exported image crops and actual vectors.

## Verified room and booking content

| Room | Capacity | Area | Nightly USD | Features from Rooms |
| --- | --- | --- | --- | --- |
| Forest Suite | 2 guests | 38m² | $185 | King bed · Rain shower · Forest terrace |
| Panorama Loft | 2 guests | 52m² | $275 | King bed · Soaking tub · Panoramic balcony |
| Summit Residence | 4 guests | 86m² | $420 | Two bedrooms · Living room · Private terrace |

- Example: **16–19 November 2026**, three nights, two adults, one room, Forest Suite. **$185 × 3 = $555**, no extra demo charges.
- Calendars show October and November 2026, Monday-first weeks, disabled past dates, October 28 as today, and the 16–19 November range. Runtime rules must use the user's current Europe/Kiev date.
- Adults are ages 13+; children are ages 0–12 and count toward room capacity. The functional flow should require at least one adult.
- Breakfast and forest spa access are included. Check-in from 15:00; check-out by 11:00.
- The Your details design intentionally illustrates errors: Mara Ackermann, incomplete email `mara@`, and unchecked required demo terms. Implement real validation and normal form use rather than permanent errors.
- Review shows completed sample guest data, edit actions, a note, consent, and a demo-confirmation action. Confirmation includes a clear demo banner, nonredeemable reference, summary, and arrival notes.
- The design explicitly discloses no payment, live reservation, confirmation email, or real enquiry. Every interaction must preserve those disclosures.
- The brief requests LocalStorage persistence while the design says guest details are not saved. Persist non-sensitive stay selections/demo state; keep entered guest personal data in memory unless disclosures are deliberately revised.

## Intended functional interactions

- Routes, active navigation, mobile menu, keyboard/focus behavior, and scrolled header states.
- Home booking-bar dates/guest selection and transition into booking.
- Rooms capacity filters, price sorting, gallery controls, room actions, and booking preselection.
- Forest Suite photo gallery, view-all-photos, summary, and booking action.
- Booking calendar month navigation/range selection, past-date and room-capacity rules, room selection, guest counters, totals, guest validation, editable review, demo confirmation, and safe persistence.
- Contact required fields, conversation selector, consent, and local success state explicitly saying no message was sent.
- Meaningful experience links to verified sections or local information.
- Legal/social controls need truthful local information or verified destinations: no standalone legal-page designs or confirmed Instagram URL were discovered.

## Animations and unresolved details

Use GSAP/ScrollTrigger for restrained hero entrances, image/type reveals, gentle parallax, and hover feedback. Use Lenis where appropriate. Respect reduced motion/mobile and clean up contexts/listeners. This is a plan based on the brief, not a claim that native Figma motion tracks were inspected.

- [ ] Retrieve context, screenshots, and assets for all six pending frames. Do not invent 404 copy or mobile-menu contents from layer names.
- [ ] Inspect prototype reactions, motion tracks, states, annotations, and destination links not exposed by the saved contexts.
- [ ] Acquire the exact font binaries and verify permitted use.
- [ ] Resolve room-detail navigation for Panorama Loft and Summit Residence: only Forest Suite has dedicated detail frames.
- [ ] Check gallery counts against actual images: captions advertise 4 or 6 photos, while visible exported layers do not establish complete collections.
- [ ] Resolve legal/social destinations without inventing pages.

## Project architecture after Phase 1

Use React, TypeScript, Vite, Tailwind CSS, React Router, GSAP/ScrollTrigger, and Lenis. Organize `src/components`, `src/pages`, `src/hooks`, `src/data`, and `src/styles`. Reuse header/footer, actions, editorial sections, room data/cards, and booking components. Adapt the reference to maintainable components; saved reference code is design evidence, not application code.

## Phase and validation checklist

### Phase 1 — Full inspection

- [x] Verify identity and official endpoint; obtain successful session and document-wide metadata.
- [x] Discover every page and all 25 top-level frames.
- [x] Preserve all 3,000 descendant nodes, names, hierarchy, and dimensions.
- [x] Retrieve and inspect 19 full contexts/screenshots.
- [x] Download and validate 106 exported assets.
- [x] Record section order, shared components, desktop/mobile variants, observed fonts/colors, exact room content, and ambiguities.
- [ ] Inspect the six pending frames and missing prototype/motion information.
- [ ] Mark Phase 1 complete only when required gaps are resolved.

### Phase 2 — Architecture, fonts, assets, and styles

- [x] Initialize the requested stack and reusable architecture.
- [x] Configure exact fonts/tokens and integrate the available original assets.

### Phase 3 — Every designed page and section

- [x] Implement all documented page/variant pairs and required shared navigation behavior; six contexts remain visually unverified.
- [x] Preserve verified layouts, typography, photographs, spacing, section order, and controls.

### Phase 4 — Booking and interactions

- [x] Implement dates, capacity, calculations, guest validation, review, demo confirmation, persistence, and every visible action.
- [x] Preserve truthful demonstration/contact disclosures.

### Phase 5 — Motion and responsive behavior

- [x] Add GSAP/ScrollTrigger and Lenis with cleanup and reduced-motion behavior.
- [x] Check 1440px, 1024px, 768px, 390px, and 375px; prevent overflow and inaccessible controls.

### Phase 6 — Testing and visual comparison

- [x] Run TypeScript checks and production build.
- [x] Verify routes, runtime errors, forms, totals, dates/capacity, persistence, image loading, and animations.
- [x] Compare documented rendered variants with the available saved Figma screenshots and correct differences; the six missing contexts stay pending.
- [x] Update each frame's implementation/comparison status; accuracy limits remain explicit.

The application exists and passes the checks recorded below. The six missing contexts remain a visual-verification limitation, not a blocker to the implemented functionality. Pixel-perfect accuracy is not asserted.

## Implementation and verification report

- React + TypeScript + Vite + Tailwind CSS + React Router are configured with a locked dependency tree. GSAP/ScrollTrigger and Lenis honor reduced motion and dispose their contexts/listeners on route or viewport changes.
- The 12 documented marketing variants retain the original section hierarchy, Figma node IDs, typography, layouts, colors, and original local assets. An offline preparation script adapts the saved reference into presentation data; shared semantic components supply navigation, footer links, galleries, controls, and forms.
- Home, Rooms, Forest Suite, Experiences, About, and Contact are implemented. Rooms have capacity filters, price sorting, original-photo galleries, and booking preselection. Only Forest Suite has a designed detail route; the other room actions use information/photo dialogs.
- All three booking stages and demonstration confirmation are functional. Dates, month navigation, past-date restrictions, room selection, adult/child counters, capacity validation, totals, required guest fields, consent, editable review, and demo confirmation are verified. There is no payment or real reservation.
- Non-sensitive stay selections and the demo reference persist locally. Guest personal data stays in React memory. The browser suite verifies that guest names/emails are not present in LocalStorage and that review requires guest details after reload.
- Contact validation and local success feedback work and explicitly state that no message was sent. Legal/social actions provide truthful local concept information.
- Mobile menu, solid scrolled headers, mobile review, and unmatched-route behavior work using documented components. The exact appearance of the six missing contexts remains pending; the basic 404 fallback does not claim to match the missing photography or copy.
- Downloaded photo galleries expose only available original assets, with honest image counts. Missing gallery photographs were not fabricated.

### Validation evidence

- `npm run typecheck`: passed (also runs within production build).
- `npm test`: **9 passed**. Covers the exact $555 sample, all room prices/capacities, children, invalid/past/reversed dates, daylight-saving boundaries, guest validation, and malformed/stale persisted data.
- `npx playwright test`: **6 passed**. Covers all marketing pages and booking inputs at **1440, 1024, 768, 390, and 375px**, plus complete booking, calendar persistence, filters/sorting/galleries, mobile navigation, contact form, reduced motion, normal-motion navigation, and 404 recovery.
- No horizontal document overflow, missing images, or JavaScript runtime errors were found in the browser checks.
- Production build passes with separate application, design-data, vendor, and motion chunks. All scripts are below the initial 500kB chunk warning threshold.
- Browser comparison artifacts are under `design/qa/`. Desktop/mobile captures cover every documented page and include the illustrated two-error details state, review, and confirmation. These files are ignored by Git because they are local QA artifacts.
- Comparison with the saved scaled Figma screenshots found and corrected footer link contrast, mobile hamburger color, contact-field widths, booking heading/bottom spacing, and variant-specific summary photographs. Home section heights and imagery were also inspected against the original metadata/reference.
- The Figma screenshots are scaled exports. Dynamic forms and user content affect page height. These checks substantiate a faithful implementation, not a claim of full-resolution pixel identity.

### Remaining visual verification

1. `3:18473` — Booking · Review · Mobile.
2. `3:18772` — 404 · Desktop.
3. `3:18802` — 404 · Mobile.
4. `3:18825` — Navigation · Mobile open.
5. `3:18857` — Navigation · Desktop scrolled.
6. `3:18878` — Navigation · Mobile scrolled.

Native Figma prototype destinations and motion tracks were not retrieved. Behavior is implemented from the inspected layouts and the user's functional requirements. No additional Figma reads are necessary for the present delivery.

## Local delivery and publication state

Follow-up correction: the Rooms price sorter now uses a custom accessible combobox/listbox instead of the browser-native select popup. It follows the existing cream/forest palette, Manrope typography, fine borders, selected-item checkmark, and restrained hover treatment. Mouse/touch selection, arrow keys, Home/End, Enter/Space, Escape, outside dismissal, and Tab are implemented. The existing room-browser test was updated and passes, including keyboard selection/cancellation and correct price order. Desktop/mobile popup bounds were verified at 1440, 390, and 375px, plus an upward-opening case in a short viewport. TypeScript and production build pass; the production ZIP was refreshed.

Follow-up correction: the floating Home booking bar is horizontally centered at every viewport width, with a 1296px maximum width and responsive side gutters. Browser measurements passed at 375, 390, 768, 1024, 1280, 1440, 1920, and 2540px: equal left/right margins, zero centering error, and no horizontal document overflow. TypeScript and production build pass; the local production ZIP was refreshed.

The local production output is `dist/`; a portable production ZIP is saved as `artifacts/aeris-production.zip`. Run `npm run dev` to review the editable application locally. Source, downloaded references/assets, tests, and this inventory are in the workspace.

A private Site registration was created with project ID `appgprj_6ae24cd13f68819196a090c95cafbac9`, persisted in `.openai/hosting.json`. **No source was uploaded and no version was published.** Automatic approval review rejected the attempted source synchronization because packaging/transmitting source to an external Sites repository for publication was not explicitly authorized by the user's implementation request. The rejected workflow did not execute. Publishing requires the user's explicit approval; the local implementation and build are unaffected.
