# DOP DIRECTION — Creomotion Homepage Hero

## Director of Photography: Visual Composition & "Camera Work"

> "Even in web, we're making a film. Every scroll is a cut. Every hover is a focus pull. Every reveal is a dolly move."

---

## 1. COMPOSITION GRID

### The Frame Architecture

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]                              [NAV LINKS]       │ ← Headspace
├─────────────────────────────────────────────────────────┤
│                     ╔════════════════════╗              │
│     ╔══════╗        ║                    ║     ╱╲      │ ← Act I: Hook
│     ║      ║        ║   CREOMOTION       ║    ╱20╲     │
│     ║ GEAR ║        ║                    ║   ╱    ╲    │
│     ╚══════╝        ╚════════════════════╝  ╱ CORAL ╲   │
│    PARALLAX       PRIMARY FOEAL POINT      ╱  ACCENT  ╲ │
│                                                       │
│    "Where ideas                            [CTA BTN]  │
│     become reality"                                  │
├─────────────────────────────────────────────────────────┤
│  STRATEGY  ◆  DESIGN  ◆  MOTION                        │ ← Act II: Story
│  [PARALLAX MIDGROUND - Slower movement]                │
│         ◇ ◈ ◇ ◈ ◇                                     │
├─────────────────────────────────────────────────────────┤
│  ─────────────────────────                             │
│  Selected Work          [VIEW ALL →]                   │ ← Act III: Invitation
│  ─────────────────────────                             │
└─────────────────────────────────────────────────────────┘
```

### Focal Points & Eye Flow

**Primary Focus:** The brand wordmark "CREOMOTION" — dead center, architectural weight
**Secondary Focus:** Coral (#FF2E63) geometric accent — right third, creates tension
**Tertiary Focus:** CTA button — lower center, invitation

**Eye Movement Path:**
1. Start at dominant typography (center mass)
2. Eye drifts to coral accent (right third, rule of thirds crossing)
3. Catches the tagline below (left alignment creates tension)
4. Drops to CTA (center, gravitational pull)
5. Scroll reveals secondary story (services)

### Rule of Thirds Application

| Zone | Content | Function |
|------|---------|----------|
| Top-Left | Navigation logo | Identity anchor |
| Top-Right | Nav links | Exit/secondary actions |
| Center Cross | "CREOMOTION" text | Primary message |
| Right Third | Coral geometric shape | Visual tension, brand color |
| Bottom Center | CTA Button | Conversion point |

---

## 2. VISUAL LAYERS (DEPTH)

### Z-Index Hierarchy & Depth Stack

```
Z-LEVEL 40  ════════════════════════════════════════  ◄ FOREGROUND
            Dynamic Particles (on hover/interaction)
            CTA Button hover shadow (harsh, 8px offset)
            
Z-LEVEL 30  ════════════════════════════════════════
            Navigation bar (floating, subtle shadow)
            Primary Typography "CREOMOTION"
            
Z-LEVEL 20  ════════════════════════════════════════  ◄ MIDGROUND
            Service gear icons (Strategy/Design/Motion)
            Coral accent geometry (floats, independent)
            Project preview cards
            
Z-LEVEL 10  ════════════════════════════════════════
            Subtle grid lines (10% opacity)
            Abstract shapes (slower parallax)
            
Z-LEVEL 0   ════════════════════════════════════════  ◄ BACKGROUND
            Base color: #F5F5F0 (warm off-white)
            Gradient subtle shift: #F5F5F0 → #EBEBE5 (top to bottom, 3%)
```

### Parallax Movement Speeds

| Layer | Speed Multiplier | Movement | Effect |
|-------|------------------|----------|--------|
| Background | 0.2x | translateY(-20px over 100vh) | Almost static, grounded |
| Grid Lines | 0.3x | translateY(-30px over 100vh) | Suggestive, barely there |
| Midground Shapes | 0.5x | translateY(-50px over 100vh) + slight rotate | Secondary interest |
| Coral Accent | 0.7x | translateY(-70px) + translateX(20px) | Lives in its own space |
| Service Gears | 0.6x | translateY(-60px) + slow rotation | Mechanical metaphor |
| Typography | 1.0x (fixed) | Anchored, stable | Primary anchor |
| Foreground Particles | 1.3x | translateY(+40px - follows scroll) | Speed blur effect |

### Depth Psychology

**Layer separation creates dimensional space:**
- Background = Infinite void (potential)
- Midground = The creative machinery (process)
- Foreground = The visitor (engagement)

---

## 3. MOTION DIRECTION

### Act I: Hook — "The Reveal Shot"

**Opening Sequence (Page Load):**
```
TIMELINE 0ms ──────────────────────────→ 2400ms

