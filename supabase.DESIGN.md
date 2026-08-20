---
name: Supabase
colors:
  primary: "#3FCF8E"
  secondary: "#097C4F"
  surface: "#000000"
  on-surface: "#FFFFFF"
typography:
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 600
rounded:
  md: 4px
---

# Design System Inspired by Supabase

## 1. Visual Theme & Atmosphere

Supabase's design system embodies a modern, developer-centric aesthetic that prioritizes clarity, scalability, and approachability. The visual language combines vibrant accent colors with a clean, minimal foundation—reflecting the platform's positioning as an accessible yet powerful backend infrastructure. The design favors generous whitespace, subtle borders, and straightforward component structures that reduce cognitive load. Icons and illustrations are used sparingly but meaningfully to communicate feature categories. The overall mood is energetic yet professional, communicating both technical sophistication and a welcoming developer experience. Typography is direct and hierarchical, guiding users through complex product information with confidence.

**Key Characteristics**
- **Vibrant, accessible primary green** (`#3FCF8E`) used prominently for CTAs and key interactions
- **High contrast between text and backgrounds** for readability and WCAG compliance
- **Minimal, clean component design** with subtle border treatments
- **Consistent corner radius** across components creating visual unity
- **Strategic use of warm accent orange** (`#DC7B18`) for secondary features and status indicators
- **Developer-friendly typography** with clear hierarchy and monospace code treatment
- **Generous spacing and padding** supporting both desktop and mobile experiences
- **Subtle elevation and depth** through shadows, avoiding heavy visual weight

## 2. Color Palette & Roles

### Primary
- **Brand Green** (`#3FCF8E`): Primary CTA buttons, key interactive elements, accent highlights; most prominent color across the system
- **Brand Green Dark** (`#097C4F`): Hover states, secondary emphasis, darker variant for contrast

### Accent Colors
- **Brand Green Medium** (`#16B674`): Mid-tone green for hover transitions and secondary interactive states
- **Brand Green Deep** (`#0A844E`): Dark green for active states and strong emphasis
- **Brand Green Light** (`#72E3AD`): Light green for backgrounds, disabled states, or subtle emphasis
- **Brand Green Pale** (`#A9F1CA`): Very light green for background overlays or status badges

### Interactive
- **Warm Orange** (`#DC7B18`): Status labels, beta/new feature indicators, secondary CTAs
- **Warm Orange Light** (`#F3BA63`): Hover states for orange elements, lighter variant for backgrounds

### Neutral Scale
- **Text Primary** (`#000000`): Primary text, headings, body copy
- **Text Secondary** (`#808080`): Secondary text, helper text, muted descriptions
- **Text Tertiary** (`#A0A0A0`): Disabled text, subtle labels, low-contrast situations
- **Background White** (`#FFFFFF`): Primary background, card surfaces, light containers

### Surface & Borders
- **Border Default** (`#000000` at 14.6% opacity): Subtle 1px borders on inputs, cards, and containers
- **Border Light** (`#000000` at 8.1% opacity): Very subtle borders for minimal visual separation
- **Surface Overlay** (`#000000` at 2.6% opacity): Subtle background for input fields and form elements

## 3. Typography Rules

