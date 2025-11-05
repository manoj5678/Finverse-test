const { Sequelize, DataTypes } = require('sequelize');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: '.env.test' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false
});

// Define models matching YOUR ACTUAL SCHEMA
const Customer = sequelize.define('customers', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  type: { type: DataTypes.STRING, allowNull: false }, // 'individual' or 'business'
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  business_name: DataTypes.STRING, // Note: NOT company_name
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { timestamps: false, tableName: 'customers' });

const Application = sequelize.define('applications', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  customer_id: DataTypes.UUID,
  status: DataTypes.STRING, // 'submitted', 'in_review', 'approved', 'rejected', 'more_info'
  risk_score: DataTypes.INTEGER,
  kyc_level: DataTypes.STRING, // 'basic', 'standard', 'enhanced'
  sanctions_hits: DataTypes.INTEGER,
  submitted_at: DataTypes.DATE,
  reviewer: DataTypes.STRING, // Note: NOT reviewed_by
  notes: DataTypes.TEXT // Note: NOT rejection_reason
}, { timestamps: false, tableName: 'applications' });

const Alert = sequelize.define('alerts', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  type: DataTypes.STRING, // Note: type not alert_type
  severity: DataTypes.STRING, // 'low', 'medium', 'high', 'critical'
  status: DataTypes.STRING, // 'open', 'triaged', 'escalated', 'dismissed'
  customer_id: DataTypes.UUID,
  account_id: DataTypes.UUID,
  triggered_at: DataTypes.DATE,
  details: DataTypes.JSONB
}, { timestamps: false, tableName: 'alerts' });

const Case = sequelize.define('cases', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  title: DataTypes.STRING,
  status: DataTypes.STRING, // 'open', 'in_review', 'closed'
  owner: DataTypes.STRING,
  priority: DataTypes.STRING, // 'p1', 'p2', 'p3' (lowercase!)
  created_at: DataTypes.DATE
}, { timestamps: false, tableName: 'cases' });

const Account = sequelize.define('accounts', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  customer_id: DataTypes.UUID,
  iban: DataTypes.STRING, // Note: iban not account_number
  currency: DataTypes.STRING,
  status: DataTypes.STRING, // 'active', 'frozen', 'closed'
  balance_cents: DataTypes.BIGINT // Note: balance_cents not balance
}, { timestamps: false, tableName: 'accounts' });

const Transaction = sequelize.define('transactions', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  account_id: DataTypes.UUID,
  amount_cents: DataTypes.BIGINT, // Note: amount_cents not amount
  direction: DataTypes.STRING, // 'in' or 'out'
  counterparty: DataTypes.STRING,
  merchant_category: DataTypes.STRING,
  occurred_at: DataTypes.DATE // Note: occurred_at not transaction_date
}, { timestamps: false, tableName: 'transactions' });

const CaseLink = sequelize.define('case_links', {
  case_id: { 
    type: DataTypes.UUID,
    primaryKey: true  // Part of composite primary key
  },
  alert_id: { 
    type: DataTypes.UUID,
    primaryKey: true  // Part of composite primary key
  }
}, { 
  timestamps: false, 
  tableName: 'case_links',
  id: false, // CRITICAL: Tell Sequelize there is no 'id' column
  // This table uses composite primary key (case_id + alert_id)
  freezeTableName: true
});

