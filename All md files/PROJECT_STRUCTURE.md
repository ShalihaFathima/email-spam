# Project Structure & File Details

## Complete Directory Tree

```
gmail-dark-theme/
│
├── public/
│   └── index.html                 # HTML entry point
│
├── src/
│   ├── components/                # React components folder
│   │   ├── Navbar.js              # Top navigation bar component (61 lines)
│   │   ├── Navbar.css             # Navbar styling (157 lines)
│   │   ├── Sidebar.js             # Left sidebar component (62 lines)
│   │   ├── Sidebar.css            # Sidebar styling (212 lines)
│   │   ├── EmailList.js           # Email list container (57 lines)
│   │   ├── EmailList.css          # Email list styling (122 lines)
│   │   ├── EmailItem.js           # Individual email row (49 lines)
│   │   ├── EmailItem.css          # Email item styling (125 lines)
│   │   ├── EmailViewer.js         # Email detail viewer (80 lines)
│   │   └── EmailViewer.css        # Email viewer styling (254 lines)
│   │
│   ├── styles/                    # Global styles folder
│   │   ├── theme.css              # Global color variables & typography (58 lines)
│   │   └── App.css                # App layout styling (93 lines)
│   │
│   ├── App.js                     # Main application component (144 lines)
│   ├── index.js                   # React entry point (8 lines)
│   └── index.css                  # Global styles (inherited from theme.css)
│
├── .gitignore                     # Git ignore file
├── package.json                   # Project dependencies & scripts
├── README.md                      # Main documentation
├── QUICKSTART.md                  # Quick start guide
├── CUSTOMIZATION.md               # Customization guide
└── PROJECT_STRUCTURE.md           # This file
```

## File Details

### HTML & Entry Point

**`public/index.html`**
- Root HTML document
- Loads Google Fonts (Roboto)
- Mounts React app into `#root` div

**`src/index.js`**
- React entry point
- Imports and renders `App.js` component
- Imports global theme CSS

### Main App Component

**`src/App.js`** (144 lines)
- Main React component
- Manages state: `selectedEmailId`, `activeFolder`, `starredEmails`, `searchQuery`
- Contains `SAMPLE_EMAILS` data (6 emails)
- Uses `useMemo` for email filtering
- Handles folder navigation and email selection
- Props passed to child components: Navbar, Sidebar, EmailList, EmailViewer

### Components Breakdown

#### **Navbar** (61 lines + 157 lines CSS)
- **Props**: `onSearch` callback
- **State**: `searchQuery`
- **Features**:
  - Gmail logo with gradient
  - Search input with icon
  - Help and Settings buttons
  - User profile avatar (initial "A")
- **Responsive**: 
  - Desktop: Full layout
  - Mobile: Condensed with hidden search label

#### **Sidebar** (62 lines + 212 lines CSS)
- **Props**: `onFolderChange` callback, `activeFolder` state
- **State**: `showMore` (expand/collapse)
- **Features**:
  - Compose button with gradient
  - 4 main folders (Inbox, Spam, Sent, Drafts) with counts
  - More labels section (Important, Starred, Archive)
  - Active folder highlighting
- **Icons**: Material UI icons for each folder
- **Responsive**: Horizontal layout on mobile

#### **EmailList** (57 lines + 122 lines CSS)
- **Props**: `emails`, `onSelectEmail`, `selectedEmailId`, `onStarToggle`
- **State**: `selectAll`, `selectedEmails`
- **Features**:
  - Email list header with actions (Archive, Delete, Mark, More)
  - Select all checkbox
  - Maps `EmailItem` components
  - Empty state message
- **Responsive**: Full width on mobile

#### **EmailItem** (49 lines + 125 lines CSS)
- **Props**: `email`, `isSelected`, `onSelect`, `onStarToggle`
- **Features**:
  - Star toggle button
  - Sender name and time
  - Subject and preview text
  - Attachment indicator
  - Relative time formatting
- **Styling**: Selected state with accent border

