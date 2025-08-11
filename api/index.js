const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// PWA asset routes with proper MIME types
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
});

app.get('/icon-*.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(path.join(process.cwd(), 'public', req.path));
});

// Serve static files from the built client
const publicPath = path.join(process.cwd(), 'dist', 'public');

// Check if the build directory exists
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  
  // Handle all other routes - serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Fallback for development or if build doesn't exist
  app.get('*', (req, res) => {
    res.status(404).json({ 
      error: 'Application not built. Please run npm run build first.',
      path: publicPath,
      exists: fs.existsSync(publicPath)
    });
  });
}

// Export for Vercel
module.exports = app;