# Quick Start Guide

Get the Gmail Dark Theme app up and running in 5 minutes!

## 🚀 Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

The app will open automatically at `http://localhost:3000`

## 📋 What's Included

✅ Gmail-inspired dark UI with blue accent  
✅ Responsive design (desktop, tablet, mobile)  
✅ 5 React components with Material UI  
✅ 6 sample emails with realistic data  
✅ Search functionality  
✅ Email folder navigation  
✅ Star/favorite emails feature  
✅ Full email viewer  

## 🎯 Features at a Glance

| Feature | Location | How to Use |
|---------|----------|-----------|
| **Search** | Top navbar | Type to search emails |
| **Folders** | Left sidebar | Click to view emails |
| **Compose** | Sidebar top button | Click to write email |
| **View Email** | Center-right panel | Click email to view |
| **Star Email** | Email row star icon | Click star to favorite |
| **Email Actions** | Email viewer footer | Reply, Forward options |

## 📂 File Structure at a Glance

```
src/
├── App.js                 ← Main app component
├── components/            ← React components
│   ├── Navbar.js
│   ├── Sidebar.js
│   ├── EmailList.js
│   ├── EmailItem.js
│   └── EmailViewer.js
└── styles/               ← CSS files
    ├── theme.css         ← Colors & variables
    └── App.css           ← Layout styles
```

## 🎨 Customizing Colors

Edit `src/styles/theme.css`:

```css
:root {
  --primary-bg: #0f0f0f;    /* Dark background */
  --accent: #8ab4f8;        /* Blue accent */
  --text-primary: #ffffff;  /* White text */
}
```

[See CUSTOMIZATION.md for more themes](CUSTOMIZATION.md)

## 📱 Testing Responsive Design

### Method 1: Browser DevTools
1. Press `F12` to open DevTools
2. Click device toggle icon (mobile phone)
3. Select device or resize window

### Method 2: Different Breakpoints
- **Desktop**: 1024px+
- **Tablet**: 768px-1023px  
- **Mobile**: Below 768px

## 🔧 Available Commands

```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
npm run eject      # Eject configuration (cannot undo!)
```

## 💡 Sample Data

The app comes with 6 sample emails. To see different folder contents:

1. **Inbox**: All emails (main folder)
2. **Spam**: Every 5th email
3. **Sent**: Every 3rd email
4. **Drafts**: Every 7th email
5. **Starred**: Only starred emails

To modify sample data, edit `SAMPLE_EMAILS` in `src/App.js`

## ⚡ Quick Tips

1. **Search works!** Try searching for sender name or subject
2. **Click any email** to view full content
3. **Star/unstar emails** by clicking the star icon
4. **Responsive** - try resizing window or opening on mobile
5. **Folder counts** update based on your actions

## 🎯 Next Steps

### For Beginners
1. Read [README.md](README.md)
2. Explore component files
3. Change colors in [theme.css](src/styles/theme.css)

### For Customization
1. See [CUSTOMIZATION.md](CUSTOMIZATION.md)
2. Modify email data in [App.js](src/App.js)
3. Add new components in `src/components/`

### For Backend Integration
1. Replace `SAMPLE_EMAILS` with API calls
2. Update folder counts from server
3. Add authentication

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Kill process on port 3000 and try again
# Or use a different port
PORT=3001 npm start
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Styles not loading?**
```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Then restart server
npm start
```

**Material UI icons missing?**
```bash
npm install @mui/icons-material @emotion/react @emotion/styled
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Material UI Components](https://mui.com/material-ui/)
- [CSS Grid & Flexbox](https://www.w3schools.com/css/)
- [JavaScript ES6](https://www.w3schools.com/js/js_es6.asp)

## 🎉 You're All Set!

The app is ready to use. Start by:
1. Searching for an email
2. Clicking different folders
3. Clicking on emails to view
4. Customizing colors to your liking

Enjoy your Gmail-inspired interface! 📧✨

---

**Questions?** Check [README.md](README.md) or [CUSTOMIZATION.md](CUSTOMIZATION.md)
