# Rydex Deployment Guide

## 🚀 Frontend Deployment (Vercel)

### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click "New Project"
3. Import your GitHub repository: `akarshra/Rydex`
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `rydex`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: Environment Variables
Add these environment variables in Vercel dashboard:

```
NEXT_PUBLIC_BACKEND_URL=https://your-render-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXTAUTH_URL=https://your-vercel-app.vercel.app
MONGODB_URL=your-mongodb-connection-string
NEXT_PUBLIC_SOCKET_URL=https://your-render-socketserver.onrender.com
NEXTAUTH_SECRET=your-secure-random-string
JWT_SECRET=your-jwt-secret
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

### Step 3: Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your frontend

---

## 🔧 Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com) and sign in
2. Connect your GitHub repository

### Step 2: Create Databases
Create three databases in Render:

#### PostgreSQL Database
- **Service Type**: PostgreSQL
- **Name**: `rydex-postgres`
- **Database**: `rydex`
- **Username**: `rydex_user`

#### Redis Database
- **Service Type**: Redis
- **Name**: `rydex-redis`

#### MongoDB Database
- **Service Type**: MongoDB
- **Name**: `rydex-mongo`

### Step 3: Deploy Backend Service
1. Click "New" → "Web Service"
2. Connect your GitHub repo: `akarshra/Rydex`
3. Configure:
   - **Name**: `rydex-backend`
   - **Runtime**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
   - **Root Directory**: `backend`

4. Environment Variables:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://[POSTGRES_HOST]:5432/rydex
DATABASE_USERNAME=rydex_user
DATABASE_PASSWORD=[POSTGRES_PASSWORD]
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_BACKEND_URL=https://rydex-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
MONGODB_URL=[MONGODB_CONNECTION_STRING]
SPRING_PROFILES_ACTIVE=prod
```

### Step 4: Deploy Socket Server
1. Click "New" → "Web Service"
2. Connect your GitHub repo: `akarshra/Rydex`
3. Configure:
   - **Name**: `rydex-socketserver`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `socketserver`

4. Environment Variables:
```
MONGODB_URL=[MONGODB_CONNECTION_STRING]
REDIS_URL=[REDIS_CONNECTION_STRING]
NEXT_BASE_URL=https://your-vercel-app.vercel.app
PORT=10000
```

---

## 🔗 Service URLs Configuration

After deployment, update your environment variables with the actual URLs:

1. **Vercel Frontend URL**: `https://rydex.vercel.app`
2. **Render Backend URL**: `https://rydex-backend.onrender.com`
3. **Render Socket Server URL**: `https://rydex-socketserver.onrender.com`

Update the environment variables in all services to point to the correct URLs.

---

## 🧪 Testing Deployment

1. Frontend should load at your Vercel URL
2. API endpoints should work at `/api/*`
3. Socket connections should work for real-time features
4. Database connections should work for data persistence

---

## 📝 Notes

- Make sure all environment variables are set correctly
- Test all features after deployment
- Monitor logs in Vercel and Render dashboards
- Set up proper CORS policies if needed
- Consider setting up CI/CD for automatic deployments