async function seedTestData() {
  try {
    console.log('🌱 Starting test data seeding (Schema-Compatible)...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    const testData = {
      customers: [],
      applications: [],
      alerts: [],
      cases: [],
      accounts: [],
      transactions: []
    };

    // Seed 50 Customers (mix of individual and business)
    console.log('Creating customers...');
    for (let i = 0; i < 50; i++) {
      const type = i < 10 ? 'individual' : 'business'; // 10 individual, 40 business
      
      const customer = await Customer.create({
        type: type,
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        first_name: type === 'individual' ? faker.person.firstName() : null,
        last_name: type === 'individual' ? faker.person.lastName() : null,
        business_name: type === 'business' ? faker.company.name() : null,
        created_at: faker.date.past({ years: 2 }),
        updated_at: faker.date.recent({ days: 30 })
      });
      testData.customers.push(customer);
    }
    console.log(`✅ Created ${testData.customers.length} customers\n`);

    // Seed Applications with DIVERSE statuses
    console.log('Creating applications...');
    const applicationConfigs = [
      { status: 'submitted', count: 15 },
      { status: 'in_review', count: 12 }, // Important for tests!
      { status: 'more_info', count: 8 },  // Important for tests!
      { status: 'approved', count: 10 },
      { status: 'rejected', count: 5 }    // Important for tests!
    ];

    for (const config of applicationConfigs) {
      for (let i = 0; i < config.count; i++) {
        const customer = faker.helpers.arrayElement(testData.customers);
        const daysAgo = faker.number.int({ min: 0, max: 60 });
        const submittedAt = new Date();
        submittedAt.setDate(submittedAt.getDate() - daysAgo);

        const application = await Application.create({
          customer_id: customer.id,
          status: config.status,
          risk_score: faker.number.int({ min: 0, max: 100 }),
          kyc_level: faker.helpers.arrayElement(['basic', 'standard', 'enhanced']),
          sanctions_hits: faker.number.int({ min: 0, max: 3 }),
          submitted_at: submittedAt,
          reviewer: ['approved', 'rejected'].includes(config.status) ? faker.person.fullName() : null,
          notes: config.status === 'rejected' ? faker.lorem.sentence() : null
        });
        testData.applications.push(application);
      }
    }
    console.log(`✅ Created ${testData.applications.length} applications\n`);

    // Seed Alerts (using correct status values)
    console.log('Creating AML alerts...');
    const alertConfigs = [
      { severity: 'critical', status: 'open', count: 8 },
      { severity: 'high', status: 'open', count: 12 },
      { severity: 'medium', status: 'open', count: 15 },
      { severity: 'low', status: 'open', count: 10 },
      { severity: 'high', status: 'triaged', count: 10 },
      { severity: 'medium', status: 'dismissed', count: 10 }
    ];

    for (const config of alertConfigs) {
      for (let i = 0; i < config.count; i++) {
        const customer = faker.helpers.arrayElement(testData.customers);
        const hoursAgo = faker.number.int({ min: 1, max: 72 });
        const triggeredAt = new Date();
        triggeredAt.setHours(triggeredAt.getHours() - hoursAgo);

        const alert = await Alert.create({
          type: faker.helpers.arrayElement([
            'unusual_transaction_pattern',
            'high_risk_jurisdiction',
            'sanctioned_entity_match',
            'large_cash_transaction',
            'velocity_check_failed'
          ]),
          severity: config.severity,
          status: config.status,
          customer_id: customer.id,
          account_id: null, // Will be set if needed
          triggered_at: triggeredAt,
          details: JSON.stringify({
            description: faker.lorem.sentence(),
            amount: faker.number.int({ min: 1000, max: 100000 })
          })
        });
        testData.alerts.push(alert);
      }
    }
    console.log(`✅ Created ${testData.alerts.length} alerts\n`);

    // Seed Cases (using correct status values)
    console.log('Creating compliance cases...');
    const criticalAlerts = testData.alerts.filter(a => a.severity === 'critical' && a.status === 'open');
    
    for (let i = 0; i < Math.min(criticalAlerts.length, 10); i++) {
      const alert = criticalAlerts[i];
      
      const caseRecord = await Case.create({
        title: `Investigation: ${alert.type}`,
        status: faker.helpers.arrayElement(['open', 'in_review', 'closed']),
        owner: faker.person.fullName(),
        priority: faker.helpers.arrayElement(['p1', 'p2', 'p3']), // lowercase!
        created_at: alert.triggered_at
      });
      testData.cases.push(caseRecord);
      
      // Try to link case to alert (skip if it fails - not critical)
      try {
        await CaseLink.create({
          case_id: caseRecord.id,
          alert_id: alert.id
        });
      } catch (linkError) {
        console.log(`   ⚠️  Skipping case link (table structure incompatible)`);
      }
    }
    console.log(`✅ Created ${testData.cases.length} cases\n`);

    // Seed Accounts (for approved customers)
    console.log('Creating accounts...');
    const approvedApplications = testData.applications.filter(a => a.status === 'approved');
    
    for (const app of approvedApplications.slice(0, 15)) {
      const customer = testData.customers.find(c => c.id === app.customer_id);
      
      const account = await Account.create({
        customer_id: customer.id,
        iban: `GB${faker.string.numeric(2)}${faker.string.alpha({ length: 4 }).toUpperCase()}${faker.string.numeric(14)}`,
        currency: faker.helpers.arrayElement(['EUR', 'GBP', 'USD']),
        status: 'active',
        balance_cents: faker.number.int({ min: 100000, max: 50000000 }) // cents (100000 = 1000 EUR)
      });
      testData.accounts.push(account);
    }
    console.log(`✅ Created ${testData.accounts.length} accounts\n`);

    // Seed Transactions
    console.log('Creating transactions...');
    for (const account of testData.accounts) {
      const txCount = faker.number.int({ min: 5, max: 20 });
      
      for (let i = 0; i < txCount; i++) {
        const occurredAt = faker.date.recent({ days: 30 });
        
        await Transaction.create({
          account_id: account.id,
          amount_cents: faker.number.int({ min: 1000, max: 5000000 }), // in cents
          direction: faker.helpers.arrayElement(['in', 'out']),
          counterparty: faker.company.name(),
          merchant_category: faker.helpers.arrayElement([
            'groceries', 'restaurants', 'transport', 'utilities', 'entertainment', 'healthcare'
          ]),
          occurred_at: occurredAt
        });
      }
    }
    
    const txCount = await Transaction.count();
    console.log(`✅ Created ${txCount} transactions\n`);

    // Summary
    console.log('📊 Test Data Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Customers:     ${testData.customers.length}`);
    console.log(`  - Individual:  ${testData.customers.filter(c => c.type === 'individual').length}`);
    console.log(`  - Business:    ${testData.customers.filter(c => c.type === 'business').length}`);
    console.log(`Applications:  ${testData.applications.length}`);
    console.log(`  - Submitted:   ${testData.applications.filter(a => a.status === 'submitted').length}`);
    console.log(`  - In Review:   ${testData.applications.filter(a => a.status === 'in_review').length}`);
    console.log(`  - More Info:   ${testData.applications.filter(a => a.status === 'more_info').length}`);
    console.log(`  - Approved:    ${testData.applications.filter(a => a.status === 'approved').length}`);
    console.log(`  - Rejected:    ${testData.applications.filter(a => a.status === 'rejected').length}`);
    console.log(`Alerts:        ${testData.alerts.length}`);
    console.log(`  - Critical:    ${testData.alerts.filter(a => a.severity === 'critical').length}`);
    console.log(`  - High:        ${testData.alerts.filter(a => a.severity === 'high').length}`);
    console.log(`  - Open:        ${testData.alerts.filter(a => a.status === 'open').length}`);
    console.log(`Cases:         ${testData.cases.length}`);
    console.log(`Accounts:      ${testData.accounts.length}`);
    console.log(`Transactions:  ${txCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('✅ Test data seeding complete!\n');
    console.log('💡 Note: This seeder is compatible with your actual database schema');
    console.log('   - Using business_name (not company_name)');
    console.log('   - Using balance_cents (not balance)');
    console.log('   - Using correct status values for alerts/cases');
    console.log('   - Applications now have all status types for testing\n');
    
    await sequelize.close();
    return testData;
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

if (require.main === module) {
  seedTestData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedTestData };