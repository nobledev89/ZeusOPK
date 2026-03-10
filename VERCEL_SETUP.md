# Vercel Environment Variables Setup

To fix the Supabase URL error on your Vercel deployment, you need to add the environment variables to your Vercel project.

## Steps to Configure Environment Variables in Vercel:

1. **Go to your Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: **ZeusOPK**

2. **Navigate to Project Settings**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add the following environment variables:**

   ### Variable 1: VITE_SUPABASE_URL
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://vcfcmctwufipwsiemrtw.supabase.co`
   - **Environment:** Check all (Production, Preview, Development)

   ### Variable 2: VITE_SUPABASE_SERVICE_KEY
   - **Name:** `VITE_SUPABASE_SERVICE_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjZmNtY3R3dWZpcHdzaWVtcnR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA5MTQwMiwiZXhwIjoyMDg4NjY3NDAyfQ.5ognj7QUKT5THRioGqa0v1QnBJiiyqplIYXKiJff3ls`
   - **Environment:** Check all (Production, Preview, Development)

   ### Variable 3: VITE_ADMIN_USERNAME
   - **Name:** `VITE_ADMIN_USERNAME`
   - **Value:** `admin`
   - **Environment:** Check all (Production, Preview, Development)

   ### Variable 4: VITE_ADMIN_PASSWORD
   - **Name:** `VITE_ADMIN_PASSWORD`
   - **Value:** `Zeus2024!Admin`
   - **Environment:** Check all (Production, Preview, Development)

4. **Redeploy your application**
   - After adding all variables, go to the **Deployments** tab
   - Click on the three dots (...) next to your latest deployment
   - Select **Redeploy** to apply the environment variables

## Alternative: Quick Setup via Vercel Dashboard

You can also use this direct link structure:
```
https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

## Verification

After redeploying, your Vercel site should load without the "Missing VITE_SUPABASE_URL environment variable" error.

## Note

The environment variables are already configured locally in `.env.local` file, which is why the application works on `localhost:3000`.
