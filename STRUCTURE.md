# Project Structure

## Overview
SkypeAlternative is a secure, end-to-end encrypted chat and video call application built with Electron, React, and TypeScript.

## Directory Structure

```
SkypeAlternative/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline (testing, linting)
│       └── release.yml               # Release builds for all platforms
├── electron/
│   ├── main.ts                       # Electron main process
│   └── preload.ts                    # Electron preload script
├── src/
│   ├── components/                   # Reusable React components
│   ├── screens/                      # Main application screens
│   │   ├── LoginScreen.tsx           # User login with mnemonic
│   │   ├── RegisterScreen.tsx        # User registration
│   │   └── MainApp.tsx               # Main application interface
│   ├── services/                     # Business logic services
│   │   ├── auth.ts                   # Authentication service
│   │   ├── firebase.ts               # Firebase initialization
│   │   ├── friend.ts                 # Friend management
│   │   ├── message.ts                # Message handling
│   │   └── storage.ts                # Secure local storage
│   ├── utils/                        # Utility functions
│   │   └── crypto.ts                 # Cryptographic operations
│   ├── models/                       # TypeScript type definitions
│   │   └── index.ts                  # All types and interfaces
│   ├── hooks/                        # Custom React hooks
│   ├── App.tsx                       # Root application component
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Global styles
├── tests/
│   ├── unit/                         # Unit tests
│   │   └── crypto.test.ts            # Crypto tests (20 tests)
│   ├── integration/                  # Integration tests
│   ├── e2e/                          # End-to-end tests
│   └── setup.ts                      # Test setup and configuration
├── resources/                        # Build resources (icons, etc.)
├── public/                           # Public static assets
├── index.html                        # HTML template
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite build configuration
├── jest.config.js                    # Jest test configuration
├── playwright.config.ts              # Playwright E2E configuration
├── .eslintrc.cjs                     # ESLint configuration
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
└── README.md                         # Project documentation
```

## Key Technologies

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **CSS**: Custom styling with responsive design

### Desktop
- **Electron**: Cross-platform desktop app framework
- **electron-builder**: Build and packaging
- **electron-store**: Persistent storage

### Security & Crypto
- **TweetNaCl**: Cryptographic library (NaCl)
- **BIP39**: Mnemonic phrase generation
- **Ed25519**: Digital signatures
- **XSalsa20-Poly1305**: Encryption

### Backend
- **Firebase Firestore**: Real-time database
- **Firebase Auth**: Authentication
- **Cloudflare Calls**: WebRTC video/audio

### Testing
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **ts-jest**: TypeScript support for Jest

### CI/CD
- **GitHub Actions**: Automated workflows
- **Multi-platform builds**: Windows, Linux, macOS

## Build Outputs

### Windows
- `.exe` - Portable executable
- `.msi` - Windows Installer

### Linux
- `.AppImage` - Universal Linux app
- `.deb` - Debian/Ubuntu package
- `.rpm` - RedHat/Fedora package

### macOS
- `.dmg` - Disk image
- `.zip` - Archive

### Mobile (Future)
- `.apk` / `.aab` - Android
- `.ipa` - iOS (requires Apple Developer account)

## Development Workflow

1. **Setup**: `npm install`
2. **Development**: `npm run electron:dev`
3. **Testing**: `npm test`
4. **Type Check**: `npm run type-check`
5. **Linting**: `npm run lint`
6. **Build**: `npm run electron:build`

## Security Architecture

### Key Management
1. User generates 12-word mnemonic phrase
2. Mnemonic derives Ed25519 keypair deterministically
3. Private key stored securely via Electron safeStorage
4. Public key shared for friend requests

### Message Encryption
1. Messages encrypted with shared secret (derived from public keys)
2. Each message has unique nonce
3. Encrypted content stored in Firebase
4. Only recipients can decrypt

### Authentication
1. Challenge-response authentication
2. Server sends random challenge
3. Client signs with private key
4. Server verifies with public key

## Configuration

### Required Environment Variables
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLOUDFLARE_ACCOUNT_ID=...
VITE_CLOUDFLARE_API_TOKEN=...
```

## Testing Coverage

- Crypto utilities: 100% (20/20 tests passing)
- Overall coverage target: 70%

## Future Enhancements

- [ ] Voice/video calls with Cloudflare Calls
- [ ] File sharing with encryption
- [ ] Group chats
- [ ] Mobile apps (Android/iOS)
- [ ] Desktop notifications
- [ ] Message reactions
- [ ] Voice messages
- [ ] Screen sharing
