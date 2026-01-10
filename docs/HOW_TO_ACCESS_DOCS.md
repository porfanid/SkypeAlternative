# How to Access the Documentation

This guide shows you how to access the organized SkypeAlternative documentation.

## 📖 Documentation Location

All documentation is now centrally organized in the **`docs/`** folder.

### File Structure

```
docs/
├── README.md                          ✨ Main documentation index (start here!)
├── index.md                           🌐 GitHub Pages landing page
├── _config.yml                        ⚙️ Jekyll configuration
│
├── Getting Started
│   ├── GETTING_STARTED.md            🚀 Complete setup guide
│   └── TROUBLESHOOTING.md            🔧 Common issues and solutions
│
├── Architecture & Design
│   ├── ARCHITECTURE.md               🏗️ System design deep dive
│   └── STRUCTURE.md                  📁 Project structure
│
├── Deployment
│   ├── FIREBASE_SETUP.md             🔥 Backend configuration
│   └── CLOUDFLARE_WORKER_DEPLOYMENT.md ☁️ Video infrastructure
│
├── Development
│   ├── COPILOT_INSTRUCTIONS.md       🤖 AI development guidelines (links to .github)
│   └── CONTRIBUTING.md               🤝 Contribution guidelines
│
└── Security
    └── SECURITY.md                   🔒 Security policy
```

## 🌐 Accessing Documentation

### Method 1: GitHub Pages (Recommended for reading)

Once the Pull Request is merged, the documentation will be available at:

**https://porfanid.github.io/SkypeAlternative/**

This provides a beautiful, browsable website with:
- Easy navigation
- Search functionality
- Responsive design
- Table of contents

### Method 2: GitHub Repository

Browse directly on GitHub:

1. Go to [https://github.com/porfanid/SkypeAlternative](https://github.com/porfanid/SkypeAlternative)
2. Navigate to the `docs/` folder
3. Click on any documentation file to read it

**Start here**: [docs/README.md](https://github.com/porfanid/SkypeAlternative/blob/main/docs/README.md)

### Method 3: Local Clone

If you have the repository cloned:

```bash
cd SkypeAlternative/docs
# Open README.md in your editor or browser
```

## 🎯 Where to Start?

### New to the Project?
1. **[docs/README.md](README.md)** - Documentation index
2. **[docs/GETTING_STARTED.md](GETTING_STARTED.md)** - Setup guide
3. **[docs/ARCHITECTURE.md](ARCHITECTURE.md)** - Understand the system

### Want to Contribute?
1. **[docs/CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
2. **[docs/COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md)** - Coding standards
3. **[docs/STRUCTURE.md](STRUCTURE.md)** - Codebase layout

### Setting up Backend?
1. **[docs/FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase configuration
2. **[docs/CLOUDFLARE_WORKER_DEPLOYMENT.md](CLOUDFLARE_WORKER_DEPLOYMENT.md)** - Video calls

### Experiencing Issues?
1. **[docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common problems
2. **[GitHub Issues](https://github.com/porfanid/SkypeAlternative/issues)** - Report bugs

## 📋 Main README

The project's main **[README.md](../README.md)** in the root directory now includes:
- Quick links to all documentation
- Clear organization by topic
- Direct links to the docs folder

## 🔒 Copilot Instructions

The GitHub Copilot instructions remain in their standard location:
- **Location**: `.github/copilot-instructions.md`
- **Why**: GitHub Copilot automatically reads from this location
- **Access**: [docs/COPILOT_INSTRUCTIONS.md](COPILOT_INSTRUCTIONS.md) provides a link and summary

## 🚀 GitHub Pages Setup

The documentation is configured to deploy automatically to GitHub Pages:

1. **Workflow**: `.github/workflows/docs.yml`
2. **Trigger**: Automatic on push to `main` branch (docs changes)
3. **Theme**: Jekyll Cayman theme
4. **Config**: `docs/_config.yml`

### Enabling GitHub Pages (for maintainers)

After merging this PR:
1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. The workflow will automatically deploy on the next push

## ✨ What Changed?

### Before
- Documentation scattered in root directory
- Hard to find specific guides
- No central index
- No GitHub Pages support

### After
- ✅ All documentation in `docs/` folder
- ✅ Comprehensive index (docs/README.md)
- ✅ GitHub Pages ready with Jekyll
- ✅ Automatic deployment workflow
- ✅ Clear organization by category
- ✅ Easy navigation structure

## 🎉 Benefits

1. **Easy Discovery** - All docs in one place
2. **Better Navigation** - Clear index and categories
3. **Professional Presentation** - GitHub Pages website
4. **Automatic Updates** - GitHub Actions deployment
5. **Improved Onboarding** - Clear path for new contributors

---

**Questions?** Open an issue or discussion on GitHub!
