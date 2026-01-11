# Running Documentation Locally

This directory contains the Jekyll-based documentation for SkypeAlternative.

## Prerequisites

- **Ruby 2.7 or higher** - [Installation instructions](#ruby-not-installed)
- **Bundler gem** - Install with `gem install bundler`

## Quick Start

### 1. Install Dependencies

```bash
npm run docs:install
```

This will:
- Configure bundler to install gems to `docs/vendor/bundle` (no sudo required)
- Install all Ruby gems required for Jekyll, including the `github-pages` gem that matches GitHub Pages' environment exactly

**Note**: Gems are installed locally in the `docs/vendor/bundle` directory to avoid permission issues. This directory is already excluded via `.gitignore`.

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
# Install dependencies (configure bundler first to avoid permission issues)
cd docs
bundle config set --local path 'vendor/bundle'
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
sudo apt-get install ruby-full build-essential
```

**Windows:**
Download and install from [rubyinstaller.org](https://rubyinstaller.org/)
- Choose Ruby+Devkit version
- During installation, select "Add Ruby executables to your PATH"

### Bundler Not Installed

After installing Ruby, install Bundler:

```bash
gem install bundler
```

### Dependency Conflicts

If you see dependency conflict errors, try:

```bash
cd docs
rm Gemfile.lock
bundle install
```

The Gemfile uses the `github-pages` gem which ensures all dependencies match GitHub Pages exactly.

### Port 4000 Already in Use

```bash
cd docs
bundle exec jekyll serve --port 4001
```

Or use npm script:
```bash
npm run docs -- --port 4001
```

### Permission Errors

The npm script `npm run docs:install` automatically configures bundler to install gems locally in `docs/vendor/bundle`, which should prevent permission errors.

If you still encounter permission issues when running commands manually, ensure bundler is configured correctly:

```bash
cd docs
bundle config set --local path 'vendor/bundle'
bundle install
```

**Alternative solutions:**

1. **Use a Ruby version manager** (recommended for development):
   - [rbenv](https://github.com/rbenv/rbenv) - macOS/Linux
   - [RVM](https://rvm.io/) - macOS/Linux  
   - [uru](https://bitbucket.org/jonforums/uru) - Windows

2. **Install Ruby to user directory** (if using system Ruby):
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export GEM_HOME="$HOME/.gem"
   export PATH="$HOME/.gem/bin:$PATH"
   ```

**DO NOT use `sudo bundle install`** - this can cause ownership and permission issues.

### Command Not Found: bundle

Make sure Ruby's bin directory is in your PATH:

**macOS/Linux:**
```bash
echo 'export PATH="$HOME/.gem/ruby/X.X.0/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```
Replace `X.X.0` with your Ruby version.

**Windows:**
The RubyInstaller should add Ruby to PATH automatically. If not, add `C:\Ruby32-x64\bin` to your system PATH.

## Documentation Structure

```
docs/
├── Gemfile              # Ruby dependencies (github-pages gem)
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

The local preview uses the same `github-pages` gem as GitHub Actions, so it will match the live site exactly.