#### **EmailViewer** (80 lines + 254 lines CSS)
- **Props**: `email`, `onStarToggle`
- **Features**:
  - Full email display
  - Sender avatar and info
  - Recipient details
  - Full timestamp formatting
  - Email content with formatting preservation
  - Attachments list
  - Footer actions (Reply, Forward, Star)
- **Empty State**: Shows when no email selected

### Styling Files

**`src/styles/theme.css`** (58 lines)
- Global CSS variables:
  - Colors (8 variables)
  - Typography
  - Scrollbar styling
- Applied to entire application

**`src/styles/App.css`** (93 lines)
- Main layout container styling
- Header, sidebar, main content areas
- Responsive breakpoints
- Flexbox layout structure

**Component CSS Files** (1,290 total lines)
- Each component has its own CSS file
- Styles use CSS variables from theme.css
- Responsive media queries
- Smooth transitions and hover effects

### Data Structure

**Sample Email Object** (in `src/App.js`)
```javascript
{
  id: 1,
  sender: 'John Doe',
  senderEmail: 'john@example.com',
  subject: 'Email Subject',
  preview: 'Preview text...',
  content: 'Full email content...',
  timestamp: Date,
  isStarred: boolean,
  hasAttachment: boolean,
  attachments: ['file.pdf'],
  recipient: 'you@example.com'
}
```

## State Management

### App-level State (src/App.js)
```javascript
selectedEmailId     // Currently viewed email ID
activeFolder        // Current folder view
starredEmails       // Set of starred email IDs
searchQuery         // Search term
```

### Component State
- **Navbar**: `searchQuery`
- **Sidebar**: `showMore`
- **EmailList**: `selectAll`, `selectedEmails`

## Styling Approach

- **CSS Variables**: Centralized color management
- **Flexbox**: Layout structure
- **Grid**: Could be added for more complex layouts
- **Media Queries**: Responsive design breakpoints
- **Transitions**: Smooth animations on interactions

## Color System

```
Primary Background: #0f0f0f (Pure black)
Secondary BG: #1f1f1f (Dark gray)
Tertiary BG: #262626 (Medium gray)
Text Primary: #ffffff (White)
Text Secondary: #ccc (Light gray)
Accent: #8ab4f8 (Gmail blue)
Border: #3f3f3f (Dark gray)
```

## Responsive Design

### Breakpoints
- **Desktop**: 1024px+
  - Full sidebar
  - Full email list
  - Full email viewer
- **Tablet**: 768px-1023px
  - Narrower sidebar
  - Email list takes more space
- **Mobile**: <768px
  - Stacked layout
  - Horizontal sidebar
  - Half-height email list and viewer
- **Small Mobile**: <480px
  - Icon-only buttons
  - Minimal padding
  - Abbreviated labels

## Build & Deployment

### Development
```bash
npm install     # Install dependencies
npm start       # Start dev server on port 3000
```

### Production
```bash
npm run build   # Create optimized build in /build folder
```

### Deployment Options
- **Vercel**: Recommended for React apps
- **Netlify**: Easy GitHub integration
- **GitHub Pages**: Free static hosting
- **Firebase**: Google's hosting platform

## Performance Considerations

### Current Optimization
- Uses `useMemo` for email filtering
- React.Fragment for non-DOM groups
- Conditional rendering for empty states

### Potential Improvements
- Virtual scrolling for large lists
- Code splitting by route
- Image lazy loading (if images added)
- Service worker for offline support

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@mui/material": "^5.14.0",
  "@mui/icons-material": "^5.14.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0"
}
```

## Total Code Statistics

- **Components**: 5 main components
- **CSS Files**: 9 (1 global + 8 component-specific)
- **Lines of React Code**: ~313
- **Lines of CSS Code**: ~1,290
- **Sample Data**: 6 emails
- **Features**: 15+ interactive features

---

For detailed usage, see [README.md](README.md)  
For quick setup, see [QUICKSTART.md](QUICKSTART.md)  
For customization, see [CUSTOMIZATION.md](CUSTOMIZATION.md)
