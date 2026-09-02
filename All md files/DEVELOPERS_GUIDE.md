# Developers' Guide

Advanced guide for developers extending and maintaining the Gmail Dark Theme React app.

## 🏗️ Architecture Overview

### Component Hierarchy

```
App (Main)
├── Navbar
│   └── Search Input Handler
├── Sidebar
│   ├── Compose Button
│   ├── Folder List
│   │   └── Folder Items (mapped)
│   └── More Labels Section
├── EmailList
│   ├── List Header (Actions)
│   └── Email Items (mapped)
│       └── EmailItem
│           ├── Star Button
│           ├── Sender Info
│           └── Time Badge
└── EmailViewer
    ├── Header (Actions)
    ├── Metadata
    ├── Content
    ├── Attachments
    └── Footer (Actions)
```

### Data Flow

```
App Component (State Management)
    ↓
    ├→ Navbar (onSearch callback)
    ├→ Sidebar (onFolderChange callback)
    ├→ EmailList (emails, onSelectEmail, onStarToggle)
    │   └→ EmailItem (email, onSelect, onStarToggle)
    └→ EmailViewer (email, onStarToggle)
```

## 🔄 State Management

### App-Level State

```javascript
// Current implementation uses React hooks
const [selectedEmailId, setSelectedEmailId] = useState(SAMPLE_EMAILS[0].id);
const [activeFolder, setActiveFolder] = useState('inbox');
const [starredEmails, setStarredEmails] = useState(new Set());
const [searchQuery, setSearchQuery] = useState('');
```

### Future Improvements

Consider implementing:
- **Redux** for complex state
- **Zustand** for simpler state management
- **Context API** for theme switching
- **React Query** for server state

## 🔍 Key Functions

### Email Filtering (useMemo)

```javascript
const filteredEmails = useMemo(() => {
  let emails = SAMPLE_EMAILS;

  // Folder filtering
  if (activeFolder === 'spam') {
    emails = emails.filter((e) => e.id % 5 === 0);
  }

  // Search filtering
  if (searchQuery) {
    emails = emails.filter(
      (e) =>
        e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return emails;
}, [activeFolder, searchQuery, starredEmails]);
```

### Star Toggle Handler

```javascript
const handleStarToggle = (emailId) => {
  const newStarred = new Set(starredEmails);
  if (newStarred.has(emailId)) {
    newStarred.delete(emailId);
  } else {
    newStarred.add(emailId);
  }
  setStarredEmails(newStarred);
};
```

## 📡 API Integration

### Replacing Sample Data

Currently using local data:
```javascript
const SAMPLE_EMAILS = [
  { id: 1, sender: 'Sarah', ... }
];
```

To connect to backend:
```javascript
const [emails, setEmails] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchEmails();
}, [activeFolder]);

const fetchEmails = async () => {
  setLoading(true);
  try {
    const response = await fetch(`/api/emails?folder=${activeFolder}`);
    const data = await response.json();
    setEmails(data);
  } catch (error) {
    console.error('Error fetching emails:', error);
  } finally {
    setLoading(false);
  }
};
```

### API Endpoints Needed

```
GET /api/emails?folder=inbox
GET /api/emails/search?q=query
POST /api/emails/send
GET /api/emails/:id
PUT /api/emails/:id
DELETE /api/emails/:id
POST /api/emails/:id/star
GET /api/folders
```

## 🎭 Adding Features

### Feature: Compose Email

**File**: Create `src/components/ComposeMail.js`

```jsx
import React, { useState } from 'react';
import './ComposeMail.css';

const ComposeMail = ({ onSend, onClose }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    onSend({ to, subject, body });
    onClose();
  };

  return (
    <div className="compose-mail">
      <div className="compose-header">
        <h3>New Message</h3>
        <button onClick={onClose}>×</button>
      </div>
      <input
        type="email"
        placeholder="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        placeholder="Message body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ComposeMail;
```

### Feature: Advanced Search

Enhance search in Navbar:

```jsx
const [searchFilters, setSearchFilters] = useState({
  from: '',
  subject: '',
  hasAttachment: false,
  isStarred: false
});

const filteredEmails = useMemo(() => {
  return emails.filter(email => {
    if (searchFilters.from && !email.sender.includes(searchFilters.from)) {
      return false;
    }
    if (searchFilters.subject && !email.subject.includes(searchFilters.subject)) {
      return false;
    }
    if (searchFilters.hasAttachment && !email.hasAttachment) {
      return false;
    }
    if (searchFilters.isStarred && !starredEmails.has(email.id)) {
      return false;
    }
    return true;
  });
}, [searchFilters, emails, starredEmails]);
```

### Feature: Email Threading

Track parent emails:

```javascript
const emailWithThread = {
  ...email,
  parentId: null,        // Parent email ID if reply
  threadCount: 0,        // Number of replies
  threadIds: [],         // All email IDs in thread
};
```

## 🧪 Testing

### Unit Test Example (Jest + React Testing Library)

```javascript
// src/components/EmailItem.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailItem from './EmailItem';

describe('EmailItem', () => {
  const mockEmail = {
    id: 1,
    sender: 'John Doe',
    subject: 'Test',
    preview: 'Test preview'
  };

  test('renders email item', () => {
    render(
      <EmailItem
        email={mockEmail}
        isSelected={false}
        onSelect={jest.fn()}
        onStarToggle={jest.fn()}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('calls onSelect when clicked', async () => {
    const onSelect = jest.fn();
    const { container } = render(
      <EmailItem
        email={mockEmail}
        isSelected={false}
        onSelect={onSelect}
        onStarToggle={jest.fn()}
      />
    );
    await userEvent.click(container.querySelector('.email-item'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
```

