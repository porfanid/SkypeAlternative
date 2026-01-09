# Getting Started with SkypeAlternative Development

Welcome! This guide will help you get up and running with SkypeAlternative development as quickly as possible.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Firebase Configuration](#firebase-configuration)
- [Running the App](#running-the-app)
- [Development Workflow](#development-workflow)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Quick Start

**TL;DR** - For experienced developers:

```bash
# Clone and install
git clone https://github.com/porfanid/SkypeAlternative.git
cd SkypeAlternative
npm install

# Configure Firebase
cp .env.example .env
# Edit .env with your Firebase credentials

# Run tests
npm test

# Start development
npm run electron:dev
```

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or 20.x
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm**: Comes with Node.js (version 8+)
  - Verify: `npm --version`

- **Git**: Any recent version
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify: `git --version`

### Optional but Recommended

- **VS Code**: Excellent TypeScript support
  - Download from [code.visualstudio.com](https://code.visualstudio.com/)
  - Recommended extensions:
    - ESLint
    - Prettier
    - TypeScript and JavaScript Language Features

- **GitHub Desktop**: If you prefer GUI over command line
  - Download from [desktop.github.com](https://desktop.github.com/)

### Knowledge Requirements

**Essential:**
- JavaScript/TypeScript basics
- React fundamentals (components, hooks, state)
- Git basics (clone, branch, commit, push)

**Helpful:**
- Electron basics
- Cryptography concepts
- Firebase/Firestore
- TypeScript advanced features

**Don't worry if you're new to some of these!** The codebase is well-documented, and we're here to help.

## Initial Setup

### 1. Fork and Clone

**Option A: Using Git CLI**

```bash
# Fork on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/SkypeAlternative.git
cd SkypeAlternative

# Add upstream remote
git remote add upstream https://github.com/porfanid/SkypeAlternative.git
```

**Option B: Using GitHub Desktop**

1. Click "Fork" on GitHub
2. Open GitHub Desktop
3. File → Clone Repository
4. Select your fork

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all npm packages
- Set up Husky pre-commit hooks
- Prepare the development environment

**Expected output:**
```
added 1247 packages in 45s
husky - Git hooks installed
```

### 3. Verify Installation

```bash
# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

All should pass! If not, see [Troubleshooting](#troubleshooting).

## Firebase Configuration

SkypeAlternative uses Firebase for backend services. You'll need your own Firebase project for development.

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "SkypeAlternative-Dev")
4. Disable Google Analytics (optional for dev)
5. Click "Create project"

### Enable Firestore

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location (closest to you)
5. Click "Enable"

### Get Configuration

1. Project Settings → General
2. Scroll to "Your apps"
3. Click web icon (</>) to add a web app
4. Register app (name: "SkypeAlternative Dev")
5. Copy the configuration object

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and paste your Firebase config:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Cloudflare Calls (optional for now)
VITE_CLOUDFLARE_ACCOUNT_ID=
VITE_CLOUDFLARE_API_TOKEN=
```

**⚠️ Security Note:** Never commit `.env` to Git! It's already in `.gitignore`.

## Running the App

### Development Mode

```bash
npm run electron:dev
```

This will:
1. Start Vite dev server (port 5173)
2. Launch Electron with hot reload
3. Open the application window

**First run?** You'll see the registration screen. Create a test account and **save your mnemonic phrase**!

### What You Should See

1. **Registration Screen**: Generate a new mnemonic
2. **Login Screen**: Enter your mnemonic to log in
3. **Main App**: Tabs for Chats, Friends, Settings

### Dev Tools

Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open DevTools.

Useful DevTools tabs:
- **Console**: Logs and errors
- **Network**: Firebase requests
- **Application**: Local storage and IndexedDB
- **Sources**: Set breakpoints

## Development Workflow

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Edit files in `src/`
   - Save and see live reload

3. **Test your changes**
   ```bash
   npm test            # Run unit tests
   npm run type-check  # TypeScript validation
   npm run lint        # Code style
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```
   
   Pre-commit hooks will automatically:
   - Run tests
   - Check TypeScript types
   - Lint code
   
   If any check fails, the commit is aborted. Fix issues and try again.

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main branch
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

## Common Tasks

### Add a New Component

1. Create file in `src/components/YourComponent.tsx`
2. Create styles in `src/components/YourComponent.css`
3. Write the component following our style guide
4. Export from component file
5. Import and use in parent component

Example:
```typescript
// src/components/StatusIndicator.tsx
import React from 'react';
import './StatusIndicator.css';

interface StatusIndicatorProps {
  online: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ online }) => {
  return (
    <div className={`status-indicator ${online ? 'online' : 'offline'}`}>
      {online ? '🟢' : '⚫'}
    </div>
  );
};
```

### Add a New Service Method

1. Open the relevant service file (e.g., `src/services/friend.ts`)
2. Add your method following the existing pattern
3. Add proper TypeScript types
4. Add error handling
5. Write unit tests in `tests/unit/`

Example:
```typescript
// src/services/friend.ts
async function blockFriend(friendId: string): Promise<void> {
  try {
    const currentUserId = await getCurrentUserId();
    await updateDoc(doc(db, 'users', currentUserId, 'friends', friendId), {
      blocked: true,
      blockedAt: Date.now()
    });
  } catch (error) {
    console.error('Failed to block friend:', error);
    throw new Error('Failed to block friend');
  }
}
```

### Run Specific Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test crypto.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage
```

### Build for Production

```bash
# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux

# macOS
npm run electron:build:mac
```

Builds will be in `release/` directory.

## Troubleshooting

### Common Issues

**Issue: `npm install` fails**

Solution:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Issue: Tests fail with Firebase errors**

Solution: Make sure `.env` is configured correctly with valid Firebase credentials.

**Issue: Electron won't start**

Solution:
```bash
# Rebuild native modules
npm run electron:rebuild

# Or reinstall Electron
npm install electron --save-dev
```

**Issue: TypeScript errors in editor**

Solution:
```bash
# Reload VS Code window
Ctrl+Shift+P → "Reload Window"

# Or restart TypeScript server
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

**Issue: Pre-commit hooks don't run**

Solution:
```bash
# Reinstall Husky
npm run prepare
```

### Getting Help

- **Check Documentation**: Read [ARCHITECTURE.md](ARCHITECTURE.md) for deep dives
- **Search Issues**: Someone may have had the same problem
- **Ask in Discussions**: GitHub Discussions for questions
- **Open an Issue**: For bugs or unclear documentation

## Next Steps

Now that you're set up, here are some ways to contribute:

### Easy First Issues

Look for issues tagged with:
- `good first issue`
- `documentation`
- `help wanted`

### Learn the Codebase

1. **Read the code**:
   - Start with `src/utils/crypto.ts` (core crypto)
   - Then `src/services/auth.ts` (authentication)
   - Finally `src/screens/MainApp.tsx` (UI)

2. **Run the tests**:
   - See `tests/unit/crypto.test.ts` for examples
   - Understand what each test validates

3. **Experiment**:
   - Change some text in the UI
   - Add a console.log in a service
   - Try breaking something to understand how it works

### Suggested Learning Path

**Week 1: Understanding**
- Set up dev environment ✓
- Read ARCHITECTURE.md
- Run app and explore features
- Read crypto.ts and tests

**Week 2: Small Changes**
- Fix a typo in documentation
- Add a console.log for debugging
- Style improvement in CSS
- Comment improvement

**Week 3: Real Contribution**
- Pick a "good first issue"
- Implement the change
- Write tests
- Submit PR

### Resources

- **Project Documentation**: `docs/` directory
- **Code Style**: `.github/copilot-instructions.md`
- **API Docs**: Generated from JSDoc comments
- **Community**: GitHub Discussions

### Stay Updated

- **Watch** the repository for notifications
- **Star** the project to show support
- **Follow** maintainers on GitHub

## Welcome to the Team!

You're now ready to contribute to SkypeAlternative! Remember:

- **Ask questions** - we're here to help
- **Start small** - every contribution matters
- **Be patient** - learning takes time
- **Have fun** - building secure communication tools is exciting!

Happy coding! 🚀🔒
