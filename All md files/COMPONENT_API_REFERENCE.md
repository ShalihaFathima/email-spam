# Component API Reference

Complete reference for all React components in the Gmail Dark Theme app.

## Table of Contents

1. [Navbar](#navbar)
2. [Sidebar](#sidebar)
3. [EmailList](#emaillist)
4. [EmailItem](#emailitem)
5. [EmailViewer](#emailviewer)

---

## Navbar

Top navigation bar with Gmail branding, search, and user menu.

**Location**: `src/components/Navbar.js`  
**Size**: 64px height

### Props

```typescript
interface NavbarProps {
  onSearch?: (query: string) => void;  // Callback when search input changes
}
```

### Props Details

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSearch` | function | No | Called with search query string on input change |

### State

```typescript
state {
  searchQuery: string;  // Current search input value
}
```

### Usage

```jsx
<Navbar onSearch={handleSearch} />
```

### Example

```jsx
const [searchQuery, setSearchQuery] = useState('');

const handleSearch = (query) => {
  setSearchQuery(query);
  // Filter emails...
};

<Navbar onSearch={handleSearch} />
```

### Features

- Gmail logo in top-left
- Centered search bar
- Help and Settings buttons
- User profile avatar
- Responsive search layout

### Sub-Components

- None (uses Material UI icons)

### CSS Classes

```css
.navbar                    /* Main container */
.navbar-left               /* Logo section */
.gmail-logo                /* Logo wrapper */
.gmail-text                /* Logo text with gradient */
.navbar-center             /* Search section */
.search-container          /* Search bar wrapper */
.search-icon               /* Search icon */
.search-input              /* Input field */
.navbar-right              /* Right section */
.navbar-icon-btn           /* Icon buttons */
.profile-icon              /* User avatar */
```

---

## Sidebar

Left navigation panel with folder list and compose button.

**Location**: `src/components/Sidebar.js`  
**Size**: 256px width (responsive)

### Props

```typescript
interface SidebarProps {
  onFolderChange: (folderId: string) => void;  // Callback when folder clicked
  activeFolder?: string;                        // Currently active folder ID
}
```

### Props Details

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onFolderChange` | function | Yes | - | Called with folder ID when folder clicked |
| `activeFolder` | string | No | 'inbox' | Currently selected folder ID |

### State

```typescript
state {
  showMore: boolean;  // Whether to show additional labels
}
```

### Usage

```jsx
<Sidebar 
  onFolderChange={handleFolderChange} 
  activeFolder={activeFolder}
/>
```

### Example

```jsx
const [activeFolder, setActiveFolder] = useState('inbox');

const handleFolderChange = (folderId) => {
  setActiveFolder(folderId);
  // Load emails for this folder...
};

<Sidebar 
  onFolderChange={handleFolderChange}
  activeFolder={activeFolder}
/>
```

### Folder Data Structure

```javascript
const folders = [
  { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, count: 24 },
  { id: 'spam', label: 'Spam', icon: <SpamIcon />, count: 3 },
  { id: 'sent', label: 'Sent', icon: <SendIcon />, count: 45 },
  { id: 'drafts', label: 'Drafts', icon: <DraftIcon />, count: 2 },
];
```

### Sub-Components

- Compose button
- Folder list with countsMaterial UI icons

### CSS Classes

```css
.sidebar                   /* Main container */
.compose-btn               /* Compose button */
.folders-list              /* Folder list */
.folder-item               /* Individual folder */
.folder-item.active        /* Active folder */
.folder-icon               /* Folder icon */
.folder-label              /* Folder name */
.folder-count              /* Email count */
.sidebar-divider           /* Visual divider */
.more-labels               /* Additional labels section */
.label-item                /* Label item */
.label-icon                /* Label icon */
.label-name                /* Label name */
.show-more-btn             /* Show/hide more button */
```

---

## EmailList

Container for email list with actions and empty state.

**Location**: `src/components/EmailList.js`  
**Size**: 350px width (responsive)

### Props

```typescript
interface EmailListProps {
  emails: Email[];                           // Array of email objects
  onSelectEmail: (emailId: number) => void;  // Callback when email clicked
  selectedEmailId?: number;                  // Currently selected email ID
  onStarToggle: (emailId: number) => void;   // Callback for star toggle
}
```

### Props Details

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `emails` | Array | Yes | List of email objects to display |
| `onSelectEmail` | function | Yes | Called with email ID when email clicked |
| `selectedEmailId` | number | No | ID of currently selected email |
| `onStarToggle` | function | Yes | Called with email ID when star clicked |

### Email Object Structure

```typescript
interface Email {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  content: string;
  timestamp: Date;
  isStarred: boolean;
  hasAttachment: boolean;
  attachments?: string[];
  recipient: string;
}
```

### State

```typescript
state {
  selectAll: boolean;
  selectedEmails: Set<number>;  // IDs of selected emails
}
```

### Usage

```jsx
<EmailList
  emails={filteredEmails}
  onSelectEmail={setSelectedEmailId}
  selectedEmailId={selectedEmailId}
  onStarToggle={handleStarToggle}
/>
```

### Example

```jsx
const [selectedEmailId, setSelectedEmailId] = useState(null);
const [emails, setEmails] = useState([...]);

<EmailList
  emails={emails}
  onSelectEmail={setSelectedEmailId}
  selectedEmailId={selectedEmailId}
  onStarToggle={(id) => {
    // Update email starred status
  }}
/>
```

### Sub-Components

- EmailItem (multiple)
- Checkbox for select all
- Action buttons

### CSS Classes

```css
.email-list                /* Main container */
.email-list-header         /* Header with actions */
.select-all-btn            /* Select all checkbox */
.list-actions              /* Action buttons container */
.action-btn                /* Individual action button */
.emails-container          /* Scrollable email list */
.empty-state               /* No emails message */
.empty-icon                /* Empty state icon */
.empty-text                /* Empty state text */
```

---

## EmailItem

Individual email row component.

**Location**: `src/components/EmailItem.js`  
**Size**: 100% width (parent dependent)

### Props

```typescript
interface EmailItemProps {
  email: Email;                              // Email object to display
  isSelected: boolean;                       // Whether email is selected
  onSelect: (emailId: number) => void;       // Callback when clicked
  onStarToggle: (emailId: number) => void;   // Callback for star toggle
}
```

### Props Details

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `email` | Email | Yes | Email object with all details |
| `isSelected` | boolean | Yes | Whether this email is currently selected |
| `onSelect` | function | Yes | Called with email ID when email clicked |
| `onStarToggle` | function | Yes | Called with email ID when star clicked |

### Usage

```jsx
<EmailItem
  email={emailObject}
  isSelected={selectedEmailId === emailObject.id}
  onSelect={handleSelectEmail}
  onStarToggle={handleStarToggle}
/>
```

### Example

```jsx
emails.map(email => (
  <EmailItem
    key={email.id}
    email={email}
    isSelected={selectedEmailId === email.id}
    onSelect={setSelectedEmailId}
    onStarToggle={toggleStar}
  />
))
```

### Features

- Star/unstar functionality
- Sender name and time
- Subject and preview text
- Attachment indicator
- Active selection styling
- Time formatting (relative format)

### Text Truncation

```javascript
// Truncates preview to 80 characters
"This is a long email preview that will be cut off..." → 
"This is a long email preview that will be cut off..."
```

### Time Formatting

```javascript
// Relative time formatting
< 1 hour -> "45m ago"
< 1 day -> "3h ago"
< 1 week -> "5d ago"
> 1 week -> "Mar 18"
```

### CSS Classes

```css
.email-item                /* Main row */
.email-item.selected       /* Selected row */
.star-btn                  /* Star button */
.email-item-content        /* Content wrapper */
.email-header              /* Sender and time row */
.sender-name               /* Sender name text */
.email-time                /* Timestamp text */
.email-subject             /* Subject line */
.email-preview             /* Preview text */
.attachment-indicator      /* Attachment emoji */
```

---

## EmailViewer

Full email display and viewer panel.

**Location**: `src/components/EmailViewer.js`  
**Size**: Flex 1 (fills remaining space)

### Props

```typescript
interface EmailViewerProps {
  email?: Email;                             // Email to display (optional)
  onStarToggle: (emailId: number) => void;   // Callback for star toggle
}
```

### Props Details

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `email` | Email | No | Email object to display (null shows empty state) |
| `onStarToggle` | function | Yes | Called with email ID when star clicked |

### Usage

```jsx
<EmailViewer
  email={selectedEmail}
  onStarToggle={handleStarToggle}
/>
```

### Example

```jsx
const [selectedEmail, setSelectedEmail] = useState(null);

<EmailViewer
  email={selectedEmail}
  onStarToggle={(id) => {
    // Update star status
  }}
/>
```

### Features

- Full email content display
- Sender profile with avatar
- Email metadata (sender, recipient, timestamp)
- Action buttons (Archive, Delete, More)
- Footer buttons (Reply, Forward, Star)
- Attachment list
- Empty state when no email selected

### Empty State

When `email` is null or undefined:
```
  ✉️
Select an email to view
```

### Sender Avatar

```javascript
// First letter of sender name
const avatar = email.sender.charAt(0).toUpperCase();
// E.g., "Sarah Anderson" -> "S"
```

### Time Formatting

Full date format:
```javascript
// "Mon, Mar 18, 2024, 02:30:45 PM"
weekday: 'short'
year: 'numeric'
month: 'short'
day: 'numeric'
hour: '2-digit'
minute: '2-digit'
second: '2-digit'
```

### Attachments Display

```javascript
email.attachments = ['Document.pdf', 'Image.jpg']

// Displays as:
// 📥 Document.pdf
// 📥 Image.jpg
```

### CSS Classes

```css
.email-viewer              /* Main container */
.empty-viewer              /* Empty state */
.empty-icon                /* Empty state icon */
.empty-text                /* Empty state text */
.viewer-header             /* Header section */
.viewer-title              /* Email subject */
.viewer-actions            /* Header buttons */
.viewer-action-btn         /* Header button */
.email-meta                /* Metadata section */
.meta-row                  /* Sender info row */
.sender-info               /* Sender name/email */
.sender-avatar             /* Avatar circle */
.sender-name               /* Sender name */
.sender-email              /* Sender email */
.meta-time                 /* Timestamp */
.recipient-row             /* Recipient info */
.email-content             /* Email body */
.content-text              /* Email text */
.attachments               /* Attachments section */
.attachments-title         /* "Attachments" label */
.attachment-item           /* Individual attachment */
.attachment-name           /* Attachment filename */
.email-footer              /* Footer section */
.footer-btn                /* Footer button */
```

---

## App.js Integration

### Sample Usage

```jsx
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailViewer from './components/EmailViewer';

function App() {
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [starredEmails, setStarredEmails] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = useMemo(() => {
    let emails = SAMPLE_EMAILS;

    if (activeFolder === 'starred') {
      emails = emails.filter(e => starredEmails.has(e.id));
    }

    if (searchQuery) {
      emails = emails.filter(e =>
        e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return emails;
  }, [activeFolder, searchQuery, starredEmails]);

  return (
    <div className="app-container">
      <Navbar onSearch={setSearchQuery} />
      <div className="app-body">
        <Sidebar 
          onFolderChange={setActiveFolder}
          activeFolder={activeFolder}
        />
        <div className="app-main">
          <EmailList
            emails={filteredEmails}
            onSelectEmail={setSelectedEmailId}
            selectedEmailId={selectedEmailId}
            onStarToggle={(id) => {
              const newStarred = new Set(starredEmails);
              if (newStarred.has(id)) {
                newStarred.delete(id);
              } else {
                newStarred.add(id);
              }
              setStarredEmails(newStarred);
            }}
          />
          <EmailViewer
            email={SAMPLE_EMAILS.find(e => e.id === selectedEmailId)}
            onStarToggle={(id) => { /* handle star */ }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Material UI Imports

Each component uses Material UI icons:

```javascript
import {
  Search,
  Settings,
  Help,
  Edit,
  Inbox,
  Send,
  Draft,
  Error,
  Delete,
  Label,
  MoreVert,
  Archive,
  Reply,
  Forward,
  Star,
  StarBorder,
  FileDownload,
  Checkbox,
  ExpandMore,
} from '@mui/icons-material';
```

---

## Type Definitions (TypeScript)

```typescript
interface Email {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  content: string;
  timestamp: Date;
  isStarred: boolean;
  hasAttachment: boolean;
  attachments?: string[];
  recipient: string;
}

interface Folder {
  id: string;
  label: string;
  icon: ReactElement;
  count: number;
}
```

---

## Common Patterns

### Controlled Component Pattern

```jsx
// Parent manages state
const [selectedEmailId, setSelectedEmailId] = useState(null);

// Pass to child
<EmailList
  selectedEmailId={selectedEmailId}
  onSelectEmail={setSelectedEmailId}
/>

// Child calls callback
<div onClick={() => onSelectEmail(email.id)}>
```

### Filtering Pattern

```jsx
const filteredEmails = useMemo(() => {
  let emails = allEmails;

  if (activeFolder !== 'inbox') {
    emails = emails.filter(e => e.folder === activeFolder);
  }

  if (searchQuery) {
    emails = emails.filter(e =>
      e.subject.includes(searchQuery)
    );
  }

  return emails;
}, [activeFolder, searchQuery]);
```

### Callback Pattern

```jsx
// Parent defines handler
const handleStarToggle = (emailId) => {
  const newStarred = new Set(starredEmails);
  if (newStarred.has(emailId)) {
    newStarred.delete(emailId);
  } else {
    newStarred.add(emailId);
  }
  setStarredEmails(newStarred);
};

// Pass to child
<Component onStarToggle={handleStarToggle} />

// Child calls when needed
<button onClick={() => onStarToggle(email.id)}>
```

---

## Performance Considerations

### Memoization

```jsx
// Avoid unnecessary re-renders
const emails = useMemo(() => {
  return filteredEmails.map(email => ({
    ...email,
    isStarred: starredEmails.has(email.id),
  }));
}, [filteredEmails, starredEmails]);
```

### Callback Memoization

```jsx
const handleStarToggle = useCallback((emailId) => {
  // Handle star toggle
}, [/* dependencies */]);
```

---

For detailed implementation, see individual component files.  
For styling details, see [CSS_STYLING_GUIDE.md](CSS_STYLING_GUIDE.md)
