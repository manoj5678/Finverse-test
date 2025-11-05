#!/bin/bash

echo "🎬 Finverse Bank Forest Admin - Pre-Demo Validation"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment
echo "1️⃣  Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set${NC}"
    exit 1
else
    echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
fi

if [ -z "$FOREST_ENV_SECRET" ]; then
    echo -e "${RED}❌ FOREST_ENV_SECRET not set${NC}"
    exit 1
else
    echo -e "${GREEN}✅ FOREST_ENV_SECRET configured${NC}"
fi

echo ""

# Check dependencies
echo "2️⃣  Checking dependencies..."
npm list @forestadmin/agent @forestadmin/datasource-sequelize sequelize pg > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All required packages installed${NC}"
else
    echo -e "${RED}❌ Missing dependencies${NC}"
    exit 1
fi

echo ""

# Validate syntax
echo "3️⃣  Validating Forest Admin agent syntax..."
node --check index-phase789-integrated.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Agent syntax valid${NC}"
else
    echo -e "${RED}❌ Syntax errors detected${NC}"
    exit 1
fi

echo ""

# Test database connection
echo "4️⃣  Testing database connection..."
npm run test:db > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

echo ""

# Run demo validation
echo "5️⃣  Running demo validation tests..."
npm run test:demo
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Demo data validated${NC}"
else
    echo -e "${YELLOW}⚠️  Demo validation warnings (check output above)${NC}"
fi

echo ""

# Performance check
echo "6️⃣  Running performance tests..."
npm run test:performance > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Performance acceptable${NC}"
else
    echo -e "${YELLOW}⚠️  Performance issues detected${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Pre-Demo Validation Complete!${NC}"
echo ""
echo "Ready to start demo. Run:"
echo "  npm start"
echo ""
echo "Then access Forest Admin at:"
echo "  https://app.forestadmin.com"
echo ""