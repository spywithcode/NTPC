const fs = require('fs');
const path = require('path');

// Test the data directory
console.log('🧪 Testing NTPC Press Portal Upload Functionality...\n');

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
if (fs.existsSync(dataDir)) {
    console.log('✅ Data directory exists:', dataDir);
    
    // List files in data directory
    const files = fs.readdirSync(dataDir);
    if (files.length === 0) {
        console.log('📁 Data directory is empty (ready for uploads)');
    } else {
        console.log(`📁 Found ${files.length} file(s) in data directory:`);
        files.forEach(file => {
            const filePath = path.join(dataDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
    }
} else {
    console.log('❌ Data directory does not exist');
}

// Check if clippings.json exists
const clippingsPath = path.join(__dirname, 'clippings.json');
if (fs.existsSync(clippingsPath)) {
    const clippingsData = fs.readFileSync(clippingsPath, 'utf8');
    const clippings = JSON.parse(clippingsData);
    console.log(`\n✅ Clippings file exists with ${clippings.length} entries`);
    
    // Show recent clippings
    if (clippings.length > 0) {
        console.log('\n📰 Recent clippings:');
        clippings.slice(0, 3).forEach((clipping, index) => {
            console.log(`   ${index + 1}. ${clipping.title}`);
            console.log(`      Date: ${clipping.date} | Category: ${clipping.category}`);
            console.log(`      File: ${clipping.url.split('/').pop()}`);
        });
    }
} else {
    console.log('\n❌ Clippings file does not exist');
}

// Check server status
console.log('\n🌐 To test the upload functionality:');
console.log('   1. Start the server: node server.js');
console.log('   2. Open test-upload.html in your browser');
console.log('   3. Upload a PDF file');
console.log('   4. Check the data folder for the uploaded file');
console.log('   5. View the clipping in the main application');

console.log('\n📁 Expected file structure:');
console.log('   ntpc-main/');
console.log('   ├── data/           (PDF files stored here)');
console.log('   ├── clippings.json  (clipping metadata)');
console.log('   ├── server.js       (backend server)');
console.log('   ├── app.js          (frontend logic)');
console.log('   └── index.html      (main application)');
