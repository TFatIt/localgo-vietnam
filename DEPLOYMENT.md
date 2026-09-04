# LocalGo Vietnam — Deployment Guide
*Production-Ready Platform*

---

## 📁 Project Structure

```
localgo-vietnam/
├── backend/          ← Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── app.ts            ← Express app (CORS, middleware, routes)
│   │   ├── server.ts         ← Entry point + graceful shutdown
│   │   ├── config/           ← Firebase, Cloudinary, DB, env
│   │   ├── models/           ← 22 MongoDB models (User, Place, etc.)
│   │   ├── controllers/      ← Auth, Place, Review, AI, Community...
│   │   ├── services/         ← Business logic layer
│   │   ├── routes/           ← REST API routes
│   │   ├── middlewares/      ← Auth, Rate limit, Error, Upload
│   │   └── utils/            ← Logger, Errors, Helpers
│   └── .env.example
│
├── mobile/           ← React Native + Expo SDK 51
│   ├── app/
│   │   ├── _layout.tsx       ← Root layout (QueryClient, Fonts, Theme)
│   │   ├── index.tsx         ← Smart router (auth → onboard → home)
│   │   ├── (auth)/           ← Welcome, Login, Email login
│   │   ├── (tabs)/           ← Home, Search, Map, Community, Profile
│   │   ├── place/[id].tsx    ← Place detail
│   │   ├── ai-chat.tsx       ← GPT-4o chat
│   │   ├── ai-planner.tsx    ← AI travel planner
│   │   └── checkin/[id].tsx  ← Check-in modal
│   ├── constants/            ← Theme tokens, provinces, config
│   ├── services/             ← API layer (Axios + Firebase auth)
│   └── store/                ← Zustand (auth, app settings)
│
└── admin/            ← React + Vite Admin Dashboard
    └── src/
        ├── pages/    ← Dashboard, Users, Places, Reviews, Reports, Analytics
        └── components/ ← Layout, sidebar
```

---

## 🔧 Step 1: Environment Setup

### Backend `.env`
```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/localgo-vietnam

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret

# CORS (comma-separated)
ALLOWED_ORIGINS=https://admin.localgo.vn,https://localgo.vn,exp://
```

### Mobile `.env`
```env
EXPO_PUBLIC_API_URL=https://localgo-api.onrender.com/api/v1
EXPO_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Admin `.env`
```env
VITE_API_URL=https://localgo-api.onrender.com/api/v1
```

---

## 🚀 Step 2: Backend Deployment (Render.com)

1. Push `backend/` folder to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Add all `.env` variables
4. Add **MongoDB Atlas** IP whitelist: `0.0.0.0/0` (or Render's IPs)

### MongoDB Atlas Setup
```bash
# 1. Create cluster on mongodb.com/atlas
# 2. Create database user
# 3. Add connection string to MONGODB_URI
# 4. Create indexes (run this once):
curl -X POST https://localgo-api.onrender.com/api/v1/admin/setup-indexes \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📱 Step 3: Mobile App Build
> 💡 *Xem hướng dẫn chi tiết dành riêng cho iPhone/iOS tại [IOS_SETUP.md](IOS_SETUP.md).*

### Prerequisites
```bash
npm install -g @expo/eas-cli
eas login
```

### Setup Firebase
1. Download `google-services.json` (Android) from Firebase Console
2. Download `GoogleService-Info.plist` (iOS) from Firebase Console
3. Place in `mobile/` root

### Install & Run
```bash
cd mobile
npm install

# Development
npx expo start

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for production
eas build --platform all --profile production
```

### `eas.json`
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": {}
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🌐 Step 4: Admin Dashboard Deployment

```bash
cd admin
npm install
npm run build  # Creates /dist folder

# Deploy to Vercel (recommended)
npx vercel --prod

# Or Netlify
npx netlify deploy --prod --dir=dist
```

---

## 🔥 Step 5: Firebase Setup

### Authentication Providers to Enable
In Firebase Console → Authentication → Sign-in Methods:
- ✅ **Google**
- ✅ **Apple** (iOS)
- ✅ **Facebook**
- ✅ **Email/Password**

### Firebase Rules (Firestore — not used, skip)
> All data is stored in **MongoDB Atlas**. Firebase is used **only** for Authentication.

### Push Notifications (FCM)
1. In Firebase Console → Cloud Messaging → Get Server Key
2. Add to backend `.env` as `FCM_SERVER_KEY`

---

## 🤖 Step 6: OpenAI Configuration

