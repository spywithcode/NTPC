const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3001;

// Logging middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

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

// Function to scan data folder and detect new PDFs
function scanDataFolderAndSync() {
    try {
        console.log('🔍 Scanning data folder for PDFs...');
        
        // Get current clippings
        const clippingsPath = path.join(__dirname, 'clippings.json');
        let currentClippings = [];
        
        if (fs.existsSync(clippingsPath)) {
            try {
                const data = fs.readFileSync(clippingsPath, 'utf8');
                currentClippings = JSON.parse(data);
            } catch (error) {
                console.error('Error reading existing clippings:', error);
                currentClippings = [];
            }
        }
        
        // Get all PDF files from data directory
        const files = fs.readdirSync(dataDir);
        const pdfFiles = files.filter(filename => 
            filename.toLowerCase().endsWith('.pdf') && 
            filename !== '.gitkeep'
        );
        
        console.log(`📁 Found ${pdfFiles.length} PDF files in data directory`);
        
        // Track new files added
        let newFilesAdded = 0;
        let existingUrls = new Set(currentClippings.map(c => c.url));
        
        // Process each PDF file
        pdfFiles.forEach(filename => {
            const filePath = path.join(dataDir, filename);
            const relativeUrl = `/data/${filename}`;
            
            // Check if this PDF is already in clippings
            if (!existingUrls.has(relativeUrl)) {
                try {
                    const stats = fs.statSync(filePath);
                    
                    // Generate metadata for new PDF
                    const newClipping = {
                        id: currentClippings.length ? Math.max(...currentClippings.map(c => c.id)) + 1 : 1,
                        title: filename.replace(/\.pdf$/i, '').replace(/^\d+_/, ''), // Remove timestamp prefix if present
                        date: stats.birthtime.toISOString().split('T')[0], // Use creation date
                        category: "Uncategorized",
                        description: "Uploaded directly to data folder",
                        url: relativeUrl
                    };
                    
                    // Add to clippings array
                    currentClippings.push(newClipping);
                    newFilesAdded++;
                    
                    console.log(`✅ Added new PDF: ${filename}`);
                    console.log(`   Title: ${newClipping.title}`);
                    console.log(`   Date: ${newClipping.date}`);
                    console.log(`   URL: ${newClipping.url}`);
                    
                } catch (error) {
                    console.error(`Error processing file ${filename}:`, error);
                }
            }
        });
        
        // Save updated clippings if new files were added
        if (newFilesAdded > 0) {
            try {
                fs.writeFileSync(clippingsPath, JSON.stringify(currentClippings, null, 2));
                console.log(`💾 Updated clippings.json with ${newFilesAdded} new PDFs`);
            } catch (error) {
                console.error('Error saving updated clippings:', error);
                throw error;
            }
        } else {
            console.log('📋 No new PDFs found, clippings.json is up to date');
        }
        
        return {
            success: true,
            totalFiles: pdfFiles.length,
            newFilesAdded: newFilesAdded,
            totalClippings: currentClippings.length,
            clippings: currentClippings
        };
        
    } catch (error) {
        console.error('❌ Error scanning data folder:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Middleware
app.use(cors({
    origin: '*', // Allow requests from any frontend (adjust as needed)
}));

app.use(express.json({ limit: '10mb' }));

console.log('Static folder paths:');
console.log('ntpc-admin:', path.join(__dirname, 'ntpc-admin'));
console.log('ntpc-user:', path.join(__dirname, 'ntpc-user'));
console.log('ntpc-shared:', path.join(__dirname, 'ntpc-shared'));

app.use('/ntpc-admin', express.static(path.join(__dirname, 'ntpc-admin')));
app.use('/ntpc-user', express.static(path.join(__dirname, 'ntpc-user')));
app.use('/ntpc-shared', express.static(path.join(__dirname, 'ntpc-shared')));

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

// API endpoint to refresh clippings (for instant updates and folder scanning)
app.get('/api/refresh', (req, res) => {
    try {
        console.log('🔄 Refresh endpoint called - scanning for new PDFs...');
        
        // Scan data folder and sync with clippings
        const scanResult = scanDataFolderAndSync();
        
        if (scanResult.success) {
            console.log(`✅ Refresh completed successfully`);
            console.log(`   Total PDFs: ${scanResult.totalFiles}`);
            console.log(`   New files added: ${scanResult.newFilesAdded}`);
            console.log(`   Total clippings: ${scanResult.totalClippings}`);
            
            res.json({
                success: true,
                clippings: scanResult.clippings,
                message: `Refresh completed. ${scanResult.newFilesAdded} new PDFs detected and added.`,
                stats: {
                    totalFiles: scanResult.totalFiles,
                    newFilesAdded: scanResult.newFilesAdded,
                    totalClippings: scanResult.totalClippings
                }
            });
        } else {
            throw new Error(scanResult.error || 'Failed to scan data folder');
        }
        
    } catch (error) {
        console.error('Error refreshing clippings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to refresh clippings: ' + error.message 
        });
    }
});

// API endpoint to manually scan data folder (for admin use)
app.post('/api/scan', (req, res) => {
    try {
        console.log('🔍 Manual scan endpoint called - scanning data folder...');
        
        // Scan data folder and sync with clippings
        const scanResult = scanDataFolderAndSync();
        
        if (scanResult.success) {
            console.log(`✅ Manual scan completed successfully`);
            console.log(`   Total PDFs: ${scanResult.totalFiles}`);
            console.log(`   New files added: ${scanResult.newFilesAdded}`);
            console.log(`   Total clippings: ${scanResult.totalClippings}`);
            
            res.json({
                success: true,
                clippings: scanResult.clippings,
                message: `Manual scan completed. ${scanResult.newFilesAdded} new PDFs detected and added.`,
                stats: {
                    totalFiles: scanResult.totalFiles,
                    newFilesAdded: scanResult.newFilesAdded,
                    totalClippings: scanResult.totalClippings
                }
            });
        } else {
            throw new Error(scanResult.error || 'Failed to scan data folder');
        }
        
    } catch (error) {
        console.error('Error during manual scan:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to scan data folder: ' + error.message 
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
    console.log('🔄 Refresh endpoint: GET /api/refresh (auto-detects new PDFs)');
    
    // Scan data folder on server startup
    console.log('🔍 Performing initial data folder scan...');
    const initialScan = scanDataFolderAndSync();
    if (initialScan.success) {
        console.log(`✅ Initial scan completed: ${initialScan.newFilesAdded} new PDFs found`);
    } else {
        console.log(`❌ Initial scan failed: ${initialScan.error}`);
    }
});
