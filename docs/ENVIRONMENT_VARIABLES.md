# Environment Variables Template

## Backend (Render/Railway)

```env
# Required
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001

# Optional (auto-set by platform)
DATABASE_URL=file:./bhejdo.db
```

### How to Set on Render:
1. Dashboard → Your Service → Environment
2. Add each variable
3. Click "Save Changes" (auto-redeploys)

### How to Set on Railway:
1. Dashboard → Your Project → Variables
2. Click "New Variable"
3. Add each variable
4. Railway auto-redeploys

---

## Frontend (Vercel)

```env
# Required - Your backend URL
VITE_API_URL=https://your-backend.onrender.com

# Or if using Railway:
# VITE_API_URL=https://your-backend.railway.app
```

### How to Set on Vercel:
1. Dashboard → Your Project → Settings → Environment Variables
2. Add `VITE_API_URL`
3. Set for "Production" environment
4. Click "Save"
5. Redeploy from Deployments tab

---

## GitHub Actions Secrets

Go to: GitHub Repo → Settings → Secrets and variables → Actions

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_PROJECT_ID=<your-project-id>
VERCEL_ORG_ID=<your-org-id>
```

### How to Get Values:

**VERCEL_TOKEN:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Copy the token (you won't see it again!)

**VERCEL_PROJECT_ID:**
1. Go to your project on Vercel
2. Settings → General
3. Copy "Project ID"

**VERCEL_ORG_ID:**
1. Go to Vercel dashboard
2. Click your profile → Settings
3. Copy "Team ID" or "User ID"

---

## Security Notes

⚠️ **NEVER commit these files:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing secrets

✅ **These are already in `.gitignore`**

🔒 **Generate strong JWT_SECRET:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64

# Using Python
python3 -c "import secrets; print(secrets.token_hex(64))"
```

---

## Local Development

Create these files for local development:

**`backend/.env`** (optional, has defaults):
```env
PORT=3001
JWT_SECRET=local-dev-secret-key
NODE_ENV=development
```

**`frontend/.env.local`** (optional, has defaults):
```env
VITE_API_URL=http://localhost:3001
```

---

## Testing Environment Variables

### Test Backend:
```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-07-11T09:00:00.000Z",
    "uptime": 123.456
  },
  "message": "BhejDo API is running."
}
```

### Test Frontend:
1. Open your Vercel URL in browser
2. Open DevTools (F12) → Console
3. Look for API calls to your backend URL
4. Should NOT see CORS errors

---

## Common Issues

**Backend returns 500 on Render/Railway:**
- Check if `JWT_SECRET` is set
- View logs in platform dashboard
- Verify database initialized

**Frontend can't connect to backend:**
- Check `VITE_API_URL` in Vercel
- Verify backend URL is correct
- Test backend health endpoint directly

**CORS errors in browser:**
- Update `backend/index.js` CORS config
- Add your Vercel URL to allowed origins
- Redeploy backend

---

## Production Checklist

- [ ] JWT_SECRET is strong and random (not "local-dev-secret-key")
- [ ] VITE_API_URL points to production backend
- [ ] CORS includes your Vercel domain
- [ ] All secrets set in GitHub Actions
- [ ] Test health endpoint returns 200
- [ ] Test login flow works
- [ ] Check browser console for errors
