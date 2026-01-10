# SkypeAlternative Documentation

Welcome to the SkypeAlternative documentation! This comprehensive guide will help you understand, build, and contribute to this secure, end-to-end encrypted communication application.

> 📖 **New here?** Check out [How to Access Documentation](HOW_TO_ACCESS_DOCS.md) for guidance on navigating these docs.

## 📚 Table of Contents

### Getting Started
- **[Getting Started Guide](GETTING_STARTED.md)** - Complete setup guide for new developers
  - Prerequisites and installation
  - Firebase and Cloudflare configuration
  - Running the application
  - Development workflow

### Architecture & Design
- **[Architecture Overview](ARCHITECTURE.md)** - Deep dive into system design
  - System architecture
  - Security architecture
  - Data flow and components
  - Service layer details
  - Cryptographic implementation
- **[Project Structure](STRUCTURE.md)** - Understanding the codebase
  - Directory structure
  - Key technologies
  - Build outputs
  - Configuration

### Deployment & Infrastructure
- **[Firebase Setup](FIREBASE_SETUP.md)** - Backend configuration
  - Creating a Firebase project
  - Firestore setup
  - Security rules
  - Authentication
- **[Cloudflare Worker Deployment](CLOUDFLARE_WORKER_DEPLOYMENT.md)** - Video call infrastructure
  - Cloudflare Calls setup
  - Worker deployment
  - API configuration

### Development
- **[Copilot Instructions](COPILOT_INSTRUCTIONS.md)** - AI-assisted development guidelines
  - Security principles
  - Code quality standards
  - Architecture patterns
  - Naming conventions
  - Best practices
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
  - Development setup
  - Code style guidelines
  - Commit message format
  - Pull request process
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
  - Installation problems
  - Runtime errors
  - Build issues
  - Testing problems

### Security
- **[Security Policy](SECURITY.md)** - Security guidelines
  - Reporting vulnerabilities
  - Supported versions
  - Security best practices
  - Cryptographic details

## 🚀 Quick Links

### For New Contributors
1. Start with [Getting Started Guide](GETTING_STARTED.md)
2. Review [Architecture Overview](ARCHITECTURE.md)
3. Read [Copilot Instructions](COPILOT_INSTRUCTIONS.md) for development guidelines
4. Check [Contributing Guide](CONTRIBUTING.md) before making changes

### For Users
- [Main README](../README.md) - Project overview and features
- [Security Policy](SECURITY.md) - How we protect your data
- [Support](../SUPPORT.md) - Getting help

### For Security Researchers
- [Security Policy](SECURITY.md) - Vulnerability reporting
- [Architecture Overview](ARCHITECTURE.md) - Security architecture
- [Copilot Instructions](COPILOT_INSTRUCTIONS.md) - Security principles

## 🔍 Documentation Structure

```
docs/
├── README.md                          # This file - documentation index
├── GETTING_STARTED.md                 # New developer setup guide
├── ARCHITECTURE.md                    # System design and architecture
├── STRUCTURE.md                       # Project structure details
├── FIREBASE_SETUP.md                  # Backend setup guide
├── CLOUDFLARE_WORKER_DEPLOYMENT.md   # Video call infrastructure
├── COPILOT_INSTRUCTIONS.md           # Development guidelines
├── CONTRIBUTING.md                    # Contribution guidelines
├── SECURITY.md                        # Security policy
└── TROUBLESHOOTING.md                 # Problem solving guide
```

## 📖 How to Use This Documentation

### I want to start developing
1. **[Getting Started Guide](GETTING_STARTED.md)** - Set up your development environment
2. **[Project Structure](STRUCTURE.md)** - Understand the codebase layout
3. **[Copilot Instructions](COPILOT_INSTRUCTIONS.md)** - Learn our coding standards

### I want to understand the architecture
1. **[Architecture Overview](ARCHITECTURE.md)** - System design
2. **[Project Structure](STRUCTURE.md)** - Code organization
3. **[Security Policy](SECURITY.md)** - Security implementation

### I want to deploy the backend
1. **[Firebase Setup](FIREBASE_SETUP.md)** - Configure Firebase
2. **[Cloudflare Worker Deployment](CLOUDFLARE_WORKER_DEPLOYMENT.md)** - Set up video calls

### I want to contribute
1. **[Contributing Guide](CONTRIBUTING.md)** - Contribution process
2. **[Copilot Instructions](COPILOT_INSTRUCTIONS.md)** - Code standards
3. **[Getting Started Guide](GETTING_STARTED.md)** - Development setup

### I found a bug
1. Check **[Troubleshooting](TROUBLESHOOTING.md)** for known issues
2. Search existing [GitHub Issues](https://github.com/porfanid/SkypeAlternative/issues)
3. Follow the [bug report template](../.github/ISSUE_TEMPLATE/bug_report.md)

### I found a security issue
1. **DO NOT** open a public issue
2. Read **[Security Policy](SECURITY.md)**
3. Email security@skypealternative.com (or use GitHub Security Advisories)

## 🏗️ Project Overview

SkypeAlternative is a secure, open-source, cross-platform desktop and mobile application for real-time chat and video calls with end-to-end encryption.

### Key Features
- 🔒 End-to-End Encryption (NaCl/TweetNaCl)
- 🔑 Mnemonic-Based Authentication (BIP39)
- 💬 Secure Messaging with reactions, edit/delete
- 👥 Group Chats
- 📞 Video Calls (Cloudflare Calls)
- 🌍 Cross-Platform (Windows, Linux, macOS)
- 🎯 Privacy First - No tracking, no ads, no data collection

### Technology Stack
- **Frontend**: React + TypeScript
- **Desktop**: Electron
- **Backend**: Firebase (Firestore, Auth)
- **Media**: Cloudflare Calls
- **Crypto**: TweetNaCl, BIP39
- **Build**: Vite, electron-builder

## 🤝 Community

- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Pull Requests**: Contribute code
- **Discord** (coming soon): Real-time chat with the community

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- [TweetNaCl](https://tweetnacl.js.org/) - Cryptography
- [Firebase](https://firebase.google.com/) - Backend
- [Cloudflare Calls](https://www.cloudflare.com/products/calls/) - Video
- [Electron](https://www.electronjs.org/) - Desktop framework
- [React](https://react.dev/) - UI framework

---

**Need help?** Check the [Troubleshooting guide](TROUBLESHOOTING.md) or open a [GitHub Discussion](https://github.com/porfanid/SkypeAlternative/discussions).

**Found this useful?** ⭐ Star the repo to show your support!
