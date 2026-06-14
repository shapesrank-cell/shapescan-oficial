---
name: Colibri
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#434843'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#737873'
  outline-variant: '#c3c8c2'
  surface-tint: '#4f6356'
  primary: '#4f6356'
  on-primary: '#ffffff'
  primary-container: '#d1e7d6'
  on-primary-container: '#55685b'
  inverse-primary: '#b6ccbb'
  secondary: '#5e5f5b'
  on-secondary: '#ffffff'
  secondary-container: '#e3e3de'
  on-secondary-container: '#646561'
  tertiary: '#4b6453'
  on-tertiary: '#ffffff'
  tertiary-container: '#cce8d3'
  on-tertiary-container: '#516958'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e8d7'
  primary-fixed-dim: '#b6ccbb'
  on-primary-fixed: '#0d1f15'
  on-primary-fixed-variant: '#384b3f'
  secondary-fixed: '#e3e3de'
  secondary-fixed-dim: '#c7c7c2'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#464744'
  tertiary-fixed: '#cee9d4'
  tertiary-fixed-dim: '#b2cdb9'
  on-tertiary-fixed: '#082013'
  on-tertiary-fixed-variant: '#344c3d'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.02em
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 24px
  container-padding-desktop: 64px
  stack-gap-sm: 12px
  stack-gap-md: 24px
  stack-gap-lg: 48px
---

## Brand & Style

The design system is centered on **Serenity, Cognitive Ease, and Professional Gentleness**. Designed specifically for individuals with ADHD, it prioritizes a reduction in visual noise to prevent sensory overload. The brand personality is that of a supportive, quiet companion—reliable and organized without being demanding.

The design style is **Hyper-Minimalist with Soft Organicism**. It draws from Japanese minimalism and soft-UI principles, utilizing vast amounts of whitespace, a limited "breathable" color palette, and extremely generous rounded corners. Every interaction is designed to feel "light" and effortless, fostering a sense of security and mental clarity.

## Colors

The palette is intentionally low-contrast and monochromatic to reduce visual stress. 

- **Primary (#D1E7D6):** A soft, desaturated green used for active states, primary actions, and "success" indicators. It represents growth and tranquility.
- **Secondary / Background (#F9F8F3):** A warm cream-white that serves as the canvas for the entire application, replacing harsh pure whites to reduce eye strain.
- **Tertiary (#A8C3AF):** A deeper sage used sparingly for borders or subtle emphasis where the primary green is too light.
- **Neutral (#4A4A4A):** A soft charcoal used for text. Pure black is avoided to keep the interface gentle.

Backgrounds should primarily use the soft cream, with slight variations in light gray (#F2F2F2) to differentiate stacked layers.

## Typography

Typography is the cornerstone of accessibility in this design system. 

We utilize **Plus Jakarta Sans** for headlines to provide a modern, friendly, and soft geometric feel. For all body text and UI labels, we use **Atkinson Hyperlegible Next**, specifically engineered for high legibility and character differentiation, which is crucial for neurodivergent users.

**Key Rules:**
- **Generous Spacing:** Increased line-height (1.5x - 1.6x) and letter-spacing (0.02em) are applied to body text to prevent "crowding" of words.
- **Scale:** Font sizes are slightly larger than industry standard to ensure effortless reading.
- **Hierarchy:** Use font weight and size rather than color contrast to establish hierarchy.

## Layout & Spacing

This design system employs a **Fluid-Fixed Hybrid** layout. Content resides in a centered, max-width container (typically 800px for focus-heavy tasks) to prevent horizontal eye-strain on wide monitors.

- **The "Breathe" Principle:** Margins and paddings are intentionally oversized. Use `stack-gap-lg` between major sections to provide visual "islands" of information.
- **Grid:** A simple 8px soft-grid system. Most components should use `24px` (md) as a default internal padding.
- **Mobile Reflow:** On mobile, margins remain wide (24px) to ensure the thumb has a clear, non-interactive "safe zone" to rest on without accidental triggers.

## Elevation & Depth

Depth is communicated through **Tonal Layering** and **Soft Ambient Shadows** rather than stark borders or heavy shadows.

- **Surface Levels:** 
  - Level 0 (Base): Cream-white background (#F9F8F3).
  - Level 1 (Card): Pure white (#FFFFFF) with a very soft, high-diffusion shadow (Color: #D1E7D6 at 20% opacity, Blur: 40px, Offset-Y: 10px).
- **Interactions:** When an item is pressed, it should "sink" slightly (scale down to 0.98 and shadow reduction) to provide tactile, haptic-like visual feedback.
- **No Borders:** Avoid solid borders. Use subtle changes in background tint to define areas.

## Shapes

The shape language is **Ultra-Rounded**. There are no sharp corners in this design system.

- **Standard Elements:** Buttons, input fields, and cards use a minimum of `24px` (rounded-lg) to `32px` (rounded-xl) corner radii.
- **Containers:** Large page sections or modals should use `40px` or greater to feel like soft "pebbles" or "clouds."
- **Pill Shapes:** Always use full pill-radius for tags, chips, and primary CTA buttons to maximize the "soft" aesthetic.

## Components

### Buttons
Primary buttons are pill-shaped, using the Primary Green (#D1E7D6) with the Neutral Charcoal text. They do not use gradients. Hover states are a subtle darkening of the green; active states involve a slight scale-down.

### Cards
Cards are the primary way to group information. They must have a white background, no border, and the soft ambient shadow defined in Elevation. Internal padding is never less than 24px.

### Input Fields
Inputs are large, pill-shaped or heavily rounded rectangles with a soft light-gray background (#F2F2F2). The focus state is indicated by a 2px Primary Green outer glow, never a sharp high-contrast border.

### Progress Indicators
Consistent with the ADHD focus, progress bars should be thick (12px+) and use rounded caps. They should animate smoothly to avoid jarring "jumpy" movements.

### Interaction Cues
Use "Colibri Icons"—thick-stroke, rounded-end icons that match the Neutral Charcoal color. All icons should be enclosed in a circular or soft-square tinted background to signify touch targets.