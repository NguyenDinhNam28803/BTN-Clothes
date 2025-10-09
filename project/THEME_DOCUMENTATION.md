# BTN Clothes - Luxury Minimalism Theme Documentation

This document outlines the new design system for BTN Clothes based on the Luxury Minimalism theme concept.

## 1. Color Palette

### Primary Colors
- **Olive Gold** (#C9B27C) - Main brand color, used for primary buttons and accents
- **Deep Navy** (#1F2937) - Used for text and dark elements

### Background Colors
- **Off White** (#FAF9F6) - Main background color
- **Soft Beige** (#F5F2EB) - Secondary background color for cards and panels

### Accent Colors
- **Muted Rust** (#A85144) - For sale items and warnings
- **Sage Green** (#8A9A5B) - For new items and success indicators

### Text Colors
- Primarily Deep Navy for headings and dark text
- Gray scale for body text and less important elements

## 2. Typography

### Font Families
- **Display/Logo Font:** 'Playfair Display', serif
- **Body Font:** 'Montserrat', sans-serif 
- **Accent Font:** 'Cormorant Garamond', serif (for prices and quotes)

### Text Styles
- Headings use Playfair Display with wider tracking
- Body text uses Montserrat with comfortable line height (1.6)
- Navigation and buttons use uppercase with wider tracking
- Price information uses Cormorant Garamond for an elegant touch

## 3. Components

### Buttons
```jsx
// Primary Button
<button className="bg-olive-gold text-white font-medium text-sm uppercase tracking-wider py-3 px-8 rounded-none hover:bg-olive-gold/90 transition-all">
  Shop Now
</button>

// Secondary Button
<button className="border border-olive-gold text-olive-gold font-medium text-sm uppercase tracking-wider py-3 px-8 rounded-none hover:bg-olive-gold/10 transition-all">
  Learn More
</button>
```

### Cards
```jsx
<div className="bg-soft-beige rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
  {/* Card content */}
</div>
```

### Sections
```jsx
<section className="py-24 px-6">
  {/* Section content */}
</section>
```

## 4. Animation & Interactions

Custom animations and effects can be found in `src/styles/luxury.css`:

- `luxury-fade-in` - Elegant fade in animation
- `luxury-hover` - Smooth hover transitions
- `luxury-parallax` - Subtle parallax effect on hover
- `btn-luxury` - Button hover animation
- `luxury-card` - 3D card hover effect

## 5. Design Principles

1. **Whitespace** - Generous spacing between elements creates a sense of luxury
2. **Typography Contrast** - Mix of serif and sans-serif creates visual interest
3. **Subtle Animation** - Refined, purposeful animations enhance the experience
4. **Muted Colors** - Sophisticated palette that feels timeless and elegant
5. **Consistent Elements** - Maintain the same rounded corners, spacing, and interaction patterns

## 6. Tailwind Configuration

The theme extends the default Tailwind configuration with custom colors, fonts, and container settings:

```js
theme: {
  extend: {
    colors: {
      'olive-gold': '#C9B27C',
      'deep-navy': '#1F2937',
      'off-white': '#FAF9F6',
      'soft-beige': '#F5F2EB',
      'muted-rust': '#A85144',
      'sage-green': '#8A9A5B',
    },
    fontFamily: {
      'display': ['Playfair Display', 'serif'],
      'sans': ['Montserrat', 'sans-serif'],
      'serif': ['Cormorant Garamond', 'serif'],
    },
    // Additional configuration
  }
}
```

## 7. Background Styles

Various luxury background patterns and styles are available to create depth and visual interest:

### Pattern Classes
- **bg-luxury-pattern** - Subtle gold crosses pattern on off-white background
- **bg-luxury-dots** - Elegant dotted pattern
- **bg-luxury-lines** - Diagonal line pattern
- **bg-luxury-marble** - Subtle marble texture
- **bg-luxury-gradient** - Smooth gradient from off-white to soft-beige
- **bg-luxury-section** - Section with subtle wave pattern overlay

### Usage
```jsx
<section className="bg-luxury-pattern">
  {/* Content */}
</section>

<div className="bg-luxury-dots py-16">
  {/* Content with dotted background */}
</div>
```

## 8. Responsive Design

The luxury minimalist design adapts across different screen sizes:
- On mobile, elements stack with increased vertical spacing
- Typography scales down proportionally on smaller screens
- Padding and margins adapt for touch interfaces
- Background patterns scale appropriately for different viewport sizes

---

This theme system was designed to elevate BTN Clothes' visual identity while maintaining excellent user experience and conversion optimization.