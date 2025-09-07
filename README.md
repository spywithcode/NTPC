# NTPC Press Clippings Portal

A comprehensive web application for managing and organizing press clippings for NTPC Limited. This portal provides an efficient way to store, categorize, and access press clippings with user-friendly interfaces for both administrators and regular users.

## Features

- 🔐 **User Authentication** - Secure login system with captcha verification
- 📊 **Dashboard** - Overview of clippings statistics and quick actions
- 📰 **View Clippings** - Browse, search, and filter press clippings by category and date
- 📤 **Upload Clippings** - Add new PDF clippings with metadata
- 🏷️ **Category Management** - Organize clippings by predefined categories
- 📅 **Date Navigation** - Easy year/month navigation for clippings
- 🔍 **Search & Filter** - Advanced search and filtering capabilities
- 📁 **Auto-Scan Data Folder** - Automatically detects and imports new PDFs placed in the data folder
- 👥 **Dual Portal Access** - Separate admin and user portals with different access levels

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Quick Start

For a quick setup guide, see [QUICK_START.md](./QUICK_START.md) for one-click installation instructions.

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3001`

3. **Open the Application**
   - Open your web browser
   - Navigate to `http://localhost:3001`
   - Choose between **Admin** or **User** portal

## Usage Instructions

### Accessing the Portal
1. Open `http://localhost:3001` in your browser
2. Click **Admin** for administrative access or **User** for regular access

### Admin Portal Login
- **Username:** `ntpc`
- **Password:** `admin123`

### User Portal
- Access press clippings in read-only mode
- Browse and search existing clippings
- No login required for user portal

## Project Structure

```
NTPC-main/
├── index.html                    # Main portal selection page
├── server.js                     # Backend Express server
├── package.json                  # Node.js dependencies and scripts
├── clippings.json                # Clippings data storage
├── QUICK_START.md                # Quick setup guide
├── README.md                     # This file
├── start.bat                     # Windows startup script
├── data/                         # Folder for uploaded PDF files
│   ├── .gitkeep                  # Ensures data folder is tracked
│   └── [uploaded PDFs]           # Uploaded press clipping files
├── ntpc-admin/                   # Admin portal files
│   └── index.html                # Admin interface
├── ntpc-user/                    # User portal files
│   └── index.html                # User interface
└── ntpc-shared/                  # Shared resources
    ├── css/
    │   └── style.css             # Application styling
    ├── images/
    │   ├── logo.png              # NTPC logo
    │   └── log_logo.png          # Additional logo
    └── js/
        └── app.js                # Frontend JavaScript functionality
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/clippings` | Retrieve all clippings |
| `PUT` | `/api/clippings` | Save/update clippings |
| `POST` | `/api/upload` | Upload PDF files |
| `GET` | `/api/files` | List uploaded files |
| `GET` | `/api/refresh` | Refresh clippings (auto-detects new PDFs) |
| `POST` | `/api/scan` | Manually scan data folder for new PDFs |
| `GET` | `/api/test` | Test server status |

## File Upload

- **Supported Format:** PDF only
- **File Size Limit:** 10MB
- **Storage Location:** `./data/` folder
- **File Naming:** Timestamp prefix to avoid conflicts
- **Auto-Detection:** Server automatically scans data folder on startup and refresh

## Local Development

The application is configured for local development:
- Files are saved to the local `data/` folder
- Server runs on `localhost:3001`
- Frontend connects to local backend APIs
- Automatic folder scanning for new PDFs

## Production Deployment

For production deployment on NTPC servers:
1. Update server URLs in frontend files from `localhost:3001` to production server
2. Configure proper file storage paths
3. Set up environment variables for configuration
4. Implement proper security measures
5. Configure firewall and access controls

## Troubleshooting

### Common Issues
- **Server won't start:** Check if port 3001 is available
- **File upload fails:** Ensure `data/` folder exists and has write permissions
- **Login issues:** Verify credentials (admin: `ntpc`/`admin123`)
- **Port already in use:** Kill process using port 3001 or change port in `server.js`
- **PDFs not showing:** Try manual scan or refresh from admin dashboard
- **Permission errors:** Run as administrator or check folder permissions

### Getting Help
- Check server console logs for detailed error messages
- Ensure all dependencies are installed with `npm install`
- Verify Node.js version with `node --version`

## Support

For technical support or questions:
- Contact the development team
- Check the [QUICK_START.md](./QUICK_START.md) for additional setup help
- Review server logs for error details

© 2025 NTPC Limited. All rights reserved.
