# Troubleshooting Guide

This guide covers common issues and their solutions when developing or running SkypeAlternative.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Linux-Specific Issues](#linux-specific-issues)
- [macOS-Specific Issues](#macos-specific-issues)
- [Windows-Specific Issues](#windows-specific-issues)
- [Firebase Issues](#firebase-issues)
- [WebRTC/Call Issues](#webrtccall-issues)
- [Performance Issues](#performance-issues)

## Installation Issues

### `npm install` fails

**Problem**: Dependencies fail to install.

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete existing modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Native module compilation errors

**Problem**: `node-gyp` or native modules fail to build.

**Solutions**:

**Linux**:
```bash
# Install build tools
sudo apt-get install build-essential python3

# Rebuild native modules
npm rebuild
```

**macOS**:
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Rebuild
npm rebuild
```

**Windows**:
```bash
# Install build tools
npm install --global windows-build-tools

# Rebuild
npm rebuild
```

## Build Issues

### TypeScript compilation errors

**Problem**: `tsc` reports type errors.

**Solutions**:
```bash
# Clean TypeScript cache
rm -rf dist dist-electron

# Run type check
npm run type-check

# If using VS Code, reload window
# Ctrl+Shift+P → "Reload Window"
```

### Vite build fails

**Problem**: `npm run build` fails.

**Solutions**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear dist
rm -rf dist

# Rebuild
npm run build
```

### Electron builder fails

**Problem**: `electron-builder` fails to create packages.

**Solutions**:
```bash
# Install platform-specific dependencies

# Linux
sudo apt-get install fakeroot dpkg

# macOS (requires signing certificates for distribution)
# Use --mac --dir for unsigned builds
npm run electron:build:mac -- --dir

# Windows
# Ensure .NET Framework 4.5+ is installed
```

## Runtime Errors

### "Module not found" errors

**Problem**: Import statements fail at runtime.

**Solutions**:
1. Check path aliases in `tsconfig.json`
2. Verify file exists at import path
3. Rebuild the project: `npm run build`
4. Clear cache: `rm -rf node_modules/.vite dist`

### Firebase initialization errors

**Problem**: "Firebase not initialized" or "Invalid API key".

**Solutions**:
1. Check `.env` file exists: `ls -la .env`
2. Verify all Firebase variables are set
3. Check for typos in variable names (must start with `VITE_`)
4. Restart dev server after changing `.env`

### "User not authenticated" errors

**Problem**: Actions fail with authentication errors.

**Solutions**:
1. Clear browser storage (localStorage, IndexedDB)
2. Log out and log in again
3. Check if mnemonic phrase is correct
4. Verify private key is stored properly

## Linux-Specific Issues

### IBUS warnings

**Problem**: Console shows IBUS connection warnings.

```
(electron:12345): IBUS-WARNING **: Unable to connect to ibus
```

**Solution**: These are harmless warnings. They're now suppressed in the code, but if still visible:

```bash
# Add to ~/.bashrc or ~/.zshrc
export IBUS_DISABLE_SNOOPER=1

# Or run app with:
IBUS_DISABLE_SNOOPER=1 npm run electron:dev
```

### GPU/OpenGL errors

**Problem**: GetVSyncParametersIfAvailable() errors in console.

```
ERROR:gl_surface_presentation_helper.cc(260)] GetVSyncParametersIfAvailable() failed
```

**Solution**: These warnings are now suppressed by disabling hardware acceleration on Linux. If issues persist:

```bash
# Run with software rendering
npm run electron:dev -- --disable-gpu

# Or disable hardware acceleration permanently
# (already done in electron/main.ts)
```

### Snap/Flatpak sandbox issues

**Problem**: App can't access camera/microphone in Snap/Flatpak.

**Solution**:
```bash
# Grant camera permission (Snap)
snap connect skype-alternative:camera

# Grant audio permission (Snap)
snap connect skype-alternative:audio-record

# Or use AppImage instead
./SkypeAlternative-*.AppImage
```

### libappindicator missing

**Problem**: System tray doesn't work.

**Solution**:
```bash
# Ubuntu/Debian
sudo apt-get install libappindicator3-1

# Fedora
sudo dnf install libappindicator-gtk3

# Arch
sudo pacman -S libappindicator-gtk3
```

## macOS-Specific Issues

### Camera/microphone permission denied

**Problem**: Can't access camera/microphone.

**Solution**:
1. Open System Preferences → Security & Privacy → Privacy
2. Select "Camera" and check SkypeAlternative
3. Select "Microphone" and check SkypeAlternative
4. Restart the app

### Notarization warnings

**Problem**: "App is from an unidentified developer".

**Solution**:
```bash
# For development builds
xattr -cr /Applications/SkypeAlternative.app

# Or right-click → Open → Open anyway
```

### App doesn't appear in Dock

**Problem**: App runs but no Dock icon.

**Solution**: Check `electron-builder` configuration includes:
```json
{
  "mac": {
    "icon": "build/icon.icns",
    "category": "public.app-category.social-networking"
  }
}
```

## Windows-Specific Issues

### Antivirus blocking

**Problem**: Windows Defender blocks the app.

**Solution**:
1. Add exception in Windows Security
2. Settings → Windows Security → Virus & threat protection
3. Manage settings → Add exclusion → Folder
4. Select SkypeAlternative directory

### DLL missing errors

**Problem**: "VCRUNTIME140.dll not found".

**Solution**:
```
Download and install:
Visual C++ Redistributable (x64)
https://aka.ms/vs/17/release/vc_redist.x64.exe
```

### Camera not detected

**Problem**: Can't find camera in Windows.

**Solution**:
1. Check camera privacy settings
2. Settings → Privacy → Camera
3. Allow desktop apps to access camera
4. Restart the app

## Firebase Issues

### "Permission denied" errors

**Problem**: Firestore operations fail with permission errors.

**Solutions**:
1. Check Firebase security rules are correctly configured
2. Verify user is authenticated
3. Check user has access to the document/collection
4. Test with open rules temporarily (not in production!)

```javascript
// Test rules (DEVELOPMENT ONLY)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### "Quota exceeded" errors

**Problem**: Hit Firebase free tier limits.

**Solutions**:
1. Check usage in Firebase Console
2. Reduce read/write frequency
3. Use caching more aggressively
4. Upgrade to Blaze plan if needed

### Connection timeout

**Problem**: Firebase operations time out.

**Solutions**:
```bash
# Check internet connection
ping firebase.google.com

# Check if Firebase is down
https://status.firebase.google.com/

# Clear browser cache
# Or restart app
```

## WebRTC/Call Issues

### Camera/microphone not working

**Problem**: Can't access media devices for calls.

**Solutions**:
1. Grant browser/app permissions
2. Check device is not used by another app
3. Test in browser: `getUserMedia` tester
4. Check device list:
```javascript
navigator.mediaDevices.enumerateDevices()
  .then(devices => console.log(devices));
```

### Calls fail to connect

**Problem**: Video/audio call doesn't establish.

**Solutions**:
1. Check firewall allows WebRTC ports
2. Verify STUN/TURN servers are accessible
3. Check both parties have internet
4. Try with firewall disabled (temporarily)
5. Check console for errors

### One-way audio/video

**Problem**: Can hear/see peer but they can't hear/see you.

**Solutions**:
1. Check microphone/camera permissions
2. Verify correct device selected
3. Check mute buttons aren't pressed
4. Test device independently
5. Check NAT/firewall configuration

### Poor call quality

**Problem**: Choppy audio/video, lag.

**Solutions**:
1. Check internet bandwidth (5+ Mbps recommended)
2. Close other applications using bandwidth
3. Switch to audio-only mode
4. Move closer to WiFi router
5. Use wired connection instead of WiFi

## Performance Issues

### High CPU usage

**Problem**: App uses too much CPU.

**Solutions**:
```bash
# Check if hardware acceleration is working
# (shouldn't be disabled unless on Linux with issues)

# Close DevTools if open
# Limit concurrent operations
# Check for memory leaks in console
```

### High memory usage

**Problem**: App uses excessive RAM.

**Solutions**:
1. Clear message cache periodically
2. Limit loaded message history
3. Close unused chats
4. Restart app periodically
5. Check for memory leaks (DevTools Memory profiler)

### Slow startup

**Problem**: App takes long to start.

**Solutions**:
1. Clear cache: `rm -rf ~/.config/SkypeAlternative/Cache`
2. Reduce startup operations
3. Check disk I/O (SSD recommended)
4. Disable unnecessary services

### UI lag/freezing

**Problem**: Interface becomes unresponsive.

**Solutions**:
1. Check console for errors
2. Disable hardware acceleration
3. Reduce message history loaded
4. Close DevTools
5. Restart app

## Development Issues

### Pre-commit hooks fail

**Problem**: Git commit is blocked by hooks.

**Solutions**:
```bash
# Run tests manually
npm test

# Run type check
npm run type-check

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# If hooks are broken, reinstall
npm run prepare
```

### Hot reload not working

**Problem**: Changes don't reflect in running app.

**Solutions**:
1. Check Vite dev server is running
2. Hard refresh browser (Ctrl+Shift+R)
3. Restart dev server
4. Check for syntax errors in console
5. Clear Vite cache: `rm -rf node_modules/.vite`

### Tests fail locally but pass in CI

**Problem**: Tests work on CI but fail locally.

**Solutions**:
```bash
# Match Node version with CI
nvm install 20
nvm use 20

# Clear test cache
npm test -- --clearCache

# Run in same environment
docker run -it node:20 /bin/bash
# Then run tests inside container
```

## Getting Help

If your issue isn't covered here:

1. **Check logs**:
   - Electron: DevTools Console (Ctrl+Shift+I)
   - Terminal: Where you ran `npm run electron:dev`
   - System logs: Check system console/event viewer

2. **Search issues**: [GitHub Issues](https://github.com/porfanid/SkypeAlternative/issues)

3. **Ask for help**: 
   - [GitHub Discussions](https://github.com/porfanid/SkypeAlternative/discussions)
   - Include:
     - OS and version
     - Node version (`node --version`)
     - Error messages (full text)
     - Steps to reproduce
     - What you've already tried

4. **Report bugs**: [Open an issue](https://github.com/porfanid/SkypeAlternative/issues/new)
   - Use bug report template
   - Include reproduction steps
   - Attach logs if possible
   - Sanitize any sensitive data

## Useful Commands

```bash
# Complete reset
rm -rf node_modules package-lock.json dist dist-electron
npm install
npm run build

# Clear all caches
rm -rf node_modules/.vite
rm -rf ~/.config/SkypeAlternative/Cache
npm cache clean --force

# Debug mode
DEBUG=* npm run electron:dev

# Verbose logging
npm run electron:dev -- --verbose

# Run without cache
npm run electron:dev -- --no-cache

# Check for updates
npm outdated

# Update dependencies
npm update

# Audit security
npm audit
npm audit fix
```

## Environment Variables

Useful environment variables for debugging:

```bash
# Electron debugging
export ELECTRON_ENABLE_LOGGING=1
export ELECTRON_DEBUG=1

# Disable GPU (if issues)
export ELECTRON_DISABLE_GPU=1

# Node debugging
export NODE_ENV=development
export DEBUG=*

# Suppress warnings
export ELECTRON_DISABLE_SECURITY_WARNINGS=true
export IBUS_DISABLE_SNOOPER=1
```

---

**Last Updated**: January 2026  
**Version**: 1.0.0

For more help, see:
- [Getting Started Guide](GETTING_STARTED.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
