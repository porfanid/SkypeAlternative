# Running Documentation Locally

This directory contains the Jekyll-based documentation for SkypeAlternative.

## Prerequisites

- Ruby 2.7 or higher
- Bundler gem

## Quick Start

### 1. Install Dependencies

```bash
npm run docs:install
```

This will:
- Install Bundler if not already installed
- Install all Ruby gems required for Jekyll

### 2. Run Documentation Server

```bash
npm run docs
```

This will:
- Start a local Jekyll server at http://localhost:4000
- Auto-reload when you make changes to documentation files
- Display the site exactly as it will appear on GitHub Pages

### 3. Stop the Server

Press `Ctrl+C` in the terminal to stop the Jekyll server.

## Alternative: Manual Commands

If you prefer to run commands manually:

```bash
# Install dependencies
cd docs
bundle install

# Run the server
bundle exec jekyll serve --livereload

# Or run with incremental builds (faster)
bundle exec jekyll serve --livereload --incremental
```

## Troubleshooting

### Ruby Not Installed

If you don't have Ruby installed:

**macOS:**
```bash
brew install ruby
```

**Ubuntu/Debian:**
```bash
sudo apt-get install ruby-full
```

**Windows:**
Download from [rubyinstaller.org](https://rubyinstaller.org/)

### Bundler Not Installed

```bash
gem install bundler
```

### Port 4000 Already in Use

```bash
bundle exec jekyll serve --port 4001
```

### Permission Errors

On macOS/Linux, you may need to install gems to a user directory:

```bash
bundle install --path vendor/bundle
```

## Documentation Structure

```
docs/
├── Gemfile              # Ruby dependencies
├── _config.yml          # Jekyll configuration
├── index.md             # Landing page
├── README.md            # Main documentation index
└── *.md                 # Documentation pages
```

## Making Changes

1. Edit any `.md` file in the `docs/` directory
2. Save the file
3. The browser will automatically reload with your changes (if using `--livereload`)
4. Commit your changes when satisfied

## GitHub Pages

When you push changes to the `main` branch, GitHub Actions will automatically build and deploy the documentation to:

https://porfanid.github.io/SkypeAlternative/

The local preview should match the live site exactly.
