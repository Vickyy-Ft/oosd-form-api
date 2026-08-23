# Deployment Guide

This guide covers deploying the Accessible Form Assistant to production environments.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All API keys are configured and tested
- [ ] Security review completed
- [ ] Accessibility audit passed
- [ ] Performance testing completed
- [ ] Error handling tested
- [ ] Privacy policy reviewed
- [ ] HTTPS certificates ready
- [ ] Backup strategy in place
- [ ] Monitoring tools configured

## Environment Configuration

### Production Environment Variables

**Backend `.env` (Production)**:
```env
NODE_ENV=production
PORT=3001

# CORS - Set to your frontend domain
FRONTEND_URL=https://your-domain.com

# OpenAI API
OPENAI_API_KEY=your_production_openai_key

# Google Cloud TTS (optional but recommended)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_TTS_API_KEY=your_production_tts_key

# Session Configuration
SESSION_TIMEOUT_MS=3600000
MAX_FILE_SIZE_MB=10

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Best Practices

1. **Never commit secrets**:
   - Use environment variables
   - Use secret management services (AWS Secrets Manager, Azure Key Vault)
   - Rotate API keys regularly

2. **HTTPS Only**:
   - Enforce HTTPS in production
   - Use valid SSL certificates
   - Implement HSTS headers

3. **CORS Configuration**:
   - Restrict to specific domains
   - No wildcard (*) origins

4. **Rate Limiting**:
   - Keep enabled in production
   - Adjust limits based on usage

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel provides excellent support for React/Vite applications.

#### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Configure**:
   - Set environment variables in Vercel dashboard
   - Configure custom domain
   - Enable HTTPS (automatic)

#### Vercel Configuration (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.com/api/:path*"
    }
  ]
}
```

### Option 2: Netlify

1. **Build**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or connect GitHub**:
   - Link repository in Netlify dashboard
   - Set build command: `cd frontend && npm run build`
   - Set publish directory: `frontend/dist`

### Option 3: AWS S3 + CloudFront

1. **Build**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name/ --delete
   ```

3. **Configure CloudFront**:
   - Create distribution pointing to S3 bucket
   - Configure SSL certificate
   - Set up custom domain

4. **Invalidate cache after deployment**:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
   ```

## Backend Deployment

### Option 1: Heroku

1. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set FRONTEND_URL=https://your-frontend.com
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

4. **Scale**:
   ```bash
   heroku ps:scale web=1
   ```

### Option 2: DigitalOcean App Platform

1. **Connect repository** in DigitalOcean dashboard

2. **Configure build**:
   - Source directory: `backend`
   - Build command: `npm install`
   - Run command: `npm start`

3. **Set environment variables** in dashboard

4. **Deploy** - automatic on git push

### Option 3: AWS Elastic Beanstalk

1. **Install EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize**:
   ```bash
   cd backend
   eb init
   ```

3. **Create environment**:
   ```bash
   eb create production-env
   ```

4. **Set environment variables**:
   ```bash
   eb setenv OPENAI_API_KEY=your_key FRONTEND_URL=https://your-frontend.com
   ```

5. **Deploy**:
   ```bash
   eb deploy
   ```

### Option 4: VPS (DigitalOcean, Linode, AWS EC2)

1. **Set up server**:
   ```bash
   # SSH into server
   ssh user@your-server-ip

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and configure**:
   ```bash
   git clone your-repo-url
   cd accessible-form-assistant/backend
   npm install --production
   
   # Create .env file
   nano .env
   # Add your production environment variables
   ```

3. **Start with PM2**:
   ```bash
   pm2 start server.js --name "form-assistant-api"
   pm2 save
   pm2 startup
   ```

4. **Set up Nginx reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable HTTPS with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.your-domain.com
   ```

## Database and Storage (if needed)

Currently, the app doesn't use a database, but if you extend it:

### Session Storage Options:
- Redis (for session management)
- MongoDB (for form templates)
- PostgreSQL (for analytics)

### File Storage Options:
- AWS S3 (for temporary file storage)
- Google Cloud Storage
- Azure Blob Storage

## Post-Deployment Verification

### Checklist

