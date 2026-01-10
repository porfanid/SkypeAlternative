# Security Improvements

This document summarizes the security improvements made to address the reported vulnerabilities.

## Fixed Vulnerabilities

### 1. Global User List Exposure (FIXED)

**Problem:** The security rules allowed any logged-in user to download the entire list of users by querying the users collection.

**Solution:**
- Changed `allow read` to `allow get` for the users collection in firestore.rules
- Added explicit `allow list: if false` to prevent listing/querying all users
- Updated `findUserByPublicKey()` in auth.ts to use direct document access instead of queries
- Users can now only retrieve specific user documents by their ID

**Impact:**
- Prevents enumeration of all registered users
- Stops malicious actors from building a database of usernames and public keys
- Maintains legitimate functionality of looking up specific users by public key

### 2. No Friendship Check on Messages (FIXED)

**Problem:** Messages could be sent to any user without verifying a friendship relationship exists.

**Solution:**
- Added friendship verification to message creation rules in firestore.rules
- Messages can only be created if a friendship document exists between sender and recipient
- Checks for friendship in both directions: `{senderId}_{recipientId}` OR `{recipientId}_{senderId}`
- Added `encrypted: true` flag to all message creation operations for rule compliance

**Impact:**
- Prevents spam from non-friends
- Ensures only accepted friends can exchange messages
- Maintains privacy and reduces abuse potential

### 3. Anonymous Bot Creation (DOCUMENTED)

**Problem:** Firebase anonymous authentication allows easy creation of bot accounts without verification.

**Solution:**
- Documented as a known limitation in SECURITY.md
- Added production deployment recommendations including:
  - Firebase App Check for bot prevention
  - Rate limiting on friend requests and messages
  - CAPTCHA for registration
  - Monitoring and alerting
- The friendship requirement now mitigates the impact of bot accounts

**Impact:**
- Bot accounts can still be created but cannot spam users without friend acceptance
- Production deployments have clear guidance on additional protections
- Transparency about current limitations

## Implementation Details

### Firestore Rules Changes

```javascript
// Users collection - Before
match /users/{userId} {
  allow read: if request.auth != null;
  // ...
}

// Users collection - After
match /users/{userId} {
  allow get: if request.auth != null;
  allow list: if false;
  // ...
}

// Messages collection - Before
match /messages/{messageId} {
  allow create: if request.auth != null && 
    request.resource.data.senderId == request.auth.uid &&
    request.resource.data.encrypted == true;
}

// Messages collection - After
match /messages/{messageId} {
  allow create: if request.auth != null && 
    request.resource.data.senderId == request.auth.uid &&
    request.resource.data.encrypted == true &&
    (exists(/databases/$(database)/documents/friends/$(request.auth.uid + '_' + request.resource.data.recipientId)) ||
     exists(/databases/$(database)/documents/friends/$(request.resource.data.recipientId + '_' + request.auth.uid)));
}
```

### Code Changes

1. **auth.ts**: Modified `findUserByPublicKey()` to compute userId from public key hash and use direct `getDoc()` instead of querying
2. **message.ts**: Added `encrypted: true` flag when creating messages
3. **enhancedMessage.ts**: Added `encrypted: true` flag for expiring messages

## Testing Recommendations

To verify these security improvements:

1. **Test User Enumeration Prevention:**
   - Attempt to query all users using `getDocs(collection(db, 'users'))`
   - Should be blocked by security rules
   - Verify specific user lookup by ID still works

2. **Test Friendship Verification:**
   - Try to send a message to a non-friend
   - Should be rejected by security rules
   - Verify messages work between friends

3. **Test Bot Mitigation:**
   - Create multiple anonymous accounts rapidly
   - Verify they cannot spam users without friend acceptance
   - Verify friend request limits (if implemented)

## Future Enhancements

Consider implementing:
- Firebase App Check for production
- Rate limiting using Firebase Extensions
- Email verification for account recovery
- CAPTCHA for registration
- Enhanced monitoring and alerting
- Automated bot detection
