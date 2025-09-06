# NTPC Press Clippings Portal

A comprehensive web application for managing and organizing press clippings for NTPC Limited.

## Features

- 🔐 **User Authentication** - Secure login system with captcha verification
- 📊 **Dashboard** - Overview of clippings statistics and quick actions
- 📰 **View Clippings** - Browse, search, and filter press clippings by category and date
- 📤 **Upload Clippings** - Add new PDF clippings with metadata
- 🏷️ **Category Management** - Organize clippings by predefined categories
- 📅 **Date Navigation** - Easy year/month navigation for clippings
- 🔍 **Search & Filter** - Advanced search and filtering capabilities

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

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
   - Login with credentials:
     - **Username:** `ntpc`
     - **Password:** `admin123`

## Project Structure

```
NTPC_Press_Portal-main/
├── index.html          # Main application interface
├── app.js             # Frontend JavaScript functionality
├── style.css          # Application styling
├── server.js          # Backend Express server
├── package.json       # Node.js dependencies
├── clippings.json     # Sample clippings data
├── data/              # Folder for uploaded PDF files
├── assets/            # Application assets
└── logo.png           # NTPC logo
```

## API Endpoints

- `GET /api/clippings` - Retrieve all clippings
- `PUT /api/clippings` - Save/update clippings
- `POST /api/upload` - Upload PDF files
- `GET /api/files` - List uploaded files
- `GET /api/test` - Test server status

## File Upload

- **Supported Format:** PDF only
- **File Size Limit:** 10MB
- **Storage Location:** `./data/` folder
- **File Naming:** Timestamp prefix to avoid conflicts

## Local Development

The application is configured for local development:
- Files are saved to the local `data/` folder
- Server runs on `localhost:3001`
- Frontend connects to local backend APIs

## Production Deployment

For production deployment on NTPC servers:
1. Update server URLs in `app.js` from `localhost:3001` to production server
2. Configure proper file storage paths
3. Set up environment variables for configuration
4. Implement proper security measures

## Troubleshooting

- **Server won't start:** Check if port 3001 is available
- **File upload fails:** Ensure `data/` folder exists and has write permissions
- **Login issues:** Verify credentials in `app.js`

## Support

For technical support or questions, contact the development team.