### E2E Test Example (Cypress)

```javascript
// cypress/e2e/email.cy.js
describe('Email Operations', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should load emails', () => {
    cy.get('.email-item').should('have.length.greaterThan', 0);
  });

  it('should select an email', () => {
    cy.get('.email-item').first().click();
    cy.get('.email-viewer .sender-name').should('be.visible');
  });

  it('should search emails', () => {
    cy.get('.search-input').type('Sarah');
    cy.get('.email-item').should('contain', 'Sarah');
  });

  it('should star an email', () => {
    cy.get('.star-btn').first().click();
    cy.get('.star-btn').first().find('svg').should('have.class', 'Mui-disabled');
  });
});
```

## 🚀 Performance Optimization

### 1. Virtual Scrolling (Large Lists)

```bash
npm install react-window
```

```jsx
import { FixedSizeList } from 'react-window';

const Row = ({ index, style, data }) => (
  <div style={style}>
    <EmailItem email={data[index]} {...props} />
  </div>
);

<FixedSizeList
  height={600}
  itemCount={emails.length}
  itemSize={80}
  width="100%"
  itemData={emails}
>
  {Row}
</FixedSizeList>
```

### 2. Code Splitting

```jsx
import React, { Suspense, lazy } from 'react';

const EmailComposer = lazy(() => import('./EmailComposer'));

<Suspense fallback={<div>Loading...</div>}>
  <EmailComposer />
</Suspense>
```

### 3. Image Optimization

```jsx
import Image from 'next/image';  // If using Next.js

// Or use lazy loading:
<img loading="lazy" src={avatar} alt="avatar" />
```

### 4. Memoization

```jsx
const EmailItem = React.memo(
  ({ email, isSelected, onSelect, onStarToggle }) => {
    // Component code
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.email.id === nextProps.email.id &&
           prevProps.isSelected === nextProps.isSelected;
  }
);
```

## 🐛 Debugging

### React DevTools

```javascript
// Install extension
// Then use in code:
console.log('Selected Email:', selectedEmail);
console.log('Active Folder:', activeFolder);
console.log('Filtered Emails:', filteredEmails);
```

### Browser Console

```javascript
// Check state changes
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.setSelectedFiber(fiber);

// Monitor performance
performance.mark('render-start');
// ... code ...
performance.mark('render-end');
performance.measure('render', 'render-start', 'render-end');
```

### Common Issues

**Issue**: State not updating
```javascript
// Wrong - direct mutation
emails[0] = new Email();

// Right - create new array
const newEmails = [...emails];
newEmails[0] = new Email();
setEmails(newEmails);
```

**Issue**: Props not changing
```javascript
// Use useEffect to track changes
useEffect(() => {
  console.log('Email changed:', email);
}, [email]);
```

## 📦 Build Optimization

### Production Build

```bash
npm run build
# Analyzes bundle size
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'
```

### Bundle Analysis

```json
// package.json
"scripts": {
  "analyze": "source-map-explorer 'build/static/js/*.js'"
}
```

## 🔐 Security Considerations

### Input Sanitization

```javascript
// Prevent XSS
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(email.content);
```

### Authentication

```javascript
// Store token securely
const token = localStorage.getItem('authToken');

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('/api/emails', { headers })
```

## 📊 Analytics Integration

### Google Analytics

```javascript
import ReactGA from 'react-ga';

useEffect(() => {
  ReactGA.initialize('GA_MEASUREMENT_ID');
  ReactGA.pageview(window.location.pathname);
}, []);

const trackEmailOpen = (emailId) => {
  ReactGA.event({
    category: 'Email',
    action: 'Opened',
    label: emailId
  });
};
```

## 🎨 Theme Switching

### Context Implementation

```javascript
// src/context/ThemeContext.js
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Usage in App

```jsx
import { ThemeContext } from './context/ThemeContext';

const App = () => {
  const { isDark } = useContext(ThemeContext);

  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'}>
      {/* App content */}
    </div>
  );
};
```

## 🔄 Git Workflow

### Branch Structure

```
main (production)
├── develop (staging)
├── feature/compose-email
├── feature/advanced-search
├── bugfix/search-issue
└── hotfix/critical-bug
```

### Commit Messages

```
feat: Add compose mail feature
fix: Resolve search filtering bug
docs: Update API documentation
style: Improve navbar styling
refactor: Simplify email filtering logic
test: Add email component tests
```

## 📚 Resources

### Learning
- [React Documentation](https://react.dev)
- [Material UI](https://mui.com)
- [Web.dev](https://web.dev)

### Tools
- [React DevTools](https://chrome.google.com/webstore) Extension
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Performance
- [Web Vitals](https://vitals.web.dev)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Network Throttling](https://developer.chrome.com/docs/devtools/network/)

## 🆘 Troubleshooting

### Build Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm start
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Styles Not Loading
```bash
# Hard refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Or clear cache, restart server
rm -rf .cache
npm start
```

---

For component development, see [COMPONENT_API_REFERENCE.md](COMPONENT_API_REFERENCE.md)  
For styling reference, see [CSS_STYLING_GUIDE.md](CSS_STYLING_GUIDE.md)  
For project structure, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