```bash
# In backend/.env
OPENAI_API_KEY=sk-proj-...

# Models used:
# - gpt-4o: AI Travel Chat + Plan generation
# - gpt-4o-mini: Quick responses

# Rate limiting: 5 AI requests/hour per user (configured in rateLimiter.ts)
```

---

## ☁️ Step 7: Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, API Secret
3. Create upload presets for:
   - `localgo_places` — Place images (max 10MB)
   - `localgo_avatars` — User avatars (max 5MB)
   - `localgo_posts` — Community posts (max 20MB)

---

## 📋 API Reference

```
Base URL: https://localgo-api.onrender.com/api/v1

AUTH
POST   /auth/login          ← Firebase token → JWT + user profile
GET    /auth/me             ← Get current user
PATCH  /auth/me             ← Update profile
DELETE /auth/me             ← Delete account

PLACES
GET    /places              ← List/Search (filters: category, province, search)
GET    /places/nearby       ← Geo-spatial nearby search (?lat=&lng=&radius=)
GET    /places/trending     ← Trending places
GET    /places/hidden-gems  ← Hidden gems (?province=)
GET    /places/:id          ← Place detail + recent reviews
POST   /places              ← Create place (admin)
PATCH  /places/:id          ← Update place (admin)

REVIEWS
GET    /places/:id/reviews  ← Place reviews (paginated)
POST   /places/:id/reviews  ← Create review (auth, multipart)
POST   /places/reviews/:id/helpful ← Vote helpful

COMMUNITY
GET    /community/feed      ← Posts feed
POST   /community           ← Create post (multipart)
POST   /community/:id/like  ← Toggle like
GET    /community/:id/comments ← Comments
POST   /community/:id/comments ← Add comment

AI
POST   /ai/plan             ← Generate travel itinerary (GPT-4o)
POST   /ai/chat             ← AI chat message
POST   /ai/journal-story    ← Generate journal story from entries

ME (Engagement)
GET    /me/bookmarks        ← User bookmarks
POST   /me/bookmarks/:id    ← Toggle bookmark
GET    /me/favorites        ← User favorites
POST   /me/favorites/:id    ← Toggle favorite
POST   /me/checkins         ← Check-in at place
GET    /me/checkins         ← Check-in history
GET    /me/leaderboard      ← Points leaderboard

ADMIN (requires admin role)
GET    /admin/dashboard     ← Stats + charts data
GET    /admin/users         ← All users
PATCH  /admin/users/:id/status ← Toggle user status
GET    /admin/places        ← All places
PATCH  /admin/places/:id/verify ← Verify place
GET    /admin/reports       ← Reports list
PATCH  /admin/reports/:id   ← Resolve/dismiss report
```

---

## 🏪 Step 8: App Store Submission

### Google Play Store
1. Create Keystore: `eas credentials`
2. Build AAB: `eas build --platform android --profile production`
3. Download `.aab` from EAS dashboard
4. Upload to Play Console → Production track

### Apple App Store
1. Configure Apple Developer account in EAS
2. Build IPA: `eas build --platform ios --profile production`
3. Submit: `eas submit --platform ios`

### Required Assets
- App icon: 1024×1024 PNG (no transparency)
- Splash screen: 2048×2048 PNG
- Screenshots: 6.5" iPhone, 12.9" iPad, Pixel 7

---

## 🔒 Security Checklist

- [x] Firebase Admin SDK server-side token verification
- [x] Rate limiting (global, auth, AI tiers)
- [x] MongoDB NoSQL injection prevention (express-mongo-sanitize)
- [x] Helmet security headers
- [x] CORS restricted origins
- [x] Input validation (Zod schemas)
- [x] File upload size/type limits (Multer)
- [x] Role-based access control (user/business/admin)
- [x] Graceful error handling (no stack traces in production)
- [x] Bcrypt for any stored passwords

---

## 📊 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo SDK 51 |
| Navigation | Expo Router (file-based) |
| State | Zustand + React Query |
| Backend API | Node.js + Express + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Authentication | Firebase Auth (Google/Apple/FB/Email) |
| AI | OpenAI GPT-4o |
| Maps | Google Maps (react-native-maps) |
| Storage | Cloudinary |
| Push Notifications | Firebase Cloud Messaging |
| Admin Dashboard | React + Vite + Recharts |
| Deployment | Render.com (API) + Vercel (Admin) |
| Build | EAS (Expo Application Services) |

---

*Built by the LocalGo Vietnam Engineering Team*