0ms    → Typography masked, translateY(100%), clip-path: inset(100% 0 0 0)
200ms  → "CREOMOTION" rises: translateY(0%), clip-path reveals
        Easing: cubic-bezier(0.16, 1, 0.3, 1) — anticipatory, snappy
        Duration: 800ms
        
600ms  → Tagline fades in: opacity 0→1, translateY(20px)→0
        Easing: cubic-bezier(0.4, 0, 0.2, 1) — smooth, gentle
        Duration: 400ms
        
1000ms → Coral accent slides from right: translateX(100px)→0, rotate(-5deg)→0
        Easing: cubic-bezier(0.34, 1.56, 0.64, 1) — overshoot, playful
        Duration: 600ms
        
1400ms → CTA button scales up: scale(0.8)→1, opacity 0→1
        Easing: cubic-bezier(0.175, 0.885, 0.32, 1.275) — elastic snap
        Duration: 400ms
        
1800ms → Subtle grid lines fade: opacity 0→0.1
        Duration: 600ms
```

**"Camera" Movement:**
- Static wide shot that "breathes"
- Typography feels like it's emerging from below frame (dolly up)
- Coral accent enters from off-screen right (whip pan reveal)

### Act II: Story — "The Pan-Through"

**Scroll-Triggered Motion:**

| Trigger Point | Element | Motion | Duration |
|--------------|---------|--------|----------|
| 0% → 30% viewport | Service gears | rotate(0deg)→rotate(90deg), fade in | scroll-linked |
| 10% → 50% viewport | Gear connectors | stroke-dashoffset animation (draw lines) | scroll-linked |
| 20% → 60% viewport | "Strategy" text | translateX(-50px)→0, opacity 0→1 | 600ms per |
| 30% → 70% viewport | "Design" text | translateX(-50px)→0, opacity 0→1 | 600ms per |
| 40% → 80% viewport | "Motion" text | translateX(-50px)→0, opacity 0→1 | 600ms per |

**Mechanical Metaphor Motion:**
```
GEAR 1 (Strategy)    →  Rotates clockwise, 60s per revolution
GEAR 2 (Design)      →  Rotates counter-clockwise, 45s per revolution  
GEAR 3 (Motion)      →  Rotates clockwise, 30s per revolution
CONNECTING RODS      →  Slide back/forth, sync to gear teeth
```

### Act III: Invitation — "The Push-In"

**Hover States (Micro-Interactions):**

**CTA Button Hover:**
- Shadow: `box-shadow: 8px 8px 0px #000000` → `box-shadow: 12px 12px 0px #FF2E63`
- Transform: `translate(0, 0)` → `translate(-2px, -2px)`
- Duration: 200ms ease-out
- Feeling: Button lifts toward viewer, harsh shadow intensifies

**Project Card Hover:**
- Image: scale(1) → scale(1.05), overflow hidden
- Overlay: opacity 0 → 0.9 (coral wash)
- Title: translateY(20px) → translateY(0)
- Duration: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Feeling: Push-in focus on work

**Navigation Link Hover:**
- Underline: width 0% → 100% from left
- Text: subtle translateY(-2px)
- Duration: 200ms
- Feeling: Focus pull to link

---

## 4. LIGHT & ATMOSPHERE

### Light Direction

**Key Light:** Virtual light source from top-left (315°)
- Creates subtle shadows on bottom-right of elements
- Typography: `text-shadow: none` (clean, flat)
- Buttons: `box-shadow: 8px 8px 0px #000` (harsh, brutalist)

**Fill Light:** Soft ambient from all directions
- Background: Uniform #F5F5F0
- No gradients on primary surfaces (keep flat)
- Only subtle gradient: top of page 2% lighter (atmospheric perspective)