### Font Family
- **Primary Font:** Manrope (headings, display text)
  - Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Secondary Font:** Inter (body text, UI controls)
  - Fallback: `ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Code Font:** Source Code Pro (code blocks, technical content)
  - Fallback: `'Courier New', monospace`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| **Display 1 (Hero)** | Manrope | `46px` | `500` | `46px` | `0px` | Large hero headings on landing pages |
| **Display 2 (Section)** | Manrope | `34px` | `600` | `37.8px` | `0px` | Major section headings |
| **Display 3** | Manrope | `34px` | `500` | `40.8px` | `0px` | Alternative large heading variant |
| **Heading 1** | Manrope | `28px` | `500` | `33.6px` | `0px` | Primary page heading |
| **Heading 2** | Manrope | `28px` | `600` | `33.6px` | `0px` | Secondary heading with stronger weight |
| **Heading 3** | Manrope | `16px` | `600` | `24px` | `0px` | Card headings, feature titles |
| **Heading 4** | Manrope | `18px` | `600` | `25.2px` | `0px` | Subsection headings |
| **Heading 5** | Manrope | `14px` | `600` | `20px` | `0px` | Small emphasis headings |
| **Heading 6 (Label)** | Manrope | `15px` | `600` | `22.5px` | `0px` | Form labels, small headings |
| **Body (Standard)** | Inter | `14px` | `500` | `19.25px` | `0px` | Primary body text |
| **Body (Regular)** | ui-sans-serif | `14px` | `450` | `19.25px` | `0px` | Standard paragraph text |
| **UI Text (Compact)** | ui-sans-serif | `12px` | `450` | `16px` | `0px` | Button text, compact UI labels |
| **Input Text** | Inter | `14px` | `450` | `20px` | `0px` | Form input content |
| **Caption (Small)** | ui-sans-serif | `12px` | `450` | `16px` | `0px` | Small helper text, captions |
| **Code (Inline)** | Source Code Pro | `12px` | `450` | `19.5px` | `0px` | Inline code snippets |
| **Code (Block)** | Source Code Pro | `13px` | `500` | `22.1px` | `0px` | Code block text |
| **Code (Display)** | Source Code Pro | `22px` | `450` | `29.3px` | `0px` | Large code display |

### Principles
- **Clear Hierarchy:** Weight and size changes are distinct, enabling rapid visual scanning of page structure.
- **Readability:** Line heights are generous (1.2–1.5× font size) to ensure comfortable reading on all device sizes.
- **Developer Focus:** Monospace code is always clearly distinguished from body text using Source Code Pro.
- **Contrast:** All text meets WCAG AA contrast standards against their backgrounds.
- **Consistency:** Font weights are limited to 450, 500, and 600 to avoid visual noise.

## 4. Component Stylings

### Buttons

#### Primary Button (Brand Green)
- **Background:** `#3FCF8E`
- **Text Color:** `#000000`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Font Family:** Inter
- **Padding:** `8px 32px`
- **Border Radius:** `32px` (fully rounded)
- **Border:** `1px solid #000000`
- **Box Shadow:** `none`
- **Height:** `38px`
- **Line Height:** `20px`
- **Hover State:** Background `#16B674`, text `#000000`
- **Active State:** Background `#097C4F`, text `#000000`
- **Disabled State:** Background `#72E3AD`, text `#000000` at `50%` opacity

#### Secondary Button (Ghost)
- **Background:** `transparent`
- **Text Color:** `#000000`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Font Family:** Inter
- **Padding:** `8px 8px`
- **Border Radius:** `6px`
- **Border:** `1px solid transparent`
- **Box Shadow:** `none`
- **Height:** `34px`
- **Line Height:** `16px`
- **Hover State:** Background `rgba(0, 0, 0, 0.05)`, text `#000000`
- **Active State:** Background `rgba(0, 0, 0, 0.08)`, text `#000000`

#### Tertiary Button (Text Only)
- **Background:** `transparent`
- **Text Color:** `#000000`
- **Font Size:** `16px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Padding:** `0px 0px`
- **Border Radius:** `0px`
- **Border:** `none`
- **Box Shadow:** `none`
- **Height:** `auto`
- **Line Height:** `24px`
- **Hover State:** Text color `#3FCF8E`
- **Active State:** Text color `#097C4F`

#### Dark Button (Inverted)
- **Background:** `#000000`
- **Text Color:** `#FFFFFF`
- **Font Size:** `12px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Padding:** `4px 10px`
- **Border Radius:** `6px`
- **Border:** `1px solid rgba(0, 0, 0, 0.4)`
- **Box Shadow:** `none`
- **Height:** `26px`
- **Line Height:** `16px`
- **Hover State:** Background `rgba(0, 0, 0, 0.9)`, text `#FFFFFF`

### Cards & Containers

#### Standard Card
- **Background:** `#FFFFFF`
- **Text Color:** `#000000`
- **Font Size:** `12px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Padding:** `4px 10px`
- **Border Radius:** `6px`
- **Border:** `1px solid rgba(0, 0, 0, 0.146)`
- **Box Shadow:** `none`
- **Height:** `26px`
- **Line Height:** `16px`

#### Feature Card (Large)
- **Background:** `#FFFFFF`
- **Text Color:** `#000000`
- **Font Size:** `14px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Padding:** `8px 16px`
- **Border Radius:** `6px`
- **Border:** `1px solid rgba(0, 0, 0, 0.146)`
- **Box Shadow:** `0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)`
- **Height:** `38px`
- **Line Height:** `20px`

#### Pricing Card
- **Background:** `#FFFFFF`
- **Text Color:** `#000000`
- **Font Size:** `15px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Padding:** `8px 16px`
- **Border Radius:** `6px`
- **Border:** `1px solid rgba(0, 0, 0, 0.146)`
- **Box Shadow:** `0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)`
- **Height:** `42px`
- **Line Height:** `22.5px`
- **Featured Card Border:** `2px solid #3FCF8E`

