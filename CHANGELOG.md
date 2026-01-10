# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Electron + React + TypeScript
- End-to-end encryption using TweetNaCl (NaCl)
- BIP39 mnemonic phrase generation for deterministic key pairs
- Ed25519 digital signatures for authentication
- Challenge-response authentication system
- Firebase Firestore integration for encrypted message storage
- Secure local key storage using Electron safeStorage
- Friend management with public key-based requests
- Basic UI with login, registration, and main app screens
- Comprehensive test suite with Jest (20/20 crypto tests passing)
- GitHub Actions CI/CD for automated testing
- Multi-platform build workflows (Windows, Linux, macOS)
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Project documentation (README, STRUCTURE, CONTRIBUTING)
- Code of Conduct and Copilot instructions

### Security
- Client-side encryption ensures server never sees plaintext
- Deterministic key derivation from mnemonic phrases
- Secure random number generation for cryptographic operations
- Message authentication to prevent tampering

## [1.0.0] - TBD

### Added
- Initial release

### Security
- End-to-end encrypted messaging
- Mnemonic-based authentication
- Secure key storage

[Unreleased]: https://github.com/porfanid/SkypeAlternative/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/porfanid/SkypeAlternative/releases/tag/v1.0.0
