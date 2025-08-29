const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
}

// Create a .gitkeep file to ensure the directory is tracked
const gitkeepPath = path.join(dataDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '# This file ensures the data directory is tracked by git');
    console.log('Created .gitkeep file in data directory');
}

// Middleware
app.use(cors({
    origin: '*', // Allow requests from any frontend (adjust as needed)
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Set up multer for file uploads with better configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dataDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp to avoid conflicts
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${originalName}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// File upload endpoint with enhanced error handling
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }

        // File is already saved with timestamp prefix
        const filename = req.file.filename;
        const originalName = req.file.originalname;
        const filePath = path.join(dataDir, filename);
        
        // Verify file was actually saved
        if (!fs.existsSync(filePath)) {
            throw new Error('File was not saved to disk');
        }
        
        console.log(`File uploaded successfully: ${filename} (original: ${originalName})`);
        console.log(`File saved to: ${filePath}`);
        console.log(`File size: ${(req.file.size / 1024).toFixed(2)} KB`);
        
        res.json({ 
            success: true, 
            message: 'File uploaded successfully', 
            filename: filename,
            originalName: originalName,
            size: req.file.size,
            filePath: `/data/${filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'File upload failed: ' + error.message 
        });
    }
});

// API endpoint to save clippings
app.put('/api/clippings', (req, res) => {
    try {
        const clippings = req.body;
        const filePath = path.join(__dirname, 'clippings.json');
        
        // Write to file with proper formatting
        fs.writeFileSync(filePath, JSON.stringify(clippings, null, 2));
        
        console.log(`Clippings saved successfully: ${clippings.length} items`);
        res.json({ 
            success: true, 
            message: `Clippings saved successfully (${clippings.length} items)` 
        });
    } catch (error) {
        console.error('Error saving clippings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save clippings: ' + error.message 
        });
    }
});

// API endpoint to get clippings
app.get('/api/clippings', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'clippings.json');
        
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const clippings = JSON.parse(data);
            console.log(`Retrieved ${clippings.length} clippings`);
            res.json(clippings);
        } else {
            console.log('No clippings file found, returning empty array');
            res.json([]);
        }
    } catch (error) {
        console.error('Error reading clippings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to read clippings: ' + error.message 
        });
    }
});

// API endpoint to refresh clippings (for instant updates)
app.get('/api/refresh', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'clippings.json');
        
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const clippings = JSON.parse(data);
            console.log(`Refreshed ${clippings.length} clippings`);
            res.json({
                success: true,
                clippings: clippings,
                message: `Refreshed ${clippings.length} clippings`
            });
        } else {
            console.log('No clippings file found, returning empty array');
            res.json({
                success: true,
                clippings: [],
                message: 'No clippings found'
            });
        }
    } catch (error) {
        console.error('Error refreshing clippings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to refresh clippings: ' + error.message 
        });
    }
});

// API endpoint to list uploaded files
app.get('/api/files', (req, res) => {
    try {
        if (!fs.existsSync(dataDir)) {
            return res.json([]);
        }
        
        const files = fs.readdirSync(dataDir);
        const fileList = files.map(filename => {
            const filePath = path.join(dataDir, filename);
            const stats = fs.statSync(filePath);
            return {
                filename: filename,
                size: stats.size,
                uploadDate: stats.mtime,
                path: `/data/${filename}`
            };
        });
        
        res.json(fileList);
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to list files: ' + error.message 
        });
    }
});

// Serve uploaded files
app.use('/data', express.static(dataDir));

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is running', 
        dataDirectory: dataDir,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error: ' + error.message 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${dataDir}`);
    console.log('📰 Press Clippings API is ready');
    console.log('📤 File upload endpoint: POST /api/upload');
    console.log('📋 Clippings endpoint: GET/PUT /api/clippings');
});
