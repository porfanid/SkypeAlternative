# SkypeAlternative

A secure, open-source, cross-platform desktop and mobile application for real-time chat and video calls with end-to-end encryption.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/porfanid/SkypeAlternative/workflows/CI/badge.svg)](https://github.com/porfanid/SkypeAlternative/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-27-47848F)](https://www.electronjs.org/)

## ✨ Features

- 🔒 **End-to-End Encryption**: All messages and calls are encrypted using NaCl (TweetNaCl)
- 🔑 **Mnemonic-Based Authentication**: No passwords - use a 12-word recovery phrase (BIP39)
- 💬 **Secure Messaging**: Encrypted chat with message reactions, edit/delete, and search
- 👥 **Group Chats**: Multi-party end-to-end encrypted group conversations
- 📞 **Video Calls**: Real-time video calls powered by Cloudflare Calls (coming soon)
- 🤝 **Friend Management**: Add friends using public keys, manage requests
- 🌍 **Cross-Platform**: Runs on Windows, Linux, macOS, Android, and iOS
- 💾 **Local Storage**: Secure key storage and message caching
- 🎯 **Privacy First**: No tracking, no ads, no data collection

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

## 📚 Documentation

**[📖 View Full Documentation](docs/)** - Complete documentation index

### Quick Links
- **[Getting Started](docs/GETTING_STARTED.md)** - Complete setup guide for new developers
- **[Architecture](docs/ARCHITECTURE.md)** - Deep dive into system design and implementation
- **[Project Structure](docs/STRUCTURE.md)** - Understanding the codebase layout
- **[Contributing](docs/CONTRIBUTING.md)** - Guidelines for contributing code
- **[Copilot Instructions](docs/COPILOT_INSTRUCTIONS.md)** - AI-assisted development guidelines
- **[Security Policy](docs/SECURITY.md)** - Security policy and vulnerability reporting
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Additional Resources
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards
- **[Changelog](CHANGELOG.md)** - Version history and release notes
- **[Support](SUPPORT.md)** - Getting help and support options

## 🤝 Contributing

We love contributions! Whether you're:
- 🐛 Fixing bugs
- ✨ Adding features
- 📝 Improving documentation
- 🌍 Translating the app
- 💡 Suggesting ideas

Please read our **[Contributing Guidelines](CONTRIBUTING.md)** to get started.

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/SkypeAlternative.git
cd SkypeAlternative

# Install and run tests
npm install
npm test

# Start development
npm run electron:dev
```

See **[Getting Started Guide](docs/GETTING_STARTED.md)** for detailed instructions.

## 💝 Support the Project

SkypeAlternative is **free and open source** forever. If you find it useful, consider supporting development:

- ⭐ **Star the repo** - Show your support
- 💰 **[Sponsor on GitHub](https://github.com/sponsors/porfanid)** - Help cover infrastructure costs
- 🐛 **Report bugs** - Help us improve
- 📖 **Share knowledge** - Help other users
- 💻 **Contribute code** - Make it better

See **[SUPPORT.md](SUPPORT.md)** for more ways to support the project.

### Why Support?

Your contributions help us:
- 🏗️ Maintain infrastructure (Firebase, Cloudflare, CI/CD)
- 🔒 Fund security audits
- 📚 Create better documentation
- ✨ Build new features
- 🌍 Support the community

**Note:** Core messaging is free forever. Optional call credits system coming in v2.0 for sustainable video calling.

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

This project is **open source** and free to use for personal and commercial purposes.

## Acknowledgments

- TweetNaCl for cryptography
- Firebase for backend infrastructure
- Cloudflare for video calling
- Electron for desktop app framework

## 🆘 Getting Help

- **📖 Documentation**: Check our [docs](docs/) directory
- **💬 Discussions**: Ask questions in [GitHub Discussions](https://github.com/porfanid/SkypeAlternative/discussions)
- **🐛 Issues**: Report bugs via [GitHub Issues](https://github.com/porfanid/SkypeAlternative/issues)
- **💡 Feature Requests**: Suggest features using our [issue templates](.github/ISSUE_TEMPLATE/)

## 🔐 Security

**⚠️ Security Disclosure**: If you discover a security vulnerability, please email security@skypealternative.com (coming soon) instead of opening a public issue.

See our [Security Policy](SECURITY.md) for details on:
- Supported versions
- Reporting vulnerabilities
- Security best practices
- Cryptographic implementation details

## 🌟 Project Status

**Current Version**: 1.0.0-beta  
**Status**: Active Development  
**Tests**: 20/20 passing ✅  
**Coverage**: 70%+ ✅

### Roadmap

- ✅ End-to-end encryption
- ✅ Mnemonic authentication
- ✅ Friend management
- ✅ Chat with reactions/edit/delete
- ✅ Group chats
- 🚧 Video/audio calls (Cloudflare Calls)
- 🚧 File sharing
- 🚧 Mobile apps (Android/iOS)
- 📅 Push notifications
- 📅 Multi-device sync
- 📅 Federation protocol

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- [TweetNaCl](https://tweetnacl.js.org/) - Cryptography
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Cloudflare Calls](https://www.cloudflare.com/products/calls/) - Video calling
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool

Special thanks to all [contributors](CONTRIBUTORS.md)!

---

**Made with ❤️ and 🔒 by the community**

[Website](https://skypealternative.com) · [Documentation](docs/) · [Contributing](CONTRIBUTING.md) · [Support](SUPPORT.md)