1. **Frontend**:
   - [ ] Site loads on HTTPS
   - [ ] All pages accessible
   - [ ] API calls work
   - [ ] PWA installable
   - [ ] Service worker registered

2. **Backend**:
   - [ ] Health check responds: `curl https://api.your-domain.com/api/health`
   - [ ] CORS configured correctly
   - [ ] Rate limiting active
   - [ ] File uploads work
   - [ ] All API endpoints respond

3. **Integration**:
   - [ ] Form extraction works
   - [ ] Simplification works
   - [ ] TTS works
   - [ ] STT works
   - [ ] PDF generation works
   - [ ] Downloads work

4. **Security**:
   - [ ] HTTPS enforced
   - [ ] API keys not exposed
   - [ ] CORS restricted
   - [ ] Rate limiting active
   - [ ] No sensitive data in logs

5. **Accessibility**:
   - [ ] Screen readers work
   - [ ] Keyboard navigation works
   - [ ] Touch targets adequate
   - [ ] Color contrast passes

### Load Testing

Test with expected load:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoint
ab -n 100 -c 10 https://api.your-domain.com/api/health
```

Expected results:
- Response time < 500ms
- No failed requests
- Handles concurrent users

## Monitoring and Maintenance

### Monitoring Tools

1. **Uptime Monitoring**:
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

2. **Application Monitoring**:
   - Sentry (error tracking)
   - LogRocket (session replay)
   - New Relic (APM)

3. **Analytics** (Privacy-Compliant):
   - Plausible (privacy-friendly)
   - Simple Analytics
   - Self-hosted Matomo

### Logging

**Backend Logging**:
```javascript
// Add structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

**Important**: Never log sensitive user data (form content, audio, personal information)

### Backup Strategy

1. **API Keys**: Store securely in password manager
2. **Form Templates**: Version control + cloud backup
3. **Configuration**: Environment variables documented
4. **Code**: Git repository with tags for releases

### Maintenance Tasks

**Daily**:
- Monitor error rates
- Check uptime
- Review logs for issues

**Weekly**:
- Check API usage and costs
- Review performance metrics
- Update dependencies (if security patches available)

**Monthly**:
- Full backup verification
- Security audit
- Performance optimization review
- Cost analysis

## Scaling Considerations

### Horizontal Scaling

If traffic increases:

1. **Frontend**: CDN handles this automatically

2. **Backend**: 
   - Use load balancer
   - Deploy multiple instances
   - Use Redis for session sharing
   - Implement queue system for heavy tasks

### Cost Optimization

1. **Cache TTS responses** for common phrases
2. **Compress images** before sending to API
3. **Batch simplification requests** when possible
4. **Monitor API usage** and set budgets
5. **Use reserved instances** for predictable load

### API Cost Estimates

**Per Form Completion** (approximate):
- Vision extraction: $0.01
- Simplification (10 fields): $0.05
- TTS (500 words): $0.02
- STT (2 minutes): $0.012
- **Total**: ~$0.09 per form

**For 1000 forms/month**:
- Estimated cost: $90/month
- Add 20% buffer: $108/month

## Rollback Procedure

If deployment fails:

1. **Frontend**:
   ```bash
   # Vercel
   vercel rollback
   
   # Netlify
   netlify deploy --prod --alias=previous-version
   
   # S3/CloudFront
   # Restore from previous backup
   ```

2. **Backend**:
   ```bash
   # Heroku
   heroku rollback
   
   # PM2 (VPS)
   git checkout previous-tag
   npm install
   pm2 restart form-assistant-api
   ```

## Troubleshooting Production Issues

### High Error Rate

1. Check API key validity
2. Review error logs
3. Check third-party service status
4. Verify CORS configuration

### Slow Performance

1. Check API response times
2. Review image sizes being processed
3. Check network latency
4. Review server resources

### High Costs

1. Review API usage patterns
2. Implement better caching
3. Optimize image compression
4. Add usage alerts

## Support and Updates

### Staying Updated

- Monitor OpenAI API changes
- Check Google Cloud TTS updates
- Review React/Node.js security advisories
- Subscribe to accessibility best practices

### Getting Help

- Check logs first
- Review error messages
- Test in staging environment
- Contact API providers support if needed

---

**Remember**: Always test in a staging environment before deploying to production!
