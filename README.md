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