### Inputs & Forms

#### Text Input
- **Background:** `rgba(0, 0, 0, 0.026)`
- **Text Color:** `#000000`
- **Font Size:** `14px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Padding:** `8px 8px`
- **Border Radius:** `6px`
- **Border:** `1px solid rgba(0, 0, 0, 0.146)`
- **Box Shadow:** `none`
- **Height:** `35px`
- **Line Height:** `20px`
- **Placeholder Color:** `#808080` at `50%` opacity
- **Focus State:** Border `#3FCF8E` `2px`, background `rgba(0, 0, 0, 0.04)`
- **Disabled State:** Background `rgba(0, 0, 0, 0.08)`, text `#A0A0A0`, border `rgba(0, 0, 0, 0.08)`

#### Search Input
- **Background:** `transparent`
- **Text Color:** `#000000`
- **Font Size:** `14px`
- **Font Weight:** `450`
- **Font Family:** ui-sans-serif
- **Padding:** `8px 12px 8px 8px`
- **Border Radius:** `0px`
- **Border:** `1px solid transparent` (bottom border only)
- **Box Shadow:** `none`
- **Height:** `34px`
- **Line Height:** `16px`
- **Focus State:** Bottom border `1px solid #3FCF8E`

#### Form Label
- **Font Size:** `14px`
- **Font Weight:** `600`
- **Font Family:** Manrope
- **Color:** `#000000`
- **Line Height:** `20px`
- **Margin Bottom:** `8px`

#### Form Helper Text
- **Font Size:** `12px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Color:** `#808080`
- **Line Height:** `16px`
- **Margin Top:** `4px`

### Navigation

#### Header Navigation
- **Background:** `transparent`
- **Text Color:** `#000000`
- **Font Size:** `16px`
- **Font Weight:** `450`
- **Font Family:** ui-sans-serif
- **Padding:** `0px 0px`
- **Border Radius:** `0px`
- **Border:** `none`
- **Box Shadow:** `none`
- **Height:** `65px`
- **Line Height:** `24px`
- **Link Hover:** Text color `#3FCF8E`
- **Active Link:** Text color `#097C4F`, underline `1px solid #3FCF8E`

#### Link (Inline)
- **Background:** `transparent`
- **Text Color:** `#000000`
- **Font Size:** `12px`
- **Font Weight:** `450`
- **Font Family:** Inter
- **Padding:** `4px 10px`
- **Border Radius:** `6px`
- **Border:** `1px solid rgba(0, 0, 0, 0.146)`
- **Box Shadow:** `none`
- **Height:** `26px`
- **Line Height:** `16px`
- **Hover State:** Background `rgba(61, 207, 142, 0.1)`, text `#3FCF8E`

#### Link (Standard)
- **Background:** `transparent`
- **Text Color:** `#000000`
- **Font Size:** `16px`
- **Font Weight:** `450`
- **Font Family:** ui-sans-serif
- **Padding:** `0px 0px`
- **Border Radius:** `2px`
- **Border:** `none`
- **Box Shadow:** `none`
- **Height:** `24px`
- **Line Height:** `24px`
- **Hover State:** Text color `#3FCF8E`
- **Underline:** On hover, `1px solid #3FCF8E`

### Badge & Status Labels

#### Status Badge (Orange)
- **Background:** `#F3BA63` or `#DC7B18` (for emphasis)
- **Text Color:** `#000000`
- **Font Size:** `11px`
- **Font Weight:** `600`
- **Font Family:** Manrope
- **Padding:** `2px 6px`
- **Border Radius:** `4px`
- **Border:** `none`
- **Height:** `auto`
- **Line Height:** `16px`
- **Usage:** "BETA", "NEW", feature indicators

#### Status Badge (Green)
- **Background:** `#72E3AD`
- **Text Color:** `#000000`
- **Font Size:** `11px`
- **Font Weight:** `600`
- **Font Family:** Manrope
- **Padding:** `2px 6px`
- **Border Radius:** `4px`
- **Border:** `none`
- **Height:** `auto`
- **Line Height:** `16px`
- **Usage:** "LIVE", "AVAILABLE", "GA"

