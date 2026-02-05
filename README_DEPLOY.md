
# Deployment Guide (Vercel)

Follow these steps to deploy **CreatorIntel AI**:

### 1. Prepare your Repository
Ensure all files are committed to your GitHub/GitLab/Bitbucket repository.

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New" -> "Project"**.
2. Import your repository.
3. In the **"Build & Development Settings"**, leave them as default (Vercel will detect it as a static site).

### 3. Configure Environment Variables
Before clicking "Deploy", open the **Environment Variables** section and add:
- **Key:** `API_KEY` | **Value:** (Your Gemini Key)
- **Key:** `META_ACCESS_TOKEN` | **Value:** (Your Meta Token)

### 4. Deploy
Click **Deploy**. Your app will be live on a `.vercel.app` domain.

### 5. Meta Token Note
Ensure your Meta token is a **Long-Lived Page Access Token** to prevent the app from breaking every 60 minutes.
