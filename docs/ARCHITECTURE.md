# Architecture Overview

This document provides a comprehensive overview of SkypeAlternative's architecture, helping new contributors understand the system design and implementation.

## Table of Contents

- [System Architecture](#system-architecture)
- [Security Architecture](#security-architecture)
- [Data Flow](#data-flow)
- [Component Structure](#component-structure)
- [Service Layer](#service-layer)
- [Cryptographic Implementation](#cryptographic-implementation)
- [State Management](#state-management)
- [Platform Integration](#platform-integration)

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (React Components - Login, Chat, Friends, Calls)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Service Layer                           │
│  (Auth, Message, Friend, Call, Storage Services)        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼─────┐ ┌───▼──────┐ ┌──▼──────────┐
│   Crypto    │ │ Firebase │ │  Cloudflare │
│   Utils     │ │ (Backend)│ │   (Calls)   │
└─────────────┘ └──────────┘ └─────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Desktop Runtime**: Electron 27
- **Build Tool**: Vite 5
- **Testing**: Jest (unit), Playwright (E2E)
- **Crypto**: TweetNaCl, BIP39
- **Backend**: Firebase (Firestore + Auth)
- **Media**: Cloudflare Calls (WebRTC)
- **Storage**: Electron safeStorage, IndexedDB

## Security Architecture

### Cryptographic Foundation

SkypeAlternative uses a layered security approach:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Application Security                          │
│  - Input validation                                      │
│  - XSS/CSRF protection                                   │
│  - Secure defaults                                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Layer 3: End-to-End Encryption                         │
│  - Message encryption (X25519-XSalsa20-Poly1305)        │
│  - Digital signatures (Ed25519)                          │
│  - Perfect forward secrecy (ephemeral keys)              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Layer 2: Key Management                                 │
│  - BIP39 mnemonic phrases                                │
│  - Deterministic key derivation                          │
│  - Secure local storage                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Layer 1: Transport Security                             │
│  - HTTPS/WSS for all connections                         │
│  - Firebase security rules                               │
│  - Certificate pinning (planned)                         │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌────────┐                 ┌────────┐                 ┌─────────┐
│ Client │                 │ Server │                 │Firebase │
└───┬────┘                 └───┬────┘                 └────┬────┘
    │                          │                           │
    │ 1. Request challenge     │                           │
    ├─────────────────────────>│                           │
    │                          │                           │
    │ 2. Return challenge      │                           │
    │<─────────────────────────┤                           │
    │                          │                           │
    │ 3. Sign challenge        │                           │
    │   with private key       │                           │
    │                          │                           │
    │ 4. Send signature +      │                           │
    │    public key            │                           │
    ├─────────────────────────>│                           │
    │                          │                           │
    │                          │ 5. Verify signature       │
    │                          │    with public key        │
    │                          │                           │
    │                          │ 6. Create/verify user     │
    │                          ├──────────────────────────>│
    │                          │                           │
    │                          │ 7. User data              │
    │                          │<──────────────────────────┤
    │                          │                           │
    │ 8. Auth token            │                           │
    │<─────────────────────────┤                           │
    │                          │                           │
```

### Message Encryption

Each message is encrypted with a unique session key derived from:

```
Sender's Private Key + Recipient's Public Key
          ↓
    X25519 Key Exchange
          ↓
    Shared Secret (32 bytes)
          ↓
XSalsa20-Poly1305 Encryption
          ↓
    Encrypted Message + Nonce + Auth Tag
```

**Key Properties:**
- Each message has a unique nonce (24 bytes)
- Authentication prevents tampering
- No key reuse (forward secrecy)
- Recipient verification via signatures

## Data Flow

### Message Sending Flow

```
1. User types message
   ↓
2. Encrypt with recipient's public key
   ↓
3. Sign encrypted message
   ↓
4. Store encrypted + signature locally (cache)
   ↓
5. Upload to Firebase Firestore
   ↓
6. Real-time listener notifies recipient
   ↓
7. Recipient downloads encrypted message
   ↓
8. Verify signature
   ↓
9. Decrypt with private key
   ↓
10. Display plaintext
```

### Friend Request Flow

```
1. User enters friend's public key
   ↓
2. Validate public key format
   ↓
3. Create friend request (encrypted)
   ↓
4. Store in Firebase with both user IDs
   ↓
5. Notify recipient via Firebase listener
   ↓
6. Recipient accepts/rejects
   ↓
7. Update both users' friend lists
   ↓
8. Enable encrypted messaging
```

## Component Structure

### React Component Hierarchy

```
App
├── LoginScreen
├── RegisterScreen
└── MainApp
    ├── Navigation (Tabs)
    ├── ChatList
    │   └── ChatWindow
    │       ├── MessageList
    │       ├── MessageInput
    │       ├── ReactionPicker
    │       └── SearchBar
    ├── FriendList
    │   ├── FriendItem
    │   ├── PendingRequestItem
    │   ├── AddFriendDialog
    │   └── RemoveFriendDialog
    ├── CallScreen (planned)
    │   ├── VideoGrid
    │   ├── ControlPanel
    │   └── ParticipantList
    └── SettingsScreen
        ├── ProfileSettings
        ├── SecuritySettings
        └── AboutSection
```

### Component Responsibilities

**Screens** (`src/screens/`):
- Full-page views
- Route handling
- High-level state management

**Components** (`src/components/`):
- Reusable UI elements
- Local state only
- Props-driven

**Services** (`src/services/`):
- Business logic
- API calls
- State persistence

## Service Layer

### Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Auth      │  │   Message    │  │    Friend    │  │
│  │   Service    │  │   Service    │  │   Service    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────▼──────────────────▼──────────────────▼───────┐ │
│  │           Firebase Service (Singleton)             │ │
│  └────────────────────────┬───────────────────────────┘ │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐ │
│  │           Storage Service (Platform Adapter)       │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Service Responsibilities

**AuthService** (`src/services/auth.ts`):
- User registration
- Challenge-response authentication
- Public key verification
- User lookup

**MessageService** (`src/services/message.ts`):
- Send/receive messages
- Message encryption/decryption
- Local caching
- Firebase synchronization

**EnhancedMessageService** (`src/services/enhancedMessage.ts`):
- Message reactions
- Edit/delete messages
- Expiring messages
- Search functionality
- Group chat support

**FriendService** (`src/services/friend.ts`):
- Send friend requests
- Accept/reject requests
- Friend list management
- Online status tracking
- Block/unblock users

**StorageService** (`src/services/storage.ts`):
- Secure key storage
- Message caching
- Settings persistence
- Cross-platform adaptation

## Cryptographic Implementation

### Key Generation

```typescript
// 1. Generate mnemonic (12 words)
const mnemonic = generateMnemonic();
// "abandon ability able about above absent absorb abstract absurd abuse access accident"

// 2. Derive seed from mnemonic
const seed = mnemonicToSeed(mnemonic);
// 64 bytes of entropy

// 3. Generate Ed25519 keypair
const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
// { publicKey: Uint8Array(32), secretKey: Uint8Array(64) }

// 4. Store securely
await StorageService.storePrivateKey(keyPair.secretKey);
```

### Message Encryption

```typescript
// 1. Convert Ed25519 keys to Curve25519 (X25519)
const senderBox = nacl.box.keyPair.fromSecretKey(senderPrivateKey);
const recipientBox = convertPublicKey(recipientPublicKey);

// 2. Generate nonce
const nonce = nacl.randomBytes(nacl.box.nonceLength);

// 3. Encrypt
const encrypted = nacl.box(
  messageBytes,
  nonce,
  recipientBox.publicKey,
  senderBox.secretKey
);

// 4. Package
return {
  ciphertext: base64(encrypted),
  nonce: base64(nonce),
  senderPublicKey: base64(senderPublicKey)
};
```

### Digital Signatures

```typescript
// Sign message
const signature = nacl.sign.detached(messageBytes, privateKey);

// Verify signature
const valid = nacl.sign.detached.verify(
  messageBytes,
  signature,
  publicKey
);
```

## State Management

### Current Approach

- **React Context** for global state (user, auth)
- **Local State** for component-specific data
- **Custom Hooks** for shared logic
- **Firebase Listeners** for real-time updates

### State Flow

```
Firebase (Source of Truth)
    ↓
Service Layer (Business Logic)
    ↓
React Context (Global State)
    ↓
Components (UI State)
```

### Future Considerations

For complex state management needs:
- Redux Toolkit (considered for v2.0)
- Zustand (lightweight alternative)
- Jotai (atomic state)

## Platform Integration

### Electron (Desktop)

**Main Process** (`electron/main.ts`):
- Window management
- System tray integration
- Auto-updates
- Native menus
- IPC communication

**Preload Script** (`electron/preload.ts`):
- Secure IPC bridge
- Context isolation
- API exposure

**Security:**
- Context isolation enabled
- Node integration disabled
- Remote module disabled
- CSP headers enforced

### Mobile (Planned)

**React Native**:
- Shared codebase with web
- Native crypto modules
- Platform-specific storage
- Push notifications

**Challenges:**
- Background processing (calls)
- Battery optimization
- App store compliance
- Platform-specific permissions

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Code splitting by route
   - Dynamic imports for heavy components
   - Progressive image loading

2. **Memoization**
   - `useMemo` for expensive computations
   - `useCallback` for stable callbacks
   - `React.memo` for pure components

3. **Virtual Lists**
   - Long message lists
   - Large friend lists
   - Search results

4. **Web Workers**
   - Crypto operations (planned)
   - Message processing
   - Search indexing

5. **Caching**
   - Local message cache
   - Friend list cache
   - Profile data cache

## Scalability

### Current Limitations

- **Firebase Free Tier**: 50K reads/day, 20K writes/day
- **Cloudflare Calls**: Usage-based pricing
- **Local Storage**: Browser limits (~10MB)

### Scaling Strategy

1. **Phase 1** (Current): Firebase free tier
2. **Phase 2**: Firebase Blaze plan (pay-as-you-go)
3. **Phase 3**: Self-hosted backend option
4. **Phase 4**: Federation protocol (decentralized)

## Testing Strategy

### Test Pyramid

```
         ┌─────────┐
         │   E2E   │  (Few, critical paths)
         └─────────┘
       ┌─────────────┐
       │ Integration │  (Service layer)
       └─────────────┘
     ┌─────────────────┐
     │  Unit Tests     │  (Many, focused)
     └─────────────────┘
```

### Coverage Goals

- **Crypto Utils**: 100% coverage (critical)
- **Services**: 80%+ coverage
- **Components**: 70%+ coverage
- **E2E**: Key user journeys

## Future Architecture

### Planned Improvements

1. **Decentralization**
   - Peer-to-peer messaging option
   - Federation protocol
   - Self-hosted servers

2. **Advanced Features**
   - Multi-device sync
   - Message threads
   - File sharing
   - Voice messages

3. **Performance**
   - Web Workers for crypto
   - IndexedDB for large datasets
   - Service Workers for offline support

4. **Security**
   - Hardware security module support
   - Biometric authentication
   - Certificate pinning
   - Security key support (YubiKey, etc.)

## References

- [TweetNaCl Documentation](https://tweetnacl.js.org/)
- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Signal Protocol](https://signal.org/docs/) (inspiration)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this architecture.

For questions about the architecture, open a discussion on GitHub or reach out to the maintainers.
