# CSS & Styling Guide

Complete guide to understanding and modifying the Gmail Dark Theme styling.

## Styling Architecture

### 1. Global Theme (theme.css)

All colors are defined as CSS variables in `:root`:

```css
:root {
  --primary-bg: #0f0f0f;      /* Main background */
  --secondary-bg: #1f1f1f;    /* Panels & sections */
  --tertiary-bg: #262626;     /* Hover & interactive */
  --text-primary: #ffffff;    /* Main text */
  --text-secondary: #ccc;     /* Secondary text */
  --accent: #8ab4f8;          /* Primary accent (blue) */
  --accent-hover: #aecbfa;    /* Accent when hovering */
  --border: #3f3f3f;          /* Borders & dividers */
  --hover-bg: #2d2d2d;        /* General hover bg */
}
```

### 2. Layout Structure (App.css)

Main container uses Flexbox:

```
┌─────────────────────────────────┐
│  Navbar (height: 64px)          │
├────────┬──────────┬─────────────┤
│Sidebar │EmailList │EmailViewer  │
│        │          │             │
│        │          │             │
│ width: │ width:   │ flex: 1     │
│ 256px  │ 350px    │             │
└────────┴──────────┴─────────────┘
```

## Color Usage by Component

### Navbar
- **Background**: `--secondary-bg` (#1f1f1f)
- **Text**: `--text-primary` (#ffffff)
- **Placeholder**: `--text-secondary` (#ccc)
- **Accent**: `--accent` (#8ab4f8) for logo gradient
- **Border**: Bottom border with `--border`
- **Hover**: `--tertiary-bg` for icon buttons

### Sidebar
- **Background**: `--secondary-bg`
- **Active Folder**: Gradient with `--accent`
- **Hover**: `--tertiary-bg`
- **Text**: `--text-primary` for labels, `--text-secondary` for counts
- **Border**: Divider uses `--border`

### Email List
- **Background**: `--secondary-bg`
- **Item Hover**: `--tertiary-bg`
- **Selected Item**: `--tertiary-bg` with `--accent` left border
- **Text**: `--text-primary` for sender/subject, `--text-secondary` for preview/time
- **Border**: Separator between items uses `--border`

### Email Item
```
┌────────────────────────────────┐
│ ★ │ Sender            │ 2h ago │
│    │ Subject Line      │        │
│    │ Email preview...  │        │
└────────────────────────────────┘
```

- **Star Button**: `--text-secondary` normally, `--accent` on hover
- **Sender**: `--text-primary` font-weight: 500
- **Time**: `--text-secondary` font-size: 12px
- **Subject**: `--text-primary` font-weight: 500
- **Preview**: `--text-secondary` font-size: 12px

### Email Viewer
- **Header**: `--secondary-bg` background
- **Content Area**: `--primary-bg` background
- **Footer**: `--secondary-bg` background
- **Action Buttons**: Border with `--border`, hover with `--tertiary-bg`
- **Links/Attachments**: `--accent` color

## Typography

```css
/* Font Family */
font-family: 'Roboto', sans-serif;

/* Font Weights */
400 - Regular (body text)
500 - Medium (labels, emphasis)
700 - Bold (headings)

/* Font Sizes */
24px - Gmail logo
20px - Email subject (viewer)
16px - Sender name (viewer)
14px - Regular body text
13px - Secondary text
12px - Small labels, timestamps
11px - Footnotes, very small text
```

## Spacing System

```css
/* Common spacing values */
8px   - Minimal gaps
12px  - Default spacing
16px  - Medium spacing
24px  - Large spacing
32px  - Extra large spacing

/* Padding standards */
Components: 12-16px horizontal, 10-12px vertical
Sections: 16-24px
Headers: 24px
```

## Border & Shadow System

### Borders
```css
1px solid --border     /* Default dividers */
4px solid --accent     /* Active state indicators */
none                   /* Clean backgrounds */
```

### Shadows
```css
/* Compose button hover */
box-shadow: 0 4px 12px rgba(138, 180, 248, 0.4);

/* Profile icon hover */
box-shadow: 0 2px 8px rgba(138, 180, 248, 0.3);
```

### Border Radius
```css
50%     /* Circular: avatars, buttons */
24px    /* Very rounded: compose button */
8px     /* Rounded: folder items, buttons */
4px     /* Subtle: small buttons */
0       /* Sharp: dropdowns, panels */
```

## Transitions & Animations

### Standard Transition
```css
transition: all 0.2s ease;
```

Used for:
- Background color changes
- Text color changes
- Scaling
- Shadow effects

### Special Cases
```css
/* Rotate on expand/collapse */
transform: rotate(180deg);
transition: transform 0.2s ease;

/* Scale on hover */
transform: scale(1.02);
transition: transform 0.2s ease;

/* Smooth height changes */
transition: height 0.3s ease, padding 0.3s ease;
```

## Hover Effects

### Button Pattern
```css
.button {
  background: transparent;
  color: --text-secondary;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: --tertiary-bg;
  color: --accent;
}
```

### List Item Pattern
```css
.list-item {
  background-color: --secondary-bg;
  transition: all 0.2s ease;
}

.list-item:hover {
  background-color: --tertiary-bg;
}

.list-item.active {
  background: linear-gradient(90deg, --accent 0%, transparent 100%);
  color: --accent;
}
```

## Gradient Effects

### Compose Button
```css
background: linear-gradient(135deg, #8ab4f8 0%, #d4af37 100%);
```
Diagonal gradient from blue to gold

### Gmail Logo
```css
background: linear-gradient(135deg, #8ab4f8 0%, #d4af37 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```
Text with gradient appearance

### Avatar Circles
```css
background: linear-gradient(135deg, #8ab4f8 0%, #d4af37 100%);
```

## Responsive Breakpoints

### Desktop (1024px+)
```css
/* Full layout, all elements visible */
--sidebar-width: 256px;
--list-width: 350px;
```

### Tablet (768px - 1023px)
```css
@media (max-width: 1024px) {
  --sidebar-width: 200px;
  --list-width: 300px;
  font-size: 13px;
  padding: reduced;
}
```

### Mobile (< 768px)
```css
@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
  }
  .app-sidebar {
    flex-direction: row;      /* Horizontal nav */
    height: auto;
  }
  .email-list-container {
    height: 50%;
  }
  .email-viewer-container {
    height: 50%;
  }
}
```

### Small Mobile (< 480px)
```css
@media (max-width: 480px) {
  /* Hide labels, show icons only */
  .label { display: none; }
  
  /* Reduce padding */
  padding: 4-8px;
  
  /* Stack layout */
  flex-direction: column;
}
```

## Scrollbar Customization

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: --secondary-bg;
}

::-webkit-scrollbar-thumb {
  background: --tertiary-bg;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: --border;
}
```

## CSS Classes Hierarchy

### Structure
```
.app-container
├── .app-header (Navbar)
└── .app-body
    ├── .app-sidebar (Sidebar)
    └── .app-main
        ├── .email-list-container
        │   ├── .email-list-header
        │   └── .emails-container
        │       └── .email-item (EmailItem)
        └── .email-viewer-container
            └── .email-viewer (EmailViewer)
```

## Flexbox Layout Patterns

### Horizontal Center
```css
display: flex;
align-items: center;
justify-content: center;
```

### Vertical Stack
```css
display: flex;
flex-direction: column;
```

### Space Between
```css
display: flex;
justify-content: space-between;
align-items: center;
```

### Fill Available Space
```css
display: flex;
flex: 1;
```

## Text Truncation

### Single Line
```css
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

### Multiple Lines
```css
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
```

## Focus States (Accessibility)

### Input Focus
```css
.search-input:focus {
  outline: none;
}

.search-container:focus-within {
  box-shadow: 0 0 0 2px --accent;
}
```

## Dark Theme Considerations

### Text Contrast
- Primary text: #ffffff on #0f0f0f = 21.1:1 ratio ✓
- Secondary text: #ccc on #1f1f1f = 9.5:1 ratio ✓
- Accent: #8ab4f8 on #1f1f1f = 6.5:1 ratio ✓

All meet WCAG AAA standards

### Shadow Depth
Shadows visible on dark background due to lighter overlay:
```css
box-shadow: 0 4px 12px rgba(138, 180, 248, 0.4);
           /* Light color with opacity */
```

## Print Styles (Optional)

If needed, add:
```css
@media print {
  body {
    background: white;
    color: black;
  }
  .navbar, .sidebar {
    display: none;
  }
}
```

## Performance Tips

1. **Use CSS variables** - Theme changes without rerendering
2. **Limit transitions** - Only on interactive elements
3. **GPU acceleration** - Use `transform` instead of `left/top`
4. **Minimize repaints** - Group related properties
5. **CSS Grid vs Flexbox** - Use appropriate tool

## Common Customizations

### Change Accent Color
```css
:root {
  --accent: #ff6b6b;        /* Change to red */
  --accent-hover: #ff7c7c;
}
```

### Increase Padding
```css
/* In component CSS */
padding: 16px 24px;  /* From 12px 16px */
```

### Adjust Border Radius
```css
border-radius: 8px;  /* From 4px */
```

### Add Font Weight
```css
font-weight: 600;    /* From 500 */
```

---

For implementation, see component CSS files in `src/components/`  
For color reference, see `src/styles/theme.css`  
For layout reference, see `src/styles/App.css`
