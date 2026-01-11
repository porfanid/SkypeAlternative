# Contributing to SkypeAlternative

First off, thank you for considering contributing to SkypeAlternative! It's people like you that make this a great secure communication tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Security Vulnerabilities](#security-vulnerabilities)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Git
- Basic knowledge of TypeScript, React, and Electron
- Understanding of cryptography basics (helpful but not required)

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SkypeAlternative.git
   cd SkypeAlternative
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/porfanid/SkypeAlternative.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and Cloudflare credentials
   ```

6. **Run tests** to verify setup:
   ```bash
   npm test
   ```

7. **Start development server**:
   ```bash
   npm run electron:dev
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear descriptive title**
- **Exact steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, app version)
- **Error messages** or logs (sanitized of sensitive data)

**Template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened

**Environment:**
- OS: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- Node Version: [e.g., 20.10.0]
- App Version: [e.g., 1.0.0]

**Additional Context:**
Any other relevant information
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- **Clear descriptive title**
- **Use case** - why is this enhancement useful?
- **Proposed solution** - how should it work?
- **Alternative solutions** considered
- **Impact on security/privacy** if applicable

### Pull Requests

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [style guidelines](#style-guidelines)

3. **Write/update tests** for your changes

4. **Run the test suite**:
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

5. **Commit your changes** with clear commit messages

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Test results
   - Security implications (if any)

## Style Guidelines

### Code Style

We use ESLint and TypeScript for code quality. Key points:

- **TypeScript strict mode** enabled
- **No `any` types** unless absolutely necessary
- **Functional components** with hooks for React
- **Proper error handling** with try-catch
- **Meaningful variable names** (no single letters except loops)
- **Comments** for complex logic, not obvious code

See our [Copilot Instructions](.github/copilot-instructions.md) for detailed guidelines.

### TypeScript

```typescript
// ✅ Good
interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  senderId: string;
}

async function sendMessage(message: ChatMessage): Promise<void> {
  // Implementation
}

// ❌ Bad
function sendMessage(msg: any) {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good
import { useState, useEffect } from 'react';

interface ChatWindowProps {
  friendId: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ friendId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    // Setup and cleanup
    return () => {
      // Cleanup
    };
  }, [friendId]);

  return (
    // JSX
  );
};

// ❌ Bad
export default function ChatWindow(props) {
  // Implementation
}
```

### Testing

```typescript
// ✅ Good
describe('encryptMessage', () => {
  it('should encrypt and decrypt a message successfully', () => {
    const original = 'Hello, World!';
    const encrypted = encryptMessage(original, bobPublicKey, alicePrivateKey);
    const decrypted = decryptMessage(encrypted, bobPrivateKey, alicePublicKey);
    
    expect(decrypted).toBe(original);
  });

  it('should fail to decrypt with wrong key', () => {
    const encrypted = encryptMessage('test', bobPublicKey, alicePrivateKey);
    
    expect(() => {
      decryptMessage(encrypted, wrongPrivateKey, alicePublicKey);
    }).toThrow('Decryption failed');
  });
});
```

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements

**Examples:**
```
feat(chat): add real-time message synchronization

Implement Firebase listeners for real-time chat updates.
Messages are synced automatically when sent or received.

Closes #45

---

fix(crypto): correct key derivation for Ed25519

The previous implementation didn't properly convert between
Ed25519 signing keys and Curve25519 encryption keys.

Fixes #67

---

security(auth): add rate limiting to login attempts

Prevent brute force attacks by limiting login attempts
to 5 per 15 minutes per IP address.

BREAKING CHANGE: Login API now returns 429 status code
when rate limit is exceeded.
```

## Pull Request Process

1. **Update documentation** if you've changed APIs
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** with notable changes
5. **Request review** from maintainers
6. **Address feedback** promptly
7. **Squash commits** if requested before merge

### PR Template

```markdown
## Description
Brief description of changes

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security improvement

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Security implications considered
```

## Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead, please email security concerns to the maintainers directly. Include:

- **Description** of the vulnerability
- **Steps to reproduce**
- **Potential impact**
- **Suggested fix** (if any)

We will respond within 48 hours and work with you to address the issue.

### Security Best Practices

When contributing:

- **Never commit** private keys, mnemonics, or credentials
- **Validate all inputs** especially user-provided data
- **Use secure defaults** for crypto operations
- **Follow principle** of least privilege
- **Consider attack vectors** for new features
- **Review crypto code** carefully - when in doubt, ask
- **Keep dependencies updated** for security patches

## Community

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Chat**: Join our community chat (link TBD)
- **Blog**: Follow updates on our blog (link TBD)

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes for significant contributions
- Special recognition for security improvements

## Questions?

Feel free to ask questions by:
- Opening a discussion on GitHub
- Commenting on relevant issues
- Reaching out to maintainers

Thank you for contributing to making secure communication accessible to everyone! 🔒
