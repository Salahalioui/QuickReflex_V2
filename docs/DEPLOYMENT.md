# Deployment Guide

This guide covers deployment options for QuickReflex across different platforms.

## Replit Deployment (Recommended for quick start)

QuickReflex is optimized for Replit deployment:

1. Fork the repository to your Replit account
2. Set up database environment variables in Secrets
3. Click Deploy to enable Replit Deployments
4. Your app will be available at `https://your-repl-name.your-username.replit.app`

### Environment Variables for Replit
```bash
DATABASE_URL=your_neon_database_url
```

## Self-Hosted Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Web server (nginx/Apache) for production

### Build for Production
```bash
npm install
npm run build
npm start
```

### Docker Deployment
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

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=5000
```

## Cloud Platform Deployment

### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Railway
1. Connect repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy with automatic builds

### Heroku
1. Create Heroku app
2. Add Heroku PostgreSQL addon
3. Set config vars
4. Deploy via git

### DigitalOcean App Platform
1. Create app from GitHub
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy with auto-scaling

## Database Setup

### PostgreSQL Configuration
```sql
CREATE DATABASE quickreflex;
CREATE USER quickreflex_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE quickreflex TO quickreflex_user;
```

### Migration
```bash
npm run db:migrate
```

## Performance Optimization

### Production Checklist
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### PWA Requirements
- [ ] HTTPS enabled
- [ ] Service worker registered
- [ ] Web app manifest configured
- [ ] Offline functionality tested

## Monitoring

### Recommended Tools
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Lighthouse, Web Vitals
- **Errors**: Sentry, LogRocket
- **Analytics**: PostHog, Google Analytics

### Health Check Endpoint
```bash
GET /health
```

## Security

### Best Practices
- Enable HTTPS only
- Set security headers
- Validate all inputs
- Sanitize database queries
- Regular dependency updates

### Environment Security
- Never commit `.env` files
- Use secrets management
- Rotate database credentials
- Monitor access logs

## Backup Strategy

### Database Backups
```bash
# Daily automated backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### File Backups
- User uploaded data (if any)
- Configuration files
- SSL certificates

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check DATABASE_URL format
2. **Build failures**: Verify Node.js version compatibility
3. **PWA not installing**: Ensure HTTPS and valid manifest
4. **Timing accuracy issues**: Verify device calibration

### Debug Mode
```bash
NODE_ENV=development npm start
```

### Logs
Check application logs for:
- Database connection status
- API endpoint errors
- Service worker registration
- Timing calibration results

## Scaling

### Horizontal Scaling
- Load balancer configuration
- Database connection pooling
- Session storage (Redis)
- Static asset CDN

### Performance Monitoring
- Response time tracking
- Database query optimization
- Memory usage monitoring
- CPU utilization alerts

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Open GitHub issue with deployment details
4. Contact maintainers for critical issues