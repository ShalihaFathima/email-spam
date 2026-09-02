# 🎯 Interactive Focus Mode Architecture

## Component Hierarchy

```
EmailAnalysisPanel (Main Container)
    ├─ Overlay (Dark blur background)
    │   └─ Semi-transparent backdrop
    │
    ├─ EmailAnalysisPanel.js (Main Panel)
    │   ├─ Header
    │   │   └─ Title + Close button
    │   │
    │   └─ analysis-steps-grid (CSS Grid Layout)
    │       ├─ StepCard 1 (Tokenization)
    │       ├─ StepCard 2 (Bloom Filter)
    │       ├─ StepCard 3 (Hash Table)
    │       ├─ StepCard 4 (Trie)
    │       ├─ StepCard 5 (Scoring)
    │       └─ StepCard 6 (Final Decision)
    │
    └─ FocusView (Modal - Appears on Click)
        ├─ Overlay (Dim background)
        ├─ FocusView Modal
        │   ├─ Header
        │   │   ├─ Icon
        │   │   ├─ Title
        │   │   └─ Close button
        │   │
        │   └─ focus-content
        │       └─ Full Visualization
        │           ├─ BloomFilterVisualizer
        │           ├─ TrieVisualizer
        │           ├─ HashTableVisualizer
        │           ├─ TokenViewer
        │           ├─ ScoreVisualizer
        │           └─ FinalDecisionViewer
```

---

## State Flow

```
User Opens Email Analysis
        ↓
[EmailAnalysisPanel Opens]
  focusedStep = null
        ↓
[Display Step Cards Grid]
  Show all 6 steps
        ↓
User Clicks Step Card
        ↓
setFocusedStep(stepNumber)
        ↓
[Overlay Appears]
[FocusView Modal Appears]
[Visualization Renders]
        ↓
User Presses ESC / Clicks X / Clicks Overlay
        ↓
setFocusedStep(null)
        ↓
[Overlay Closes]
[FocusView Closes]
[Back to Grid with focusedStep = null]
```

---

## Z-Index Layer Stack

```
Z-Index Hierarchy:
  1000  │ FocusView Modal (highest)
        │ ├─ Header
        │ ├─ Content
        │ └─ Close button
        │
   999  │ Overlay (dim background)
        │ └─ Backdrop blur
        │
  1000  │ EmailAnalysisPanel
        │ ├─ Header
        │ ├─ Step Cards Grid
        │ └─ Content area
        │
    0   │ Background (page)
        └
```

---

## CSS Grid Layout Theory

### Default (Desktop)
```
┌─────────────┬─────────────┬─────────────┐
│  Card 1     │  Card 2     │  Card 3     │
├─────────────┼─────────────┼─────────────┤
│  Card 4     │  Card 5     │  Card 6     │
└─────────────┴─────────────┴─────────────┘

grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))
gap: 20px
```

### Tablet
```
┌─────────────────┬─────────────────┐
│  Card 1         │  Card 2         │
├─────────────────┼─────────────────┤
│  Card 3         │  Card 4         │
├─────────────────┼─────────────────┤
│  Card 5         │  Card 6         │
└─────────────────┴─────────────────┘

grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))
gap: 16px
```

### Mobile
```
┌──────────────────┐
│  Card 1          │
├──────────────────┤
│  Card 2          │
├──────────────────┤
│  Card 3          │
├──────────────────┤
│  Card 4          │
├──────────────────┤
│  Card 5          │
├──────────────────┤
│  Card 6          │
└──────────────────┘

grid-template-columns: 1fr
gap: 12px
```

---

## Animation Timing Diagram

### StepCard Entrance (Staggered)
```
Card 1  ▓▓▓▓▓▓▓▓                 (delay: 0 * 0.1 = 0s)
Card 2     ▓▓▓▓▓▓▓▓              (delay: 1 * 0.1 = 0.1s)
Card 3        ▓▓▓▓▓▓▓▓           (delay: 2 * 0.1 = 0.2s)
Card 4           ▓▓▓▓▓▓▓▓        (delay: 3 * 0.1 = 0.3s)
Card 5              ▓▓▓▓▓▓▓▓     (delay: 4 * 0.1 = 0.4s)
Card 6                 ▓▓▓▓▓▓▓▓  (delay: 5 * 0.1 = 0.5s)

Each card duration: 0.4s
Total sequence: 0.9s
```

### Card Hover Animation
```
Scale:  1.00 → 1.02 → 1.00  (delta: 0.02)
Y Pos:  0    → -4px  → 0    (elevation effect)
Time:   0.3s (smooth ease-out)

Shadow opacity increases for depth
```

### FocusView Entrance
```
Opacity: 0 → 1       (fade in 0.4s)
Scale:   0.9 → 1     (zoom out 0.4s)
Y Pos:   50px → 0    (slide up 0.4s)

All simultaneous (parallel animations)
```

---

## Data Flow: Step Expansion

