# Deployment Guide for QuickReflex

## Vercel Deployment

QuickReflex is configured for easy deployment on Vercel with the included configuration files.

### Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Environment Variables**: Prepare any required environment variables

### Deployment Steps

#### Option 1: Automatic Deployment (Recommended)

1. **Connect Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

2. **Configure Build Settings**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist/public` (auto-configured)
   - Install Command: `npm install` (auto-detected)

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll receive a production URL

#### Option 2: Command Line Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From your project root
   vercel --prod
   ```

### Configuration Files

The following files are included for Vercel deployment:

- **`vercel.json`**: Main Vercel configuration
- **`api/index.js`**: Serverless function entry point
- **`.vercelignore`**: Files to exclude from deployment

### Environment Variables

If your application requires environment variables:

1. **In Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add your variables (e.g., `DATABASE_URL`)

2. **Common Variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=your_postgresql_connection_string
   ```

### PWA Considerations

The deployment is configured to properly serve PWA assets:

- **Manifest**: Served with correct MIME type (`application/manifest+json`)
- **Service Worker**: Served with correct MIME type (`application/javascript`)
- **Icons**: SVG icons served with proper content type

### Build Process

The build process includes:

1. **Frontend Build**: React app built with Vite
2. **Backend Bundle**: Server code bundled with esbuild
3. **Static Assets**: Copied to deployment directory
4. **PWA Assets**: Manifest and service worker properly configured

### Troubleshooting

#### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify build command runs locally: `npm run build`

2. **Runtime Errors**
   - Check Vercel function logs in dashboard
   - Verify environment variables are set

3. **PWA Not Working**
   - Ensure HTTPS is enabled (automatic on Vercel)
   - Check service worker registration in browser dev tools

4. **Static Assets Not Loading**
   - Verify `dist/public` directory is created during build
   - Check file paths in deployed application

#### Debugging

1. **Check Build Logs**
   - View detailed build logs in Vercel dashboard
   - Look for TypeScript errors or missing dependencies

2. **Check Function Logs**
   - Monitor serverless function execution in Vercel dashboard
   - Check for runtime errors or timeout issues

3. **Local Testing**
   ```bash
   # Test production build locally
   npm run build
   npm start
   ```

### Performance Optimization

The deployment includes several optimizations:

- **Static Asset Caching**: Automatic CDN caching
- **Code Splitting**: Automatic chunk optimization
- **Compression**: Gzip compression enabled
- **Edge Functions**: Fast global distribution

### Custom Domain

To use a custom domain:

1. **In Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS settings as instructed

2. **SSL Certificate**
   - Automatically provisioned by Vercel
   - HTTPS enforced for PWA compliance

### Monitoring

After deployment:

1. **Check PWA Installation**
   - Visit your site on mobile/desktop
   - Verify install prompt appears
   - Test offline functionality

2. **Performance Testing**
   - Use browser dev tools to check loading times
   - Verify service worker is active
   - Test PWA features

### Updates

To update your deployment:

1. **Push to GitHub**
   - Commit and push changes to your repository
   - Vercel automatically rebuilds and deploys

2. **Manual Redeploy**
   - Use Vercel dashboard to trigger manual deployment
   - Or use CLI: `vercel --prod`

## Alternative Deployment Options

### Netlify

For Netlify deployment, create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Railway

For Railway deployment:

1. Connect your GitHub repository
2. Railway will auto-detect the Node.js app
3. Set environment variables in Railway dashboard

### Docker Deployment

For containerized deployment, create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Support

For deployment issues:

- Check the [Vercel documentation](https://vercel.com/docs)
- Review build logs for specific error messages
- Test locally before deploying
- Ensure all environment variables are properly configured