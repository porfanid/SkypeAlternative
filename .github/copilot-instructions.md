# GitHub Copilot Instructions for SkypeAlternative

## Project Overview
SkypeAlternative is a secure, end-to-end encrypted chat and video call application built with Electron, React, and TypeScript. Security and user privacy are the highest priorities.

## Core Principles

### 1. Security First
- **NEVER** store private keys or unencrypted sensitive data in plain text
- **ALWAYS** use end-to-end encryption for messages and calls
- **VALIDATE** all user inputs, especially public keys and mnemonics
- **SANITIZE** all data before displaying to prevent XSS attacks
- **USE** secure random number generation for cryptographic operations
- **IMPLEMENT** proper key derivation functions (BIP39, Ed25519)
- **AVOID** logging sensitive information (keys, mnemonics, plaintext messages)

### 2. Code Quality Standards

#### TypeScript
- **ENABLE** strict mode (`strict: true` in tsconfig.json)
- **USE** explicit types - avoid `any` unless absolutely necessary
- **DEFINE** proper interfaces in `src/models/` for all data structures
- **EXPORT** types alongside implementations
- **PREFER** type inference where it improves readability

#### React Components
- **USE** functional components with hooks
- **IMPLEMENT** proper error boundaries for critical sections
- **MEMOIZE** expensive computations with `useMemo`
- **DEBOUNCE** user inputs that trigger network requests
- **HANDLE** loading and error states explicitly
- **CLEAN UP** subscriptions and listeners in `useEffect` cleanup

#### Testing
- **WRITE** unit tests for all utility functions (aim for 80%+ coverage)
- **TEST** crypto functions with multiple test cases including edge cases
- **MOCK** external dependencies (Firebase, Electron APIs) in tests
- **VERIFY** encryption/decryption round-trips work correctly
- **CHECK** for proper error handling in tests
- **USE** descriptive test names: "should [expected behavior] when [condition]"

### 3. Architecture Patterns

#### Service Layer (`src/services/`)
- **SINGLETON** pattern for services (use `getInstance()`)
- **ASYNC/AWAIT** for all asynchronous operations
- **ERROR HANDLING** with try-catch and meaningful error messages
- **DEPENDENCY INJECTION** - services should not directly instantiate other services
- **INTERFACE SEGREGATION** - keep service methods focused and single-purpose

#### State Management
- **REACT CONTEXT** for global state (user, auth status)
- **LOCAL STATE** for component-specific data
- **CUSTOM HOOKS** for reusable stateful logic
- **IMMUTABLE UPDATES** - never mutate state directly

#### Firebase Integration
- **ENCRYPT** all data before storing in Firestore
- **USE** security rules to prevent unauthorized access
- **BATCH** multiple writes when possible for performance
- **IMPLEMENT** offline support with local caching
- **HANDLE** Firebase errors gracefully

### 4. Naming Conventions

#### Files and Directories
- **PascalCase** for React components: `LoginScreen.tsx`, `ChatWindow.tsx`
- **camelCase** for utilities and services: `crypto.ts`, `storage.ts`
- **kebab-case** for CSS files: `login-screen.css`
- **UPPERCASE** for constants: `API_ENDPOINTS.ts`

#### Code
- **PascalCase** for components, interfaces, types: `User`, `ChatMessage`, `LoginScreen`
- **camelCase** for functions, variables, methods: `encryptMessage`, `getUserData`
- **SCREAMING_SNAKE_CASE** for constants: `MAX_MESSAGE_LENGTH`, `DEFAULT_THEME`
- **Prefix** private class members with underscore: `_internalState`
- **Prefix** boolean variables/functions with is/has/can: `isAuthenticated`, `hasPermission`

### 5. Comments and Documentation

#### When to Comment
- **DOCUMENT** all public APIs with JSDoc
- **EXPLAIN** complex algorithms or cryptographic operations
- **CLARIFY** non-obvious business logic
- **NOTE** security considerations or potential vulnerabilities
- **AVOID** obvious comments that just restate the code