## 5. Layout Principles

### Spacing System

Base unit: **4px**

Spacing scale used throughout the system:
- **4px** – Micro spacing (gap between tight elements, internal padding)
- **8px** – Base compact spacing (button padding, small gaps)
- **12px** – Small spacing (internal component padding)
- **16px** – Standard spacing (margins, gaps between components)
- **20px** – Medium spacing (section margins)
- **24px** – Large padding (card padding, container padding)
- **32px** – Extra-large padding (section padding)
- **40px** – Large section padding
- **48px** – XL section padding
- **64px** – Section separation
- **80px** – Major section margin
- **96px** – Full-width page margin

**Usage Context:**
- **4px, 8px:** Internal component padding, button text padding, tight grouping
- **12px, 16px:** Between related components, form field gaps, standard margins
- **20px, 24px:** Card padding, container internal spacing
- **32px, 40px:** Section internal padding, major grouping
- **48px, 64px, 80px, 96px:** Major section breaks, full-width page layouts

### Grid & Container

- **Max Width:** `1440px` (desktop full-width breakpoint)
- **Container Padding (Desktop):** `40px` on each side
- **Container Padding (Tablet):** `24px` on each side
- **Container Padding (Mobile):** `16px` on each side
- **Column Strategy:** 12-column grid system for flexible layouts
- **Gutter Width:** `16px` between columns
- **Section Pattern:** Full-width background containers with centered content max-width
- **Card Grid:** 3 columns on desktop, 2 on tablet, 1 on mobile with `24px` gap

### Whitespace Philosophy

Supabase's design prioritizes generous whitespace to reduce cognitive load and highlight key content. Sections are clearly separated with substantial vertical spacing (64px–96px minimum). Cards and components have internal padding (24px–32px) that creates breathing room around content. Text blocks maintain line lengths between 50–75 characters for optimal readability. The design avoids cluttered layouts, instead using strategic grouping and hierarchy to guide attention.

### Border Radius Scale

- **0px** – Sharp corners (search inputs, rare uses)
- **2px** – Minimal radius (very subtle rounding, links)
- **3px** – Micro radius (occasionally used in subtle components)
- **4px** – Extra small (badges, status indicators)
- **6px** – Small (buttons, cards, inputs, most UI elements)
- **8px** – Medium (larger cards, containers)
- **16px** – Large (feature cards, modal dialogs)
- **32px** – Extra large (fully rounded buttons)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| **Flat (Level 0)** | `box-shadow: none` | Backgrounds, text-only elements, links |
| **Raised (Level 1)** | `0px 1px 2px 0px rgba(0, 0, 0, 0.05)` | Subtle elevation for distinction |
| **Card (Level 2)** | `0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)` | Standard cards, feature sections |
| **Modal (Level 3)** | `0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)` | Modals, overlays, highest prominence |

**Shadow Philosophy:**
Supabase uses subtle, real-world-inspired shadows that create depth without visual heaviness. Shadows are composed of multiple blur layers to mimic natural light diffusion. Primary shadows use `rgba(0, 0, 0, 0.1)` at moderate blur for soft separation, while secondary shadows at `0.05` opacity add delicate depth. The system avoids harsh, high-contrast shadows, preferring gentle elevation that doesn't distract from content.

### Opacity Levels

- **Disabled** – `0.5` (50% opacity for disabled interactive elements)
- **Hover Overlay** – `0.8` (80% opacity for background overlays on hover)
- **Secondary Text** – `0.7` (70% opacity for muted or secondary text)
- **Subtle Background** – `0.2` (20% opacity for very subtle backgrounds)
- **Border/Divider** – `0.146` (14.6% opacity for subtle borders)
- **Focus Ring** – `0.99` (99% opacity for visible focus states)

### Z-index / Layering

- **Base (Content):** `z-index: auto` or `0` – Standard page content
- **Sticky Header:** `z-index: 100` – Navigation headers, sticky positioning
- **Dropdown:** `z-index: 10` – Dropdown menus, floating elements
- **Dropdown (Elevated):** `z-index: 20` – Secondary dropdowns, higher-priority overlays
- **Dropdown (High):** `z-index: 30` – Tertiary dropdowns, complex overlays
- **Dropdown (Highest):** `z-index: 40` – Top-level dropdowns before modals
- **Modal/Dialog:** `z-index: 50` – Modal overlays, dialogs (implicit from context)
- **Tooltip:** `z-index: 80` – Tooltips above modals

