# Security Policy

## Our Security Commitment

SkypeAlternative is built with security and privacy as the top priorities. We use industry-standard cryptographic algorithms and follow security best practices to protect user data.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email**: Send details to security@skypealternative.com (coming soon)
2. **Subject**: "Security Vulnerability Report"
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies by severity (see below)

### Severity Levels

**Critical** (Fix within 7 days)
- Remote code execution
- Authentication bypass
- Private key exposure
- Plaintext message exposure

**High** (Fix within 14 days)
- Local privilege escalation
- Cryptographic weakness
- Key derivation flaws
- Signature verification bypass

**Medium** (Fix within 30 days)
- Information disclosure
- Denial of service
- Session hijacking
- XSS vulnerabilities

**Low** (Fix within 90 days)
- Minor information leaks
- UI spoofing
- Non-critical bugs

## Security Features

### Cryptography

**Key Generation:**
- BIP39 mnemonic phrases (12 words)
- Deterministic key derivation
- Ed25519 signing keys (512-bit)
- Curve25519 encryption keys (256-bit)

**Message Encryption:**
- Algorithm: X25519-XSalsa20-Poly1305
- Key exchange: Elliptic Curve Diffie-Hellman
- Authentication: Poly1305 MAC
- Forward secrecy: Unique nonce per message

**Digital Signatures:**
- Algorithm: Ed25519
- Message authentication
- Sender verification
- Non-repudiation

**Random Number Generation:**
- Crypto-secure PRNG (crypto.getRandomValues)
- Used for nonces, session keys, challenges

### Authentication

**Challenge-Response:**
1. Server sends random challenge
2. Client signs with private key
3. Server verifies with public key
4. No password transmission

**Session Management:**
- Secure token storage
- Automatic expiration
- No persistent sessions (by design)

### Storage Security

**Desktop (Electron):**
- Private keys: safeStorage API (OS keychain)
- Messages: Encrypted at rest
- Settings: Local file with permissions

**Mobile (Planned):**
- Private keys: iOS Keychain / Android Keystore
- Messages: Encrypted SQLite
- Settings: Secure SharedPreferences

### Network Security

**Transport:**
- All traffic over HTTPS/WSS
- TLS 1.2 minimum
- Certificate validation enabled
- No insecure connections allowed

**Firebase Security Rules:**
- User data accessible only by owner
- User enumeration prevented (no listing all users)
- Friend requests verified
- Messages require friendship verification
- Message access restricted to sender/recipient only
- Public keys discoverable only by direct lookup

### Application Security

**Input Validation:**
- All user inputs sanitized
- Type checking with TypeScript
- Length limits enforced
- Format validation

**XSS Protection:**
- Content Security Policy (CSP)
- HTML escaping
- Safe innerHTML usage
- React's built-in protections

**Electron Security:**
- Context isolation enabled
- Node integration disabled (renderer)
- Remote module disabled
- Secure IPC bridge (preload script)

## Production Deployment Recommendations

For production deployments, consider these additional security measures:

**Firebase App Check:**
- Enable Firebase App Check to prevent unauthorized access
- Protects against abusive traffic and bot accounts
- Supports reCAPTCHA, DeviceCheck (iOS), and SafetyNet (Android)

**Rate Limiting:**
- Implement rate limiting on friend requests
- Throttle message sending to prevent spam
- Use Firebase Extensions for rate limiting

**Authentication Enhancements:**
- Consider adding email verification for account recovery
- Implement CAPTCHA for registration
- Add device fingerprinting to detect suspicious activity
- Monitor for unusual account creation patterns

**Monitoring:**
- Set up Firebase Security Rules logging
- Monitor failed authentication attempts
- Track unusual access patterns
- Set up alerts for security events

## Best Practices for Users

### Account Security

1. **Mnemonic Phrase**:
   - Write it down on paper
   - Store in a safe place
   - Never share with anyone
   - Don't store digitally (unless encrypted)
   - This is your ONLY account recovery method

2. **Public Key Sharing**:
   - Share via secure channel
   - Verify fingerprint in person
   - Don't post publicly unless intended

3. **Device Security**:
   - Use full-disk encryption
   - Set strong device password
   - Enable screen lock
   - Keep OS updated

