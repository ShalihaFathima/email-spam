# 🎨 Interactive Focus Mode - Quick Reference

## 🚀 Getting Started

### The New UI Experience
```
[Grid of Interactive Cards]
        ↓ (click any card)
    [Focus Mode Modal Appears]
        ↓
    [Full Visualization]
        ↓ (press ESC or click X)
    [Back to Grid]
```

---

## 📱 UI Components

### StepCard
Interactive card in the grid that expands on click.

**Features:**
- Glassmorphic background
- Icon + Title + Description
- Mini stats display
- Hover animation (scale, elevation)
- Active state indicator

**Triggered by:** User clicks the card

---

### FocusView
Full-screen modal showing detailed visualization.

**Features:**
- Centered modal with backdrop blur
- Large header with icon and title
- Full visualization content
- Close button (X)
- ESC key support
- Scrollable content

**Usage:**
- Opens when user clicks a step card
- Shows full visualization for that step
- Closes on ESC or clicking X

---

### Overlay
Dark semi-transparent background behind FocusView.

**Features:**
- Blur effect on background
- Prevents interaction with main UI
- Clickable to close (optional)

**Purpose:** Focus user attention on modal

---

## 🎨 Customization Guide

### Change Accent Color
Replace all instances of `#d4af37` (gold) with your color:

**Files to update:**
- `StepCard.css`
- `FocusView.css`
- `Overlay.css`
- `EmailAnalysisPanel.css`

**Example:** Change to teal
```css
/* Find: #d4af37 or #D4AF37 */
/* Replace: #00d9d9 */
```

---

### Adjust Animation Speed
Modify `transition` or `duration` values:

```javascript
// In components, find:
transition={{ duration: 0.4 }}

// Change to:
transition={{ duration: 0.2 }}  // Faster
transition={{ duration: 0.8 }}  // Slower
```

---

### Customize Grid Layout
Modify grid columns in `EmailAnalysisPanel.css`:

```css
.analysis-steps-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  /* Change 280px to adjust card width */
  /* Change number of columns here */
}

/* Suggestions:
   2 columns: minmax(350px, 1fr)
   4 columns: minmax(200px, 1fr)
   1 column:  1fr
*/
```

---

### Change Blur Amount
Modify `backdrop-filter` values:

```css
/* Example: More blur */
backdrop-filter: blur(30px);  /* Default: blur(20px) */

/* Example: Less blur */
backdrop-filter: blur(5px);
```

---

### Adjust Border Radius
Make cards more/less rounded:

```css
/* StepCard.css */
border-radius: 16px;  /* Current: 16px */
border-radius: 24px;  /* More rounded */
border-radius: 8px;   /* Less rounded */

/* FocusView.css */
border-radius: 24px;  /* Current: 24px */
```

---

## 🎬 Animation Properties

### StepCard Animations
```javascript
whileHover={{ scale: 1.02, y: -4 }}
whileTap={{ scale: 0.98 }}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay: stepNumber * 0.1 }}
```

### FocusView Animations
```javascript
initial={{ opacity: 0, scale: 0.9, y: 50 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ duration: 0.4, ease: 'easeOut' }}
```

---

## 🔧 Code Examples

### Add More Stats to Card
In `EmailAnalysisPanel.js`, modify `getStepConfig()`:

```javascript
{
  icon: '🔍',
  title: 'Bloom Filter',
  description: 'Probabilistic check',
  stats: [
    { label: 'Size', value: '1024 bits' },
    { label: 'Keywords', value: '113' },
    { label: 'New Stat', value: 'New Value' }  // Add here
  ]
}
```

---

### Change Step Card Colors
In `StepCard.css`:

```css
.step-card {
  background: linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgb(20, 20, 25, 0.9) 100%);
  /* Modify the rgba() values to change card colors */
}

.step-card:hover {
  background: linear-gradient(135deg, rgba(35, 35, 40, 0.85) 0%, rgba(25, 25, 30, 0.95) 100%);
}
```

---

### Create Custom Close Behavior
In `FocusView.jsx`, modify:

```javascript
const handleKeyPress = (e) => {
  if (e.key === 'Escape') {
    onClose();
  }
  // Add custom keys:
  if (e.key === 'Enter') {
    // Go to next step
  }
};
```

---

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ESC | Close focus mode / Return to grid |
| Click card | Open focus mode for that card |
| Click X | Close focus mode |
| Click overlay | Close focus mode |

---

## 📊 Responsive Behavior

### Desktop (> 1024px)
- Grid: 3+ columns
- Card width: 280px+
- Full animations enabled
- Smooth scrolling

### Tablet (768px - 1024px)
- Grid: 2-3 columns
- Card width: 240px+
- Animations reduced slightly
- Touch-friendly sizing

### Mobile (< 768px)
- Grid: 2 columns
- Card width: 200px+
- Optimized touch targets
- Full-height modals

### Very Mobile (< 480px)
- Grid: 1 column
- Full-width cards
- Stacked layout
- Maximum readability

---

## 🐛 Troubleshooting

### Cards not visible?
- Check if `analysis-steps-grid` has overflow
- Verify grid CSS is applied
- Check z-index values (should be > 1)

### Animations stuttering?
- Verify Framer Motion installed: `npm list framer-motion`
- Check GPU acceleration in CSS
- Reduce animation complexity if needed

### Focus view not appearing?
- Check `focusedStep` state is updating
- Verify `AnimatePresence` wraps FocusView
- Check z-index values

### Overlay not showing?
- Verify `Overlay` component is rendered
- Check z-index (should be 998, FocusView 1000)
- Check overlay CSS backdrop-filter support

---

## ✨ Tips & Tricks

### Pro Tip 1: Gradient Overlays
Add gradient overlays to cards for more depth:

```css
.step-card::after {
  background: radial-gradient(circle at top right, rgba(212, 175, 55, 0.15), transparent);
}
```

### Pro Tip 2: Parallax Effects
Add parallax scrolling to grid:

```javascript
const [scrollY, setScrollY] = useState(0);
// Use scrollY to offset cards
```

### Pro Tip 3: Accessibility
Ensure keyboard navigation works:

```javascript
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    onExpand();
  }
}}
```

### Pro Tip 4: Dark Mode Alternative
Create light theme variant:

```css
/* Light theme */
--bg-primary: #ffffff;
--bg-card: rgba(240, 240, 245, 0.8);
--accent: #4a90e2;
```

---

## 📈 Performance Tips

1. **Lazy Load Content**: Load visualizations only when needed
2. **Optimize Images**: Ensure all icons are SVGs or small PNGs
3. **Debounce Scroll**: Limit scroll event listener frequency
4. **GPU Acceleration**: Use transform & opacity for animations
5. **CSS Containment**: Use `contain: layout` for perfomance

---

## 🚀 Deployment Checklist

- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test on tablet (iPad, Android)
- [ ] Test on mobile (iPhone, Android phone)
- [ ] Verify all animations work
- [ ] Check color contrast for accessibility
- [ ] Test keyboard navigation (ESC key)
- [ ] Verify touch interactions work
- [ ] Check performance (DevTools)
- [ ] Test with different data sizes
- [ ] Cross-browser compatibility

---

## 📚 Resources

- **Framer Motion Docs**: https://www.framer.com/motion/
- **CSS Grid Guide**: https://css-tricks.com/snippets/css/complete-guide-grid/
- **Backdrop Filter Support**: https://caniuse.com/css-backdrop-filter
- **Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Happy Customizing! 🎨**