#### JSDoc Format
```typescript
/**
 * Encrypts a message using the recipient's public key
 * @param message - The plaintext message to encrypt
 * @param recipientPublicKey - Base64-encoded Ed25519 public key
 * @param senderPrivateKey - Base64-encoded Ed25519 private key
 * @returns Encrypted message with nonce and ephemeral key
 * @throws {Error} If encryption fails or keys are invalid
 */
export function encryptMessage(
  message: string,
  recipientPublicKey: string,
  senderPrivateKey: string
): EncryptedMessage {
  // Implementation
}
```

### 6. Error Handling

#### Best Practices
- **CATCH** errors at appropriate levels
- **LOG** errors with context (but NOT sensitive data)
- **DISPLAY** user-friendly error messages
- **RECOVER** gracefully from errors when possible
- **PROPAGATE** errors up when recovery isn't possible
- **USE** custom error classes for domain-specific errors

#### Example
```typescript
try {
  const encrypted = encryptMessage(text, recipientKey, senderKey);
  await sendMessage(encrypted);
} catch (error) {
  if (error instanceof CryptoError) {
    showNotification('Encryption failed. Please check your keys.');
  } else if (error instanceof NetworkError) {
    showNotification('Failed to send message. Check your connection.');
  } else {
    logger.error('Unexpected error:', error);
    showNotification('An unexpected error occurred.');
  }
}
```

### 7. Performance Considerations

#### Optimization
- **LAZY LOAD** components and routes where possible
- **VIRTUALIZE** long lists (chat history, friend list)
- **CACHE** computed values and API responses
- **DEBOUNCE** frequent operations (typing indicators, search)
- **THROTTLE** scroll and resize handlers
- **USE** Web Workers for heavy crypto operations
- **MINIMIZE** re-renders with proper memoization

#### Bundle Size
- **TREE-SHAKE** unused code
- **CODE-SPLIT** by route
- **LAZY-IMPORT** large dependencies
- **AVOID** importing entire libraries when only parts are needed

### 8. Accessibility

#### Requirements
- **SEMANTIC HTML** - use proper tags (`<button>`, `<nav>`, etc.)
- **ARIA LABELS** for interactive elements
- **KEYBOARD NAVIGATION** - all features accessible via keyboard
- **FOCUS MANAGEMENT** - visible focus indicators
- **COLOR CONTRAST** - WCAG AA compliance minimum
- **SCREEN READER** support for critical features

### 9. Electron-Specific

#### Best Practices
- **IPC SECURITY** - validate all messages between main and renderer
- **CONTEXT ISOLATION** - always enable for security
- **NODEINTEGRATION** - keep disabled in renderer
- **CSP** - implement Content Security Policy
- **UPDATES** - implement secure auto-update mechanism
- **PRIVILEGE SEPARATION** - minimize main process responsibilities

### 10. Git Commit Messages

#### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **security**: Security improvements

#### Examples
```
feat(chat): add message encryption with E2E

Implement end-to-end encryption for chat messages using NaCl.
Messages are encrypted before sending to Firebase and decrypted
only on recipient's device.

Closes #123
```

## Security Checklist

Before committing code that handles sensitive data:
- [ ] No private keys or mnemonics in logs
- [ ] All user inputs validated
- [ ] SQL/NoSQL injection prevented
- [ ] XSS vulnerabilities addressed
- [ ] CSRF protections in place
- [ ] Secure random number generation used
- [ ] No hardcoded secrets or credentials
- [ ] Encryption algorithms properly implemented
- [ ] Key derivation follows best practices
- [ ] Error messages don't leak sensitive info

## Code Review Focus Areas

When reviewing PRs:
1. **Security vulnerabilities**
2. **Type safety and null checks**
3. **Error handling completeness**
4. **Test coverage for new code**
5. **Performance implications**
6. **Accessibility compliance**
7. **Code duplication**
8. **Documentation quality**

## Resources

- [TweetNaCl Documentation](https://tweetnacl.js.org/)
- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## Reminders

- **Privacy by design**: Users control their data
- **Minimal data collection**: Only what's absolutely necessary
- **Open source**: Code is transparent and auditable
- **No backdoors**: Never compromise user security
- **User education**: Help users understand security features