4. **App Security**:
   - Download only from official sources
   - Verify release signatures (planned)
   - Keep app updated
   - Log out on shared devices

### Message Security

1. **Verify Recipients**:
   - Check public key fingerprints
   - Confirm identity out-of-band
   - Be cautious of impersonation

2. **Sensitive Data**:
   - Use expiring messages for sensitive info
   - Avoid sharing private keys/mnemonics
   - Delete messages when no longer needed
   - Remember: screenshots bypass encryption

3. **Group Chats**:
   - Trust all members
   - Be aware of member list
   - Remember: anyone can screenshot
   - New members can see history

## Security Audit History

| Date | Auditor | Scope | Status |
|------|---------|-------|--------|
| TBD  | TBD     | Full  | Planned |

We plan to conduct regular security audits as the project matures.

## Known Limitations

**Current Version (1.0.x):**

1. **Anonymous Authentication**:
   - Uses Firebase anonymous authentication for simplicity
   - No email verification or CAPTCHA
   - Potential for bot account creation
   - Mitigated by friendship requirement for messaging
   - Rate limiting recommended for production (see Firebase App Check)
   - Consider implementing additional verification for production deployments

2. **No Message Deletion**:
   - "Delete" is client-side only
   - Recipients retain copies
   - Firebase still has encrypted data

3. **No Perfect Forward Secrecy**:
   - Key compromise exposes past messages
   - Ratcheting planned for v2.0

4. **No Multi-Device Sync**:
   - Mnemonic must be entered on each device
   - Messages don't sync between devices
   - Planned for future version

5. **Metadata Exposure**:
   - Firebase sees: who talks to whom, when
   - Message content is encrypted
   - Metadata protection planned (v3.0)

6. **No Certificate Pinning**:
   - Relies on system trust store
   - Vulnerable to MITM with compromised CA
   - Pinning planned for v1.1

## Compliance

### Data Protection

**GDPR Compliance:**
- User data is encrypted end-to-end
- Users control their data
- Right to deletion (account + messages)
- Data portability (export planned)
- No tracking or profiling

**CCPA Compliance:**
- No sale of personal information
- No data brokering
- User data not monetized

### Cryptographic Standards

**NIST Compliance:**
- Uses NIST-approved algorithms
- Ed25519 (FIPS 186-5 pending)
- SHA-512 (FIPS 180-4)

**Industry Standards:**
- Follows Signal Protocol design
- Based on NaCl (Networking and Cryptography Library)
- BIP39 for mnemonic generation

## Bug Bounty Program

**Status**: Not yet available

We plan to launch a bug bounty program once the project reaches v1.0 stable. Details will be announced on our website and GitHub.

### Expected Rewards (Planned)

- **Critical**: $500 - $2000
- **High**: $200 - $500
- **Medium**: $50 - $200
- **Low**: $10 - $50

(Amounts depend on funding and project maturity)

## Security Roadmap

### v1.1 (Q2 2026)
- [ ] Certificate pinning
- [ ] Biometric authentication
- [ ] Hardware security module support
- [ ] Security key support (YubiKey)

### v2.0 (Q3 2026)
- [ ] Signal Protocol (Double Ratchet)
- [ ] Perfect forward secrecy
- [ ] Post-compromise security
- [ ] Key rotation

### v3.0 (Q4 2026)
- [ ] Metadata protection (Tor/I2P)
- [ ] Sealed sender
- [ ] Anonymous friend requests
- [ ] Decentralized architecture

## Disclosure Policy

When a security vulnerability is fixed:

1. **Immediate**:
   - Patch released
   - Users notified of update
   - Severity level disclosed

2. **After 90 days**:
   - Full technical details published
   - Credit to researcher (if authorized)
   - Lessons learned documented

3. **Responsible Disclosure**:
   - We commit to not pursuing legal action
   - Researchers given credit
   - Coordination with affected parties

## Contact

- **Security Email**: security@skypealternative.com (coming soon)
- **PGP Key**: [Coming soon]
- **GitHub Security Advisories**: [Link](https://github.com/porfanid/SkypeAlternative/security/advisories)

## References

- [TweetNaCl Security](https://tweetnacl.js.org/)
- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [Signal Protocol](https://signal.org/docs/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)

---

**Last Updated**: January 2026  
**Version**: 1.0.0