## 7. Do's and Don'ts

### Do
- **Always use the brand green** (`#3FCF8E`) for primary CTAs—it's the strongest visual signal for conversion.
- **Maintain generous padding** in cards and containers (minimum `24px`) to avoid cramped layouts.
- **Use Manrope for all headings** to maintain the technical, modern aesthetic.
- **Apply the full shadow treatment** (Level 2 or 3) to cards and features to create clear elevation.
- **Group related form fields** with `16px` gaps to create clear visual sections.
- **Use monospace** (Source Code Pro) for all code or technical content—never use variable-width fonts for code.
- **Keep focus states visible** with the brand green color or a clear outline; never remove focus indicators.
- **Test all text** against WCAG AA contrast standards; ensure primary text (`#000000`) is readable on all backgrounds.
- **Use the orange accent** (`#DC7B18`) strictly for status labels and secondary features—avoid overuse.
- **Respect the spacing system**—never invent new spacing values; always choose from the documented scale.

### Don't
- **Don't use multiple shades of green** randomly; stick to the defined palette (`#3FCF8E`, `#097C4F`, `#0A844E`, `#16B674`, `#72E3AD`).
- **Don't apply shadows to every element**—use them strategically only for cards, modals, and elevated content.
- **Don't mix font families within a single component**—choose Inter or Manrope and remain consistent.
- **Don't use light gray text** (`#A0A0A0`) on white backgrounds—it fails accessibility; use `#808080` or darker.
- **Don't create custom border radiuses**—only use the documented scale (4px, 6px, 8px, 16px, 32px).
- **Don't disable buttons by reducing opacity alone**—change background color to `#72E3AD` and reduce interactivity.
- **Don't set padding less than `8px`** on interactive elements (buttons, inputs)—minimum touch target is `34px` height.
- **Don't use the orange color** on primary CTAs; it's reserved for secondary features and status badges.
- **Don't stack more than 2 shadows** on a single element—the system defines specific shadow combinations.
- **Don't manually adjust line heights**—always use the documented values from the typography table to maintain rhythm.

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|------------|
| **Mobile** | `320px–639px` | Single column, full-width cards, `16px` padding, touch-friendly `48px` minimum buttons |
| **Tablet** | `640px–1023px` | 2 columns, `24px` padding, simplified navigation, `44px` minimum touch targets |
| **Desktop** | `1024px–1439px` | 3 columns, `40px` padding, full navigation, `38px` buttons acceptable |
| **Large Desktop** | `1440px+` | Max-width container at `1440px`, centered layout, generous margins |

### Touch Targets

- **Minimum Button Height:** `44px` (mobile), `38px` (desktop)
- **Minimum Button Width:** `44px` (square buttons)
- **Minimum Touch Area:** `44px × 44px` across all devices
- **Link/Icon Touch Target:** `40px × 40px` minimum
- **Spacing Between Touch Targets:** `8px` minimum (reduced to `4px` only when necessary)
- **Input Field Height:** `44px` (mobile), `35px` (desktop)
- **Checkbox/Radio Size:** `20px × 20px` touch area

### Collapsing Strategy

- **Navigation:** Desktop horizontal menu → Tablet simplified menu → Mobile hamburger menu at `640px`
- **Card Grids:** 3 columns (desktop 1024px+) → 2 columns (tablet 640px–1023px) → 1 column (mobile <640px)
- **Typography:** Heading sizes scale down by `10%–20%` at tablet and again at mobile; line heights remain consistent
- **Padding:** Container padding reduces from `40px` (desktop) → `24px` (tablet) → `16px` (mobile)
- **Forms:** Multi-column layouts stack to single column at tablet; full-width inputs on mobile
- **Pricing Cards:** Horizontal card rows collapse to vertical stack below `1024px`
- **Feature Sections:** Side-by-side image/text layouts stack vertically at tablet; image on top at mobile
- **Margin/Gap:** Large margins (`80px`, `96px`) reduce to `40px–48px` on tablet; `24px–32px` on mobile

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Brand Green (`#3FCF8E`)
- **Primary CTA Hover:** Brand Green Medium (`#16B674`)
- **Primary CTA Active:** Brand Green Dark (`#097C4F`)
- **Primary CTA Disabled:** Brand Green Light (`#72E3AD`)
- **Background:** Background White (`#FFFFFF`)
- **Text (Primary):** Text Primary (`#000000`)
- **Text (Secondary):** Text Secondary (`#808080`)
- **Text (Disabled):** Text Tertiary (`#A0A0A0`)
- **Border (Standard):** `rgba(0, 0, 0, 0.146)` (approximately `#1F1F1F` at 14.6% opacity)
- **Border (Light):** `rgba(0, 0, 0, 0.081)` (approximately `#1F1F1F` at 8.1% opacity)
- **Status (Orange):** Warm Orange (`#DC7B18`) or Warm Orange Light (`#F3BA63`)
- **Input Background:** `rgba(0, 0, 0, 0.026)` (very light gray overlay)

