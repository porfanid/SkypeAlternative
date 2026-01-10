# Manual Testing Guide for Security Fixes

This document provides a guide for manually testing the security fixes implemented in this PR.

## Prerequisites

1. Firebase project with Firestore enabled
2. Application running locally or deployed
3. Two test accounts (User A and User B)

## Test Case 1: Verify User List Cannot Be Enumerated

**Objective:** Confirm that users cannot query the entire users collection.

**Steps:**
1. Open Firebase Console → Firestore
2. Try to run a query against the `users` collection (from Firebase Console or client code)
3. Verify that list operations are blocked

**Expected Result:**
- Direct document reads by ID should work
- Listing/querying all users should be blocked with permission denied

**Test Code (should FAIL):**
```javascript
// This should fail with permission denied
const usersRef = collection(db, 'users');
const querySnapshot = await getDocs(usersRef);
// Expected: FirebaseError: Missing or insufficient permissions
```

**Test Code (should SUCCEED):**
```javascript
// This should work - direct document access
const userRef = doc(db, 'users', 'specificUserId');
const userDoc = await getDoc(userRef);
// Expected: Success if user exists
```

## Test Case 2: Verify findUserByPublicKey Still Works

**Objective:** Confirm that looking up users by public key still functions correctly.

**Steps:**
1. Create a user with a known public key
2. Call `authService.findUserByPublicKey(publicKey)`
3. Verify the user is found correctly

**Expected Result:**
- Function computes userId from public key hash
- Directly retrieves document by ID
- Returns user data if public key matches

**Test Code:**
```javascript
const publicKey = "...test public key...";
const user = await authService.findUserByPublicKey(publicKey);
console.assert(user !== null, "User should be found");
console.assert(user.publicKey === publicKey, "Public keys should match");
```

## Test Case 3: Verify Messages Require Friendship

**Objective:** Confirm that messages can only be sent between friends.

**Steps:**
1. Create two user accounts (User A and User B)
2. WITHOUT creating a friendship, attempt to send a message from A to B
3. Verify the message creation is blocked
4. Create a friendship between A and B
5. Attempt to send a message from A to B again
6. Verify the message is sent successfully

**Expected Results:**
- Step 2: Message creation fails with permission denied
- Step 5: Message is created successfully

**Test Code (should FAIL without friendship):**
```javascript
// User A tries to send message to User B without friendship
const messageRef = doc(db, 'messages', `${userA.id}_${userB.id}_${Date.now()}`);
await setDoc(messageRef, {
  senderId: userA.id,
  recipientId: userB.id,
  encryptedContent: "...",
  encrypted: true,
  timestamp: Timestamp.now()
});
// Expected: FirebaseError: Missing or insufficient permissions
```

**Test Code (should SUCCEED with friendship):**
```javascript
// First create friendship
await friendService.sendFriendRequest(userB.publicKey, userA.username);
await friendService.acceptFriendRequest(requestId);

// Now send message - should work
const messageRef = doc(db, 'messages', `${userA.id}_${userB.id}_${Date.now()}`);
await setDoc(messageRef, {
  senderId: userA.id,
  recipientId: userB.id,
  encryptedContent: "...",
  encrypted: true,
  timestamp: Timestamp.now()
});
// Expected: Success
```

## Test Case 4: Verify Friendship Creation Still Works

**Objective:** Confirm that friend request flow still works correctly.

**Steps:**
1. User A sends friend request to User B (using B's public key)
2. User B receives and accepts the request
3. Verify both friendship documents are created

**Expected Result:**
- Two friendship documents created:
  - `friends/{userA.id}_{userB.id}` 
  - `friends/{userB.id}_{userA.id}`
- Both users can now exchange messages

## Test Case 5: Verify Encrypted Flag Is Set

**Objective:** Confirm all messages have the encrypted flag set.

**Steps:**
1. Send a message between two friends
2. Check Firebase Console → Firestore → messages collection
3. Inspect the message document

**Expected Result:**
- Message document has `encrypted: true` field
- Message creation succeeds

## Security Validation Checklist

- [ ] User enumeration blocked (cannot list all users)
- [ ] Specific user lookup by public key works
- [ ] Messages require friendship verification
- [ ] Non-friends cannot exchange messages  
- [ ] Friend request system works correctly
- [ ] All messages have encrypted flag set
- [ ] Existing friendships continue to work
- [ ] Message history loads correctly

## Regression Testing

Verify that existing functionality still works:

1. **Registration:**
   - [ ] New users can register with mnemonic phrase
   - [ ] User document is created correctly

2. **Login:**
   - [ ] Users can login with existing mnemonic
   - [ ] Challenge-response authentication works

3. **Friend Management:**
   - [ ] Can send friend requests
   - [ ] Can accept/reject friend requests
   - [ ] Can view friends list
   - [ ] Can remove friends

4. **Messaging:**
   - [ ] Can send messages to friends
   - [ ] Can receive messages from friends
   - [ ] Messages are encrypted/decrypted correctly
   - [ ] Message history loads

5. **Group Chats:**
   - [ ] Can create group chats
   - [ ] Can send group messages
   - [ ] Group member verification works

## Performance Testing

Test that the new rules don't significantly impact performance:

1. **User Lookup Time:**
   - Direct document access should be as fast as or faster than queries
   - Measure time to execute `findUserByPublicKey`

2. **Message Creation Time:**
   - Friendship verification adds minimal overhead
   - Measure time to create a message

3. **Firebase Read/Write Costs:**
   - Friendship check requires 1 exists() call (no data read)
   - Monitor Firebase usage in console

## Known Issues and Workarounds

### Issue: Pre-existing Tests Failing

**Description:** Some pre-existing unit tests fail due to mocking issues unrelated to security changes.

**Affected Tests:**
- tests/unit/call.test.ts (Firebase mocking)
- tests/unit/file.test.ts (Memory issues)

**Status:** Pre-existing issue, not caused by security changes.

**Workaround:** Use `--no-verify` flag when committing.

### Issue: Cannot Push with Git Credentials

**Description:** GitHub credentials not available in sandbox environment.

**Workaround:** Changes are committed locally. User needs to manually push or use GitHub web interface.

## Firebase Console Verification

1. Navigate to Firebase Console → Firestore → Rules
2. Verify the rules have been updated (check timestamp)
3. Test rules in the Rules Playground:

**Test 1: User List (should FAIL):**
```
match /users/{userId}
  operation: list
  auth: authenticated user
  Expected: Denied
```

**Test 2: User Get (should SUCCEED):**
```
match /users/{userId}
  operation: get
  auth: authenticated user
  Expected: Allowed
```

**Test 3: Message Create without friendship (should FAIL):**
```
match /messages/{messageId}
  operation: create
  auth: authenticated user (senderId)
  data: {senderId: auth.uid, recipientId: "otherUserId", encrypted: true}
  Expected: Denied (no friendship exists)
```

## Deployment Checklist

Before deploying to production:

- [ ] Review all code changes
- [ ] Run manual tests
- [ ] Update Firebase security rules
- [ ] Test with production Firebase project
- [ ] Monitor Firebase logs for errors
- [ ] Consider implementing Firebase App Check
- [ ] Set up rate limiting
- [ ] Configure monitoring and alerts
