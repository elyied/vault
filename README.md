# 📖 Vault Diary

A premium, zero-cost personal diary web app with rich text editing, image uploads, tags, search, and Google sign-in.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Google Sign-In** — Secure OAuth via Firebase Auth
- **Rich Text Editor** — Bold, italic, headings, lists, task lists, code, quotes, links, highlights
- **Image Uploads** — Inline images via Cloudinary (free tier)
- **Tags, Pinning & Favorites** — Organize your entries
- **Search & Filters** — Full-text search, tag filters, date range, media-only
- **List & Gallery Views** — Toggle between feed and masonry layouts
- **Export/Import** — Download all data as JSON, import back
- **Dark/Light Mode** — System-aware theme with manual toggle
- **Premium Design** — Glassmorphism, animations, responsive mobile-first layout
- **Zero Cost** — Entirely free-tier services

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS 3 |
| Auth | Firebase Auth (Google OAuth) |
| Database | Cloud Firestore |
| Images | Cloudinary (free tier) |
| Editor | Tiptap (ProseMirror) |
| Hosting | Vercel (free) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Firebase project with Auth + Firestore enabled
- A Cloudinary account with an unsigned upload preset

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/vault-diary.git
cd vault-diary
npm install
```

### 2. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Where to Get It |
|----------|----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same as above |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → Cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload → Unsigned preset |

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Sign-in method → **Google**
4. Enable **Cloud Firestore** → Start in test mode
5. Copy the Web SDK config to your `.env.local`

**Firestore Security Rules** (for production):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /tags/{tagId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com/) (free)
2. Go to Settings → Upload → Add upload preset
3. Set **Signing Mode** to **Unsigned**
4. Optionally restrict: max file size 10MB, allowed formats (jpg, png, gif, webp)
5. Copy Cloud Name & Preset Name to `.env.local`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel (Free)

### One-click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/vault-diary)

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... (add all from .env.example)

# Deploy to production
vercel --prod
```

> **Important:** Add your Vercel deployment URL to Firebase Console → Authentication → Authorized domains.

## 📋 Deployment Checklist

1. ✅ All env vars set in Vercel dashboard
2. ✅ Firebase Auth → Google provider enabled
3. ✅ Vercel domain added to Firebase Authorized Domains
4. ✅ Firestore security rules deployed (not test mode)
5. ✅ Cloudinary unsigned upload preset configured
6. ✅ HTTPS enabled (automatic on Vercel)
7. ✅ Test: login → create entry → upload image → search → export

## 🔒 Data & Privacy

| Data | Location | How to Delete |
|------|----------|---------------|
| Auth session | Firebase Auth | Firebase Console → Users → Delete |
| Diary entries | Cloud Firestore | Settings → Export, then delete in Firebase Console |
| Images | Cloudinary | Cloudinary Console → Media Library → Delete |
| Local drafts | Browser localStorage | Clear browser data |

## 💰 Cost Notes

All services used are **free tier**:

| Service | Free Limit |
|---------|-----------|
| Firebase Auth | Unlimited users |
| Cloud Firestore | 1 GiB storage, 50K reads/day, 20K writes/day |
| Cloudinary | 25 GB storage, 25 GB bandwidth/month |
| Vercel | 100 GB bandwidth/month, serverless functions |

For a personal diary, these limits are more than sufficient. Estimated monthly cost: **$0**.

## 🗺️ Roadmap

- [ ] Client-side encryption (user passphrase)
- [ ] Offline mode with service worker
- [ ] Folders for entry organization
- [ ] Collaborative sharing
- [ ] E2E tests (Playwright)
- [ ] PWA support

## 📄 License

MIT — see [LICENSE](./LICENSE)
