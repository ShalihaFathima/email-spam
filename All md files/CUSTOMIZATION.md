# Customization Guide

This guide explains how to customize the Gmail Dark Theme app to match your preferences.

## Theme Customization

### Change Colors

Edit `src/styles/theme.css` to customize the color scheme:

```css
:root {
  --primary-bg: #0f0f0f;      /* Main background color */
  --secondary-bg: #1f1f1f;    /* Panel and component backgrounds */
  --tertiary-bg: #262626;     /* Hover and interactive elements */
  --text-primary: #ffffff;    /* Main text color */
  --text-secondary: #ccc;     /* Secondary and muted text */
  --accent: #8ab4f8;          /* Primary accent color (blue) */
  --accent-hover: #aecbfa;    /* Accent hover state */
  --border: #3f3f3f;          /* Border and separator colors */
  --hover-bg: #2d2d2d;        /* Hover background */
}
```

### Popular Color Schemes

#### Light Mode
```css
:root {
  --primary-bg: #ffffff;
  --secondary-bg: #f5f5f5;
  --tertiary-bg: #eeeeee;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --accent: #1a73e8;
  --accent-hover: #1765cc;
  --border: #dadce0;
  --hover-bg: #e8eaed;
}
```

#### Material Dark
```css
:root {
  --primary-bg: #121212;
  --secondary-bg: #1e1e1e;
  --tertiary-bg: #2c2c2c;
  --text-primary: #e1e1e1;
  --text-secondary: #b0b0b0;
  --accent: #bb86fc;
  --accent-hover: #d0bcff;
  --border: #37474f;
  --hover-bg: #302f2f;
}
```

#### Nord Theme
```css
:root {
  --primary-bg: #2e3440;
  --secondary-bg: #3b4252;
  --tertiary-bg: #434c5e;
  --text-primary: #eceff4;
  --text-secondary: #d8dee9;
  --accent: #88c0d0;
  --accent-hover: #81a1c1;
  --border: #4c566a;
  --hover-bg: #3b4252;
}
```

#### Dracula Theme
```css
:root {
  --primary-bg: #282a36;
  --secondary-bg: #21222c;
  --tertiary-bg: #44475a;
  --text-primary: #f8f8f2;
  --text-secondary: #6272a4;
  --accent: #ff79c6;
  --accent-hover: #ff85d5;
  --border: #6272a4;
  --hover-bg: #44475a;
}
```

## Component Customization

### Navbar Changes

**File**: `src/components/Navbar.js`

- Change Gmail logo text:
  ```jsx
  <span className="gmail-text">Your App Name</span>
  ```

- Modify search placeholder:
  ```jsx
  placeholder="Custom search text"
  ```

### Sidebar Changes

**File**: `src/components/Sidebar.js`

- Add new folders:
  ```jsx
  const folders = [
    { id: 'custom', label: 'Custom Folder', icon: <CustomIcon />, count: 0 },
  ];
  ```

- Customize folder icons (requires Material UI icons):
  ```jsx
  import { YourIcon } from '@mui/icons-material';
  ```

### Email Data Changes

**File**: `src/App.js`

Modify the `SAMPLE_EMAILS` array to change:
- Email sender names and addresses
- Subject lines and content
- Timestamps and attachments
- Email counts and preview text

Example:
```jsx
const SAMPLE_EMAILS = [
  {
    id: 1,
    sender: 'Custom Sender',
    senderEmail: 'custom@example.com',
    subject: 'Custom Subject',
    preview: 'Custom preview text...',
    content: 'Full email content here...',
    timestamp: new Date(),
    isStarred: false,
    hasAttachment: false,
    attachments: [],
    recipient: 'you@example.com',
  },
];
```

## Styling Customization

### Button Styling

Edit `.compose-btn` or `.folder-item` in respective CSS files:

```css
.compose-btn {
  background: linear-gradient(135deg, #8ab4f8 0%, #d4af37 100%);
  /* Modify gradient, padding, border-radius, etc. */
}
```

### Animations

Enable/disable animations in CSS files:

```css
/* Add transition effects */
transition: all 0.2s ease;

/* Or remove for instant changes */
transition: none;
```

### Font Customization

Edit `public/index.html` to change fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;500;700&display=swap" rel="stylesheet">
```

Then update `src/styles/theme.css`:

```css
body {
  font-family: 'YourFont', sans-serif;
}
```

## Responsive Breakpoint Customization

Edit CSS media queries in component CSS files:

```css
/* Current breakpoints */
@media (max-width: 1024px) { }  /* Tablet */
@media (max-width: 768px) { }   /* Mobile */
@media (max-width: 480px) { }   /* Small mobile */

/* Add your own breakpoints */
@media (max-width: 1440px) { }  /* Large desktop */
```

## Icons Customization

Replace Material UI icons from `@mui/icons-material`:

```jsx
// Current
import { Inbox as InboxIcon } from '@mui/icons-material';

// Replace with
import { MailBox as InboxIcon } from '@mui/icons-material';
```

[View all available Material UI icons](https://mui.com/material-ui/material-icons/)

## Sidebar Folder Count

To fetch real email counts from a backend:

```jsx
// Replace hardcoded count
count: 24

// With dynamic data
count: emailCounts.inbox || 24
```

## Email Filtering

Modify the `filteredEmails` logic in `src/App.js` to change how emails are filtered:

```jsx
const filteredEmails = useMemo(() => {
  let emails = SAMPLE_EMAILS;

  // Add custom filtering logic
  if (activeFolder === 'custom') {
    emails = emails.filter(e => e.customField === true);
  }

  return emails;
}, [activeFolder, searchQuery, starredEmails]);
```

## Mobile-First vs Desktop-First

Currently the design is desktop-first. To switch to mobile-first:

1. Move media query breakpoints to the bottom
2. Adjust mobile styles first, then add `@media (min-width: ...)` for larger screens

## Performance Optimization

For large email lists, implement:
- Virtual scrolling: [react-window](https://github.com/bvaughn/react-window)
- Lazy loading: Load emails as user scrolls
- Memoization: Use `React.memo()` for EmailItem components

Example:
```jsx
export default React.memo(EmailItem, (prevProps, nextProps) => {
  return prevProps.email.id === nextProps.email.id &&
         prevProps.isSelected === nextProps.isSelected;
});
```

## Adding Dark/Light Mode Toggle

Create a theme context:

```jsx
// src/context/ThemeContext.js
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const themes = {
    dark: { /* dark theme vars */ },
    light: { /* light theme vars */ }
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, theme: themes[isDark ? 'dark' : 'light'] }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Debugging

### Check Selected Email
```jsx
console.log('Selected Email:', selectedEmail);
```

### Check Active Folder
```jsx
console.log('Active Folder:', activeFolder);
```

### Check Filtered Emails
```jsx
console.log('Filtered Emails:', filteredEmails);
```

## Common Issues & Solutions

**Issue**: Styles not updating
- Clear browser cache (Ctrl+Shift+Delete)
- Restart development server
- Hard refresh (Ctrl+Shift+R)

**Issue**: Material UI icons not showing
- Install: `npm install @mui/icons-material`
- Verify import paths

**Issue**: Email not updating
- Check React DevTools for state changes
- Verify `useState` hooks are working
- Use `useCallback` for event handlers

---

For more information, refer to the main [README.md](README.md) file.
