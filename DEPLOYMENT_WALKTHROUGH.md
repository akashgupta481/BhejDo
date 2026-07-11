# 🚀 Deployment Walkthrough

**Status**: PR #7 Merged ✅ | Version: v1.1.0 ✅ | Ready to Deploy!

Follow these steps to make your BhejDo app live!

---

## STEP 1: Deploy Backend to Render (5 minutes)

### Instructions:

1. **Open**: https://dashboard.render.com/

2. **Sign up/Login**:
   - Click "Continue with GitHub"
   - Authorize Render

3. **Create Blueprint**:
   - Click "New +" button (top right)
   - Select "Blueprint"

4. **Connect Repository**:
   - Select "akashgupta481/BhejDo"
   - Render detects `render.yaml` ✅

5. **Deploy**:
   - Click "Apply"
   - Wait 2-3 minutes for deployment

6. **Get Backend URL**:
   - Click on "bhejdo-backend" service
   - Copy URL at top (e.g., `https://bhejdo-backend-xyz.onrender.com`)
   - **Save this URL!** You need it for Step 2

7. **Test Backend**:
   - Visit: `[YOUR_BACKEND_URL]/api/health`
   - Should return: `{"success": true, ...}`

✅ **Backend URL**: ___________________________________

---

## STEP 2: Deploy Frontend to Vercel (3 minutes)

### Instructions:

1. **Open**: https://vercel.com/new

2. **Sign up/Login**:
   - Click "Continue with GitHub"
   - Authorize Vercel

3. **Import Repository**:
   - Search for "BhejDo"
   - Click "Import" next to akashgupta481/BhejDo

4. **Configure Project**:
   - Vercel auto-detects settings ✅
   - Framework: Vite
   - Root: `./frontend`

5. **⚠️ IMPORTANT: Add Environment Variable**:
   
   Scroll to "Environment Variables"
   
   ```
   Name:  VITE_API_URL
   Value: [YOUR_BACKEND_URL_FROM_STEP_1]
   ```
   
   Example: `https://bhejdo-backend-xyz.onrender.com`
   
   ⚠️ Do NOT include `/api` at the end!

6. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes

7. **Get Frontend URL**:
   - Copy Vercel URL (e.g., `https://bhejdo.vercel.app`)
   - **Save this URL!** You need it for Step 3

✅ **Frontend URL**: ___________________________________

---

## STEP 3: Update CORS in Backend (2 minutes)

### Instructions:

**Tell me your Vercel URL from Step 2**, and I'll automatically:
1. Update `backend/index.js` to allow your Vercel domain
2. Commit the change
3. Push to GitHub
4. Render will auto-redeploy with new CORS settings

Just reply with your Vercel URL like:
```
https://bhejdo-abc123.vercel.app
```

---

## STEP 4: Setup Auto-Deployment (3 minutes)

This enables automatic deployment for all future PRs.

### Get Vercel Credentials:

1. **Vercel Token**:
   - Go to: https://vercel.com/account/tokens
   - Click "Create Token"
   - Name: "GitHub Actions"
   - Scope: "Full Account"
   - Copy token (you won't see it again!)
   
   Token: ___________________________________

2. **Project ID**:
   - Go to Vercel Dashboard → Your Project
   - Settings → General
   - Copy "Project ID"
   
   Project ID: ___________________________________

3. **Org ID**:
   - Vercel → Profile → Settings
   - Copy "ID" or "Team ID"
   
   Org ID: ___________________________________

### Add to GitHub:

Go to: https://github.com/akashgupta481/BhejDo/settings/secrets/actions

Add 3 secrets:

```
Name:  VERCEL_TOKEN
Value: [your token]

Name:  VERCEL_PROJECT_ID  
Value: [your project ID]

Name:  VERCEL_ORG_ID
Value: [your org ID]
```

✅ **Auto-deployment enabled!**

---

## 🎉 Testing Your Live App

1. Visit your Vercel URL
2. Try logging in with demo accounts:
   - Sender: `sender@bhejdo.com` / `password123`
   - Traveler: `traveler@bhejdo.com` / `password123`
3. Check browser console for errors
4. Test creating a shipment

---

## 🔄 Future Deployments (Automatic!)

After Step 4, every PR merge automatically:
1. Bumps version based on label
2. Creates GitHub release
3. Deploys to Vercel
4. Goes live in 2-3 minutes

**No manual steps needed!**

---

## 📝 Quick Links

- **Backend Dashboard**: https://dashboard.render.com/
- **Frontend Dashboard**: https://vercel.com/dashboard
- **GitHub Secrets**: https://github.com/akashgupta481/BhejDo/settings/secrets/actions
- **GitHub Releases**: https://github.com/akashgupta481/BhejDo/releases
- **Workflow Runs**: https://github.com/akashgupta481/BhejDo/actions

---

## 🆘 Troubleshooting

### Backend Issues:
- **500 errors**: Check Render logs, verify JWT_SECRET is set
- **Not starting**: Check Render logs for errors

### Frontend Issues:
- **Can't connect**: Verify VITE_API_URL in Vercel settings
- **CORS errors**: Complete Step 3 (update CORS)
- **Build fails**: Check Vercel deployment logs

### Workflow Issues:
- **Deploy fails**: Check GitHub Actions logs
- **Missing secrets**: Verify all 3 secrets are set in GitHub

---

## 💬 Need Help?

I'm here to help! Just tell me:
- Where you're stuck
- What error you're seeing
- Which step you're on

Let's get your app live! 🚀