```
User clicks StepCard
         ↓
onClick handler: onExpand()
         ↓
setFocusedStep(stepNumber)
         ↓
State updates: focusedStep = 2 (example)
         ↓
Component re-renders
         ↓
AnimatePresence detects focusedStep !== null
         ↓
Renders Overlay + FocusView (mount animations)
         ↓
conditionally renderFocusedContent()
         ↓
Displays correct visualization
         ↓
User presses ESC or clicks X
         ↓
setFocusedStep(null)
         ↓
AnimatePresence detects focusedStep === null
         ↓
Unmounts Overlay + FocusView (exit animations)
```

---

## CSS Class Naming Convention

```
Component Hierarchy in CSS:

.step-card              (Main container)
├── .card-glow          (Glow effect)
├── .card-header        (Top section)
│   ├── .card-icon      (Icon element)
│   └── .card-title-section
│       ├── .card-title
│       └── .card-description
├── .card-stats         (Mini stats)
│   └── .stat-mini      (Individual stat)
└── .card-footer        (Bottom section)
    └── .expand-hint    (Hint text)

.focus-view             (Main modal)
├── .focus-header       (Top bar)
│   ├── .focus-title-section
│   ├── .focus-icon
│   ├── .focus-title
│   └── .focus-close-btn
├── .focus-content      (Scrollable area)
│   └── .focus-body     (Content wrapper)
└── .focus-hint         (Bottom hint)

.overlay                (Background)
```

---

## Framer Motion Components Usage

### StepCard Motion Wrapper
```javascript
<motion.div
  className="step-card"
  onClick={onExpand}
  whileHover={{ scale: 1.02, y: -4 }}     // Hover state
  whileTap={{ scale: 0.98 }}               // Click state
  initial={{ opacity: 0, y: 20 }}          // Entry state
  animate={{ opacity: 1, y: 0 }}           // Animated to
  transition={{ 
    duration: 0.4, 
    delay: stepNumber * 0.1  // Stagger effect
  }}
>
  {/* Content */}
</motion.div>
```

### FocusView Motion Wrapper
```javascript
<motion.div
  className="focus-view"
  variants={containerVariants}  // Predefined animation sets
  initial="hidden"               // Start state
  animate="visible"              // End state
  exit="exit"                    // Exit state
>
  {/* Content */}
</motion.div>
```

### AnimatePresence (Mount/Unmount)
```javascript
<AnimatePresence>
  {focusedStep && (
    <>
      <Overlay />
      <FocusView />
    </>
  )}
</AnimatePresence>
```

---

## Glassmorphism Effect Breakdown

### CSS Components
```css
/* 1. Background Gradient */
background: linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(10,10,15,0.98) 100%);

/* 2. Backdrop Blur */
backdrop-filter: blur(20px);

/* 3. Border with Gradient */
border: 1px solid rgba(212, 175, 55, 0.2);

/* 4. Inset Light */
box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);

/* 5. Outer Glow */
box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.1);

/* 6. Top Edge Highlight */
::before {
  content: '';
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent);
  height: 1px;
}
```

---

## Responsive Breakpoint System

```javascript
// Mobile First Approach:

// Base (Mobile < 480px)
.step-card { min-height: 160px; }
.analysis-steps-grid { grid-template-columns: 1fr; }

// Small Mobile (480px - 768px)
@media (min-width: 480px) {
  .analysis-steps-grid { 
    grid-template-columns: repeat(2, 1fr); 
  }
}

// Tablet (768px - 1024px)
@media (min-width: 768px) {
  .analysis-steps-grid { 
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
  }
}

// Desktop (1024px+)
@media (min-width: 1024px) {
  .analysis-steps-grid { 
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
  }
}
```

---

## Performance Considerations

### GPU Acceleration
```css
/* Use these for animations (GPU accelerated) */
transform: translateY(-4px) scale(1.02);  ✅ Fast
opacity: 0;                                ✅ Fast

/* Avoid these in animations (CPU rendered) */
top: -4px;                                 ❌ Slow
background: #newcolor;                    ❌ Slow
border: 1px solid;                        ❌ Slow
```

### Animation Best Practices
```javascript
// ✅ Good: Use Framer Motion for complex animations
<motion.div animate={{ scale: 1.02 }} />

// ✅ Good: Use CSS transitions for simple properties
transition: all 0.3s ease;

// ❌ Bad: Animate layout properties
animate={{ width: 500px }}

// ❌ Bad: Too many simultaneous animations
```

---

## Accessibility Features

### Keyboard Navigation
- ESC key to close focus mode
- Tab to navigate through cards (native browser)
- Focus states with visible indicators

### Screen Reader Support
- Semantic HTML structure
- ARIA labels on buttons
- Descriptive text for icons

### Color Contrast
- Text contrast ratio: 7:1+ (AAA compliant)
- Important info not color-only
- High contrast borders

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Backdrop Filter | ✅ | ⚠️ | ✅ | ✅ |
| CSS Gradients | ✅ | ✅ | ✅ | ✅ |
| Framer Motion | ✅ | ✅ | ✅ | ✅ |
| Box Shadows | ✅ | ✅ | ✅ | ✅ |

⚠️ = Limited support (fallback needed)

---

**This architecture ensures a smooth, performant, and visually impressive user experience!**
