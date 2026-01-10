# Firebase Setup Guide for SkypeAlternative

This guide walks you through setting up Firebase for the SkypeAlternative application.

## Prerequisites

- Firebase account (free tier is sufficient)
- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js 18+ installed

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project**
3. Enter project name: `SkypeAlternative` (or your preferred name)
4. Disable Google Analytics (optional, not required for this app)
5. Click **Create project**

## Step 2: Enable Required Services

### 2.1 Enable Authentication

**CRITICAL**: You must enable Anonymous Authentication for the app to work.

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Find **Anonymous** in the providers list
3. Click on it
4. Toggle **Enable** switch to **ON**
5. Click **Save**

**Why Anonymous Auth?**
- Provides Firebase Authentication context required by Firestore security rules
- Does not require user emails or passwords
- Actual user identity is managed via mnemonic phrase signatures
- Allows secure, password-free authentication

### 2.2 Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll deploy custom rules)
4. Choose a location closest to your users
5. Click **Enable**

### 2.3 Enable Cloud Storage

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Accept default security rules (we'll deploy custom rules)
4. Choose same location as Firestore
5. Click **Done**

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Add app** → **Web** (</> icon)
4. Register app with nickname: `SkypeAlternative Web`
5. **Copy the configuration values** (you'll need these next)

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=1:your-app-id:web:abc123
   ```

3. Save the file

## Step 5: Initialize Firebase CLI

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init
   ```

3. Select the following features (use spacebar to select):
   - ◉ Firestore
   - ◉ Storage
   - ◉ Hosting (optional)

4. Use these options:
   - **Project**: Select your Firebase project from the list
   - **Firestore rules**: `firestore.rules` (default)
   - **Firestore indexes**: `firestore.indexes.json` (default)
   - **Storage rules**: `storage.rules` (default)
   - **Hosting directory**: `dist` (default)

## Step 6: Deploy Security Rules and Indexes

Deploy Firestore rules and indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Deploy Storage rules:
```bash
firebase deploy --only storage
```

Or deploy everything at once:
```bash
firebase deploy
```

## Step 7: Verify Deployment

1. Check Firestore rules:
   ```bash
   firebase firestore:rules
   ```

2. Check that indexes are building:
   ```bash
   firebase firestore:indexes
   ```

3. In Firebase Console:
   - Go to **Firestore Database** → **Rules** → Verify rules are deployed
   - Go to **Firestore Database** → **Indexes** → Check index status
   - Go to **Storage** → **Rules** → Verify storage rules are deployed

## Step 8: Test the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Test registration:
   - Open app in browser (usually http://localhost:5173)
   - Click **Create Account**
   - Generate recovery phrase
   - Create account
   - Should work without "Missing permissions" or "admin-restricted-operation" errors ✅

## Troubleshooting

### Error: "auth/admin-restricted-operation"

**Cause**: Anonymous Authentication is not enabled in Firebase Console.

**Fix**:
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Anonymous" provider
3. Try again

### Error: "Missing or insufficient permissions"

**Cause**: Firestore security rules not deployed or incorrect.

**Fix**:
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Verify in Firebase Console → Firestore → Rules
3. Ensure Anonymous Auth is enabled

### Error: "Index required"

**Cause**: Firestore indexes not built yet.

**Fix**:
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Wait for indexes to build (can take a few minutes)
3. Check status: `firebase firestore:indexes`

### Error: "Storage object not found"

**Cause**: Storage rules not deployed.

**Fix**:
1. Deploy storage rules: `firebase deploy --only storage`
2. Verify in Firebase Console → Storage → Rules

## Security Rules Overview

### Firestore Rules

The app uses production-ready security rules that enforce:

- **Users**: Authenticated read, self-write only
- **Friends**: Friendship validation on both sides
- **Messages**: E2E encryption required, friend-only access
- **Calls**: Participant-only access
- **Files**: Sender/recipient access with 100MB limit

All collections enforce authentication and proper authorization.

### Storage Rules

Storage rules enforce:

- User-specific file paths
- Owner/recipient access control
- 100MB file size limit
- Thumbnail size limit (1MB)

## Performance Indexes

The app includes 9 composite indexes for optimal query performance:

- Messages by sender/recipient + timestamp
- Friends by user + status
- Calls by initiator/recipient + start time
- Group messages by group + timestamp
- Files by sender/recipient + upload date

These indexes are automatically created during deployment.

## Cost Considerations

### Free Tier Limits (Spark Plan)

- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5 GB storage, 1 GB download/day
- **Authentication**: Unlimited

### Scaling (Blaze Plan - Pay as you go)

If you exceed free tier, you'll be automatically charged:

- **Firestore**: $0.06 per 100K reads, $0.18 per 100K writes
- **Storage**: $0.026/GB stored, $0.12/GB downloaded

**Recommendation**: Start with free tier, upgrade to Blaze when needed.

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Enable App Check** (optional) - Prevents API abuse
3. **Set up budget alerts** - Get notified of unexpected usage
4. **Review security rules regularly** - Ensure they match your needs
5. **Monitor usage** - Check Firebase Console → Usage tab

## Next Steps

After setup is complete:

1. Test all features (registration, messaging, calls, file uploads)
2. Monitor Firebase Console for errors
3. Set up budget alerts
4. Consider enabling App Check for additional security
5. Review security rules periodically

## Support

If you encounter issues:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Review [Troubleshooting section](#troubleshooting) above
3. Check application logs in browser console
4. Open an issue in the GitHub repository

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Storage Security](https://firebase.google.com/docs/storage/security)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
