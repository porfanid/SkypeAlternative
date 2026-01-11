---
layout: default
title: Home
---

# SkypeAlternative Documentation

Welcome to the official documentation for **SkypeAlternative** - a secure, end-to-end encrypted chat and video call application built with privacy as the top priority.

## 🎯 What is SkypeAlternative?

SkypeAlternative is an open-source, cross-platform desktop and mobile application for real-time communication with military-grade encryption. Every message and call is secured with end-to-end encryption, ensuring that only you and your intended recipients can read your messages or join your calls.

## ✨ Key Features

- 🔒 **End-to-End Encryption** - All messages and calls encrypted using NaCl (TweetNaCl)
- 🔑 **Mnemonic-Based Authentication** - No passwords, just a 12-word recovery phrase (BIP39)
- 💬 **Secure Messaging** - Encrypted chat with reactions, edit/delete, and search
- 👥 **Group Chats** - Multi-party end-to-end encrypted conversations
- 📞 **Video Calls** - Real-time video powered by Cloudflare Calls
- 🌍 **Cross-Platform** - Windows, Linux, macOS, Android, iOS
- 🎯 **Privacy First** - No tracking, no ads, no data collection

## 📚 Documentation Sections

<div class="doc-sections">

### [Getting Started](GETTING_STARTED)
Complete setup guide for new developers. Learn how to:
- Install prerequisites
- Set up your development environment
- Configure Firebase and Cloudflare
- Run the application
- Make your first contribution

### [Architecture Overview](ARCHITECTURE)
Deep dive into the system design:
- System architecture and components
- Security architecture and encryption
- Data flow and state management
- Cryptographic implementation
- Service layer details

### [Project Structure](STRUCTURE)
Understanding the codebase:
- Directory structure
- Technology stack
- Build outputs
- Configuration options

### [Copilot Instructions](COPILOT_INSTRUCTIONS)
Development guidelines for AI-assisted coding:
- Security principles
- Code quality standards
- Architecture patterns
- Naming conventions
- Best practices and examples

### [Contributing](CONTRIBUTING)
How to contribute to the project:
- Development setup
- Coding style guidelines
- Commit message format
- Pull request process
- Code review guidelines

### [Security Policy](SECURITY)
Security guidelines and vulnerability reporting:
- Reporting security issues
- Supported versions
- Security best practices
- Cryptographic details
- Threat model

### [Firebase Setup](FIREBASE_SETUP)
Backend configuration guide:
- Creating a Firebase project
- Firestore database setup
- Security rules configuration
- Authentication setup

### [Cloudflare Worker Deployment](CLOUDFLARE_WORKER_DEPLOYMENT)
Video call infrastructure:
- Cloudflare Calls setup
- Worker deployment
- API configuration
- Testing video calls

### [Troubleshooting](TROUBLESHOOTING)
Common issues and solutions:
- Installation problems
- Runtime errors
- Build issues
- Testing problems

</div>

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/porfanid/SkypeAlternative.git
cd SkypeAlternative

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Run in development mode
npm run electron:dev
```

For detailed instructions, see the [Getting Started Guide](GETTING_STARTED).

## 🛡️ Security First

Security and privacy are our top priorities. SkypeAlternative uses:

- **Ed25519** for digital signatures and authentication
- **X25519-XSalsa20-Poly1305** for message encryption
- **BIP39** for mnemonic phrase generation
- **Electron safeStorage** for secure key storage
- **Firebase security rules** to protect data at rest

All cryptographic operations use battle-tested libraries (TweetNaCl) and follow industry best practices.

**Found a security issue?** Please report it responsibly - see our [Security Policy](SECURITY).

## 🤝 Contributing

We love contributions! Whether you're:
- 🐛 Fixing bugs
- ✨ Adding features
- 📝 Improving documentation
- 🌍 Translating the app
- 💡 Suggesting ideas

Check out our [Contributing Guide](CONTRIBUTING) to get started.

## 📖 Additional Resources

- **[Main Repository](https://github.com/porfanid/SkypeAlternative)** - Source code and releases
- **[GitHub Issues](https://github.com/porfanid/SkypeAlternative/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/porfanid/SkypeAlternative/discussions)** - Questions and community chat
- **[Changelog](https://github.com/porfanid/SkypeAlternative/blob/main/CHANGELOG.md)** - Version history and release notes

## 💬 Community

Join our growing community:
- **GitHub Discussions** - Ask questions and share ideas
- **Issues** - Report bugs and request features
- **Pull Requests** - Contribute code
- **Discord** (coming soon) - Real-time chat

## 📜 License

SkypeAlternative is open source software licensed under the [MIT License](https://github.com/porfanid/SkypeAlternative/blob/main/LICENSE).

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- [TweetNaCl](https://tweetnacl.js.org/) - Cryptography library
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Cloudflare Calls](https://www.cloudflare.com/products/calls/) - Video calling
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool

---

<div class="footer-links">
  <a href="https://github.com/porfanid/SkypeAlternative">View on GitHub</a> •
  <a href="GETTING_STARTED">Get Started</a> •
  <a href="CONTRIBUTING">Contribute</a> •
  <a href="SECURITY">Security</a>
</div>

**Made with ❤️ and 🔒 by the community**
