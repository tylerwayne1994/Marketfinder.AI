# Complete Deployment Guide for Marketfinder.AI

## Frontend (Vercel) Setup

### 1. Configure Vercel Project
- Ensure your project is connected to your GitHub repository
- Set build settings:
  - Framework Preset: Create React App
  - Build Command: `npm run build`
  - Output Directory: `build`
  - Install Command: `npm install`

### 2. Set Environment Variables
- Add these environment variables in Vercel:
  - `REACT_APP_BACKEND_URL`: `https://marketfinder-ai.onrender.com`

### 3. Ensure Static Files Work Correctly
- The `vercel.json` file has been added to your project
- This ensures proper serving of `manifest.json` and other static files
- It also handles SPA routing by forwarding all routes to index.html

### 4. API Proxy for CORS-Free Communication
- The `/api/proxy.js` file has been added to your project
- This provides a serverless function that proxies requests to your backend
- It eliminates CORS issues by handling cross-origin communication server-side
- To use it, replace direct backend calls with calls to the proxy:
  ```javascript
  // Instead of:
  fetch(`${backendUrl}/api/some/endpoint?param=value`)
  
  // Use:
  fetch(`/api/proxy?endpoint=/api/some/endpoint&param=value`)
  ```

## Backend (Render) Setup

### 1. Configure Environment Variables
- Log into your Render dashboard
- Open your `marketfinder-ai` service
- Go to Environment tab and add/update:
  - `ALLOWED_ORIGINS`: Add your frontend URL:
    ```
    http://localhost:5173,http://localhost:3000,https://marketfinder-ai-git-main-tyler-torres-projects.vercel.app,https://your-domain.com
    ```
  - `FRONTEND_URL`: `https://marketfinder-ai-git-main-tyler-torres-projects.vercel.app`

### 2. Deploy Latest Changes
- The backend code has been updated to allow CORS from all origins
- Deploy the latest changes through Render dashboard or GitHub integration

## Testing the Deployment

### 1. Check for CORS Issues
- Open your deployed frontend URL
- Open browser developer tools (F12)
- Navigate through your application
- Check console for CORS errors
- If you see CORS errors, check that you've:
  - Updated Render environment variables
  - Deployed latest backend code
  - Or use the proxy solution to bypass CORS entirely

### 2. Verify Static File Access
- Check that manifest.json loads correctly
- In browser developer tools, check Network tab
- Look for manifest.json requests and verify they return 200 OK
- If still seeing 401 errors, verify your vercel.json is deployed

### 3. Test Stripe Integration
- Complete a test checkout flow
- Verify redirect back to your application works
- Check that subscription status is updated correctly

## Troubleshooting

### CORS Issues
- If CORS errors persist, use the proxy approach:
  1. Modify frontend code to use `/api/proxy?endpoint=...` instead of direct backend calls
  2. Deploy updated frontend code

### Static File 401 Errors
- Check Vercel deployment logs for any issues with vercel.json
- Verify that the static files are included in the build output
- Consider using a different approach for PWA manifest if problems persist

### Stripe Redirect Problems
- Ensure `FRONTEND_URL` environment variable is correctly set in your backend
- Check webhook configuration in Stripe dashboard
- Verify webhook endpoint is accessible from Stripe

## Maintenance Notes

- When changing frontend deployment URLs, update the ALLOWED_ORIGINS in Render
- When adding new API endpoints, ensure they're handled correctly by the CORS configuration
- For production deployments, restrict CORS to specific domains rather than using wildcard "*"
