#!/bin/bash

# ============================================================================
# FINVERSE FOREST ADMIN - GIT SETUP QUICKSTART SCRIPT
# ============================================================================
# Copy and paste this script to quickly set up your GitHub repository
# Usage: bash git_quickstart.sh
# ============================================================================

set -e  # Exit on error

echo "🚀 Starting Finverse Forest Admin Git Setup..."
echo ""

# ============================================================================
# STEP 1: CONFIGURE GIT
# ============================================================================
echo "📝 Step 1: Configuring Git..."
read -p "Enter your Git username: " GIT_USERNAME
read -p "Enter your Git email: " GIT_EMAIL

git config user.name "$GIT_USERNAME"
git config user.email "$GIT_EMAIL"
echo "✅ Git configured"
echo ""

# ============================================================================
# STEP 2: INITIALIZE REPOSITORY
# ============================================================================
echo "📁 Step 2: Initializing repository..."

# Check if .git already exists
if [ -d ".git" ]; then
    echo "ℹ️  Git repository already initialized"
else
    git init
    echo "✅ Repository initialized"
fi
echo ""

# ============================================================================
# STEP 3: CREATE .gitignore
# ============================================================================
echo "🔒 Step 3: Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/

# IDE & OS
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Temp files
tmp/
temp/

# Forest Admin specific
.forestadmin
forest-admin-config.json
EOF
git add .gitignore
git commit -m "chore: add .gitignore file"
echo "✅ .gitignore created and committed"
echo ""

# ============================================================================
# STEP 4: CREATE .env.example
# ============================================================================
echo "⚙️  Step 4: Creating .env.example..."
cat > .env.example << 'EOF'
# Node Environment
NODE_ENV=development
PORT=3000

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
DATABASE_URL=postgresql://user:password@host:port/dbname

# Forest Admin
FOREST_ADMIN_SECRET=your-forest-admin-secret
FOREST_ADMIN_URL=http://localhost:3000

# Core Banking API
CORE_BANKING_API_URL=https://api.finverse.com
CORE_BANKING_API_KEY=your-api-key

# AML Integration
AML_SERVICE_URL=https://aml-service.api.com
AML_SERVICE_KEY=your-aml-key

# Logging
LOG_LEVEL=debug

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h
EOF
git add .env.example
git commit -m "docs: add environment variables template"
echo "✅ .env.example created"
echo ""

# ============================================================================
# STEP 5: CREATE README.md
# ============================================================================
echo "📖 Step 5: Creating README.md..."
cat > README.md << 'EOF'
# Finverse Bank - Forest Admin Operations Platform

**Proof of Concept for unified internal operations management**

## Overview
Forest Admin integration for KYC/KYB onboarding, AML monitoring, and customer support workflows.

## Tech Stack
- **Backend:** Node.js with Express
- **Database:** Supabase (PostgreSQL)
- **ORM:** Sequelize
- **Hosting:** Heroku
- **Admin Interface:** Forest Admin

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account
- Forest Admin account

### Local Development
```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate
npm run dev
```

Access Forest Admin at `http://localhost:3000`

## Features
- ✅ Full KYC/KYB onboarding workflow
- ✅ AML monitoring and alert triage
- ✅ Role-based access control
- ✅ Smart Actions for workflow automation
- ✅ Real-time data sync with Core Banking API

## Documentation
See `docs/` folder for detailed guides:
- ARCHITECTURE.md
- FOREST_ADMIN_SETUP.md
- SECURITY.md
- AML_WORKFLOW.md
- KYC_WORKFLOW.md

## Deployment
```bash
heroku create finverse-forest-admin
git push heroku main
heroku run npm run migrate
```

## Contributing
1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit with descriptive messages
3. Create Pull Request

## License
Internal Use Only - Finverse Bank
EOF
git add README.md
git commit -m "docs: add project README"
echo "✅ README.md created"
echo ""

# ============================================================================
# STEP 6: CONNECT TO GITHUB
# ============================================================================
echo "🌐 Step 6: Connecting to GitHub..."
read -p "Enter your GitHub repository URL (https://github.com/...): " GITHUB_URL

# Rename branch to main
git branch -M main

# Add GitHub remote
git remote add origin "$GITHUB_URL" 2>/dev/null || git remote set-url origin "$GITHUB_URL"

# Verify remote
echo "ℹ️  Remote configuration:"
git remote -v
echo ""

# ============================================================================
# STEP 7: INITIAL PUSH
# ============================================================================
echo "📤 Step 7: Pushing to GitHub..."
read -p "Ready to push to GitHub? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main
    echo "✅ Successfully pushed to GitHub!"
else
    echo "⏭️  Skipped GitHub push. Run manually: git push -u origin main"
fi
echo ""

# ============================================================================
# STEP 8: DISPLAY SUMMARY
# ============================================================================
echo "============================================================================"
echo "✅ GIT SETUP COMPLETE!"
echo "============================================================================"
echo ""
echo "📋 Next Steps:"
echo "1. Add your project files to src/ folder"
echo "2. Create feature branches: git checkout -b feature/your-feature"
echo "3. Commit regularly with descriptive messages"
echo "4. Push and create Pull Requests"
echo ""
echo "📚 Useful Commands:"
echo "   git status              - See current status"
echo "   git log --oneline -10   - View last 10 commits"
echo "   git diff                - See what changed"
echo "   git branch -a           - View all branches"
echo ""
echo "🔗 Repository: $GITHUB_URL"
echo ""
echo "Happy coding! 🚀"