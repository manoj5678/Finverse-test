const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.test' });

describe('Segment Query Tests', () => {
  let sequelize;

  beforeAll(() => {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Application Segments', () => {
    
    test('Pending >48 Hours segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM applications
        WHERE status IN ('submitted', 'in_review', 'more_info')
          AND submitted_at < NOW() - INTERVAL '48 hours'
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} applications pending >48 hours`);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('SLA At Risk (72h+) segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM applications
        WHERE status IN ('submitted', 'in_review', 'more_info')
          AND submitted_at < NOW() - INTERVAL '72 hours'
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} applications at SLA risk`);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Pending KYC Reviews (Inbox) segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM applications
        WHERE status IN ('submitted', 'in_review', 'more_info')
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} applications in KYC review inbox`);
      expect(count).toBeGreaterThan(0);
    });

    test('High Risk Applications segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM applications
        WHERE risk_score >= 70
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} high-risk applications`);
      expect(count).toBeGreaterThanOrEqual(0);
    });

  });

  describe('Alert Segments', () => {
    
    test('Requires Immediate Action segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM alerts
        WHERE status = 'open' AND severity = 'critical'
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} critical alerts requiring immediate action`);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('This Week\'s Alerts segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM alerts
        WHERE triggered_at >= NOW() - INTERVAL '7 days'
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} alerts from this week`);
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('Critical AML Alerts (Inbox) segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM alerts
        WHERE status = 'open' 
          AND severity IN ('critical', 'high')
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} critical/high AML alerts in inbox`);
      expect(count).toBeGreaterThan(0);
    });

  });

  describe('Case Segments', () => {
    
    test('Critical Priority segment', async () => {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM cases
        WHERE priority = 'P1' AND status != 'closed'
      `);
      
      const count = Number(result[0].count);
      console.log(`Found ${count} P1 priority cases`);
      expect(count).toBeGreaterThanOrEqual(0);
    });

  });

});