# Gmail Dark Theme React App

A professional Gmail-inspired dark theme email interface built with React and Material UI.

## Features

✨ **Modern Dark Theme**
- Premium black (#0f0f0f) and gold (#d4af37) color scheme
- Smooth transitions and hover effects
- Professional UI/UX design

📱 **Responsive Design**
- Desktop optimized (1024px+)
- Tablet friendly (768px - 1023px)
- Mobile responsive (below 768px)
- Adaptive layouts for all screen sizes

✉️ **Complete Email Interface**
- Email list with sender, subject, preview, and time
- Full email viewer with sender details
- Star/favorite emails functionality
- Search functionality
- Folder navigation (Inbox, Spam, Sent, Drafts)

🎨 **Full React Components**
- Navbar with search bar and profile icon
- Sidebar with navigation and compose button
- Email list with selection and actions
- Email item with metadata
- Email viewer with full content

## Project Structure

```
gmail-dark-theme/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   ├── Sidebar.js
│   │   ├── Sidebar.css
│   │   ├── EmailList.js
│   │   ├── EmailList.css
│   │   ├── EmailItem.js
│   │   ├── EmailItem.css
│   │   ├── EmailViewer.js
│   │   └── EmailViewer.css
│   ├── styles/
│   │   ├── theme.css (global theme and colors)
│   │   └── App.css (layout styles)
│   ├── App.js (main application component)
│   ├── index.js (entry point)
│   └── index.css
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Setup

1. **Navigate to the project directory:**
   ```bash
   cd "Email spam"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

## Usage

### Navbar
- **Gmail Logo**: Displays in the top-left
- **Search Bar**: Search through emails by sender, subject, or content
- **Settings/Help**: Quick access buttons on the right
- **Profile Icon**: User avatar with initial

### Sidebar
- **Compose Button**: Start writing a new email
- **Folders**: 
  - Inbox (24 emails)
  - Spam (3 emails)
  - Sent (45 emails)
  - Drafts (2 emails)
- **More Options**: Expand/collapse additional labels

### Email List
- **Sender Name**: Shows who the email is from
- **Subject Line**: Email subject
- **Preview Text**: First 80 characters of email body
- **Timestamp**: Time received (relative format)
- **Star Icon**: Click to mark email as favorite
- **Attachment Icon**: Shows if email has attachments

### Email Viewer
- **Full Content**: Complete email body with formatting
- **Sender Avatar**: User initial in gradient circle
- **Metadata**: Sender name, email, and full timestamp
- **Actions**: Archive, Delete, More options
- **Footer Buttons**: Reply, Forward, Add Star
- **Attachments**: List of files attached to email

## Color Scheme

```css
--primary-bg: #0f0f0f      /* Main background */
--secondary-bg: #1f1f1f    /* Panel backgrounds */
--tertiary-bg: #262626     /* Tertiary elements */
--text-primary: #ffffff    /* Main text */
--text-secondary: #ccc     /* Secondary text */
--accent: #8ab4f8          /* Primary accent (blue) */
--accent-hover: #aecbfa    /* Accent hover state */
--border: #3f3f3f          /* Borders */
--hover-bg: #2d2d2d        /* Hover backgrounds */
```

## Component Breakdown

### Navbar Component
- Top navigation bar with Gmail branding
- Centered search functionality
- Right-aligned profile and settings icons
- Fully responsive with mobile menu

### Sidebar Component
- Collapsible navigation menu
- Compose button with gradient styling
- Folder list with email counts
- Expandable "More" section for additional labels
- Active folder highlighting

### EmailList Component
- Scrollable email list
- Select all checkbox
- Action buttons (Archive, Delete, Mark as read)
- Empty state when no emails
- Responsive grid layout

### EmailItem Component
- Individual email row
- Sender name and time
- Subject and preview text
- Star toggle
- Attachment indicator

### EmailViewer Component
- Full email display
- Sender information with avatar
- Complete email metadata
- Content area with text formatting
- Attachment list
- Action buttons (Reply, Forward, Star)

## Sample Data

The app comes with 6 sample emails demonstrating:
- Different senders and email addresses
- Various subjects and content
- Multiple attachments
- Starred/favorite emails
- Various timestamps

## Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Technologies Used

- **React 18.2+**: UI library
- **Material UI 5.14+**: Component library
- **CSS3**: Styling and animations
- **Emotion**: CSS-in-JS styling support

## Future Enhancements

- Backend API integration
- Real email service integration
- User authentication
- Email composition form
- Advanced search and filters
- Email threading
- File upload for attachments
- Push notifications
- Keyboard shortcuts

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT License - Feel free to use this project for personal or commercial use.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Enjoy your Gmail-inspired email interface!** 📧✨
