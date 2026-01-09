# SkypeAlternative

A secure, cross-platform desktop and mobile application for real-time chat and video calls with end-to-end encryption.

## Features

- 🔒 **End-to-End Encryption**: All messages and calls are encrypted using NaCl (TweetNaCl)
- 🔑 **Mnemonic-Based Authentication**: No passwords - use a 12-word recovery phrase
- 💬 **Secure Messaging**: Encrypted chat with Firebase backend
- 📞 **Video Calls**: Real-time video calls powered by Cloudflare Calls
- 👥 **Friend Management**: Add friends using public keys
- 🌍 **Cross-Platform**: Runs on Windows, Linux, macOS, Android, and iOS
- 💾 **Local Storage**: Secure key storage and message caching

## Architecture

### Security

- **Key Generation**: BIP39 mnemonic phrases generate deterministic Ed25519 key pairs
- **Authentication**: Challenge-response authentication with digital signatures
- **Message Encryption**: X25519-XSalsa20-Poly1305 for message encryption
- **Secure Storage**: Electron safeStorage for desktop, Keychain/Keystore for mobile
- **Firebase**: Used only for signaling and storing encrypted data
- **Cloudflare Calls**: Handles WebRTC media streams

### Technology Stack

- **Frontend**: React + TypeScript
- **Desktop**: Electron
- **Mobile**: React Native (planned)
- **Backend**: Firebase (Firestore, Auth)
- **Media**: Cloudflare Calls
- **Crypto**: TweetNaCl, BIP39
- **Build**: Vite, electron-builder

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Firebase project (free tier works)
- Cloudflare account (for video calls)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/porfanid/SkypeAlternative.git
cd SkypeAlternative
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase and Cloudflare credentials.

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (anonymous or custom)
4. Create a web app and copy the configuration
5. Add the configuration to `.env`

### Cloudflare Setup (for video calls)

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to Stream → Calls
3. Create API token with Calls permissions
4. Add credentials to `.env`

### Development

Run in development mode:
```bash
npm run electron:dev
```

This will start the Vite dev server and launch Electron.

### Building

Build for your platform:

**Windows:**
```bash
npm run electron:build:win
```

**Linux:**
```bash
npm run electron:build:linux
```

**macOS:**
```bash
npm run electron:build:mac
```

Builds will be in the `release/` directory.

## Testing

Run unit tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run E2E tests:
```bash
npm run test:e2e
```

## Security Considerations

### Important Notes

1. **Recovery Phrase**: Your 12-word recovery phrase is the ONLY way to access your account. Store it securely offline.
2. **No Password Recovery**: We cannot recover your account if you lose your recovery phrase.
3. **Public Keys**: Share your public key with friends to receive friend requests.
4. **Private Keys**: Never share your private key or recovery phrase with anyone.
5. **Firebase Security**: Firebase only stores encrypted data. Encryption keys never leave your device.

### Cryptographic Details

- **Key Derivation**: BIP39 mnemonic → seed → Ed25519 keypair
- **Signature Algorithm**: Ed25519 (for authentication)
- **Encryption Algorithm**: X25519-XSalsa20-Poly1305 (for messages)
- **Key Exchange**: Ephemeral Diffie-Hellman for each message
- **Random Generation**: Uses crypto-secure random number generator

## Platform Support

### Desktop

- ✅ Windows 10/11 (x64, ARM64)
- ✅ Linux (x64, ARM64, ARMv7)
- ✅ macOS 10.15+ (x64, Apple Silicon)

### Mobile

- 🚧 Android 8.0+ (coming soon)
- 🚧 iOS 13.0+ (requires Apple Developer account)

## CI/CD

Automated builds and releases via GitHub Actions:

- **CI**: Runs tests on every PR
- **Release**: Automatic builds for all platforms on version tags
- **Coverage**: Code coverage reporting to Codecov

To create a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linter: `npm run lint`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- TweetNaCl for cryptography
- Firebase for backend infrastructure
- Cloudflare for video calling
- Electron for desktop app framework

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**⚠️ Security Disclosure**: If you discover a security vulnerability, please email [security contact] instead of opening a public issue.