**Rim Light (Accent):** Coral highlights
- Coral elements act as "lit" objects
- No actual drop shadow on coral (#FF2E63 is pure light)
- Creates focal glow in composition

### Shadow Usage

| Element | Shadow Type | Values | Purpose |
|---------|-------------|--------|---------|
| Navigation | Soft depth | `0 2px 20px rgba(0,0,0,0.05)` | Float above content |
| CTA Button (rest) | Harsh offset | `8px 8px 0 #000` | Brutalist punch |
| CTA Button (hover) | Harsh + colored | `12px 12px 0 #FF2E63` | Urgency, action |
| Cards | None (flat) | `box-shadow: none` | Clean, print-like |
| Cards (hover) | Elevated | `0 20px 40px rgba(0,0,0,0.1)` | Dimensional lift |

### Atmosphere & Mood

**Color Temperature:** Warm neutral
- #F5F5F0 has slight warmth vs pure white
- Black (#000000) provides cold contrast
- Coral (#FF2E63) injects energy/heat

**Mood by Act:**

| Act | Mood | Lighting Metaphor |
|-----|------|-------------------|
| I | Anticipation, impact | "Spotlight reveal" — dramatic contrast |
| II | Discovery, curiosity | "Workshop lighting" — functional, reveals detail |
| III | Urgency, exclusivity | "Gallery spot" — focused, important |

**Atmospheric Effects:**
- Subtle noise texture overlay (2% opacity) on background — suggests paper/film grain
- No blur effects (keep sharp, brutalist)
- No glows except on coral accent (self-illuminated)

---

## 5. TECHNICAL NOTES FOR IMPLEMENTATION

### Animation Specifications

#### Typography Entrance (Act I)
```css
@keyframes titleReveal {
  from {
    clip-path: inset(100% 0 0 0);
    transform: translateY(100%);
  }
  to {
    clip-path: inset(0 0 0 0);
    transform: translateY(0);
  }
}

.hero-title {
  animation: titleReveal 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 200ms;
}
```

#### Parallax Layer Implementation
```javascript
// GSAP or CSS scroll-timeline
const layers = {
  background: { speed: 0.2, y: -20 },
  midground: { speed: 0.5, y: -50 },
  foreground: { speed: 1.3, y: 40 }
};

// On scroll: element.style.transform = `translateY(${scrollY * speed}px)`
```

#### Gear Rotation (CSS)
```css
@keyframes gearTurn {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gear-strategy { animation: gearTurn 60s linear infinite; }
.gear-design { animation: gearTurn 45s linear infinite reverse; }
.gear-motion { animation: gearTurn 30s linear infinite; }
```

#### Button Hover (Sharp, Brutalist)
```css
.btn-brutalist {
  background: #000;
  color: #F5F5F0;
  box-shadow: 8px 8px 0px #000;
  transition: 
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
}

.btn-brutalist:hover {
  transform: translate(-2px, -2px);
  box-shadow: 12px 12px 0px #FF2E63;
}
```

### Timing Constants

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Entrance/Reveal | 600-800ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Hover States | 150-200ms | `ease-out` |
| Scroll Parallax | Scroll-linked | Linear |
| Continuous (gears) | 30-60s loop | Linear |
| Fade | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Elastic Pop | 400ms | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |

### Performance Optimization

**GPU-Accelerated Properties Only:**
- `transform` (translate, rotate, scale) ✓
- `opacity` ✓
- Avoid: `top`, `left`, `margin`, `clip-path` (on scroll)

**Will-Change Declaration:**
```css
.parallax-layer { will-change: transform; }
.gear { will-change: transform; }
```

**Reduced Motion Support:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .parallax-layer { transform: none !important; }
}
```

### "Camera" Scroll Behavior

```javascript
// Smooth scroll for internal navigation
document.documentElement.style.scrollBehavior = 'smooth';

// Intersection Observer for triggering Act II/III
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.3 }
);
```

---

## SCENE SUMMARY

**SHOT LIST:**

1. **Wide Establishing Shot** (Act I) — Brand reveal, architectural typography, color punch
2. **Tracking Shot Through Machinery** (Act II) — Parallax descent through services, rotating gears
3. **Push-In Close-Up** (Act III) — CTA focus, hover interactions, conversion moment

**Key Cinematic Principles Applied:**
- Rule of thirds for focal placement
- Depth through parallax + z-axis layers
- Lighting direction for hierarchy
- Motion timing for emotional beats
- Contrast (black/white/coral) for visual tension

**Final Note:** This hero is a single continuous "shot" where the user controls the camera through scroll. Every frame should be compositionally valid — think Kubrick, not chaos.