### Iteration Guide

1. **Always choose button color from the quick reference:**
   - Primary CTAs use `#3FCF8E` with hover state `#16B674`
   - Secondary buttons use transparent background with dark text and subtle border
   - Status/badge buttons use `#DC7B18` for orange or `#000000` for dark inverted

2. **Apply typography by matching role, not size:**
   - Landing page hero headings → Display 1 (46px, weight 500)
   - Section titles → Heading 1 (28px, weight 500) or Heading 2 (28px, weight 600)
   - Feature card titles → Heading 3 (16px, weight 600)
   - Body paragraphs → Body Standard (14px, weight 500) in Inter
   - Form labels → Heading 6 (15px, weight 600) in Manrope
   - Helper text / captions → Caption (12px, weight 450)
   - Code snippets → Code Block (13px, weight 500) in Source Code Pro

3. **Padding follows the spacing system; never invent values:**
   - Buttons: `8px 32px` (primary), `8px 8px` (secondary)
   - Cards: `8px 16px` or `24px 32px` (choose based on card purpose)
   - Containers: `32px` to `64px` internal padding
   - Sections: `64px` to `96px` vertical margin separation

4. **Border radius is always one of:** `0px`, `2px`, `4px`, `6px`, `8px`, `16px`, or `32px`
   - Buttons: `6px` (standard), `32px` (fully rounded primary CTAs)
   - Cards: `6px` (standard), `16px` (large feature cards)
   - Inputs: `6px` (standard), `0px` (search/minimal inputs)
   - Badges: `4px`

5. **Shadows follow the documented levels; copy-paste exact values:**
   - No shadow → `box-shadow: none`
   - Subtle → `0px 1px 2px 0px rgba(0, 0, 0, 0.05)`
   - Standard card → `0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)`
   - Modal → `0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)`

6. **Borders on interactive elements are always 1px; color from the border scale:**
   - Standard border: `1px solid rgba(0, 0, 0, 0.146)` (inputs, cards)
   - Button border: `1px solid #000000` (primary buttons) or `1px solid rgba(0, 0, 0, 0.146)` (secondary)
   - Focus state: `2px solid #3FCF8E` (replace standard border with brand green)

7. **Mobile-first responsive approach:**
   - Start at `320px` with single-column layouts, touch-friendly `44px` heights
   - Scale up typography by `10–20%` at tablet (`640px`) and desktop (`1024px`)
   - Increase padding from `16px` (mobile) → `24px` (tablet) → `40px` (desktop)
   - Convert grids from 1 column → 2 columns (640px) → 3 columns (1024px)

8. **Opacity values for interactive states:**
   - Hover overlay: `0.8`
   - Disabled state: `0.5`
   - Secondary/muted text: `0.7`
   - Subtle background: `0.2`
   - Borders: `0.146` (14.6%)

9. **Z-index layering (in ascending order):**
   - Content: `auto` or `0`
   - Sticky header: `100`
   - Dropdown/floating: `10`, `20`, `30`, `40` (increasing priority)
   - Modal: `50`
   - Tooltip: `80`

10. **Always test for WCAG AA contrast; primary text on white backgrounds requires min ratio of 4.5:1:**
    - `#000000` on `#FFFFFF` → Ratio 21:1 ✓ (use this)
    - `#808080` on `#FFFFFF` → Ratio ~4.5:1 ✓ (acceptable for secondary text)
    - `#A0A0A0` on `#FFFFFF` → Ratio ~2.5:1 ✗ (use only for disabled/very subtle text)
    - All brand green CTAs must have black text for legibility