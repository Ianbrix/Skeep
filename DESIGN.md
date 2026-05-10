# SKeep — Design Brief

## Tone & Purpose
Professional, authoritative government financial portal. Emphasizes clarity, accountability, and transparency for SK treasurers and chairpersons managing municipal funds.

## Color Palette
| Semantic | OKLCH | Usage |
|----------|-------|-------|
| Primary (Blue) | `0.52 0.22 253.6` | Navigation, active states, authority |
| Destructive (Red) | `0.57 0.26 21.8` | Budget overages, critical alerts |
| Accent (Yellow) | `0.76 0.16 98.4` | Pending states, COA deadlines, warnings |
| Neutral (Grey) | `0.4 0 0` light / `0.2 0 0` dark | Text, secondary info, dividers |
| Background (White) | `0.99 0 0` | Main surface, trust, clarity |

## Typography
| Role | Font | Scale | Weight |
|------|------|-------|--------|
| Display | General Sans | 32px, 24px | 700 |
| Body | General Sans | 14px, 16px | 400–600 |
| Mono | Geist Mono | 12px, 13px | 400 |

## Shape Language
Border radius: `0.5rem` (tight, corporate). Cards: light border `0.88` on light, subtle hover state. No shadows beyond minimal depth. Grid-based, structured layout.

## Structural Zones
| Zone | Background | Treatment | Height/Width |
|------|------------|-----------|---------------|
| Header | `0.99 0 0` | Blue accent bar bottom, padding 1rem | 64px |
| Sidebar | `0.97 0 0` | Light grey, blue active nav item, icon + text | 250px |
| Main Content | `0.99 0 0` | White, card-based sections | full |
| Alert Zones | Red/Yellow | Inline alerts, budget warnings, deadline indicators | auto |
| Footer | `0.93 0 0` | Muted grey, legal/support links, padding 1rem | 48px |

## Component Patterns
- **Buttons**: Primary (blue bg), Destructive (red bg), Secondary (light grey bg)
- **Cards**: Border `0.88`, bg `0.99`, hover bg `0.95`, 8px padding
- **Forms**: Input border `0.9`, focus ring blue primary
- **Navigation**: Sidebar items with icon left, active state blue bg with rounded corner
- **Alerts**: Inline red/yellow bars with icon + text, 8px left border accent
- **Dashboard Metrics**: Large number, small label, trend indicator (up/down arrow + %, accent/destructive color)

## Motion
**Transition default**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` (smooth, professional). Hover states: subtle bg/border shift. Sidebar toggle: 250ms slide. Alert entrance: fade-in 200ms.

## Differentiation
Governance through specificity: Blue authority + red urgency + yellow caution create a clear semantic hierarchy. No playful gradients or animations—every pixel serves financial clarity. Corporate government aesthetic inspired by treasury and audit portals.

## Signature Detail
Budget meter on dashboard showing % spent with color gradient: green (0–70%), yellow (70–90%), red (90–100%). Real-time indicator updates without page refresh.

## Constraints
- No full-page gradients, no glow/neon effects
- Icons: simple, single-color, 20px/24px
- Maximum 3 weights per font family
- Mobile: sidebar collapses to hamburger menu at `sm` breakpoint
- Dark mode matches light mode semantics with inverted lightness, no hue shifts
